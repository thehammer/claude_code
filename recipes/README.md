# Claude Code Recipes

## What are Recipes?

**Recipes** are human-readable reference documents that describe how to accomplish tasks. They provide context-aware instructions that Claude can adapt to changing circumstances.

## Current Status

Recipes were an early architecture for documenting procedures. Most task-oriented recipes have been superseded by **agents** (in `agents/`) which inline their procedures and are auto-discoverable. The remaining recipes serve as **reference documentation** for workflows that don't map cleanly to a single agent or command.

## When to Use What

| Mechanism | Purpose | Auto-discoverable? |
|-----------|---------|-------------------|
| **Agents** (`agents/`) | Autonomous task execution with inlined procedures | Yes |
| **Commands** (`commands/`) | User-invocable slash commands | Yes |
| **Skills** (`skills/`) | Claude Code features with SKILL.md frontmatter | Yes |
| **Recipes** (`recipes/`) | Reference documentation for complex workflows | No (read on demand) |

## Remaining Recipes

### Permissions
- [Sync Down: Global to Project](permissions/sync-down-global-to-project.md) - Permission cascade merging at session boundaries
- [Sync Up: Project to Global](permissions/sync-up-project-to-global.md) - Reverse sync of project permissions to global

### Slack
- [Setup User Token](slack/setup-user-token.md) - One-time Slack OAuth token setup guide

### Tmux
- [New Claude Tab](tmux/new-claude-tab.md) - Documents the `ct` shell function
- [Start Coding Session](tmux/start-coding-session.md) - Documents `tmux_create_coding_layout`

## Recipe Structure

Every recipe follows this template (see [TEMPLATE.md](TEMPLATE.md)):

```markdown
# Recipe: [Name]

**Category:** [category]
**Complexity:** [simple|moderate|complex]
**Last Updated:** YYYY-MM-DD

## Goal
## Prerequisites
## Inputs
## Steps
## Command Patterns
## Expected Output
## Error Handling
## Related Recipes
## Notes
## Examples
```

## Creating New Recipes

Before creating a new recipe, consider whether an **agent** or **command** would be more appropriate. Recipes are best for:
- Complex reference workflows that span multiple tools
- Setup/onboarding guides
- Procedures executed at session boundaries (not user-invoked)

For task-oriented procedures, prefer creating an agent in `agents/` which will be auto-discoverable.

---

**Last Updated:** 2026-02-19
