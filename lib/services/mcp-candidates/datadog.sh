#!/bin/bash
# Datadog Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

# Helper Functions - Datadog
# ==============================================================================

# Test if Datadog credentials are configured
function datadog_is_configured() {
    if [ -z "$DATADOG_API_KEY" ] || [ -z "$DATADOG_APP_KEY" ]; then
        return 1
    fi
    return 0
}

# Test Datadog API connection
# Usage: datadog_validate
function datadog_validate() {
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    curl -s -X GET "https://api.${site}/api/v1/validate" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# Search logs
# Usage: datadog_search_logs "service:portal_dev error" "1h"
function datadog_search_logs() {
    local query=$1
    local timeframe=${2:-"1h"}

    if [ -z "$query" ]; then
        echo "Usage: datadog_search_logs <query> [timeframe]"
        echo "Example: datadog_search_logs \"service:portal_dev error\" \"1h\""
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    local now=$(date +%s)
    local from=$((now - 3600))  # Default 1 hour ago

    # Adjust timeframe
    case "$timeframe" in
        15m) from=$((now - 900)) ;;
        30m) from=$((now - 1800)) ;;
        1h)  from=$((now - 3600)) ;;
        3h)  from=$((now - 10800)) ;;
        6h)  from=$((now - 21600)) ;;
        12h) from=$((now - 43200)) ;;
        24h|1d) from=$((now - 86400)) ;;
        2d)  from=$((now - 172800)) ;;
        7d)  from=$((now - 604800)) ;;
    esac

    curl -s -X POST "https://api.${site}/api/v2/logs/events/search" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"filter\": {
                \"query\": \"${query}\",
                \"from\": \"${from}000\",
                \"to\": \"${now}000\"
            },
            \"page\": {
                \"limit\": 50
            }
        }"
}

# Enhanced search logs with pagination support
# Usage: datadog_search_logs_paginated "query" from_ms to_ms [limit] [cursor]
# Returns: Full JSON response including pagination cursor
function datadog_search_logs_paginated() {
    local query=$1
    local from_ms=$2
    local to_ms=$3
    local limit=${4:-1000}
    local cursor=${5:-""}

    if [ -z "$query" ] || [ -z "$from_ms" ] || [ -z "$to_ms" ]; then
        echo "Usage: datadog_search_logs_paginated <query> <from_ms> <to_ms> [limit] [cursor]" >&2
        echo "Example: datadog_search_logs_paginated \"source:/ecs/queues\" 1729180800000 1729224000000 1000" >&2
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured" >&2
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}

    # Build pagination object
    local page_json="{\"limit\": $limit}"
    if [ -n "$cursor" ]; then
        page_json="{\"limit\": $limit, \"cursor\": \"$cursor\"}"
    fi

    curl -s -X POST "https://api.${site}/api/v2/logs/events/search" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"filter\": {
                \"query\": \"${query}\",
                \"from\": \"${from_ms}\",
                \"to\": \"${to_ms}\"
            },
            \"page\": $page_json,
            \"sort\": \"timestamp\"
        }"
}

# Bulk collect logs with automatic pagination
# Usage: datadog_collect_logs_bulk "source:/ecs/queues" "12h" "/path/to/output"
# Collects all logs for the specified time period, handling pagination automatically
function datadog_collect_logs_bulk() {
    local query=$1
    local timeframe=$2
    local output_dir=$3

    if [ -z "$query" ] || [ -z "$timeframe" ] || [ -z "$output_dir" ]; then
        echo "Usage: datadog_collect_logs_bulk <query> <timeframe> <output_dir>" >&2
        echo "Example: datadog_collect_logs_bulk \"source:/ecs/queues\" \"12h\" \"./logs/queues\"" >&2
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured" >&2
        return 1
    fi

    # Create output directory
    mkdir -p "$output_dir"

    # Calculate timestamps
    local now_ms=$(date +%s)000
    local hours=12
    case "$timeframe" in
        1h)  hours=1 ;;
        3h)  hours=3 ;;
        6h)  hours=6 ;;
        12h) hours=12 ;;
        24h|1d) hours=24 ;;
        2d)  hours=48 ;;
    esac
    local from_ms=$((now_ms - (hours * 3600 * 1000)))

    echo "Collecting logs for query: $query"
    echo "Time range: $(date -r $((from_ms / 1000)) '+%Y-%m-%d %H:%M:%S') to $(date -r $((now_ms / 1000)) '+%Y-%m-%d %H:%M:%S')"
    echo "Output directory: $output_dir"
    echo ""

    local batch=1
    local total_logs=0
    local cursor=""
    local has_more=true

    while [ "$has_more" = true ]; do
        echo -n "Fetching batch $batch..."

        # Query with pagination
        local response=$(datadog_search_logs_paginated "$query" "$from_ms" "$now_ms" 1000 "$cursor")

        # Save batch
        local batch_file="$output_dir/batch-$(printf '%03d' $batch).json"
        echo "$response" > "$batch_file"

        # Count logs by counting "type":"log" occurrences
        local batch_count=$(grep -o '"type":"log"' "$batch_file" | wc -l | tr -d ' ')

        # Extract pagination cursor using grep/sed (avoids full JSON parsing)
        local next_cursor=$(grep -o '"after":"[^"]*"' "$batch_file" | tail -1 | sed 's/"after":"//;s/"$//')

        # Update totals and progress
        total_logs=$((total_logs + batch_count))
        echo " $batch_count logs (total: $total_logs)"

        # Check for next page cursor
        if [ -n "$next_cursor" ]; then
            cursor="$next_cursor"
            batch=$((batch + 1))
            # Brief sleep to avoid rate limits
            sleep 0.5
        else
            has_more=false
            echo ""
            echo "Collection complete: $total_logs total logs in $batch batches"
        fi
    done

    # Create summary file
    cat > "$output_dir/collection-summary.txt" <<EOF
Collection Summary
==================
Query: $query
Timeframe: $timeframe
Start: $(date -r $((from_ms / 1000)) '+%Y-%m-%d %H:%M:%S %Z')
End: $(date -r $((now_ms / 1000)) '+%Y-%m-%d %H:%M:%S %Z')
Total Logs: $total_logs
Total Batches: $batch
Collection Date: $(date '+%Y-%m-%d %H:%M:%S %Z')
EOF

    echo ""
    echo "Summary saved to: $output_dir/collection-summary.txt"
}

# Get service metrics
# Usage: datadog_get_metrics "system.cpu.user" "1h"
function datadog_get_metrics() {
    local metric=$1
    local timeframe=${2:-"1h"}

    if [ -z "$metric" ]; then
        echo "Usage: datadog_get_metrics <metric> [timeframe]"
        echo "Example: datadog_get_metrics \"system.cpu.user\" \"1h\""
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    local now=$(date +%s)
    local from=$((now - 3600))

    curl -s -X GET "https://api.${site}/api/v1/query?query=${metric}&from=${from}&to=${now}" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# List monitors
# Usage: datadog_list_monitors
function datadog_list_monitors() {
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    curl -s -X GET "https://api.${site}/api/v1/monitor" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# Get monitor details
# Usage: datadog_get_monitor "12345"
function datadog_get_monitor() {
    local monitor_id=$1

    if [ -z "$monitor_id" ]; then
        echo "Usage: datadog_get_monitor <monitor_id>"
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    curl -s -X GET "https://api.${site}/api/v1/monitor/${monitor_id}" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# Search for traces
# Usage: datadog_search_traces "service:portal_dev" "1h"
function datadog_search_traces() {
    local query=$1
    local timeframe=${2:-"1h"}

    if [ -z "$query" ]; then
        echo "Usage: datadog_search_traces <query> [timeframe]"
        echo "Example: datadog_search_traces \"service:portal_dev\" \"1h\""
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    local now=$(date +%s)
    local from=$((now - 3600))

    curl -s -X GET "https://api.${site}/api/v1/traces?filter[query]=${query}&filter[from]=${from}&filter[to]=${now}" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# List all dashboards
# Usage: datadog_list_dashboards
function datadog_list_dashboards() {
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    curl -s -X GET "https://api.${site}/api/v1/dashboard" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# Get dashboard by ID
# Usage: datadog_get_dashboard "abc-123-def"
function datadog_get_dashboard() {
    local dashboard_id=$1

    if [ -z "$dashboard_id" ]; then
        echo "Usage: datadog_get_dashboard <dashboard_id>"
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    curl -s -X GET "https://api.${site}/api/v1/dashboard/${dashboard_id}" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# Create a new dashboard from JSON
# Usage: datadog_create_dashboard '{"title":"My Dashboard",...}'
# Or: datadog_create_dashboard @dashboard.json
function datadog_create_dashboard() {
    local dashboard_json=$1

    if [ -z "$dashboard_json" ]; then
        echo "Usage: datadog_create_dashboard <json_payload>"
        echo "Example: datadog_create_dashboard '{\"title\":\"My Dashboard\",...}'"
        echo "Or from file: datadog_create_dashboard @dashboard.json"
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}

    # Handle file input (if starts with @)
    if [[ "$dashboard_json" == @* ]]; then
        local file_path="${dashboard_json:1}"
        if [ ! -f "$file_path" ]; then
            echo "Error: File not found: $file_path"
            return 1
        fi
        dashboard_json=$(cat "$file_path")
    fi

    curl -s -X POST "https://api.${site}/api/v1/dashboard" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}" \
        -H "Content-Type: application/json" \
        -d "$dashboard_json"
}

# Update an existing dashboard
# Usage: datadog_update_dashboard "abc-123-def" '{"title":"Updated Dashboard",...}'
# Or: datadog_update_dashboard "abc-123-def" @dashboard.json
function datadog_update_dashboard() {
    local dashboard_id=$1
    local dashboard_json=$2

    if [ -z "$dashboard_id" ] || [ -z "$dashboard_json" ]; then
        echo "Usage: datadog_update_dashboard <dashboard_id> <json_payload>"
        echo "Example: datadog_update_dashboard \"abc-123\" '{\"title\":\"Updated\",...}'"
        echo "Or from file: datadog_update_dashboard \"abc-123\" @dashboard.json"
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}

    # Handle file input (if starts with @)
    if [[ "$dashboard_json" == @* ]]; then
        local file_path="${dashboard_json:1}"
        if [ ! -f "$file_path" ]; then
            echo "Error: File not found: $file_path"
            return 1
        fi
        dashboard_json=$(cat "$file_path")
    fi

    curl -s -X PUT "https://api.${site}/api/v1/dashboard/${dashboard_id}" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}" \
        -H "Content-Type: application/json" \
        -d "$dashboard_json"
}

# Delete a dashboard
# Usage: datadog_delete_dashboard "abc-123-def"
function datadog_delete_dashboard() {
    local dashboard_id=$1

    if [ -z "$dashboard_id" ]; then
        echo "Usage: datadog_delete_dashboard <dashboard_id>"
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    local site=${DATADOG_SITE:-datadoghq.com}
    curl -s -X DELETE "https://api.${site}/api/v1/dashboard/${dashboard_id}" \
        -H "DD-API-KEY: ${DATADOG_API_KEY}" \
        -H "DD-APPLICATION-KEY: ${DATADOG_APP_KEY}"
}

# Search dashboards by query
# Usage: datadog_search_dashboards "statsig"
function datadog_search_dashboards() {
    local query=$1

    if [ -z "$query" ]; then
        echo "Usage: datadog_search_dashboards <query>"
        echo "Example: datadog_search_dashboards \"statsig\""
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    # List all dashboards and filter using jq
    datadog_list_dashboards | jq --arg q "$query" '
        .dashboards[] |
        select(.title | ascii_downcase | contains($q | ascii_downcase))
    '
}

# Export dashboard to JSON file
# Usage: datadog_export_dashboard "abc-123-def" "my-dashboard.json"
function datadog_export_dashboard() {
    local dashboard_id=$1
    local output_file=$2

    if [ -z "$dashboard_id" ] || [ -z "$output_file" ]; then
        echo "Usage: datadog_export_dashboard <dashboard_id> <output_file>"
        echo "Example: datadog_export_dashboard \"abc-123\" \"dashboard.json\""
        return 1
    fi
    if ! datadog_is_configured; then
        echo "Error: Datadog credentials not configured"
        return 1
    fi

    datadog_get_dashboard "$dashboard_id" | jq '.' > "$output_file"

    if [ $? -eq 0 ]; then
        echo "Dashboard exported to: $output_file"
    else
        echo "Error: Failed to export dashboard"
        return 1
    fi
}

# ==============================================================================
# Helper Functions - Slack
