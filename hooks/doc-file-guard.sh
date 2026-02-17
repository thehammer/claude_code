#!/bin/bash
# PreToolUse hook: Block creation of random markdown/text files
# Allows: README.md, CLAUDE.md, CONTRIBUTING.md, CHANGELOG.md, and files in docs/ or .claude/

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract file path and tool name
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Exit if no file path
[ -z "$FILE_PATH" ] && exit 0

# Only check Write tool (new file creation)
[ "$TOOL_NAME" != "Write" ] && exit 0

# Only check markdown and text files
if [[ "$FILE_PATH" =~ \.(md|txt)$ ]]; then
    FILENAME=$(basename "$FILE_PATH")
    DIRPATH=$(dirname "$FILE_PATH")

    # Allow list - common documentation files
    ALLOWED_FILES="README.md|CLAUDE.md|CONTRIBUTING.md|CHANGELOG.md|LICENSE.md|TODO.md|PREFERENCES.md|SESSION_START.md|WRAPUP.md"

    # Check if it's an allowed file
    if [[ "$FILENAME" =~ ^($ALLOWED_FILES)$ ]]; then
        exit 0
    fi

    # Check if it's in an allowed directory
    if [[ "$DIRPATH" =~ (docs|documentation|.claude|session-notes|templates|recipes)(/|$) ]]; then
        exit 0
    fi

    # Block the file creation
    echo "{\"decision\": \"block\", \"reason\": \"Creating random documentation files outside designated directories is blocked. Allowed: README.md, CLAUDE.md, CONTRIBUTING.md, CHANGELOG.md, or files in docs/, .claude/, session-notes/, templates/, recipes/ directories.\"}"
    exit 0
fi

exit 0
