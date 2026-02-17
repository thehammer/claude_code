#!/bin/bash
# 1Password Helper Functions
#
# Generic 1Password CLI helpers for item/tag management.
# Company-specific config (account, vaults) loaded from layer if available.
#
# Updated: 2025-12-18 - Added op CLI helpers for item/tag management
# Updated: 2026-02-17 - Extracted company config to layer

# ==============================================================================
# Configuration (defaults; override via layer or environment)
# ==============================================================================

export OP_ACCOUNT="${OP_ACCOUNT:-}"

OP_VAULT_LOCAL="${OP_VAULT_LOCAL:-}"
OP_VAULT_DEV="${OP_VAULT_DEV:-}"
OP_VAULT_PROD="${OP_VAULT_PROD:-}"

# Load company-specific config from layer if available
if type layer_source &>/dev/null; then
    layer_source "lib/services/onepassword-config.sh" 2>/dev/null
fi

# ==============================================================================
# 1Password CLI Helpers
# ==============================================================================

# Start a session using password auth (avoids Touch ID prompts for 30 min)
# Usage: op_session_start
# Note: Use this before batch operations to avoid repeated Touch ID prompts
function op_session_start() {
    if [ -z "$OP_ACCOUNT" ]; then
        echo "Error: OP_ACCOUNT not set. Configure via layer or environment." >&2
        return 1
    fi
    echo "Starting 1Password session (password auth)..."
    echo "   This avoids Touch ID prompts for 30 minutes."
    echo ""
    eval $(op signin --account "$OP_ACCOUNT")
    if [ $? -eq 0 ]; then
        echo ""
        echo "Session started. Write operations won't prompt for Touch ID."
    else
        echo ""
        echo "Failed to start session."
        return 1
    fi
}

# Check if an item exists in a vault
# Usage: op_item_exists "VARIABLE_NAME" "vault-name"
# Returns: 0 if exists, 1 if not
function op_item_exists() {
    local item_name="$1"
    local vault="${2:-$OP_VAULT_LOCAL}"

    if [ -z "$item_name" ]; then
        echo "Error: Missing item name"
        echo "Usage: op_item_exists <item-name> [vault]"
        return 1
    fi

    op item get "$item_name" --vault "$vault" --account "$OP_ACCOUNT" &>/dev/null
    return $?
}

# Get tags for an item
# Usage: op_get_item_tags "VARIABLE_NAME" "vault-name"
# Returns: comma-separated tags or empty string
function op_get_item_tags() {
    local item_name="$1"
    local vault="${2:-$OP_VAULT_LOCAL}"

    if [ -z "$item_name" ]; then
        echo "Error: Missing item name"
        echo "Usage: op_get_item_tags <item-name> [vault]"
        return 1
    fi

    local tags
    tags=$(op item get "$item_name" --vault "$vault" --account "$OP_ACCOUNT" --format json 2>/dev/null | jq -r '.tags // [] | join(",")')

    if [ $? -ne 0 ]; then
        echo ""
        return 1
    fi

    echo "$tags"
}

# Add tags to an item (preserves existing tags, no duplicates)
# Usage: op_add_tags "VARIABLE_NAME" "vault-name" "tag1,tag2"
function op_add_tags() {
    local item_name="$1"
    local vault="${2:-$OP_VAULT_LOCAL}"
    local new_tags="$3"

    if [ -z "$item_name" ] || [ -z "$new_tags" ]; then
        echo "Error: Missing required arguments"
        echo "Usage: op_add_tags <item-name> <vault> <tags>"
        return 1
    fi

    # Get current tags
    local current_tags
    current_tags=$(op_get_item_tags "$item_name" "$vault")

    if [ $? -ne 0 ]; then
        echo "Error: Could not get current tags for $item_name"
        return 1
    fi

    # Merge tags (remove duplicates)
    local merged_tags
    if [ -n "$current_tags" ]; then
        merged_tags=$(echo "$current_tags,$new_tags" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')
    else
        merged_tags="$new_tags"
    fi

    # Check if tags actually changed
    local current_sorted=$(echo "$current_tags" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ "$current_sorted" = "$merged_tags" ]; then
        echo "$item_name in $vault - tags unchanged"
        echo "   Current tags: ${current_tags:-<none>}"
        echo "No update needed"
        return 0
    fi

    # Update item with merged tags
    echo "Updating $item_name in $vault"
    echo "   Current tags: ${current_tags:-<none>}"
    echo "   Adding tags:  $new_tags"
    echo "   Final tags:   $merged_tags"

    # Clear tags via JSON template first, then set new tags
    local item_json
    item_json=$(op item get "$item_name" --vault "$vault" --account "$OP_ACCOUNT" --format json 2>/dev/null)
    if [ -z "$item_json" ]; then
        echo "Failed to get item JSON"
        return 1
    fi

    local tmp_file="/tmp/op_clear_tags_$$.json"
    echo "$item_json" | jq '.tags = []' > "$tmp_file"
    op item edit "$item_name" --vault "$vault" --account "$OP_ACCOUNT" --template "$tmp_file" &>/dev/null
    rm -f "$tmp_file"

    if op item edit "$item_name" --vault "$vault" --account "$OP_ACCOUNT" --tags "$merged_tags" &>/dev/null; then
        echo "Tags updated successfully"
        return 0
    else
        echo "Failed to update tags"
        return 1
    fi
}

# Create a new item (Login category for env vars)
# Usage: op_create_item "VARIABLE_NAME" "value" "vault-name" "tag1,tag2"
function op_create_item() {
    local item_name="$1"
    local item_value="$2"
    local vault="${3:-$OP_VAULT_LOCAL}"
    local tags="$4"

    if [ -z "$item_name" ] || [ -z "$item_value" ]; then
        echo "Error: Missing required arguments"
        echo "Usage: op_create_item <name> <value> [vault] [tags]"
        return 1
    fi

    echo "Creating $item_name in $vault"

    local cmd="op item create --category Login --title \"$item_name\" --vault \"$vault\" --account \"$OP_ACCOUNT\" username=\"$item_name\" password=\"$item_value\""
    if [ -n "$tags" ]; then
        cmd="$cmd --tags \"$tags\""
    fi

    local result
    result=$(eval "$cmd" 2>&1)
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "Created successfully"
        return 0
    else
        echo "Failed to create item: $result"
        return 1
    fi
}

# Delete an item
# Usage: op_delete_item "VARIABLE_NAME" "vault-name"
function op_delete_item() {
    local item_name="$1"
    local vault="${2:-$OP_VAULT_LOCAL}"

    if [ -z "$item_name" ]; then
        echo "Error: Missing item name"
        echo "Usage: op_delete_item <item-name> [vault]"
        return 1
    fi

    echo "Deleting $item_name from $vault"

    if op item delete "$item_name" --vault "$vault" --account "$OP_ACCOUNT" &>/dev/null; then
        echo "Deleted successfully"
        return 0
    else
        echo "Failed to delete item"
        return 1
    fi
}

# Get item details as JSON
# Usage: op_get_item "VARIABLE_NAME" "vault-name"
function op_get_item() {
    local item_name="$1"
    local vault="${2:-$OP_VAULT_LOCAL}"

    if [ -z "$item_name" ]; then
        echo "Error: Missing item name"
        echo "Usage: op_get_item <item-name> [vault]"
        return 1
    fi

    op item get "$item_name" --vault "$vault" --account "$OP_ACCOUNT" --format json 2>/dev/null
}

# List items in a vault with optional tag filter
# Usage: op_list_items "vault-name" "tag-filter"
function op_list_items() {
    local vault="${1:-$OP_VAULT_LOCAL}"
    local tag_filter="$2"

    local tag_arg=""
    if [ -n "$tag_filter" ]; then
        tag_arg="--tags $tag_filter"
    fi

    op item list --vault "$vault" --account "$OP_ACCOUNT" $tag_arg --format json 2>/dev/null | jq -r '.[].title' | sort
}

# Add tags to an item by ID (for handling duplicates)
# Usage: op_add_tags_by_id "item-id" "vault-name" "tag1,tag2"
function op_add_tags_by_id() {
    local item_id="$1"
    local vault="${2:-$OP_VAULT_PROD}"
    local new_tags="$3"

    if [ -z "$item_id" ] || [ -z "$new_tags" ]; then
        echo "Error: Missing required arguments"
        echo "Usage: op_add_tags_by_id <item-id> <vault> <tags>"
        return 1
    fi

    local item_json
    item_json=$(op item get "$item_id" --vault "$vault" --account "$OP_ACCOUNT" --format json 2>/dev/null)
    if [ -z "$item_json" ]; then
        echo "Failed to get item $item_id"
        return 1
    fi

    local item_name=$(echo "$item_json" | jq -r '.title')
    local current_tags=$(echo "$item_json" | jq -r '.tags // [] | join(",")')

    # Merge tags (remove duplicates)
    local merged_tags
    if [ -n "$current_tags" ]; then
        merged_tags=$(echo "$current_tags,$new_tags" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')
    else
        merged_tags="$new_tags"
    fi

    local current_sorted=$(echo "$current_tags" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ "$current_sorted" = "$merged_tags" ]; then
        echo "$item_name ($item_id) - tags unchanged"
        return 0
    fi

    echo "Updating $item_name ($item_id)"
    echo "   Current: ${current_tags:-<none>}"
    echo "   Adding:  $new_tags"
    echo "   Final:   $merged_tags"

    local tmp_file="/tmp/op_tags_$$.json"
    echo "$item_json" | jq '.tags = []' > "$tmp_file"
    op item edit "$item_id" --vault "$vault" --account "$OP_ACCOUNT" --template "$tmp_file" &>/dev/null
    rm -f "$tmp_file"

    if op item edit "$item_id" --vault "$vault" --account "$OP_ACCOUNT" --tags "$merged_tags" &>/dev/null; then
        echo "Updated"
        return 0
    else
        echo "Failed"
        return 1
    fi
}

# Show items that have source_tag but not target_tag
# Usage: op_tag_diff "vault-name" "source-tag" "target-tag"
function op_tag_diff() {
    local vault="${1:-$OP_VAULT_PROD}"
    local source_tag="$2"
    local target_tag="$3"

    if [ -z "$source_tag" ] || [ -z "$target_tag" ]; then
        echo "Error: Missing required arguments"
        echo "Usage: op_tag_diff <vault> <source-tag> <target-tag>"
        return 1
    fi

    echo "Comparing tags in $vault"
    echo "   Source: $source_tag"
    echo "   Target: $target_tag"
    echo ""

    local source_items
    source_items=$(op_list_items "$vault" "$source_tag")

    local target_items
    target_items=$(op_list_items "$vault" "$target_tag")

    local missing
    missing=$(comm -23 <(echo "$source_items") <(echo "$target_items"))

    if [ -z "$missing" ]; then
        echo "All items with '$source_tag' also have '$target_tag'"
        return 0
    fi

    local count=$(echo "$missing" | wc -l | tr -d ' ')
    echo "Found $count items with '$source_tag' but missing '$target_tag':"
    echo ""
    echo "$missing"
    echo ""

    return 0
}

# Sync tags: add target_tag to all items that have source_tag but not target_tag
# Usage: op_sync_tags "vault-name" "source-tag" "target-tag" [--dry-run]
function op_sync_tags() {
    local vault="${1:-$OP_VAULT_PROD}"
    local source_tag="$2"
    local target_tag="$3"
    local dry_run="$4"

    if [ -z "$source_tag" ] || [ -z "$target_tag" ]; then
        echo "Error: Missing required arguments"
        echo "Usage: op_sync_tags <vault> <source-tag> <target-tag> [--dry-run]"
        return 1
    fi

    echo "Syncing tags in $vault"
    echo "   Source: $source_tag"
    echo "   Target: $target_tag"
    if [ "$dry_run" = "--dry-run" ]; then
        echo "   Mode: DRY RUN (no changes)"
    fi
    echo ""

    local source_items
    source_items=$(op_list_items "$vault" "$source_tag")

    local target_items
    target_items=$(op_list_items "$vault" "$target_tag")

    local missing
    missing=$(comm -23 <(echo "$source_items") <(echo "$target_items"))

    if [ -z "$missing" ]; then
        echo "All items already synced - nothing to do"
        return 0
    fi

    local count=$(echo "$missing" | wc -l | tr -d ' ')
    echo "Found $count items to update"
    echo ""

    if [ "$dry_run" = "--dry-run" ]; then
        echo "Would add '$target_tag' to:"
        echo "$missing"
        return 0
    fi

    local success=0
    local failed=0
    while IFS= read -r item; do
        if [ -n "$item" ]; then
            echo "-> $item"
            if op_add_tags "$item" "$vault" "$target_tag" > /dev/null 2>&1; then
                ((success++))
            else
                echo "  Failed"
                ((failed++))
            fi
        fi
    done <<< "$missing"

    echo ""
    echo "Done: $success succeeded, $failed failed"
}
