---
tags:
  - mcp
  - infrastructure
---

# MCP Servers

Model Context Protocol servers providing tools for Claude Code.

## Running Servers

| Server | Port | Purpose |
|--------|------|---------|
| Jira | 3000 | Jira issue management |
| Bitbucket | 3001 | Bitbucket repos and PRs |
| Session Memory | 3002 | Session history search |
| Slack | 3003 | Slack messaging |
| Datadog | 3004 | Logs and metrics |
| Sentry | 3005 | Error tracking |

## Management

```bash
# Start all MCPs
~/.claude/mcp-servers/bin/mcp-up --all

# Start specific MCPs
~/.claude/mcp-servers/bin/mcp-up slack datadog

# Check status
~/.claude/mcp-servers/bin/mcp-status

# Stop all MCPs
~/.claude/mcp-servers/bin/mcp-down --all
```

## Server Details

### Jira MCP
- **Port**: 3000
- **Endpoint**: `http://localhost:3000/mcp`
- **Tools**: `jira_ls_projects`, `jira_ls_issues`, `jira_get_issue`, `jira_create_issue`, etc.

### Bitbucket MCP
- **Port**: 3001
- **Endpoint**: `http://localhost:3001/mcp`
- **Tools**: `bb_ls_repos`, `bb_ls_prs`, `bb_get_pr`, `bb_add_pr`, etc.

### Session Memory MCP
- **Port**: 3002
- **Endpoint**: `http://localhost:3002/mcp`
- **Tools**: `search_sessions`, `list_sessions`, `get_session`, `get_session_commands`

### Slack MCP
- **Port**: 3003
- **Endpoint**: `http://localhost:3003/mcp`
- **Tools**: `slack_whoami`, `slack_list_channels`, `slack_get_history`, `slack_search`, `slack_post`

### Datadog MCP
- **Port**: 3004
- **Endpoint**: `http://localhost:3004/mcp`
- **Tools**: `datadog_validate`, `datadog_search_logs`, `datadog_logs_from_slack`, `datadog_query_metrics`

### Sentry MCP
- **Port**: 3005
- **Endpoint**: `http://localhost:3005/mcp`
- **Tools**: `sentry_whoami`, `sentry_list_projects`, `sentry_list_issues`, `sentry_get_issue`, `sentry_search`

## Configuration

Each MCP has its own `.env` file in its directory:

```
~/.claude/mcp-servers/
├── slack/.env      # SLACK_BOT_TOKEN
├── datadog/.env    # DATADOG_API_KEY, DATADOG_APP_KEY
├── sentry/.env     # SENTRY_API_TOKEN
└── ...
```

## Creating New MCPs

See [MCP Creation Guide](../guides/mcp-creation.md)
