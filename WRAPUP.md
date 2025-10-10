# Session Wrapup Instructions

**IMPORTANT**: We take automatic session notes throughout the day!

When the user says it's time to wrap up:

1. **Check Open Pull Requests Status**

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

7. **Commit changes to ~/.claude repository** (for clauding sessions):
   - Check git status in ~/.claude
   - If there are changes to configuration files:
     ```bash
     cd ~/.claude
     git add .
     git status
     ```
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

**Note**:
- Session notes are project-specific and stored in each project's `.claude/session-notes/` directory
- Configuration changes should be committed to `~/.claude/.git` for version control
