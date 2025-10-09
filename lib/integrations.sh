#!/bin/bash
#
# Claude Code - Integration Helper Functions
#
# This script provides helper functions for interacting with external services.
# Source this file to load credentials and use the helper functions.
#
# Usage:
#   source ~/.claude/lib/integrations.sh
#   jira_get_issue "CORE-1234"

# ==============================================================================
# Load Credentials
# ==============================================================================

# Check if credentials file exists
if [ ! -f ~/.claude/credentials/.env ]; then
    echo "Warning: Credentials file not found at ~/.claude/credentials/.env"
    echo "See ~/.claude/credentials/README.md for setup instructions"
    return 1
fi

# Load credentials from .env file
# Note: This handles variable expansion like ${ATLASSIAN_API_TOKEN}
set -a  # Automatically export all variables
source ~/.claude/credentials/.env
set +a

# Trim whitespace from tokens to prevent authentication issues
SENTRY_API_TOKEN=$(echo -n "${SENTRY_API_TOKEN}" | tr -d '[:space:]')
DATADOG_API_KEY=$(echo -n "${DATADOG_API_KEY}" | tr -d '[:space:]')
DATADOG_APP_KEY=$(echo -n "${DATADOG_APP_KEY}" | tr -d '[:space:]')
ATLASSIAN_API_TOKEN=$(echo -n "${ATLASSIAN_API_TOKEN}" | tr -d '[:space:]')
BITBUCKET_ACCESS_TOKEN=$(echo -n "${BITBUCKET_ACCESS_TOKEN}" | tr -d '[:space:]')
SLACK_BOT_TOKEN=$(echo -n "${SLACK_BOT_TOKEN}" | tr -d '[:space:]')
GITHUB_TOKEN=$(echo -n "${GITHUB_TOKEN}" | tr -d '[:space:]')

# ==============================================================================
# Helper Functions - Jira
# ==============================================================================

# Test if Jira credentials are configured
function jira_is_configured() {
    if [ -z "$ATLASSIAN_API_TOKEN" ] || [ -z "$ATLASSIAN_EMAIL" ]; then
        return 1
    fi
    return 0
}

# Get issue details
# Usage: jira_get_issue "CORE-1234"
function jira_get_issue() {
    local issue_key=$1
    if ! jira_is_configured; then
        echo "Error: Jira credentials not configured"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        "https://carefeed.atlassian.net/rest/api/3/issue/${issue_key}"
}

# Search issues using JQL
# Usage: jira_search "project=CORE AND assignee=currentUser()" 10
function jira_search() {
    local jql=$1
    local max_results=${2:-50}

    if ! jira_is_configured; then
        echo "Error: Jira credentials not configured"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -X POST \
        -d "{\"jql\":\"${jql}\",\"maxResults\":${max_results}}" \
        "https://carefeed.atlassian.net/rest/api/3/search/jql"
}

# Get current user info
function jira_whoami() {
    if ! jira_is_configured; then
        echo "Error: Jira credentials not configured"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        "https://carefeed.atlassian.net/rest/api/3/myself"
}

# ==============================================================================
# Helper Functions - Confluence
# ==============================================================================

# Test if Confluence credentials are configured
function confluence_is_configured() {
    if [ -z "$ATLASSIAN_API_TOKEN" ] || [ -z "$ATLASSIAN_EMAIL" ]; then
        return 1
    fi
    return 0
}

# Search Confluence pages
# Usage: confluence_search "database migration"
function confluence_search() {
    local query=$1
    local limit=${2:-25}

    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        --get --data-urlencode "cql=text ~ \"${query}\"" \
        --data-urlencode "limit=${limit}" \
        "https://carefeed.atlassian.net/wiki/rest/api/content/search"
}

# ==============================================================================
# Helper Functions - Bitbucket
# ==============================================================================

# Test if Bitbucket credentials are configured
function bitbucket_is_configured() {
    # Support both new Access Tokens and legacy App Passwords
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"
    if [ -z "$bitbucket_token" ] || [ -z "$BITBUCKET_USERNAME" ]; then
        return 1
    fi
    return 0
}

# List pull requests
# Usage: bitbucket_list_prs "portal_dev"
function bitbucket_list_prs() {
    local repo=${1:-portal_dev}
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        -H "Accept: application/json" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests"
}

# Create a pull request
# Usage: bitbucket_create_pr "portal_dev" "feature-branch" "master" "PR Title" "PR Description"
function bitbucket_create_pr() {
    local repo=$1
    local source_branch=$2
    local dest_branch=$3
    local title=$4
    local description=$5
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if [ -z "$repo" ] || [ -z "$source_branch" ] || [ -z "$dest_branch" ] || [ -z "$title" ]; then
        echo "Usage: bitbucket_create_pr <repo> <source_branch> <dest_branch> <title> [description]"
        echo "Example: bitbucket_create_pr \"portal_dev\" \"feature/new-feature\" \"master\" \"Add new feature\" \"Description here\""
        return 1
    fi

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    # Escape quotes in description for JSON
    local escaped_description=$(echo "$description" | jq -Rs .)

    curl -s -X POST \
        -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"${title}\",
            \"source\": {
                \"branch\": {
                    \"name\": \"${source_branch}\"
                }
            },
            \"destination\": {
                \"branch\": {
                    \"name\": \"${dest_branch}\"
                }
            },
            \"description\": ${escaped_description},
            \"close_source_branch\": false
        }" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests"
}

# ==============================================================================
# Status Check
# ==============================================================================

# Check which integrations are configured
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
# Helper Functions - Sentry
# ==============================================================================

# Test if Sentry credentials are configured
function sentry_is_configured() {
    if [ -z "$SENTRY_API_TOKEN" ]; then
        return 1
    fi
    return 0
}

# Test Sentry API connection
# Usage: sentry_whoami
function sentry_whoami() {
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/"
}

# Get organizations
# Usage: sentry_list_orgs
function sentry_list_orgs() {
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/organizations/"
}

# Get projects for an organization
# Usage: sentry_list_projects "carefeed"
function sentry_list_projects() {
    local org=$1
    if [ -z "$org" ]; then
        echo "Usage: sentry_list_projects <organization>"
        return 1
    fi
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/organizations/${org}/projects/"
}

# Get recent issues for a project
# Usage: sentry_list_issues "carefeed" "portal-dev"
# Usage: sentry_list_issues "carefeed" "portal-dev" "is:unresolved"
function sentry_list_issues() {
    local org=$1
    local project=$2
    local query=${3:-"is:unresolved"}

    if [ -z "$org" ] || [ -z "$project" ]; then
        echo "Usage: sentry_list_issues <organization> <project> [query]"
        return 1
    fi
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/projects/${org}/${project}/issues/?query=${query}"
}

# Get issue details by ID
# Usage: sentry_get_issue "carefeed" "portal-dev" "12345"
function sentry_get_issue() {
    local org=$1
    local project=$2
    local issue_id=$3

    if [ -z "$org" ] || [ -z "$project" ] || [ -z "$issue_id" ]; then
        echo "Usage: sentry_get_issue <organization> <project> <issue_id>"
        return 1
    fi
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/organizations/${org}/issues/${issue_id}/"
}

# Get events for an issue
# Usage: sentry_get_issue_events "12345"
function sentry_get_issue_events() {
    local issue_id=$1

    if [ -z "$issue_id" ]; then
        echo "Usage: sentry_get_issue_events <issue_id>"
        return 1
    fi
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/issues/${issue_id}/events/"
}

# Search issues across organization
# Usage: sentry_search_issues "carefeed" "selectedOrgId"
function sentry_search_issues() {
    local org=$1
    local search_term=$2

    if [ -z "$org" ] || [ -z "$search_term" ]; then
        echo "Usage: sentry_search_issues <organization> <search_term>"
        return 1
    fi
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/organizations/${org}/issues/?query=${search_term}"
}

# Get production issues for a project
# Usage: sentry_list_production_issues "carefeed" "portal_dev"
function sentry_list_production_issues() {
    local org=$1
    local project=$2

    if [ -z "$org" ] || [ -z "$project" ]; then
        echo "Usage: sentry_list_production_issues <organization> <project>"
        return 1
    fi
    if ! sentry_is_configured; then
        echo "Error: Sentry credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: Bearer ${SENTRY_API_TOKEN}" \
        "https://sentry.io/api/0/projects/${org}/${project}/issues/?query=environment:production"
}

# ==============================================================================
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
    if [[ "$OSTYPE" == "darwin"* ]]; then
        date -j -f "%Y-%m-%d %H:%M:%S" "$time_str" +%s 2>/dev/null || \
        date -j -f "%Y-%m-%d" "$time_str" +%s 2>/dev/null
    else
        date -u -d "$time_str" +%s 2>/dev/null
    fi
}

