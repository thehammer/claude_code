#!/bin/bash
# Sentry Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

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
