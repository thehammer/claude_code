#!/bin/bash
#
# DEPRECATED: This file is deprecated as of 2025-10-23
#
# The monolithic integrations.sh has been reorganized into a modular structure.
# Please update your scripts to use the new loader:
#
#   OLD: source ~/.claude/lib/integrations.sh
#   NEW: source ~/.claude/lib/core/loader.sh [session-type]
#
# This backward-compatibility wrapper will be removed on: 2025-11-15
#
# ==============================================================================

echo "⚠️  Warning: integrations.sh is deprecated" >&2
echo "    The helper functions have been reorganized into categories." >&2
echo "    Update to: source ~/.claude/lib/core/loader.sh [session-type]" >&2
echo "" >&2
echo "    Loading all functions for backward compatibility..." >&2
echo "" >&2

# Load everything for backward compatibility
source ~/.claude/lib/core/loader.sh --all
