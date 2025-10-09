# Claude Code - External Integrations

This document describes the external services Claude can integrate with and how to use them.

## Setup

See [`~/.claude/credentials/README.md`](credentials/README.md) for setup instructions.

**Quick start:**
1. Add API tokens to `~/.claude/credentials/.env`
2. Configure features in `~/.claude/credentials/services/*.json`
3. Ask Claude to use the integration in your session

## Available Integrations

### 🎫 Jira - Issue Tracking

**What Claude can do:**
- Search for issues using JQL
- Read issue details (description, comments, status, assignee)
- Create new issues
- Update issue fields (status, assignee, labels, etc.)
- Add comments to issues
- Link related issues

**Example usage:**
```
"Show me all CORE issues assigned to me that are in progress"
"Create a Jira ticket for this bug with steps to reproduce"
"Update CORE-1234 to 'In Review' status"
"Add a comment to CORE-1234 with the fix details"
"What's blocking CORE-1234?"
```

**Configuration:** `~/.claude/credentials/services/jira.json`

**Common JQL patterns:**
- `assignee = currentUser() AND status != Done`
- `project = CORE AND created >= -7d`
- `status = "In Progress" AND assignee = currentUser()`

---

### 📚 Confluence - Documentation

**What Claude can do:**
- Search for pages across spaces
- Read page content and view hierarchy
- Create new pages
- Update existing pages
- Add comments to pages
- Check recent page updates

**Example usage:**
```
"Find the API documentation for the payment service in Confluence"
"Show me recent updates to the deployment runbook"
"Create a Confluence page documenting this new feature"
"Update the database migration guide with these new commands"
```

**Configuration:** `~/.claude/credentials/services/confluence.json`

---

### 🔀 Bitbucket - Code Repository

**What Claude can do:**
- List and search pull requests
- Read PR details (diff, comments, status)
- Create pull requests
- Add comments to PRs
- Approve pull requests
- Merge pull requests
- Check pipeline status

**Example usage:**
```
"Show me open PRs for portal_dev"
"Create a PR for this branch with a summary of the changes"
"Check the pipeline status for PR #1234"
"What are the review comments on PR #1234?"
```

**Configuration:** `~/.claude/credentials/services/bitbucket.json`

**Safety notes:**
- Creating PRs is relatively safe (requires review before merge)
- Approving/merging should be carefully controlled
- Claude will show you the PR before creating it

---

### 🐙 GitHub - Code Repository

**What Claude can do:**
- List and search pull requests
- Read PR details (diff, comments, checks)
- Create pull requests
- Add review comments
- Approve pull requests
- Merge pull requests
- Check GitHub Actions status
- Trigger workflow runs

**Example usage:**
```
"Show me open PRs assigned to me"
"Create a GitHub PR for this feature"
"Check the test status for PR #456"
"What did the CI/CD workflow say?"
```

**Configuration:** `~/.claude/credentials/services/github.json`

**Note:** GitHub CLI (`gh`) may already be configured on your system. Claude can use that if available.

---

### 💬 Slack - Team Communication

**What Claude can do:**
- List channels
- Post messages to channels
- Send deployment notifications
- Share updates to team channels

**Example usage:**
```
"Post a deployment notification to #deployments"
"Send a summary of these changes to #engineering"
"Notify the team about this incident in #alerts"
```

**Configuration:** `~/.claude/credentials/services/slack.json` (if created)

**Note:** The project already has a Slack service interface (`app/Services/Slack/`). This integration extends it for Claude's use.

---

### 🐛 Sentry - Error Tracking

**What Claude can do:**
- List organizations and projects
- Search for issues and errors
- Get issue details and event data
- Analyze error patterns and frequencies
- Correlate errors with deployments

**Example usage:**
```
"Show me unresolved production errors from Sentry"
"Get details on Sentry issue #12345"
"What are the most frequent errors this week?"
"Compare Sentry errors with Datadog logs"
```

**Helper functions:**
- `sentry_list_orgs` - List available organizations
- `sentry_list_projects <org>` - List projects in organization
- `sentry_list_issues <org> <project> [query]` - List issues with JQL-like query
- `sentry_get_issue <org> <project> <issue_id>` - Get issue details
- `sentry_search_issues <org> <search_term>` - Search across organization

**Configuration:** Uses `SENTRY_API_TOKEN` from `~/.claude/credentials/.env`

**Required scopes:** `project:read`, `event:read`, `org:read`

---

### 📊 Datadog - Monitoring & Logs

**What Claude can do:**
- Search logs across services and environments
- Query metrics and performance data
- List monitors and their status
- Analyze error patterns and correlate with Sentry
- Check service health and resource usage

**Example usage:**
```
"Search Datadog logs for errors in portal_dev from the last hour"
"Show me jobrunner errors from last Thursday at 3:15am"
"What monitors are currently alerting?"
"Compare Datadog errors with Sentry issues"
```

**Helper functions:**
- `datadog_search_logs <query> [timeframe]` - Search logs (supports 15m, 1h, 3h, 6h, 12h, 1d, 2d, 7d)
- `datadog_list_monitors` - List all monitors
- `datadog_get_monitor <monitor_id>` - Get monitor details
- `datadog_validate` - Test API connection

**Configuration:** Uses `DATADOG_API_KEY`, `DATADOG_APP_KEY`, `DATADOG_SITE` from `~/.claude/credentials/.env`

**Common queries:**
- `status:error service:/ecs/portal_dev` - Errors from portal_dev service
- `status:error (service:/ecs/portal_dev OR service:/ecs/jobrunner)` - Errors from both services
- `service:/ecs/jobrunner "DateTimeImmutable"` - Specific error pattern

---

## How Claude Uses Integrations

### Read Operations (Safe)

When you ask Claude to read from an external service:

1. Claude checks if credentials exist
2. Claude checks if read feature is enabled
3. Claude makes the API call
4. Claude shows you the results
5. Claude uses the information to help with your task

**No confirmation needed** - Read operations are non-destructive.

### Write Operations (Requires Care)

When you ask Claude to create/update content:

1. Claude checks if credentials exist
2. Claude checks if write feature is enabled
3. **Claude shows you what it will create/update**
4. Claude asks for confirmation (unless you've disabled prompts)
5. Claude makes the API call
6. Claude reports success/failure

**Confirmation recommended** - Write operations modify data.

### Destructive Operations (Dangerous)

Operations like merge, delete, or close:

1. Should be disabled by default (`features: { merge_prs: false }`)
2. Require explicit confirmation if enabled
3. Show full details of what will happen
4. Log the action for audit trail

**Keep disabled** unless you have a specific workflow need.

## Integration Workflows

### Workflow 1: Context Gathering

Use integrations to gather context at the start of a task:

```
"Read the Jira ticket CORE-1234 to understand the requirements"
→ Claude fetches issue details, reads description and comments
→ Uses this context to implement the feature correctly
```

### Workflow 2: Documentation Updates

Use integrations to update docs after completing work:

```
"Update the Confluence deployment guide with the new db:patch-schema command"
→ Claude finds the page, reads current content
→ Shows you the proposed changes
→ Updates the page after confirmation
```

### Workflow 3: PR Creation

Use integrations to create PRs with good context:

```
"Create a PR for this work, include the Jira ticket reference"
→ Claude analyzes commits, reads Jira ticket
→ Generates PR title and description
→ Shows you the PR details
→ Creates PR after confirmation
```

### Workflow 4: Team Communication

Use integrations to notify the team:

```
"Post a deployment summary to #deployments Slack channel"
→ Claude gathers deployment details (commits, changes)
→ Formats notification message
→ Shows you the message
→ Posts to Slack after confirmation
```

### Workflow 5: Status Monitoring

Use integrations to check on work status:

```
"Check if the pipeline passed for my latest PR"
→ Claude finds your PR, checks pipeline status
→ Reports results with details if there are failures
```

## Security & Privacy

### What Gets Accessed
- Only services you've configured with API tokens
- Only features you've explicitly enabled
- Only during active sessions when you're present

### What Gets Shared
- API calls are visible in the Claude session
- Claude shows you what data it's sending/receiving
- Write operations require confirmation

### What Doesn't Happen
- Claude cannot access services in the background
- Claude cannot respond to external events (Slack DMs, PR comments, etc.)
- Claude cannot act independently outside sessions

### Best Practices
1. **Use bot accounts** - Create dedicated service accounts for Claude
2. **Principle of least privilege** - Only enable features you'll use
3. **Start read-only** - Enable read features first, test, then enable write
4. **Audit regularly** - Review what Claude created/modified
5. **Rotate tokens** - Refresh API tokens periodically
6. **Revoke when done** - Remove tokens if you stop using an integration

## Troubleshooting

### "No credentials found for [service]"
→ Add API token to `~/.claude/credentials/.env`

### "Feature [feature] is disabled"
→ Enable in `~/.claude/credentials/services/[service].json`

### "Authentication failed"
→ Check token is valid, not expired, and has correct permissions

### "API rate limit exceeded"
→ Wait for rate limit to reset, or use a different token

### "Permission denied"
→ Token may not have required scopes/permissions

## Future Integration Ideas

Ideas for additional integrations (see `~/.claude/IDEAS.md` for details):

- **Linear** - Alternative issue tracker
- **Notion** - Alternative documentation
- **GitLab** - Alternative code repository
- **PagerDuty** - Incident management

---

## Quick Reference

| Service | Read | Create | Update | Danger |
|---------|------|--------|--------|--------|
| **Jira** | Issues, comments | Issues, comments | Status, fields | Close, delete |
| **Confluence** | Pages, content | Pages, comments | Content | Delete pages |
| **Bitbucket** | PRs, pipelines | PRs, comments | PR details | Approve, merge |
| **GitHub** | PRs, Actions | PRs, comments | PR details | Approve, merge |
| **Slack** | Channels | Messages | - | - |
| **Sentry** | Issues, events | - | - | - |
| **Datadog** | Logs, metrics | - | - | - |

**Legend:**
- **Read** - Safe, no confirmation needed
- **Create/Update** - Requires confirmation
- **Danger** - Should be disabled or tightly controlled

---

**Last Updated:** 2025-10-07
