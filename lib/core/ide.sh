#!/bin/bash
# IDE Session Registry for Claude Code
# Manages session state across multiple concurrent Claude Code instances
#
# Session files are stored in ~/.claude/ide/sessions/{session_id}.json
# Each session manages its own file - no concurrency conflicts

IDE_DIR="$HOME/.claude/ide"
IDE_SESSIONS_DIR="$IDE_DIR/sessions"
IDE_LOCKS_DIR="$IDE_DIR/locks"
IDE_HISTORY_FILE="$IDE_DIR/history.jsonl"

# Ensure directories exist
mkdir -p "$IDE_SESSIONS_DIR" "$IDE_LOCKS_DIR" 2>/dev/null

# Generate a unique session ID
# Uses tmux pane ID if available, otherwise generates UUID
# Returns: session ID string
ide_generate_session_id() {
    if [[ -n "$TMUX" ]]; then
        # Use tmux pane unique ID (e.g., %5) - remove the % prefix
        local pane_id=$(tmux display-message -p '#{pane_id}' | tr -d '%')
        echo "tmux-${pane_id}"
    else
        # Fallback to UUID
        uuidgen | tr '[:upper:]' '[:lower:]' | cut -d'-' -f1
    fi
}

# Get the current session ID (generates if not set)
# The session ID is stored in an environment variable for the session lifetime
# Returns: session ID string
ide_get_session_id() {
    if [[ -z "$CLAUDE_SESSION_ID" ]]; then
        export CLAUDE_SESSION_ID=$(ide_generate_session_id)
    fi
    echo "$CLAUDE_SESSION_ID"
}

# Get the session file path for a session ID
# Args: $1 = session ID (optional, uses current if not provided)
# Returns: full path to session JSON file
ide_get_session_file() {
    local session_id="${1:-$(ide_get_session_id)}"
    echo "$IDE_SESSIONS_DIR/${session_id}.json"
}

# Register a new session in the registry
# Creates a session file with initial state
# Args: $1 = session type (coding, debugging, etc.)
#       $2 = project path (optional)
#       $3 = description (optional)
# Returns: 0 on success, 1 on error
ide_register_session() {
    local session_type="${1:-coding}"
    local project_path="${2:-$(pwd)}"
    local description="${3:-}"

    local session_id=$(ide_get_session_id)
    local session_file=$(ide_get_session_file "$session_id")

    # Get git branch if in a git repo
    local branch=""
    if git rev-parse --git-dir >/dev/null 2>&1; then
        branch=$(git branch --show-current 2>/dev/null || echo "")
    fi

    # Get tmux info if available
    local tmux_window=""
    local tmux_pane=""
    local tmux_session=""
    if [[ -n "$TMUX" ]]; then
        tmux_window=$(tmux display-message -p '#{window_index}')
        tmux_pane=$(tmux display-message -p '#{pane_id}')
        tmux_session=$(tmux display-message -p '#{session_name}')
    fi

    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Create session JSON
    cat > "$session_file" << EOF
{
  "id": "$session_id",
  "type": "$session_type",
  "project": "$project_path",
  "branch": "$branch",
  "worktree": null,
  "tmux_session": "$tmux_session",
  "tmux_window": "$tmux_window",
  "tmux_pane": "$tmux_pane",
  "status": "running",
  "description": "$description",
  "started_at": "$now",
  "updated_at": "$now"
}
EOF

    if [[ $? -eq 0 ]]; then
        echo "$session_id"
        return 0
    else
        echo "Error: Failed to create session file" >&2
        return 1
    fi
}

# Deregister (remove) a session from the registry
# Saves session to history before removing
# Args: $1 = session ID (optional, uses current if not provided)
# Returns: 0 on success, 1 on error
ide_deregister_session() {
    local session_id="${1:-$(ide_get_session_id)}"
    local session_file=$(ide_get_session_file "$session_id")

    if [[ -f "$session_file" ]]; then
        # Save to history before removing
        local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        jq -c --arg ended "$now" '. + {ended_at: $ended}' "$session_file" >> "$IDE_HISTORY_FILE" 2>/dev/null || true

        rm -f "$session_file"
        return 0
    else
        echo "Warning: Session $session_id not found in registry" >&2
        return 1
    fi
}

# Update session status
# Args: $1 = new status (running, waiting, idle)
#       $2 = session ID (optional)
# Returns: 0 on success, 1 on error
ide_update_status() {
    local new_status="$1"
    local session_id="${2:-$(ide_get_session_id)}"
    local session_file=$(ide_get_session_file "$session_id")

    if [[ ! -f "$session_file" ]]; then
        echo "Error: Session $session_id not found" >&2
        return 1
    fi

    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Update status and timestamp using jq
    local tmp_file="${session_file}.tmp"
    jq --arg status "$new_status" --arg updated "$now" \
       '.status = $status | .updated_at = $updated' \
       "$session_file" > "$tmp_file" && mv "$tmp_file" "$session_file"

    # Update tmux window name if this is our session and we're in tmux
    if [[ "$session_id" == "$(ide_get_session_id)" && -n "$TMUX" ]]; then
        # Source tmux helpers if available
        if [[ -f "$HOME/.claude/lib/local/tmux.sh" ]]; then
            source "$HOME/.claude/lib/local/tmux.sh"
            tmux_update_window_from_registry 2>/dev/null || true
        fi
    fi
}

# Update session field(s)
# Args: $1 = field name
#       $2 = field value
#       $3 = session ID (optional)
# Returns: 0 on success, 1 on error
ide_update_field() {
    local field="$1"
    local value="$2"
    local session_id="${3:-$(ide_get_session_id)}"
    local session_file=$(ide_get_session_file "$session_id")

    if [[ ! -f "$session_file" ]]; then
        echo "Error: Session $session_id not found" >&2
        return 1
    fi

    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Update field and timestamp using jq
    local tmp_file="${session_file}.tmp"
    jq --arg field "$field" --arg value "$value" --arg updated "$now" \
       '.[$field] = $value | .updated_at = $updated' \
       "$session_file" > "$tmp_file" && mv "$tmp_file" "$session_file"
}

# Get a session's state
# Args: $1 = session ID (optional, uses current if not provided)
# Returns: JSON session state or empty if not found
ide_get_session() {
    local session_id="${1:-$(ide_get_session_id)}"
    local session_file=$(ide_get_session_file "$session_id")

    if [[ -f "$session_file" ]]; then
        cat "$session_file"
    else
        echo ""
        return 1
    fi
}

# List all active sessions
# Args: $1 = format (json, table, ids) - defaults to json
# Returns: session data in requested format
ide_list_sessions() {
    local format="${1:-json}"
    local sessions=()

    # Collect all session files
    for session_file in "$IDE_SESSIONS_DIR"/*.json; do
        [[ -f "$session_file" ]] || continue
        sessions+=("$(cat "$session_file")")
    done

    if [[ ${#sessions[@]} -eq 0 ]]; then
        case "$format" in
            json) echo "[]" ;;
            table) echo "No active sessions" ;;
            ids) ;;
        esac
        return 0
    fi

    case "$format" in
        json)
            # Output as JSON array
            printf '%s\n' "${sessions[@]}" | jq -s '.'
            ;;
        ids)
            # Output just session IDs, one per line
            printf '%s\n' "${sessions[@]}" | jq -r '.id'
            ;;
        table)
            # Output as formatted table
            echo "ID          │ Type      │ Project                    │ Branch           │ Status   │ Win"
            echo "────────────┼───────────┼────────────────────────────┼──────────────────┼──────────┼────"
            printf '%s\n' "${sessions[@]}" | jq -r '
                [
                    .id[0:11],
                    .type[0:9],
                    (.project | split("/") | last)[0:26],
                    (if .branch == "" or .branch == null then "-" else .branch[0:16] end),
                    .status[0:8],
                    (.tmux_window // "-")
                ] | join("\t")' | while IFS=$'\t' read -r id type project branch status window; do
                printf "%-11s │ %-9s │ %-26s │ %-16s │ %-8s │ %s\n" \
                    "$id" "$type" "$project" "$branch" "$status" "$window"
            done
            ;;
    esac
}

# Find sessions by criteria
# Args: $1 = field name (type, project, status, etc.)
#       $2 = value to match
# Returns: JSON array of matching sessions
ide_find_sessions() {
    local field="$1"
    local value="$2"

    ide_list_sessions json | jq --arg field "$field" --arg value "$value" \
        '[.[] | select(.[$field] == $value)]'
}

# Get count of active sessions
# Returns: number of active sessions
ide_count_sessions() {
    local count=0
    for session_file in "$IDE_SESSIONS_DIR"/*.json; do
        [[ -f "$session_file" ]] && ((count++))
    done
    echo "$count"
}

# Check if a session exists
# Args: $1 = session ID
# Returns: 0 if exists, 1 if not
ide_session_exists() {
    local session_id="$1"
    local session_file=$(ide_get_session_file "$session_id")
    [[ -f "$session_file" ]]
}

# Get sessions waiting for input
# Returns: JSON array of sessions with status "waiting"
ide_get_waiting_sessions() {
    ide_find_sessions "status" "waiting"
}

# Cleanup stale sessions (no corresponding tmux pane or Claude not running)
# Returns: number of sessions cleaned up
ide_cleanup_stale_sessions() {
    local cleaned=0

    for session_file in "$IDE_SESSIONS_DIR"/*.json; do
        [[ -f "$session_file" ]] || continue

        local session_id=$(jq -r '.id' "$session_file")
        local tmux_pane=$(jq -r '.tmux_pane' "$session_file")

        # If session has a tmux pane, check if it still exists and is running Claude
        if [[ -n "$tmux_pane" && "$tmux_pane" != "null" ]]; then
            # Check if pane exists
            if ! tmux list-panes -a -F '#{pane_id}' 2>/dev/null | grep -q "^${tmux_pane}$"; then
                echo "Removing stale session: $session_id (pane $tmux_pane no longer exists)"
                rm -f "$session_file"
                ((cleaned++))
                continue
            fi

            # Check if Claude is running in the pane (node process indicates Claude Code)
            local pane_cmd=$(tmux display-message -t "$tmux_pane" -p '#{pane_current_command}' 2>/dev/null)
            # Claude Code runs as node, shows version like "2.1.23" or "node"
            if [[ "$pane_cmd" != "node" && ! "$pane_cmd" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                echo "Removing stale session: $session_id (pane $tmux_pane not running Claude: $pane_cmd)"
                rm -f "$session_file"
                ((cleaned++))
            fi
        fi
    done

    echo "$cleaned"
}

# Get session info formatted for tmux status line
# Args: $1 = session ID (optional)
# Returns: formatted string for tmux
ide_get_status_line() {
    local session_id="${1:-$(ide_get_session_id)}"
    local session_file=$(ide_get_session_file "$session_id")

    if [[ ! -f "$session_file" ]]; then
        echo ""
        return 1
    fi

    local type=$(jq -r '.type' "$session_file")
    local branch=$(jq -r '.branch // ""' "$session_file")
    local status=$(jq -r '.status' "$session_file")

    # Build status line
    local status_icon
    case "$status" in
        running) status_icon="" ;;
        waiting) status_icon=" ⏳" ;;
        idle)    status_icon=" 💤" ;;
        *)       status_icon="" ;;
    esac

    if [[ -n "$branch" && "$branch" != "null" ]]; then
        echo "${type} [${branch}]${status_icon}"
    else
        echo "${type}${status_icon}"
    fi
}

# Get recent session history
# Args: $1 = limit (default 10)
#       $2 = format (json, table)
# Returns: recent sessions from history
ide_get_history() {
    local limit="${1:-10}"
    local format="${2:-table}"

    if [[ ! -f "$IDE_HISTORY_FILE" ]]; then
        case "$format" in
            json) echo "[]" ;;
            table) echo "No session history" ;;
        esac
        return 0
    fi

    case "$format" in
        json)
            tail -n "$limit" "$IDE_HISTORY_FILE" | jq -s 'reverse'
            ;;
        table)
            echo "Type      │ Project                  │ Branch           │ Started              │ Duration"
            echo "──────────┼──────────────────────────┼──────────────────┼──────────────────────┼──────────"
            tail -n "$limit" "$IDE_HISTORY_FILE" | tail -r | jq -r '
                [
                    .type[0:9],
                    (.project | split("/") | last)[0:24],
                    (if .branch == "" or .branch == null then "-" else .branch[0:16] end),
                    (.started_at | split("T") | .[0]),
                    (
                        if .ended_at and .started_at then
                            ((.ended_at | fromdateiso8601) - (.started_at | fromdateiso8601)) / 60 | floor | tostring + "m"
                        else
                            "-"
                        end
                    )
                ] | @tsv' 2>/dev/null | while IFS=$'\t' read -r type project branch started duration; do
                printf "%-9s │ %-24s │ %-16s │ %-20s │ %s\n" \
                    "$type" "$project" "$branch" "$started" "$duration"
            done
            ;;
    esac
}

# Clear session history
# Args: $1 = keep count (default 100, 0 = clear all)
ide_clear_history() {
    local keep="${1:-100}"

    if [[ ! -f "$IDE_HISTORY_FILE" ]]; then
        return 0
    fi

    if [[ "$keep" -eq 0 ]]; then
        rm -f "$IDE_HISTORY_FILE"
    else
        local tmp_file="${IDE_HISTORY_FILE}.tmp"
        tail -n "$keep" "$IDE_HISTORY_FILE" > "$tmp_file"
        mv "$tmp_file" "$IDE_HISTORY_FILE"
    fi
}

# Export functions for use in subshells
export -f ide_generate_session_id
export -f ide_get_session_id
export -f ide_get_session_file
export -f ide_register_session
export -f ide_deregister_session
export -f ide_update_status
export -f ide_update_field
export -f ide_get_session
export -f ide_list_sessions
export -f ide_find_sessions
export -f ide_count_sessions
export -f ide_session_exists
export -f ide_get_waiting_sessions
export -f ide_cleanup_stale_sessions
export -f ide_get_status_line
export -f ide_get_history
export -f ide_clear_history
