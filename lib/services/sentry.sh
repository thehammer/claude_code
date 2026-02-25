#!/bin/bash
# Sentry Helper Functions
# Curl-based Sentry API client for Claude Code agents and skills.
#
# Required env vars (loaded via credentials.sh):
#   SENTRY_API_TOKEN
#
# Default org: carefeed (override with SENTRY_ORG)

SENTRY_BASE_URL="https://sentry.io/api/0"
SENTRY_DEFAULT_ORG="${SENTRY_ORG:-carefeed}"

# Core request helper
function sentry_request() {
    local method=${1:-GET} endpoint=$2
    shift 2
    if [ -z "$SENTRY_API_TOKEN" ]; then
        echo "Error: SENTRY_API_TOKEN not set" >&2
        return 1
    fi
    curl -s -X "$method" "${SENTRY_BASE_URL}${endpoint}" \
        -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "$@"
}

# Test connection
function sentry_validate() {
    local result=$(sentry_request GET "/" 2>&1)
    if echo "$result" | jq -e '.user' &>/dev/null; then
        echo "OK: $(echo "$result" | jq -r '.user.name // .user.email // "authenticated"')"
    else
        echo "Error: $(echo "$result" | jq -r '.detail // "connection failed"')" >&2
        return 1
    fi
}

# List projects for an organization
# Usage: sentry_list_projects [org]
function sentry_list_projects() {
    local org=${1:-$SENTRY_DEFAULT_ORG}
    sentry_request GET "/organizations/${org}/projects/"
}

# Format projects for readable output
function sentry_format_projects() {
    jq -r '.[] | "\(.slug)\t\(.platform // "-")\t\(.status)"'
}

# List issues for a project
# Usage: sentry_list_issues <project> [query] [org]
function sentry_list_issues() {
    local project=$1 query=${2:-"is:unresolved"} org=${3:-$SENTRY_DEFAULT_ORG}
    if [ -z "$project" ]; then
        echo "Usage: sentry_list_issues <project> [query] [org]" >&2
        return 1
    fi
    local encoded_query=$(echo -n "$query" | jq -sRr @uri)
    sentry_request GET "/projects/${org}/${project}/issues/?query=${encoded_query}"
}

# List production issues
# Usage: sentry_list_production_issues <project> [org]
function sentry_list_production_issues() {
    local project=$1 org=${2:-$SENTRY_DEFAULT_ORG}
    if [ -z "$project" ]; then
        echo "Usage: sentry_list_production_issues <project> [org]" >&2
        return 1
    fi
    sentry_list_issues "$project" "environment:production is:unresolved" "$org"
}

# Get issue details
# Usage: sentry_get_issue <issue_id> [org]
function sentry_get_issue() {
    local issue_id=$1 org=${2:-$SENTRY_DEFAULT_ORG}
    if [ -z "$issue_id" ]; then
        echo "Usage: sentry_get_issue <issue_id> [org]" >&2
        return 1
    fi
    sentry_request GET "/organizations/${org}/issues/${issue_id}/"
}

# Get events for an issue
# Usage: sentry_get_issue_events <issue_id>
function sentry_get_issue_events() {
    local issue_id=$1
    if [ -z "$issue_id" ]; then
        echo "Usage: sentry_get_issue_events <issue_id>" >&2
        return 1
    fi
    sentry_request GET "/issues/${issue_id}/events/"
}

# Get the latest event for an issue (most useful for debugging)
# Usage: sentry_get_latest_event <issue_id>
function sentry_get_latest_event() {
    local issue_id=$1
    if [ -z "$issue_id" ]; then
        echo "Usage: sentry_get_latest_event <issue_id>" >&2
        return 1
    fi
    sentry_request GET "/issues/${issue_id}/events/latest/"
}

# Search issues across organization
# Usage: sentry_search_issues <query> [org]
function sentry_search_issues() {
    local query=$1 org=${2:-$SENTRY_DEFAULT_ORG}
    if [ -z "$query" ]; then
        echo "Usage: sentry_search_issues <query> [org]" >&2
        return 1
    fi
    local encoded_query=$(echo -n "$query" | jq -sRr @uri)
    sentry_request GET "/organizations/${org}/issues/?query=${encoded_query}"
}

# Format issues for readable output
function sentry_format_issues() {
    jq -r '.[] | "\(.shortId)\t\(.title)\t\(.count) events\t\(.lastSeen)"'
}

# Get issue with stack trace summary
# Usage: sentry_get_stacktrace <issue_id>
function sentry_get_stacktrace() {
    local issue_id=$1
    if [ -z "$issue_id" ]; then
        echo "Usage: sentry_get_stacktrace <issue_id>" >&2
        return 1
    fi
    sentry_get_latest_event "$issue_id" | jq '{
        event_id: .eventID,
        title: .title,
        message: .message,
        timestamp: .dateCreated,
        tags: [.tags[] | {key: .key, value: .value}],
        exception: [.entries[] | select(.type == "exception") | .data.values[] | {
            type: .type,
            value: .value,
            frames: [.stacktrace.frames[-5:] | .[] | {
                filename: .filename,
                function: .function,
                lineno: .lineNo,
                context: .context
            }]
        }]
    }'
}
