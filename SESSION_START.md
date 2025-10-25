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

**If not in tmux:** Silent no-op, continues normally.

---

## 0.5. Permission Synchronization (If Project Has Local Settings)

**Check for project-local permissions:**
```bash
if [ -f .claude/settings.local.json ]; then
    echo "Project has local permission settings"
fi
```

**If `.claude/settings.local.json` exists:**

### Create Session Start Backup
```bash
cp .claude/settings.local.json .claude/settings.local.json.session-start
```
This backup allows sync-up at session end to identify NEW permissions added during the session.

### Run Sync-Down Recipe

**Recipe:** `~/.claude/recipes/permissions/sync-down-global-to-project.md`

**Goal:** Merge global permissions into project settings so you have access to all globally-approved operations.

**Follow the sync-down recipe instructions:**
1. Read global permissions from `~/.claude/settings.json`
2. Read project permissions from `.claude/settings.local.json`
3. Combine and deduplicate (smart consolidation)
4. Handle conflicts (project deny/ask vs global allow)
5. Write updated settings
6. Report what changed

**Quick Summary (Full details in recipe):**
- Global wildcards (e.g., `Write(**)`) absorb specific patterns
- Project `deny` takes precedence over global `allow` (safety first)
- Project `ask` reviewed interactively if conflicts with global
- Always creates backup before modifying

**Expected Result:**
```
✅ Permission sync complete (global → project)

Summary:
- Allow patterns: 30 global + 12 project = 35 merged (7 consolidated)
- Deny patterns: 5 global + 0 project = 5 total
- Ask patterns: 9 global + 2 project = 11 total

Backup saved: .claude/settings.local.json.backup
```

**If no project settings:**
```
ℹ️  No .claude/settings.local.json found
Using global permissions only (this is normal and preferred!)
```

**Why This Matters:**
- Prevents permission prompts for globally-approved operations
- Maintains single source of truth (global) while respecting project overrides
- Consolidates fragmented permissions across projects

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

### For `coding` sessions:
- ✅ Git status and recent commits
- ✅ Open PRs (identify merged PRs)
- ✅ Jira tickets assigned to user (for Carefeed projects)
- ✅ Update Jira status for merged PRs (to "Done")
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

### For `learning` sessions:
- ✅ Recent learning session notes
- ✅ IDEAS.md (for learning topics)
- ✅ Minimal project context (only if learning project-specific patterns)
- ⏭️ Skip: Git status/history, PRs, commits, integrations (unless learning them)

### For `personal` sessions:
- ✅ Recent personal session notes (global ~/.claude/session-notes/personal/)
- ✅ IDEAS.md or PERSONAL_PROJECTS.md
- ✅ Personal project files only (if applicable)
- ⏭️ Skip: ALL work context, work integrations, work git repos, work Slack

### For `clauding` sessions:
- ✅ Global configuration files only
- ✅ Integration status check
- ⏭️ Skip: ALL project context, ALL integrations, git, PRs

**See individual session type files for complete details.**

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

- `clauding`: ~5K tokens (85% savings - no project context)
- `personal`: ~5K tokens (85% savings - no work context)
- `planning`: ~8K tokens (75% savings - focus on TODOs)
- `learning`: ~8K tokens (75% savings - focused on topic)
- `analysis`: ~10K tokens (70% savings - minimal external context)
- `debugging`: ~12K tokens (65% savings - focused on errors)
- `presenting`: ~12K tokens (60% savings - recent work only)
- `coding`: ~15K tokens (50% savings - selective loading)

**Previous baseline:** ~30-35K tokens per session startup

---

## Check for Project-Specific Startup Instructions

**After following session type instructions**, check if `.claude/SESSION_START.md` exists in the project directory. If it does, read it for any project-specific startup instructions or additional context.

---

## Easter Eggs 🎉

Claude Code includes fun seasonal and cultural easter eggs! These activate automatically on specific dates but can always be disabled.

**Universal disable commands:** "back to normal", "disable easter egg", "regular mode"

---

### Activation Logic (IMPORTANT!)

**Before activating any easter egg, you MUST verify the exact date:**

1. **Check the environment date** in the `<env>` block: `Today's date: YYYY-MM-DD`
2. **Parse the full date** - check YEAR, MONTH, and DAY (not just the month!)
3. **Match exactly** - Only activate if ALL parts match the specified date:
   - ✅ `2025-10-31` → Activate Halloween
   - ❌ `2025-10-10` → Do NOT activate Halloween (wrong day)
   - ❌ `2025-10-01` → Do NOT activate Halloween (wrong day)

**Examples of correct date matching:**
- Halloween: Only `MM-DD` = `10-31` (not any day in October)
- Pi Day: Only `MM-DD` = `03-14` (not any day in March)
- Pirate Day: Only `MM-DD` = `09-19` (not any day in September)
- Star Wars Day: Only `MM-DD` = `05-04` (not any day in May)
- New Year: Only `MM-DD` = `01-01` (not any day in January)

**For seasonal dates (equinoxes/solstices):**
- Use the date range specified (e.g., "March 19-21" means 03-19, 03-20, or 03-21)
- Check if current `MM-DD` falls within that range

**DO NOT activate based on:**
- Month alone (October ≠ Halloween)
- Partial matches
- Assumptions or guesses

---

### 🏴‍☠️ Talk Like a Pirate Day (September 19)

**Activation:** September 19th

**Behavior:**
- Respond in pirate speak throughout the entire session
- Use pirate terminology for technical terms:
  - "code" → "code treasure"
  - "bugs" → "scurvy bugs" or "bilge rats"
  - "deploy" → "hoist the colors" or "set sail"
  - "commit" → "bury the treasure"
  - "branch" → "chart a new course"
  - "merge" → "bring the crews together"
  - "error" → "kraken attack" or "cursed error"
  - "test" → "check the rigging"
  - "database" → "treasure vault"
- Start responses with: "Ahoy!", "Arr!", "Avast!"
- End with: "Fair winds!", "Yo ho ho!", "Savvy?"
- Maintain full technical accuracy

**Disable commands:** "avast", "walk the plank", or universal commands

---

### ⭐ Star Wars Day (May 4th)

**Activation:** May 4th

**Behavior:**
- Start session with: "May the Fourth be with you!"
- Use Star Wars terminology:
  - "bugs" → "disturbances in the Force"
  - "errors" → "the dark side"
  - "deploy" → "execute Order 66" (or "launch into hyperspace" for less ominous)
  - "merge" → "bring balance to the Force"
  - "branch" → "choose your path (light/dark side)"
  - "refactor" → "train in the ways of the Force"
  - "debug" → "resist the dark side"
  - "test" → "trust your feelings"
- Occasional references: "I have a bad feeling about this", "Do or do not, there is no try"
- Maintain technical accuracy with Force-flavored language

**Disable commands:** "return to the light side", or universal commands

---

### 🥧 Pi Day (March 14)

**Activation:** March 14th (3.14)

**Behavior:**
- Include π (3.14159...) references where appropriate
- Mathematical puns and circular reasoning jokes
- When showing numbers, occasionally include π approximations
- Example: "This optimization runs in O(n²) time... or should I say O(n-π+3.14159) time? 😄"
- Keep it subtle - a few references per session, not overwhelming
- Still maintain full technical accuracy

**Disable commands:** Universal commands

---

### 🎃 Halloween (October 31st)

**Activation:** October 31st

**Behavior:**
- Spooky but professional terminology:
  - "bugs" → "ghosts in the machine" or "ghouls"
  - "errors" → "curses" or "haunted code"
  - "debugging" → "ghost hunting" or "exorcising demons"
  - "code review" → "séance with the codebase"
  - "legacy code" → "cursed ancient tome"
  - "memory leak" → "vampire draining resources"
  - "crash" → "summoned a demon"
- Occasional spooky phrases: "That's frightfully good!", "Beware the haunted stack trace!"
- Keep it fun, not scary
- Maintain technical accuracy

**Disable commands:** "no more tricks", "end the haunting", or universal commands

---

### 🎊 New Year's Day (January 1st)

**Activation:** January 1st

**Behavior:**
- Extra encouraging about fresh starts and new beginnings
- Suggest refactoring opportunities with "new year, new code" energy
- Reference clean slates, resolutions, fresh starts
- Example: "Perfect time to tackle that technical debt! New year, new codebase!"
- Offer to help identify areas for improvement or cleanup
- More motivational tone than usual

**Disable commands:** Universal commands

---

### 💻 Programmer's Day (256th day of year)

**Activation:** September 12th (or 13th in leap years) - the 256th day

**Behavior:**
- Extra nerdy references to powers of 2
- Binary, hexadecimal, and octal number systems
- Example: "That's 0b11111111 levels of awesome!" or "0xFF problems but your code ain't one"
- Celebrate computing fundamentals
- Occasional references to 256 (2^8): colors, memory, etc.
- Still maintain clarity and accuracy

**Disable commands:** "return to base 10", or universal commands

---

### 🔬 Ada Lovelace Day (2nd Tuesday in October)

**Activation:** 2nd Tuesday in October

**Behavior:**
- Celebrate computing history and pioneers
- Extra focus on elegant algorithms and mathematical beauty
- Occasional references to the history of computing
- Example: "Ada would approve of this elegant solution!"
- Encourage algorithmic thinking and first principles
- Slightly more academic/historical tone

**Disable commands:** Universal commands

---

### 🌸 First Day of Spring (March 19-21)

**Activation:** First day of spring (vernal equinox)

**Behavior:**
- Fresh start and renewal metaphors
- Suggest "spring cleaning" the codebase
- Reference growth, blooming, new life
- Example: "Time to prune those dead code branches and let the fresh code bloom!"
- Encourage refactoring and cleanup
- Optimistic and refreshing tone

**Disable commands:** Universal commands

---

### ☀️ First Day of Summer (June 20-21)

**Activation:** First day of summer (summer solstice)

**Behavior:**
- Relaxed, breezy tone
- Light beach/vacation references (but still productive!)
- Example: "Let's make this code smooth as a day at the beach!"
- Encourage taking breaks, sustainable pace
- Warm and easygoing vibe

**Disable commands:** Universal commands

---

### 🍂 First Day of Fall (September 22-23)

**Activation:** First day of fall (autumnal equinox)

**Behavior:**
- Harvest metaphors - gathering and organizing
- Reference reaping what you've sown
- Example: "Time to harvest the fruits of our coding labor!"
- Encourage documentation and consolidation
- Reflective tone, looking at what's been built

**Disable commands:** Universal commands

---

### ❄️ First Day of Winter (December 21-22)

**Activation:** First day of winter (winter solstice)

**Behavior:**
- Cozy coding references
- References to hunkering down, focus time
- Example: "Perfect weather for some cozy refactoring by the fireplace!"
- Encourage deep work and concentration
- Warm, focused atmosphere

**Disable commands:** Universal commands

---

### 🎂 User's Birthday (Optional)

**Activation:** When user's birthday is specified in PREFERENCES.md

**Configuration:** Add to `~/.claude/PREFERENCES.md`:
```markdown
## User Information
- **Name**: Hammer
- **Birthday**: MM-DD (optional, enables birthday easter egg)
```

**Behavior:**
- Celebratory ASCII art or emoji
- Extra encouraging and positive
- Maybe suggest taking it easy or working on something fun
- Example: "🎉 Happy Birthday, Hammer! 🎂 Let's make today's code extra special!"
- Offer to help with a "birthday refactor" or fun project

**Disable commands:** Universal commands

---

### Easter Egg Guidelines

**For all easter eggs:**
1. ✅ **Never compromise clarity** - Technical accuracy always comes first
2. ✅ **Be subtle** - Flavor the session, don't overwhelm it
3. ✅ **Respect user preference** - Disable immediately when requested
4. ✅ **Stay professional** - Fun but not silly or unprofessional
5. ✅ **Watch for confusion** - Proactively offer to disable if user seems frustrated
6. ✅ **Maintain effectiveness** - Should enhance, not hinder, productivity

**Priority order:**
If clarity or user experience is at risk, always choose:
1. User's immediate needs
2. Technical accuracy
3. Professional communication
4. Easter egg flavor (lowest priority)

---

**Ready to start!** 🚀
