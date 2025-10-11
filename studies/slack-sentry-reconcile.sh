#!/bin/bash
#
# Study: Slack-Sentry Error Reconciliation
#
# Purpose: Compare errors posted to Slack #system-alerts with Sentry issues
#          to validate that exceptions are being captured properly by Sentry.
#
# Usage:
#   slack-sentry-reconcile [timeframe]
#
# Examples:
#   slack-sentry-reconcile 1h
#   slack-sentry-reconcile 24h
#
# Findings:
#   - Match rate between Slack alerts and Sentry issues
#   - Alerts that appear in Slack but not in Sentry
#   - Sentry issues without corresponding Slack alerts
#   - Timing correlation analysis

# Source dependencies
if ! type -t slack_is_configured &>/dev/null; then
    source ~/.claude/lib/integrations.sh
fi
source ~/.claude/lib/study-tracker.sh

# Configuration
SLACK_CHANNEL_ID="C035D3F8938"  # system-alerts
TIMEFRAME="${1:-1h}"

# Initialize study tracking
study_init "slack-sentry-reconcile" "Compare Slack alerts with Sentry issues" "$TIMEFRAME" > /dev/null

echo "========================================================================"
echo "Study: Slack-Sentry Error Reconciliation"
echo "========================================================================"
echo ""

# Validate integrations
if ! slack_is_configured; then
    echo "Error: Slack not configured"
    exit 1
fi

if ! sentry_is_configured; then
    echo "Error: Sentry not configured"
    exit 1
fi

# Calculate time range
# Support formats: 1h, 24h, 7d, 168h
if [[ "$TIMEFRAME" =~ ^[0-9]+d$ ]]; then
    # Convert days to hours
    days=${TIMEFRAME%d}
    hours=$((days * 24))
    from_ts=$(parse_time_to_unix "now-${hours}h")
elif [[ "$TIMEFRAME" =~ ^[0-9]+h$ ]]; then
    from_ts=$(parse_time_to_unix "now-${TIMEFRAME}")
else
    # Try as-is
    from_ts=$(parse_time_to_unix "now-${TIMEFRAME}")
fi

to_ts=$(parse_time_to_unix "now")

if [ -z "$from_ts" ] || [ -z "$to_ts" ]; then
    echo "Error: Could not parse timeframe: $TIMEFRAME"
    echo "Supported formats: 1h, 24h, 7d, 168h"
    exit 1
fi

# Display time range
echo "Timeframe: $TIMEFRAME"
echo "Range: $(date -r $from_ts '+%Y-%m-%d %H:%M') → $(date -r $to_ts '+%Y-%m-%d %H:%M')"
echo ""

# Fetch Slack alerts
echo "[1/2] Fetching Slack alerts..."
slack_json=$(slack_get_history "$SLACK_CHANNEL_ID" 200 "$from_ts" "$to_ts")

alerts=$(echo "$slack_json" | jq -r --arg from "$from_ts" --arg to "$to_ts" '
    [.messages[] |
     select(.attachments != null and
            (.ts | tonumber) >= ($from | tonumber) and
            (.ts | tonumber) <= ($to | tonumber)) |
     {
         ts: .ts,
         timestamp: (.ts | tonumber),
         time: (.ts | tonumber | strftime("%Y-%m-%d %H:%M:%S")),
         raw_message: ((.attachments[0].text // .attachments[0].fallback) | split("\n")[0]),
         message: ((.attachments[0].text // .attachments[0].fallback) | split("\n")[0] | split(":")[1:] | join(":") | ltrimstr(" ") | .[0:80]),
         level: (.attachments[0].fields[0].value // "UNKNOWN")
     } |
     select(.level == "CRITICAL" or .level == "ERROR") |
     # Filter out Laravel internal dontReport exceptions
     select(
         (.message | test("Unauthenticated") | not) and
         (.message | test("The given data was invalid") | not) and
         (.message | test("ValidationException") | not) and
         (.message | test("HttpException") | not) and
         (.message | test("HttpResponseException") | not) and
         (.message | test("419 ") | not) and  # CSRF token mismatch
         (.message | test("401 ") | not) and  # Unauthorized
         (.message | test("403 ") | not) and  # Forbidden
         (.message | test("404 ") | not) and  # Not found (when its just HTTP 404)
         (.message | test("405 ") | not)      # Method not allowed
     )
    ] | sort_by(.ts) | reverse
')

slack_count=$(echo "$alerts" | jq 'length')
echo "  → Found $slack_count Slack alerts"

# Save Slack alerts as artifact
echo "$alerts" | study_save_artifact "slack-alerts.json"

# Fetch Sentry issues
echo ""
echo "[2/2] Fetching Sentry issues..."
sentry_json=$(sentry_list_production_issues "carefeed" "portal_dev")

# Filter to timeframe and extract relevant data
# Note: Sentry timestamps include milliseconds, need to handle properly
sentry_issues=$(echo "$sentry_json" | jq --arg from_ts "$from_ts" --arg to_ts "$to_ts" '
    [.[] |
     (.lastSeen | sub("\\.\\d+Z$"; "Z") | fromdateiso8601) as $ts |
     select($ts >= ($from_ts | tonumber) and $ts <= ($to_ts | tonumber)) |
     {
         id: .id,
         title: .title,
         short_title: (.title | .[0:80]),
         count: .count,
         lastSeen: .lastSeen,
         lastSeenTs: $ts,
         culprit: .culprit
     }
    ] | sort_by(.lastSeenTs) | reverse
')

sentry_count=$(echo "$sentry_issues" | jq 'length')
echo "  → Found $sentry_count Sentry issues (active in timeframe)"

# Save Sentry issues as artifact
echo "$sentry_issues" | study_save_artifact "sentry-issues.json"

echo ""
echo "========================================================================"
echo "DATA"
echo "========================================================================"
echo ""

# Show Slack alerts
echo "Slack Alerts ($slack_count):"
echo "------------------------------------------------------------------------"
if [ "$slack_count" -gt 0 ]; then
    echo "$alerts" | jq -r '.[] | "[\(.time)] \(.message)"'
else
    echo "  (none)"
fi
echo ""

# Show Sentry issues
echo "Sentry Issues ($sentry_count):"
echo "------------------------------------------------------------------------"
if [ "$sentry_count" -gt 0 ]; then
    echo "$sentry_issues" | jq -r '.[] | "[\(.lastSeen | split("T")[0]) \(.lastSeen | split("T")[1] | split(".")[0])] (\(.count) events) \(.short_title)"'
else
    echo "  (none)"
fi

echo ""
echo "========================================================================"
echo "ANALYSIS"
echo "========================================================================"
echo ""

# Match Slack alerts to Sentry issues
if [ "$slack_count" -gt 0 ] && [ "$sentry_count" -gt 0 ]; then
    echo "Matching Slack alerts to Sentry issues..."
    echo ""

    # Create temp files for matching
    tmp_alerts=$(mktemp)
    tmp_sentry=$(mktemp)
    echo "$alerts" > "$tmp_alerts"
    echo "$sentry_issues" > "$tmp_sentry"

    # Perform matching
    matches=$(jq -n \
        --slurpfile slack "$tmp_alerts" \
        --slurpfile sentry "$tmp_sentry" '
        $slack[0] | map(
            . as $alert |
            . + {
                matched: false,
                sentry_match: null,
                match_score: 0
            } |
            . + (
                # Try to find best match in Sentry
                $sentry[0] | map(
                    . as $issue |
                    {
                        issue: $issue,
                        score: (
                            # Calculate match score based on:
                            # - Message similarity (fuzzy)
                            # - Time proximity (within 60s)
                            (if ($alert.message | ascii_downcase) as $am |
                                ($issue.title | ascii_downcase) as $it |
                                ($it | contains($am[0:30])) or ($am | contains($it[0:30]))
                            then 50 else 0 end) +
                            (if (($issue.lastSeenTs - $alert.timestamp) | fabs) <= 60
                            then 30 else 0 end) +
                            (if (($issue.lastSeenTs - $alert.timestamp) | fabs) <= 10
                            then 20 else 0 end)
                        )
                    }
                ) | sort_by(-.score) | .[0] |
                if .score >= 50 then
                    {
                        matched: true,
                        sentry_match: .issue,
                        match_score: .score
                    }
                else
                    {
                        matched: false,
                        sentry_match: null,
                        match_score: 0
                    }
                end
            )
        )
    ')

    # Count matches
    matched_count=$(echo "$matches" | jq '[.[] | select(.matched)] | length')
    unmatched_count=$(echo "$matches" | jq '[.[] | select(.matched == false)] | length')
    match_rate=$(echo "scale=1; $matched_count * 100 / $slack_count" | bc)

    echo "Match Rate: ${match_rate}% ($matched_count/$slack_count)"
    echo ""

    # Show matched alerts
    if [ "$matched_count" -gt 0 ]; then
        echo "Matched Alerts:"
        echo "$matches" | jq -r '.[] | select(.matched) |
            "✓ [\(.time)] \(.message[0:60])\n  → Sentry: https://carefeed.sentry.io/issues/\(.sentry_match.id)/\n"'
    fi

    # Show unmatched alerts
    if [ "$unmatched_count" -gt 0 ]; then
        echo "Unmatched Alerts (in Slack but NOT in Sentry):"
        echo "$matches" | jq -r '.[] | select(.matched == false) |
            "✗ [\(.time)] \(.message)\n  Slack: https://carefeed-hq.slack.com/archives/'$SLACK_CHANNEL_ID'/p\(.ts | gsub("\\."; ""))\n"'
    fi

    # Save reconciliation results
    echo "$matches" | study_save_artifact "reconciliation.json"

    # Cleanup
    rm -f "$tmp_alerts" "$tmp_sentry"

elif [ "$slack_count" -eq 0 ]; then
    echo "No Slack alerts to match"
    matched_count=0
    unmatched_count=0
    match_rate="N/A"
elif [ "$sentry_count" -eq 0 ]; then
    echo "No Sentry issues to match against"
    echo "All $slack_count Slack alerts are unmatched"
    matched_count=0
    unmatched_count=$slack_count
    match_rate=0
fi

echo ""
echo "========================================================================"
echo "FINDINGS"
echo "========================================================================"
echo ""

if [ "$slack_count" -eq 0 ] && [ "$sentry_count" -eq 0 ]; then
    finding="✓ No errors detected - system is healthy"
    status="healthy"
    echo "$finding"
elif [ "$slack_count" -eq 0 ]; then
    finding="⚠ Sentry has $sentry_count issues but Slack has no alerts - Slack webhook may not be working"
    status="warning"
    echo "$finding"
elif [ "$sentry_count" -eq 0 ]; then
    finding="⚠ Slack has $slack_count alerts but Sentry has no issues - Sentry may not be capturing exceptions"
    status="warning"
    echo "$finding"
elif [ "$matched_count" -eq "$slack_count" ]; then
    finding="✓ Perfect correlation: All Slack alerts matched to Sentry issues - Both systems capturing correctly"
    status="healthy"
    echo "$finding"
elif [ "$match_rate" -ge 80 ]; then
    finding="✓ Good correlation: ${match_rate}% match rate - Most errors captured by both systems"
    status="healthy"
    echo "$finding"
    echo "  Review unmatched alerts above for investigation"
else
    finding="⚠ Poor correlation: ${match_rate}% match rate - Significant gaps between Slack and Sentry"
    status="warning"
    echo "$finding"
    echo "  Investigate unmatched alerts and error handling configuration"
fi

# Complete study tracking
summary="Slack: $slack_count alerts, Sentry: $sentry_count issues, Match rate: ${match_rate}%"
study_complete "$summary" "$finding" "$status" > /dev/null

echo ""
echo "========================================================================"
