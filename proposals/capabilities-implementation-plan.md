# Capabilities System Implementation Plan

**Related Proposal:** `~/.claude/proposals/capabilities-system.md`
**Target:** Weekend implementation session
**Estimated Effort:** 4-6 hours across 2-3 sessions

## Overview

This plan breaks the capabilities system implementation into discrete, testable phases. Each phase produces working functionality that can be tested before moving on.

---

## Phase 1: Foundation (1 hour)

### Goal
Create capability definition files and directory structure.

### Tasks

#### 1.1 Create Directory Structure
```bash
mkdir -p ~/.claude/capabilities
mkdir -p ~/.claude/lib/capabilities
```

#### 1.2 Define Core Capabilities

Create 6 YAML files:

**`~/.claude/capabilities/source-control.yaml`**
```yaml
capability_id: source-control
name: Source Control
description: Git operations, pull requests, branches, code review
providers:
  - bitbucket
  - github
operations:
  - id: create-pr
    name: Create Pull Request
    description: Create a PR from current branch with Jira-linked description
    type: skill
    ref: bitbucket-workflow

  - id: list-prs
    name: List Pull Requests
    description: Show open PRs across all repositories
    type: command
    ref: /prs

  - id: get-pr
    name: Get PR Details
    description: Fetch PR details including diff and comments
    type: mcp
    ref: mcp__bitbucket__bb_get_pr

  - id: diff-branches
    name: Compare Branches
    description: Show changes between two branches
    type: mcp
    ref: mcp__bitbucket__bb_diff_branches

  - id: create-branch
    name: Create Branch
    description: Create a new branch from source
    type: mcp
    ref: mcp__bitbucket__bb_add_branch

context:
  - name: git_branch
    command: git branch --show-current
  - name: git_status
    command: git diff-index --quiet HEAD -- && echo "clean" || echo "uncommitted"
```

**`~/.claude/capabilities/project-management.yaml`**
```yaml
capability_id: project-management
name: Project Management
description: Issue tracking, sprint planning, task management via Jira
providers:
  - jira
operations:
  - id: create-ticket
    name: Create Ticket
    description: Create Jira issue with auto-detected project and type
    type: skill
    ref: jira-workflow

  - id: search-issues
    name: Search Issues
    description: Find issues by JQL, project, or assignee
    type: mcp
    ref: mcp__jira__jira_ls_issues

  - id: get-issue
    name: Get Issue Details
    description: Fetch full issue details including comments
    type: mcp
    ref: mcp__jira__jira_get_issue

  - id: transition-issue
    name: Transition Issue
    description: Move issue through workflow states
    type: mcp
    ref: mcp__jira__jira_transition_issue

  - id: add-comment
    name: Add Comment
    description: Add comment to an issue
    type: mcp
    ref: mcp__jira__jira_add_comment

context:
  - name: current_ticket
    description: Inferred from branch name (e.g., feature/CORE-123)
```

**`~/.claude/capabilities/observability.yaml`**
```yaml
capability_id: observability
name: Observability & Debugging
description: Application logs, error tracking, monitoring
providers:
  - datadog
  - sentry
operations:
  - id: search-logs
    name: Search Logs
    description: Query Datadog logs with filters
    type: script
    ref: ~/.claude/bin/services/datadog/search-logs

  - id: list-monitors
    name: List Monitors
    description: Show Datadog monitor states
    type: script
    ref: ~/.claude/bin/services/datadog/list-monitors

  - id: search-errors
    name: Search Errors
    description: Find Sentry issues by query
    type: script
    ref: ~/.claude/bin/services/sentry/list-issues

  - id: get-error
    name: Get Error Details
    description: Fetch full Sentry issue with stack trace
    type: script
    ref: ~/.claude/bin/services/sentry/get-issue

context:
  - name: recent_errors
    description: Count of unresolved errors in last 24h
```

**`~/.claude/capabilities/calendar.yaml`**
```yaml
capability_id: calendar
name: Calendar & Scheduling
description: View schedule, meeting awareness, time management
providers:
  - microsoft-graph
operations:
  - id: show-today
    name: Show Today's Calendar
    description: Display today's meetings
    type: command
    ref: /calendar

  - id: show-date
    name: Show Date Calendar
    description: Display calendar for specific date
    type: function
    ref: display_calendar

  - id: check-availability
    name: Check Availability
    description: Find free time slots
    type: function
    ref: get_calendar_for_date

context:
  - name: meeting_count
    description: Number of meetings today
  - name: next_meeting
    description: Time until next meeting
```

**`~/.claude/capabilities/documentation.yaml`**
```yaml
capability_id: documentation
name: Documentation
description: Confluence pages, knowledge base, team docs
providers:
  - confluence
operations:
  - id: search-docs
    name: Search Documentation
    description: Find Confluence pages by query
    type: script
    ref: ~/.claude/bin/services/confluence/search

  - id: get-page
    name: Get Page
    description: Retrieve full page content
    type: script
    ref: ~/.claude/bin/services/confluence/get-page

context: []
```

**`~/.claude/capabilities/general.yaml`**
```yaml
capability_id: general
name: General Assistance
description: Web search, URL fetching, general help
providers:
  - claude
enabled_by_default: true
always_active: true
operations:
  - id: web-search
    name: Web Search
    description: Search the web for current information
    type: tool
    ref: WebSearch

  - id: web-fetch
    name: Fetch URL
    description: Retrieve and analyze web page content
    type: tool
    ref: WebFetch

  - id: respond
    name: Respond
    description: Answer questions and assist with tasks
    type: builtin

context: []
```

#### 1.3 Validation Script

Create `~/.claude/bin/validate-capabilities`:
```bash
#!/bin/bash
# Validate all capability YAML files
for file in ~/.claude/capabilities/*.yaml; do
  echo "Validating: $(basename $file)"
  # Check required fields exist
  yq e '.capability_id' "$file" > /dev/null || echo "  ERROR: missing capability_id"
  yq e '.name' "$file" > /dev/null || echo "  ERROR: missing name"
  yq e '.operations' "$file" > /dev/null || echo "  ERROR: missing operations"
done
echo "Done"
```

### Deliverables
- [ ] 6 capability YAML files created
- [ ] Validation script works
- [ ] All capabilities pass validation

### Test
```bash
~/.claude/bin/validate-capabilities
# Should show all capabilities valid
```

---

## Phase 2: Session Type Updates (1 hour)

### Goal
Add capability frontmatter to existing session type files.

### Tasks

#### 2.1 Update Session Type Format

Add YAML frontmatter to each session type. Example for coding:

```markdown
---
session_type: coding
purpose: Building features, fixing bugs, implementing functionality

capabilities:
  startup:
    - source-control
  on_demand:
    - project-management
    - calendar
    - observability

context:
  git: minimal
  calendar: count
  preferences: cascade

token_budget: 3000-5000
---

# Coding Session Startup

[existing content unchanged...]
```

#### 2.2 Update All Session Types

| File | Startup | On-Demand |
|------|---------|-----------|
| coding.md | source-control | project-management, calendar, observability |
| debugging.md | source-control, observability | project-management, calendar |
| planning.md | project-management | source-control, calendar, documentation |
| presenting.md | source-control | project-management, calendar, documentation |
| reviewing.md | source-control | project-management, observability |
| analysis.md | - | source-control, project-management, observability, documentation |
| learning.md | - | documentation, general |
| personal.md | source-control | calendar |
| clauding.md | - | source-control |
| launcher.md | - | - |

#### 2.3 Frontmatter Parser

Create `~/.claude/lib/capabilities/parse-frontmatter.sh`:
```bash
#!/bin/bash
# Extract frontmatter from session type file
# Usage: parse-frontmatter.sh <session-type-file> <field>

FILE="$1"
FIELD="$2"

# Extract YAML between --- markers
awk '/^---$/{p=!p;next}p' "$FILE" | yq e ".$FIELD" -
```

### Deliverables
- [ ] All 10 session types have frontmatter
- [ ] Frontmatter parser works
- [ ] Existing session behavior unchanged

### Test
```bash
# Should return "coding"
~/.claude/lib/capabilities/parse-frontmatter.sh ~/.claude/session-types/coding.md session_type

# Should return startup capabilities
~/.claude/lib/capabilities/parse-frontmatter.sh ~/.claude/session-types/coding.md capabilities.startup
```

---

## Phase 3: Capability Loader (1.5 hours)

### Goal
Build runtime capability loading system.

### Tasks

#### 3.1 Create Capability Loader

Create `~/.claude/lib/capabilities/loader.sh`:
```bash
#!/bin/bash
# Capability loader for Claude Code sessions
# Usage: source loader.sh && load_capabilities <session_type>

CAPABILITIES_DIR="${HOME}/.claude/capabilities"
SESSION_TYPES_DIR="${HOME}/.claude/session-types"

# Load a capability definition
load_capability_def() {
  local cap_id="$1"
  local cap_file="${CAPABILITIES_DIR}/${cap_id}.yaml"

  if [[ ! -f "$cap_file" ]]; then
    echo "Warning: Capability not found: $cap_id" >&2
    return 1
  fi

  cat "$cap_file"
}

# Get capability name
get_capability_name() {
  local cap_id="$1"
  yq e '.name' "${CAPABILITIES_DIR}/${cap_id}.yaml" 2>/dev/null
}

# Get capability operations summary
get_capability_ops() {
  local cap_id="$1"
  yq e '.operations[].name' "${CAPABILITIES_DIR}/${cap_id}.yaml" 2>/dev/null | tr '\n' ', ' | sed 's/, $//'
}

# Get session type capabilities
get_session_capabilities() {
  local session_type="$1"
  local cap_type="$2"  # startup or on_demand

  local session_file="${SESSION_TYPES_DIR}/${session_type}.md"
  if [[ ! -f "$session_file" ]]; then
    echo "Error: Session type not found: $session_type" >&2
    return 1
  fi

  # Extract frontmatter and parse
  awk '/^---$/{p=!p;next}p' "$session_file" | yq e ".capabilities.${cap_type}[]" - 2>/dev/null
}

# Build capabilities prompt section
build_capabilities_prompt() {
  local session_type="$1"

  echo "## Available Capabilities"
  echo ""

  # Startup (active)
  echo "### Active"
  local startup_caps=$(get_session_capabilities "$session_type" "startup")
  if [[ -n "$startup_caps" ]]; then
    while read -r cap; do
      local name=$(get_capability_name "$cap")
      local ops=$(get_capability_ops "$cap")
      echo "- **${name}**: ${ops}"
    done <<< "$startup_caps"
  else
    echo "- None (general assistance only)"
  fi

  echo ""
  echo "### Available On-Demand"
  local ondemand_caps=$(get_session_capabilities "$session_type" "on_demand")
  if [[ -n "$ondemand_caps" ]]; then
    while read -r cap; do
      local name=$(get_capability_name "$cap")
      echo "- ${name}"
    done <<< "$ondemand_caps"
  else
    echo "- None"
  fi
}

# Main loader function
load_capabilities() {
  local session_type="$1"
  build_capabilities_prompt "$session_type"
}
```

#### 3.2 Create Capabilities Summary Command

Create `~/.claude/commands/capabilities.md`:
```markdown
Show available capabilities for the current session.

## Instructions

1. Determine current session type from SESSION_MARKER or ask user
2. Read capability definitions from ~/.claude/capabilities/
3. Categorize as Active (startup) vs Available (on_demand)
4. For each capability, list key operations

## Output Format

**Active Capabilities:**
- [Name]: [key operations]

**Available On-Demand:**
- [Name]: Use by asking about [trigger examples]

## Example

**Active Capabilities:**
- Source Control: Create PR, List PRs, Diff Branches

**Available On-Demand:**
- Project Management: Create tickets, search issues
- Calendar: View schedule, check availability
- Observability: Search logs, view errors
```

### Deliverables
- [ ] Loader script created and tested
- [ ] `/capabilities` command created
- [ ] Can generate capabilities prompt for any session type

### Test
```bash
source ~/.claude/lib/capabilities/loader.sh
load_capabilities coding
# Should output formatted capability list
```

---

## Phase 4: SESSION_START Integration (1 hour)

### Goal
Integrate capability loading into session startup flow.

### Tasks

#### 4.1 Update SESSION_START.md

Add capability loading step after session type resolution:

```markdown
## 1. Load Session Capabilities

After determining session type, load capabilities:

1. Read session type frontmatter for capability config
2. For startup capabilities:
   - Load capability context
   - Make tools/skills immediately available
3. Register on_demand capabilities as available
4. Generate capabilities prompt section

```bash
source ~/.claude/lib/capabilities/loader.sh
CAPABILITIES_PROMPT=$(load_capabilities "$SESSION_TYPE")
```

Include in startup summary:
```
$CAPABILITIES_PROMPT
```
```

#### 4.2 Update Summary Formats

Each session type summary should include:

```
**Active:** [startup capabilities]
**Available:** [on_demand capabilities]
```

Example for coding:
```
🔧 **Coding Session Started**

📍 Branch: feature/CORE-123 (clean)

**Active:** Source Control
**Available:** Project Management, Calendar, Observability

What would you like to work on?
```

#### 4.3 Test Integration

1. Start a coding session: `/start coding`
2. Verify capabilities appear in summary
3. Test `/capabilities` command
4. Verify on_demand capabilities work when invoked

### Deliverables
- [ ] SESSION_START.md updated with capability loading
- [ ] Session summaries show capabilities
- [ ] All session types work with new format

### Test
```bash
# Manual test: start each session type and verify capabilities shown
/start coding
/start debugging
/start planning
```

---

## Phase 5: On-Demand Activation (1 hour)

### Goal
Automatically activate on-demand capabilities when needed.

### Tasks

#### 5.1 Define Activation Triggers

Add triggers to capability operations:

```yaml
operations:
  - id: create-ticket
    name: Create Ticket
    triggers:
      - "create.*ticket"
      - "create.*issue"
      - "file.*bug"
      - "jira"
```

#### 5.2 Create Trigger Matcher

Add to loader.sh:
```bash
# Check if message matches any capability trigger
match_capability_trigger() {
  local message="$1"
  local session_type="$2"

  local ondemand=$(get_session_capabilities "$session_type" "on_demand")

  while read -r cap; do
    local triggers=$(yq e '.operations[].triggers[]' "${CAPABILITIES_DIR}/${cap}.yaml" 2>/dev/null)
    while read -r trigger; do
      if echo "$message" | grep -qiE "$trigger"; then
        echo "$cap"
        return 0
      fi
    done <<< "$triggers"
  done <<< "$ondemand"

  return 1
}
```

#### 5.3 Update session-context Skill

Modify `~/.claude/skills/session-context/` to:
1. Check for capability triggers in user messages
2. Auto-load capability context when triggered
3. Inform user: "Loading [capability] for this request..."

### Deliverables
- [ ] Triggers defined for key operations
- [ ] Trigger matcher function works
- [ ] session-context skill updated

### Test
```bash
# In a coding session (project-management is on_demand)
User: "Create a Jira ticket for this bug"
# Should auto-activate project-management capability
```

---

## Phase 6: Documentation & Polish (30 min)

### Goal
Document the system and clean up.

### Tasks

#### 6.1 Update INTEGRATIONS.md
- Document capability system
- Explain how to add new capabilities
- Reference capability files

#### 6.2 Create README
`~/.claude/capabilities/README.md`:
- Overview of capability system
- File format reference
- How to extend

#### 6.3 Update Session Type Docs
- Explain frontmatter format
- Document capability references

#### 6.4 Cleanup
- Remove any deprecated integration docs
- Ensure all paths are correct
- Test full flow end-to-end

### Deliverables
- [ ] INTEGRATIONS.md updated
- [ ] capabilities/README.md created
- [ ] All documentation consistent

---

## Testing Checklist

### Phase 1 Tests
- [ ] All 6 capability files created
- [ ] `validate-capabilities` passes

### Phase 2 Tests
- [ ] All 10 session types have frontmatter
- [ ] `parse-frontmatter.sh` works for all fields

### Phase 3 Tests
- [ ] `load_capabilities coding` produces output
- [ ] `/capabilities` command works

### Phase 4 Tests
- [ ] `/start coding` shows capabilities in summary
- [ ] All session types start correctly

### Phase 5 Tests
- [ ] Trigger matching works
- [ ] On-demand capabilities activate

### Phase 6 Tests
- [ ] Documentation is complete
- [ ] Full flow works end-to-end

---

## Rollback Plan

If issues arise:

1. **Phase 1-2**: Just delete new files, no impact on existing functionality
2. **Phase 3**: Remove loader.sh, capabilities still work manually
3. **Phase 4**: Revert SESSION_START.md changes
4. **Phase 5**: Disable trigger matching in session-context skill

The frontmatter approach is backward compatible - session types continue to work even if capability loading fails.

---

## Future Enhancements (Not in Scope)

- [ ] Capability health checks (is Jira accessible?)
- [ ] User capability preferences (disable globally)
- [ ] Capability dependencies (A requires B)
- [ ] Capability versioning
- [ ] Capability usage analytics
