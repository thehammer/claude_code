# Coding Session Startup

## Purpose
Building features, fixing bugs, implementing functionality, refactoring code.

## Context to Load at Startup

### 1. Git Status

```bash
git rev-parse --is-inside-work-tree &>/dev/null && \
echo "Branch: $(git branch --show-current)" && \
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "Working directory clean"
else
    echo "Uncommitted changes present"
fi
```

### 2. Project Preferences

Read cascading preferences (don't output):
1. `~/.claude/PREFERENCES.md`
2. `.claude/preferences/PREFERENCES.md` (if exists)
3. `.claude/preferences/coding.md` (if exists)

## On-Demand Context

Load additional context only when the user asks. Available slash commands:
- `/calendar` - Today's schedule
- `/prs` - Open pull requests
- `/notes` - Recent session notes
- `/todos` - TODO items
- `/full-context` - Load everything

## Summary Format

```
Coding Session Started

Branch: [branch-name] ([clean/uncommitted changes])

What would you like to work on?
```

Keep it concise. Don't pre-load calendar, PRs, notes, or TODOs unless asked.
