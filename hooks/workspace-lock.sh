#!/bin/bash
# Workspace Lock Hook
# Ensures only one Claude Code session can modify files in a project at a time
#
# PreToolUse hook for: Edit, Write, Bash (git checkout, git reset, etc.)
#
# Behavior:
# - If no lock held → acquire silently
# - If current session holds lock → proceed
# - If another session holds lock → block and prompt for lock transfer

set -e

source "$HOME/.claude/lib/core/locks.sh"

# Get inputs from hook
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"

# Only check for modifying operations
case "$TOOL_NAME" in
    Edit|Write|NotebookEdit)
        # Always check lock for file modifications
        ;;
    Bash)
        # Check if it's a modifying git command
        if ! echo "$TOOL_INPUT" | grep -qE '(git\s+(checkout|reset|stash|clean|restore|switch)|rm\s+-rf|mv\s+|cp\s+.*>)'; then
            # Not a modifying command, allow through
            exit 0
        fi
        ;;
    *)
        # Other tools don't need lock
        exit 0
        ;;
esac

# Determine project from working directory
PROJECT_DIR="$(pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
LOCK_NAME="${PROJECT_NAME}:workspace"

# Get current session info
CURRENT_SESSION="${CLAUDE_SESSION_ID:-}"
if [[ -z "$CURRENT_SESSION" && -n "$TMUX" ]]; then
    CURRENT_SESSION="tmux-$(tmux display-message -p '#{pane_id}' | tr -d '%')"
fi

# Check lock status
LOCK_FILE=$(lock_get_file "$LOCK_NAME")

if [[ ! -f "$LOCK_FILE" ]]; then
    # No lock exists - acquire it silently
    lock_acquire "$LOCK_NAME" 0 "Workspace modifications"
    exit 0
fi

# Lock exists - check who holds it
HOLDER_SESSION=$(jq -r '.session_id // ""' "$LOCK_FILE" 2>/dev/null)
HOLDER_WINDOW=$(jq -r '.tmux_window // "?"' "$LOCK_FILE" 2>/dev/null)
HOLDER_DESC=$(jq -r '.description // ""' "$LOCK_FILE" 2>/dev/null)

# Check if we hold the lock
if [[ "$HOLDER_SESSION" == "$CURRENT_SESSION" ]]; then
    # We already have the lock
    exit 0
fi

# Check if holder session is still alive
HOLDER_PANE=$(jq -r '.tmux_pane // ""' "$LOCK_FILE" 2>/dev/null)
if [[ -n "$HOLDER_PANE" && "$HOLDER_PANE" != "null" ]]; then
    if ! tmux list-panes -a -F '#{pane_id}' 2>/dev/null | grep -q "^${HOLDER_PANE}$"; then
        # Holder is gone - acquire lock
        rm -f "$LOCK_FILE"
        lock_acquire "$LOCK_NAME" 0 "Workspace modifications"
        exit 0
    fi
fi

# Another active session holds the lock - block the operation
cat << EOF
🔒 **Workspace Lock Conflict**

Another Claude Code session holds the workspace lock for **${PROJECT_NAME}**:
  • Session: ${HOLDER_SESSION}
  • Window: ${HOLDER_WINDOW}
  • Activity: ${HOLDER_DESC:-Workspace modifications}

**To proceed**, you need to take over the lock. This will prevent the other session from making modifications until they re-acquire it.

Options:
1. Switch to window ${HOLDER_WINDOW} and finish work there
2. Ask me to "take the workspace lock" to transfer ownership here
3. Run: lock_release "${LOCK_NAME}" true  (force release)

Blocking ${TOOL_NAME} operation until lock is acquired.
EOF

exit 1
