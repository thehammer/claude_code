# Coding Session Startup

## Purpose
Building features, fixing bugs, implementing functionality, refactoring code.

## Philosophy: Lazy Loading

**Target:** 3-5K startup tokens (70-80% reduction from previous 15-20K)

**Strategy:** Load only essential context at startup. Use Skills and slash commands to load additional context on-demand when user needs it.

## Context to Load at Startup

### 1. Minimal Git Status

```bash
git rev-parse --is-inside-work-tree &>/dev/null && \
echo "📍 Branch: $(git branch --show-current)" && \
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "✓ Working directory clean"
else
    echo "⚠️  Uncommitted changes present"
fi
```

**Purpose:** Know where we are and if we have uncommitted work.
**Tokens:** ~100-200

### 2. Context Summary

```bash
source ~/.claude/lib/local/lazy-context.sh
context_summary
```

**Purpose:** Show what context is **available** without loading full details.

Shows counts/metadata only:
- Meeting count (not full schedule)
- PR count (not full list)
- Last session date (not full notes)
- TODO count (not full items)
- Git branch and status

**Tokens:** ~200-300

### 3. Project Preferences

Read cascading preferences (minimal - just read, don't output):
1. `~/.claude/PREFERENCES.md` (or `~/.claude/CLAUDE.md` if renamed)
2. `.claude/preferences/PREFERENCES.md` (if exists)
3. `.claude/preferences/coding.md` (if exists)

**Purpose:** Understand coding style, conventions, preferences.
**Tokens:** ~1,000-2,000 (necessary, can't defer)

**Total Startup:** ~3-5K tokens

## Lazy Loading Strategy

### Load Context When User Needs It

The `session-context` Skill will automatically detect when to load additional context based on user requests:

| User Says | Load |
|-----------|------|
| "What's on my calendar?", "Do I have time?" | `/calendar` |
| "What PRs are open?", "Show me pull requests" | `/prs` |
| "What was I working on?", "Catch me up" | `/notes` |
| "What should I work on?", "What's next?" | `/todos` |
| "Show recent commits", "What changed?" | `git log` |
| "Show me everything", "Full context" | `/full-context` |

### Slash Commands for Explicit Control

Users can manually load context:
- `/calendar` - Today's schedule
- `/prs [limit]` - Open pull requests
- `/notes [type] [count]` - Recent session notes
- `/todos` - TODO items
- `/full-context` - Load everything

## Integrations

### Always Available (No Loading Needed)

All integration scripts available in `~/.claude/bin/`:
- Jira MCP tools (ticket management)
- Bitbucket (bb_* scripts)
- GitHub (github_* scripts)
- Slack (slack_* scripts)
- Carefeed helpers (carefeed_* scripts)
- AWS (aws_* scripts)
- 1Password (op_* scripts)
- Sentry (sentry_* scripts)
- Datadog (datadog_* scripts)

**No need to load or verify** - Just call scripts directly when needed.

### Load M365 Calendar Helpers On-Demand

Only if user asks about calendar:
```bash
source ~/.claude/lib/core/loader.sh clauding
```

Provides: `show_today_calendar`, `show_tomorrow_calendar`, etc.

## Summary Format

Tell Hammer:

```
🔧 **Coding Session Started**

📍 **Branch:** [branch-name] ([clean/uncommitted changes])

📊 **Available Context:**
  📅 Calendar: [N meetings today]
  🔀 Open PRs: [N open]
  📝 Session notes: Last from [date]
  ✅ TODOs: [N items]

What would you like to work on?

_Use /calendar, /prs, /notes, /todos to load details_
```

**Keep it concise** - Don't load details unless user asks.

## When to Load Additional Context

### Automatic Loading (via session-context Skill)

Claude will automatically detect and load context when:
- User asks about schedule/time → Load calendar
- User asks about PRs → Load PR list
- User asks "what was I doing" → Load session notes
- User asks "what's next" → Load TODOs
- User needs commit context → Load git history

### Don't Pre-Load Unless Needed

**❌ Don't load:**
- Calendar if user doesn't mention time/schedule
- PRs if user is just fixing a bug
- Session notes if user gives explicit task
- TODOs if user knows what to work on
- Git history unless reviewing changes

**✅ Do respond to implicit needs:**
- User says "catch me up" → Load notes + TODOs
- User says "show me everything" → Load full context
- User mentions PRs → Load PR list

## Token Budget Target

**Startup:** ~3-5K tokens (vs previous ~15-20K)
**Savings:** 70-80% reduction
**Result:** More tokens available for actual work

## Fallback to Old Behavior

If user prefers full context at startup, they can:
1. Run `/full-context` after startup
2. Add preference: `context_loading: full` to preferences
3. Create custom session type with old loading pattern

## Notes Template

Use `~/.claude/templates/session-notes/coding.md` for session notes structure.

## Testing

To test token usage:
1. Start session and observe context loaded
2. Check that only git status + summary appear
3. Verify Skills trigger when asking about calendar/PRs/etc.
4. Measure token usage (should be ~3-5K vs ~15-20K)

---

**Remember:** The goal is to minimize startup tokens while keeping all context accessible on-demand. Let user behavior drive what gets loaded.
