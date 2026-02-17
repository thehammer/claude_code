---
title: Custom Agents Creation
tags:
  - session-note
  - agents
  - configuration
created: 2025-12-19
updated: 2025-12-19
---

# Custom Agents Creation

## Summary

Created 17 custom agents in `~/.claude/agents/` and updated all session types with "Available Agents" sections.

## Agents Created

### Investigation Agents
- `pipeline-debugger` - Debug Bitbucket pipeline failures
- `ecs-investigator` - Investigate ECS/container issues
- `datadog-agent` - Search Datadog logs and metrics
- `sentry-agent` - Investigate Sentry errors
- `slack-url-to-logs` - Find Datadog logs for Slack conversations

### Development Agents
- `pr-reviewer` - Review pull request diffs
- `test-writer` - Generate tests for code
- `codebase-explainer` - Explain how code works
- `laravel-expert` - Laravel-specific debugging
- `dependency-auditor` - Check for outdated/vulnerable deps

### Research Agents
- `git-historian` - Search git history
- `session-researcher` - Find context from past sessions
- `confluence-agent` - Search Confluence docs
- `confluence-reader` - Read specific Confluence pages

### Utility Agents
- `calendar-fetcher` - Get calendar events
- `jira-agent` - Work with Jira tickets
- `slack-retriever` - Retrieve Slack messages

## Session Type Updates

All 8 session types updated with "Available Agents" sections listing relevant agents for each context.
