# Coding Session Startup

## Purpose
Building features, fixing bugs, implementing functionality, refactoring code.

## Context to Load

### 1. Load Integrations FIRST
**CRITICAL:** Load integrations at the very start of the session.

```bash
source ~/.claude/lib/integrations.sh
```

**Why:** Coding sessions frequently need:
- Jira (ticket creation, reading requirements)
- Bitbucket/GitHub (PR creation, pipeline checks)
- Slack (notifications)
- Carefeed helpers (branch names, commit messages)

**Verify availability:**
```bash
declare -F | grep -c "bitbucket_\|jira_\|slack_\|github_\|carefeed_"
```
Should show 30+ functions loaded.

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

### 3. Open Pull Requests
Check for context on related work:

**Step 1:** Detect git hosting service
```bash
git remote get-url origin
```

**Step 2:** List PRs based on service
- If Bitbucket: `bitbucket_list_prs "OPEN" 10`
- If GitHub: `github_list_prs "open" 10`

**Important:** Integrations are already loaded from step 1, so these functions are immediately available.

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
Loaded in step 1, immediately available:
- ✅ **Jira** - Create tickets, read requirements
- ✅ **Bitbucket** - Create PRs, check pipelines (for Bitbucket repos)
- ✅ **GitHub** - Create PRs, check Actions (for GitHub repos)
- ✅ **Slack** - Post notifications
- ✅ **Carefeed Helpers** - Branch names, commit messages, PR templates
- ✅ **AWS** - Resource access (auto-login if needed)
- ✅ **1Password** - Env var management
- ✅ **Sentry** - Error investigation
- ✅ **Datadog** - Log search, monitoring
- ✅ **Notifications** - Smart user notifications

**No need to re-load** - All 89 functions available from session start.

**Quick reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for function details.

## Summary Format

Tell Hammer:
- **Last coding session:** [date]
- **Current branch:** [branch name]
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
