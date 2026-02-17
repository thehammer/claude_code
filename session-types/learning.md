# Learning Session Startup

## Purpose
Learning about technologies, patterns, frameworks, or concepts. Understanding how something works, exploring documentation, running experiments, and building mental models.

## Context to Load

### 1. Global Configuration
Read core config files from `~/.claude/`:
- `PREFERENCES.md` - Global preferences
- Check `IDEAS.md` for learning topics

### 2. Recent Learning Notes
Look in `.claude/session-notes/learning/` for:
- Topics explored recently
- Key learnings and insights
- Resources discovered
- Experiments tried
- Open questions

### 3. Project Context (Minimal)
Only if learning is project-specific:
- Relevant code files (when exploring existing patterns)
- Project documentation
- Configuration files (when learning project setup)

### 4. Learning Resources
Based on the topic:
- Official documentation (via WebFetch)
- Example code repositories
- Tutorial content
- API references

## Skip Most Project Context

**DO NOT LOAD:**
- ❌ Git status/history (unless learning git itself)
- ❌ Open PRs
- ❌ Recent commits
- ❌ Full codebase analysis
- ❌ Session notes from other types

Learning sessions focus on understanding concepts, not current project work.

## Integrations

### Pre-load
- **None** - Learning is exploratory

### Load On-Demand
- **WebFetch** - For documentation and tutorials
- **Git** - If learning involves cloning example repos
- **Bash** - For running experiments and trying commands

### Skip Entirely
- All project integrations (Jira, Confluence, Sentry, Datadog, Slack, Bitbucket)
- These aren't needed for learning sessions

## Available Agents

**Delegate to agents** for deep exploration during learning sessions.

| Agent | Use For | Invocation |
|-------|---------|------------|
| **codebase-explainer** | Deep dive into how code works (Archaeological Mode) | "Use codebase-explainer to explain how the authentication system works" |
| **confluence-reader** | Read documentation, design docs | "Use confluence-reader to get the API design document" |
| **session-researcher** | Find previous learning sessions, approaches | "Use session-researcher to find when we learned about WebSockets" |

**When to use agents vs direct tools:**
- **Use agents** when: Exploring unfamiliar code areas, need comprehensive understanding, tracing complex flows
- **Use direct tools** when: Reading single files, running experiments, quick lookups

**Learning workflows with agents:**
1. **Archaeological Mode** → Use **codebase-explainer** to understand existing patterns
2. **Documentation Mode** → Use **confluence-reader** for internal docs, WebFetch for external
3. **Building on Past Learning** → Use **session-researcher** to find previous sessions on similar topics

## Summary Format

Tell Hammer:
- **Last learning session:** [date and what was learned]
- **Topic:** [what we're learning about today]
- **Approach:** [tutorial, docs, experiments, etc.]

Then ask: "What would you like to learn about?" with options:
1. New technology or framework
2. Design pattern or architectural concept
3. Language feature or syntax
4. Tool or command-line utility
5. Algorithm or data structure
6. Testing pattern or technique
7. Deployment or infrastructure concept
8. Project-specific pattern or codebase area

## Common Workflows

1. **Learning a New Technology:**
   - Find official documentation
   - Read getting started guide
   - Set up minimal example
   - Experiment with basic features
   - Document key concepts and gotchas

2. **Understanding a Pattern:**
   - Read about the pattern (theory)
   - Find real-world examples
   - Identify when to use it
   - Write a simple implementation
   - Note advantages and tradeoffs

3. **Exploring Documentation:**
   - Navigate to relevant sections
   - Read API references
   - Try example code
   - Note common pitfalls
   - Bookmark useful pages

4. **Running Experiments:**
   - Set up isolated environment
   - Try different approaches
   - Compare results
   - Document findings
   - Clean up after

5. **Deep Dive on Codebase:**
   - Pick specific area to understand
   - Read related code
   - Trace execution flow
   - Draw diagrams or take notes
   - Document architecture insights

## Learning Modes

### Tutorial Mode
- Step-by-step following a tutorial
- Typing out examples
- Understanding each step
- Experimenting with variations

### Documentation Mode
- Reading official docs
- Understanding API surface
- Learning best practices
- Noting common patterns

### Experimental Mode
- Trying things out
- Breaking things to learn
- Comparing approaches
- Testing hypotheses

### Archaeological Mode
- Reading existing code
- Understanding why it works
- Tracing dependencies
- Building mental model

## Token Budget Target
~8-12K tokens for startup
- Skip most project context
- Load only learning-relevant files
- Fetch documentation on-demand
- Focus on the learning topic

## Notes Template
Use `~/.claude/templates/session-notes/learning.md` for session notes structure.

## Success Metrics

Good learning session outcomes:
- ✅ Clear understanding of the topic
- ✅ Hands-on experience with concepts
- ✅ Documented key insights and gotchas
- ✅ Working examples or experiments
- ✅ Know when/why to use the learned concept
- ✅ Can explain it to others
- ✅ Confidence to apply in real projects

## Tips for Effective Learning

1. **Start with Why** - Understand the problem being solved
2. **Hands-on First** - Try it before reading all the docs
3. **Break Things** - Learn from failures and errors
4. **Take Notes** - Document insights as you go
5. **Ask Questions** - Clarify confusing parts immediately
6. **Build Something** - Apply learning to a small project
7. **Teach Back** - Explain concepts to solidify understanding

## Follow-up Actions

After a learning session, consider:
- Moving insights to project documentation
- Creating templates for future use
- Adding to `.claude/IDEAS.md` for future exploration
- Applying learning to actual project work
- Sharing knowledge with team

---

**Ready to learn!** 📚

## Calendar Display
Show today's calendar in summary using the "Display Today's Calendar" recipe.
Include "📅 Today's Schedule:" line in summary format.
