# Session Startup Optimization Analysis

## Current Coding Session Load Pattern

### Components Loaded at Startup

| Component | Estimated Tokens | Necessary? | Lazy Load? |
|-----------|------------------|------------|------------|
| Helper verification (ls output) | ~1,500 | No | ✅ Skip entirely |
| Git status + branch | ~500 | Yes | Keep minimal |
| Git log (5 commits) | ~800 | Sometimes | ✅ Load on-demand |
| Calendar API call + format | ~1,200 | Sometimes | ✅ Load on-demand |
| Open PRs list | ~2,000 | Sometimes | ✅ Load on-demand |
| Recent session notes (full) | ~1,500 | Sometimes | ✅ Load metadata only |
| Preferences (full read) | ~2,500 | Yes | Partial load |
| TODOs (full read) | ~1,000 | Sometimes | ✅ Load on-demand |
| INTEGRATIONS_REFERENCE.md | ~8,000 | No | ✅ Skip reference |
| Session type instructions | ~1,500 | Yes | Keep |

**Current Total:** ~20,500 tokens
**Target:** ~5,000 tokens (75% reduction)

---

## Optimization Strategy

### Level 1: Essential Only (Target: ~3-5K tokens)

**Always Load:**
- ✅ Current git branch
- ✅ Working directory clean/dirty status
- ✅ Session type definition
- ✅ Minimal preferences (verbosity, user info)

**Defer Everything Else:**
- Calendar → Load when user asks about time/schedule
- Open PRs → Load when user mentions PRs or wants to create one
- Session notes → Load when user asks "what was I working on"
- TODOs → Load when user asks about pending work
- Git history → Load when reviewing changes
- Helper verification → Trust they exist, skip verification

### Level 2: Smart Context Detection

**Use Skills to detect when context is needed:**

Example triggers:
- User mentions "PR" → Load open PRs
- User asks "what's next" → Load TODOs
- User asks about time → Load calendar
- User asks "what was I doing" → Load session notes

### Level 3: Progressive Loading

**Show counts/summaries first, full details on request:**
- "3 open PRs" → User can ask for details
- "5 TODOs in backlog" → User can ask to see them
- "Last session: Oct 28" → User can ask for notes
- "2 meetings today" → User can ask for schedule

---

## Implementation Approaches

### Approach A: Skills-Based Lazy Loading

Create Skills that Claude invokes when needed:

**~/.claude/skills/context-loader/SKILL.md:**
```yaml
---
name: context-loader
description: Load additional session context on-demand. Use when user asks about
  calendar, open PRs, recent work, or TODOs. Provides progressive context loading
  to minimize startup tokens.
---

Available context loaders:

1. **Calendar**: show_today_calendar summary
2. **Open PRs**: ~/.claude/bin/utilities/list-all-open-prs 10
3. **Recent session notes**: Read latest from .claude/session-notes/coding/
4. **TODOs**: Read .claude/TODO.md or .claude/todos/features.md
5. **Git history**: git log -10 --oneline
```

### Approach B: Lazy-Loading Helper Functions

Create dedicated functions:

```bash
# ~/.claude/lib/local/lazy-context.sh

lazy_load_calendar() {
    if [ -z "$CALENDAR_LOADED" ]; then
        show_today_calendar summary
        export CALENDAR_LOADED=1
    fi
}

lazy_load_open_prs() {
    if [ -z "$PRS_LOADED" ]; then
        ~/.claude/bin/utilities/list-all-open-prs 10
        export PRS_LOADED=1
    fi
}

lazy_load_session_notes() {
    if [ -z "$NOTES_LOADED" ]; then
        local latest=$(ls -t .claude/session-notes/coding/*.md 2>/dev/null | head -1)
        [ -n "$latest" ] && cat "$latest"
        export NOTES_LOADED=1
    fi
}

lazy_load_todos() {
    if [ -z "$TODOS_LOADED" ]; then
        [ -f .claude/TODO.md ] && cat .claude/TODO.md
        [ -f .claude/todos/features.md ] && cat .claude/todos/features.md
        export TODOS_LOADED=1
    fi
}
```

### Approach C: Summary-First Pattern

**Startup shows only counts/metadata:**

```
🔧 Coding Session Started

**Last session:** Oct 28, 2025
**Current branch:** feature/optimize-startup (clean)
**Available context:**
- 📅 Calendar: 3 meetings today (use /calendar to see)
- 🔀 Open PRs: 2 open (use /prs to see)
- 📝 Session notes: Available from Oct 28 (use /notes to see)
- ✅ TODOs: 5 items (use /todos to see)

What would you like to work on?
```

User can then ask for specific context as needed.

---

## Recommended Implementation

**Hybrid approach combining all three:**

1. **Minimal startup** (Approach C) - Show summaries only
2. **Skills for detection** (Approach A) - Auto-load when relevant
3. **Slash commands** (Approach B) - Explicit user control

### New Slash Commands

Create these for explicit context loading:

**~/.claude/commands/calendar.md:**
```markdown
---
description: Show today's calendar
---
!`source ~/.claude/lib/core/loader.sh clauding && show_today_calendar`
```

**~/.claude/commands/prs.md:**
```markdown
---
description: Show open pull requests
---
!`~/.claude/bin/utilities/list-all-open-prs 10`
```

**~/.claude/commands/notes.md:**
```markdown
---
description: Show recent session notes
argument-hint: [date]
---
Show my most recent coding session notes$1
```

**~/.claude/commands/todos.md:**
```markdown
---
description: Show TODO items
---
Show all TODO items from .claude/TODO.md and .claude/todos/
```

### Context-Loader Skill

**~/.claude/skills/session-context/SKILL.md:**
```yaml
---
name: session-context
description: Load additional coding session context on-demand including calendar,
  open PRs, recent work, and TODO items. Use when user asks about schedule,
  pending work, recent activity, or what to work on next.
---

# Session Context Loader

Load context progressively based on user needs:

## When to Load

- **Calendar**: User mentions time, schedule, meetings, or asks "when"
- **Open PRs**: User mentions PRs, pull requests, reviews, or wants to create PR
- **Recent notes**: User asks "what was I working on", "what's the status", "catch me up"
- **TODOs**: User asks "what's next", "what should I work on", "what's pending"
- **Git history**: User wants to review changes, see recent work, or understand commits

## How to Load

Use these commands:

1. Calendar: `source ~/.claude/lib/core/loader.sh clauding && show_today_calendar summary`
2. Open PRs: `~/.claude/bin/utilities/list-all-open-prs 10`
3. Recent notes: Read latest file from `.claude/session-notes/coding/`
4. TODOs: Read `.claude/TODO.md` or `.claude/todos/features.md`
5. Git history: `git log -10 --oneline --decorate`

## Strategy

Start with summaries:
- "You have 3 meetings today (9 AM, 11 AM, 2 PM)"
- "2 open PRs: #123 (approved), #124 (needs review)"
- "Last session: Worked on auth refactoring"
- "5 TODO items in features.md"

Load full details only if user asks for more information.
```

---

## Migration Plan

### Phase 1: Create Infrastructure
1. ✅ Create lazy-loading helper functions
2. ✅ Create session-context Skill
3. ✅ Create context slash commands (/calendar, /prs, /notes, /todos)

### Phase 2: Update Coding Session Type
1. ✅ Reduce startup to minimal essential context
2. ✅ Add summary-first pattern
3. ✅ Document lazy-loading strategy
4. ✅ Update token budget target (15K → 5K)

### Phase 3: Test & Refine
1. ⏳ Test with actual coding session
2. ⏳ Measure token usage (expect ~5K vs current ~15K)
3. ⏳ Verify Skills trigger appropriately
4. ⏳ Adjust thresholds if needed

### Phase 4: Expand to Other Session Types
1. ⏳ Apply same pattern to debugging, analysis, reviewing
2. ⏳ Create type-specific context loaders
3. ⏳ Document token savings

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Startup tokens | ~15-20K | ~3-5K | 70-80% reduction |
| Startup time | ~15-20s | ~3-5s | 70% faster |
| Irrelevant context | High | Low | Better focus |
| User control | Low | High | Explicit loading |
| Session responsiveness | Slower | Faster | More budget available |

---

## Fallback Strategy

If lazy loading causes user friction:

1. Create `/full-context` command to load everything
2. Add preference: `context_loading: minimal | balanced | full`
3. Session types can override (debugging might want more upfront)
4. User can always request specific context explicitly

---

**Next Steps:**
1. Implement Phase 1 (infrastructure)
2. Create optimized coding.md
3. Test with real session
4. Measure improvement
5. Roll out to other session types
