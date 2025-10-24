# Planning Session Startup

## Purpose
Task prioritization, roadmap planning, breaking down features, architectural design, sprint planning.

## Context to Load

### 1. TODO Lists
Read all TODO sources:
- `.claude/TODO.md` - Master project TODO
- `.claude/todos/features.md` - Feature backlog
- `.claude/todos/bugs.md` - Known bugs
- `.claude/todos/improvements.md` - Technical debt
- `~/.claude/TODO.md` - Cross-project tasks

### 2. Ideas Backlog
Read `.claude/IDEAS.md` for:
- Ideas from previous sessions
- Exploration opportunities
- Decide what to promote to TODO

### 3. Recent Session Notes (All Types)
Quick scan across session types to understand:
- What's been completed recently
- What's currently in progress
- Discovered issues that need planning

```bash
# Check most recent notes across all types
find .claude/session-notes/ -name "2025-*.md" -type f | sort | tail -5
```

### 4. Project Context
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/planning.md` (if exists)

### 5. Git Status (Minimal)
```bash
git branch --show-current
```

Just to know what branch we're on - detailed git history not needed.

## Integrations

### Pre-load
- **None** - Planning is mostly internal work

### Load On-Demand
- **Jira** - Fetch tickets for sprint planning
- **Confluence** - Read/update roadmap docs
- **GitHub/Bitbucket** - Check PR status for capacity planning
- **Datadog** - For performance-driven prioritization

### Skip Entirely
- Sentry (error tracking not relevant)
- Detailed git logs
- Open PR details

## Summary Format

Tell Hammer:
- **Last planning session:** [date and focus]
- **TODO items by category:**
  - Features: [count]
  - Bugs: [count]
  - Improvements: [count]
  - Cross-project: [count]
- **Ideas backlog:** [count of active ideas]
- **Recent completions:** [notable items from session notes]

Then ask: "What would you like to plan?" with options:
1. Review and prioritize TODO items
2. Break down a feature into tasks
3. Design architecture for upcoming work
4. Sprint planning / capacity allocation
5. Evaluate ideas for promotion to TODO

## Common Workflows

1. **Feature Breakdown:**
   - Read feature description
   - Identify components
   - Break into tasks
   - Estimate effort
   - Add to TODO

2. **Sprint Planning:**
   - Review TODO items
   - Check capacity
   - Prioritize work
   - Assign to sprint
   - Update Jira

3. **Architecture Design:**
   - Define requirements
   - Explore approaches
   - Design components
   - Document decisions
   - Plan implementation

4. **Backlog Grooming:**
   - Review IDEAS.md
   - Evaluate feasibility
   - Prioritize ideas
   - Promote to TODO or archive
   - Update descriptions

5. **Technical Debt Planning:**
   - Review improvements list
   - Assess impact
   - Prioritize refactoring
   - Schedule work
   - Update TODO

## Token Budget Target
~8K tokens for startup (focus on TODOs and ideas, skip technical details)

## Notes Template
Use `~/.claude/templates/session-notes/planning.md` for session notes structure.

## Calendar Display
Show today's calendar early in startup using the "Display Today's Calendar" recipe.
Include "📅 Today's Schedule:" line in summary format - helpful for planning work around meetings.
