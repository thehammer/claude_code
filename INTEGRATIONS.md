# Claude Code - External Integrations

This document describes the external services Claude can integrate with and how to use them.

## Quick Reference

**👉 For a complete function catalog with examples, see [`INTEGRATIONS_REFERENCE.md`](INTEGRATIONS_REFERENCE.md)**

The reference file provides:
- All 89+ functions organized by service
- Quick lookup tables with usage examples
- When to use which service (e.g., Bitbucket vs GitHub)
- Common workflows and troubleshooting

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
- **Send direct messages to notify you when tasks complete**
- Send progress updates for long-running tasks

**Example usage:**
```
"Post a deployment notification to #deployments"
"Send a summary of these changes to #engineering"
"Notify the team about this incident in #alerts"
"Notify me when the tests finish"
"Let me know when this completes"
"Ping me when the build is ready"
```

**Helper functions:**
- `slack_send_dm <user_id> <message>` - Send direct message
- `slack_post_message <channel> <message>` - Post to channel
- `slack_notify_completion <task> <status> <duration> <details>` - Formatted completion notification
- `slack_notify_progress <task> <progress> <step> <time>` - Progress update
- `notify_user <task> <status> <duration> <details>` - Smart notification (tries Slack, falls back to macOS)

**Configuration:**
- `~/.claude/credentials/services/slack.json` - API credentials
- `~/.claude/PREFERENCES.md` - Set your Slack User ID for notifications
- See [NOTIFICATIONS.md](NOTIFICATIONS.md) for complete notification setup

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

---

### ☁️ AWS - Cloud Infrastructure

**What Claude can do:**
- Check authentication status across accounts
- Execute AWS CLI commands with proper profile
- Auto-login when SSO session expires
- Query resources across Production, Non-Production, and Shared Services accounts

**Account Setup:**
- **Production** (535508986415): prod-developers, prod-readonly
- **Non-Production** (635039533305): nonprod-developers, nonprod-readonly
- **Shared Services** (851765305742): shared-developers, shared-readonly

**Helper Functions:**
```bash
aws_login                           # Login to AWS SSO (covers all accounts)
aws_status                          # Check authentication status
aws_whoami "prod-developers"        # Show current identity for profile
aws_exec "prod-developers" s3 ls   # Execute AWS command (auto-login if needed)
aws_list_profiles                   # List all available profiles
aws_select_profile                  # Interactive profile selector
aws_get_account_name "prod-developers"  # Get account name from profile
aws_get_account_id "prod-developers"    # Get account ID from profile
```

**Example usage:**
```
"Check what S3 buckets are in production"
→ Claude runs: aws_exec "prod-developers" s3 ls

"Show me the EC2 instances in non-production"
→ Claude runs: aws_exec "nonprod-developers" ec2 describe-instances

"What AWS account am I authenticated to?"
→ Claude runs: aws_whoami "prod-developers"
```

**Authentication:**
- Uses AWS SSO with shared "hammer" session
- One login covers all 6 profiles (3 accounts × 2 roles)
- Sessions last 8-12 hours typically
- Auto-relogin prompts when expired

**Profile Naming Convention:**
- `{environment}-{role}`
- Examples: `prod-developers`, `nonprod-readonly`, `shared-developers`
- Semantic names instead of account IDs for easier tooling

**Configuration:** `~/.aws/config` (managed via AWS CLI)

**Safety:**
- Read operations: Safe, no confirmation needed
- Write operations: Should be confirmed, especially in production
- Destructive operations: Should require explicit confirmation

---

### 🔐 1Password - Environment Variable Management

**What Claude can do:**
- Deploy environment variables from 1Password to S3
- Download/view environment files from S3
- Check environment file status and timestamps
- List all environment files in S3 buckets

**How it works:**
1. Environment variables stored in 1Password (specific format required)
2. AWS Lambda reads from 1Password, writes to S3
3. ECS containers load `.env` files from S3 at startup

**Helper Functions:**
```bash
onepass_deploy_env "nonprod-developers" "admin-portal-dev"  # Deploy single config
onepass_deploy_all_dev                                       # Deploy all dev configs
onepass_deploy_all_prod                                      # Deploy all prod configs (confirms first)
onepass_download_env "nonprod-developers" "portal.env"      # Download to local file
onepass_view_env "nonprod-developers" "portal.env"          # View without downloading
onepass_check_env "nonprod-developers" "portal.env"         # Check file metadata
onepass_list_env_files "nonprod-developers"                 # List all env files
```

**Example usage:**
```
"Deploy the latest environment variables to dev"
→ Claude runs: onepass_deploy_all_dev

"Check when portal.env was last updated in staging"
→ Claude runs: onepass_check_env "nonprod-developers" "portal.env"

"Show me the current SENTRY_DSN value in dev"
→ Claude runs: onepass_view_env "nonprod-developers" "portal.env" | grep SENTRY_DSN
```

**1Password Entry Format (CRITICAL):**
- **Entry Type:** Login (not Secure Note or Password)
- **Title:** Variable name (e.g., `SENTRY_DSN`)
- **Username:** Variable name (e.g., `SENTRY_DSN`)
- **Password:** Variable value (e.g., `https://abc123@sentry.io/456`)
- **Tags:** Service tags (e.g., `admin-portal-dev`, `queue-production`)

**Configuration:**
- Local: `tools/1password/*.json` files
- Lambda: `1password-env-writer` in AWS
- S3 Buckets: `cf-staging-env-files`, `cf-production-env-files`

**Documentation:** See project-specific `.claude/ENVIRONMENT_VARIABLES.md` for complete details

**Safety:**
- Read operations (download/view): Safe, no confirmation needed
- Deploy dev: Requires AWS authentication, affects dev only
- Deploy production: Requires explicit "yes" confirmation
- Never commits `.env` files to git

---

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
| **AWS** | Resources, status | Resources | Config changes | Deletions |
| **1Password** | Env files, status | - | Deploy vars | - |

**Legend:**
- **Read** - Safe, no confirmation needed
- **Create/Update** - Requires confirmation
- **Danger** - Should be disabled or tightly controlled

---

**Last Updated:** 2025-10-14
