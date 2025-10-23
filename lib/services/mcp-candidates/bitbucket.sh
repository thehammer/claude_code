#!/bin/bash
# Bitbucket Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

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
# Usage: bitbucket_list_prs [repo] [state] [limit]
#   repo: Repository name (default: auto-detect from git remote, fallback to "portal_dev")
#   state: "OPEN", "MERGED", "DECLINED", or "SUPERSEDED" (default: all states)
#   limit: Page size per request (default: 50, max: 50) - function fetches ALL pages automatically
# Examples:
#   bitbucket_list_prs                    # Auto-detect repo, all states, fetches all pages
#   bitbucket_list_prs "portal_dev"       # Specific repo, all states, fetches all pages
#   bitbucket_list_prs "" "OPEN"          # Auto-detect repo, only open PRs, fetches all pages
#   bitbucket_list_prs "" "OPEN" 50       # Auto-detect repo, open PRs, 50 per page
#   bitbucket_list_prs "portal_dev" "OPEN" 20  # Specific repo, open PRs, 20 per page
function bitbucket_list_prs() {
    local repo="${1}"
    local state="${2}"
    local limit="${3:-50}"
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    # Auto-detect repo from git remote if not specified
    if [ -z "$repo" ]; then
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -n "$remote_url" ]; then
            repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        else
            repo="portal_dev"  # Fallback default
        fi
    fi

    # Bitbucket API has issues with pagelen > 50, limit to 50
    if [ "$limit" -gt 50 ]; then
        limit=50
    fi

    # Build query parameters
    local query_params="pagelen=${limit}"
    if [ -n "$state" ]; then
        query_params="${query_params}&state=${state}"
    fi

    # Fetch ALL pages and combine results
    local all_values="[]"
    local url="https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests?${query_params}"

    while [ -n "$url" ]; do
        local response=$(curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
            -H "Accept: application/json" \
            "$url")

        # Extract values from this page
        local page_values=$(echo "$response" | jq -r '.values // []')

        # Merge with accumulated values
        all_values=$(jq -n --argjson all "$all_values" --argjson page "$page_values" '$all + $page')

        # Get next page URL (null if no more pages)
        url=$(echo "$response" | jq -r '.next // empty')
    done

    # Return combined result in original format
    jq -n --argjson values "$all_values" '{values: $values}'
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

# Get PR comments/activity
# Usage: bitbucket_get_pr_comments <pr_id>
#    or: bitbucket_get_pr_comments <repo> <pr_id>
function bitbucket_get_pr_comments() {
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
        echo "Usage: bitbucket_get_pr_comments <pr_id>"
        echo "   or: bitbucket_get_pr_comments <repo> <pr_id>"
        return 1
    fi

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pullrequests/${pr_id}/comments"
}

# Get pipeline details
# Usage: bitbucket_get_pipeline <pipeline_id>
#    or: bitbucket_get_pipeline <repo> <pipeline_id>
function bitbucket_get_pipeline() {
    local repo pipeline_id
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    if [ $# -eq 1 ]; then
        # Auto-detect repo from git remote
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        pipeline_id=$1
    else
        repo=$1
        pipeline_id=$2
    fi

    curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        -H "Accept: application/json" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pipelines/${pipeline_id}"
}

# Get pipeline step URL for browser viewing
# Usage: bitbucket_get_step_url <pipeline_id> [step_name_pattern]
#    or: bitbucket_get_step_url <repo> <pipeline_id> [step_name_pattern]
# Example: bitbucket_get_step_url 13906 "PHP Test"
# Example: bitbucket_get_step_url 13906  (shows all steps)
function bitbucket_get_step_url() {
    local repo pipeline_id step_pattern
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"

    if ! bitbucket_is_configured; then
        echo "Error: Bitbucket credentials not configured"
        return 1
    fi

    if [ $# -eq 1 ]; then
        # Auto-detect repo, show all steps
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        pipeline_id=$1
        step_pattern=""
    elif [ $# -eq 2 ]; then
        # Auto-detect repo from git remote
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
        pipeline_id=$1
        step_pattern=$2
    else
        repo=$1
        pipeline_id=$2
        step_pattern=$3
    fi

    # Get all steps
    local steps=$(curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
        -H "Accept: application/json" \
        "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pipelines/${pipeline_id}/steps/")

    if [ -z "$steps" ] || ! echo "$steps" | jq -e '.values' >/dev/null 2>&1; then
        echo "Error: Failed to fetch pipeline steps or invalid response"
        return 1
    fi

    # If no pattern, show all steps with URLs
    if [ -z "$step_pattern" ]; then
        echo "Pipeline #${pipeline_id} steps:"
        echo ""
        while IFS='|' read -r status name uuid; do
            local color=""
            case "$status" in
                SUCCESSFUL) color="\033[32m" ;; # green
                FAILED) color="\033[31m" ;; # red
                *) color="\033[33m" ;; # yellow
            esac
            local uuid_encoded=$(echo "$uuid" | jq -rR '@uri')
            echo -e "${color}${status}\033[0m ${name}"
            echo "   https://bitbucket.org/Bitbucketpassword1/${repo}/pipelines/results/${pipeline_id}/steps/${uuid_encoded}"
            echo ""
        done < <(echo "$steps" | jq -r '.values[] | (.state.result.name // .state.name) + "|" + .name + "|" + .uuid')
        return 0
    fi

    # Find matching step
    local step_uuid=$(echo "$steps" | jq -r ".values[] | select(.name | test(\"${step_pattern}\"; \"i\")) | .uuid")
    local step_name=$(echo "$steps" | jq -r ".values[] | select(.name | test(\"${step_pattern}\"; \"i\")) | .name")
    local step_status=$(echo "$steps" | jq -r ".values[] | select(.name | test(\"${step_pattern}\"; \"i\")) | .state.result.name // .state.name")

    if [ -z "$step_uuid" ]; then
        echo "Error: No step found matching pattern '${step_pattern}'"
        echo ""
        echo "Available steps:"
        echo "$steps" | jq -r '.values[] | "  [\(.state.result.name // .state.name)] \(.name)"'
        return 1
    fi

    # URL encode the UUID (which includes curly braces)
    # jq's @uri handles this automatically
    local step_uuid_encoded=$(echo "$step_uuid" | jq -rR '@uri')
    local step_url="https://bitbucket.org/Bitbucketpassword1/${repo}/pipelines/results/${pipeline_id}/steps/${step_uuid_encoded}"

    echo "Step: ${step_name}"
    echo "Status: ${step_status}"
    echo "URL: ${step_url}"
    echo ""
    echo "💡 Note: Bitbucket API v2 doesn't expose step logs programmatically."
    echo "   You must view logs in your browser using the URL above."
}

# Alias for backwards compatibility
function bitbucket_get_pipeline_logs() {
    bitbucket_get_step_url "$@"
}

# Note: list_all_open_prs has been moved to ~/.claude/lib/core/utilities.sh
# It's a cross-service aggregator that combines results from multiple sources

# ==============================================================================
# Helper Functions - GitHub
