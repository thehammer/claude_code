# Clauding Session Startup

## Purpose
Improving Claude configuration, refining workflows, updating integrations, maintaining dotfiles, optimizing session types.

## Context to Load

### 1. Global Configuration ONLY
Read core config files from `~/.claude/`:
- `PREFERENCES.md` - Global preferences
- `SESSION_START.md` - Startup orchestration
- `WRAPUP.md` - Session end procedures
- `settings.json` - Active settings configuration
- `session-types/*.md` - Session type definitions

### 2. Recent Clauding Notes
Look in `~/.claude/session-notes/clauding/` or `.claude/session-notes/clauding/` for:
- Recent config changes
- What was improved
- Issues discovered
- Planned improvements

### 3. Configuration Ideas
Check `~/.claude/IDEAS.md` for:
- Configuration improvements
- Workflow enhancements
- Tool additions

### 4. Today's Calendar
Use the "Display Today's Calendar" recipe:

```bash
m365 request --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T05:00:00Z&endDateTime=$(date -v+1d +%Y-%m-%d)T05:00:00Z" --method get | jq -r '.value | sort_by(.start.dateTime) | .[] | "\(.start.dateTime)|\(.end.dateTime)|\(.subject)|\(.organizer.emailAddress.name)"'
```

Format concisely for context awareness.

**Recipe reference:** `~/.claude/recipes/calendar/display-today-calendar.md`

### 5. Integration Status
```bash
ls ~/.claude/lib/services/*.sh
ls ~/.claude/skills/*/SKILL.md
ls ~/.claude/agents/*.md
```

Understand current lib/skill/agent inventory.

## Skip ALL Project Context

**DO NOT LOAD:**
- ❌ Project session notes
- ❌ Project preferences
- ❌ Project TODO items
- ❌ Git status/history
- ❌ Open PRs
- ❌ Recent commits
- ❌ Code files

Clauding sessions work on configuration, not code.

## Integrations

### Pre-load
- **None** - Working on local config only

### Load On-Demand
- **Git** - If pushing config changes to version control
- **GitHub** - If syncing dotfiles repo

### Skip Entirely
- All external integrations (Jira, Sentry, Datadog, Slack)
- These are tools we might configure, not tools we use during clauding

## Summary Format

Tell Hammer:
- **Last clauding session:** [date and what was improved]
- **📅 Today's Schedule:** [count] meetings ([time range]) or "No meetings today"
- **Config state:** [health check - any missing files?]
- **Available session types:** [list types]
- **Integration status:** [which integrations configured]

Then ask: "What would you like to improve?" with options:
1. Refine session type definitions
2. Update integration helpers
3. Improve startup/wrapup procedures
4. Create/update templates
5. Optimize token usage
6. Add new slash commands
7. Update documentation

## Available Agents

**Delegate to agents** for context-heavy operations when improving Claude configuration.

| Agent | Use For | Invocation |
|-------|---------|------------|
| **session-researcher** | Find past config changes, how we did something | "Use session-researcher to find when we added the jira integration" |
| **codebase-explainer** | Understand Claude Code internals if needed | "Use codebase-explainer to understand how MCP servers work" |

**When to use agents vs direct tools:**
- **Use agents** when: Searching past clauding sessions, exploring unfamiliar areas
- **Use direct tools** when: Reading/editing config files directly (most clauding work)

**Note:** Clauding sessions are mostly direct file manipulation, so agents are used less frequently here than in other session types.

## Common Workflows

1. **Add Session Type:**
   - Define purpose and context needs
   - Create session-types/{type}.md
   - Update SESSION_START.md routing
   - Create template in templates/session-notes/
   - Test the new session type

2. **Improve Integration:**
   - Review existing helper functions
   - Add new functionality
   - Refactor for better error handling, features, or interface
   - Update skill/agent docs
   - Test integration
   - Document usage patterns

2b. **Create New Helper:**
   - Identify repeated patterns or complex inline code
   - Write helper function in appropriate `~/.claude/lib/` category file
   - Add error handling and input validation
   - Document parameters and return values in comments
   - Test with various inputs
   - Use in next session to verify

3. **Optimize Startup:**
   - Measure current token usage
   - Identify unnecessary context
   - Refactor session type definitions
   - Test with actual sessions
   - Measure improvement

4. **Create Template:**
   - Identify repeated pattern
   - Draft template structure
   - Add to templates/ directory
   - Document usage
   - Use in next relevant session

5. **Version Control:**
   - Review changes to config
   - Update .gitignore if needed
   - Commit improvements
   - Push to remote (if configured)
   - Tag releases if significant

## Token Budget Target
~5K tokens for startup (85% savings - no project context at all!)

## Notes Template
Use `~/.claude/templates/session-notes/clauding.md` for session notes structure.

## Meta-Improvement

Clauding sessions can improve themselves! If you notice this session type definition could be better:
- Note it during the session
- Update this file
- Test the improvement
- Document the change

**This file should evolve with experience.**

## Success Metrics

Good clauding session outcomes:
- ✅ Reduced token usage in other session types
- ✅ Faster session startup
- ✅ Better documentation
- ✅ Smoother workflows
- ✅ New capabilities added
- ✅ Configuration easier to maintain
