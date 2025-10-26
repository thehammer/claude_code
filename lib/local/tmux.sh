#!/bin/bash
# Tmux integration helpers for Claude Code
# Provides low-level utilities for tmux detection and control

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
