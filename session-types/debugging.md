# Debugging Session Startup

## Purpose
Investigating errors, troubleshooting production issues, analyzing error patterns, fixing critical bugs.

## Context to Load

### 1. Integration Pre-Loading
**Load immediately** (debugging relies heavily on these):
```bash
source ~/.claude/lib/integrations.sh
```

Integrations available:
- ✅ **Sentry** - Error tracking and stack traces
- ✅ **Datadog** - Logs and metrics
- ✅ **Bitbucket** - For creating fix PRs

### 2. Recent Errors (Optional Quick Check)
Can optionally check for recent errors:
```bash
# Uncomment if you want to see recent errors at startup
# datadog_search_logs "status:error service:/ecs/portal_dev" "1h"
# sentry_list_issues "carefeed" "portal" "is:unresolved"
```

### 3. Git Status (Minimal)
```bash
git status
git branch --show-current
```

Only need to know:
- Current branch (to create fix branch if needed)
- Working tree status

### 4. Recent Debugging Notes
Look in `.claude/session-notes/debugging/` for:
- Recent issues investigated
- Patterns discovered
- Ongoing investigations

### 5. Project Context
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/debugging.md` (if exists)

## Integrations

### Pre-loaded (Always Available)
- **Sentry** - sentry_list_issues, sentry_get_issue, sentry_search_issues
- **Datadog** - datadog_search_logs, datadog_list_monitors, datadog_get_monitor
- **Bitbucket** - For creating PRs with fixes

### Load On-Demand
- **Jira** - To create bug tickets or link to existing ones
- **Confluence** - To update runbooks with findings
- **Slack** - To notify team of critical issues

### Skip Entirely
- Recent commits (not relevant to debugging)
- Open PRs (unless specifically asked)
- TODO items (focusing on immediate issue)

## Summary Format

Tell Hammer:
- **Last debugging session:** [date and what was investigated]
- **Integrations loaded:** Sentry, Datadog, Bitbucket
- **Current branch:** [branch name]
- **Recent patterns:** [if found in notes]

Then ask: "What issue would you like to investigate?" or "Which error should we debug?"

## Common Workflows

1. **Investigate Sentry Issue:**
   - Fetch issue details from Sentry
   - Query related Datadog logs
   - Find failing code
   - Analyze root cause
   - Create fix branch and PR

2. **Production Error Spike:**
   - Query Datadog for error patterns
   - Correlate with Sentry issues
   - Check recent deployments
   - Identify cause
   - Document findings

3. **Performance Issue:**
   - Query Datadog metrics
   - Analyze slow endpoints
   - Check database queries
   - Profile code sections
   - Optimize and test

## Token Budget Target
~12K tokens for startup (focused on error context, skip git history)

## Notes Template
Use `~/.claude/templates/session-notes/debugging.md` for session notes structure.
