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

# Create a new Jira issue
# Usage: jira_create_issue "CORE" "Bug" "Fix static method call" "Description text" "P2" "Portal" "Production"
function jira_create_issue() {
    local project=$1
    local issue_type=$2
    local summary=$3
    local description=$4
    local priority=${5:-"P2"}
    local component=${6:-"Portal"}  # customfield_10135 - Carefeed Component
    local environment=${7:-"Production"}  # customfield_10275 - Environment

    if ! jira_is_configured; then
        echo "Error: Jira credentials not configured"
        return 1
    fi

    # Build JSON payload using jq for proper JSON construction
    local json_payload=$(jq -n \
        --arg project "$project" \
        --arg issuetype "$issue_type" \
        --arg summary "$summary" \
        --arg description "$description" \
        --arg priority "$priority" \
        --arg component "$component" \
        --arg environment "$environment" \
        '{
            fields: {
                project: { key: $project },
                summary: $summary,
                description: {
                    type: "doc",
                    version: 1,
                    content: [{
                        type: "paragraph",
                        content: [{
                            type: "text",
                            text: $description
                        }]
                    }]
                },
                issuetype: { name: $issuetype },
                priority: { name: $priority },
                customfield_10135: { value: $component },
                customfield_10275: [{ value: $environment }]
            }
        }')

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -X POST \
        -d "${json_payload}" \
        "https://carefeed.atlassian.net/rest/api/3/issue"
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
    # Support two call signatures:
    # 1. bitbucket_create_pr <source_branch> <dest_branch> <title> [description]  (auto-detect repo)
    # 2. bitbucket_create_pr <repo> <source_branch> <dest_branch> <title> [description]  (explicit repo)

    local repo source_branch dest_branch title description

    if [ $# -eq 4 ] || [ $# -eq 3 ]; then
        # Auto-detect repo from git remote
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        # Extract repo name from URL (works for both SSH and HTTPS)
        repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        source_branch=$1
        dest_branch=$2
        title=$3
        description=$4
    else
        # Explicit repo provided
        repo=$1
        source_branch=$2
        dest_branch=$3
        title=$4
        description=$5
    fi

    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if [ -z "$source_branch" ] || [ -z "$dest_branch" ] || [ -z "$title" ]; then
        echo "Usage: bitbucket_create_pr <source_branch> <dest_branch> <title> [description]"
        echo "   or: bitbucket_create_pr <repo> <source_branch> <dest_branch> <title> [description]"
        echo "Example: bitbucket_create_pr \"feature/new-feature\" \"master\" \"Add new feature\" \"Description here\""
        return 1
    fi

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    # Escape quotes in description for JSON
    local escaped_description=$(echo "$description" | jq -Rs .)

    local response=$(curl -s -w "\n%{http_code}" -X POST \
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
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests")

    local http_code=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✅ Pull request created successfully!"
        echo "$body" | jq -r '"PR #\(.id): \(.title)\nURL: \(.links.html.href)"'
        return 0
    else
        echo "❌ Failed to create pull request (HTTP $http_code)"
        echo "$body" | jq -r '.error.message // .error // .'
        return 1
    fi
}

# Update an existing pull request
# Usage: bitbucket_update_pr <pr_id> <title> [description]
#    or: bitbucket_update_pr <repo> <pr_id> <title> [description]
function bitbucket_update_pr() {
    local repo pr_id title description

    if [ $# -eq 2 ] || [ $# -eq 3 ]; then
        # Auto-detect repo from git remote
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        pr_id=$1
        title=$2
        description=$3
    else
        # Explicit repo provided
        repo=$1
        pr_id=$2
        title=$3
        description=$4
    fi

    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if [ -z "$pr_id" ]; then
        echo "Usage: bitbucket_update_pr <pr_id> [title] [description]"
        echo "   or: bitbucket_update_pr <repo> <pr_id> [title] [description]"
        echo "Example: bitbucket_update_pr 3866 \"New title\" \"New description\""
        return 1
    fi

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    # Build JSON payload with only provided fields
    local json_data="{"
    local first=true

    if [ -n "$title" ]; then
        json_data+="\"title\": $(echo "$title" | jq -Rs .)"
        first=false
    fi

    if [ -n "$description" ]; then
        [ "$first" = false ] && json_data+=", "
        json_data+="\"description\": $(echo "$description" | jq -Rs .)"
    fi

    json_data+="}"

    local response=$(curl -s -w "\n%{http_code}" -X PUT \
        -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests/${pr_id}")

    local http_code=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✅ Pull request #${pr_id} updated successfully!"
        echo "$body" | jq -r '"PR #\(.id): \(.title)\nURL: \(.links.html.href)"'
        return 0
    else
        echo "❌ Failed to update pull request (HTTP $http_code)"
        echo "$body" | jq -r '.error.message // .error // .'
        return 1
    fi
}

# Get details of a pull request
# Usage: bitbucket_get_pr <pr_id>
#    or: bitbucket_get_pr <repo> <pr_id>
function bitbucket_get_pr() {
    local repo pr_id

    if [ $# -eq 1 ]; then
        # Auto-detect repo from git remote
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        pr_id=$1
    else
        repo=$1
        pr_id=$2
    fi

    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if [ -z "$pr_id" ]; then
        echo "Usage: bitbucket_get_pr <pr_id>"
        echo "   or: bitbucket_get_pr <repo> <pr_id>"
        return 1
    fi

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests/${pr_id}"
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
# Helper Functions - Slack
# ==============================================================================

# Test if Slack credentials are configured
function slack_is_configured() {
    if [ -z "$SLACK_BOT_TOKEN" ]; then
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

    curl -s -X GET "https://slack.com/api/auth.test" \
        -H "Authorization: Bearer ${SLACK_BOT_TOKEN}"
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

    curl -s -X GET "https://slack.com/api/conversations.list" \
        -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
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

    local params="channel=${channel_id}&limit=${limit}"
    [ -n "$oldest" ] && params="${params}&oldest=${oldest}"
    [ -n "$latest" ] && params="${params}&latest=${latest}"

    curl -s -X GET "https://slack.com/api/conversations.history?${params}" \
        -H "Authorization: Bearer ${SLACK_BOT_TOKEN}"
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

    # URL encode the query
    local encoded_query=$(echo -n "$query" | jq -sRr @uri)

    curl -s -X GET "https://slack.com/api/search.messages" \
        -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
        -d "query=${encoded_query}" \
        -d "count=${count}" \
        -d "page=${page}" \
        -d "highlight=true"
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

    if [[ -z "$SLACK_BOT_TOKEN" ]]; then
        echo "Error: SLACK_BOT_TOKEN not set. Configure in ~/.claude/credentials/.env"
        return 1
    fi

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
        -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
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
        -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
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

    if [[ -z "$SLACK_BOT_TOKEN" ]]; then
        echo "Error: SLACK_BOT_TOKEN not set. Configure in ~/.claude/credentials/.env"
        return 1
    fi

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
        -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
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
# ==============================================================================

# AWS Account Configuration
# Production: 535508986415
# Non-Production: 635039533305
# Shared Services: 851765305742
#
# Available profiles:
# - prod-developers / prod-readonly
# - nonprod-developers / nonprod-readonly
# - shared-developers / shared-readonly

# Check if AWS SSO session is active for a profile
# Usage: aws_is_authenticated "prod-developers"
function aws_is_authenticated() {
    local profile="${1:-prod-developers}"
    aws sts get-caller-identity --profile "$profile" &>/dev/null
}

# Login to AWS SSO (interactive)
# Uses the 'hammer' SSO session which covers all accounts
# Usage: aws_login
function aws_login() {
    echo "🔐 Logging into AWS SSO..."
    aws sso login --sso-session hammer

    if [ $? -eq 0 ]; then
        echo "✅ AWS SSO login successful"
        echo ""
        echo "Available profiles:"
        aws_list_profiles
    else
        echo "❌ AWS SSO login failed"
        return 1
    fi
}

# Get current AWS identity for a profile
# Usage: aws_whoami "prod-developers"
function aws_whoami() {
    local profile="${1:-prod-developers}"

    if ! aws_is_authenticated "$profile"; then
        echo "❌ Not authenticated for profile: $profile"
        echo "Run: aws_login"
        return 1
    fi

    local identity=$(aws sts get-caller-identity --profile "$profile" 2>/dev/null)

    if [ $? -eq 0 ]; then
        echo "AWS Identity for profile: $profile"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$identity" | jq -r '
            "Account: \(.Account)",
            "User/Role: \(.Arn | split("/")[-1])",
            "ARN: \(.Arn)"
        '
    else
        echo "❌ Failed to get identity for profile: $profile"
        return 1
    fi
}

# Smart AWS command wrapper - auto-login if needed
# Usage: aws_exec "prod-developers" s3 ls
function aws_exec() {
    local profile="$1"
    shift

    if [ -z "$profile" ]; then
        echo "❌ Error: Profile required"
        echo "Usage: aws_exec <profile> <aws-command>"
        echo ""
        echo "Available profiles:"
        aws_list_profiles
        return 1
    fi

    # Check authentication
    if ! aws_is_authenticated "$profile"; then
        echo "⚠️  Not authenticated for profile: $profile"
        echo "Running AWS SSO login..."
        aws sso login --sso-session hammer

        if [ $? -ne 0 ]; then
            echo "❌ AWS SSO login failed"
            return 1
        fi
    fi

    # Execute AWS command with profile
    aws --profile "$profile" "$@"
}

# List available AWS profiles (semantic names only)
# Usage: aws_list_profiles
function aws_list_profiles() {
    echo "Production Account (535508986415):"
    echo "  • prod-developers"
    echo "  • prod-readonly"
    echo ""
    echo "Non-Production Account (635039533305):"
    echo "  • nonprod-developers"
    echo "  • nonprod-readonly"
    echo ""
    echo "Shared Services Account (851765305742):"
    echo "  • shared-developers"
    echo "  • shared-readonly"
}

# Interactive profile selector
# Usage: profile=$(aws_select_profile)
function aws_select_profile() {
    local profiles=(
        "prod-developers"
        "prod-readonly"
        "nonprod-developers"
        "nonprod-readonly"
        "shared-developers"
        "shared-readonly"
    )

    echo "Select AWS profile:"
    echo ""
    PS3="Enter choice (1-6): "
    select profile in "${profiles[@]}"; do
        if [ -n "$profile" ]; then
            echo "$profile"
            return 0
        else
            echo "Invalid selection"
        fi
    done
}

# Get account name from profile
# Usage: aws_get_account_name "prod-developers"
function aws_get_account_name() {
    local profile="$1"

    case "$profile" in
        prod-*)
            echo "Production"
            ;;
        nonprod-*)
            echo "Non-Production"
            ;;
        shared-*)
            echo "Shared Services"
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Get account ID from profile
# Usage: aws_get_account_id "prod-developers"
function aws_get_account_id() {
    local profile="$1"

    case "$profile" in
        prod-*)
            echo "535508986415"
            ;;
        nonprod-*)
            echo "635039533305"
            ;;
        shared-*)
            echo "851765305742"
            ;;
        *)
            echo ""
            return 1
            ;;
    esac
}

# Check AWS SSO session status
# Usage: aws_status
function aws_status() {
    echo "AWS SSO Session Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    local has_active_session=false

    # Check each profile
    for profile in prod-developers nonprod-developers shared-developers; do
        if aws_is_authenticated "$profile"; then
            if [ "$has_active_session" = false ]; then
                echo "✅ Active SSO session found"
                echo ""
                has_active_session=true
            fi

            local account_name=$(aws_get_account_name "$profile")
            local account_id=$(aws_get_account_id "$profile")
            echo "  • $profile ($account_name - $account_id) ✓"
        fi
    done

    if [ "$has_active_session" = false ]; then
        echo "❌ No active SSO session"
        echo ""
        echo "Run: aws_login"
    fi
}

# ==============================================================================
# Helper Functions - 1Password / Environment Variables
# ==============================================================================

# Invoke 1Password Lambda to update environment files in S3
# Usage: onepass_deploy_env "nonprod-developers" "admin-portal-dev"
function onepass_deploy_env() {
    local aws_profile="$1"
    local config_name="$2"

    if [ -z "$aws_profile" ] || [ -z "$config_name" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_deploy_env <aws-profile> <config-name>"
        echo ""
        echo "Examples:"
        echo "  onepass_deploy_env nonprod-developers admin-portal-dev"
        echo "  onepass_deploy_env prod-developers admin-portal-production"
        echo ""
        echo "Available configs:"
        echo "  admin-portal-dev, admin-portal-production"
        echo "  queue-dev, queue-production"
        echo "  scheduler-dev, scheduler-production"
        return 1
    fi

    local config_file="tools/1password/${config_name}-1pass.json"

    if [ ! -f "$config_file" ]; then
        echo "❌ Error: Config file not found: $config_file"
        return 1
    fi

    echo "🔐 Deploying environment variables for: $config_name"
    echo "Using config: $config_file"
    echo ""

    aws_exec "$aws_profile" lambda invoke \
        --function-name 1password-env-writer \
        /tmp/1pass-response.json \
        --payload file://"$config_file" \
        --cli-binary-format raw-in-base64-out

    echo ""
    echo "Lambda response:"
    cat /tmp/1pass-response.json | jq -C '.'

    # Check if successful
    if jq -e '.statusCode==200 and .errorMessage==null' /tmp/1pass-response.json >/dev/null 2>&1; then
        echo ""
        echo "✅ Successfully deployed $config_name environment variables"
        rm /tmp/1pass-response.json
        return 0
    else
        echo ""
        echo "❌ Lambda execution failed for $config_name"
        echo "See response above for details"
        return 1
    fi
}

# Deploy all dev environment variables
# Usage: onepass_deploy_all_dev
function onepass_deploy_all_dev() {
    echo "🔐 Deploying all DEV environment variables..."
    echo ""

    local configs=("admin-portal-dev" "queue-dev" "scheduler-dev")
    local failed=0

    for config in "${configs[@]}"; do
        if ! onepass_deploy_env "nonprod-developers" "$config"; then
            ((failed++))
        fi
        echo ""
    done

    if [ $failed -eq 0 ]; then
        echo "✅ All dev environment variables deployed successfully"
        return 0
    else
        echo "❌ $failed deployment(s) failed"
        return 1
    fi
}

# Deploy all production environment variables
# Usage: onepass_deploy_all_prod
function onepass_deploy_all_prod() {
    echo "🔐 Deploying all PRODUCTION environment variables..."
    echo "⚠️  WARNING: This will update production environment variables!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        return 1
    fi

    local configs=("admin-portal-production" "queue-production" "scheduler-production")
    local failed=0

    for config in "${configs[@]}"; do
        if ! onepass_deploy_env "prod-developers" "$config"; then
            ((failed++))
        fi
        echo ""
    done

    if [ $failed -eq 0 ]; then
        echo "✅ All production environment variables deployed successfully"
        return 0
    else
        echo "❌ $failed deployment(s) failed"
        return 1
    fi
}

# Download environment file from S3
# Usage: onepass_download_env "nonprod-developers" "portal.env"
function onepass_download_env() {
    local aws_profile="$1"
    local filename="$2"
    local output_file="${3:-.env.downloaded}"

    if [ -z "$aws_profile" ] || [ -z "$filename" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_download_env <aws-profile> <filename> [output-file]"
        echo ""
        echo "Examples:"
        echo "  onepass_download_env nonprod-developers portal.env .env.staging"
        echo "  onepass_download_env prod-developers queue.env .env.prod-queue"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "📥 Downloading $filename from S3..."
    echo "Bucket: $bucket"
    echo "Output: $output_file"
    echo ""

    if aws_exec "$aws_profile" s3 cp "s3://$bucket/$filename" "$output_file"; then
        echo ""
        echo "✅ Downloaded to: $output_file"
        echo ""
        echo "⚠️  Remember to add this file to .gitignore!"
        echo "⚠️  Never commit environment files to git!"
        return 0
    else
        echo ""
        echo "❌ Failed to download $filename"
        return 1
    fi
}

# View environment file from S3 without downloading
# Usage: onepass_view_env "nonprod-developers" "portal.env"
function onepass_view_env() {
    local aws_profile="$1"
    local filename="$2"

    if [ -z "$aws_profile" ] || [ -z "$filename" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_view_env <aws-profile> <filename>"
        echo ""
        echo "Examples:"
        echo "  onepass_view_env nonprod-developers portal.env"
        echo "  onepass_view_env prod-developers queue.env"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "📄 Viewing $filename from S3 bucket: $bucket"
    echo ""

    aws_exec "$aws_profile" s3 cp "s3://$bucket/$filename" - | less
}

# Check if environment file exists in S3 and show metadata
# Usage: onepass_check_env "nonprod-developers" "portal.env"
function onepass_check_env() {
    local aws_profile="$1"
    local filename="$2"

    if [ -z "$aws_profile" ] || [ -z "$filename" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_check_env <aws-profile> <filename>"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "🔍 Checking $filename in S3..."
    echo ""

    aws_exec "$aws_profile" s3 ls "s3://$bucket/$filename" --human-readable
}

# List all environment files in S3
# Usage: onepass_list_env_files "nonprod-developers"
function onepass_list_env_files() {
    local aws_profile="$1"

    if [ -z "$aws_profile" ]; then
        echo "❌ Error: Missing AWS profile"
        echo "Usage: onepass_list_env_files <aws-profile>"
        echo ""
        echo "Examples:"
        echo "  onepass_list_env_files nonprod-developers"
        echo "  onepass_list_env_files prod-developers"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "📂 Environment files in $bucket:"
    echo ""

    aws_exec "$aws_profile" s3 ls "s3://$bucket/" --human-readable
}

# ==============================================================================
# Load Project-Specific Helpers
# ==============================================================================

# Source Carefeed-specific helpers
if [ -f ~/.claude/lib/carefeed.sh ]; then
    source ~/.claude/lib/carefeed.sh
fi

