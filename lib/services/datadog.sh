#!/bin/bash
# Datadog API helpers (curl-based, replaces datadog MCP server)
#
# Requires credentials from ~/.claude/credentials/.env:
#   DATADOG_API_KEY, DATADOG_APP_KEY, DATADOG_SITE
#
# Usage:
#   source ~/.claude/lib/core/credentials.sh
#   source ~/.claude/lib/services/datadog.sh

# Load credentials if not already set
if [ -z "$DATADOG_API_KEY" ] || [ -z "$DATADOG_APP_KEY" ]; then
    [ -f ~/.claude/credentials/.env ] && export $(grep -E "^DATADOG_" ~/.claude/credentials/.env 2>/dev/null | xargs)
fi

DD_SITE="${DATADOG_SITE:-datadoghq.com}"
DD_BASE="https://api.${DD_SITE}"

# ==============================================================================
# Base request
# ==============================================================================

# Make authenticated Datadog API request
# Usage: dd_request GET "/api/v1/validate"
#        dd_request POST "/api/v2/logs/events/search" '{"filter":{...}}'
function dd_request() {
    local method="${1:?Usage: dd_request METHOD PATH [BODY]}"
    local path="$2"
    local body="$3"

    if [ -z "$DATADOG_API_KEY" ] || [ -z "$DATADOG_APP_KEY" ]; then
        echo '{"error":"Missing Datadog credentials"}' >&2
        return 1
    fi

    local -a args=(
        -s -X "$method"
        -H "DD-API-KEY: $DATADOG_API_KEY"
        -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY"
        -H "Content-Type: application/json"
    )
    [ -n "$body" ] && args+=(-d "$body")

    curl "${args[@]}" "${DD_BASE}${path}"
}

# ==============================================================================
# Validation
# ==============================================================================

function dd_validate() {
    local result
    result=$(dd_request GET "/api/v1/validate")
    if echo "$result" | jq -e '.valid == true' &>/dev/null; then
        echo "Datadog API connection valid"
    else
        echo "Datadog API validation failed: $result" >&2
        return 1
    fi
}

# ==============================================================================
# Logs
# ==============================================================================

# Search logs
# Usage: dd_search_logs "status:error" [from] [to] [limit]
function dd_search_logs() {
    local query="${1:?Usage: dd_search_logs QUERY [FROM] [TO] [LIMIT]}"
    local from="${2:-now-1h}"
    local to="${3:-now}"
    local limit="${4:-50}"

    dd_request POST "/api/v2/logs/events/search" "$(jq -n \
        --arg q "$query" --arg f "$from" --arg t "$to" --argjson l "$limit" \
        '{filter:{query:$q,from:$f,to:$t},sort:"timestamp",page:{limit:$l}}')"
}

# Format log search results
# Usage: dd_search_logs "query" | dd_format_logs
function dd_format_logs() {
    jq -r '.data[]? | "\(.attributes.timestamp) [\(.attributes.status // "-")] [\(.attributes.service // "-")] \(.attributes.message // "" | .[0:200])"'
}

# Search logs from Slack URL (extracts thread_ts for carebot logs)
# Usage: dd_logs_from_slack "https://company.slack.com/archives/..." [from] [limit]
function dd_logs_from_slack() {
    local url="${1:?Usage: dd_logs_from_slack SLACK_URL [FROM] [LIMIT]}"
    local from="${2:-now-7d}"
    local limit="${3:-50}"

    # Extract thread_ts from Slack URL
    local thread_ts
    thread_ts=$(echo "$url" | sed -n 's|.*thread_ts=\([0-9.]*\).*|\1|p')
    if [ -z "$thread_ts" ]; then
        local raw_ts
        raw_ts=$(echo "$url" | sed -n 's|.*/p\([0-9]*\).*|\1|p')
        if [ -n "$raw_ts" ]; then
            local len=${#raw_ts}
            thread_ts="${raw_ts:0:$((len-6))}.${raw_ts:$((len-6))}"
        fi
    fi

    if [ -z "$thread_ts" ]; then
        echo "Could not extract thread_ts from URL" >&2
        return 1
    fi

    local service="${DD_SLACK_SERVICE:-carebot}"
    local query="service:${service} @@thread_id:$thread_ts"
    echo "Query: $query" >&2
    dd_search_logs "$query" "$from" "now" "$limit"
}

# ==============================================================================
# Metrics
# ==============================================================================

# Query metrics
# Usage: dd_query_metrics "avg:system.cpu.user{host:myhost}" [from] [to]
function dd_query_metrics() {
    local query="${1:?Usage: dd_query_metrics QUERY [FROM] [TO]}"
    local from="${2:-now-1h}"
    local to="${3:-now}"

    # Convert relative times to epoch seconds
    local from_ts to_ts
    from_ts=$(_dd_parse_time "$from")
    to_ts=$(_dd_parse_time "$to")

    local encoded_query
    encoded_query=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))" 2>/dev/null)

    dd_request GET "/api/v1/query?query=${encoded_query}&from=${from_ts}&to=${to_ts}"
}

# ==============================================================================
# Monitors
# ==============================================================================

# List monitors
# Usage: dd_list_monitors [query]
function dd_list_monitors() {
    local query="$1"
    if [ -n "$query" ]; then
        local encoded
        encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))" 2>/dev/null)
        dd_request GET "/api/v1/monitor?query=${encoded}"
    else
        dd_request GET "/api/v1/monitor"
    fi
}

# Get monitor details
# Usage: dd_get_monitor 12345
function dd_get_monitor() {
    local id="${1:?Usage: dd_get_monitor MONITOR_ID}"
    dd_request GET "/api/v1/monitor/$id"
}

# Format monitor list
# Usage: dd_list_monitors | dd_format_monitors
function dd_format_monitors() {
    jq -r '.[]? | "\(.overall_state // .status)\t\(.id)\t\(.type)\t\(.name)"'
}

# ==============================================================================
# APM Traces
# ==============================================================================

# Search traces
# Usage: dd_search_traces "service:admin-portal" [from] [to] [limit]
function dd_search_traces() {
    local query="${1:?Usage: dd_search_traces QUERY [FROM] [TO] [LIMIT]}"
    local from="${2:-now-1h}"
    local to="${3:-now}"
    local limit="${4:-20}"

    dd_request POST "/api/v2/spans/events/search" "$(jq -n \
        --arg q "$query" --arg f "$from" --arg t "$to" --argjson l "$limit" \
        '{filter:{query:$q,from:$f,to:$t},sort:"-duration",page:{limit:$l}}')"
}

# Get service APM stats (latency percentiles, request/error counts)
# Usage: dd_service_stats "admin-portal" [env] [from] [to]
function dd_service_stats() {
    local service="${1:?Usage: dd_service_stats SERVICE [ENV] [FROM] [TO]}"
    local env="${2:-production}"
    local from="${3:-now-1h}"
    local to="${4:-now}"

    local from_ts to_ts
    from_ts=$(_dd_parse_time "$from")
    to_ts=$(_dd_parse_time "$to")

    local base_query="trace.laravel.request"
    local tags="service:${service},env:${env}"
    local encoded_tags
    encoded_tags=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$tags'))" 2>/dev/null)

    # Query P50, P95, hits, errors in parallel
    local p50 p95 hits errors
    p50=$(dd_request GET "/api/v1/query?query=avg:${base_query}.duration.by.service.50p{${encoded_tags}}&from=${from_ts}&to=${to_ts}" | jq '[.series[0].pointlist[]?[1] // 0] | if length > 0 then (add/length) else 0 end')
    p95=$(dd_request GET "/api/v1/query?query=avg:${base_query}.duration.by.service.95p{${encoded_tags}}&from=${from_ts}&to=${to_ts}" | jq '[.series[0].pointlist[]?[1] // 0] | if length > 0 then (add/length) else 0 end')
    hits=$(dd_request GET "/api/v1/query?query=sum:${base_query}.hits{${encoded_tags}}.as_count()&from=${from_ts}&to=${to_ts}" | jq '[.series[0].pointlist[]?[1] // 0] | add // 0 | floor')
    errors=$(dd_request GET "/api/v1/query?query=sum:${base_query}.errors{${encoded_tags}}.as_count()&from=${from_ts}&to=${to_ts}" | jq '[.series[0].pointlist[]?[1] // 0] | add // 0 | floor')

    jq -n --argjson p50 "${p50:-0}" --argjson p95 "${p95:-0}" \
        --argjson hits "${hits:-0}" --argjson errors "${errors:-0}" \
        '{latency_p50: $p50, latency_p95: $p95, requests: $hits, errors: $errors, error_rate: (if $hits > 0 then ($errors / $hits * 100 | . * 100 | floor / 100) else 0 end)}'
}

# Get trace spans for a specific trace
# Usage: dd_get_trace_spans <trace_id>
function dd_get_trace_spans() {
    local trace_id="${1:?Usage: dd_get_trace_spans TRACE_ID}"
    dd_search_traces "@trace_id:$trace_id" "now-24h" "now" 1000
}

# ==============================================================================
# Internal helpers
# ==============================================================================

# Parse relative time string to epoch seconds
function _dd_parse_time() {
    local t="$1"
    case "$t" in
        now) date +%s ;;
        now-*m) echo $(( $(date +%s) - ${t#now-} * 60 )) ;;
        now-*h) echo $(( $(date +%s) - ${t#now-} * 3600 )) ;;
        now-*d) echo $(( $(date +%s) - ${t#now-} * 86400 )) ;;
        *) date -j -f "%Y-%m-%dT%H:%M:%S" "$t" +%s 2>/dev/null || echo "$t" ;;
    esac
}
