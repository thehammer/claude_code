#!/usr/bin/env bash
# lib/fred/render-mailbox.sh — Sourceable; defines fred_render_mailbox.
#
# Usage:
#   source ~/.claude/lib/fred/render-mailbox.sh
#   fred_render_mailbox <previous_unread>
#
# Renders the mailbox pane to stdout (full clear+redraw).
# Falls back to stale cache if Graph API is unreachable; never crashes.

# Source dependencies (guard against re-sourcing)
if [[ -z "${FRED_FORMAT_LOADED:-}" ]]; then
  # shellcheck disable=SC1090
  source "$(dirname "${BASH_SOURCE[0]}")/format.sh"
  FRED_FORMAT_LOADED=1
fi

if [[ -z "${FRED_M365_LOADED:-}" ]]; then
  # shellcheck disable=SC1090
  source "$FRED_HOME/lib/services/m365.sh" 2>/dev/null || true
  FRED_M365_LOADED=1
fi

# ------------------------------------------------------------------------------
# graph_get_inbox_messages <count>
# Fetch top N inbox messages. Echoes JSON on success; returns non-zero on fail.
# ------------------------------------------------------------------------------
graph_get_inbox_messages() {
  local count="${1:-15}"
  local select="subject,from,receivedDateTime,isRead,meetingMessageType"
  graph_request get \
    "/me/mailFolders/inbox/messages?\$select=${select}&\$top=${count}&\$orderby=receivedDateTime%20desc" \
    2>/dev/null
}

# ------------------------------------------------------------------------------
# _fred_load_vips — emit lowercased VIP emails, one per line
# ------------------------------------------------------------------------------
_fred_load_vips() {
  local vips_file="$FRED_STATE/vips.txt"
  [[ -f "$vips_file" ]] || return 0
  grep -v '^\s*#' "$vips_file" | grep -v '^\s*$' | tr '[:upper:]' '[:lower:]'
}

# ------------------------------------------------------------------------------
# _fred_in_vips <email> <vips_blob>
# Returns 0 if email is in the blob.
# ------------------------------------------------------------------------------
_fred_in_vips() {
  local email
  email=$(echo "$1" | tr '[:upper:]' '[:lower:]')
  printf '%s' "$2" | grep -qxF "$email"
}

# ------------------------------------------------------------------------------
# fred_render_mailbox <previous_unread>
# Full clear+redraw of mailbox pane.
# ------------------------------------------------------------------------------
fred_render_mailbox() {
  local prev_unread="${1:-}"

  # Ensure state dir exists (first-run safety)
  mkdir -p "$FRED_STATE" 2>/dev/null || true

  local cols lines
  cols=$(fred_term_cols)
  lines=$(fred_term_lines)

  local cache="$FRED_STATE/.mailbox.cache.json"
  local stale=0
  local sync_time="?"

  # Attempt fresh fetch
  local json=""
  if json=$(graph_get_inbox_messages 15 2>/dev/null) \
     && [[ -n "$json" ]] \
     && echo "$json" | jq -e '.value' >/dev/null 2>&1; then
    echo "$json" > "$cache"
    sync_time=$(date '+%l:%M%p' | tr '[:upper:]' '[:lower:]' | sed 's/^ //')
  elif [[ -f "$cache" ]]; then
    json=$(cat "$cache")
    stale=1
    sync_time=$(date -r "$cache" '+%l:%M%p' 2>/dev/null \
      | tr '[:upper:]' '[:lower:]' | sed 's/^ //') || sync_time="?"
  else
    # No data at all — render minimal placeholder
    fred_clear_screen
    printf '%s%s%s\n' "${FRED_C_BOLD}" "$(fred_pick_greeting)" "${FRED_C_RESET}"
    printf '\n'
    printf '%s↻ syncing…%s\n' "${FRED_C_DIM}" "${FRED_C_RESET}"
    return 0
  fi

  # Load VIPs
  local vips_blob
  vips_blob=$(_fred_load_vips)

  # Unread count
  local unread_count
  unread_count=$(echo "$json" | jq '[.value[] | select(.isRead==false)] | length' 2>/dev/null) \
    || unread_count=0

  # New-message delta annotation
  local delta_str=""
  if [[ -n "$prev_unread" ]] && [[ "$prev_unread" =~ ^[0-9]+$ ]] \
     && [[ $unread_count -gt $prev_unread ]]; then
    local delta=$(( unread_count - prev_unread ))
    delta_str="  +${delta} since you stepped away"
  fi

  # Trolley glyph — appears for ~2s after an archive batch sentinel is touched
  local trolley_glyph=""
  if [[ $(fred_file_age "$FRED_STATE/trolley") -lt 2 ]]; then
    trolley_glyph=" ${FRED_G_TROLLEY}"
  fi

  # ── Clear screen ──
  fred_clear_screen

  # ── Header ──
  local greeting
  greeting=$(fred_pick_greeting)
  printf '%s%s%s%s%s%s\n' \
    "${FRED_C_BOLD}" "$greeting" "$trolley_glyph" "${FRED_C_RESET}" \
    "${FRED_C_DIM}" "$delta_str${FRED_C_RESET}"
  printf '\n'

  # Column layout
  # [bullet(1)] [sender(18)] [space(1)] [subject(…)] [space(1)] [time(6)]
  local bullet_col=1
  local sender_col=18
  local time_col=6
  local fixed=$(( bullet_col + 1 + sender_col + 1 + 1 + time_col ))
  local subject_col=$(( cols - fixed ))
  [[ $subject_col -lt 8 ]] && subject_col=8

  local max_msgs=$(( lines - 5 ))
  [[ $max_msgs -lt 3 ]] && max_msgs=3
  local msg_count=0

  # ── Message rows ──
  while IFS= read -r msg_json; do
    [[ $msg_count -ge $max_msgs ]] && break

    local is_read subject sender_name sender_email recv_time meeting_type
    is_read=$(echo "$msg_json"     | jq -r '.isRead // "true"')
    subject=$(echo "$msg_json"     | jq -r '.subject // "(no subject)"')
    sender_name=$(echo "$msg_json" | jq -r '.from.emailAddress.name // .from.emailAddress.address // "?"')
    sender_email=$(echo "$msg_json"| jq -r '.from.emailAddress.address // ""' | tr '[:upper:]' '[:lower:]')
    recv_time=$(echo "$msg_json"   | jq -r '.receivedDateTime // ""')
    meeting_type=$(echo "$msg_json"| jq -r '.meetingMessageType // ""')

    # Bullet
    local bullet
    if [[ "$is_read" == "false" ]]; then
      bullet="${FRED_C_BOLD}${FRED_C_ACCENT}${FRED_G_UNREAD}${FRED_C_RESET}"
    else
      bullet=" "
    fi

    # Subject prefix glyphs
    local prefix=""
    if [[ -n "$meeting_type" && "$meeting_type" != "null" ]]; then
      prefix="${FRED_G_CAL} "
    fi
    if _fred_in_vips "$sender_email" "$vips_blob"; then
      prefix="${FRED_G_STAR} ${prefix}"
    fi

    # Truncate fields
    local sender_t subject_t rel_time
    sender_t=$(fred_truncate "$sender_name" $sender_col)
    # Reserve prefix width from subject column (rough byte count)
    local prefix_len=${#prefix}
    local avail_subject=$(( subject_col - prefix_len ))
    [[ $avail_subject -lt 4 ]] && avail_subject=4
    subject_t="${prefix}$(fred_truncate "$subject" $avail_subject)"
    rel_time=$(fred_relative_time "$recv_time")

    # Dim read rows
    local dim_open="" dim_close=""
    if [[ "$is_read" == "true" ]]; then
      dim_open="${FRED_C_DIM}"
      dim_close="${FRED_C_RESET}"
    fi

    printf '%s%s %-*s %-*s %*s%s\n' \
      "$dim_open" \
      "$bullet" \
      "$sender_col" "$sender_t" \
      "$subject_col" "$subject_t" \
      "$time_col"   "$rel_time" \
      "$dim_close"

    msg_count=$(( msg_count + 1 ))
  done < <(echo "$json" | jq -c '.value[]?' 2>/dev/null)

  # Fill blank rows between messages and footer
  local header_rows=2
  local used=$(( header_rows + msg_count ))
  local fill=$(( lines - used - 1 ))
  local i
  for (( i=0; i<fill; i++ )); do printf '\n'; done

  # ── Footer ──
  if [[ $stale -eq 1 ]]; then
    printf '%s↻ syncing… (last good %s)%s\n' \
      "${FRED_C_DIM}" "$sync_time" "${FRED_C_RESET}"
  else
    printf '%s%d unread · last sync %s%s\n' \
      "${FRED_C_DIM}" "$unread_count" "$sync_time" "${FRED_C_RESET}"
  fi
}

export FRED_FORMAT_LOADED FRED_M365_LOADED
