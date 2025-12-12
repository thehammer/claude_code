#!/bin/bash
# Bitbucket Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23
# DEPRECATED: 2025-10-25 - Migrated to Bitbucket MCP
#
# ==============================================================================
# ⚠️  DEPRECATED - Use Bitbucket MCP Tools Instead
# ==============================================================================
#
# Direct Bitbucket API functions have been removed in favor of MCP tools.
# Use the following MCP tools instead:
#
#   Workspaces:
#   - mcp__bitbucket__bb_ls_workspaces    - List workspaces
#   - mcp__bitbucket__bb_get_workspace    - Get workspace details
#
#   Repositories:
#   - mcp__bitbucket__bb_ls_repos         - List repositories
#   - mcp__bitbucket__bb_get_repo         - Get repository details
#   - mcp__bitbucket__bb_get_commit_history - Get commit history
#   - mcp__bitbucket__bb_list_branches    - List branches
#   - mcp__bitbucket__bb_add_branch       - Create new branch
#   - mcp__bitbucket__bb_get_file         - Get file content
#
#   Pull Requests:
#   - mcp__bitbucket__bb_ls_prs           - List pull requests
#   - mcp__bitbucket__bb_get_pr           - Get PR details
#   - mcp__bitbucket__bb_add_pr           - Create pull request
#   - mcp__bitbucket__bb_update_pr        - Update pull request
#   - mcp__bitbucket__bb_approve_pr       - Approve pull request
#   - mcp__bitbucket__bb_reject_pr        - Reject pull request
#   - mcp__bitbucket__bb_ls_pr_comments   - List PR comments
#   - mcp__bitbucket__bb_add_pr_comment   - Add PR comment
#
#   Search & Diff:
#   - mcp__bitbucket__bb_search           - Search code/repos
#   - mcp__bitbucket__bb_diff_branches    - Diff between branches
#   - mcp__bitbucket__bb_diff_commits     - Diff between commits
#
#   Pipelines:
#   - mcp__bitbucket__bb_list_pipelines   - List pipelines
#   - mcp__bitbucket__bb_get_pipeline     - Get pipeline details
#   - mcp__bitbucket__bb_list_pipeline_steps - List pipeline steps
#
# Instead of calling these functions directly, ask Claude Code to perform
# the operation using natural language. Claude will use the appropriate MCP tools.
#
# Migration date: 2025-10-25
# MCP Server: bitbucket-mcp-server (port 3001)
# Documentation: ~/.claude/mcp-servers/bitbucket/README.md
#
# ==============================================================================

# Test if Bitbucket credentials are configured (KEPT - still useful for scripts)
function bitbucket_is_configured() {
    # Support both new Access Tokens and legacy App Passwords
    local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"
    if [ -z "$bitbucket_token" ] || [ -z "$BITBUCKET_USERNAME" ]; then
        return 1
    fi
    return 0
}
