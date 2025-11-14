# Setting Up Slack User Token

**Goal:** Get a Slack user token that provides access to all channels you can see (no need to add bot to each channel).

**Last Updated:** 2025-11-14

## Quick Setup (Recommended)

### Option 1: OAuth App (Most Secure)

1. **Go to Slack Apps**: https://api.slack.com/apps

2. **Create or Select App**
   - If you have an existing app, select it
   - Otherwise, click "Create New App" → "From scratch"
   - Name it something like "Claude Code Integration"
   - Select your workspace

3. **Configure User OAuth Scopes**
   - Go to "OAuth & Permissions" in the sidebar
   - Scroll down to "User Token Scopes" section
   - Add these scopes:
     - `channels:history` - Read public channel messages
     - `channels:read` - List public channels
     - `groups:history` - Read private channel messages
     - `groups:read` - List private channels
     - `im:history` - Read DM messages
     - `mpim:history` - Read group DM messages
     - `search:read` - Search messages (optional but useful)

4. **Install/Reinstall App**
   - Scroll up to "OAuth Tokens for Your Workspace"
   - Click "Install to Workspace" (or "Reinstall App" if already installed)
   - Review permissions and click "Allow"

5. **Copy User OAuth Token**
   - You'll see "User OAuth Token" (starts with `xoxp-`)
   - Copy the entire token

6. **Add to Environment**
   ```bash
   # Add to ~/.claude/credentials/.env
   echo 'SLACK_USER_TOKEN=xoxp-your-token-here' >> ~/.claude/credentials/.env
   ```

### Option 2: Legacy Token (Quick but Deprecated)

⚠️ **Warning:** Legacy tokens have full access and are deprecated. Use Option 1 for production use.

1. Go to: https://api.slack.com/custom-integrations/legacy-tokens
2. Find your workspace and click "Create token"
3. Copy the `xoxp-` token
4. Add to `.env`:
   ```bash
   echo 'SLACK_USER_TOKEN=xoxp-your-token-here' >> ~/.claude/credentials/.env
   ```

## Testing Your Setup

```bash
# Source credentials
source ~/.claude/credentials/.env
source ~/.claude/lib/services/mcp-candidates/slack.sh

# Test authentication
slack_whoami | jq '.'

# Should show:
# {
#   "ok": true,
#   "url": "https://yourworkspace.slack.com/",
#   "team": "Your Team Name",
#   "user": "your_username",
#   ...
# }
```

## Verify Channel Access

```bash
# List channels you have access to
slack_list_conversations "public_channel,private_channel" 100 | \
    jq -r '.channels[] | "\(.id) - \(.name) (private: \(.is_private))"'
```

## Token Priority

The helper functions use this priority:
1. `SLACK_USER_TOKEN` (if set) - Broader access
2. `SLACK_BOT_TOKEN` (if set) - Limited to channels bot is in
3. Error if neither is set

You can have both tokens configured. User token will be preferred.

## Security Notes

### User Token Risks
- Acts as you across all of Slack
- Can read all channels you can access
- Can post messages as you
- **Store securely** - treat like a password

### Best Practices
- Use OAuth app (Option 1) with minimal scopes
- Don't commit tokens to git
- Store in `~/.claude/credentials/.env` (gitignored)
- Rotate tokens periodically
- Revoke tokens you're not using

### Scope Principles
Only add scopes you actually need:
- **Read-only access:** Just `*:history` and `*:read` scopes
- **Writing messages:** Add `chat:write`
- **User actions:** Add specific scopes as needed

## Troubleshooting

### "invalid_auth" Error
- Token may be expired or revoked
- Regenerate token from Slack app settings
- Verify token is correctly copied (starts with `xoxp-`)

### "missing_scope" Error
- Token doesn't have required permission
- Go back to OAuth & Permissions
- Add the missing scope under "User Token Scopes"
- Reinstall the app

### Still Getting "channel_not_found"
- Verify you're using the user token: `echo $SLACK_USER_TOKEN`
- Check if you actually have access to that channel in Slack
- Try with a channel you know you're in

## Example: Full Workflow

```bash
# 1. Set up credentials
source ~/.claude/credentials/.env
source ~/.claude/lib/services/mcp-candidates/slack.sh

# 2. Verify authentication
slack_whoami | jq '.ok'  # Should print: true

# 3. List your channels
slack_list_conversations "public_channel,private_channel" | \
    jq -r '.channels[] | .name'

# 4. Get a message
slack_get_history "C04KH8P1U0K" 5 | jq -r '.messages[0].text'
```

---

**Related Recipes:**
- `retrieve-message.md` - Retrieve specific Slack messages
- Main Slack recipes: `~/.claude/recipes/slack/`

**Version History:**
- 2025-11-14: Initial creation
