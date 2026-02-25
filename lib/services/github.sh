#!/bin/bash
# GitHub Helper Functions
# Curl-based GitHub API client for Claude Code agents and skills.
#
# Required env vars (loaded via credentials.sh):
#   GITHUB_TOKEN
#
# Note: For most operations, prefer `gh` CLI which handles auth automatically.
# These functions are useful when gh is not available or for scripting.

# Auto-detect owner/repo from git remote
function _github_detect_repo() {
    local remote_url=$(git config --get remote.origin.url 2>/dev/null)
    if [ -z "$remote_url" ]; then
        return 1
    fi
    echo "$remote_url" | sed -E 's|^.*github\.com[:/]([^/]+/[^/]+)(\.git)?$|\1|'
}

# Core request helper
function github_request() {
    local method=${1:-GET} endpoint=$2
    shift 2
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "Error: GITHUB_TOKEN not set" >&2
        return 1
    fi
    curl -s -X "$method" "https://api.github.com${endpoint}" \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        "$@"
}

# Test connection
function github_validate() {
    local result=$(github_request GET "/user" 2>&1)
    if echo "$result" | jq -e '.login' &>/dev/null; then
        echo "OK: $(echo "$result" | jq -r '.login')"
    else
        echo "Error: $(echo "$result" | jq -r '.message // "connection failed"')" >&2
        return 1
    fi
}

# List pull requests
# Usage: github_list_prs [owner/repo] [state]
function github_list_prs() {
    local repo=${1:-$(_github_detect_repo)} state=${2:-open}
    if [ -z "$repo" ]; then
        echo "Usage: github_list_prs [owner/repo] [state]" >&2
        return 1
    fi
    github_request GET "/repos/${repo}/pulls?state=${state}&per_page=100"
}

# Get a specific PR
# Usage: github_get_pr [owner/repo] <pr_number>
function github_get_pr() {
    local repo pr_number
    if [ $# -eq 1 ]; then
        repo=$(_github_detect_repo)
        pr_number=$1
    else
        repo=$1
        pr_number=$2
    fi
    if [ -z "$repo" ] || [ -z "$pr_number" ]; then
        echo "Usage: github_get_pr [owner/repo] <pr_number>" >&2
        return 1
    fi
    github_request GET "/repos/${repo}/pulls/${pr_number}"
}

# Get PR comments
# Usage: github_get_pr_comments [owner/repo] <pr_number>
function github_get_pr_comments() {
    local repo pr_number
    if [ $# -eq 1 ]; then
        repo=$(_github_detect_repo)
        pr_number=$1
    else
        repo=$1
        pr_number=$2
    fi
    if [ -z "$repo" ] || [ -z "$pr_number" ]; then
        echo "Usage: github_get_pr_comments [owner/repo] <pr_number>" >&2
        return 1
    fi
    github_request GET "/repos/${repo}/issues/${pr_number}/comments"
}

# Get PR reviews
# Usage: github_get_pr_reviews [owner/repo] <pr_number>
function github_get_pr_reviews() {
    local repo pr_number
    if [ $# -eq 1 ]; then
        repo=$(_github_detect_repo)
        pr_number=$1
    else
        repo=$1
        pr_number=$2
    fi
    if [ -z "$repo" ] || [ -z "$pr_number" ]; then
        echo "Usage: github_get_pr_reviews [owner/repo] <pr_number>" >&2
        return 1
    fi
    github_request GET "/repos/${repo}/pulls/${pr_number}/reviews"
}

# List repos for authenticated user
# Usage: github_list_repos [type] [sort]
function github_list_repos() {
    local type=${1:-owner} sort=${2:-updated}
    github_request GET "/user/repos?type=${type}&sort=${sort}&per_page=100"
}

# Format PRs for readable output
function github_format_prs() {
    jq -r '.[] | "#\(.number)\t\(.title)\t\(.user.login)\t\(.updated_at)"'
}
