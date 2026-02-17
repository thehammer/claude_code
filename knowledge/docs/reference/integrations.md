---
tags:
  - integrations
  - reference
---

# Integrations

Third-party service integrations available in Claude Code.

## Available Integrations

### Jira
- Issue creation and management
- Status transitions
- Comments and worklogs
- Project browsing

### Bitbucket
- Repository management
- Pull request workflows
- Pipeline status
- Code search

### Slack
- Channel messaging
- Thread retrieval
- Message search
- DMs

### Datadog
- Log search
- Metrics queries
- Monitor management
- Slack URL → logs correlation

### Sentry
- Error tracking
- Issue management
- Event details
- Production issue monitoring

### GitHub
- Via `gh` CLI (native)
- PR management
- Issue tracking
- Repository operations

## Credentials

All credentials stored in `~/.claude/credentials/.env`:

```bash
# Jira
JIRA_API_TOKEN=...
JIRA_EMAIL=...
JIRA_BASE_URL=...

# Bitbucket
BITBUCKET_USERNAME=...
BITBUCKET_APP_PASSWORD=...

# Slack
SLACK_BOT_TOKEN=...

# Datadog
DATADOG_API_KEY=...
DATADOG_APP_KEY=...

# Sentry
SENTRY_API_TOKEN=...
```
