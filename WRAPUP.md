# Session Wrapup Instructions

**IMPORTANT**: We take automatic session notes throughout the day!

When the user says it's time to wrap up:

1. **Check Open Pull Requests Status**

If Bitbucket integration is configured, list current open PRs:
```bash
source ~/.claude/lib/integrations.sh && curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" \
  -H "Accept: application/json" \
  "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pullrequests?state=OPEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); my_prs = [pr for pr in data.get('values', []) if pr['author']['nickname'] == 'Hammer']; print(f'\nYou have {len(my_prs)} open PRs:'); [print(f'  - PR #{pr[\"id\"]}: {pr[\"title\"]} ({\"DRAFT\" if pr.get(\"draft\") else \"Ready for review\"})') for pr in my_prs] if my_prs else print('  No open PRs')"
```

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

**Note**: Session notes are project-specific and stored in each project's `.claude/session-notes/` directory.
