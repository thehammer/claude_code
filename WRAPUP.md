# Session Wrapup Instructions

**IMPORTANT**: We take automatic session notes throughout the day!

When the user says it's time to wrap up:

1. **Sync Permissions Up (If Project Has Local Settings)**

**Check for project-local permissions:**
```bash
if [ -f .claude/settings.local.json ]; then
    echo "Project has local permission settings - running sync-up"
fi
```

**If `.claude/settings.local.json` exists:**

### Run Sync-Up Recipe

**Recipe:** `~/.claude/recipes/permissions/sync-up-project-to-global.md`

**Goal:** Promote useful project permissions to global settings, consolidating permission management.

**Follow the sync-up recipe instructions:**
1. Identify NEW permissions (compare current vs `.session-start` backup)
2. Categorize permissions:
   - Auto-promote: Generic wildcards, common tools, safe operations
   - Review: Project-specific tools, remote operations, integrations
   - Never promote: Absolute paths, one-off commands, embedded data
3. Present promotable permissions to user
4. Update global settings with promoted patterns
5. Optionally clean up project settings (remove now-global patterns)
6. Report results

**Quick Summary (Full details in recipe):**
- Auto-promotes obviously useful patterns (no user input needed)
- Reviews project-specific patterns interactively
- Auto-skips one-off commands and absolute paths
- Simplifies project settings after promotion
- Always creates backups before modifying

**Expected Result:**
```
✅ Permission sync complete (project → global)

Global changes:
  + 5 new allow patterns
  + 0 new deny patterns
  + 0 new ask patterns

Project cleanup:
  - Removed 25 patterns (now in global)
  - 8 project-specific patterns remain

Backups saved:
  - ~/.claude/settings.json.backup
  - .claude/settings.local.json.backup

Next session: Global permissions available everywhere!
```

**Why This Matters:**
- Consolidates useful permissions to global (available in all projects)
- Reduces project-specific permission bloat
- Maintains single source of truth for common operations
- Cleans up "don't ask again" accumulation

---

2. **Check Open Pull Requests Status**

If Bitbucket integration is configured, list current open PRs:

**Step 1:** Load integrations
```bash
source ~/.claude/lib/integrations.sh
```

**Step 2:** List your PRs
```bash
bitbucket_list_prs "portal_dev"
```

Parse and format the results to show your open PRs with their status.

Include PR status in session notes.

2. Update `.claude/session-notes/YYYY-MM-DD.md` (use today's actual date) with:
   - All work completed in this session
   - Any bugs or issues discovered
   - All files changed
   - **Open PRs created or updated**
   - Next steps or pending work

3. Use the existing session file if one exists for today (append new session sections with `---` separator)

4. Keep notes comprehensive with:
   - Clickable file references (e.g., `[filename.php](path/to/filename.php)`)
   - Code snippets where relevant
   - Clear context and rationale for decisions made
   - Any new patterns or learnings discovered
   - Links to PRs and Jira tickets if relevant

5. No need to ask - just update the notes automatically

6. Review `.claude/IDEAS.md` if it exists:
   - Remove ideas that are no longer relevant or were completed
   - Keep ideas that are still worth considering
   - Archive stale ideas if needed
   - This keeps the ideas backlog fresh and actionable

7. **Security Review Before Committing** (CRITICAL):
   - **Always review files to be committed for sensitive data**
   - Check for files that might contain:
     - Production error logs or stack traces
     - Customer data (names, emails, PHI/PII)
     - API keys, tokens, passwords, or credentials
     - Internal system details or architecture
     - Conversation history with sensitive discussions
     - Debug artifacts or data exports
   - Run security check:
     ```bash
     # Review what will be committed
     git status
     git diff --cached

     # Check for potential secrets in staged files
     git diff --cached | grep -iE "password|secret|token|api.key|credential" || echo "No obvious secrets found"
     ```
   - **If sensitive files found:**
     - Unstage them: `git reset HEAD <file>`
     - Add to .gitignore if appropriate
     - Never commit production data, customer info, or secrets
   - **Proceed only after verification**

8. **Commit changes to ~/.claude repository** (for clauding sessions):
   - Check git status in ~/.claude
   - If there are changes to configuration files:
     ```bash
     cd ~/.claude
     git add .
     git status
     ```
   - **Run security review (step 7)** before committing
   - Show Hammer what files changed
   - Create commit with descriptive message about what was improved
   - Push to remote if desired
   - Example:
     ```bash
     git commit -m "Add command safety policy and fuzzy session type matching

     - Created COMMAND_SAFETY.md with 4-tier safety categorization
     - Updated PERMISSIONS.md to reference safety categories
     - Updated SESSION_START.md to infer session types intelligently
     - Updated WRAPUP.md to commit config changes

     🤖 Generated with Claude Code

     Co-Authored-By: Claude <noreply@anthropic.com>"
     git push origin master
     ```

---

## 9. Close Tmux Window (If Running in Tmux)

**IMPORTANT**: This should be the VERY LAST step after all other wrapup tasks are complete.

If Claude is running in a tmux window, automatically close the window and all its panes:

```bash
# Load tmux helpers
source ~/.claude/lib/local/tmux.sh

# Close the current tmux window (all panes, Claude last)
tmux_close_current_window
```

**What this does:**
1. Detects if running in tmux (silently skips if not)
2. Identifies all panes in the current window
3. Checks each pane for active processes (editors, interpreters, etc.)
4. Attempts graceful closure:
   - **Idle shells**: Closes immediately
   - **Vim/Emacs**: Sends quit command (`:qa` or `C-x C-c`)
   - **Other active processes**: Alerts user and skips
5. Closes Claude pane last (which closes the window)

**If panes can't close automatically:**
- Lists panes with active processes
- Asks user to either:
  - Close them manually and run `/wrapup` again
  - Confirm force-close (may lose unsaved work)

**Manual force-close option:**
```bash
# If you want to force-close all panes (bypasses checks)
source ~/.claude/lib/local/tmux.sh
tmux_close_window_panes force
```

---

**Note**:
- Session notes are project-specific and stored in each project's `.claude/session-notes/` directory
- Configuration changes should be committed to `~/.claude/.git` for version control
- Tmux window closing happens automatically at the end of wrapup
