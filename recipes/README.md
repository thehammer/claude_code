# Claude Code Recipes

## What are Recipes?

**Recipes** are human-readable documents that describe how to accomplish tasks using whatever tools or services are required. Unlike scripts (which hard-code specific commands), recipes provide flexible, context-aware instructions that Claude can adapt to changing circumstances.

## Why Recipes?

### Problems with Scripts Alone
- **Brittle**: Hard-coded logic breaks when APIs change
- **Proliferation**: 100+ helper functions doing similar things differently
- **Hidden context**: Can't see WHY something is done a certain way
- **Maintenance burden**: Each script needs updating when tools evolve
- **Black boxes**: Hard to debug or understand intent

### Recipe Advantages
- **Human-readable documentation**: Clear intent and context
- **Flexible execution**: Claude adapts to current circumstances
- **Self-updating**: When APIs change, Claude figures out the new way using the recipe's goal
- **Composable**: Recipes can reference other recipes
- **Debuggable**: When something fails, the recipe explains WHY
- **Teachable**: Great for onboarding team members
- **Self-documenting**: The recipe IS the documentation

## When to Use What

### Use Recipes For:
- ✅ Complex workflows requiring multiple steps
- ✅ API interactions (especially evolving APIs)
- ✅ Cross-tool orchestration
- ✅ Team conventions and standards
- ✅ Anything that needs explanation or context
- ✅ Tasks that vary based on circumstances

### Use Scripts For:
- ✅ Simple, stable CLI wrappers (aws, op, git basics)
- ✅ Performance-critical paths (executed hundreds of times)
- ✅ Complex parsing or computation
- ✅ When speed matters more than flexibility

### Use Both:
- ✅ Recipe documents the workflow and goal
- ✅ Script implements the optimized fast path
- ✅ Recipe references the script but explains WHY and WHEN

## Recipe Structure

Every recipe follows this template (see [TEMPLATE.md](TEMPLATE.md)):

```markdown
# Recipe: [Name]

**Category:** [category]
**Complexity:** [simple|moderate|complex]
**Last Updated:** YYYY-MM-DD

## Goal
What this recipe accomplishes (one sentence)

## Prerequisites
What needs to be in place

## Inputs
Required and optional parameters

## Steps
Detailed how-to instructions

## Command Patterns
Actual commands with examples

## Expected Output
What success looks like

## Error Handling
Common failures and solutions

## Related Recipes
Dependencies and relationships

## Notes
Additional context and conventions

## Examples
Real-world usage scenarios
```

## Recipe Categories

Recipes are organized by domain:

```
~/.claude/recipes/
├── calendar/          # M365 calendar operations
├── jira/              # Jira ticket management
├── git/               # Git workflows and PR creation
├── deployments/       # Production deployment procedures
├── workflows/         # Cross-tool orchestration
├── bitbucket/         # Bitbucket PR and pipeline operations
└── [more as needed]
```

## Recipe Relationships

Recipes can reference each other, creating composable workflows:

```
Display Today's Calendar (user-facing)
  └─ uses ─> Fetch Today's Calendar Events (data fetching)
                └─ uses ─> M365 API Authentication (prerequisite)

Create Jira Ticket with Carefeed Conventions (high-level)
  ├─ uses ─> Infer Jira Project from Description (convention)
  ├─ uses ─> Infer Priority Level (convention)
  └─ uses ─> Create Jira Ticket (API call)
```

## How Claude Uses Recipes

When you ask Claude to accomplish a task:

1. **Claude searches for relevant recipes** in `~/.claude/recipes/`
2. **Reads the recipe** to understand the goal and approach
3. **Adapts the recipe** to your specific circumstances
4. **Executes the steps** using available tools (MCP, CLI, APIs)
5. **Handles errors** using the recipe's guidance
6. **Explains what happened** using the recipe's context

Example flow:
```
User: "Show me my calendar for today"
  ↓
Claude finds: recipes/calendar/display-today-calendar.md
  ↓
Recipe says: Use "Fetch Today's Calendar Events" recipe first
  ↓
Claude finds: recipes/calendar/fetch-today-events.md
  ↓
Recipe says: Call Graph API with these parameters
  ↓
Claude executes: m365 request --url "..." --method get
  ↓
Recipe says: Convert UTC times to Central Time
  ↓
Claude formats: Pretty markdown output
  ↓
User sees: "You have 4 meetings today: 9:45 AM - Payments Stand up..."
```

## Integration with Other Systems

### With MCP Servers
- **MCP provides**: Direct tool access (Jira API, Bitbucket API, etc.)
- **Recipes provide**: Workflow orchestration (how to combine tools)
- **Together**: Powerful, flexible automation with clear documentation

### With Helper Functions
- **Scripts provide**: Fast, stable implementations
- **Recipes provide**: Context, alternatives, and fallbacks
- **Together**: Performance + flexibility + maintainability

### With Session Types
- **Coding sessions**: May load all recipes for full workflow support
- **Debugging sessions**: Focus on diagnostic and investigation recipes
- **Clauding sessions**: Recipes for improving Claude Code itself

## Creating New Recipes

### Step 1: Identify the Need
Ask yourself:
- Is this task done repeatedly?
- Does it involve multiple steps or tools?
- Would context/explanation help?
- Could the approach change over time?

If yes to 2+ questions → Create a recipe!

### Step 2: Choose Category
Where does this fit?
- Existing category (calendar, jira, git, etc.)
- New category (create directory)

### Step 3: Use Template
Copy [TEMPLATE.md](TEMPLATE.md) and fill in:
- Clear goal statement
- Prerequisites and inputs
- Step-by-step instructions
- Command examples
- Error handling guidance

### Step 4: Test It
Have Claude read the recipe and execute it:
- Does it work?
- Is anything unclear?
- Are examples helpful?
- Does error handling cover real cases?

### Step 5: Iterate
Recipes are living documents:
- Update when APIs change
- Add examples from real usage
- Refine based on failures
- Link to related recipes

## Best Practices

### Writing Recipes

✅ **DO:**
- Write for humans first (Claude is a human-level reader)
- Include the WHY, not just the WHAT
- Provide real examples
- Document error cases you've actually encountered
- Link to related recipes
- Keep it updated

❌ **DON'T:**
- Make it too rigid (not just a script in markdown)
- Skip the context/explanation
- Assume tools won't change
- Forget about error handling
- Write it once and never update

### Using Recipes

✅ **DO:**
- Read the whole recipe before executing
- Adapt to your specific circumstances
- Follow the error handling guidance
- Update the recipe if you find issues
- Create new recipes for common patterns

❌ **DON'T:**
- Blindly copy-paste commands
- Skip the prerequisites check
- Ignore the notes section
- Use outdated recipes without checking

## Recipe Examples

Here are some recipes currently available:

### Calendar
- [Fetch Today's Calendar Events](calendar/fetch-today-events.md) - Get raw event data from M365
- [Display Today's Calendar](calendar/display-today-calendar.md) - Format and show user's schedule

### Jira (Coming Soon)
- Create Ticket with Carefeed Conventions
- Transition Ticket to Done
- Link PR to Jira Ticket

### Git (Coming Soon)
- Create PR with Carefeed Template
- Cleanup Merged Branches
- Cherry-pick to Release Branch

### Deployments (Coming Soon)
- Deploy to Production
- Apply Hotfix
- Rollback Deployment

## Migration from Scripts

We're not deleting existing scripts! Instead:

1. **Document existing workflows as recipes**
   - Scripts stay for performance
   - Recipes explain when/why to use them

2. **Identify brittle/complex scripts**
   - Convert to recipes for flexibility
   - Keep scripts as fallback if needed

3. **New workflows**
   - Start with recipe
   - Add script only if performance matters

## Contributing

To add or improve recipes:

1. Use the template: [TEMPLATE.md](TEMPLATE.md)
2. Put in appropriate category directory
3. Link from related recipes
4. Test with Claude before committing
5. Update this README if adding new category

## Questions?

Recipes are new! If you have questions or suggestions:
- Try creating one and see how it works
- Iterate based on what you learn
- Update this README with insights

---

**Version History:**
- 2025-10-24: Initial concept and documentation
