# Coding Session Startup

## Purpose
Building features, fixing bugs, implementing functionality, refactoring code.

## Context to Load

### 1. Verify Helper Scripts
**Optional:** Verify helper scripts are available.

**Why:** Coding sessions frequently use:
- Jira MCP tools (ticket management)
- Bitbucket/GitHub (PR creation, pipeline checks)
- Slack (notifications)
- Carefeed helpers (branch names, commit messages)
- AWS, 1Password (deployment tools)

**All available as standalone scripts** in `~/.claude/bin/`

**Verify availability:**
```bash
ls ~/.claude/bin/services/*/
```
Should show all available service scripts (97 total scripts across 8 services).

**Quick reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for all available functions.

### 2. Git Status
```bash
git status
git branch --show-current
git log -5 --oneline
```

Summarize:
- Current branch
- Any uncommitted changes
- Recent commits

### 3. Today's Calendar
Use the "Display Today's Calendar" recipe to show today's schedule:

```bash
m365 request --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T05:00:00Z&endDateTime=$(date -v+1d +%Y-%m-%d)T05:00:00Z" --method get | jq -r '.value | sort_by(.start.dateTime) | .[] | "\(.start.dateTime)|\(.end.dateTime)|\(.subject)|\(.organizer.emailAddress.name)"'
```

Format concisely:
- If no meetings: "📅 No meetings today"
- If meetings: "📅 Today's Schedule: [count] meetings ([first start] - [last end])"
- Show brief list of meeting times and subjects

**Recipe reference:** `~/.claude/recipes/calendar/display-today-calendar.md`

### 4. Open Pull Requests
List open PRs across all Carefeed repositories:

```bash
~/.claude/bin/utilities/list-all-open-prs 10
```

This will show open PRs from:
- Bitbucket repos: portal_dev, family-portal
- GitHub repos: (if any configured)

**Note:** Now using standalone script instead of sourcing functions.

### 4. Recent Session Notes
Look in `.claude/session-notes/coding/` for most recent note to understand:
- What we were working on last
- What's pending/in-progress
- Files that were changed

### 5. Project Context
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/coding.md` (if exists, coding-specific)

### 6. TODO Items
Check `.claude/todos/features.md` or `.claude/TODO.md` for planned work

## Integrations

### Pre-loaded (Always Available)
Loaded in step 1 via modular loader, immediately available:
- ✅ **Jira MCP** - MCP tools for ticket management
- ✅ **Bitbucket** - Create PRs, check pipelines (for Bitbucket repos)
- ✅ **GitHub** - Create PRs, check Actions (for GitHub repos)
- ✅ **Slack** - Post notifications
- ✅ **Carefeed Helpers** - Branch names, commit messages, PR templates
- ✅ **AWS** - Resource access (auto-login if needed)
- ✅ **1Password** - Env var management
- ✅ **Sentry** - Error investigation
- ✅ **Datadog** - Log search, monitoring
- ✅ **Notifications** - Smart user notifications

**No need to re-load** - All functions available from session start via smart loader.

**Quick reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for function details.

## Summary Format

Tell Hammer:
- **Last coding session:** [date]
- **Current branch:** [branch name]
- **📅 Today's Schedule:** [count] meetings ([time range]) or "No meetings today"
  - [Brief list: time - subject]
- **Open PRs:** [count and status]
- **What we were working on:** [brief summary from notes]
- **Uncommitted changes:** [yes/no, what files]
- **Suggested next steps:**
  1. Continue [pending work]
  2. Address [any blockers]
  3. Start something new

Then ask: "What would you like to work on?"

## Token Budget Target
~15K tokens for startup (vs ~30K for full context load)

## Notes Template
Use `~/.claude/templates/session-notes/coding.md` for session notes structure.
