# Debugging Session Startup

## Purpose
Investigating errors, troubleshooting production issues, analyzing error patterns, fixing critical bugs.

## Context to Load

### 1. Verify Helper Scripts
**Optional:** Verify helper scripts are available.

**Why:** Debugging sessions heavily rely on:
- Sentry (error tracking, stack traces)
- Datadog (log search, metrics, monitors)
- Slack (reading error notifications, checking channels)
- Bitbucket/GitHub (creating fix PRs)
- Jira (bug ticket creation)

**All available as standalone scripts** in `~/.claude/bin/`

**Verify availability:**
```bash
ls ~/.claude/bin/services/{sentry,datadog,slack,bitbucket}/
```
Should show all available scripts for debugging services.

**Quick reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for all available functions.

### 2. Recent Errors (Optional Quick Check)
Can optionally check for recent errors:
```bash
# Uncomment if you want to see recent errors at startup
# ~/.claude/bin/services/datadog/search-logs "status:error service:/ecs/portal_dev" "1h"
# ~/.claude/bin/services/sentry/list-issues carefeed portal_dev "is:unresolved" 10
```

### 3. Git Status (Minimal)
```bash
git status
git branch --show-current
```

Only need to know:
- Current branch (to create fix branch if needed)
- Working tree status

### 4. Today's Calendar
Use the "Display Today's Calendar" recipe to show today's schedule:

```bash
m365 request --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T05:00:00Z&endDateTime=$(date -v+1d +%Y-%m-%d)T05:00:00Z" --method get | jq -r '.value | sort_by(.start.dateTime) | .[] | "\(.start.dateTime)|\(.end.dateTime)|\(.subject)|\(.organizer.emailAddress.name)"'
```

Format concisely:
- If no meetings: "📅 No meetings today"
- If meetings: "📅 Today's Schedule: [count] meetings ([first start] - [last end])"
- Show brief list - especially important for urgent debugging work

**Recipe reference:** `~/.claude/recipes/calendar/display-today-calendar.md`

### 5. Recent Debugging Notes
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
Loaded in step 1, immediately available:
- ✅ **Sentry** - Error tracking, issue details, event search
- ✅ **Datadog** - Log search, metrics, monitors, traces
- ✅ **Slack** - Read error notifications, check channels (use before Datadog for human messages!)
- ✅ **Jira** - Create bug tickets, link to issues
- ✅ **Bitbucket/GitHub** - Create fix PRs (detect from git remote)
- ✅ **Carefeed Helpers** - Branch names, ticket inference
- ✅ **AWS** - Resource inspection if needed
- ✅ **Notifications** - Alert user when investigation complete

**No need to re-load** - All 89 functions available from session start.

**Quick reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for function details.

**Important:** When asked about Slack channels, always try `slack_get_channel_messages` first. Only fall back to Datadog for application logs, not human messages.

## Summary Format

Tell Hammer:
- **Last debugging session:** [date and what was investigated]
- **Current branch:** [branch name]
- **📅 Today's Schedule:** [count] meetings ([time range]) or "No meetings today"
  - [Brief list: time - subject]
- **Integrations loaded:** Sentry, Datadog, Bitbucket
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
