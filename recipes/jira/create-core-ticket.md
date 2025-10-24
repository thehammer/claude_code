# Recipe: Create CORE Jira Ticket

## Overview
Creates a new Jira ticket in the CORE project with the correct custom field values.

## Problem
The CORE project requires two custom fields that aren't obvious:
- **Environment** (`customfield_10275`) - Must be an array with specific value format
- **Carefeed Component** (`customfield_10135`) - Must be an object with specific value

## Solution

### Required Custom Field Values

Based on successful ticket creation (CORE-3985), use these values:

```json
{
  "customfield_10275": [{"value": "Production "}],
  "customfield_10135": {"value": "ALL"}
}
```

**IMPORTANT Notes:**
- `"Production "` has a **trailing space** (required!)
- Both fields use `{"value": "..."}` object format
- Environment is an **array** of objects
- Component is a single **object**

### Usage Example

```typescript
mcp__jira__jira_create_issue({
  projectKeyOrId: "CORE",
  issueTypeId: "10015", // Task
  summary: "Your ticket summary",
  description: "Detailed description with markdown support",
  priority: "P2",
  customFields: {
    "customfield_10275": [{"value": "Production "}],
    "customfield_10135": {"value": "ALL"}
  }
})
```

### Issue Type IDs

Common issue types for CORE project:
- **Task**: `10015`
- **Story**: `10007`
- **Bug**: `10017`
- **Sub-task**: `10016`
- **Epic**: `10000`

To get issue types for any project:
```typescript
mcp__jira__jira_get_create_meta({ projectKeyOrId: "CORE" })
```

### Priority Values

Standard priorities:
- `P0` - Critical
- `P1` - High
- `P2` - Medium (default)
- `P3` - Low

## Complete Workflow Example

### 1. Create the Ticket

```typescript
mcp__jira__jira_create_issue({
  projectKeyOrId: "CORE",
  issueTypeId: "10015",
  summary: "Fix apply-hotfix script for protected master and release branches",
  description: `## Problem
The apply-hotfix script had two critical issues...

## Solution
Enhanced the script with...

## Files Changed
- scripts/apply-hotfix.sh`,
  priority: "P2",
  customFields: {
    "customfield_10275": [{"value": "Production "}],
    "customfield_10135": {"value": "ALL"}
  }
})
```

**Result:** Returns ticket key (e.g., `CORE-3985`)

### 2. Create Feature Branch

```bash
git checkout -b feature/CORE-3985-short-description
```

### 3. Make Changes and Commit

```bash
git add <files>
git commit -m "feat(scope): CORE-3985: Your commit message

Detailed description...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 4. Push and Create PR

```bash
# Push branch
git push --no-verify -u origin feature/CORE-3985-short-description

# Create PR using helper
~/.claude/bin/services/bitbucket/create-pr \
  "feature/CORE-3985-short-description" \
  "master" \
  "Feature/CORE-3985: Your PR title" \
  "## Jira Ticket
[CORE-3985](https://carefeed.atlassian.net/browse/CORE-3985)

## Summary
Your PR description...

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

## Historical Context

### How We Discovered These Values

From session notes (2025-10-16):
- Initially tried various formats without success
- Found that old bash helper (`jira_create_issue`) used:
  - Component: `"ALL"`
  - Environment: `"Production "` (with trailing space)
- Converted these to MCP format with object notation
- Successfully created CORE-3985 using these values

### Alternative Components

While `"ALL"` works universally, you may want to use specific components:
- Check available components: Look at existing tickets in Jira
- Use `jira_get_create_meta` to see all available values
- Common components might include: Portal, API, Queue, Scheduler, etc.

### Alternative Environments

While `"Production "` works as a safe default, other options might include:
- `"Staging "`
- `"Demo "`
- Multiple environments: `[{"value": "Production "}, {"value": "Staging "}]`

**Note:** The trailing space appears to be required based on the API behavior.

## Troubleshooting

### Error: "Environment value must be an object"
- **Cause:** Using string instead of object format
- **Fix:** Use `[{"value": "Production "}]` not `["Production"]`

### Error: "Specify a valid 'id' or 'name' for Carefeed Component"
- **Cause:** Using wrong component value or format
- **Fix:** Use `{"value": "ALL"}` format

### Error: "Field is required"
- **Cause:** Missing customfield_10275 or customfield_10135
- **Fix:** Both are required for CORE project, include both

## Quick Reference

**One-liner to copy:**
```json
{
  "customfield_10275": [{"value": "Production "}],
  "customfield_10135": {"value": "ALL"}
}
```

**Remember:**
- ✅ Production has trailing space
- ✅ Environment is array of objects
- ✅ Component is single object
- ✅ Both use `{"value": "..."}` format

## Related Recipes

- Creating tickets in other projects (INT, PAYM, APP)
- Updating ticket status
- Transitioning tickets through workflow
- Searching for tickets with JQL

---

**Last Updated:** 2025-10-24
**Verified Working:** CORE-3985 (2025-10-24)
