# Auto-Approval Patterns for Claude Code

This document lists the bash command patterns that should be auto-approved for Claude Code to run without requiring user permission.

## How to Configure

These patterns should be added to your VSCode Claude Code extension settings. The exact location depends on your setup, but typically it's in:
- VSCode Settings → Extensions → Claude Code → Auto-approve commands
- Or in your VSCode `settings.json` under a key like `claude.autoApproveCommands`

## Recommended Patterns

### Integration Helper Functions

All functions from `~/.claude/lib/integrations.sh`:

```
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_*:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_*:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && jira_*:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && confluence_*:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && bitbucket_*:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && integration_status:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && parse_time_to_unix:*)
```

### Specific Datadog Functions

If you prefer granular control, approve individual Datadog functions:

```
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_validate:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_is_configured:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_list_monitors:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_get_monitor:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_get_metrics:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_search_logs:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_search_logs_chunked:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && datadog_search_traces:*)
```

### Specific Sentry Functions

```
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_whoami:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_is_configured:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_list_orgs:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_list_projects:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_list_issues:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_list_production_issues:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_search_issues:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_get_issue:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && sentry_get_issue_events:*)
```

### Specific Jira Functions

```
Bash(bash -c 'source ~/.claude/lib/integrations.sh && jira_whoami:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && jira_is_configured:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && jira_search:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && jira_get_issue:*)
```

### Specific Confluence Functions

```
Bash(bash -c 'source ~/.claude/lib/integrations.sh && confluence_is_configured:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && confluence_search:*)
```

### Specific Bitbucket Functions

```
Bash(bash -c 'source ~/.claude/lib/integrations.sh && bitbucket_is_configured:*)
Bash(bash -c 'source ~/.claude/lib/integrations.sh && bitbucket_list_prs:*)
```

### Already Configured (for reference)

These patterns appear to already be configured based on the system prompt:

```
Bash(source ~/.claude/credentials/.env)
Bash(echo "Token loaded: $ATLASSIAN_API_TOKEN:0:20...")
Bash(echo "Email: $ATLASSIAN_EMAIL")
```

## Complete Function List

All functions available in `~/.claude/lib/integrations.sh`:

**Datadog:**
- `datadog_is_configured`
- `datadog_validate`
- `datadog_list_monitors`
- `datadog_get_monitor`
- `datadog_get_metrics`
- `datadog_search_logs`
- `datadog_search_logs_chunked` (NEW - with rate limiting)
- `datadog_search_traces`

**Sentry:**
- `sentry_is_configured`
- `sentry_whoami`
- `sentry_list_orgs`
- `sentry_list_projects`
- `sentry_list_issues`
- `sentry_list_production_issues`
- `sentry_search_issues`
- `sentry_get_issue`
- `sentry_get_issue_events`

**Jira:**
- `jira_is_configured`
- `jira_whoami`
- `jira_search`
- `jira_get_issue`

**Confluence:**
- `confluence_is_configured`
- `confluence_search`

**Bitbucket:**
- `bitbucket_is_configured`
- `bitbucket_list_prs`

**Utilities:**
- `integration_status` - Show status of all integrations
- `parse_time_to_unix` - Convert time strings to Unix timestamps

## Why These Should Be Auto-Approved

These commands are:
1. **Read-only** - They query external APIs but don't modify data
2. **Safe** - They use authenticated API calls to services you control
3. **Non-destructive** - No file system changes, no code modifications
4. **Time-saving** - Eliminate constant permission prompts during analysis
5. **Rate-limited** - The chunked query function respects API rate limits

## Security Considerations

- All credentials are stored in `~/.claude/credentials/.env` which should be:
  - In `.gitignore`
  - Readable only by your user
  - Never committed to version control
- API tokens are scoped to read-only operations where possible
- Commands execute within your local shell environment
- No data is sent to Claude's servers (only command results are returned)

## Testing

After adding these patterns, test with:

```bash
bash -c 'source ~/.claude/lib/integrations.sh && datadog_validate'
bash -c 'source ~/.claude/lib/integrations.sh && sentry_whoami'
bash -c 'source ~/.claude/lib/integrations.sh && jira_whoami'
bash -c 'source ~/.claude/lib/integrations.sh && integration_status'
```

These should execute without requiring approval prompts.
