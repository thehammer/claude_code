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

---

## Optional Tasks (As-Needed)

**Sync Permissions:**
- Run `~/.claude/recipes/permissions/sync-up-project-to-global.md` to promote project permissions to global

**Security Review:**
- See `~/.claude/SECURITY.md` for comprehensive security checklist before committing

**Commit Config Changes:**
- For clauding sessions, commit changes to `~/.claude` repository as needed

---

## Final Step: Release Locks and Deregister Session

**Always run at the end of wrapup:**

1. **Release any workspace locks:**
```bash
source ~/.claude/lib/core/locks.sh
PROJECT_NAME="$(basename "$(pwd)")"
lock_release "${PROJECT_NAME}:workspace" 2>/dev/null || true
```

2. **Deregister from IDE:**
```bash
~/.claude/bin/ide deregister
```

This releases workspace locks and removes the session from the IDE registry, keeping the dashboard accurate and allowing other sessions to modify files.

**Note:** If the tmux window is closed without running wrapup, the session will be cleaned up automatically by `ide cleanup` (run periodically or on dashboard load).
