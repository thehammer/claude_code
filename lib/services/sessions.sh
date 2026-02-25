#!/bin/bash
# Session History helpers (replaces session-memory MCP server)
#
# Provides search/browse/extract over Claude Code session transcripts.
# Sessions stored as JSONL at ~/.claude/projects/<project>/<sessionId>.jsonl
#
# Note: Loses semantic (embedding) search from the MCP server, but covers
# all practical use cases via text/grep search over summaries and commands.

PROJECTS_DIR="${HOME}/.claude/projects"
INDEX_CACHE="${HOME}/.claude/sessions-index.json"

# ==============================================================================
# Index management
# ==============================================================================

# Rebuild the session index cache
# Usage: sessions_rebuild_index
function sessions_rebuild_index() {
    ~/.claude/bin/index-sessions rebuild 2>/dev/null
}

# Ensure index is fresh (rebuilds if >1hr old)
function _sessions_ensure_index() {
    if [ ! -f "$INDEX_CACHE" ] || [ "$(find "$INDEX_CACHE" -mmin +60 2>/dev/null | wc -l)" -gt 0 ]; then
        sessions_rebuild_index >/dev/null
    fi
}

# ==============================================================================
# List & browse
# ==============================================================================

# List recent sessions
# Usage: sessions_list [limit] [project_filter]
function sessions_list() {
    local limit="${1:-20}"
    local project_filter="$2"

    _sessions_ensure_index

    if [ -n "$project_filter" ]; then
        jq -r --arg p "$project_filter" --argjson n "$limit" \
            '[.[] | select(.project | ascii_downcase | contains($p | ascii_downcase))][:$n] | .[] | "\(.id[0:12])\t\(.project)\t\(.start[0:10] // "N/A")\t\(.user_messages)/\(.assistant_messages) msgs\t\(.summary[0:60])"' \
            "$INDEX_CACHE"
    else
        jq -r --argjson n "$limit" \
            '.[:$n] | .[] | "\(.id[0:12])\t\(.project)\t\(.start[0:10] // "N/A")\t\(.user_messages)/\(.assistant_messages) msgs\t\(.summary[0:60])"' \
            "$INDEX_CACHE"
    fi
}

# Get full details for a session
# Usage: sessions_get <session_id_or_prefix>
function sessions_get() {
    local pattern="${1:?Usage: sessions_get SESSION_ID}"

    _sessions_ensure_index

    # Try exact match first, then prefix
    local result
    result=$(jq -r --arg id "$pattern" '.[] | select(.id == $id or (.id | startswith($id)))' "$INDEX_CACHE" | head -1)

    if [ -z "$result" ]; then
        echo "No session found matching: $pattern" >&2
        return 1
    fi

    echo "$result" | jq .
}

# ==============================================================================
# Search
# ==============================================================================

# Search sessions by summary/project text
# Usage: sessions_search <query> [limit]
function sessions_search() {
    local query="${1:?Usage: sessions_search QUERY [LIMIT]}"
    local limit="${2:-20}"

    _sessions_ensure_index

    jq -r --arg q "$query" --argjson n "$limit" \
        '[.[] | select((.summary // "" | ascii_downcase | contains($q | ascii_downcase)) or (.project | ascii_downcase | contains($q | ascii_downcase)))][:$n] | .[] | "\(.id[0:12])\t\(.project)\t\(.start[0:10] // "N/A")\t\(.summary[0:60])"' \
        "$INDEX_CACHE"
}

# Search for commands across all sessions
# Usage: sessions_search_commands <pattern> [project_filter]
function sessions_search_commands() {
    local pattern="${1:?Usage: sessions_search_commands PATTERN [PROJECT_FILTER]}"
    local project_filter="$2"

    local search_path="$PROJECTS_DIR"
    if [ -n "$project_filter" ]; then
        search_path="$PROJECTS_DIR/*${project_filter}*"
    fi

    grep -l "\"command\":\"[^\"]*${pattern}" $search_path/*.jsonl 2>/dev/null | while read -r file; do
        local session_id=$(basename "$file" .jsonl)
        local project=$(basename "$(dirname "$file")")

        echo "=== $session_id ($project) ==="
        grep "\"command\":\"[^\"]*${pattern}" "$file" 2>/dev/null | \
            jq -r 'select(.content) | .content[] | select(.type == "tool_use" and .name == "Bash") | .input.command' 2>/dev/null | \
            grep -i "$pattern" | head -5
        echo ""
    done
}

# ==============================================================================
# Extract from specific session
# ==============================================================================

# Get tool calls from a session
# Usage: sessions_get_commands <session_id_prefix> [tool_filter] [limit]
function sessions_get_commands() {
    local pattern="${1:?Usage: sessions_get_commands SESSION_ID [TOOL_FILTER] [LIMIT]}"
    local tool_filter="$2"
    local limit="${3:-50}"

    local file
    file=$(_sessions_find_file "$pattern")
    [ -z "$file" ] && return 1

    local jq_filter
    if [ -n "$tool_filter" ]; then
        jq_filter="select(.content) | .content[] | select(.type == \"tool_use\" and .name == \"$tool_filter\") | {tool: .name, input: .input}"
    else
        jq_filter='select(.content) | .content[] | select(.type == "tool_use") | {tool: .name, input: (.input | if .command then {command: .command} elif .file_path then {file_path: .file_path} elif .pattern then {pattern: .pattern} else . end)}'
    fi

    grep '"tool_use"' "$file" 2>/dev/null | jq -r "$jq_filter" 2>/dev/null | head -"$limit"
}

# Get files modified in a session
# Usage: sessions_get_files <session_id_prefix>
function sessions_get_files() {
    local pattern="${1:?Usage: sessions_get_files SESSION_ID}"

    local file
    file=$(_sessions_find_file "$pattern")
    [ -z "$file" ] && return 1

    echo "=== Files Created (Write) ==="
    grep '"tool_use"' "$file" 2>/dev/null | \
        jq -r '.content[]? | select(.type == "tool_use" and .name == "Write") | .input.file_path' 2>/dev/null | \
        sort -u

    echo ""
    echo "=== Files Modified (Edit) ==="
    grep '"tool_use"' "$file" 2>/dev/null | \
        jq -r '.content[]? | select(.type == "tool_use" and .name == "Edit") | .input.file_path' 2>/dev/null | \
        sort -u
}

# ==============================================================================
# Internal helpers
# ==============================================================================

# Find a session JSONL file by ID or prefix
function _sessions_find_file() {
    local pattern="$1"

    # Try exact match
    local file
    file=$(find "$PROJECTS_DIR" -name "${pattern}.jsonl" -type f 2>/dev/null | head -1)

    # Try prefix match
    if [ -z "$file" ]; then
        file=$(find "$PROJECTS_DIR" -name "${pattern}*.jsonl" -type f 2>/dev/null | head -1)
    fi

    if [ -z "$file" ]; then
        echo "No session file found matching: $pattern" >&2
        return 1
    fi

    echo "$file"
}
