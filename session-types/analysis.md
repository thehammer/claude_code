# Analysis Session Startup

## Purpose
Understanding codebase, evaluating architecture, researching solutions, code review, impact analysis.

## Context to Load

### 1. Git History (Extended)
```bash
git branch --show-current
git log -10 --oneline --graph
```

More history than coding sessions - understanding evolution of code.

### 2. Recent Analysis Notes
Look in `.claude/session-notes/analysis/` for:
- Previous analysis results
- Architecture decisions
- Research findings
- Code patterns discovered

### 3. Project Documentation
Read key project docs:
- `.claude/README.md` - Project structure
- `.claude/PREFERENCES.md` - Known patterns and issues
- Any architecture docs in `.claude/`

### 4. Project Context
Read cascading preferences:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/analysis.md` (if exists)

### 5. TODO Items (Optional)
Check `.claude/todos/improvements.md` for technical debt or optimization opportunities

## Integrations

### Pre-load
- **None** - Start with minimal external context

### Load On-Demand
- **Confluence** - Read architecture docs when needed
- **Jira** - Check requirements or related tickets
- **Datadog** - Query metrics for performance analysis
- **GitHub/Bitbucket** - Review PRs or commit history if needed

### Skip Entirely
- Sentry (error tracking not relevant to analysis)
- Slack (communication not needed)
- Open PRs (unless specifically analyzing one)

## Summary Format

Tell Hammer:
- **Last analysis session:** [date and topic]
- **Current branch:** [branch name]
- **Recent analysis:** [brief summary if found in notes]
- **Available docs:** [list key documents found]

Then ask: "What would you like to analyze?" or "Which part of the codebase should we explore?"

## Common Workflows

1. **Codebase Exploration:**
   - Understand file structure
   - Map dependencies
   - Document patterns
   - Identify coupling points

2. **Architecture Review:**
   - Evaluate design decisions
   - Find architectural issues
   - Suggest improvements
   - Document trade-offs

3. **Impact Analysis:**
   - Trace dependencies
   - Find affected components
   - Estimate change scope
   - Plan refactoring

4. **Code Review:**
   - Read PR changes
   - Check for patterns
   - Suggest improvements
   - Verify best practices

5. **Research:**
   - Compare approaches
   - Evaluate libraries
   - Prototype solutions
   - Document findings

## Token Budget Target
~10K tokens for startup (minimal external context, focus on code reading)

## Notes Template
Use `~/.claude/templates/session-notes/analysis.md` for session notes structure.
