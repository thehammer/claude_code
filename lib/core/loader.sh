#!/bin/bash
# Claude Code - Smart Helper Loader
#
# Intelligently loads helper functions based on session type and project context.
# Replaces the monolithic integrations.sh with modular, category-based loading.
#
# Usage:
#   source ~/.claude/lib/core/loader.sh [session-type]
#   source ~/.claude/lib/core/loader.sh coding
#   source ~/.claude/lib/core/loader.sh --all
#
# Session types: coding, debugging, analysis, planning, presenting, learning, personal, clauding
# Use --all to load everything (backward compatibility)

# ==============================================================================
# Core Loading (Always)
# ==============================================================================

# Load credentials first
if [ -f ~/.claude/lib/core/credentials.sh ]; then
    source ~/.claude/lib/core/credentials.sh
fi

# Load core utilities
if [ -f ~/.claude/lib/core/utilities.sh ]; then
    source ~/.claude/lib/core/utilities.sh
fi

# ==============================================================================
# Local System Helpers (Always)
# ==============================================================================

# macOS automation helpers
if [ -f ~/.claude/lib/local/macos.sh ]; then
    source ~/.claude/lib/local/macos.sh
fi

# VSCode UI automation
if [ -f ~/.claude/lib/local/vscode.sh ]; then
    source ~/.claude/lib/local/vscode.sh
fi

# Tmux integration helpers
if [ -f ~/.claude/lib/local/tmux.sh ]; then
    source ~/.claude/lib/local/tmux.sh
fi

# Study tracker (for learning/analysis)
if [ -f ~/.claude/lib/local/study-tracker.sh ]; then
    source ~/.claude/lib/local/study-tracker.sh
fi

# ==============================================================================
# Convention Helpers (Context-Aware)
# ==============================================================================

# Carefeed conventions (if in Carefeed project)
if [ -f ~/.claude/lib/conventions/carefeed.sh ]; then
    # Check if we're in a Carefeed project
    if [ -f "composer.json" ] && grep -q "carefeed" composer.json 2>/dev/null; then
        source ~/.claude/lib/conventions/carefeed.sh
    elif git remote get-url origin 2>/dev/null | grep -q "Bitbucketpassword1\|carefeed"; then
        source ~/.claude/lib/conventions/carefeed.sh
    fi
fi

# ==============================================================================
# Service API Helpers (Session-Aware)
# ==============================================================================

# Get session type from parameter
SESSION_TYPE="${1:-}"

# Determine if we should load services
LOAD_SERVICES=false

case "$SESSION_TYPE" in
    --all)
        # Backward compatibility: load everything
        LOAD_SERVICES=true
        ;;
    coding|debugging)
        # These sessions need full integration access
        LOAD_SERVICES=true
        ;;
    analysis|planning|presenting)
        # These might need integrations, load them
        LOAD_SERVICES=true
        ;;
    learning|personal)
        # Usually don't need external services
        LOAD_SERVICES=false
        ;;
    clauding)
        # Clauding only needs local tools, skip services
        LOAD_SERVICES=false
        ;;
    "")
        # No session type specified, load services for safety
        LOAD_SERVICES=true
        ;;
esac

if [ "$LOAD_SERVICES" = true ]; then
    # MCP Integration Helpers
    if [ -f ~/.claude/lib/mcp/jira_helpers.sh ]; then
        source ~/.claude/lib/mcp/jira_helpers.sh
    fi

    # Bash CLI Wrappers (always available)
    if [ -f ~/.claude/lib/services/_bash/aws.sh ]; then
        source ~/.claude/lib/services/_bash/aws.sh
    fi

    if [ -f ~/.claude/lib/services/_bash/onepassword.sh ]; then
        source ~/.claude/lib/services/_bash/onepassword.sh
    fi

    if [ -f ~/.claude/lib/services/_bash/confluence.sh ]; then
        source ~/.claude/lib/services/_bash/confluence.sh
    fi

    # MCP Candidates (will convert to MCP in Phase 2)
    if [ -f ~/.claude/lib/services/mcp-candidates/bitbucket.sh ]; then
        source ~/.claude/lib/services/mcp-candidates/bitbucket.sh
    fi

    if [ -f ~/.claude/lib/services/mcp-candidates/slack.sh ]; then
        source ~/.claude/lib/services/mcp-candidates/slack.sh
    fi

    if [ -f ~/.claude/lib/services/mcp-candidates/sentry.sh ]; then
        source ~/.claude/lib/services/mcp-candidates/sentry.sh
    fi

    if [ -f ~/.claude/lib/services/mcp-candidates/datadog.sh ]; then
        source ~/.claude/lib/services/mcp-candidates/datadog.sh
    fi

    if [ -f ~/.claude/lib/services/mcp-candidates/github.sh ]; then
        source ~/.claude/lib/services/mcp-candidates/github.sh
    fi
fi

# ==============================================================================
# Loader Complete
# ==============================================================================

# Optional: Print loading summary if DEBUG is set
if [ -n "$CLAUDE_LOADER_DEBUG" ]; then
    echo "✓ Claude Code helpers loaded (session: ${SESSION_TYPE:-default})"
    echo "  - Core: credentials, utilities"
    echo "  - Local: macOS, VSCode, study-tracker"
    echo "  - Conventions: $([ -f ~/.claude/lib/conventions/carefeed.sh ] && [ -d .git ] && echo "Carefeed" || echo "none")"
    echo "  - Services: $([ "$LOAD_SERVICES" = true ] && echo "all" || echo "skipped")"
fi
