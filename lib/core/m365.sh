#!/bin/bash
# Microsoft 365 CLI Integration with Auto-Authentication
#
# Wraps all m365 CLI commands with automatic authentication checking.
# If not authenticated, prompts user and initiates browser login before proceeding.
#
# Usage: Functions automatically once sourced - all m365 calls go through wrapper
#   m365 status
#   m365 request --url "..." --method get
#
# The wrapper is transparent - existing code works without modification.

# ==============================================================================
# Authentication Check Helper
# ==============================================================================

m365_is_authenticated() {
    # Check if m365 CLI is authenticated
    # Returns: 0 if authenticated, 1 if not

    local status_output
    status_output=$(command m365 status 2>&1)
    local exit_code=$?

    # Check if status command succeeded and returned connection info
    if [ $exit_code -eq 0 ] && echo "$status_output" | grep -q "connectedAs"; then
        return 0  # Authenticated
    else
        return 1  # Not authenticated
    fi
}

# ==============================================================================
# m365 Command Wrapper
# ==============================================================================

m365() {
    # Wrapper for m365 CLI that ensures authentication before executing commands
    #
    # Auto-handles:
    # - Authentication check before every command
    # - Browser login prompt if not authenticated
    # - User notification about browser approval requirement
    # - Transparent pass-through of all arguments to real m365 command

    # Skip auth check for login/logout/status commands (avoid infinite recursion)
    if [ "$1" = "login" ] || [ "$1" = "logout" ] || [ "$1" = "status" ]; then
        command m365 "$@"
        return $?
    fi

    # Check authentication status
    if ! m365_is_authenticated; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
        echo "⚠️  Microsoft 365 authentication required" >&2
        echo "" >&2
        echo "A browser window will open for you to approve the login." >&2
        echo "Please complete the authentication in your browser." >&2
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
        echo "" >&2

        # Attempt login
        if ! command m365 login; then
            echo "" >&2
            echo "❌ Authentication failed. Unable to proceed with m365 command." >&2
            return 1
        fi

        echo "" >&2
        echo "✅ Authentication successful! Proceeding with command..." >&2
        echo "" >&2
    fi

    # Execute the original command with all arguments
    command m365 "$@"
}

# ==============================================================================
# Export Functions
# ==============================================================================

export -f m365
export -f m365_is_authenticated
