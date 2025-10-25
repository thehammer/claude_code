# Claude Global Preferences

## Prime Directive
**Manage Complexity**: Always work to find solutions that are just simple enough to solve problems, while minimizing complexity. Eliminate unnecessary complexity. Favor simple, maintainable solutions over clever or feature-rich ones.

## User Information
- **Name**: Hammer
- **Communication Style**: Professional but friendly - use name when it feels natural
- **Timezone**: America/Chicago (Central Time) - Use CT for all time displays

## Notifications
- **Slack User ID**: U09EKM8DKQ8 (Hammer - validated working)
- **Slack Notification Channel**: #local-testing (fallback)
- **Preferred notification method**: Slack DM (working via slack_send_dm)
- **Current method**: Slack DM
- **Fallback**: macOS notification
- **When to notify**:
  - Tasks taking longer than 5 minutes
  - When explicitly requested ("notify me when done")
  - Critical errors during long operations
  - Never for quick operations (<1 minute)

## Communication Preferences

### Style
- Be concise and direct
- Use Hammer's name when it feels natural in conversation
- Minimize unnecessary preamble/postamble
- Match verbosity to task complexity
- Brief answers for simple questions, detailed for complex work

### Code Work
- Always read files before editing
- Use real databases/files for integration tests over complex mocks
- Document bugs discovered, don't just work around them
- Prefer existing patterns in the codebase
- Test changes before considering them complete
- **Always look for opportunities to create tests** - whenever building or modifying functionality, proactively suggest and create tests that verify behavioral correctness
- **Fix helpers, integrations, and tools at the source** - When you discover a problem with a helper function, integration, or tool and find the solution, update the source code (in `~/.claude/lib/` or wherever it lives) so it works correctly next time, not just for the current use
- **Favor recipes over helper functions** - When creating reusable workflows, prefer recipes (`~/.claude/recipes/`) over helper functions. Recipes are human-readable, self-documenting, flexible, and easier to maintain. Use helper functions pragmatically for:
  - Low-level utilities (parsing, formatting, validation)
  - Frequently-called operations (dozens of times per session)
  - Complex logic requiring error handling and state management
  - Functions that compose well into recipes
- **Proactively create and refactor helpers** - When you find yourself doing something repeatedly or writing complex inline code, first consider if a recipe would work better. If a helper function is appropriate, create it in `~/.claude/lib/` in the appropriate category file. Refactor existing helpers when you see opportunities to improve them (better error handling, more features, cleaner interface)
- **Method visibility ordering** - In classes, always organize methods with public methods first, followed by protected methods, then private methods. This makes the public API immediately visible at the top of the class

### Documentation
- Keep session notes updated throughout work
- Document critical issues with 🚨 URGENT or ⚠️ Medium markers
- Include file:line references for code issues
- Note impact and action needed for bugs
- **When indicating wrap up time**, automatically run `/wrapup` slash command

## Workflow Preferences

### Testing
- Run tests after making changes
- Prefer integration tests for complex workflows
- Mock only external APIs, use real DB for internal logic
- Document why tests are skipped if they can't be fixed
- **Database reset**: Use `php artisan db:rebuild` to reset test database when needed

### Git
- Only commit when explicitly asked
- Keep commits focused and well-documented
- **NEVER push directly to master** - Always work on a branch
- Don't force push to main/master
- Use conventional commit messages with context
- **Branch naming**:
  - **Default personal pattern**: `hammer/<branch-description>` (e.g., `hammer/fix-basecommand-bug`)
  - **Project-specific patterns**: Check `.claude/preferences/PREFERENCES.md` for project conventions
  - **Carefeed projects**: Use `{type}/{JIRA-KEY}-{description}` (e.g., `feature/CORE-1234-add-auth`)
- **Commit messages**:
  - **Default**: Conventional commits with scope
  - **Carefeed projects**: Include Jira key (e.g., `feat(auth): CORE-1234: add two-factor auth`)
- **Jira ticket workflow**:
  - **When Jira ticket needed**: Always ask "Do you have a Jira ticket for this, or would you like me to create one?"
  - **When creating tickets**: Infer project, type, priority, and description from context
  - **If ambiguous**: Ask for clarification (which project? what priority?)
  - **Show ticket details** before creating for confirmation
  - **After creation**: Use the ticket key for branch/commit/PR
- **Creating PRs**: Always use API access (Bitbucket API via `bitbucket_create_pr` or similar) instead of opening browser, unless API fails

### Remote-Changing Operations
- **ALWAYS confirm before executing** operations that modify remote systems
- Show what will be changed BEFORE executing (commits, PR details, messages, etc.)
- Wait for explicit "yes" confirmation
- See [~/.claude/COMMAND_SAFETY.md](~/.claude/COMMAND_SAFETY.md) for complete policy
- Examples requiring confirmation:
  - `git push` - Show commits being pushed
  - Creating PRs - Show PR title, description, commits
  - Posting to Slack - Show message content and channel
  - Creating/updating Jira tickets - Show ticket details
  - Any API write operations

### Task Management
- Use TodoWrite for multi-step tasks (3+ steps)
- Mark todos as in_progress before starting work
- Mark completed immediately after finishing (don't batch)
- One task in_progress at a time

## Global vs Project Configuration Structure

Claude Code uses a two-tier configuration system:

### Global Configuration (`~/.claude/`)
**Applies across ALL projects** - User preferences, workflows, and reusable templates:
- `~/.claude/PREFERENCES.md` - Your personal preferences and workflow defaults
- `~/.claude/SESSION_START.md` - Session startup procedure (referenced by `/start` command)
- `~/.claude/WRAPUP.md` - Session wrapup procedure (referenced by `/wrapup` command)
- `~/.claude/commands/` - Personal slash commands available in all projects
- `~/.claude/templates/` - Reusable templates (session notes, etc.)
- `~/.claude/TODO.md` - Cross-project tasks and global improvements

### Project Configuration (`.claude/`)
**Project-specific** - Codebase patterns, project context, and session history:
- `.claude/PREFERENCES.md` - Project-specific patterns, tech stack, known issues
- `.claude/SESSION_START.md` - Additional project-specific startup instructions (optional)
- `.claude/TODO.md` - Project-specific tasks and technical debt
- `.claude/session-notes/` - Daily session notes (ALWAYS project-specific, never global)
- `.claude/commands/` - Project-specific slash commands (shared with team via git)
- `.claude/*.md` - Reference docs (migration plans, guides, etc.)

### File Resolution Order
When reading `.claude/` files, always check:
1. **Global first**: `~/.claude/[filename]` (if exists)
2. **Project second**: `.claude/[filename]` (if exists)

Project files override/extend global files. This is automatically handled by the startup procedure.

## Session Start Checklist

When starting a new session (via `/start` command):
1. ✅ Read `~/.claude/PREFERENCES.md` (global preferences)
2. ✅ Read `.claude/PREFERENCES.md` (project preferences)
3. ✅ Read `~/.claude/SESSION_START.md` (startup procedure)
4. ✅ Check most recent session notes
5. ✅ Check git status and branch
6. ✅ Summarize context and pending work
7. ✅ Ask what to work on next

## Remember

- Hammer values directness and efficiency
- Document discoveries for future reference
- Test changes before considering them done
- Keep session notes updated
- Flag critical issues clearly
- Ask for clarification when needed

---

**Last Updated**: 2025-10-04
