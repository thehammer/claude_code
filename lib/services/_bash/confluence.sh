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

# Get a Confluence page by ID
# Usage: confluence_get_page "123456789"
# Usage: confluence_get_page "123456789" "body.storage,version,ancestors"
function confluence_get_page() {
    local page_id=$1
    local expand=${2:-"version,ancestors"}

    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    if [ -z "$page_id" ]; then
        echo "Error: Page ID required"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        "https://carefeed.atlassian.net/wiki/api/v2/pages/${page_id}?body-format=storage&expand=${expand}"
}

# Get page ID from URL or title
# Usage: confluence_get_page_id "https://carefeed.atlassian.net/wiki/spaces/ENG/pages/123456789/Page+Title"
# Usage: confluence_get_page_id "ENG" "Page Title"  (space key + title)
function confluence_get_page_id() {
    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    # If it looks like a URL, extract the page ID
    if [[ "$1" =~ pages/([0-9]+) ]]; then
        echo "${BASH_REMATCH[1]}"
        return 0
    fi

    # Otherwise treat as space key + title lookup
    local space_key=$1
    local title=$2

    if [ -z "$space_key" ] || [ -z "$title" ]; then
        echo "Error: Provide URL, or space key + title"
        return 1
    fi

    local result
    result=$(curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        --get --data-urlencode "spaceKey=${space_key}" \
        --data-urlencode "title=${title}" \
        "https://carefeed.atlassian.net/wiki/rest/api/content")

    echo "$result" | jq -r '.results[0].id // empty'
}

# List child pages of a parent page
# Usage: confluence_list_children "123456789"
# Usage: confluence_list_children "123456789" 50
function confluence_list_children() {
    local parent_id=$1
    local limit=${2:-25}

    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    if [ -z "$parent_id" ]; then
        echo "Error: Parent page ID required"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        "https://carefeed.atlassian.net/wiki/api/v2/pages/${parent_id}/children?limit=${limit}"
}

# Move a page to a new parent
# Usage: confluence_move_page "page_id" "new_parent_id"
function confluence_move_page() {
    local page_id=$1
    local new_parent_id=$2

    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    if [ -z "$page_id" ] || [ -z "$new_parent_id" ]; then
        echo "Error: Page ID and new parent ID required"
        return 1
    fi

    # First get the current page to retrieve version and other required fields
    local current_page
    current_page=$(confluence_get_page "$page_id" "version")

    if [ -z "$current_page" ] || [ "$current_page" = "null" ]; then
        echo "Error: Could not fetch page $page_id"
        return 1
    fi

    local title version space_id status
    title=$(echo "$current_page" | jq -r '.title')
    version=$(echo "$current_page" | jq -r '.version.number')
    space_id=$(echo "$current_page" | jq -r '.spaceId')
    status=$(echo "$current_page" | jq -r '.status')

    # Increment version for update
    local new_version=$((version + 1))

    # Build update payload
    local payload
    payload=$(jq -n \
        --arg id "$page_id" \
        --arg title "$title" \
        --arg parentId "$new_parent_id" \
        --arg spaceId "$space_id" \
        --arg status "$status" \
        --argjson version "$new_version" \
        '{
            id: $id,
            title: $title,
            spaceId: $spaceId,
            status: $status,
            parentId: $parentId,
            version: {
                number: $version,
                message: "Moved page via API"
            }
        }')

    # Update the page with new parent
    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -X PUT \
        -d "$payload" \
        "https://carefeed.atlassian.net/wiki/api/v2/pages/${page_id}"
}

# Move multiple pages to a new parent
# Usage: confluence_move_pages_bulk "new_parent_id" "page_id1" "page_id2" "page_id3"
# Usage: echo "id1 id2 id3" | confluence_move_pages_bulk "new_parent_id"
function confluence_move_pages_bulk() {
    local new_parent_id=$1
    shift

    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    if [ -z "$new_parent_id" ]; then
        echo "Error: New parent ID required"
        return 1
    fi

    local page_ids=("$@")

    # If no args, read from stdin
    if [ ${#page_ids[@]} -eq 0 ]; then
        while read -r line; do
            for id in $line; do
                page_ids+=("$id")
            done
        done
    fi

    if [ ${#page_ids[@]} -eq 0 ]; then
        echo "Error: No page IDs provided"
        return 1
    fi

    local total=${#page_ids[@]}
    local success=0
    local failed=0

    echo "Moving $total pages to parent $new_parent_id..."
    echo ""

    for page_id in "${page_ids[@]}"; do
        echo -n "Moving page $page_id... "

        local result
        result=$(confluence_move_page "$page_id" "$new_parent_id" 2>&1)

        if echo "$result" | jq -e '.id' > /dev/null 2>&1; then
            local title
            title=$(echo "$result" | jq -r '.title')
            echo "✓ $title"
            ((success++))
        else
            local error
            error=$(echo "$result" | jq -r '.message // .errors[0].message // "Unknown error"' 2>/dev/null || echo "$result")
            echo "✗ Failed: $error"
            ((failed++))
        fi
    done

    echo ""
    echo "Complete: $success succeeded, $failed failed"

    [ $failed -eq 0 ]
}

# List all pages in a space
# Usage: confluence_list_space_pages "ENG"
# Usage: confluence_list_space_pages "ENG" 100
function confluence_list_space_pages() {
    local space_key=$1
    local limit=${2:-25}

    if ! confluence_is_configured; then
        echo "Error: Confluence credentials not configured"
        return 1
    fi

    if [ -z "$space_key" ]; then
        echo "Error: Space key required"
        return 1
    fi

    # First get space ID from space key
    local space_info
    space_info=$(curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        "https://carefeed.atlassian.net/wiki/api/v2/spaces?keys=${space_key}")

    local space_id
    space_id=$(echo "$space_info" | jq -r '.results[0].id // empty')

    if [ -z "$space_id" ]; then
        echo "Error: Space '$space_key' not found"
        return 1
    fi

    curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
        -H "Accept: application/json" \
        "https://carefeed.atlassian.net/wiki/api/v2/spaces/${space_id}/pages?limit=${limit}"
}

# ==============================================================================
# Helper Functions - Bitbucket
