# Recipe: Create Carefeed Pull Request

**Category:** bitbucket
**Complexity:** moderate
**Last Updated:** 2025-10-24

## Goal

Create a pull request in Bitbucket for Carefeed projects that follows team conventions: includes Jira ticket link, proper formatting, auto-detects reviewers, and notifies the team.

This recipe orchestrates the complete PR creation workflow from branch verification through team notification, ensuring all Carefeed standards are met.

## Prerequisites

- Authenticated with Bitbucket (credentials configured)
- Working in a Carefeed project repository
- Current branch has commits to be reviewed
- Branch follows naming convention: `{type}/{JIRA-KEY}-{description}`
- Jira MCP server configured (for ticket operations)
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

**Using Bitbucket MCP tool:**
```
bitbucket_create_pr(
  repository: "portal_dev",  # Auto-detect from git remote
  source_branch: "feature/CORE-3982-null-safety-fuzzy-matching",
  destination_branch: "master",
  title: "CORE-3982: Handle null facility names in fuzzy matching",
  description: "[Generated PR description from step 3]",
  close_source_branch: false,
  reviewers: ["reviewer1@carefeed.com", "reviewer2@carefeed.com"]
)
```

**Fallback - Current bash helper:**
```bash
bitbucket_create_pr \
  "$(git rev-parse --abbrev-ref HEAD)" \
  "master" \
  "$pr_title" \
  "$pr_description"
```

**Why:** MCP provides better error handling and validation.

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

# 4. Generate PR title
pr_title="${jira_key}: ${jira_summary}"

# 5. Generate PR description
pr_description=$(carefeed_pr_description "$jira_key" "$jira_summary")

# 6. Create PR (will use Bitbucket MCP when available)
pr_result=$(bitbucket_create_pr "$branch" "master" "$pr_title" "$pr_description")
pr_number=$(echo "$pr_result" | grep -oE "PR #[0-9]+" | grep -oE "[0-9]+")
pr_url=$(echo "$pr_result" | grep -oE "https://[^ ]+" | head -1)

# 7. Link back to Jira
mcp__jira__jira_add_comment "$jira_key" \
  "Pull Request created: [PR #${pr_number}](${pr_url})"

# 8. Notify reviewers (optional)
echo "✅ PR created: $pr_url"
echo "📋 Jira ticket updated: https://carefeed.atlassian.net/browse/$jira_key"
```

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

# Verify credentials in ~/.claude/credentials/.env
# BITBUCKET_ACCESS_TOKEN=your_token
# BITBUCKET_USERNAME=your_username

# Test with simple API call
bitbucket_list_prs "" "OPEN" 1
```

---

### **Error: Jira ticket not found (404)**
**Cause:** Jira key in branch name doesn't exist or user lacks permissions

**Solution:**
```bash
# Verify Jira key is correct
jira_key=$(extract_jira_key "$(git rev-parse --abbrev-ref HEAD)")
echo "$jira_key"

# Check if ticket exists using Jira MCP
mcp__jira__jira_get_issue "$jira_key"

# If ticket doesn't exist, create it first or fix branch name
```

---

### **Error: PR already exists for this branch**
**Cause:** Branch already has an open PR

**Solution:**
```bash
# List existing PRs for repo
bitbucket_list_prs "" "OPEN" | \
  jq -r '.values[] | select(.source.branch.name == "YOUR_BRANCH")'

# Either:
# 1. Update existing PR: bitbucket_update_pr PR_ID "new title" "new desc"
# 2. Close old PR and create new one
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
