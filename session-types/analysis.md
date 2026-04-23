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

## Available Agents

**Delegate to agents** for deep exploration. Agents run in isolated context and return summaries, keeping the main conversation lean.

| Agent | Use For | Invocation |
|-------|---------|------------|
| **codebase-explainer** | Deep dive into how code works | "Use codebase-explainer to explain the authentication system" |
| **git-historian** | Understand code evolution | "Use git-historian to trace changes to the payment module" |
| **dependency-auditor** | Analyze dependencies, find issues | "Use dependency-auditor to check for vulnerabilities" |
| **connie** | Read architecture docs | "Use connie to get the design doc for this feature" |
| **session-researcher** | Find previous analysis work | "Use session-researcher to find our API analysis" |

**When to use agents vs direct tools:**
- **Use agents** when: Deep exploration, multiple files/areas, need comprehensive understanding
- **Use direct tools** when: Quick lookups, specific file reads, targeted searches

**Analysis sessions benefit heavily from agents** - they let you explore deeply without context bloat.

## Common Workflows

1. **Codebase Exploration:**
   - Use **codebase-explainer** for initial understanding
   - Map dependencies with direct tools
   - Document patterns
   - Identify coupling points

2. **Architecture Review:**
   - Use **connie** for existing design docs
   - Use **codebase-explainer** for implementation understanding
   - Evaluate design decisions
   - Document trade-offs

3. **Impact Analysis:**
   - Use **git-historian** to understand change patterns
   - Trace dependencies
   - Find affected components
   - Estimate change scope

4. **Code Review:**
   - Use **pr-review-toolkit** for detailed analysis
   - Check for patterns
   - Suggest improvements
   - Verify best practices

5. **Research:**
   - Use **dependency-auditor** for library evaluation
   - Compare approaches
   - Prototype solutions
   - Document findings

## Token Budget Target
~10K tokens for startup (minimal external context, focus on code reading)

## Notes Template
Use `~/.claude/templates/session-notes/analysis.md` for session notes structure.

## Calendar Display
Show today's calendar after git status using the "Display Today's Calendar" recipe.
Include "📅 Today's Schedule:" line in summary format.
