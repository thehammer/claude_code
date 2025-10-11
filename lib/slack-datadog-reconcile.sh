#!/bin/bash
#
# Slack-Datadog Error Reconciliation Tool
#
# Reconciles errors from Slack #system-alerts with Datadog logs
# to identify alerts missing from Datadog
#
# Usage:
#   source ~/.claude/lib/slack-datadog-reconcile.sh
#   slack_datadog_reconcile "1h"
#   slack_datadog_reconcile "4h" "/ecs/portal_dev"

# Source integrations if not loaded
if ! type -t slack_is_configured &>/dev/null; then
    source ~/.claude/lib/integrations.sh
fi

SLACK_CHANNEL_ID="C035D3F8938"  # system-alerts
DEFAULT_SERVICE="/ecs/portal_dev"

function slack_datadog_reconcile() {
    local timeframe=${1:-"1h"}
    local service=${2:-$DEFAULT_SERVICE}

    echo "========================================================================"
    echo "Slack-Datadog Error Reconciliation"
    echo "========================================================================"

    # Parse timeframe
    local from_ts=$(parse_time_to_unix "now-${timeframe}")
    local to_ts=$(parse_time_to_unix "now")

    if [ -z "$from_ts" ] || [ -z "$to_ts" ]; then
        echo "Error: Could not parse time range"
        return 1
    fi

    # Display time range
    echo "Time Range: $(date -r $from_ts '+%Y-%m-%d %H:%M') → $(date -r $to_ts '+%Y-%m-%d %H:%M')"
    echo "Service: $service"
    echo ""

    # Fetch Slack alerts
    echo "[1/3] Fetching Slack alerts..."
    local slack_json=$(slack_get_history "$SLACK_CHANNEL_ID" 200 "$from_ts" "$to_ts")

    # Extract Laravel error alerts
    local alerts=$(echo "$slack_json" | jq -r --arg from "$from_ts" --arg to "$to_ts" '
        [.messages[] |
         select(.attachments != null and
                (.ts | tonumber) >= ($from | tonumber) and
                (.ts | tonumber) <= ($to | tonumber)) |
         {
             ts: .ts,
             time: (.ts | tonumber | strftime("%H:%M:%S")),
             message: (.attachments[0].text // .attachments[0].fallback),
             level: (.attachments[0].fields[0].value // "UNKNOWN")
         } |
         select(.level == "CRITICAL" or .level == "ERROR")
        ] | sort_by(.ts) | reverse
    ')

    local slack_count=$(echo "$alerts" | jq 'length')
    echo "  → Found $slack_count Slack alerts"

    if [ "$slack_count" -eq 0 ]; then
        echo "No Slack alerts in timeframe"
        return 0
    fi

    # Fetch Datadog logs
    echo ""
    echo "[2/3] Querying Datadog..."
    local dd_logs=$(datadog_search_logs_chunked "status:error service:${service}" "$from_ts" "$to_ts" 15)
    local dd_count=$(echo "$dd_logs" | jq '.data | length')
    echo "  → Found $dd_count Datadog logs"

    # Reconcile
    echo ""
    echo "[3/3] Reconciling..."
    echo ""

    # Save to temp files
    local tmp_slack=$(mktemp)
    local tmp_dd=$(mktemp)
    echo "$alerts" > "$tmp_slack"
    echo "$dd_logs" > "$tmp_dd"

    # Match alerts to logs
    local results=$(jq -n \
        --slurpfile slack "$tmp_slack" \
        --slurpfile dd "$tmp_dd" '
        $slack[0] | map(
            . as $alert |
            . + {
                matched: (
                    $dd[0].data | any(
                        (.attributes.message // "" | tostring) as $msg |
                        (.attributes.error.stack // "" | tostring) as $stack |
                        ($alert.message | split("\n")[0]) as $first_line |
                        # Extract error message part after first colon
                        ($first_line | split(":")[1:] | join(":") | ltrimstr(" ") | .[0:50]) as $alert_snippet |
                        # Match on message content or stack trace
                        (($alert_snippet | length) > 5 and ($msg | contains($alert_snippet))) or
                        (($first_line | test(":/[^:]+:[\\s]*[0-9]+")) and ($stack | contains($first_line | match(":/[^:]+:[\\s]*[0-9]+").string)))
                    )
                )
            }
        )
    ')

    # Summary
    local matched=$(echo "$results" | jq '[.[] | select(.matched)] | length')
    local unmatched=$(echo "$results" | jq '[.[] | select(.matched == false)] | length')

    echo "========================================================================"
    echo "RESULTS"
    echo "========================================================================"
    echo "Total:     $slack_count"
    echo "Matched:   $matched"
    echo "Unmatched: $unmatched"
    echo ""

    # Show unmatched
    if [ "$unmatched" -gt 0 ]; then
        echo "------------------------------------------------------------------------"
        echo "UNMATCHED ALERTS (in Slack but NOT in Datadog)"
        echo "------------------------------------------------------------------------"
        echo ""

        echo "$results" | jq -r '
            .[] | select(.matched == false) |
            "[\(.time)] \(.level)\n" +
            "  \(.message | split("\n")[0])\n" +
            "  Link: https://carefeed-hq.slack.com/archives/C035D3F8938/p\(.ts | gsub("\\."; ""))\n"
        '
    fi

    # Cleanup
    rm -f "$tmp_slack" "$tmp_dd"

    echo "========================================================================"
}

# Export
export -f slack_datadog_reconcile
