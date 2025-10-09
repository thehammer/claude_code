# Session Start Instructions for Claude

Hi Claude! When the user asks you to read this file at the start of a session, follow these steps:

## 0. Determine Session Type

**Check if session type was provided:**
- If argument provided (e.g., `/start debugging`): Use that type
- If no argument: Default to `coding`

**Valid session types:**
- `coding` - Building features, fixing bugs, implementing functionality
- `debugging` - Investigating errors, troubleshooting production issues
- `analysis` - Understanding codebase, evaluating architecture, research
- `planning` - Task prioritization, roadmap planning, feature breakdown
- `presenting` - Creating PRs, writing docs, generating summaries
- `clauding` - Improving Claude configuration and workflows

**Once type is determined:**
1. Read `~/.claude/session-types/{type}.md` for type-specific instructions
2. Follow the context loading strategy defined in that file
3. Only load what's needed for that session type

**Important:** Each session type has different context needs. The session type definition will specify exactly what to load and what to skip.

---

## Cascade Resolution Pattern

When reading configuration files, use this order (later overrides earlier):

1. **Global base**: `~/.claude/PREFERENCES.md`
2. **Global type**: `~/.claude/session-types/{type}.md` (defines context to load)
3. **Project base**: `.claude/preferences/PREFERENCES.md` (if exists)
4. **Project type**: `.claude/preferences/{type}.md` (if exists)

This applies to preferences, session notes, and TODOs.

---

## Session Type Context Loading

### For `coding` sessions:
- ✅ Git status and recent commits
- ✅ Open PRs
- ✅ Recent coding session notes
- ✅ Project preferences
- ⏭️ Skip: Detailed integration pre-loading (load on-demand)

### For `debugging` sessions:
- ✅ Sentry integration (pre-load)
- ✅ Datadog integration (pre-load)
- ✅ Recent debugging session notes
- ✅ Minimal git status (current branch only)
- ⏭️ Skip: Git history, open PRs, other integrations

### For `analysis` sessions:
- ✅ Extended git history
- ✅ Project documentation
- ✅ Recent analysis session notes
- ⏭️ Skip: All integrations initially (load on-demand)

### For `planning` sessions:
- ✅ All TODO lists
- ✅ IDEAS.md backlog
- ✅ Recent session notes (scan across types)
- ✅ Minimal git status
- ⏭️ Skip: Git history, integrations, detailed code context

### For `presenting` sessions:
- ✅ Recent session notes (relevant type)
- ✅ Git context (recent work)
- ✅ Existing documentation
- ⏭️ Skip: Deep integration pre-loading

### For `clauding` sessions:
- ✅ Global configuration files only
- ✅ Integration status check
- ⏭️ Skip: ALL project context, ALL integrations, git, PRs

**See individual session type files for complete details.**

---

## Integration Loading Strategy

**Pre-load only when specified by session type.**

Most sessions should load integrations on-demand:
```bash
# Only when needed during session
source ~/.claude/lib/integrations.sh
```

**Note on permissions**: If you get permission prompts for helper functions, click "Yes, and don't ask again" to persist approvals across sessions. See `~/.claude/PERMISSIONS.md` for recommended pre-approved commands.

---

## Session Notes Location

Session notes are organized by type:

**Global (rare, mainly for clauding):**
- `~/.claude/session-notes/clauding/YYYY-MM-DD.md`

**Project (most sessions):**
- `.claude/session-notes/coding/YYYY-MM-DD.md`
- `.claude/session-notes/debugging/YYYY-MM-DD.md`
- `.claude/session-notes/analysis/YYYY-MM-DD.md`
- `.claude/session-notes/planning/YYYY-MM-DD.md`
- `.claude/session-notes/presenting/YYYY-MM-DD.md`

**Templates available:**
- `~/.claude/templates/session-notes/{type}.md`

---

## Throughout the Session

- Use the TodoWrite tool to track multi-step tasks (for current session only)
- Update session notes in type-specific folder as we make progress
- Document any bugs or issues discovered
- Keep the user informed of progress
- **Update `.claude/TODO.md`** or type-specific TODO when discovering:
  - New tasks that span multiple sessions
  - Technical debt or future improvements
  - Migration/upgrade work needed
  - Important findings that should persist beyond the session

---

## End of Session

When the user says it's time to wrap up, follow instructions in `~/.claude/WRAPUP.md`

---

## Key Principles

1. ✅ **Be selective** - Load only what's needed for the session type
2. ✅ **Be efficient** - Minimize token usage by skipping irrelevant context
3. ✅ **Be proactive** - Use TodoWrite, track progress, document findings
4. ✅ **Be clear** - Summarize what we're doing and why
5. ✅ **Be organized** - Keep session notes in the right type folder

---

## Token Budget Targets

Each session type has a target token budget for startup:

- `clauding`: ~5K tokens (85% savings - no project context)
- `planning`: ~8K tokens (75% savings - focus on TODOs)
- `analysis`: ~10K tokens (70% savings - minimal external context)
- `debugging`: ~12K tokens (65% savings - focused on errors)
- `presenting`: ~12K tokens (60% savings - recent work only)
- `coding`: ~15K tokens (50% savings - selective loading)

**Previous baseline:** ~30-35K tokens per session startup

---

## Check for Project-Specific Startup Instructions

**After following session type instructions**, check if `.claude/SESSION_START.md` exists in the project directory. If it does, read it for any project-specific startup instructions or additional context.

---

**Ready to start!** 🚀
