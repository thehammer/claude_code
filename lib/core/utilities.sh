#!/bin/bash
# Claude Code - Core Utility Functions
#
# Cross-cutting utility functions used by various services.
#
# Usage:
#   source ~/.claude/lib/core/utilities.sh

# ==============================================================================
# Time Parsing Utilities
# ==============================================================================

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

    # Function incomplete - needs implementation
    echo "Note: sentry_search_events function is incomplete"
}

# ==============================================================================
# Notification Utilities
# ==============================================================================

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
# Integration Status
# ==============================================================================

function integration_status() {
    echo "Claude Code - Integration Status"
    echo "================================="
    echo ""

    if jira_is_configured; then
        echo "✅ Jira: Configured (${ATLASSIAN_EMAIL})"
    else
        echo "❌ Jira: Not configured"
    fi

    if confluence_is_configured; then
        echo "✅ Confluence: Configured (${ATLASSIAN_EMAIL})"
    else
        echo "❌ Confluence: Not configured"
    fi

    if bitbucket_is_configured; then
        echo "✅ Bitbucket: Configured (${BITBUCKET_USERNAME})"
    else
        echo "❌ Bitbucket: Not configured"
    fi

    if [ -n "$GITHUB_TOKEN" ]; then
        echo "✅ GitHub: Configured"
    else
        echo "❌ GitHub: Not configured"
    fi

    if [ -n "$SLACK_BOT_TOKEN" ]; then
        echo "✅ Slack: Configured"
    else
        echo "❌ Slack: Not configured"
    fi

    if sentry_is_configured; then
        echo "✅ Sentry: Configured"
    else
        echo "❌ Sentry: Not configured"
    fi

    if [ -n "$DATADOG_API_KEY" ] && [ -n "$DATADOG_APP_KEY" ]; then
        echo "✅ Datadog: Configured"
    else
        echo "❌ Datadog: Not configured"
    fi

    echo ""
    echo "See ~/.claude/INTEGRATIONS.md for usage information"
}

# ==============================================================================
# Cross-Service Aggregators
# ==============================================================================

function list_all_open_prs() {
    local limit="${1:-10}"
    local show_all="${2}"
    local found_any=false

    if [ "$show_all" = "all" ]; then
        echo "📋 Open Pull Requests Across All Repos (All Users)"
    else
        echo "📋 Your Open Pull Requests Across All Repos"
    fi
    echo "========================================"
    echo ""

    # Bitbucket repos (Carefeed workspace)
    if bitbucket_is_configured; then
        local bb_repos=("portal_dev" "family-portal")

        for repo in "${bb_repos[@]}"; do
            local result=$(bitbucket_list_prs "$repo" "OPEN" "$limit" 2>/dev/null)

            if [ "$show_all" != "all" ]; then
                # Filter to only PRs by current user
                # Use UUID if configured (most accurate), otherwise fall back to display_name
                if [ -n "$BITBUCKET_USER_UUID" ]; then
                    result=$(echo "$result" | jq --arg uuid "$BITBUCKET_USER_UUID" '{values: [.values[]? | select(.author.uuid == $uuid)]}' 2>/dev/null)
                else
                    # Fallback: filter by display name (less reliable, requires display_name to be set)
                    local display_name="${BITBUCKET_DISPLAY_NAME:-Hammer}"
                    result=$(echo "$result" | jq --arg name "$display_name" '{values: [.values[]? | select(.author.display_name == $name)]}' 2>/dev/null)
                fi
            fi

            local count=$(echo "$result" | jq -r '.values | length' 2>/dev/null || echo "0")

            if [ "$count" -gt 0 ] 2>/dev/null; then
                if [ "$show_all" = "all" ]; then
                    echo "🔵 Bitbucket: $repo ($count open PRs)"
                    echo "$result" | jq -r '.values[] | "  PR #\(.id): \(.title) (by \(.author.display_name))" + if .draft then " [DRAFT]" else "" end'
                else
                    # Count draft vs open
                    local draft_count=$(echo "$result" | jq '[.values[] | select(.draft == true)] | length')
                    local open_count=$(echo "$result" | jq '[.values[] | select(.draft == false)] | length')

                    echo "🔵 Bitbucket: $repo ($open_count open, $draft_count draft)"
                    echo "$result" | jq -r '.values[] | "  PR #\(.id): \(.title)" + if .draft then " [DRAFT]" else "" end'
                fi
                echo ""
                found_any=true
            fi
        done
    fi

    # GitHub repos (if configured)
    if github_is_configured; then
        # Add GitHub repos here if/when Carefeed uses GitHub
        # Would filter by GitHub username similarly
        :
    fi

    if [ "$found_any" = false ]; then
        if [ "$show_all" = "all" ]; then
            echo "No open pull requests found across all repositories."
        else
            echo "You have no open pull requests across all repositories."
        fi
    fi
}
