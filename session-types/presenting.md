# Presenting Session Startup

## Purpose
Creating PR descriptions, writing documentation, generating summaries, preparing demos, creating reports.

## Context to Load

### 1. Recent Session Notes (Target Type)
Determine what needs presenting:
- If presenting code: Read `.claude/session-notes/coding/` recent notes
- If presenting analysis: Read `.claude/session-notes/analysis/` recent notes
- If presenting investigation: Read `.claude/session-notes/debugging/` recent notes

### 2. Git Context (Recent Work)
```bash
git status
git branch --show-current
git log -10 --oneline
git diff master...HEAD --stat
```

Show what changed to understand scope of work.

### 3. Relevant Documentation
Read existing docs that might need updating:
- Project README
- Feature documentation
- Architecture docs
- Migration guides

### 4. Project Context
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/presenting.md` (if exists)

## Integrations

### Pre-load
- **Git** - Already loaded for recent work context
- **Bitbucket** - May need to create PR

### Load On-Demand
- **Bitbucket** - Create PR with polished description
- **Confluence** - Update or create documentation pages
- **Jira** - Link work to tickets, update status
- **Slack** - Post announcements or updates

### Skip Entirely
- Sentry (error tracking not relevant)
- Datadog logs (not needed for presentations)
- Detailed integration pre-loading

## Summary Format

Tell Hammer:
- **Recent work completed:** [from session notes]
- **Branch:** [branch name]
- **Changes:** [file count and summary]
- **Documentation found:** [relevant docs]

Then ask: "What would you like to present?" with options:
1. Create PR with detailed description
2. Write/update documentation
3. Generate work summary
4. Prepare demo notes
5. Create status report

## Available Agents

**Delegate to agents** when preparing presentations requires gathering context.

| Agent | Use For | Invocation |
|-------|---------|------------|
| **session-researcher** | Find work done, approaches used | "Use session-researcher to find what we did on the auth feature" |
| **pr-review-toolkit** | Understand PR scope and changes | "Use /review-pr to analyze the changes in my branch" |
| **confluence-agent** | Read existing docs to update | "Use confluence-agent to get the current API documentation" |
| **jira-agent** | Find related tickets for linking | "Use jira-agent to find all tickets related to this feature" |

**When to use agents vs direct tools:**
- **Use agents** when: Gathering context from multiple sources, need comprehensive view
- **Use direct tools** when: Reading local files, quick git commands, creating the final output

**Presentation workflow with agents:**
1. Use **session-researcher** to understand the full scope of work
2. Direct tools for git log/diff
3. Use **jira-agent** to find tickets to link
4. Direct tools to create the PR/docs/report

## Common Workflows

1. **Create Pull Request:**
   - Use **session-researcher** to recall the full scope of work
   - Review commits and changes (direct git)
   - Use **jira-agent** to find tickets to link
   - Generate PR title and description
   - Show PR before creating

2. **Update Documentation:**
   - Use **confluence-agent** to get current documentation
   - Identify sections to update
   - Draft new content
   - Show changes before saving
   - Update Confluence if needed

3. **Work Summary:**
   - Read session notes
   - Extract key accomplishments
   - List files changed
   - Note decisions made
   - Format for audience (team update, manager report, etc.)

4. **Demo Preparation:**
   - Read implementation details
   - Identify demo scenarios
   - List talking points
   - Note edge cases
   - Prepare Q&A

5. **Status Report:**
   - Review completed work
   - Check TODO progress
   - Identify blockers
   - Estimate remaining work
   - Format update

## Token Budget Target
~12K tokens for startup (needs recent work context but not all integrations)

## Notes Template
Use `~/.claude/templates/session-notes/presenting.md` for session notes structure.

## Tips for Good Presentations

- **Know your audience:** Technical vs non-technical, depth vs breadth
- **Show impact:** What problem does this solve? Who benefits?
- **Be concise:** Start with summary, provide details only if asked
- **Use examples:** Concrete scenarios help understanding
- **Link context:** Reference tickets, docs, related work
- **Highlight decisions:** What alternatives were considered? Why this approach?

## Calendar Display
Show today's calendar in summary using the "Display Today's Calendar" recipe.
Include "📅 Today's Schedule:" line in summary format.
