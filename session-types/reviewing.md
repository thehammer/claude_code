# Reviewing Session

## Purpose
Review pull requests from other engineers across GitHub repositories.

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

GitHub handles merge commits correctly, so `gh pr diff` shows only the PR's actual changes.

**Workflow:**
1. `gh pr view <number> --repo <repo>` - metadata, description, linked tickets
2. `gh pr view <number> --repo <repo> --comments` - existing comments
3. `gh pr diff <number> --repo <repo>` - actual code review

## GitHub Configuration

**Repositories** are configured per-project. Use `gh pr list --repo <org>/<repo>` to list PRs.

```bash
gh pr list --repo <org>/<repo> --state open
gh pr view <number> --repo <org>/<repo>
gh pr diff <number> --repo <org>/<repo>
gh pr review <number> --repo <org>/<repo> --approve
```

## Plugin Commands

**Use these plugins for automated, thorough reviews:**

### /code-review (Recommended for Complex PRs)
Runs 4 parallel agents with confidence scoring:
- Agents 1 & 2: CLAUDE.md compliance
- Agent 3: Bug scanning
- Agent 4: Git blame/history analysis

Only posts issues with ≥80 confidence (filters false positives).

```bash
# On a PR branch:
/code-review
```

### pr-review-toolkit Agents
Specialized review agents for targeted analysis:

| Agent | Focus | Trigger |
|-------|-------|---------|
| **comment-analyzer** | Comment accuracy, doc completeness | "Check if comments are accurate" |
| **pr-test-analyzer** | Test coverage, critical gaps | "Analyze test coverage for this PR" |
| **error-handler-reviewer** | Error handling quality | "Review error handling" |
| **type-design-reviewer** | Type safety, API design | "Review type design" |
| **code-quality-reviewer** | General quality issues | "Review code quality" |
| **code-simplifier** | Complexity reduction | "Simplify this code" |

## Available Agents

**Delegate to agents** for context-heavy review tasks. Agents run in isolated context and return summaries, keeping the main conversation lean.

| Agent | Use For | Invocation |
|-------|---------|------------|
| **pr-review-toolkit** | Deep code review with detailed feedback | "Use /review-pr to analyze PR #123 in admin-portal" |
| **jira-agent** | Check related tickets, find context | "Use jira-agent to find tickets related to this PR" |
| **codebase-explainer** | Understand unfamiliar code areas | "Use codebase-explainer to explain how this service works" |
| **pipeline-debugger** | Check if PR has failing builds | "Use pipeline-debugger to check CI status for this branch" |

**When to use agents vs direct tools:**
- **Use agents** when: Large diffs (50+ lines), unfamiliar codebase areas, need deep analysis
- **Use direct tools** when: Small/trivial PRs, quick metadata lookup, batch approvals
- **Use /code-review** when: Want automated parallel analysis with confidence filtering

**Recommended workflow for complex PRs:**
1. Quick triage with `gh pr list`
2. For complex PRs, run `/code-review` for parallel automated analysis
3. Or use **pr-review-toolkit** agents for isolated analysis
4. Use pr-review-toolkit agents for specific concerns (tests, types, errors)
5. Review findings and approve or request changes

## Session Startup

On session start:
1. Fetch open PRs across all repos
2. Apply filters and triage
3. Present summary and ask how to proceed
