# Recipe: Create Jira Ticket with Carefeed Conventions

**Category:** jira
**Complexity:** moderate
**Last Updated:** 2025-10-24

## Goal

Create a new Jira ticket using Carefeed's team conventions to automatically infer the project, issue type, and priority from the description.

This recipe combines MCP Jira tools with Carefeed-specific helper functions to streamline ticket creation while following team standards.

## Prerequisites

- Jira MCP server running and connected
- Carefeed helper functions loaded (`~/.claude/lib/conventions/carefeed.sh`)
- Understanding of Carefeed project structure:
  - **CORE**: Core platform features
  - **INT**: Integrations (PCC, Yardi, Collain, MatrixCare)
  - **PAYM**: Payments functionality
  - **APP**: Chat app/mobile app
  - **PORTAL**: Portal-specific items

## Inputs

- **Required:**
  - `description`: Brief description of the issue/task/feature
- **Optional:**
  - `project`: Override inferred project (CORE, INT, PAYM, APP, PORTAL)
  - `type`: Override inferred type (Bug, Task, Story)
  - `priority`: Override inferred priority (P0, P1, P2, P3)
  - `assignee`: Email of assignee (default: current user)
  - `summary`: Custom summary (default: derived from description)

## Steps

1. **Analyze the description**:
   - Look for keywords that indicate project (integration, payment, chat, etc.)
   - Look for keywords that indicate type (bug, fix, refactor, feature, etc.)
   - Look for keywords that indicate urgency (critical, urgent, low priority, etc.)

2. **Infer Jira metadata using Carefeed helpers**:
   - Use `infer_jira_project()` to determine which project
   - Use `infer_jira_type()` to determine Bug vs Task vs Story
   - Use `infer_jira_priority()` to determine P0-P3
   - Get user email with `get_jira_user_email()`

3. **Validate inferences**:
   - Show inferred values to user
   - Ask for confirmation or corrections
   - Allow override of any inferred value

4. **Get project metadata**:
   - Use `mcp__jira__jira_get_create_meta` to get valid issue types and fields
   - Map inferred type name to actual issue type ID
   - Check for required custom fields

5. **Create the ticket**:
   - Use `mcp__jira__jira_create_issue` with validated data
   - Return the ticket key and URL

6. **Display result**:
   - Show created ticket: "Created CORE-1234: [Summary]"
   - Provide clickable link to ticket
   - Suggest next actions (create branch, start work)

## Command Patterns

### Step 1: Infer Project
```bash
source ~/.claude/lib/conventions/carefeed.sh

description="Fix bug in PCC integration where patient data doesn't sync"

project=$(infer_jira_project "$description")
echo "Inferred project: $project"  # Output: INT
```

### Step 2: Infer Type and Priority
```bash
type=$(infer_jira_type "$description")
echo "Inferred type: $type"  # Output: Bug

priority=$(infer_jira_priority "$description")
echo "Inferred priority: $priority"  # Output: P2
```

### Step 3: Get Create Metadata
Use MCP tool to get valid issue types:
```
mcp__jira__jira_get_create_meta(projectKeyOrId: "INT")
```

Returns issue type IDs, required fields, and available values.

### Step 4: Create Issue
Use MCP tool with inferred values:
```
mcp__jira__jira_create_issue(
  projectKeyOrId: "INT",
  issueTypeId: "10001",  # From metadata
  summary: "Fix PCC integration patient data sync bug",
  description: "Fix bug in PCC integration where patient data doesn't sync",
  priority: "P2",
  assignee: "hammer.miller@carefeed.com"
)
```

## Inference Rules

### Project Inference (`infer_jira_project()`)

Keywords → Project:
- `pcc`, `yardi`, `collain`, `matrixcare`, `integration`, `sync`, `import`, `export` → **INT**
- `payment`, `billing`, `invoice`, `stripe`, `charge`, `refund` → **PAYM**
- `chat`, `mobile`, `app`, `stream` → **APP**
- Default: **CORE**

### Type Inference (`infer_jira_type()`)

Keywords → Type:
- `bug`, `fix`, `error`, `broken`, `issue`, `problem`, `crash` → **Bug**
- `refactor`, `cleanup`, `upgrade`, `migrate`, `update`, `improve` → **Task**
- Default: **Story**

### Priority Inference (`infer_jira_priority()`)

Keywords → Priority:
- `critical`, `urgent`, `production down`, `outage`, `security`, `data loss` → **P0**
- `high priority`, `blocker`, `blocking`, `asap` → **P1**
- `low priority`, `nice to have`, `someday`, `cleanup`, `refactor` → **P3**
- Default: **P2**

## Expected Output

### Interactive Flow
```
User: "Create a ticket for fixing the Yardi integration timeout bug - it's urgent"

Claude:
"I'll create a Jira ticket. Based on your description, I've inferred:
  • Project: INT (integration-related)
  • Type: Bug (fixing a bug)
  • Priority: P1 (urgent)
  • Summary: Fix Yardi integration timeout bug

Does this look correct?"

User: "Yes"

Claude: [Creates ticket]
"✅ Created INT-1234: Fix Yardi integration timeout bug
🔗 https://carefeed.atlassian.net/browse/INT-1234

Would you like me to:
1. Create a branch: bugfix/INT-1234-yardi-timeout
2. Transition the ticket to 'In Progress'
3. Start working on the fix"
```

### Successful Creation
```
✅ Created CORE-3960: Unify Docker build process
🔗 https://carefeed.atlassian.net/browse/CORE-3960

Project: CORE
Type: Task
Priority: P2
Assignee: hammer.miller@carefeed.com
```

## Error Handling

- **Can't infer project**: Ask user which project (show list of valid projects)
- **Invalid priority**: Map to P2 (default) and notify user
- **Issue type not found**: Try mapping type name variants (Bug → bug, Task → task)
- **Required field missing**: Prompt for the missing field value
- **Permission denied**: User may not have create permission in that project
- **MCP server not connected**: Fall back to showing raw `jira_create_issue` bash function

## Related Recipes

- **Uses:**
  - None (this is a leaf recipe using MCP + helpers)

- **Used by:**
  - Create Branch and Ticket (creates ticket, then creates git branch)
  - Quick Start Task (creates ticket and transitions to In Progress)

- **Related:**
  - Transition Ticket to Done
  - Link PR to Jira Ticket
  - Generate Branch Name from Ticket

## Notes

### Carefeed Conventions

These inference rules encode Carefeed's team conventions:
- Default to CORE unless clearly another domain
- P2 is the standard priority (P1 and P3 must be explicit)
- "Bug" for fixes, "Task" for chores/refactoring, "Story" for features
- Always assign to current user unless specified

### Inference Accuracy

Current accuracy (estimated):
- **Project**: ~85% (high confidence on INT/PAYM, lower on CORE/APP/PORTAL)
- **Type**: ~90% (clear keywords work well)
- **Priority**: ~70% (default P2 is usually right, but P0/P1 often implicit)

**Always confirm with user before creating** to catch inference errors.

### Custom Fields

Some Carefeed projects have custom fields:
- **Carefeed Component**: Select from dropdown (Family App, Onq Portal, Scheduler, etc.)
- **Environment**: Where the issue occurs (Production, Staging, Development)
- **Sprint**: Current sprint (usually auto-filled)

The recipe handles these by:
1. Getting metadata with `jira_get_create_meta`
2. Prompting user for required custom fields
3. Using sensible defaults when available

### Integration with Git Workflow

After ticket creation, commonly followed by:
1. **Generate branch name**: `carefeed_branch_name(type, jira_key, description)`
2. **Create branch**: `git checkout -b <branch-name>`
3. **Transition ticket**: Move to "In Progress" status
4. **Start work**: Begin implementation

Consider creating a "Quick Start Task" recipe that does all of this in one flow.

## Examples

### Example 1: Bug in integration
```
User: "Create ticket: PCC sync is failing with 500 error"

Inferred:
  • Project: INT (PCC keyword)
  • Type: Bug (failing/error keywords)
  • Priority: P2 (no urgency keywords)

Created: INT-1235: PCC sync failing with 500 error
```

### Example 2: Payment feature
```
User: "Create ticket: Add support for partial refunds in Stripe"

Inferred:
  • Project: PAYM (refunds + Stripe keywords)
  • Type: Story (no bug/refactor keywords)
  • Priority: P2 (default)

Created: PAYM-456: Add support for partial refunds in Stripe
```

### Example 3: Critical production bug
```
User: "Create ticket: Production data loss in resident export - CRITICAL"

Inferred:
  • Project: CORE (export is generic)
  • Type: Bug (data loss)
  • Priority: P0 (critical + data loss)

Created: CORE-3961: Production data loss in resident export
```

### Example 4: Override inference
```
User: "Create ticket: Refactor authentication logic"
Claude: "Inferred: CORE, Task, P2"
User: "Actually this should be P1, and assign to Steve"

Created: CORE-3962: Refactor authentication logic
Priority: P1 (overridden)
Assignee: steve.hatch@carefeed.com
```

---

**Version History:**
- 2025-10-24: Initial creation with Carefeed inference rules
