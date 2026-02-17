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
| **RM** | Referral Management | referral, rm, intake, assessment, llm, document |

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

### Issue Type IDs for RM

| Type | ID |
|------|-----|
| Task | 10167 |
| Story | 10170 |
| Bug | 10171 |
| Subtask | 10169 |
| Epic | 10168 |
| Design | 10172 |

## Assignee Handling

**Always set an assignee** when creating tickets. Follow this logic:

1. **If user specifies assignee**: Use the specified person
2. **If work is starting immediately**: Assign to the current user (Hammer)
3. **If creating for someone else**: Ask who should own it
4. **If unclear**: Default to current user and confirm

Use the `assignee` field in `jira_create_issue`:
```json
{
  "assignee": "user@example.com"
}
```

## Parent Epic Linking

**Always link tickets to their parent Epic** when applicable. This is critical for PM organization.

### Finding the Parent Epic

1. **Check context**: Is the user working on a known initiative?
2. **Ask explicitly**: "Which Epic should this be under?"
3. **List recent Epics**: Query open Epics in the project to offer options

### Setting the Parent

Use the `parent` field with the Epic's key:
```json
{
  "parent": "RM-74"
}
```

### Common Epics by Project

When working in a project, cache the active Epics for quick reference:
```
mcp__jira__jira_ls_issues({
  projectKeyOrId: "RM",
  jql: "type = Epic AND status != Done"
})
```

## Auto-Transition to In Progress

When creating a ticket for work that's **starting immediately**:

1. Create the ticket
2. Automatically transition to "In Progress"
3. Inform the user of both actions

```
mcp__jira__jira_transition_issue({
  issueIdOrKey: "RM-123",
  transitionId: "In Progress"
})
```

**When to auto-transition:**
- User says "I'm working on...", "Starting...", "Let me create a ticket for what I'm doing"
- Creating a ticket mid-implementation
- User explicitly requests it

**When NOT to auto-transition:**
- Creating tickets for future work
- Creating tickets for someone else
- Backlog grooming / planning

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
  - Type: Bug
  - Priority: P1 (urgent)
  - Summary: Fix Yardi integration timeout bug
  - Assignee: Hammer
  - Parent Epic: INT-100 (Yardi Integration Improvements)
  - Status: Will transition to "In Progress"

Does this look correct?
```

**Note:** Always show assignee and parent Epic in the confirmation. If parent Epic is unknown, ask which Epic it belongs to before creating.

### Step 3: Get Project Metadata

Use MCP to get valid issue types and required fields:

```
mcp__jira__jira_get_create_meta({ projectKeyOrId: "CORE" })
```

### Step 4: Create the Ticket

**For CORE project** (with custom fields):
```
mcp__jira__jira_create_issue({
  projectKeyOrId: "CORE",
  issueTypeId: "10015",
  summary: "Your ticket summary",
  description: "Detailed description with markdown support",
  priority: "P2",
  assignee: "hammer@carefeed.com",
  customFields: {
    "customfield_10275": [{"value": "Production "}],
    "customfield_10135": {"value": "ALL"},
    "parent": {"key": "CORE-500"}
  }
})
```

**For RM project** (simpler structure):
```
mcp__jira__jira_create_issue({
  projectKeyOrId: "RM",
  issueTypeId: "10167",
  summary: "Your ticket summary",
  description: "Detailed description",
  priority: "P2",
  assignee: "hammer@carefeed.com",
  customFields: {
    "parent": {"key": "RM-74"}
  }
})
```

### Step 5: Auto-Transition (if applicable)

If work is starting immediately, transition to "In Progress":
```
mcp__jira__jira_transition_issue({
  issueIdOrKey: "RM-123",
  transitionId: "In Progress"
})
```

### Step 6: Offer Next Steps

After creation, suggest:
1. Create a branch: `feature/CORE-1234-short-description`
2. Start working on the fix

(Skip transition suggestion if already transitioned)

## Complete Workflow Example

**User:** "Create a ticket for fixing the Yardi integration timeout bug - it's urgent"

**Claude:**
```
I'll create a Jira ticket. Based on your description:
  - Project: INT (integration-related)
  - Type: Bug
  - Priority: P1 (urgent)
  - Summary: Fix Yardi integration timeout bug
  - Assignee: Hammer

Which Epic should this be under? Here are the active INT Epics:
  1. INT-100: Yardi Integration Improvements
  2. INT-85: PCC Sync Reliability
  3. INT-92: Integration Monitoring
```

**User:** "INT-100"

**Claude:**
```
Creating ticket:
  - Project: INT
  - Type: Bug
  - Priority: P1
  - Summary: Fix Yardi integration timeout bug
  - Assignee: Hammer
  - Parent Epic: INT-100

Are you starting this work now? (I'll transition to "In Progress")
```

**User:** "Yes"

**Claude:** [Creates ticket, then transitions to In Progress]
```
Created INT-1234: Fix Yardi integration timeout bug
  → Assigned to Hammer
  → Linked to Epic INT-100
  → Status: In Progress

https://carefeed.atlassian.net/browse/INT-1234

Would you like me to create a branch? bugfix/INT-1234-yardi-timeout
```

## Error Handling

### Can't infer project
Ask user which project, showing the list of valid projects.

### Can't determine parent Epic
Query open Epics in the project and ask user to select one. Don't create tickets without a parent Epic unless explicitly told to skip it.

### Invalid priority
Map to P2 (default) and notify user.

### Required field missing
Prompt for the missing field value.

### Permission denied
User may not have create permission in that project.

### Transition fails
Some workflows have guards. If "In Progress" fails, check available transitions with `jira_get_transitions` and report the options.

## Helper Functions

Load Carefeed conventions (from layer):
```bash
source ~/.claude/lib/core/layers.sh
layer_source "lib/conventions/carefeed.sh"
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
- **Don't** create tickets without an assignee - always set one
- **Don't** create tickets without a parent Epic - always ask if not obvious
- **Don't** leave tickets in "To Do" if work is starting - transition to "In Progress"
