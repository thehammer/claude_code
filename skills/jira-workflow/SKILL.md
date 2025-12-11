---
name: jira-workflow
description: Create and manage Jira tickets with Carefeed conventions. Auto-infers project (CORE, INT, PAYM, APP), type (Bug, Task, Story), and priority from description. Use when user mentions creating tickets, filing bugs, or tracking work.
---

# Jira Workflow Skill

This skill handles Jira ticket creation and management using Carefeed team conventions. It automatically infers the appropriate project, issue type, and priority from natural language descriptions.

## When to Use This Skill

Automatically trigger this skill when the user:

- Wants to **create a ticket**: "Create a ticket for...", "File a bug for...", "I need a Jira for..."
- Mentions **tracking work**: "Track this work", "Add to Jira", "Create an issue"
- Describes a **bug or feature**: "There's a bug in...", "We need to add..."
- Asks about **Jira projects**: "Which project should this go in?"

## Carefeed Project Structure

| Project | Domain | Keywords |
|---------|--------|----------|
| **CORE** | Core platform features | Default for unspecified |
| **INT** | Integrations | pcc, yardi, collain, matrixcare, integration, sync, import, export |
| **PAYM** | Payments | payment, billing, invoice, stripe, charge, refund |
| **APP** | Chat/Mobile app | chat, mobile, app, stream |
| **PORTAL** | Portal-specific | portal |

## Issue Type Inference

| Keywords | Inferred Type |
|----------|---------------|
| bug, fix, error, broken, issue, problem, crash | **Bug** |
| refactor, cleanup, upgrade, migrate, update, improve | **Task** |
| (default) | **Story** |

## Priority Inference

| Keywords | Inferred Priority |
|----------|-------------------|
| critical, urgent, production down, outage, security, data loss | **P0** |
| high priority, blocker, blocking, asap | **P1** |
| (default) | **P2** |
| low priority, nice to have, someday, cleanup, refactor | **P3** |

## Creating a CORE Ticket

The CORE project requires specific custom fields:

```json
{
  "customfield_10275": [{"value": "Production "}],
  "customfield_10135": {"value": "ALL"}
}
```

**Important notes:**
- `"Production "` has a **trailing space** (required!)
- Environment is an **array** of objects
- Component is a **single object**

### Issue Type IDs for CORE

| Type | ID |
|------|-----|
| Task | 10015 |
| Story | 10007 |
| Bug | 10017 |
| Sub-task | 10016 |
| Epic | 10000 |

## Workflow

### Step 1: Analyze Description

Parse the user's description to infer:
- Project (based on domain keywords)
- Issue type (based on action keywords)
- Priority (based on urgency keywords)

### Step 2: Confirm with User

Always confirm inferences before creating:

```
Based on your description, I'll create:
  - Project: INT (integration-related)
  - Type: Bug (fixing a bug)
  - Priority: P1 (urgent)
  - Summary: Fix Yardi integration timeout bug

Does this look correct?
```

### Step 3: Get Project Metadata

Use MCP to get valid issue types and required fields:

```
mcp__jira__jira_get_create_meta({ projectKeyOrId: "CORE" })
```

### Step 4: Create the Ticket

```
mcp__jira__jira_create_issue({
  projectKeyOrId: "CORE",
  issueTypeId: "10015",
  summary: "Your ticket summary",
  description: "Detailed description with markdown support",
  priority: "P2",
  customFields: {
    "customfield_10275": [{"value": "Production "}],
    "customfield_10135": {"value": "ALL"}
  }
})
```

### Step 5: Offer Next Steps

After creation, suggest:
1. Create a branch: `feature/CORE-1234-short-description`
2. Transition the ticket to "In Progress"
3. Start working on the fix

## Complete Workflow Example

**User:** "Create a ticket for fixing the Yardi integration timeout bug - it's urgent"

**Claude:**
```
I'll create a Jira ticket. Based on your description:
  - Project: INT (integration-related)
  - Type: Bug (fixing a bug)
  - Priority: P1 (urgent)
  - Summary: Fix Yardi integration timeout bug

Does this look correct?
```

**User:** "Yes"

**Claude:** [Creates ticket using MCP]
```
Created INT-1234: Fix Yardi integration timeout bug
https://carefeed.atlassian.net/browse/INT-1234

Would you like me to:
1. Create a branch: bugfix/INT-1234-yardi-timeout
2. Transition the ticket to 'In Progress'
3. Start working on the fix
```

## Error Handling

### Can't infer project
Ask user which project, showing the list of valid projects.

### Invalid priority
Map to P2 (default) and notify user.

### Required field missing
Prompt for the missing field value.

### Permission denied
User may not have create permission in that project.

## Helper Functions

Load Carefeed conventions:
```bash
source ~/.claude/lib/conventions/carefeed.sh
```

Available functions:
- `infer_jira_project "$description"` - Returns project key
- `infer_jira_type "$description"` - Returns Bug/Task/Story
- `infer_jira_priority "$description"` - Returns P0-P3

## Integration with Git Workflow

After ticket creation, commonly followed by:

1. **Generate branch name:** `{type}/{JIRA-KEY}-{short-description}`
2. **Create branch:** `git checkout -b <branch-name>`
3. **Transition ticket:** Move to "In Progress"
4. **Commit format:** `{type}(scope): JIRA-KEY: message`

## Anti-Patterns

- **Don't** create tickets without confirming inferences
- **Don't** guess custom field values - use the documented formats
- **Don't** skip the project metadata check for unknown projects
