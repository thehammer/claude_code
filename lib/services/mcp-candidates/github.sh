#!/bin/bash
# GitHub Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

# Helper Functions - GitHub
# ==============================================================================

# Test if GitHub credentials are configured
function github_is_configured() {
    if [ -z "$GITHUB_TOKEN" ]; then
        return 1
    fi
    return 0
}

# Test GitHub API connection
# Usage: github_whoami
function github_whoami() {
    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/user"
}

# List pull requests for a repository
# Usage: github_list_prs [owner/repo] [state]
# state: open, closed, all (default: open)
# If owner/repo not provided, auto-detect from git remote
function github_list_prs() {
    local repo_full=$1
    local state=${2:-open}

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    # If no repo provided, try to detect from git remote
    if [ -z "$repo_full" ]; then
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            echo "Usage: github_list_prs [owner/repo] [state]"
            echo "Example: github_list_prs \"anthropics/claude-code\" open"
            return 1
        fi

        # Extract owner/repo from GitHub URL (works for both SSH and HTTPS)
        # SSH: git@github.com:owner/repo.git
        # HTTPS: https://github.com/owner/repo.git
        repo_full=$(echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|')

        if [ -z "$repo_full" ]; then
            echo "Error: Could not extract repository from remote URL: $remote_url"
            return 1
        fi
    fi

    curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/${repo_full}/pulls?state=${state}&per_page=100"
}

# Get details of a specific pull request
# Usage: github_get_pr [owner/repo] <pr_number>
#    or: github_get_pr <pr_number> (auto-detect repo)
function github_get_pr() {
    local repo_full pr_number

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    # Parse arguments
    if [ $# -eq 1 ]; then
        # Auto-detect repo
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            echo "Usage: github_get_pr <pr_number>"
            echo "   or: github_get_pr <owner/repo> <pr_number>"
            return 1
        fi
        repo_full=$(echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|')
        pr_number=$1
    else
        repo_full=$1
        pr_number=$2
    fi

    if [ -z "$pr_number" ]; then
        echo "Usage: github_get_pr <pr_number>"
        echo "   or: github_get_pr <owner/repo> <pr_number>"
        return 1
    fi

    curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/${repo_full}/pulls/${pr_number}"
}

# Create a pull request
# Usage: github_create_pr <head_branch> <base_branch> <title> [description]
#    or: github_create_pr <owner/repo> <head_branch> <base_branch> <title> [description]
function github_create_pr() {
    local repo_full head_branch base_branch title description

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    # Parse arguments - determine if repo was provided
    if [ $# -eq 4 ] || [ $# -eq 3 ]; then
        # Auto-detect repo from git remote
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo_full=$(echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|')
        head_branch=$1
        base_branch=$2
        title=$3
        description=$4
    else
        # Explicit repo provided
        repo_full=$1
        head_branch=$2
        base_branch=$3
        title=$4
        description=$5
    fi

    if [ -z "$head_branch" ] || [ -z "$base_branch" ] || [ -z "$title" ]; then
        echo "Usage: github_create_pr <head_branch> <base_branch> <title> [description]"
        echo "   or: github_create_pr <owner/repo> <head_branch> <base_branch> <title> [description]"
        echo "Example: github_create_pr \"feature-branch\" \"main\" \"Add new feature\" \"Description here\""
        return 1
    fi

    # Build JSON payload
    local json_payload=$(jq -n \
        --arg head "$head_branch" \
        --arg base "$base_branch" \
        --arg title "$title" \
        --arg body "${description:-}" \
        '{
            head: $head,
            base: $base,
            title: $title,
            body: $body
        }')

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "https://api.github.com/repos/${repo_full}/pulls")

    local http_code=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✅ Pull request created successfully!"
        echo "$body" | jq -r '"PR #\(.number): \(.title)\nURL: \(.html_url)"'
        return 0
    else
        echo "❌ Failed to create pull request (HTTP $http_code)"
        echo "$body" | jq -r '.message // .error // .'
        return 1
    fi
}

# Update an existing pull request
# Usage: github_update_pr <pr_number> [title] [body] [state]
#    or: github_update_pr <owner/repo> <pr_number> [title] [body] [state]
# state: open, closed
function github_update_pr() {
    local repo_full pr_number title body state

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    # Parse arguments
    if [ $# -ge 1 ] && ! [[ "$1" == *"/"* ]]; then
        # Auto-detect repo
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo_full=$(echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|')
        pr_number=$1
        title=$2
        body=$3
        state=$4
    else
        repo_full=$1
        pr_number=$2
        title=$3
        body=$4
        state=$5
    fi

    if [ -z "$pr_number" ]; then
        echo "Usage: github_update_pr <pr_number> [title] [body] [state]"
        echo "   or: github_update_pr <owner/repo> <pr_number> [title] [body] [state]"
        echo "Example: github_update_pr 123 \"New title\" \"New body\""
        return 1
    fi

    # Build JSON payload with only provided fields
    local json_parts=()
    [ -n "$title" ] && json_parts+=("\"title\": $(echo "$title" | jq -Rs .)")
    [ -n "$body" ] && json_parts+=("\"body\": $(echo "$body" | jq -Rs .)")
    [ -n "$state" ] && json_parts+=("\"state\": \"$state\"")

    local json_payload="{$(IFS=,; echo "${json_parts[*]}")}"

    local response=$(curl -s -w "\n%{http_code}" -X PATCH \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "https://api.github.com/repos/${repo_full}/pulls/${pr_number}")

    local http_code=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "✅ Pull request #${pr_number} updated successfully!"
        echo "$body" | jq -r '"PR #\(.number): \(.title)\nURL: \(.html_url)"'
        return 0
    else
        echo "❌ Failed to update pull request (HTTP $http_code)"
        echo "$body" | jq -r '.message // .error // .'
        return 1
    fi
}

# Get PR comments
# Usage: github_get_pr_comments <pr_number>
#    or: github_get_pr_comments <owner/repo> <pr_number>
function github_get_pr_comments() {
    local repo_full pr_number

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    # Parse arguments
    if [ $# -eq 1 ]; then
        # Auto-detect repo
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo_full=$(echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|')
        pr_number=$1
    else
        repo_full=$1
        pr_number=$2
    fi

    if [ -z "$pr_number" ]; then
        echo "Usage: github_get_pr_comments <pr_number>"
        echo "   or: github_get_pr_comments <owner/repo> <pr_number>"
        return 1
    fi

    curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/${repo_full}/issues/${pr_number}/comments"
}

# Get PR reviews
# Usage: github_get_pr_reviews <pr_number>
#    or: github_get_pr_reviews <owner/repo> <pr_number>
function github_get_pr_reviews() {
    local repo_full pr_number

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    # Parse arguments
    if [ $# -eq 1 ]; then
        # Auto-detect repo
        local remote_url=$(git config --get remote.origin.url 2>/dev/null)
        if [ -z "$remote_url" ]; then
            echo "Error: Not in a git repository or no origin remote configured"
            return 1
        fi
        repo_full=$(echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|')
        pr_number=$1
    else
        repo_full=$1
        pr_number=$2
    fi

    if [ -z "$pr_number" ]; then
        echo "Usage: github_get_pr_reviews <pr_number>"
        echo "   or: github_get_pr_reviews <owner/repo> <pr_number>"
        return 1
    fi

    curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/${repo_full}/pulls/${pr_number}/reviews"
}

# List repositories for authenticated user
# Usage: github_list_repos [type] [sort]
# type: all, owner, public, private, member (default: owner)
# sort: created, updated, pushed, full_name (default: updated)
function github_list_repos() {
    local type=${1:-owner}
    local sort=${2:-updated}

    if ! github_is_configured; then
        echo "Error: GitHub credentials not configured"
        return 1
    fi

    curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/user/repos?type=${type}&sort=${sort}&per_page=100"
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
