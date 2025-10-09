# Claude Code - Recommended Permissions

This document lists commands that are safe to pre-approve for Claude Code to streamline workflows.

## How to Pre-Approve Commands

When Claude asks for permission to run a command, you can:
1. Click "Yes" - Approve this one time
2. Click "Yes, and don't ask again" - Pre-approve this command pattern

Once pre-approved, Claude can run similar commands without asking each time.

## Currently Pre-Approved

Based on system configuration, these patterns are already pre-approved:

### Testing & Development
- `php artisan test:*` - Run PHP tests
- `php:*` - PHP commands
- `composer install:*` - Install dependencies
- `composer require:*` - Add packages
- `composer show:*` - Show package info
- `make:*` - Make commands
- `chmod:*` - File permissions
- `mkdir:*` - Create directories
- `cat:*` - View file contents
- `test:*` - Test commands
- `env:*` - Environment commands
- `python3:*` - Python commands

### Git Operations
- `git add:*` - Stage changes
- `git commit:*` - Create commits
- `git reset:*` - Reset changes
- `git restore:*` - Restore files
- `git checkout:*` - Checkout branches
- `git branch:*` - Branch operations
- `git rebase:*` - Rebase commits
- `git cherry-pick:*` - Cherry-pick commits
- `git config:*` - Git configuration
- `git pull:*` - Pull changes
- `git merge:*` - Merge branches
- `git push:*` - Push changes
- `git stash:*` - Stash changes
- `git log:*` - View history

### Docker & Infrastructure
- `docker compose:*` - Docker Compose commands
- `docker logs:*` - View container logs
- `docker exec:*` - Execute in containers
- `docker ps:*` - List containers

### Database
- `mysql:*` - MySQL commands
- `mysqldump:*` - Database dumps

### File Operations
- `find:*` - Find files
- `mv:*` - Move files
- `pkill:*` - Kill processes
- `curl:*` - HTTP requests
- `gs:*` - Ghostscript
- `pdfinfo:*` - PDF info
- `tty` - Terminal info

### Read Access to Specific Paths
- `Read(//private/tmp/**)`
- `Read(//tmp/test-sftp-create-statement/test-create-statement-user/files/**)`
- `Read(//Users/hammer/Downloads/newDevFiles/SQLSetup/**)`
- `Read(//Users/hammer/Library/Application Support/Herd/config/php/81/**)`
- `Read(//Users/hammer/Library/**)`
- `Read(//Users/hammer/.claude/**)`

### Integration Helper Functions
- `source:*` - Source shell scripts
- `jira_whoami:*` - Jira API test
- `confluence_search:*` - Confluence search
- `bitbucket_list_prs:*` - List Bitbucket PRs
- `sentry_whoami:*` - Sentry API test
- `sentry_list_orgs` - List Sentry orgs
- `sentry_list_projects:*` - List Sentry projects
- `sentry_list_issues:*` - List Sentry issues
- `sentry_search_issues:*` - Search Sentry issues
- `sentry_get_issue:*` - Get Sentry issue details
- `sentry_get_issue_events:*` - Get Sentry issue events
- `sentry_list_production_issues:*` - List production issues
- `datadog_validate:*` - Datadog API test
- `datadog_search_logs:*` - Search Datadog logs
- `datadog_list_monitors:*` - List Datadog monitors
- `integration_status` - Check integration status

### Project-Specific
- `./test-concurrent.sh:*` - Test script
- `DB_DATABASE=carefeed_test_bootstrap php artisan db:bootstrap --force`
- `source ~/.claude/credentials/.env`
- `echo "Token loaded: $ATLASSIAN_API_TOKEN:0:20..."`
- `echo "Email: $ATLASSIAN_EMAIL"`
- `ATLASSIAN_EMAIL="..." ATLASSIAN_API_TOKEN="..." ...` (credential loading pattern)
- `echo:*` - Echo commands (for debugging)
- `awk:*` - Text processing
- `xargs cat:*` - Read multiple files

---

## Recommended Additional Permissions

For the integration workflows to work smoothly, consider pre-approving:

### API Integration Commands

#### Jira API Access
```bash
# Pattern to approve:
source:*
jira_*
curl:*
```

These are needed for:
- Loading integration helpers (`source ~/.claude/lib/integrations.sh`)
- Calling Jira helper functions (`jira_whoami`, `jira_search`, etc.)
- Making API requests (`curl -u "..." https://carefeed.atlassian.net/...`)

#### Confluence API Access
```bash
# Pattern to approve:
confluence_*
```

For searching and reading Confluence pages.

#### Integration Status Checks
```bash
# Pattern to approve:
integration_status
```

For checking which integrations are configured.

### Session Startup Commands

```bash
# Pattern to approve:
source ~/.claude/lib/integrations.sh
source ~/.claude/lib/integrations.sh --status
```

These are run at the start of every session to load credentials.

---

## How to Grant These Permissions

### Option 1: Interactive Approval
1. Wait for Claude to run the command
2. When prompted, click "Yes, and don't ask again"
3. Permission is saved for future sessions

### Option 2: VS Code Settings (if available)
Check VS Code settings for Claude Code configuration:
- Open VS Code Settings (⌘,)
- Search for "Claude" or "Claude Code"
- Look for permission/approval settings
- Add command patterns to allow list

### Option 3: Configuration File (if available)
If Claude Code supports a config file, add patterns there:
```json
{
  "claudeCode.allowedCommands": [
    "source ~/.claude/lib/integrations.sh*",
    "jira_*",
    "confluence_*",
    "integration_status"
  ]
}
```

---

## Security Considerations

### Safe to Pre-Approve
✅ **Read operations** - `cat`, `grep`, `find`, `Read` tool
✅ **Status checks** - `git status`, `docker ps`, API status calls
✅ **Helper functions** - Custom functions that wrap safe operations
✅ **Source scripts** - Loading scripts from `~/.claude/lib/`

### Require Confirmation
⚠️ **Write operations** - File edits, git commits (review before approving)
⚠️ **API writes** - Creating issues, posting messages (review the action)
⚠️ **Infrastructure changes** - Deployment, database operations

### Never Auto-Approve
❌ **Destructive operations** - `rm -rf`, `DROP DATABASE`, force push
❌ **Production changes** - Deployments, schema changes in prod
❌ **Credential exposure** - Commands that echo full tokens

---

## Workflow Examples

### With Pre-Approved Commands
```
You: "What Jira issues are assigned to me?"
Claude: [Automatically runs: source integrations.sh && jira_search "assignee=currentUser()"]
Claude: "You have 5 issues: CORE-1234, CORE-1235..."
```

### Without Pre-Approval
```
You: "What Jira issues are assigned to me?"
Claude: "I need to run: source ~/.claude/lib/integrations.sh"
[Permission prompt appears]
You: [Click "Yes, and don't ask again"]
Claude: [Runs command]
Claude: "You have 5 issues..."
```

---

## Maintenance

**Review periodically:**
- Check what commands are pre-approved
- Revoke any that seem risky
- Add new patterns as workflows evolve

**Update this file when:**
- New integration workflows are added
- New helper functions are created
- Security requirements change

---

**Last Updated:** 2025-10-07

**See Also:**
- `~/.claude/INTEGRATIONS.md` - Available integrations and usage
- `~/.claude/API_NOTES.md` - API implementation details
- `~/.claude/lib/integrations.sh` - Helper functions
