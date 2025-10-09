# Claude Code - Credentials Management

This directory stores API credentials and service configurations for Claude Code integrations.

## Security

**⚠️ IMPORTANT:**
- This directory contains sensitive credentials
- Never commit this directory to git (should be in global `.gitignore`)
- File permissions should be restrictive (600 for files, 700 for directory)
- Credentials are only used during active Claude sessions when you're present
- You can revoke tokens at any time from the respective service settings

## Structure

```
credentials/
├── .env                    # API tokens and secrets
├── README.md              # This file
└── services/              # Service-specific configurations
    ├── jira.json
    ├── confluence.json
    ├── bitbucket.json
    └── github.json
```

## Setup Instructions

### 1. Add API Tokens

Edit `.env` and add your API tokens following the instructions in that file:

```bash
nano ~/.claude/credentials/.env
```

Each service has detailed instructions with URLs for obtaining credentials.

### 2. Configure Service Features

Edit the JSON files in `services/` to enable/disable specific features:

```bash
# Example: Enable Jira issue reading
nano ~/.claude/credentials/services/jira.json
# Set "read_issues": true
```

**Recommended starting point:**
- Enable **read-only** features first (safe)
- Test Claude's behavior before enabling write features
- Keep destructive features (merge, delete) disabled

### 3. Verify Setup

Check that credentials are loaded:

```bash
# Verify file permissions
ls -la ~/.claude/credentials/
# Should show: drwx------ (700) for directory
#              -rw------- (600) for .env file

# Test with Claude
# In a Claude session, ask: "Can you check what integrations are configured?"
```

## Available Integrations

### Jira
- **Read:** Search issues, view issue details, check status
- **Write:** Create issues, update fields, add comments, link issues

### Confluence
- **Read:** Search pages, view content, check recent updates
- **Write:** Create pages, update content, add comments

### Bitbucket
- **Read:** View PRs, check pipeline status, review comments
- **Write:** Create PRs, add comments, approve, merge

### GitHub
- **Read:** View PRs, check Actions status, review comments
- **Write:** Create PRs, add comments, approve, merge, trigger workflows

### Slack
- **Read:** List channels
- **Write:** Post messages to channels (for deployment notifications, etc.)

## Feature Flags

Each service JSON has a `features` object. Set to `true`/`false` to control what Claude can do:

- `read_*` - Safe, read-only operations
- `create_*` - Create new content (PRs, issues, pages)
- `update_*` - Modify existing content
- `comment_*` - Add comments
- `approve_*` - Approve PRs
- `merge_*` - **Dangerous** - Merge code
- `trigger_*` - Trigger CI/CD pipelines

## Usage in Sessions

Once configured, you can ask Claude to:

```
"Check Jira for issues assigned to me"
"Read the API documentation page from Confluence"
"Show me open PRs on Bitbucket"
"Create a draft PR with these changes"
"Post a deployment notification to Slack"
```

Claude will:
1. Check if credentials exist for the service
2. Check if the requested feature is enabled
3. Confirm with you before write operations (unless you disabled prompts)
4. Show you the API call being made
5. Report the results

## Revoking Access

To revoke Claude's access to a service:

1. **Remove the token from `.env`**
2. **Revoke from the service:**
   - Jira/Confluence: https://id.atlassian.com/manage-profile/security/api-tokens
   - Bitbucket: https://bitbucket.org/account/settings/app-passwords/
   - GitHub: https://github.com/settings/tokens
   - Slack: https://api.slack.com/apps (your app > OAuth & Permissions)

## Troubleshooting

### "Permission denied" errors
- Check file permissions: `chmod 600 ~/.claude/credentials/.env`
- Check directory permissions: `chmod 700 ~/.claude/credentials`

### API authentication failures
- Verify token is not expired
- Check username/email is correct
- Ensure no extra whitespace in credentials
- Test token with curl/Postman to verify it works

### Feature not working
- Check if feature is enabled in service JSON
- Verify required token exists in `.env`
- Check Claude's session output for specific error messages

## Best Practices

1. **Start conservative** - Enable read-only features first
2. **Test incrementally** - Enable one feature at a time
3. **Monitor usage** - Watch what Claude does in sessions
4. **Rotate tokens** - Periodically refresh API tokens
5. **Use bot accounts** - Consider dedicated service accounts for Claude
6. **Audit trail** - Review what Claude created/modified regularly

---

**Last Updated:** 2025-10-06
