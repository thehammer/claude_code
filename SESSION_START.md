# Session Start Instructions for Claude

Hi Claude! When the user asks you to read this file at the start of a session, follow these steps:

## 0. Parse Session Arguments

**Extract session type and description:**
- `/start [session_type] [description...]`
- **session_type**: First argument (e.g., `debugging`)
- **description**: All remaining text after session type (e.g., `the production branch vs master`)

**Examples:**
- `/start` → type=`coding`, description=none
- `/start debugging` → type=`debugging`, description=none
- `/start debugging the production branch vs master` → type=`debugging`, description=`the production branch vs master`
- `/start coding implement user authentication` → type=`coding`, description=`implement user authentication`

Look for `SESSION_DESCRIPTION:` in the command invocation to extract the description if provided.

**If no session type provided:**
- Default to `coding`

**Valid session types:**
- `coding` - Building features, fixing bugs, implementing functionality
- `debugging` - Investigating errors, troubleshooting production issues
- `analysis` - Understanding codebase, evaluating architecture, research
- `planning` - Task prioritization, roadmap planning, feature breakdown
- `presenting` - Creating PRs, writing docs, generating summaries
- `learning` - Understanding technologies, patterns, concepts, experiments
- `personal` - Side projects, hobbies, personal automation, fun coding
- `clauding` - Improving Claude configuration and workflows
- `launcher` - Minimal tmux launcher for creating other session windows
- `reviewing` - Reviewing pull requests from other engineers

**Validate and infer session type:**
1. Check if `~/.claude/session-types/{type}.md` exists (exact match)
2. If exact match doesn't exist, attempt to infer the intended type:
   - **Fuzzy matching examples:**
     - `code`, `coding`, `develop`, `development` → `coding`
     - `debug`, `debugging`, `troubleshoot`, `errors` → `debugging`
     - `analyze`, `analysis`, `research`, `explore` → `analysis`
     - `plan`, `planning`, `roadmap`, `todo` → `planning`
     - `present`, `presenting`, `pr`, `docs`, `documentation` → `presenting`
     - `learn`, `learning`, `study`, `tutorial`, `education` → `learning`
     - `personal`, `side`, `hobby`, `fun`, `home` → `personal`
     - `claude`, `clauding`, `config`, `configuration` → `clauding`
     - `launch`, `launcher`, `tmux`, `start` → `launcher`
     - `review`, `reviewing`, `pr-review`, `code-review` → `reviewing`
   - If inference is obvious (clear match), use the inferred type and inform the user
   - If inference is ambiguous or unclear, list available types and offer to:
     - Use one of the existing session types
     - Create a new session type definition
   - If user declines, fall back to `coding` session type

**Once valid type is confirmed:**
1. Read `~/.claude/session-types/{type}.md` for type-specific instructions
2. Follow the context loading strategy defined in that file
3. Only load what's needed for that session type

**Important:** Each session type has different context needs. The session type definition will specify exactly what to load and what to skip.

---

## 0.3. Sync Global Configuration Files

**Purpose:** Keep CLI and VSCode extension configs in sync

**Run the sync script:**
```bash
~/.claude/bin/sync-global-configs
```

**What it does:**
- Syncs MCP servers between `~/.claude.json` (CLI) and `~/.claude/settings.json` (VSCode)
- Syncs permissions (allow, deny, ask) between both files
- Ensures consistent behavior across CLI and VSCode

**Expected Output:**
```
MCP servers: already in sync ✓
Permissions: already in sync ✓

✅ Sync complete!

Both files now have:
  • 2 MCP servers
  • 27 allow patterns
  • 5 deny patterns
  • 10 ask patterns
```

**If changes are made:**
```
Permissions to sync to .claude.json:
  + 3 new allow patterns

✅ Sync complete!
```

**When to skip:** If you haven't modified either config file since last session, the sync will be instant (no-op).

**Why this matters:**
- CLI uses `~/.claude.json` for MCP servers and permissions
- VSCode extension uses `~/.claude/settings.json`
- Without sync, MCP tools may not be available in CLI sessions
- Permission changes in VSCode won't apply to CLI (and vice versa)

---

## 0.4. Update Tmux Window Name (If Running in Tmux)

**Check if running in tmux:**
```bash
if [ -n "$TMUX" ]; then
    source ~/.claude/lib/local/tmux.sh
    tmux_set_claude_window "{session_type}"
fi
```

Replace `{session_type}` with the actual session type (coding, debugging, clauding, etc.).

**This renames the tmux window to:**
- 💻 coding
- 🐛 debug
- 🔍 analysis
- 📋 planning
- 📊 presenting
- 📚 learning
- 🏠 personal
- 🔧 clauding
- 👀 review

**If not in tmux:** Silent no-op, continues normally.

---

## 0.5. Permission Synchronization (If Project Has Local Settings)

**If `.claude/settings.local.json` exists:**

1. **Create session start backup:**
   ```bash
   cp .claude/settings.local.json .claude/settings.local.json.session-start
   ```

2. **Run sync-down recipe:**
   Follow instructions in `~/.claude/recipes/permissions/sync-down-global-to-project.md` to merge global permissions into project settings.

**Why:** Prevents permission prompts for globally-approved operations while respecting project overrides.

---

## Security Awareness

**IMPORTANT:** When working with production systems, debug logs, or customer data:

- **Never commit sensitive data** - production logs, customer names, stack traces, credentials
- Review files before committing (see `~/.claude/SECURITY.md` for full guidelines)
- Use `.gitignore` patterns to protect study-logs, debug artifacts, conversation history
- When in doubt about a file, DON'T commit it

**Quick security check before any commit:**
```bash
git status && git diff --cached | grep -iE "password|secret|token|api.key|credential"
```

See [`~/.claude/SECURITY.md`](~/.claude/SECURITY.md) for comprehensive security guidelines.

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

Each session type has specific context loading requirements defined in `~/.claude/session-types/{type}.md`.

**Key principle:** Load only what's needed for the session type to minimize token usage and startup time.

**Available session types:**
- `coding`, `debugging`, `analysis`, `planning`, `presenting`, `learning`, `personal`, `clauding`, `launcher`, `reviewing`

**See `~/.claude/session-types/{type}.md` for each type's specific loading strategy.**

---

## Integration Loading Strategy

**IMPORTANT:** When integrations are loaded, you have access to 89+ helper functions for external services (Jira, Bitbucket, GitHub, Slack, Sentry, Datadog, AWS, 1Password, etc.).

**Quick Reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for:
- Complete function catalog with examples
- When to use which service (e.g., Bitbucket vs GitHub for PRs)
- Common workflows (create PR, debug errors, deploy env vars)
- Troubleshooting guide

**Loading:**
- `coding` and `debugging` sessions: Pre-load integrations at session start
- Other sessions: Load on-demand when needed

```bash
# Load integrations (if not already loaded by session type)
source ~/.claude/lib/integrations.sh
```

**Verify availability:**
```bash
declare -F | grep -c "bitbucket_\|jira_\|slack_"
# Should show 30+ functions if loaded
```

**Note on permissions**: If you get permission prompts for helper functions, click "Yes, and don't ask again" to persist approvals across sessions. See `~/.claude/PERMISSIONS.md` for recommended pre-approved commands.

---

## Session Notes Location

Session notes are organized by type:

**Global (clauding and personal):**
- `~/.claude/session-notes/clauding/YYYY-MM-DD.md`
- `~/.claude/session-notes/personal/YYYY-MM-DD.md`

**Project (most sessions):**
- `.claude/session-notes/coding/YYYY-MM-DD.md`
- `.claude/session-notes/debugging/YYYY-MM-DD.md`
- `.claude/session-notes/analysis/YYYY-MM-DD.md`
- `.claude/session-notes/planning/YYYY-MM-DD.md`
- `.claude/session-notes/presenting/YYYY-MM-DD.md`
- `.claude/session-notes/learning/YYYY-MM-DD.md`
- `.claude/session-notes/reviewing/YYYY-MM-DD.md`

**Templates available:**
- `~/.claude/templates/session-notes/{type}.md`

**Using Session Description:**
If a session description was provided via `/start [type] [description]`, use it to:
1. Add context to the session notes header (e.g., `## Session Focus: {description}`)
2. Provide initial direction for the session
3. Include in the SESSION_MARKER for better continuation context

---

## Throughout the Session

- Use the TodoWrite tool to track multi-step tasks (for current session only)
- Update session notes in type-specific folder as we make progress
- Document any bugs or issues discovered
- Keep the user informed of progress
- **Watch for notification requests**: If user says "notify me when done", "let me know when finished", "ping me when ready", etc., send a Slack DM when the task completes using `notify_user` or `slack_notify_completion` functions (see [NOTIFICATIONS.md](NOTIFICATIONS.md))
- **Fix helpers/integrations/tools at the source** when problems are found:
  - If a helper function in `~/.claude/lib/` has a bug, fix the source file
  - If an integration doesn't work, update it to work correctly
  - Don't just work around issues - fix them permanently for future sessions
  - Test the fix to ensure it works
- **Proactively create and refactor helpers**:
  - If you're writing complex inline bash/code multiple times, create a helper function
  - Add new helper functions to `~/.claude/lib/integrations.sh` or appropriate location
  - When using existing helpers, look for refactoring opportunities:
    - Better error handling and validation
    - More features or flexibility
    - Cleaner, more maintainable interface
    - Better documentation in comments
  - Update helper when you enhance it, don't create wrapper scripts
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

- `launcher`: ~1-2K tokens (95% savings - tmux helpers only, absolute minimum)
- `clauding`: ~5K tokens (85% savings - no project context)
- `personal`: ~5K tokens (85% savings - no work context)
- `planning`: ~8K tokens (75% savings - focus on TODOs)
- `learning`: ~8K tokens (75% savings - focused on topic)
- `analysis`: ~10K tokens (70% savings - minimal external context)
- `debugging`: ~12K tokens (65% savings - focused on errors)
- `reviewing`: ~12K tokens (65% savings - focus on PRs and review context)
- `presenting`: ~12K tokens (60% savings - recent work only)
- `coding`: ~15K tokens (50% savings - selective loading)

**Previous baseline:** ~30-35K tokens per session startup

---

## Check for Project-Specific Startup Instructions

**After following session type instructions**, check if `.claude/SESSION_START.md` exists in the project directory. If it does, read it for any project-specific startup instructions or additional context.

---

## Easter Eggs 🎉

Claude Code includes fun seasonal and cultural easter eggs! These activate automatically on specific dates.

**Universal disable commands:** "back to normal", "disable easter egg", "regular mode"

### Activation Logic

**Check for easter egg on session start:**

1. **Extract current date** from `<env>` block: `Today's date: YYYY-MM-DD`
2. **Parse to MM-DD format** (e.g., `2025-10-31` → `10-31`)
3. **Check for easter egg file**: `~/.claude/easter-eggs/{MM-DD}.md`
4. **Special case - Birthday**: Check `~/.claude/PREFERENCES.md` for user's birthday, then look for `~/.claude/easter-eggs/birthday.md`
5. **If file exists**: Read it and follow the behavior guidelines within
6. **If no file**: Continue normally (no easter egg today)

**IMPORTANT:**
- Only activate if exact date matches (e.g., `10-31` for Halloween, not any day in October)
- For date ranges (e.g., spring equinox March 19-21), create separate files for each date
- Always respect technical accuracy and user preferences

**Easter egg files contain:**
- Name and activation description
- Behavior guidelines and terminology
- Disable commands (specific to that easter egg)

**Universal guidelines for all easter eggs:**
1. ✅ **Never compromise clarity** - Technical accuracy always comes first
2. ✅ **Be subtle** - Flavor the session, don't overwhelm it
3. ✅ **Respect user preference** - Disable immediately when requested
4. ✅ **Stay professional** - Fun but not silly or unprofessional
5. ✅ **Watch for confusion** - Proactively offer to disable if user seems frustrated
6. ✅ **Maintain effectiveness** - Should enhance, not hinder, productivity

---

**Ready to start!** 🚀
