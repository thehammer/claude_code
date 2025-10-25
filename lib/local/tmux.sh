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
