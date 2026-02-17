# /lock - Workspace Lock Management

Manage workspace locks that prevent multiple Claude sessions from conflicting.

## Usage

```
/lock              # Show lock status for current project
/lock status       # Same as above
/lock release      # Release the workspace lock (if you hold it)
/lock take         # Take the lock from another session
/lock list         # Show all active locks across projects
```

## Implementation

```bash
#!/bin/bash
source ~/.claude/lib/core/locks.sh

PROJECT_DIR="$(pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
LOCK_NAME="${PROJECT_NAME}:workspace"

action="${1:-status}"

case "$action" in
    status)
        LOCK_FILE=$(lock_get_file "$LOCK_NAME")
        if [[ -f "$LOCK_FILE" ]]; then
            if lock_is_held "$LOCK_NAME"; then
                HOLDER=$(cat "$LOCK_FILE")
                HOLDER_SESSION=$(echo "$HOLDER" | jq -r '.session_id // "unknown"')
                HOLDER_WINDOW=$(echo "$HOLDER" | jq -r '.tmux_window // "?"')
                HOLDER_TIME=$(echo "$HOLDER" | jq -r '.acquired_at // "?"')
                HOLDER_DESC=$(echo "$HOLDER" | jq -r '.description // "-"')

                CURRENT_SESSION="${CLAUDE_SESSION_ID:-}"
                if [[ "$HOLDER_SESSION" == "$CURRENT_SESSION" ]]; then
                    echo "🔒 **You hold the workspace lock for ${PROJECT_NAME}**"
                else
                    echo "🔒 **Workspace lock held by another session**"
                fi
                echo ""
                echo "  Project: ${PROJECT_NAME}"
                echo "  Session: ${HOLDER_SESSION}"
                echo "  Window: ${HOLDER_WINDOW}"
                echo "  Since: ${HOLDER_TIME}"
                echo "  Activity: ${HOLDER_DESC}"
            else
                echo "🔓 **Workspace unlocked** (stale lock cleaned up)"
                rm -f "$LOCK_FILE"
            fi
        else
            echo "🔓 **Workspace unlocked for ${PROJECT_NAME}**"
            echo ""
            echo "No session currently holds the modification lock."
        fi
        ;;

    release)
        if lock_release "$LOCK_NAME"; then
            echo "🔓 **Workspace lock released for ${PROJECT_NAME}**"
        else
            # Try to see who holds it
            if lock_is_held "$LOCK_NAME"; then
                HOLDER=$(lock_holder "$LOCK_NAME")
                HOLDER_SESSION=$(echo "$HOLDER" | jq -r '.session_id // "unknown"')
                echo "❌ Cannot release - lock held by session ${HOLDER_SESSION}"
                echo ""
                echo "Use '/lock take' to force-acquire the lock."
            else
                echo "🔓 **No lock to release**"
            fi
        fi
        ;;

    take)
        # Force release then acquire
        lock_release "$LOCK_NAME" true
        if lock_acquire "$LOCK_NAME" 0 "Taken via /lock take"; then
            echo "🔒 **Workspace lock acquired for ${PROJECT_NAME}**"
            echo ""
            echo "You now hold the modification lock. Other sessions will be"
            echo "blocked from modifying files until you release it."
        else
            echo "❌ Failed to acquire lock"
        fi
        ;;

    list)
        echo "**Active Workspace Locks**"
        echo ""
        lock_list table
        ;;

    *)
        echo "Unknown action: $action"
        echo ""
        echo "Usage: /lock [status|release|take|list]"
        exit 1
        ;;
esac
```

## When to Use

- **`/lock status`** - Check if you or another session holds the lock
- **`/lock release`** - Release lock when you're done making changes (switching to research, waiting for user, etc.)
- **`/lock take`** - Force-acquire lock when switching focus to this session
- **`/lock list`** - See all locks when debugging multi-session workflows

## Automatic Behavior

The workspace lock is automatically:
- **Acquired** when you first modify a file (Edit, Write, or modifying Bash commands)
- **Checked** on every modification to prevent conflicts
- **Released** when your session's tmux pane closes

You should manually release the lock when:
- You've finished a batch of changes and are waiting for feedback
- You're switching to research/reading mode
- You're about to run `/wrapup`
