#!/usr/bin/env bash

# Datadog Helper Functions
# Purpose: Search and query Datadog logs, especially from Slack context
# Usage: Source this file and call functions as needed
#
# Required environment variables (from ~/.claude/credentials/.env):
#   DATADOG_API_KEY - Datadog API key
#   DATADOG_APP_KEY - Datadog Application key

#──────────────────────────────────────────────────────────────────────────────
# Configuration
#──────────────────────────────────────────────────────────────────────────────

# Load credentials if not already set
if [[ -z "$DATADOG_API_KEY" || -z "$DATADOG_APP_KEY" ]]; then
    if [[ -f ~/.claude/credentials/.env ]]; then
        export $(grep -E "^DATADOG_" ~/.claude/credentials/.env | xargs)
    fi
fi

DATADOG_API_URL="https://api.datadoghq.com/api/v2/logs/events/search"

#──────────────────────────────────────────────────────────────────────────────
# Slack URL Parsing
#──────────────────────────────────────────────────────────────────────────────

# Parse a Slack URL and extract components
# Usage: slack_url_parse "https://yourcompany.slack.com/archives/CXXXXXXXX/p1234567890123456?thread_ts=1234567890.123456"
# Output: channel_id thread_ts message_ts (space-separated)
slack_url_parse() {
    local url="$1"

    if [[ -z "$url" ]]; then
        echo "Usage: slack_url_parse <slack_url>" >&2
        return 1
    fi

    # Extract channel ID from /archives/{channel_id}/
    local channel_id=$(echo "$url" | sed -n 's|.*/archives/\([^/]*\)/.*|\1|p')

    # Extract thread_ts from query parameter (if present)
    local thread_ts=$(echo "$url" | sed -n 's|.*thread_ts=\([0-9.]*\).*|\1|p')

    # Extract message timestamp from p{ts} in the path
    # Format: p1766065482561889 → 1766065482.561889
    local raw_ts=$(echo "$url" | sed -n 's|.*/p\([0-9]*\).*|\1|p')
    local message_ts=""
    if [[ -n "$raw_ts" ]]; then
        # Insert decimal before last 6 digits
        local len=${#raw_ts}
        if [[ $len -gt 6 ]]; then
            message_ts="${raw_ts:0:$((len-6))}.${raw_ts:$((len-6))}"
        else
            message_ts="$raw_ts"
        fi
    fi

    # If no thread_ts, the message itself is the thread parent
    if [[ -z "$thread_ts" && -n "$message_ts" ]]; then
        thread_ts="$message_ts"
    fi

    echo "$channel_id $thread_ts $message_ts"
}

# Convert Slack URL to Datadog query
# Usage: slack_url_to_dd_query "https://yourcompany.slack.com/archives/..."
slack_url_to_dd_query() {
    local url="$1"
    local parsed
    parsed=$(slack_url_parse "$url")

    local channel_id thread_ts message_ts
    read channel_id thread_ts message_ts <<< "$parsed"

    if [[ -z "$thread_ts" ]]; then
        echo "Error: Could not extract thread_ts from URL" >&2
        return 1
    fi

    local service="${DD_SLACK_SERVICE:-carebot}"
    echo "service:${service} @@thread_id:$thread_ts"
}

#──────────────────────────────────────────────────────────────────────────────
# Datadog Log Search
#──────────────────────────────────────────────────────────────────────────────

# Search Datadog logs with a query
# Usage: datadog_search_logs <query> [timeframe] [limit]
# Timeframes: 15m, 1h, 3h, 6h, 12h, 1d, 2d, 7d (default: 1d)
datadog_search_logs() {
    local query="$1"
    local timeframe="${2:-1d}"
    local limit="${3:-50}"

    if [[ -z "$query" ]]; then
        echo "Usage: datadog_search_logs <query> [timeframe] [limit]" >&2
        echo "Timeframes: 15m, 1h, 3h, 6h, 12h, 1d, 2d, 7d" >&2
        return 1
    fi

    if [[ -z "$DATADOG_API_KEY" || -z "$DATADOG_APP_KEY" ]]; then
        echo "Error: DATADOG_API_KEY and DATADOG_APP_KEY must be set" >&2
        return 1
    fi

    local from="now-${timeframe}"

    curl -s -X POST "$DATADOG_API_URL" \
        -H "Content-Type: application/json" \
        -H "DD-API-KEY: $DATADOG_API_KEY" \
        -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
        -d "{\"filter\":{\"query\":\"$query\",\"from\":\"$from\",\"to\":\"now\"},\"sort\":\"timestamp\",\"page\":{\"limit\":$limit}}"
}

# Search logs and format output nicely
# Usage: datadog_search_logs_pretty <query> [timeframe] [limit]
datadog_search_logs_pretty() {
    local query="$1"
    local timeframe="${2:-1d}"
    local limit="${3:-50}"

    datadog_search_logs "$query" "$timeframe" "$limit" | \
        jq -r '.data[] | "\(.attributes.timestamp) | \(.attributes.message)"'
}

#──────────────────────────────────────────────────────────────────────────────
# Slack URL → Datadog Logs (Main Function)
#──────────────────────────────────────────────────────────────────────────────

# Search Datadog logs for a Slack conversation
# Usage: datadog_from_slack_url <slack_url> [timeframe] [limit]
# Example: datadog_from_slack_url "https://yourcompany.slack.com/archives/CXXXXXXXX/p1766065482561889?thread_ts=1765993504.007139"
datadog_from_slack_url() {
    local url="$1"
    local timeframe="${2:-7d}"
    local limit="${3:-50}"

    if [[ -z "$url" ]]; then
        echo "Usage: datadog_from_slack_url <slack_url> [timeframe] [limit]" >&2
        echo "" >&2
        echo "Searches Datadog logs for a Slack conversation thread." >&2
        echo "" >&2
        echo "Example:" >&2
        echo "  datadog_from_slack_url 'https://yourcompany.slack.com/archives/CXXXXXXXX/p1766065482561889?thread_ts=1765993504.007139'" >&2
        return 1
    fi

    local query
    query=$(slack_url_to_dd_query "$url")

    if [[ $? -ne 0 ]]; then
        return 1
    fi

    echo "🔍 Datadog Query: $query" >&2
    echo "⏱️  Timeframe: $timeframe" >&2
    echo "" >&2

    datadog_search_logs_pretty "$query" "$timeframe" "$limit"
}

# Get full log details (including all attributes) for a Slack conversation
# Usage: datadog_from_slack_url_full <slack_url> [timeframe] [limit]
datadog_from_slack_url_full() {
    local url="$1"
    local timeframe="${2:-7d}"
    local limit="${3:-50}"

    if [[ -z "$url" ]]; then
        echo "Usage: datadog_from_slack_url_full <slack_url> [timeframe] [limit]" >&2
        return 1
    fi

    local query
    query=$(slack_url_to_dd_query "$url")

    if [[ $? -ne 0 ]]; then
        return 1
    fi

    echo "🔍 Datadog Query: $query" >&2
    echo "⏱️  Timeframe: $timeframe" >&2
    echo "" >&2

    datadog_search_logs "$query" "$timeframe" "$limit" | jq '.data[] | .attributes'
}

#──────────────────────────────────────────────────────────────────────────────
# Validation
#──────────────────────────────────────────────────────────────────────────────

# Test Datadog API connection
datadog_validate() {
    if [[ -z "$DATADOG_API_KEY" || -z "$DATADOG_APP_KEY" ]]; then
        echo "❌ DATADOG_API_KEY and DATADOG_APP_KEY not set" >&2
        return 1
    fi

    local result
    local service="${DD_SLACK_SERVICE:-carebot}"
    result=$(datadog_search_logs "service:${service}" "15m" "1" 2>&1)

    if echo "$result" | jq -e '.errors' &>/dev/null; then
        echo "❌ Datadog API error: $(echo "$result" | jq -r '.errors[]')" >&2
        return 1
    fi

    echo "✅ Datadog API connection successful"
    return 0
}

#──────────────────────────────────────────────────────────────────────────────
# Help
#──────────────────────────────────────────────────────────────────────────────

datadog_help() {
    cat <<'EOF'
Datadog Helper Functions
========================

Main Functions:
  datadog_from_slack_url <url> [timeframe] [limit]
      Search Datadog logs for a Slack conversation thread.
      This is the main function - give it a Slack message URL.

  datadog_from_slack_url_full <url> [timeframe] [limit]
      Same as above but returns full log attributes (more detail).

  datadog_search_logs <query> [timeframe] [limit]
      Direct Datadog log search with custom query.

  datadog_search_logs_pretty <query> [timeframe] [limit]
      Same as above but formats output nicely.

Utility Functions:
  slack_url_parse <url>
      Parse Slack URL into: channel_id thread_ts message_ts

  slack_url_to_dd_query <url>
      Convert Slack URL to Datadog query string.

  datadog_validate
      Test API connection.

Timeframes: 15m, 1h, 3h, 6h, 12h, 1d, 2d, 7d

Example:
  source ~/.claude/lib/services/mcp-candidates/datadog.sh
  datadog_from_slack_url "https://yourcompany.slack.com/archives/CXXXXXXXX/p1766065482561889?thread_ts=1765993504.007139"
EOF
}
