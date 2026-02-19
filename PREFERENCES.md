# Claude Global Preferences

## Prime Directive
**Manage Complexity**: Always work to find solutions that are just simple enough to solve problems, while minimizing complexity. Eliminate unnecessary complexity. Favor simple, maintainable solutions over clever or feature-rich ones.

## User Information
- **Name**: Hammer
- **Communication Style**: Professional but friendly - use name when it feels natural
- **Timezone**: America/Chicago (Central Time) - Use CT for all time displays

## Notifications
- **Slack User ID**: YOUR_SLACK_USER_ID (replace with your Slack user ID)
- **Slack Notification Channel**: #your-notification-channel (fallback)
- **Preferred notification method**: Slack DM (working via slack_send_dm)
- **Current method**: Slack DM
- **Fallback**: macOS notification
- **When to notify**:
  - Tasks taking longer than 5 minutes
  - When explicitly requested ("notify me when done")
  - Critical errors during long operations
  - Never for quick operations (<1 minute)

## Communication Preferences

### Verbosity Level: Minimal
- **Show results, not process** - Only communicate final outcomes and errors
- **No tool descriptions** - Skip explanations of which tools are being used
- **No step-by-step narration** - Don't describe each action being taken
- **Brief confirmations** - "Fixed 3 patterns" not "Fixed pattern X, pattern Y, pattern Z"
- **Explain complex decisions** - Still provide reasoning when making architectural or non-obvious choices
- **Always show errors** - Full error context when things fail

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
- **Proactively create and refactor helpers** - When writing complex inline code repeatedly, create a helper in `~/.claude/lib/`. Refactor existing helpers when you see improvement opportunities
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
  - **Default personal pattern**: `your-name/<branch-description>` (e.g., `hammer/fix-basecommand-bug`)
  - **Project-specific patterns**: Check `.claude/preferences/PREFERENCES.md` for project conventions
  - **Example with Jira**: Use `{type}/{JIRA-KEY}-{description}` (e.g., `feature/PROJ-1234-add-auth`)
- **Commit messages**:
  - **Default**: Conventional commits with scope
  - **Example with Jira**: Include Jira key (e.g., `feat(auth): PROJ-1234: add two-factor auth`)
- **Jira ticket workflow**:
  - **When Jira ticket needed**: Always ask "Do you have a Jira ticket for this, or would you like me to create one?"
  - **When creating tickets**: Infer project, type, priority, and description from context
  - **If ambiguous**: Ask for clarification (which project? what priority?)
  - **Show ticket details** before creating for confirmation
  - **After creation**: Use the ticket key for branch/commit/PR
- **Creating PRs**: Always use API access (Bitbucket API via `bitbucket_create_pr` or similar) instead of opening browser, unless API fails
- **Worktree workflow**: When creating branches for feature work:
  - Use git worktrees to isolate work (keeps main repo clean, enables parallel work)
  - Worktrees are created as sibling directories: `project-branchname/`
  - Use `/branch <name>` command to create branch + worktree together
  - Helper functions available in `~/.claude/lib/core/worktree.sh`
  - After creating worktree, user needs to `cd` to it or open new terminal

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

### Workspace Lock Management
When multiple Claude sessions may work in the same project:
- **Lock is auto-acquired** on first file modification (Edit, Write, modifying Bash)
- **Release lock when idle** - After completing a batch of changes, release the lock:
  ```bash
  source ~/.claude/lib/core/locks.sh && lock_release "$(basename $(pwd)):workspace"
  ```
- **Release before mode switches** - Release when switching from coding to research/reading
- **Check lock status** - Use `/lock` or `/lock status` to see current state
- **Take lock when needed** - Use `/lock take` to acquire lock from another session
- **Wrapup releases automatically** - `/wrapup` releases locks as part of cleanup

## Remember

- Hammer values directness and efficiency
- Document discoveries for future reference
- Test changes before considering them done
- Keep session notes updated
- Flag critical issues clearly
- Ask for clarification when needed

---

**Last Updated**: 2026-02-05
