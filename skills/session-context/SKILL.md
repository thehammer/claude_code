---
name: session-context
description: Load additional coding session context on-demand including calendar, open PRs, recent work, and TODO items. Use when user asks about schedule, pending work, recent activity, or what to work on next. Enables lazy loading to minimize startup tokens.
---

# Session Context Loader Skill

This skill provides progressive context loading for coding sessions, minimizing startup tokens by only loading what's needed when it's needed.

## When to Use This Skill

Automatically trigger this skill when the user:

- Asks about **schedule/time**: "What's on my calendar?", "Do I have meetings?", "What's my schedule?"
- Asks about **PRs**: "What PRs are open?", "Show me pull requests", "Any PRs to review?"
- Asks about **recent work**: "What was I working on?", "Catch me up", "What's the status?"
- Asks about **next steps**: "What should I work on?", "What's next?", "What's pending?"
- Asks for **git history**: "Recent commits?", "What changed recently?", "Show me history"
- Explicitly requests: "Load full context", "Show me everything", "Give me all details"

## Available Context Loaders

All functions are in `~/.claude/lib/local/lazy-context.sh` and should be loaded via:

```bash
source ~/.claude/lib/local/lazy-context.sh
```

### 1. Summary (Always Start Here)

```bash
context_summary
```

Shows lightweight overview (~200 tokens):
- Meeting count (not full schedule)
- PR count (not full list)
- Last session date (not full notes)
- TODO count (not full items)
- Git branch and status

**Use this first** to give user awareness of what's available.

### 2. Calendar

```bash
lazy_load_calendar
```

Loads today's full calendar from M365 with meeting times and subjects.

**Trigger when user:**
- Mentions time, schedule, meetings
- Asks "when", "what time", "calendar"
- Needs to know if they have time for work

### 3. Open Pull Requests

```bash
lazy_load_prs [limit]
```

Lists open PRs across all Carefeed repositories (Bitbucket + GitHub).

**Trigger when user:**
- Mentions PRs, pull requests, reviews
- Wants to create a PR (context helps)
- Asks about pending reviews

### 4. Recent Session Notes

```bash
lazy_load_session_notes [type] [count]
```

Loads recent session notes to understand previous work.

**Trigger when user:**
- Asks "what was I working on"
- Says "catch me up" or "what's the status"
- Needs context about recent changes
- Wants to continue previous work

### 5. TODO Items

```bash
lazy_load_todos
```

Loads all TODO files from `.claude/TODO.md` and `.claude/todos/`.

**Trigger when user:**
- Asks "what should I work on"
- Says "what's next" or "what's pending"
- Wants to see planned features
- Needs task suggestions

### 6. Git History

```bash
lazy_load_git_history [count]
```

Shows recent commit history with decorations.

**Trigger when user:**
- Asks about recent commits or changes
- Needs context for code review
- Wants to understand project history
- Mentions "commits", "history", "log"

### 7. Full Context (Last Resort)

```bash
lazy_load_full_context
```

Loads everything (equivalent to old startup behavior).

**Only use when user:**
- Explicitly says "load everything"
- Says "full context" or "show me all"
- Troubleshooting and needs comprehensive view

## Progressive Loading Strategy

**Start small, expand as needed:**

1. **First request:** Use `context_summary` to show what's available
2. **User asks for more:** Load specific context they mentioned
3. **Ambiguous request:** Ask user which context they want
4. **Multiple needs:** Load contexts in order of relevance

## Example Interactions

**User: "What's on my calendar?"**
```bash
source ~/.claude/lib/local/lazy-context.sh
lazy_load_calendar
```

**User: "What should I work on?"**
```bash
source ~/.claude/lib/local/lazy-context.sh
lazy_load_todos
```
Then offer to load session notes if they want to continue previous work.

**User: "Catch me up"**
```bash
source ~/.claude/lib/local/lazy-context.sh
lazy_load_session_notes coding 1
lazy_load_todos
```

**User: "Show me everything"**
```bash
source ~/.claude/lib/local/lazy-context.sh
lazy_load_full_context
```

## Anti-Patterns (Don't Do This)

❌ **Don't** load context at session start without user asking
❌ **Don't** load full context when summary would suffice
❌ **Don't** load calendar if user doesn't mention time/schedule
❌ **Don't** load PRs if user is just fixing a bug (not working on PRs)
❌ **Don't** reload context that's already been loaded (check flags)

## Flags to Check Before Loading

These environment variables track what's already loaded:

- `CONTEXT_CALENDAR_LOADED`
- `CONTEXT_PRS_LOADED`
- `CONTEXT_NOTES_LOADED`
- `CONTEXT_TODOS_LOADED`
- `CONTEXT_GIT_HISTORY_LOADED`

Functions automatically check these flags to avoid duplicate loads.

## Token Savings

| Context | Tokens Saved | When to Load |
|---------|--------------|--------------|
| Skip calendar | ~1,200 | User doesn't ask about schedule |
| Skip PRs | ~2,000 | User not working on PRs |
| Skip session notes | ~1,500 | User doesn't ask "what was I doing" |
| Skip TODOs | ~1,000 | User doesn't ask "what's next" |
| Skip git history | ~800 | User doesn't need commit context |

**Total potential savings:** 6,500 tokens (~43% of old startup)

## Integration with Slash Commands

Users can also explicitly load context via slash commands:
- `/calendar` - Load calendar
- `/prs` - Load open PRs
- `/notes` - Load session notes
- `/todos` - Load TODO items
- `/full-context` - Load everything

Use the slash commands when appropriate, or load context automatically when you detect the need.
