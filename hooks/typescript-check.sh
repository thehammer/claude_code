#!/bin/bash
# PostToolUse hook: TypeScript validation after editing .ts/.tsx files
# Runs tsc --noEmit to catch type errors immediately

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract file path
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit if no file path
[ -z "$FILE_PATH" ] && exit 0

# Only check TypeScript files
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
    # Check if file exists
    [ ! -f "$FILE_PATH" ] && exit 0

    # Find tsconfig.json (walk up from file)
    DIR=$(dirname "$FILE_PATH")
    TSCONFIG=""
    while [ "$DIR" != "/" ]; do
        if [ -f "$DIR/tsconfig.json" ]; then
            TSCONFIG="$DIR/tsconfig.json"
            break
        fi
        DIR=$(dirname "$DIR")
    done

    # Run tsc if we found a tsconfig
    if [ -n "$TSCONFIG" ]; then
        cd "$(dirname "$TSCONFIG")"

        # Run tsc and capture output (limit to 10 errors)
        TSC_OUTPUT=$(npx tsc --noEmit 2>&1 | head -20) || true

        if [ -n "$TSC_OUTPUT" ] && echo "$TSC_OUTPUT" | grep -q "error TS"; then
            ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || echo "0")
            echo "{\"hookSpecificOutput\": {\"hookEventName\": \"PostToolUse\", \"additionalContext\": \"⚠️ TypeScript errors ($ERROR_COUNT found):\\n$TSC_OUTPUT\"}}"
        fi
    fi
fi

exit 0
