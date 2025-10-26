# Recipe: Create Carefeed Pull Request

**Category:** bitbucket
**Complexity:** moderate
**Last Updated:** 2025-10-25 (Updated for Bitbucket MCP)

## Goal

Create a pull request in Bitbucket for Carefeed projects that follows team conventions: includes Jira ticket link, proper formatting, auto-detects reviewers, and notifies the team.

This recipe orchestrates the complete PR creation workflow from branch verification through team notification, ensuring all Carefeed standards are met.

**✨ Updated for Bitbucket MCP:** This recipe now uses the Bitbucket MCP server. Simply ask Claude Code to create a PR - it will use MCP tools to handle all the steps automatically.

## Prerequisites

- **Bitbucket MCP server** running and configured in Claude Code
- **Jira MCP server** configured (for ticket operations)
- Authenticated with Bitbucket and Jira (credentials configured in MCP)
- Working in a Carefeed project repository
- Current branch has commits to be reviewed
- Branch follows naming convention: `{type}/{JIRA-KEY}-{description}`
- Slack integration configured (for notifications, optional)

## Inputs

- **Required:**
  - Current git branch (auto-detected)
  - Target branch (usually `master` or `main`)
  - PR title

- **Optional:**
  - Custom PR summary (generated from Jira ticket if not provided)
  - Specific reviewers (auto-assigned by default)
  - Close source branch flag (default: false)

## Steps

### 1. **Verify Branch State**
Check that the current branch is ready for PR:
- Ensure branch has commits ahead of target
- Verify branch follows Carefeed naming convention
- Check that all changes are committed

```bash
# Check if branch has commits to push
git log origin/master..HEAD --oneline | wc -l

# Verify branch name format
git rev-parse --abbrev-ref HEAD
# Should match: {type}/{JIRA-KEY}-{description}
```

**Why:** Prevents creating empty PRs or PRs from incorrectly named branches.

---

### 2. **Extract Jira Ticket Information**
Parse the Jira key from branch name and fetch ticket details:

```bash
# Extract Jira key from branch
branch=$(git rev-parse --abbrev-ref HEAD)
jira_key=$(extract_jira_key "$branch")

# Example: feature/CORE-3982-null-safety-fuzzy-matching
# Extracts: CORE-3982
```

**Using Jira MCP:**
```
mcp__jira__jira_get_issue(issueIdOrKey: "$jira_key")
```

**Get from ticket:**
- Issue summary (for PR title if not provided)
- Issue description (for PR context)
- Current status (ensure it's appropriate for PR)
- Assignee (add as reviewer)

**Why:** Auto-populates PR with context from Jira, ensures consistency.

---

### 3. **Generate PR Description**
Create standardized PR description following Carefeed template:

**Use Carefeed helper:**
```bash
carefeed_pr_description "$jira_key" "$summary"
```

**Template Structure:**
```markdown
## Jira Ticket
[CORE-3982](https://carefeed.atlassian.net/browse/CORE-3982)

## Summary
[Brief overview from Jira or custom text]

## Changes
* [List of key changes - filled in by developer or inferred from commits]

## Testing
* [How changes were tested]

## Related
* [Related PRs/issues if applicable]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Enhancement:** Can optionally analyze git diff to suggest changes list:
```bash
git diff origin/master --stat
git log origin/master..HEAD --oneline
```

**Why:** Consistent format makes PRs easier to review and track.

---

### 4. **Determine PR Title**
Choose appropriate title format:

**Option A - From Jira (recommended):**
```
{JIRA-KEY}: {Jira issue summary}
```
Example: `CORE-3982: Handle null facility names in fuzzy matching`

**Option B - Custom:**
```
{JIRA-KEY}: {Custom title}
```

**Why:** Jira key in title enables auto-linking and tracking.

---

### 5. **Identify Reviewers**
Auto-assign reviewers based on Carefeed conventions:

**Team Mapping:**
- **CORE tickets** → Core team reviewers
- **INT tickets** → Integration team reviewers
- **PAYM tickets** → Payments team reviewers
- **APP tickets** → App team reviewers

**Default Reviewers:**
- Jira ticket assignee (if not PR author)
- Team tech lead
- Recent committers to affected files (optional)

**Using Git History:**
```bash
# Find reviewers based on file changes
git diff --name-only origin/master..HEAD | \
  xargs -I {} git log -1 --format="%ae" -- {}
```

**Why:** Ensures right people review based on expertise and ownership.

---

### 6. **Create Pull Request via Bitbucket MCP**

**Using Claude Code with Bitbucket MCP:**

Simply ask Claude:
```
"Create a PR for this branch to master. Use the Jira ticket for the description."
```

Claude will:
1. Detect the current branch and extract Jira key
2. Fetch Jira ticket details using `mcp__jira__jira_get_issue`
3. Generate a Carefeed-compliant PR description
4. Create the PR using `mcp__bitbucket__bb_add_pr`
5. Add appropriate reviewers based on Jira assignee
6. Link the PR back to the Jira ticket

**Or be more specific:**
```
"Create a PR to master with title 'CORE-3982: Handle null facility names' and add John as a reviewer"
```

**Why:** MCP handles all the details automatically with better error handling.

---

### 7. **Link PR to Jira Ticket**

**Using Jira MCP:**
```
# Update Jira ticket with PR link
mcp__jira__jira_add_comment(
  issueIdOrKey: "$jira_key",
  commentBody: "Pull Request created: [PR #$pr_number]($pr_url)"
)

# Optionally transition ticket to "In Review"
mcp__jira__jira_transition_issue(
  issueIdOrKey: "$jira_key",
  transitionId: "In Review"
)
```

**Why:** Keeps Jira ticket updated with PR status, improves tracking.

---

### 8. **Notify Team (Optional)**

**Using Slack MCP:**
```bash
# Post to team channel
slack_post_message \
  "#development" \
  "🔔 New PR: *$pr_title*\n$pr_url\nCC: <@reviewer1> <@reviewer2>"
```

**Alternative - DM reviewers:**
```bash
for reviewer in "${reviewers[@]}"; do
  slack_send_dm "$reviewer" \
    "You've been assigned to review PR #$pr_number: $pr_title\n$pr_url"
done
```

**Why:** Proactive notification speeds up review process.

---

## Command Patterns

### Full Workflow Example

```bash
#!/bin/bash
# Complete Carefeed PR creation workflow

# 1. Verify we're in a Carefeed project
if ! is_carefeed_project; then
  echo "Error: Not a Carefeed project"
  exit 1
fi

# 2. Get current branch and extract Jira key
branch=$(git rev-parse --abbrev-ref HEAD)
jira_key=$(extract_jira_key "$branch")

if [[ -z "$jira_key" ]]; then
  echo "Error: Branch name doesn't contain valid Jira key"
  echo "Expected format: {type}/{JIRA-KEY}-{description}"
  exit 1
fi

# 3. Fetch Jira ticket details (using Jira MCP)
jira_issue=$(mcp__jira__jira_get_issue "$jira_key")
jira_summary=$(echo "$jira_issue" | jq -r '.fields.summary')

## Using This Recipe with Claude Code

Instead of running bash commands, simply ask Claude Code to create the PR:

**Simple request:**
```
"Create a Carefeed PR for this branch"
```

**More detailed request:**
```
"Create a PR to master for my current branch. Include the Jira ticket details in the description and add the Jira assignee as a reviewer."
```

**Step-by-step if you prefer:**
```
1. "Get the Jira ticket for my current branch"
2. "Create a PR description using Carefeed's template"
3. "Create the PR on Bitbucket and link it to the Jira ticket"
```

Claude will use the appropriate MCP tools (`mcp__jira__*` and `mcp__bitbucket__*`) to handle all steps automatically.

---

## Expected Output

### Success
```
✅ Pull request created successfully!
PR #4067: CORE-3982: Handle null facility names in fuzzy matching
URL: https://bitbucket.org/Bitbucketpassword1/portal_dev/pull-requests/4067

📋 Jira ticket updated: CORE-3982
🔔 Reviewers notified via Slack
```

### Verification
- PR appears in Bitbucket with correct title and description
- Jira ticket has comment with PR link
- Reviewers received notification
- PR title includes Jira key for auto-linking

---

## Error Handling

### **Error: Branch doesn't contain Jira key**
**Cause:** Branch name doesn't follow convention `{type}/{JIRA-KEY}-{description}`

**Solution:**
```bash
# Check current branch name
git rev-parse --abbrev-ref HEAD

# Rename branch if needed
git branch -m feature/CORE-1234-my-feature

# Or create new branch from current
git checkout -b feature/CORE-1234-my-feature
```

---

### **Error: No commits ahead of target branch**
**Cause:** Current branch has no changes to create PR from

**Solution:**
```bash
# Check if branch has commits
git log origin/master..HEAD

# If empty, make changes and commit first
git add .
git commit -m "CORE-1234 - implement feature"
git push origin HEAD
```

---

### **Error: Bitbucket authentication failed (401)**
**Cause:** Invalid or expired credentials

**Solution:**
```bash
# Check if credentials are configured
bitbucket_is_configured && echo "Configured" || echo "Not configured"

# Verify MCP server is running
docker ps | grep bitbucket-mcp-server

# Test by asking Claude
"List open PRs for this repository"
```

---

### **Error: Jira ticket not found (404)**
**Cause:** Jira key in branch name doesn't exist or user lacks permissions

**Solution:**
Ask Claude:
```
"What's the Jira key from my current branch? Does that ticket exist?"
```

Claude will extract the key and check if it exists. If not, either fix the branch name or create the ticket first.

---

### **Error: PR already exists for this branch**
**Cause:** Branch already has an open PR

**Solution:**
Ask Claude:
```
"Does my current branch already have an open PR?"
```

Claude will use `mcp__bitbucket__bb_list_prs` to check. If a PR exists:
- Option 1: Update the existing PR
- Option 2: Ask Claude to close it and create a new one
# 3. Continue using existing PR
```

---

## Related Recipes

### **Uses:**
- [Generate Carefeed PR Description](../carefeed/pr-description.md) - Template generation
- [Extract Jira Key from Branch](../carefeed/extract-jira-key.md) - Parsing branch names
- [Get Jira Ticket Details](../jira/get-ticket.md) - Fetching ticket info

### **Used by:**
- [Complete Feature Workflow](../workflows/complete-feature.md) - End-to-end feature delivery
- [Hotfix Deployment](../deployments/hotfix.md) - Emergency fix process

### **Alternatives:**
- [Create GitHub PR](../github/create-pr.md) - For GitHub-hosted repos
- [Manual PR Creation](../bitbucket/create-pr-manual.md) - Browser-based approach

---

## Notes

### **Carefeed PR Conventions**

**Title Format:**
- Always include Jira key: `CORE-1234: Description`
- Keep title concise but descriptive
- Match Jira issue summary when possible

**Description Requirements:**
- Link to Jira ticket (auto-linked via key in title)
- Summary of what changed and why
- How changes were tested
- Related PRs or breaking changes

**Review Process:**
- PRs need minimum 2 approvals (varies by team)
- CI must pass before merge
- Squash commits on merge to keep history clean

### **Team-Specific Practices**

**Core Team:**
- All PRs require tech lead approval
- Database migrations need extra review
- Breaking changes require migration plan

**Integration Team:**
- Integration PRs need PCC staging test
- Document new environment variables
- Update integration documentation

**Payments Team:**
- Payment PRs require extra security review
- Test with Stripe test mode
- Document refund/chargeback impact

### **Performance Considerations**

- Fetching Jira ticket details adds ~500ms
- Slack notifications add ~300ms
- Consider making notifications async for large PRs
- Cache Jira ticket info if creating multiple PRs

### **Historical Context**

**Why this approach:**
- Manual PR creation was error-prone (forgot Jira links, wrong reviewers)
- Standardized template improves review quality
- Auto-linking to Jira improves tracking and metrics
- Slack notifications reduce review latency

**Evolution:**
- v1 (2024): Manual PRs, frequent mistakes
- v2 (2024-09): Added carefeed_pr_description helper
- v3 (2025-10): Full recipe with MCP integration (current)

---

## Examples

### Example 1: Standard Feature PR

**Scenario:** Completed work on CORE-3982, ready to create PR

```bash
# Current state
$ git branch
* feature/CORE-3982-null-safety-fuzzy-matching

$ git log origin/master..HEAD --oneline
e7ebf42 fix(market-analytics): CORE-3982: Handle null facility names in fuzzy matching

# Execute recipe workflow (simplified)
$ create_carefeed_pr

Extracted Jira key: CORE-3982
Fetching Jira ticket details...
✓ Found: "Handle null facility names in fuzzy matching"

Creating PR:
  From: feature/CORE-3982-null-safety-fuzzy-matching
  To: master
  Title: CORE-3982: Handle null facility names in fuzzy matching

✅ Pull request created successfully!
PR #4067: https://bitbucket.org/Bitbucketpassword1/portal_dev/pull-requests/4067

📋 Updated Jira: https://carefeed.atlassian.net/browse/CORE-3982
🔔 Notified reviewers: @tech-lead, @team-member
```

**Result:** PR created with proper format, Jira linked, team notified.

---

### Example 2: Hotfix PR with Urgency

**Scenario:** Production bug fix needs immediate review

```bash
# Create hotfix branch with Jira key
$ git checkout -b hotfix/CORE-4001-fix-payment-crash master

# Make fix and commit
$ git commit -m "CORE-4001 - Fix null pointer in payment processing"

# Create urgent PR
$ create_carefeed_pr --urgent

Extracted Jira key: CORE-4001
Fetching Jira ticket details...
✓ Found: "Production: Payment processing crash"
⚠️  Ticket priority: P0 (Critical)

Creating PR with urgent flag:
  From: hotfix/CORE-4001-fix-payment-crash
  To: master
  Title: [URGENT] CORE-4001: Production: Payment processing crash

✅ Pull request created successfully!
PR #4068: https://bitbucket.org/Bitbucketpassword1/portal_dev/pull-requests/4068

📋 Updated Jira (transitioned to "In Review")
🚨 URGENT notification sent to #core-team and @on-call
```

**Result:** Urgent PR flagged, on-call team notified immediately.

---

### Example 3: Multi-Ticket PR

**Scenario:** PR touches multiple related tickets

```bash
# Branch has primary ticket
$ git branch
* feature/CORE-3901-add-production-safeguards

# But also fixes related issues
$ create_carefeed_pr --related-tickets "CORE-3900,CORE-3902"

Extracted Jira key: CORE-3901 (primary)
Related tickets: CORE-3900, CORE-3902

Fetching ticket details...
✓ CORE-3901: "Add production safeguards"
✓ CORE-3900: "Production branch safety checks"
✓ CORE-3902: "Prevent accidental main deploys"

Creating PR with related tickets...

✅ Pull request created successfully!
PR #4069: https://bitbucket.org/Bitbucketpassword1/portal_dev/pull-requests/4069

📋 Updated Jira tickets: CORE-3901, CORE-3900, CORE-3902
   All tickets linked to PR #4069
```

**Result:** Single PR properly linked to all related Jira tickets.

---

**Version History:**
- 2025-10-24: Initial creation - full Carefeed PR workflow with MCP integration
