# Slack Recipes

Recipes for working with Slack API to retrieve messages, manage channels, and integrate with team communication.

## Available Recipes

### retrieve-message.md
**Purpose:** Retrieve specific Slack messages or threads for investigation, documentation, or context gathering

**Use Cases:**
- Getting error reports from team channels
- Extracting feedback from discussions
- Investigating incidents with full context
- Documenting decisions made in Slack

**Key Features:**
- Parse Slack URLs automatically
- Handle private channel access issues
- Retrieve thread context
- Get surrounding messages for context

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

## Future Recipes

Potential additions:
- `post-message.md`: Send messages to channels
- `search-messages.md`: Search across channels
- `manage-channels.md`: Create and configure channels
- `user-lookup.md`: Find user information

## Related Documentation

- [Slack API Documentation](https://api.slack.com/methods)
- [OAuth Scopes Reference](https://api.slack.com/scopes)
- [Slack Helper Functions](/Users/hammer/.claude/lib/services/mcp-candidates/slack.sh)
