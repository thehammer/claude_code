#!/bin/bash
# Slack Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

# Helper Functions - Slack
# ==============================================================================

# Get the appropriate Slack token
# Prefers user token (broader access) over bot token
function slack_get_token() {
    if [ -n "$SLACK_USER_TOKEN" ]; then
        echo "$SLACK_USER_TOKEN"
    elif [ -n "$SLACK_BOT_TOKEN" ]; then
        echo "$SLACK_BOT_TOKEN"
    else
        echo ""
    fi
}

# Test if Slack credentials are configured
function slack_is_configured() {
    local token=$(slack_get_token)
    if [ -z "$token" ]; then
        return 1
    fi
    return 0
}

# Test Slack API connection
# Usage: slack_whoami
function slack_whoami() {
    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)
    curl -s -X GET "https://slack.com/api/auth.test" \
        -H "Authorization: Bearer ${token}"
}

# List conversations (channels, DMs, etc.)
# Usage: slack_list_conversations [types] [limit]
# Types: public_channel,private_channel,mpim,im (comma-separated, default: public_channel)
# Limit: max results per page (default: 100)
function slack_list_conversations() {
    local types=${1:-"public_channel"}
    local limit=${2:-100}

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)
    curl -s -X GET "https://slack.com/api/conversations.list" \
        -H "Authorization: Bearer ${token}" \
        -d "types=${types}" \
        -d "limit=${limit}" \
        -d "exclude_archived=true"
}

# Get conversation history
# Usage: slack_get_history <channel_id> [limit] [oldest] [latest]
# channel_id: Required - Channel/DM ID
# limit: Number of messages (default: 100, max: 200)
# oldest: Unix timestamp - earliest message
# latest: Unix timestamp - latest message
function slack_get_history() {
    local channel_id=$1
    local limit=${2:-100}
    local oldest=$3
    local latest=$4

    if [ -z "$channel_id" ]; then
        echo "Usage: slack_get_history <channel_id> [limit] [oldest] [latest]"
        echo "Example: slack_get_history \"C1234567890\" 50"
        return 1
    fi

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)
    local params="channel=${channel_id}&limit=${limit}"
    [ -n "$oldest" ] && params="${params}&oldest=${oldest}"
    [ -n "$latest" ] && params="${params}&latest=${latest}"

    curl -s -X GET "https://slack.com/api/conversations.history?${params}" \
        -H "Authorization: Bearer ${token}"
}

# Search for messages
# Usage: slack_search_messages <query> [count] [page]
# query: Search query (supports 'in:channel_name', 'from:@user', etc.)
# count: Results per page (default: 20, max: 100)
# page: Page number (default: 1, max: 100)
function slack_search_messages() {
    local query=$1
    local count=${2:-20}
    local page=${3:-1}

    if [ -z "$query" ]; then
        echo "Usage: slack_search_messages <query> [count] [page]"
        echo "Example: slack_search_messages \"error in:#engineering\" 50"
        echo ""
        echo "Query modifiers:"
        echo "  in:channel_name  - Search in specific channel"
        echo "  from:@user       - Messages from specific user"
        echo "  after:YYYY-MM-DD - Messages after date"
        echo "  before:YYYY-MM-DD - Messages before date"
        return 1
    fi

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)
    # URL encode the query
    local encoded_query=$(echo -n "$query" | jq -sRr @uri)

    curl -s -X GET "https://slack.com/api/search.messages" \
        -H "Authorization: Bearer ${token}" \
        -d "query=${encoded_query}" \
        -d "count=${count}" \
        -d "page=${page}" \
        -d "highlight=true"
}

# Get user information
# Usage: slack_get_user_info <user_id>
function slack_get_user_info() {
    local user_id=$1

    if [ -z "$user_id" ]; then
        echo "Usage: slack_get_user_info <user_id>"
        echo "Example: slack_get_user_info U01234ABCDE"
        return 1
    fi

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)
    curl -s -X GET "https://slack.com/api/users.info" \
        -H "Authorization: Bearer ${token}" \
        -d "user=${user_id}"
}

# Find channel ID by name
# Usage: slack_find_channel <channel_name>
function slack_find_channel() {
    local channel_name=$1

    if [ -z "$channel_name" ]; then
        echo "Usage: slack_find_channel <channel_name>"
        echo "Example: slack_find_channel \"engineering\""
        return 1
    fi

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    # Remove # prefix if present
    channel_name=${channel_name#"#"}

    slack_list_conversations "public_channel,private_channel" 200 | jq -r \
        --arg name "$channel_name" \
        '.channels[] | select(.name == $name) | {id: .id, name: .name, is_private: .is_private, num_members: .num_members}'
}

# Get recent messages from a channel by name
# Usage: slack_get_channel_messages <channel_name> [limit]
function slack_get_channel_messages() {
    local channel_name=$1
    local limit=${2:-50}

    if [ -z "$channel_name" ]; then
        echo "Usage: slack_get_channel_messages <channel_name> [limit]"
        echo "Example: slack_get_channel_messages \"engineering\" 20"
        return 1
    fi

    # Get channel ID
    local channel_info=$(slack_find_channel "$channel_name")
    if [ -z "$channel_info" ] || [ "$channel_info" = "null" ]; then
        echo "Error: Channel not found or bot doesn't have access"
        return 1
    fi

    local channel_id=$(echo "$channel_info" | jq -r '.id')
    if [ -z "$channel_id" ] || [ "$channel_id" = "null" ]; then
        echo "Error: Could not extract channel ID"
        return 1
    fi

    slack_get_history "$channel_id" "$limit"
}

# ==============================================================================
# Auto-run on source
# ==============================================================================

# Only show status if explicitly requested or if CLAUDE_INTEGRATION_DEBUG is set
if [ "$1" = "--status" ] || [ "$CLAUDE_INTEGRATION_DEBUG" = "1" ]; then
    integration_status
fi

# Datadog search logs with automatic chunking for large time ranges
# Usage: datadog_search_logs_chunked <query> <from_time> <to_time> <chunk_minutes>
# Times can be: Unix timestamp (seconds), "now", "now-1d", or ISO date
# Chunk size defaults to 30 minutes
function datadog_search_logs_chunked() {
    local query=$1
    local from=$2
    local to=$3
    local chunk_minutes=${4:-30}
    
    if [ -z "$query" ] || [ -z "$from" ] || [ -z "$to" ]; then
        echo "Usage: datadog_search_logs_chunked <query> <from> <to> [chunk_minutes]"
        echo "Example: datadog_search_logs_chunked \"status:error service:/ecs/jobrunner\" \"now-1d\" \"now\" 30"
        return 1
    fi
    
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi
    
    local site=${DATADOG_SITE:-datadoghq.com}
    
    # Convert from/to to Unix timestamps in seconds
    local from_ts=$(parse_time_to_unix "$from")
    local to_ts=$(parse_time_to_unix "$to")
    
    if [ -z "$from_ts" ] || [ -z "$to_ts" ]; then
        echo "Error: Could not parse time range"
        return 1
    fi
    
    local chunk_seconds=$((chunk_minutes * 60))
    local current_from=$from_ts
    local all_data="[]"
    local chunk_num=1
    
    # Format dates for display (macOS vs Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local from_display=$(date -u -r $from_ts '+%Y-%m-%d %H:%M:%S')
        local to_display=$(date -u -r $to_ts '+%Y-%m-%d %H:%M:%S')
    else
        local from_display=$(date -u -d @$from_ts '+%Y-%m-%d %H:%M:%S')
        local to_display=$(date -u -d @$to_ts '+%Y-%m-%d %H:%M:%S')
    fi

    echo "Querying time range: $from_display to $to_display" >&2
    echo "Using ${chunk_minutes}-minute chunks" >&2
    echo "" >&2

    while [ $current_from -lt $to_ts ]; do
        local current_to=$((current_from + chunk_seconds))
        if [ $current_to -gt $to_ts ]; then
            current_to=$to_ts
        fi

        # Format chunk times (macOS vs Linux)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            local chunk_from=$(date -u -r $current_from '+%H:%M')
            local chunk_to=$(date -u -r $current_to '+%H:%M')
        else
            local chunk_from=$(date -u -d @$current_from '+%H:%M')
            local chunk_to=$(date -u -d @$current_to '+%H:%M')
        fi

        echo "Chunk ${chunk_num}: $chunk_from - $chunk_to" >&2

        # Query this chunk with rate limit headers captured
        local response=$(curl -s -i -X POST "https://api.${site}/api/v2/logs/events/search" \
            -H "DD-API-KEY: ${DATADOG_API_KEY}" \
            -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}" \
            -H "Content-Type: application/json" \
            -d "{
                \"filter\": {
                    \"query\": \"${query}\",
                    \"from\": \"$((current_from * 1000))\",
                    \"to\": \"$((current_to * 1000))\"
                },
                \"page\": {
                    \"limit\": 1000
                }
            }")

        # Extract rate limit headers
        local rate_limit=$(echo "$response" | grep -i "x-ratelimit-limit:" | head -1 | sed 's/.*: //' | tr -d '\r')
        local rate_remaining=$(echo "$response" | grep -i "x-ratelimit-remaining:" | head -1 | sed 's/.*: //' | tr -d '\r')
        local rate_reset=$(echo "$response" | grep -i "x-ratelimit-reset:" | head -1 | sed 's/.*: //' | tr -d '\r')

        # Extract JSON body (after headers)
        local body=$(echo "$response" | sed -n '/^{/,$p')

        # Extract data and merge
        local chunk_data=$(echo "$body" | jq -c '.data // []')
        local chunk_count=$(echo "$chunk_data" | jq 'length')
        all_data=$(echo "$all_data" "$chunk_data" | jq -s '.[0] + .[1]')

        echo "  -> ${chunk_count} results (rate: ${rate_remaining}/${rate_limit} remaining, resets in ${rate_reset}s)" >&2

        # Check if we need to pause to stay under 250 requests per minute
        # If we have less than 50 requests remaining, wait for the reset
        if [ -n "$rate_remaining" ] && [ "$rate_remaining" -lt 50 ]; then
            local wait_time=$((rate_reset + 2))
            echo "  -> Rate limit approaching, waiting ${wait_time}s for reset..." >&2
            sleep $wait_time
        fi
        
        # Move to next chunk
        current_from=$current_to
        chunk_num=$((chunk_num + 1))
    done
    
    local total=$(echo "$all_data" | jq 'length')
    echo "" >&2
    echo "Total results: ${total}" >&2
    
    # Output combined data as JSON
    echo "{\"data\": $all_data}"
}

# Helper to parse various time formats to Unix timestamp
function parse_time_to_unix() {
    local time_str=$1
    
    # If it's already a Unix timestamp (all digits), return it
    if [[ "$time_str" =~ ^[0-9]+$ ]]; then
        echo "$time_str"
        return 0
    fi
    
    # Handle "now"
    if [ "$time_str" = "now" ]; then
        date +%s
        return 0
    fi
    
    # Handle relative times like "now-1d", "now-6h"
    if [[ "$time_str" =~ ^now-(.+)$ ]]; then
        local offset="${BASH_REMATCH[1]}"
        local now=$(date +%s)
        
        case "$offset" in
            *d) local days=${offset%d}; echo $((now - days * 86400)) ;;
            *h) local hours=${offset%h}; echo $((now - hours * 3600)) ;;
            *m) local mins=${offset%m}; echo $((now - mins * 60)) ;;
            *) echo ""; return 1 ;;
        esac
        return 0
    fi
    
    # Try to parse as ISO date (macOS uses -j, Linux uses -d)
    # Note: TZ environment variable affects the interpretation
    # Example: TZ='America/Chicago' parse_time_to_unix "2025-10-07 02:50:00"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS date -j respects TZ environment variable
        date -j -f "%Y-%m-%d %H:%M:%S" "$time_str" +%s 2>/dev/null || \
        date -j -f "%Y-%m-%d" "$time_str" +%s 2>/dev/null
    else
        # Linux: Use -d for parsing (does NOT respect TZ, always UTC)
        # For timezone-aware parsing on Linux, would need different approach
        date -u -d "$time_str" +%s 2>/dev/null
    fi
}

# Sentry: Search for individual events (not grouped issues)
# Usage: sentry_search_events <org> <project> <start_time> <end_time> [limit] [query]
# Times can be: "now-1h", "now-24h", or ISO timestamps
# Example: sentry_search_events carefeed portal_dev "now-1h" "now" 10
sentry_search_events() {
    local org="$1"
    local project="$2"
    local start_time="$3"
    local end_time="$4"
    local limit="${5:-50}"
    local query="${6:-}"

    if [ -z "$org" ] || [ -z "$project" ] || [ -z "$start_time" ] || [ -z "$end_time" ]; then
        echo "Usage: sentry_search_events <org> <project> <start_time> <end_time> [limit] [query]"
        echo "Times: 'now-1h', 'now-24h', or ISO timestamps"
        return 1
    fi

    # Parse times
    local start_ts=$(parse_time_to_unix "$start_time")
    local end_ts=$(parse_time_to_unix "$end_time")

    if [ -z "$start_ts" ] || [ -z "$end_ts" ]; then
        echo "Error: Could not parse timestamps"
        return 1
    fi

    # Convert to ISO format for Sentry API
    local start_iso=$(date -u -r "$start_ts" +"%Y-%m-%dT%H:%M:%S")
    local end_iso=$(date -u -r "$end_ts" +"%Y-%m-%dT%H:%M:%S")

    # Build query params
    local query_param=""
    if [ -n "$query" ]; then
        query_param="&query=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))")"
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/projects/${org}/${project}/events/?full=true&start=${start_iso}&end=${end_iso}${query_param}" \
        | jq ".[0:${limit}]"
}

# ============================================================================
# Slack Notification Functions
# ============================================================================

function slack_send_dm() {
    local user_id="$1"
    local message="$2"

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)

    if [[ -z "$user_id" ]]; then
        echo "Error: user_id required"
        echo "Usage: slack_send_dm <user_id> <message>"
        return 1
    fi

    if [[ -z "$message" ]]; then
        echo "Error: message required"
        return 1
    fi

    # Open DM channel with user
    local response=$(curl -s -X POST https://slack.com/api/conversations.open \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{\"users\": \"$user_id\"}")

    local ok=$(echo "$response" | jq -r '.ok')
    if [[ "$ok" != "true" ]]; then
        echo "Error opening DM channel: $(echo "$response" | jq -r '.error')"
        return 1
    fi

    local channel_id=$(echo "$response" | jq -r '.channel.id')

    # Send message to DM channel
    response=$(curl -s -X POST https://slack.com/api/chat.postMessage \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{
            \"channel\": \"$channel_id\",
            \"text\": \"$message\",
            \"unfurl_links\": false,
            \"unfurl_media\": false
        }")

    ok=$(echo "$response" | jq -r '.ok')
    if [[ "$ok" != "true" ]]; then
        echo "Error sending message: $(echo "$response" | jq -r '.error')"
        return 1
    fi

    echo "Message sent to user $user_id"
    return 0
}

function slack_post_message() {
    local channel="$1"
    local message="$2"

    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured"
        return 1
    fi

    local token=$(slack_get_token)

    if [[ -z "$channel" ]]; then
        echo "Error: channel required"
        echo "Usage: slack_post_message <channel> <message>"
        echo "Example: slack_post_message '#deployments' 'Deploy complete'"
        return 1
    fi

    if [[ -z "$message" ]]; then
        echo "Error: message required"
        return 1
    fi

    # Remove # prefix if present
    channel="${channel#\#}"

    local response=$(curl -s -X POST https://slack.com/api/chat.postMessage \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{
            \"channel\": \"$channel\",
            \"text\": \"$message\",
            \"unfurl_links\": false,
            \"unfurl_media\": false
        }")

    local ok=$(echo "$response" | jq -r '.ok')
    if [[ "$ok" != "true" ]]; then
        echo "Error posting message: $(echo "$response" | jq -r '.error')"
        return 1
    fi

    echo "Message posted to #$channel"
    return 0
}

function slack_notify_completion() {
    local task_description="$1"
    local status="$2"  # "success" or "failure"
    local duration="$3"
    local details="$4"
    local user_id="${5:-$SLACK_USER_ID}"  # Use configured user ID if not provided

    if [[ -z "$user_id" ]]; then
        echo "Error: No user_id provided and SLACK_USER_ID not set in PREFERENCES.md"
        echo "Run 'slack_whoami' to get your user ID, then add to ~/.claude/PREFERENCES.md"
        return 1
    fi

    local emoji
    local status_text
    if [[ "$status" == "success" ]]; then
        emoji="✅"
        status_text="Complete"
    else
        emoji="❌"
        status_text="Failed"
    fi

    local message="$emoji *Task $status_text*

$task_description

*Duration:* $duration
*Status:* $status_text"

    if [[ -n "$details" ]]; then
        message="$message

$details"
    fi

    slack_send_dm "$user_id" "$message"
}

function slack_notify_progress() {
    local task_description="$1"
    local progress="$2"  # e.g., "45%", "3 of 10 files"
    local current_step="$3"
    local time_elapsed="$4"
    local user_id="${5:-$SLACK_USER_ID}"

    if [[ -z "$user_id" ]]; then
        echo "Error: No user_id provided and SLACK_USER_ID not set"
        return 1
    fi

    local message="⏳ *Progress Update*

$task_description

*Status:* In Progress ($progress)
*Time elapsed:* $time_elapsed

Currently: $current_step"

    slack_send_dm "$user_id" "$message"
}

function macos_notify() {
    local title="$1"
    local message="$2"

    osascript -e "display notification \"$message\" with title \"$title\""
}

function notify_user() {
    local task="$1"
    local status="${2:-success}"
    local duration="${3:-unknown}"
    local details="${4:-}"

    # Try Slack first
    if slack_is_configured; then
        slack_notify_completion "$task" "$status" "$duration" "$details"
        return $?
    fi

    # Fallback to macOS notification
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local title
        if [[ "$status" == "success" ]]; then
            title="✅ Task Complete"
        else
            title="❌ Task Failed"
        fi
        macos_notify "$title" "$task"
        return 0
    fi

    # Ultimate fallback: terminal bell
    echo -e "\a"
    echo "$task - $status"
}

# ==============================================================================
# Helper Functions - AWS
