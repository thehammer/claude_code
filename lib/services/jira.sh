#!/bin/bash
# Jira REST API helpers (curl-based, no MCP dependency)
#
# Requires credentials loaded from ~/.claude/credentials/.env:
#   ATLASSIAN_SITE_NAME, ATLASSIAN_USER_EMAIL, ATLASSIAN_API_TOKEN
#
# Usage:
#   source ~/.claude/lib/core/credentials.sh
#   source ~/.claude/lib/services/jira.sh

# ==============================================================================
# Base request function
# ==============================================================================

# Make authenticated Jira API request
# Usage: jira_request GET "/rest/api/2/issue/CORE-123"
#        jira_request POST "/rest/api/2/issue" '{"fields":{...}}'
function jira_request() {
    local method="${1:?Usage: jira_request METHOD PATH [BODY]}"
    local path="$2"
    local body="$3"

    if [ -z "$ATLASSIAN_SITE_NAME" ] || [ -z "$ATLASSIAN_USER_EMAIL" ] || [ -z "$ATLASSIAN_API_TOKEN" ]; then
        echo '{"error":"Missing Jira credentials. Source ~/.claude/lib/core/credentials.sh first."}' >&2
        return 1
    fi

    local url="https://${ATLASSIAN_SITE_NAME}${path}"
    local auth="${ATLASSIAN_USER_EMAIL}:${ATLASSIAN_API_TOKEN}"

    local -a curl_args=(
        -s -X "$method"
        -u "$auth"
        -H "Content-Type: application/json"
        -H "Accept: application/json"
    )

    if [ -n "$body" ]; then
        curl_args+=(-d "$body")
    fi

    curl "${curl_args[@]}" "$url"
}

# ==============================================================================
# Project operations
# ==============================================================================

# List all projects
function jira_list_projects() {
    jira_request GET "/rest/api/2/project" | jq -r '.[] | "\(.key)\t\(.name)"'
}

# Get project details
# Usage: jira_get_project "CORE"
function jira_get_project() {
    local key="${1:?Usage: jira_get_project PROJECT_KEY}"
    jira_request GET "/rest/api/2/project/$key"
}

# Get issue creation metadata for a project
# Usage: jira_get_create_meta "CORE"
function jira_get_create_meta() {
    local key="${1:?Usage: jira_get_create_meta PROJECT_KEY}"
    jira_request GET "/rest/api/2/issue/createmeta?projectKeys=$key&expand=projects.issuetypes.fields"
}

# ==============================================================================
# Issue operations
# ==============================================================================

# Search issues with JQL
# Usage: jira_search "project = CORE AND status = 'In Progress'" [max_results]
function jira_search() {
    local jql="${1:?Usage: jira_search JQL [MAX_RESULTS]}"
    local max="${2:-50}"
    local encoded_jql
    encoded_jql=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$jql'))" 2>/dev/null)

    jira_request GET "/rest/api/2/search?jql=${encoded_jql}&maxResults=${max}&fields=summary,status,assignee,priority,issuetype,parent"
}

# Get a single issue
# Usage: jira_get_issue "CORE-123"
function jira_get_issue() {
    local key="${1:?Usage: jira_get_issue ISSUE_KEY}"
    jira_request GET "/rest/api/2/issue/$key"
}

# Create an issue
# Usage: jira_create_issue '{"fields":{"project":{"key":"CORE"},"summary":"...","issuetype":{"id":"10015"}}}'
function jira_create_issue() {
    local body="${1:?Usage: jira_create_issue JSON_BODY}"
    jira_request POST "/rest/api/2/issue" "$body"
}

# Update an issue
# Usage: jira_update_issue "CORE-123" '{"fields":{"summary":"Updated"}}'
function jira_update_issue() {
    local key="${1:?Usage: jira_update_issue ISSUE_KEY JSON_BODY}"
    local body="$2"
    jira_request PUT "/rest/api/2/issue/$key" "$body"
}

# ==============================================================================
# Transitions & status
# ==============================================================================

# Get available transitions for an issue
# Usage: jira_get_transitions "CORE-123"
function jira_get_transitions() {
    local key="${1:?Usage: jira_get_transitions ISSUE_KEY}"
    jira_request GET "/rest/api/2/issue/$key/transitions"
}

# Transition an issue
# Usage: jira_transition_issue "CORE-123" "31"  (by transition ID)
#        jira_transition_issue "CORE-123" "In Progress"  (by name - looks up ID)
function jira_transition_issue() {
    local key="${1:?Usage: jira_transition_issue ISSUE_KEY TRANSITION_ID_OR_NAME}"
    local transition="$2"

    # If not numeric, look up transition ID by name
    if ! [[ "$transition" =~ ^[0-9]+$ ]]; then
        local transitions_json
        transitions_json=$(jira_get_transitions "$key")
        local tid
        tid=$(echo "$transitions_json" | jq -r --arg name "$transition" '.transitions[] | select(.name == $name) | .id' | head -1)
        if [ -z "$tid" ]; then
            echo "Error: Transition '$transition' not found. Available:" >&2
            echo "$transitions_json" | jq -r '.transitions[] | "  \(.id): \(.name)"' >&2
            return 1
        fi
        transition="$tid"
    fi

    jira_request POST "/rest/api/2/issue/$key/transitions" "{\"transition\":{\"id\":\"$transition\"}}"
}

# List all statuses
function jira_list_statuses() {
    jira_request GET "/rest/api/2/status" | jq -r '.[] | "\(.id)\t\(.name)\t\(.statusCategory.name)"'
}

# ==============================================================================
# Comments
# ==============================================================================

# List comments on an issue
# Usage: jira_list_comments "CORE-123"
function jira_list_comments() {
    local key="${1:?Usage: jira_list_comments ISSUE_KEY}"
    jira_request GET "/rest/api/2/issue/$key/comment"
}

# Add a comment to an issue
# Usage: jira_add_comment "CORE-123" "This is my comment"
function jira_add_comment() {
    local key="${1:?Usage: jira_add_comment ISSUE_KEY COMMENT_TEXT}"
    local text="$2"
    local body
    body=$(jq -n --arg body "$text" '{"body": $body}')
    jira_request POST "/rest/api/2/issue/$key/comment" "$body"
}

# ==============================================================================
# Convenience functions
# ==============================================================================

# Compact issue summary (for display)
# Usage: jira_search "project = CORE" | jira_format_issues
function jira_format_issues() {
    jq -r '.issues[] | "\(.key)\t\(.fields.status.name)\t\(.fields.priority.name // "-")\t\(.fields.assignee.displayName // "Unassigned")\t\(.fields.summary)"'
}
