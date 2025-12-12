# Reviewing Session

## Purpose
Review pull requests from other engineers across Bitbucket and GitHub repositories.

## PR Review Workflow

### 1. Fetch PRs Needing Review

When asked for PRs to review, apply these filters:
- **OPEN** state only (no merged/declined)
- **Not drafts**
- **Not authored by Hammer**
- **No active approval from us** (check for re-approval needs after new commits)
- **Recent** (prioritize last 2 weeks, flag older as stale)

### 2. Triage

Categorize PRs into:
- **Trivial** - Single-file changes, typo fixes, config updates, obvious fixes
- **Standard** - Normal feature work, bug fixes, refactors requiring review
- **Complex** - Large changes, architectural decisions, security-sensitive

Present: "Found X PRs. Y are trivial and could be batch-approved. Want me to approve those, then we'll review the rest one by one?"

### 3. Review Process

**Batch approval (trivial PRs):**
- No comments added
- Just approve silently

**One-by-one review:**
- Present analysis and recommendation
- May suggest comments with approval - but **wait for your approval before posting**
- Never post comments without explicit approval

**Comments policy:**
- Never add comments during batch/auto-approve
- On one-by-one: suggest comments, wait for approval before posting
- Default: approve without comment unless there's something worth discussing

## Fetching PR Diffs

**Use local git with triple-dot syntax** (merge-base diff):

```bash
git fetch origin <branch-name>
git diff --stat origin/master...origin/<branch-name>  # Summary
git diff origin/master...origin/<branch-name>         # Full diff
```

**Do NOT use `bb_diff_branches`** - it shows two-point diff with unrelated master commits.

**Workflow:**
1. `bb_get_pr` / `gh pr view` - metadata, description, linked tickets
2. `bb_ls_pr_comments` / `gh pr view --comments` - existing comments
3. Local git diff - actual code review

## Bitbucket Configuration

| Project | Repo Slug |
|---------|-----------|
| Portal | `portal_dev` |
| Patient App | `patient_dev` |
| Infrastructure | `infrastructure` |

**Workspace:** `Bitbucketpassword1`

**Approve PRs:**
```bash
# MCP tool has issues - use curl fallback:
source ~/.claude/credentials/.env && curl -s -X POST \
  -u "hammer@carefeed.com:$BITBUCKET_ACCESS_TOKEN" \
  "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/<repo>/pullrequests/<id>/approve"
```

## GitHub Configuration

**Repositories:** `carefeed/family-portal`, `carefeed/payments`

```bash
gh pr list --repo carefeed/family-portal --state open
gh pr view <number> --repo carefeed/family-portal
gh pr diff <number> --repo carefeed/family-portal
gh pr review <number> --repo carefeed/family-portal --approve
```

## Session Startup

On session start:
1. Fetch open PRs across all repos
2. Apply filters and triage
3. Present summary and ask how to proceed
