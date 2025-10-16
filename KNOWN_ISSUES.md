# Known Issues and Workarounds

## Jira API - Must Source integrations.sh First

**Problem:** Jira API calls fail because credentials aren't loaded
**Error:** "Issue does not exist or you do not have permission to see it." OR "You do not have permission to create issues in this project."
**Date Discovered:** 2025-10-16
**Date Resolved:** 2025-10-16

**Root Cause:**
The `ATLASSIAN_API_TOKEN` and `ATLASSIAN_EMAIL` environment variables are NOT automatically available in bash commands. They must be loaded by sourcing `~/.claude/lib/integrations.sh` first.

**Solution:**
Always source the integrations file before using Jira functions:

```bash
source ~/.claude/lib/integrations.sh > /dev/null 2>&1
jira_create_issue "CORE" "Bug" "Summary" "Description" "P2" "ALL" "Production "
```

Or use a script approach:
```bash
#!/bin/bash
source ~/.claude/lib/integrations.sh > /dev/null 2>&1
jira_create_issue ...
```

**Why This Happens:**
The integrations.sh file loads credentials from `~/.claude/credentials/.env` using `set -a; source ~/.claude/credentials/.env; set +a`. This doesn't persist across separate bash command invocations.

**Best Practice:**
When writing bash commands that need Jira/Bitbucket/Slack/etc access, always use a script file approach with `source ~/.claude/lib/integrations.sh` at the top.

---

## Jira Custom Field - Production Environment Value

**Problem:** Environment field (customfield_10275) requires trailing space
**Correct Value:** `"Production "` (with trailing space)
**Incorrect Value:** `"Production"` (no trailing space)
**Error if wrong:** "Option value 'Production' is not valid"

**Fixed In:** `~/.claude/lib/integrations.sh` - `jira_create_issue()` function now defaults to "Production " with trailing space

---

Last Updated: 2025-10-16
