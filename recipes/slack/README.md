# Slack Recipes

Recipes for working with Slack API.

## Available Recipes

### setup-user-token.md
**Purpose:** One-time setup guide for Slack OAuth user tokens

**Use Cases:**
- Initial Slack integration setup
- Token refresh/renewal
- Onboarding new environments

## Prerequisites

All Slack recipes require:
- `SLACK_BOT_TOKEN` configured in `~/.claude/credentials/.env`
- Slack helper functions in `~/.claude/lib/services/mcp-candidates/slack.sh`

## Common Patterns

### Load Slack Functions
```bash
source ~/.claude/credentials/.env
source ~/.claude/lib/services/mcp-candidates/slack.sh
```

### Convert Slack URL to Timestamp
```bash
# URL format: https://workspace.slack.com/archives/CHANNEL/pTIMESTAMP
# Extract: TIMESTAMP_RAW from pTIMESTAMP
# Convert: Insert decimal point 6 digits from end
# Example: p1763130898936749 → 1763130898.936749
```

### Common Errors
- `channel_not_found`: Bot needs to be added to the channel
- `missing_scope`: Bot token needs additional OAuth scopes
- `invalid_auth`: Check SLACK_BOT_TOKEN is set correctly

## Related

- Message retrieval is handled by the `slack-retriever` agent
- Slack-to-logs workflow is handled by the `slack-url-to-logs` agent
- [Slack API Documentation](https://api.slack.com/methods)
- [Slack Helper Functions](/Users/hammer/.claude/lib/services/mcp-candidates/slack.sh)
