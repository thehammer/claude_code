#!/usr/bin/env bash
# Helpers for the portal-open skill.
# Source this file: source ~/.claude/skills/portal-open/lib/portal-open.sh

set -uo pipefail

PORTAL_OPEN_OP_ACCOUNT="${PORTAL_OPEN_OP_ACCOUNT:-hammer-and-pepper.1password.com}"

# Map env key → base URL
portal_open_base_url() {
    local env="${1:-staging}"
    case "$env" in
        local)   echo "https://admin-portal.test" ;;
        staging) echo "https://dev.portal.carefeed.com" ;;
        demo)    echo "https://portal.demo.carefeed.com" ;;
        prod)    echo "https://portal.carefeed.com" ;;
        *)       echo "portal-open: unknown env '$env'" >&2; return 1 ;;
    esac
}

# Map env key → 1Password item title (Private vault, personal account)
portal_open_op_item() {
    local env="${1:-staging}"
    case "$env" in
        local)   echo "Carefeed - Local" ;;
        staging) echo "Carefeed - Staging" ;;
        demo)    echo "Carefeed - Demo" ;;
        prod)    echo "Carefeed - Production" ;;
        *)       echo "portal-open: unknown env '$env'" >&2; return 1 ;;
    esac
}

# Strip a single pair of surrounding double-quotes plus leading/trailing whitespace.
# Internal helper for cleaning op output.
_portal_open_strip() {
    local s="${1-}"
    # Strip leading whitespace before checking for surrounding quotes.
    s="${s#"${s%%[![:space:]]*}"}"
    s="${s%"${s##*[![:space:]]}"}"
    # Strip a single pair of surrounding double-quotes if present.
    if [[ "$s" == \"*\" && ${#s} -ge 2 ]]; then
        s="${s#\"}"
        s="${s%\"}"
    fi
    # Re-trim in case the inside-quote content itself had whitespace.
    s="${s#"${s%%[![:space:]]*}"}"
    s="${s%"${s##*[![:space:]]}"}"
    printf '%s' "$s"
}

# Pull credentials from 1Password.
# Outputs: "<username>\t<password>" on a single line. Both fields are trimmed
# of surrounding whitespace and double-quotes (defensive against op output
# variations and against credential entries stored with stray quoting).
# Production uses field name `passnew` instead of `password`; we fall back automatically.
portal_open_credentials() {
    local env="${1:-staging}"
    local item
    item="$(portal_open_op_item "$env")" || return 1

    local username password
    username="$(op item get "$item" \
        --account "$PORTAL_OPEN_OP_ACCOUNT" \
        --vault Private \
        --fields label=username \
        --reveal 2>/dev/null)" || return 1
    username="$(_portal_open_strip "$username")"

    # Try `password` first, then `passnew` (Production stores it under `passnew`).
    password="$(op item get "$item" \
        --account "$PORTAL_OPEN_OP_ACCOUNT" \
        --vault Private \
        --fields label=password \
        --reveal 2>/dev/null || true)"
    if [[ -z "$password" ]]; then
        password="$(op item get "$item" \
            --account "$PORTAL_OPEN_OP_ACCOUNT" \
            --vault Private \
            --fields label=passnew \
            --reveal 2>/dev/null || true)"
    fi
    password="$(_portal_open_strip "$password")"

    if [[ -z "$username" || -z "$password" ]]; then
        echo "portal-open: could not load credentials for $env (item: $item)" >&2
        return 1
    fi

    printf '%s\t%s\n' "$username" "$password"
}

# Resolve a shorthand path like "REF-1148/clinical" into a full path.
# Pass a normal path through unchanged.
portal_open_resolve_path() {
    local input="${1:-}"
    if [[ -z "$input" ]]; then
        echo "/" ; return 0
    fi

    # Already a path
    if [[ "$input" == /* ]]; then
        echo "$input" ; return 0
    fi

    # Shorthand: REF-N or REF-N/tab — portable parse (works in bash and zsh)
    local lower
    lower="$(printf '%s' "$input" | tr '[:upper:]' '[:lower:]')"
    case "$lower" in
        ref-*)
            local rest="${input#*-}"   # everything after first dash
            local id tab
            if [[ "$rest" == */* ]]; then
                id="${rest%%/*}"
                tab="${rest#*/}"
            else
                id="$rest"
                tab="clinical"
            fi
            # id must be all digits
            case "$id" in
                ''|*[!0-9]*) echo "portal-open: invalid referral id '$id'" >&2 ; return 1 ;;
            esac
            case "$tab" in
                clinical|demographics|medications|files|background|financial|messages|reconciliation|pipeline|lineage)
                    echo "/referrals/${id}/patient/${tab}" ; return 0 ;;
                *)
                    echo "portal-open: unknown referral tab '$tab'" >&2 ; return 1 ;;
            esac
            ;;
    esac

    # Unrecognized — assume relative path and prepend slash
    echo "/$input"
}

# Look up a referral's facility_id on staging via the staging-db skill.
# Only valid for staging env. Returns the facility_id on stdout, or empty on failure.
portal_open_referral_facility() {
    local ref_id="${1:-}"
    [[ -z "$ref_id" ]] && return 1

    if ! type staging_db_query >/dev/null 2>&1; then
        # Lazy-load staging-db library (skill is at ~/.claude/lib/services/_bash/staging-db.sh)
        local sdb_lib="$HOME/.claude/lib/services/_bash/staging-db.sh"
        if [[ -f "$sdb_lib" ]]; then
            # shellcheck disable=SC1090
            source "$sdb_lib"
        else
            echo "portal-open: staging-db helper not found at $sdb_lib" >&2
            return 1
        fi
    fi

    staging_db_query "SELECT facility_id FROM referrals WHERE id = ${ref_id}" 2>/dev/null \
        | tail -n1 | tr -d '[:space:]'
}

# Build the full target URL.
# Args: env path
#   echoes {base}{path}
# Note: facility switching is a SEPARATE navigation (see
# portal_open_switch_facility_url). The portal does not have a one-shot
# `/facility/{id}?redirect=...` endpoint — that returns "Page Not Available."
# The actual flow is: GET /users/facility/{id} (returns to /users/dashboard,
# session-facility flipped) → then navigate to the target.
portal_open_build_url() {
    local env="${1:-staging}"
    local path="${2:-/}"

    local base
    base="$(portal_open_base_url "$env")" || return 1

    # Ensure path starts with slash
    [[ "$path" != /* ]] && path="/$path"

    echo "${base}${path}"
}

# Build the facility-switch URL.
# Args: env facility_id
#   echoes {base}/users/facility/{id}
# The portal's session-facility-switch endpoint. GET this URL, wait for the
# response, then navigate to the desired path. The endpoint flips the session
# facility and (in the original AJAX flow) triggers location.reload() — when
# we navigate to it via webster, we land back on /users/dashboard with the
# new facility active.
portal_open_switch_facility_url() {
    local env="${1:-staging}"
    local facility_id="${2:-}"
    [[ -z "$facility_id" ]] && return 1

    local base
    base="$(portal_open_base_url "$env")" || return 1

    echo "${base}/users/facility/${facility_id}"
}
