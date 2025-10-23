#!/bin/bash
# Confluence Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

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
