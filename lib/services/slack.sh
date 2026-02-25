#!/bin/bash
# Slack Helper Functions
# Curl-based Slack API client for Claude Code agents and skills.
#
# Required env vars (loaded via credentials.sh):
#   SLACK_USER_TOKEN or SLACK_BOT_TOKEN
#   SLACK_USER_ID (optional, for notifications)

# Get the appropriate Slack token (prefers user token)
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
    [ -n "$(slack_get_token)" ]
}

# Test Slack API connection
function slack_validate() {
    if ! slack_is_configured; then
        echo "Error: Slack credentials not configured" >&2
        return 1
    fi
    local token=$(slack_get_token)
    local result=$(curl -s -X GET "https://slack.com/api/auth.test" \
        -H "Authorization: Bearer ${token}")
    if echo "$result" | jq -e '.ok == true' &>/dev/null; then
        echo "OK: $(echo "$result" | jq -r '.user // "authenticated"')"
    else
        echo "Error: $(echo "$result" | jq -r '.error // "unknown"')" >&2
        return 1
    fi
}

# List conversations (channels, DMs, etc.)
# Usage: slack_list_conversations [types] [limit]
function slack_list_conversations() {
    local types=${1:-"public_channel"}
    local limit=${2:-100}
    local token=$(slack_get_token)
    curl -s -X GET "https://slack.com/api/conversations.list" \
        -H "Authorization: Bearer ${token}" \
        -d "types=${types}" \
        -d "limit=${limit}" \
        -d "exclude_archived=true"
}

# Get conversation history
# Usage: slack_get_history <channel_id> [limit] [oldest] [latest]
function slack_get_history() {
    local channel_id=$1 limit=${2:-100} oldest=$3 latest=$4
    if [ -z "$channel_id" ]; then
        echo "Usage: slack_get_history <channel_id> [limit] [oldest] [latest]" >&2
        return 1
    fi
    local token=$(slack_get_token)
    local params="channel=${channel_id}&limit=${limit}"
    [ -n "$oldest" ] && params="${params}&oldest=${oldest}"
    [ -n "$latest" ] && params="${params}&latest=${latest}"
    curl -s -X GET "https://slack.com/api/conversations.history?${params}" \
        -H "Authorization: Bearer ${token}"
}

# Get thread replies
# Usage: slack_get_thread <channel_id> <thread_ts> [limit]
function slack_get_thread() {
    local channel_id=$1 thread_ts=$2 limit=${3:-200}
    if [ -z "$channel_id" ] || [ -z "$thread_ts" ]; then
        echo "Usage: slack_get_thread <channel_id> <thread_ts> [limit]" >&2
        return 1
    fi
    local token=$(slack_get_token)
    curl -s -X GET "https://slack.com/api/conversations.replies" \
        -H "Authorization: Bearer ${token}" \
        -d "channel=${channel_id}" \
        -d "ts=${thread_ts}" \
        -d "limit=${limit}"
}

# Search for messages
# Usage: slack_search_messages <query> [count] [page]
function slack_search_messages() {
    local query=$1 count=${2:-20} page=${3:-1}
    if [ -z "$query" ]; then
        echo "Usage: slack_search_messages <query> [count] [page]" >&2
        echo "Query modifiers: in:channel, from:@user, after:YYYY-MM-DD, before:YYYY-MM-DD" >&2
        return 1
    fi
    local token=$(slack_get_token)
    local encoded_query=$(echo -n "$query" | jq -sRr @uri)
    curl -s -X GET "https://slack.com/api/search.messages" \
        -H "Authorization: Bearer ${token}" \
        -d "query=${encoded_query}" \
        -d "count=${count}" \
        -d "page=${page}"
}

# Find channel ID by name
# Usage: slack_find_channel <channel_name>
function slack_find_channel() {
    local channel_name=${1#"#"}
    if [ -z "$channel_name" ]; then
        echo "Usage: slack_find_channel <channel_name>" >&2
        return 1
    fi
    slack_list_conversations "public_channel,private_channel" 200 | jq -r \
        --arg name "$channel_name" \
        '.channels[] | select(.name == $name) | {id: .id, name: .name, is_private: .is_private, num_members: .num_members}'
}

# Get recent messages from a channel by name
# Usage: slack_get_channel_messages <channel_name> [limit]
function slack_get_channel_messages() {
    local channel_name=$1 limit=${2:-50}
    if [ -z "$channel_name" ]; then
        echo "Usage: slack_get_channel_messages <channel_name> [limit]" >&2
        return 1
    fi
    local channel_info=$(slack_find_channel "$channel_name")
    if [ -z "$channel_info" ] || [ "$channel_info" = "null" ]; then
        echo "Error: Channel not found or no access" >&2
        return 1
    fi
    local channel_id=$(echo "$channel_info" | jq -r '.id')
    slack_get_history "$channel_id" "$limit"
}

# Get user information
# Usage: slack_get_user_info <user_id>
function slack_get_user_info() {
    local user_id=$1
    if [ -z "$user_id" ]; then
        echo "Usage: slack_get_user_info <user_id>" >&2
        return 1
    fi
    local token=$(slack_get_token)
    curl -s -X GET "https://slack.com/api/users.info" \
        -H "Authorization: Bearer ${token}" \
        -d "user=${user_id}"
}

# Parse Slack URL into components
# Usage: slack_parse_url <url>
# Output: channel_id thread_ts message_ts (space-separated)
function slack_parse_url() {
    local url="$1"
    if [ -z "$url" ]; then
        echo "Usage: slack_parse_url <slack_url>" >&2
        return 1
    fi
    local channel_id=$(echo "$url" | sed -n 's|.*/archives/\([^/?]*\).*|\1|p')
    local thread_ts=$(echo "$url" | sed -n 's|.*thread_ts=\([0-9.]*\).*|\1|p')
    local raw_ts=$(echo "$url" | sed -n 's|.*/p\([0-9]*\).*|\1|p')
    local message_ts=""
    if [ -n "$raw_ts" ]; then
        local len=${#raw_ts}
        if [ $len -gt 6 ]; then
            message_ts="${raw_ts:0:$((len-6))}.${raw_ts:$((len-6))}"
        else
            message_ts="$raw_ts"
        fi
    fi
    [ -z "$thread_ts" ] && [ -n "$message_ts" ] && thread_ts="$message_ts"
    echo "$channel_id $thread_ts $message_ts"
}

# Get message from a Slack URL
# Usage: slack_get_message_from_url <url>
function slack_get_message_from_url() {
    local url="$1"
    if [ -z "$url" ]; then
        echo "Usage: slack_get_message_from_url <slack_url>" >&2
        return 1
    fi
    local parsed channel_id thread_ts message_ts
    parsed=$(slack_parse_url "$url")
    read channel_id thread_ts message_ts <<< "$parsed"

    if [ -z "$channel_id" ] || [ -z "$message_ts" ]; then
        echo "Error: Could not parse Slack URL" >&2
        return 1
    fi
    local latest=$(echo "$message_ts + 1" | bc)
    slack_get_history "$channel_id" 1 "$message_ts" "$latest" | jq '.messages[0]'
}

# Get thread from a Slack URL
# Usage: slack_get_thread_from_url <url> [limit]
function slack_get_thread_from_url() {
    local url="$1" limit=${2:-200}
    if [ -z "$url" ]; then
        echo "Usage: slack_get_thread_from_url <slack_url> [limit]" >&2
        return 1
    fi
    local parsed channel_id thread_ts message_ts
    parsed=$(slack_parse_url "$url")
    read channel_id thread_ts message_ts <<< "$parsed"

    if [ -z "$channel_id" ] || [ -z "$thread_ts" ]; then
        echo "Error: Could not parse Slack URL" >&2
        return 1
    fi
    slack_get_thread "$channel_id" "$thread_ts" "$limit"
}

# Format thread messages for readable output
# Pipe slack_get_thread_from_url output to this
function slack_format_thread() {
    jq -r '.messages[] | "\(.ts) | \(.user // "bot") | \(.text // "(no text)")"'
}

# ============================================================================
# Notification Functions
# ============================================================================

# Send a DM to a user
# Usage: slack_send_dm <user_id> <message>
function slack_send_dm() {
    local user_id="$1" message="$2"
    if [ -z "$user_id" ] || [ -z "$message" ]; then
        echo "Usage: slack_send_dm <user_id> <message>" >&2
        return 1
    fi
    local token=$(slack_get_token)
    local response=$(curl -s -X POST https://slack.com/api/conversations.open \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{\"users\": \"$user_id\"}")
    local ok=$(echo "$response" | jq -r '.ok')
    if [ "$ok" != "true" ]; then
        echo "Error opening DM: $(echo "$response" | jq -r '.error')" >&2
        return 1
    fi
    local channel_id=$(echo "$response" | jq -r '.channel.id')
    response=$(curl -s -X POST https://slack.com/api/chat.postMessage \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{\"channel\": \"$channel_id\", \"text\": \"$message\", \"unfurl_links\": false, \"unfurl_media\": false}")
    ok=$(echo "$response" | jq -r '.ok')
    if [ "$ok" != "true" ]; then
        echo "Error sending message: $(echo "$response" | jq -r '.error')" >&2
        return 1
    fi
    echo "Message sent to user $user_id"
}

# Post a message to a channel
# Usage: slack_post_message <channel> <message>
function slack_post_message() {
    local channel="${1#\#}" message="$2"
    if [ -z "$channel" ] || [ -z "$message" ]; then
        echo "Usage: slack_post_message <channel> <message>" >&2
        return 1
    fi
    local token=$(slack_get_token)
    local response=$(curl -s -X POST https://slack.com/api/chat.postMessage \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{\"channel\": \"$channel\", \"text\": \"$message\", \"unfurl_links\": false, \"unfurl_media\": false}")
    local ok=$(echo "$response" | jq -r '.ok')
    if [ "$ok" != "true" ]; then
        echo "Error posting: $(echo "$response" | jq -r '.error')" >&2
        return 1
    fi
    echo "Message posted to #$channel"
}
