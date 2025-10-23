#!/bin/bash
# Jira Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

# Helper Functions - Jira
# ==============================================================================
#
# NOTE: Direct Jira API functions have been removed in favor of MCP tools.
# Use the following MCP tools instead:
#
#   mcp__jira__jira_get_issue        - Get issue details (better formatting + dev info)
#   mcp__jira__jira_ls_issues        - Search issues with JQL
#   mcp__jira__jira_ls_projects      - List all projects
#   mcp__jira__jira_create_issue     - Create new issue
#   mcp__jira__jira_get_transitions  - Get available transitions (TO BE ADDED)
#   mcp__jira__jira_transition_issue - Move issue to new status (TO BE ADDED)
#   mcp__jira__jira_whoami           - Get current user info (TO BE ADDED)
#
# Carefeed-specific helper functions (branch naming, commit messages, etc.) remain
# available in ~/.claude/lib/carefeed.sh and are loaded automatically.
#
# ==============================================================================

# Test if Jira credentials are configured (kept for other scripts)
function jira_is_configured() {
    if [ -z "$ATLASSIAN_API_TOKEN" ] || [ -z "$ATLASSIAN_EMAIL" ]; then
        return 1
    fi
    return 0
}

# ==============================================================================
# Helper Functions - Confluence
