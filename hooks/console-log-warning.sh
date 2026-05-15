#!/bin/bash
# PostToolUse hook: Warn about console.log statements in edited files
# Helps catch debug statements before they're committed

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract file path
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit if no file path
[ -z "$FILE_PATH" ] && exit 0

# Only check JS/TS/JSX/TSX files (skip build scripts and CLI scripts)
if [[ "$FILE_PATH" =~ \.(js|jsx|ts|tsx)$ ]] && [[ ! "$FILE_PATH" =~ /scripts/ ]]; then
    # Check if file exists
    [ ! -f "$FILE_PATH" ] && exit 0

    # Look for console.log statements (excluding comments)
    # Simple grep - catches most cases
    CONSOLE_LOGS=$(grep -n "console\.log\|console\.debug\|console\.info" "$FILE_PATH" 2>/dev/null | grep -v "^\s*//" | head -5) || true

    if [ -n "$CONSOLE_LOGS" ]; then
        COUNT=$(echo "$CONSOLE_LOGS" | wc -l | tr -d ' ')
        # Format for display
        FORMATTED=$(echo "$CONSOLE_LOGS" | sed 's/^/  /')
        echo "{\"hookSpecificOutput\": {\"hookEventName\": \"PostToolUse\", \"additionalContext\": \"⚠️ Found $COUNT console statement(s) in $(basename "$FILE_PATH"):\\n$FORMATTED\\n\\nRemember to remove debug statements before committing.\"}}"
    fi
fi

exit 0
