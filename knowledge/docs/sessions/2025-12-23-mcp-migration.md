---
title: MCP Server Migration - Slack, Datadog, Sentry
tags:
  - session-note
  - mcp
  - migration
created: 2025-12-23
updated: 2025-12-23
---

# MCP Server Migration

## Summary

Converted shell-based integrations to proper MCP servers: Slack, Datadog, and Sentry.

## What Was Built

### Slack MCP (Port 3003)
- Tools: `slack_whoami`, `slack_list_channels`, `slack_get_history`, `slack_get_thread`, `slack_search`, `slack_get_user`, `slack_find_channel`, `slack_get_message`, `slack_post`, `slack_dm`
- Requires: `SLACK_BOT_TOKEN`

### Datadog MCP (Port 3004)
- Tools: `datadog_validate`, `datadog_search_logs`, `datadog_logs_from_slack`, `datadog_query_metrics`, `datadog_list_monitors`, `datadog_get_monitor`
- Requires: `DATADOG_API_KEY`, `DATADOG_APP_KEY`

### Sentry MCP (Port 3005)
- Tools: `sentry_whoami`, `sentry_list_projects`, `sentry_list_issues`, `sentry_production_issues`, `sentry_get_issue`, `sentry_get_events`, `sentry_search`
- Requires: `SENTRY_API_TOKEN`

## Technical Fixes

1. **TypeScript compilation** - Changed `strict: false`, `declaration: false` to avoid MCP SDK type explosion
2. **Type assertion pattern** - Used `(server as any).tool.bind(server)` to bypass Zod + MCP SDK type issues
3. **Dockerfile fix** - Need all deps for build, then prune to production
4. **ES module fix** - Removed `require.main === module` check

## Migration Status

- ✅ Slack, Datadog, Sentry converted
- ⏭️ GitHub skipped (gh CLI already works well)
- ⏭️ Bitbucket already had MCP
