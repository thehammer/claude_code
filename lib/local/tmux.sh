#!/bin/bash
# Tmux integration helpers for Claude Code
# Provides low-level utilities for tmux detection and control

# Default directory for new Claude session windows
# Using ~/sandbox avoids the "trust this directory" prompt that occurs in ~
# This ensures proper timing for auto-sending /start commands
CLAUDE_SESSION_DIR="$HOME/sandbox"

# Ensure the session directory exists
mkdir -p "$CLAUDE_SESSION_DIR" 2>/dev/null

# Check if currently running inside a tmux session
# Returns: 0 if in tmux, 1 if not
tmux_is_active() {
    [[ -n "$TMUX" ]]
}

# Get current tmux session name
# Returns: session name or empty string if not in tmux
tmux_get_session_name() {
    if tmux_is_active; then
        tmux display-message -p '#S'
    fi
}

# Get current tmux window index and name
# Returns: "index:name" or empty string if not in tmux
tmux_get_window_info() {
    if tmux_is_active; then
        tmux display-message -p '#I:#W'
    fi
}

# Get current tmux pane index
# Returns: pane index or empty string if not in tmux
tmux_get_pane_index() {
    if tmux_is_active; then
        tmux display-message -p '#P'
    fi
}

# Rename the current tmux window
# Args: $1 = new window name
# Returns: 0 on success, 1 if not in tmux
tmux_rename_window() {
    local new_name="$1"

    if ! tmux_is_active; then
        return 1
    fi

    if [[ -z "$new_name" ]]; then
        echo "Error: Window name required" >&2
        return 1
    fi

    tmux rename-window "$new_name"
}

# Rename window based on Claude session type
# Args: $1 = session type (coding, debugging, clauding, etc.)
# Returns: 0 on success, 1 if not in tmux or invalid type
tmux_set_claude_window() {
    local session_type="$1"

    if ! tmux_is_active; then
        return 1
    fi

    # Map session types to window names with emoji indicators
    local window_name
    case "$session_type" in
        coding)     window_name="💻 coding" ;;
        debugging)  window_name="🐛 debug" ;;
        analysis)   window_name="🔍 analysis" ;;
        planning)   window_name="📋 planning" ;;
        presenting) window_name="📊 presenting" ;;
        learning)   window_name="📚 learning" ;;
        personal)   window_name="🏠 personal" ;;
        clauding)   window_name="🔧 clauding" ;;
        launcher)   window_name="🚀" ;;
        reviewing)  window_name="👀 review" ;;
        *)          window_name="$session_type" ;;
    esac

    tmux rename-window "$window_name"
}

# Split current pane horizontally and run a command
# Args: $1 = command to run in new pane (optional)
# Returns: 0 on success, 1 if not in tmux
tmux_split_horizontal() {
    local command="$1"

    if ! tmux_is_active; then
        return 1
    fi

    if [[ -n "$command" ]]; then
        tmux split-window -h "$command"
    else
        tmux split-window -h
    fi
}

# Split current pane vertically and run a command
# Args: $1 = command to run in new pane (optional)
# Returns: 0 on success, 1 if not in tmux
tmux_split_vertical() {
    local command="$1"

    if ! tmux_is_active; then
        return 1
    fi

    if [[ -n "$command" ]]; then
        tmux split-window -v "$command"
    else
        tmux split-window -v
    fi
}

# Send keys to a specific pane
# Args: $1 = pane target (e.g., "0", "1", "{right}")
#       $2 = keys to send
# Returns: 0 on success, 1 if not in tmux
tmux_send_keys() {
    local pane_target="$1"
    local keys="$2"

    if ! tmux_is_active; then
        return 1
    fi

    tmux send-keys -t "$pane_target" "$keys"
}

# Capture output from a specific pane
# Args: $1 = pane target (optional, defaults to current pane)
#       $2 = number of lines to capture (optional, defaults to all)
# Returns: captured output
tmux_capture_pane() {
    local pane_target="${1:-.}"
    local lines="${2:-}"

    if ! tmux_is_active; then
        return 1
    fi

    if [[ -n "$lines" ]]; then
        tmux capture-pane -t "$pane_target" -p -S "-$lines"
    else
        tmux capture-pane -t "$pane_target" -p
    fi
}

# Create a new tmux window with optional name and command
# Args: $1 = window name (optional)
#       $2 = command to run in new window (optional)
# Returns: 0 on success, 1 if not in tmux
tmux_new_window() {
    local window_name="$1"
    local command="$2"

    if ! tmux_is_active; then
        return 1
    fi

    local tmux_cmd="tmux new-window"

    if [[ -n "$window_name" ]]; then
        tmux_cmd="$tmux_cmd -n \"$window_name\""
    fi

    if [[ -n "$command" ]]; then
        tmux_cmd="$tmux_cmd \"$command\""
    fi

    eval "$tmux_cmd"
}

# Create a coding workspace layout in a new tmux window
# Layout: Claude (left 50%) | Emacs (top-right 25%) / Shell (bottom-right 25%)
# Args: $1 = project directory path
#       $2 = window name (optional, defaults to "💻 coding")
# Returns: 0 on success, 1 if not in tmux or directory doesn't exist
tmux_create_coding_layout() {
    local project_dir="$1"
    local window_name="${2:-💻 coding}"

    if ! tmux_is_active; then
        echo "Error: Not in a tmux session" >&2
        return 1
    fi

    # Expand tilde in path
    project_dir="${project_dir/#\~/$HOME}"

    if [[ ! -d "$project_dir" ]]; then
        echo "Error: Directory does not exist: $project_dir" >&2
        return 1
    fi

    # Create new window in the project directory
    tmux new-window -n "$window_name" -c "$project_dir"

    # Split vertically to create right pane (50/50 split)
    tmux split-window -h -c "$project_dir"

    # Split the right pane horizontally to create top-right and bottom-right
    tmux split-window -v -c "$project_dir"

    # Select top-right pane (pane 1) and start emacs
    tmux select-pane -t 1
    tmux send-keys "emacs"
    tmux send-keys Enter

    # Select left pane (pane 0) and start Claude
    tmux select-pane -t 0
    tmux send-keys "claude"
    tmux send-keys Enter

    # Wait for Claude to fully start before sending /start command
    sleep 2.5
    tmux send-keys "/start coding"
    tmux send-keys Enter

    # Return focus to the Claude pane
    tmux select-pane -t 0
}

# Create a clauding workspace layout in a new tmux window
# Layout: Single pane with Claude only (no terminal)
# Args: $1 = description (optional, passed to /start clauding)
#       $2 = window name (optional, defaults to "🔧 clauding")
# Returns: 0 on success, 1 if not in tmux
tmux_create_clauding_layout() {
    local description="$1"
    local window_name="${2:-🔧 clauding}"
    local work_dir="$HOME/.claude"

    if ! tmux_is_active; then
        echo "Error: Not in a tmux session" >&2
        return 1
    fi

    # Create new window in ~/.claude directory
    tmux new-window -n "$window_name" -c "$work_dir"

    # Start Claude in the single pane
    tmux send-keys "claude"
    tmux send-keys Enter

    # Wait for Claude to fully start before sending /start command
    sleep 2.5

    # Send /start clauding with optional description
    if [[ -n "$description" ]]; then
        tmux send-keys "/start clauding $description"
    else
        tmux send-keys "/start clauding"
    fi
    tmux send-keys Enter
}

# Create a reviewing workspace layout in a new tmux window
# Layout: Single pane with Claude only (focused on PR reviews)
# Args: $1 = description (optional, passed to /start reviewing)
#       $2 = window name (optional, defaults to "👀 review")
# Returns: 0 on success, 1 if not in tmux
tmux_create_reviewing_layout() {
    local description="$1"
    local window_name="${2:-👀 review}"
    local work_dir="${3:-$CLAUDE_SESSION_DIR}"

    if ! tmux_is_active; then
        echo "Error: Not in a tmux session" >&2
        return 1
    fi

    # Create new window in home directory (or specified directory)
    # The new window becomes the active window automatically
    tmux new-window -n "$window_name" -c "$work_dir"

    # Capture the new window index
    local window_index=$(tmux display-message -p '#I')

    # Start Claude in the new window (explicitly target it)
    tmux send-keys -t "$window_index" "claude"
    tmux send-keys -t "$window_index" Enter

    # Wait for Claude to fully start before sending /start command
    sleep 2.5

    # Send /start reviewing with optional description (explicitly target window)
    if [[ -n "$description" ]]; then
        tmux send-keys -t "$window_index" "/start reviewing $description"
    else
        tmux send-keys -t "$window_index" "/start reviewing"
    fi
    tmux send-keys -t "$window_index" Enter
}

# Generic function to create a single-pane session layout
# This is a reusable helper for creating any session type
# Args: $1 = session_type (required: debugging, analysis, planning, etc.)
#       $2 = description (optional)
#       $3 = window_name (optional, auto-generated from session_type if not provided)
#       $4 = work_dir (optional, defaults to $CLAUDE_SESSION_DIR)
# Returns: 0 on success, 1 if not in tmux
tmux_create_session_layout() {
    local session_type="$1"
    local description="$2"
    local window_name="$3"
    local work_dir="${4:-$CLAUDE_SESSION_DIR}"

    if [[ -z "$session_type" ]]; then
        echo "Error: Session type required" >&2
        echo "Usage: tmux_create_session_layout <session_type> [description] [window_name] [work_dir]" >&2
        return 1
    fi

    if ! tmux_is_active; then
        echo "Error: Not in a tmux session" >&2
        return 1
    fi

    # Auto-generate window name if not provided
    if [[ -z "$window_name" ]]; then
        case "$session_type" in
            debugging)  window_name="🐛 debug" ;;
            analysis)   window_name="🔍 analysis" ;;
            planning)   window_name="📋 planning" ;;
            presenting) window_name="📊 presenting" ;;
            learning)   window_name="📚 learning" ;;
            personal)   window_name="🏠 personal" ;;
            *)          window_name="$session_type" ;;
        esac
    fi

    # Create new window
    tmux new-window -n "$window_name" -c "$work_dir"

    # Capture the new window index
    local window_index=$(tmux display-message -p '#I')

    # Start Claude in the new window
    tmux send-keys -t "$window_index" "claude"
    tmux send-keys -t "$window_index" Enter

    # Wait for Claude to fully start
    sleep 2.5

    # Send /start command with optional description
    if [[ -n "$description" ]]; then
        tmux send-keys -t "$window_index" "/start $session_type $description"
    else
        tmux send-keys -t "$window_index" "/start $session_type"
    fi
    tmux send-keys -t "$window_index" Enter
}

# Get list of all pane IDs in current window
# Returns: space-separated list of pane IDs (e.g., "0 1 2")
tmux_get_pane_list() {
    if ! tmux_is_active; then
        return 1
    fi

    tmux list-panes -F '#{pane_index}'
}

# Get the command currently running in a specific pane
# Args: $1 = pane index (optional, defaults to current pane)
# Returns: command name (e.g., "bash", "vim", "claude")
tmux_get_pane_command() {
    local pane_index="${1:-.}"

    if ! tmux_is_active; then
        return 1
    fi

    tmux display-message -t "$pane_index" -p '#{pane_current_command}'
}

# Check if a pane is running only a shell (idle/safe to close)
# Args: $1 = pane index
# Returns: 0 if idle (just shell), 1 if active process running
tmux_is_pane_idle() {
    local pane_index="$1"

    if [[ -z "$pane_index" ]]; then
        echo "Error: Pane index required" >&2
        return 2
    fi

    local command=$(tmux_get_pane_command "$pane_index")

    # Consider these shells as "idle" (safe to close without confirmation)
    case "$command" in
        bash|zsh|sh|fish|ksh)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Check if a pane is running Claude
# Args: $1 = pane index
# Returns: 0 if running Claude, 1 if not
tmux_is_claude_pane() {
    local pane_index="$1"

    if [[ -z "$pane_index" ]]; then
        echo "Error: Pane index required" >&2
        return 2
    fi

    local command=$(tmux_get_pane_command "$pane_index")

    [[ "$command" == "claude" ]]
}

# Get the pane index of the Claude pane in current window
# Returns: pane index if found, empty string if not found
tmux_find_claude_pane() {
    if ! tmux_is_active; then
        return 1
    fi

    local panes=$(tmux_get_pane_list)

    for pane in $panes; do
        if tmux_is_claude_pane "$pane"; then
            echo "$pane"
            return 0
        fi
    done

    return 1
}

# Check if a pane has unsaved work (editors, long-running commands)
# Args: $1 = pane index
# Returns: 0 if likely has unsaved work, 1 if safe to close
tmux_pane_has_unsaved_work() {
    local pane_index="$1"

    if [[ -z "$pane_index" ]]; then
        echo "Error: Pane index required" >&2
        return 2
    fi

    local command=$(tmux_get_pane_command "$pane_index")

    # List of commands that likely have unsaved work
    case "$command" in
        vim|nvim|emacs|nano|vi|code)
            return 0  # Editor - likely has unsaved work
            ;;
        node|python|ruby|irb|ipython)
            return 0  # Interactive interpreter - might have state
            ;;
        ssh|mosh)
            return 0  # Remote session - should confirm
            ;;
        tail|watch|top|htop|less|more)
            return 1  # Monitoring commands - safe to close
            ;;
        *)
            # For unknown commands, check if it's not a shell
            if tmux_is_pane_idle "$pane_index"; then
                return 1  # Just a shell - safe
            else
                return 0  # Unknown running command - be cautious
            fi
            ;;
    esac
}

# Close a specific pane with confirmation if it has active work
# Args: $1 = pane index
#       $2 = force close without confirmation (optional, "force")
# Returns: 0 on success, 1 on cancel/error
tmux_close_pane_safe() {
    local pane_index="$1"
    local force="${2:-}"

    if [[ -z "$pane_index" ]]; then
        echo "Error: Pane index required" >&2
        return 1
    fi

    if ! tmux_is_active; then
        echo "Error: Not in a tmux session" >&2
        return 1
    fi

    local command=$(tmux_get_pane_command "$pane_index")

    # If idle or force mode, close immediately
    if [[ "$force" == "force" ]] || tmux_is_pane_idle "$pane_index"; then
        tmux kill-pane -t "$pane_index"
        return 0
    fi

    # Check if pane might have unsaved work
    if tmux_pane_has_unsaved_work "$pane_index"; then
        echo "⚠️  Pane $pane_index is running: $command"

        # For editors, try to gracefully close
        case "$command" in
            vim|nvim|vi)
                echo "Sending :qa to vim..."
                tmux send-keys -t "$pane_index" Escape
                tmux send-keys -t "$pane_index" ":qa" Enter
                sleep 0.5
                # Check if pane still exists
                if tmux list-panes -F '#{pane_index}' | grep -q "^$pane_index$"; then
                    echo "⚠️  Vim has unsaved changes. Pane not closed."
                    return 1
                fi
                ;;
            emacs)
                echo "Sending quit command to emacs..."
                tmux send-keys -t "$pane_index" C-x C-c
                sleep 0.5
                if tmux list-panes -F '#{pane_index}' | grep -q "^$pane_index$"; then
                    echo "⚠️  Emacs has unsaved changes. Pane not closed."
                    return 1
                fi
                ;;
            *)
                echo "⚠️  Active process detected. Send Ctrl-C and close manually, or run with 'force' to kill."
                return 1
                ;;
        esac
    else
        # Safe to close
        tmux kill-pane -t "$pane_index"
    fi

    return 0
}

# Close all panes in the current window, Claude pane last
# Args: $1 = force close all without confirmation (optional, "force")
# Returns: 0 on success, 1 if some panes remain open
tmux_close_window_panes() {
    local force="${1:-}"

    if ! tmux_is_active; then
        echo "Error: Not in a tmux session" >&2
        return 1
    fi

    local claude_pane=$(tmux_find_claude_pane)
    local panes=$(tmux_get_pane_list)
    local pane_count=$(echo "$panes" | wc -w)

    if [[ $pane_count -eq 1 ]]; then
        echo "Only one pane in window - will close window"
        return 0
    fi

    echo "Closing $pane_count panes (Claude pane last)..."

    local failed_panes=()

    # Close non-Claude panes first
    for pane in $panes; do
        if [[ "$pane" != "$claude_pane" ]]; then
            echo "Closing pane $pane..."
            if ! tmux_close_pane_safe "$pane" "$force"; then
                failed_panes+=("$pane")
            fi
        fi
    done

    # Report any panes that couldn't be closed
    if [[ ${#failed_panes[@]} -gt 0 ]]; then
        echo ""
        echo "⚠️  The following panes could not be closed automatically:"
        for pane in "${failed_panes[@]}"; do
            local cmd=$(tmux_get_pane_command "$pane")
            echo "  - Pane $pane: $cmd"
        done
        echo ""
        echo "Please close these manually, or I can force-close them."
        return 1
    fi

    # Finally, close the Claude pane (current pane) - this closes the window
    if [[ -n "$claude_pane" ]]; then
        echo "Closing Claude pane (window will close)..."
        tmux kill-pane -t "$claude_pane"
    fi

    return 0
}

# Close the current tmux window safely
# This is the main entry point for wrapup
# Returns: 0 on success, 1 if window not closed
tmux_close_current_window() {
    if ! tmux_is_active; then
        echo "Not in a tmux session - nothing to close"
        return 0
    fi

    local window_info=$(tmux_get_window_info)
    echo "Closing tmux window: $window_info"
    echo ""

    # Try to close all panes (Claude last)
    if tmux_close_window_panes; then
        # Window should be closed now
        return 0
    else
        echo ""
        echo "Window not closed due to active panes."
        echo "Options:"
        echo "  1. Close panes manually and run /wrapup again"
        echo "  2. I can force-close all panes (may lose unsaved work)"
        echo ""
        return 1
    fi
}
