# Coding Session Startup

## Purpose
Building features, fixing bugs, implementing functionality, refactoring code.

## Context to Load

### 1. Git Status
```bash
git status
git branch --show-current
git log -5 --oneline
```

Summarize:
- Current branch
- Any uncommitted changes
- Recent commits

### 2. Open Pull Requests
Check for context on related work:
```bash
source ~/.claude/lib/integrations.sh && bitbucket_list_prs "portal_dev" | python3 -c "
import sys, json
data = json.load(sys.stdin)
my_prs = [pr for pr in data.get('values', []) if pr['author']['nickname'] == 'Hammer']
print(f'You have {len(my_prs)} open PRs:')
for pr in my_prs:
    state = 'DRAFT' if pr.get('draft') else 'Ready'
    print(f'  - PR #{pr[\"id\"]}: {pr[\"title\"]} ({state})')
"
```

### 3. Recent Session Notes
Look in `.claude/session-notes/coding/` for most recent note to understand:
- What we were working on last
- What's pending/in-progress
- Files that were changed

### 4. Project Context
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/coding.md` (if exists, coding-specific)

### 5. TODO Items
Check `.claude/todos/features.md` or `.claude/TODO.md` for planned work

## Integrations

### Pre-load (Always Available)
- **Git** - Already loaded via git commands above
- **Bitbucket** - Already sourced for PR list

### Load On-Demand (When Needed)
- **Sentry** - Only if investigating errors during coding
- **Datadog** - Only if checking logs/metrics
- **Jira** - Only if fetching ticket details
- **Confluence** - Only if reading documentation

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
