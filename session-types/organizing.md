# Organizing Session Startup

## Purpose
Organizing personal tasks, routines, schedules, habits, life administration. Bringing order to the chaos of daily life and recurring responsibilities.

## Context to Load

### 1. Personal TODO Lists
Read personal task sources:
- `~/.claude/TODO.md` - Cross-project tasks
- `~/.claude/personal/TODO.md` - Personal life tasks (if exists)
- `~/.claude/personal/routines.md` - Recurring tasks/habits (if exists)

### 2. Calendar
**Always load** - Essential for organizing around existing commitments:
```bash
# Display today's calendar
~/.claude/bin/calendar-today 2>/dev/null || echo "Calendar not configured"
```

### 3. Session Notes
Check recent organizing sessions:
```bash
ls -la ~/.claude/session-notes/organizing/ 2>/dev/null | tail -5
```

### 4. Preferences
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `~/.claude/preferences/organizing.md` (if exists)

## Integrations

### Pre-load
- **Calendar** - See today's schedule and upcoming commitments

### Load On-Demand
- **Jira** - For work task coordination
- **Reminders/Notes** - If Apple integrations available

### Skip Entirely
- Sentry, Datadog (not relevant)
- Git history, PRs (not relevant)
- Codebase exploration (not relevant)

## Summary Format

Tell Hammer:
- **Today's date:** [day of week, date]
- **Calendar overview:** [meeting count, free blocks]
- **Pending personal tasks:** [count if TODO exists]
- **Recent focus areas:** [from session notes]

Then ask: "What would you like to organize?" with options:
1. Review and prioritize personal tasks
2. Plan the week/day ahead
3. Set up new routines or habits
4. Declutter/organize a specific area
5. Life admin catch-up (bills, appointments, etc.)

## Common Workflows

1. **Weekly Review:**
   - Review calendar for the week
   - Check off completed tasks
   - Identify priorities
   - Schedule time blocks
   - Set intentions

2. **Daily Planning:**
   - Check today's calendar
   - Identify top 3 priorities
   - Time-block tasks
   - Handle quick wins

3. **Routine Setup:**
   - Define recurring task
   - Identify trigger/cue
   - Set frequency
   - Add to tracking system

4. **Life Admin:**
   - Gather pending items
   - Batch similar tasks
   - Schedule dedicated time
   - Work through list

5. **Decluttering:**
   - Identify area to organize
   - Categorize items
   - Decide keep/discard/delegate
   - Create maintenance plan

## Token Budget Target
~4K tokens for startup (light context, focus on actionable items)

## Notes Template
Session notes go in `~/.claude/session-notes/organizing/`

Format:
```markdown
# Organizing Session - YYYY-MM-DD

## Focus
[What we're organizing today]

## Accomplished
- [ ] Task 1
- [ ] Task 2

## Decisions Made
-

## Follow-up Items
-

## Next Session
-
```

## Calendar Display
Show today's calendar early in startup using the calendar integration.
Include "📅 Today's Schedule:" line in summary format - essential for organizing work.
