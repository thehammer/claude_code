# Proposal: Capabilities System for Claude Code

**Created:** 2025-12-11
**Status:** Draft - Ready for Implementation
**Inspired by:** Carebot's capability registry pattern (`~/Code/carebot/app/langgraph/capabilities.py`)

## Problem Statement

Currently, session types (`~/.claude/session-types/*.md`) manually specify which integrations to load, leading to:

1. **Duplication** - Multiple session types list the same integrations differently
2. **No formal discovery** - Can't easily answer "what can Claude do in this session?"
3. **Tight coupling** - Session types know about specific tools/scripts/MCP servers
4. **Inconsistent loading** - Some sessions pre-load, others lazy-load, no clear pattern
5. **Hard to extend** - Adding a new tool means updating multiple session type files

## Proposed Solution

Introduce a **Capabilities Layer** that sits between session types and tools:

```
Session Types → Capabilities → Tools/Skills/MCP Servers
```

### Core Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Capability** | A domain of functionality | `source-control`, `project-management` |
| **Operation** | A specific action within a capability | `create-pr`, `search-issues` |
| **Provider** | The underlying tool/MCP/skill | `bitbucket`, `jira`, `mcp__jira__*` |
| **Session Type** | A work context that uses capabilities | `coding`, `debugging`, `planning` |

### Architecture

```
~/.claude/
├── capabilities/           # NEW: Capability definitions
│   ├── source-control.yaml
│   ├── project-management.yaml
│   ├── observability.yaml
│   ├── calendar.yaml
│   ├── documentation.yaml
│   └── general.yaml
├── session-types/          # UPDATED: Reference capabilities
│   ├── coding.md           # capabilities: [source-control, ...]
│   ├── debugging.md
│   └── ...
├── skills/                 # EXISTING: Skills implement operations
│   ├── bitbucket-workflow/
│   ├── jira-workflow/
│   └── ...
└── lib/
    └── capabilities/       # NEW: Runtime capability loader
        └── loader.sh
```

## Capability Definitions

### Format (YAML with Markdown description)

```yaml
# ~/.claude/capabilities/source-control.yaml
capability_id: source-control
name: Source Control
description: |
  Git operations, pull requests, branches, code review.
  Supports both Bitbucket (primary) and GitHub repositories.

providers:
  primary: bitbucket      # MCP server
  fallback: github        # If configured

operations:
  - id: create-pr
    name: Create Pull Request
    description: Create a PR from current branch
    implementation:
      type: skill
      skill: bitbucket-workflow
    triggers:
      - "create pr"
      - "open pull request"
      - "submit for review"

  - id: list-prs
    name: List Pull Requests
    description: Show open PRs across repositories
    implementation:
      type: command
      command: /prs
    triggers:
      - "show prs"
      - "open pull requests"
      - "what prs are open"

  - id: get-pr
    name: Get PR Details
    description: Fetch full PR with diff and comments
    implementation:
      type: mcp
      tool: mcp__bitbucket__bb_get_pr

  - id: diff-branches
    name: Compare Branches
    description: Show diff between two branches
    implementation:
      type: mcp
      tool: mcp__bitbucket__bb_diff_branches

  - id: review-pr
    name: Review Pull Request
    description: Review code changes and provide feedback
    implementation:
      type: skill
      skill: bitbucket-workflow
    triggers:
      - "review pr"
      - "look at this pr"

# Context this capability provides when active
context_contribution:
  - git_branch: current branch name
  - git_status: clean/dirty indicator
  - open_pr_count: number of open PRs
```

### Defined Capabilities

#### 1. source-control
```yaml
capability_id: source-control
name: Source Control
providers: [bitbucket, github]
operations:
  - create-pr (skill: bitbucket-workflow)
  - list-prs (command: /prs)
  - get-pr (mcp: bb_get_pr)
  - diff-branches (mcp: bb_diff_branches)
  - review-pr (skill: bitbucket-workflow)
  - create-branch (mcp: bb_add_branch)
  - list-branches (mcp: bb_list_branches)
```

#### 2. project-management
```yaml
capability_id: project-management
name: Project Management
providers: [jira]
operations:
  - create-ticket (skill: jira-workflow)
  - search-issues (mcp: jira_ls_issues)
  - get-issue (mcp: jira_get_issue)
  - transition-issue (mcp: jira_transition_issue)
  - add-comment (mcp: jira_add_comment)
  - list-projects (mcp: jira_ls_projects)
```

#### 3. observability
```yaml
capability_id: observability
name: Observability & Debugging
providers: [datadog, sentry]
operations:
  - search-logs (script: datadog/search-logs)
  - list-monitors (script: datadog/list-monitors)
  - search-errors (script: sentry/list-issues)
  - get-error (script: sentry/get-issue)
```

#### 4. calendar
```yaml
capability_id: calendar
name: Calendar & Scheduling
providers: [microsoft-graph]
operations:
  - show-today (command: /calendar)
  - show-week (function: display_calendar)
  - check-availability (function: get_calendar_for_date)
```

#### 5. documentation
```yaml
capability_id: documentation
name: Documentation
providers: [confluence]
operations:
  - search-docs (script: confluence/search)
  - get-page (script: confluence/get-page)
  - create-page (script: confluence/create-page)
```

#### 6. general
```yaml
capability_id: general
name: General Assistance
providers: [claude]
operations:
  - respond (always available)
  - search-web (tool: WebSearch)
  - fetch-url (tool: WebFetch)
enabled_by_default: true
```

## Session Type Updates

### New Format (Frontmatter + Markdown)

```yaml
---
# ~/.claude/session-types/coding.md
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
  git: minimal          # branch + status only
  calendar: count       # "3 meetings today"
  prs: count           # "2 open PRs"
  preferences: cascade  # global → project → type

token_budget: 3000-5000
---

# Coding Session

[Rest of existing markdown content...]
```

### Capability Matrix by Session Type

| Session Type | Startup Capabilities | On-Demand Capabilities |
|--------------|---------------------|------------------------|
| coding | source-control | project-management, calendar, observability |
| debugging | source-control, observability | project-management, calendar |
| planning | project-management | source-control, calendar, documentation |
| presenting | source-control | project-management, calendar, documentation |
| reviewing | source-control | project-management, observability |
| analysis | - | all |
| learning | - | documentation, general |
| personal | source-control | calendar |
| clauding | - | source-control |
| launcher | - | - |

## Runtime Behavior

### Session Startup Flow

```
User: /start coding

1. Parse session type → "coding"

2. Load session type definition
   - Read ~/.claude/session-types/coding.md
   - Extract frontmatter capabilities config

3. Resolve startup capabilities
   - source-control → load bitbucket MCP context
   - Build capability prompt section

4. Register on-demand capabilities
   - project-management, calendar, observability
   - These are "available but not loaded"

5. Generate startup summary
   ---
   🔧 **Coding Session Started**

   📍 Branch: feature/CORE-123 (clean)

   **Active:** source-control
   **Available:** project-management, calendar, observability

   What would you like to work on?
   ---

6. During session:
   - User says "create a Jira ticket"
   - Detect: project-management capability needed
   - Auto-load jira-workflow skill context
   - Execute operation
```

### Capability Discovery

```
User: "What can you do?"

Response:
**Active Capabilities:**
- source-control: Create PRs, review code, manage branches

**Available Capabilities:**
- project-management: Jira tickets, issue tracking
- calendar: View schedule, check availability
- observability: Search logs, view errors

Use any of these - I'll load the context automatically.
```

## Benefits

### 1. Single Source of Truth
- Capability definitions in one place
- Session types just reference capabilities
- No duplication of tool lists

### 2. Dynamic Discovery
- `/capabilities` command to list what's available
- Session-aware: shows what's active vs available
- Helps users understand Claude's abilities

### 3. Cleaner Session Types
- Focus on *what* the session does, not *how*
- Capabilities handle the implementation details
- Easier to read and maintain

### 4. Easy Extension
- Add new capability → automatically available to relevant sessions
- Add new operation to capability → all sessions gain it
- Swap providers without changing session types

### 5. Better Token Management
- Startup capabilities load context immediately
- On-demand capabilities defer loading
- Clear token budget per session type

### 6. Trigger-Based Activation
- Operations can define natural language triggers
- "Create a ticket" → auto-activate project-management
- Seamless experience without explicit commands

## Migration Path

### Phase 1: Create Capability Definitions
- [ ] Create `~/.claude/capabilities/` directory
- [ ] Define 6 core capabilities as YAML files
- [ ] No changes to session types yet

### Phase 2: Update Session Types
- [ ] Add frontmatter to session type files
- [ ] Map existing "Integrations" sections to capabilities
- [ ] Keep existing markdown content working

### Phase 3: Build Loader
- [ ] Create `~/.claude/lib/capabilities/loader.sh`
- [ ] Parse capability YAML files
- [ ] Generate capability context for sessions

### Phase 4: Update SESSION_START.md
- [ ] Read capability definitions at startup
- [ ] Build active/available capability lists
- [ ] Generate capability prompt section

### Phase 5: Add Discovery
- [ ] Create `/capabilities` slash command
- [ ] Show active vs available capabilities
- [ ] List operations for each capability

### Phase 6: Trigger Detection (Future)
- [ ] Parse operation triggers
- [ ] Detect capability needs from user messages
- [ ] Auto-activate on-demand capabilities

## Related Files

- `~/.claude/proposals/capabilities-implementation-plan.md` - Detailed implementation steps
- `~/Code/carebot/app/langgraph/capabilities.py` - Inspiration source
- `~/.claude/session-types/*.md` - Current session type definitions
- `~/.claude/skills/` - Existing skills that become capability operations

## Open Questions

1. **YAML vs Markdown?** Should capabilities be YAML, TOML, or markdown with frontmatter?
2. **Provider fallback?** How to handle when primary provider unavailable?
3. **Capability dependencies?** Can capabilities depend on other capabilities?
4. **User preferences?** Should users be able to disable capabilities globally?

## Appendix: Carebot Reference

Carebot's capability system (`~/Code/carebot/app/langgraph/capabilities.py`) uses:

```python
@dataclass
class Operation:
    name: str
    description: str
    requires_approval: bool = False
    parameters: list[str] = []
    examples: list[str] = []

@dataclass
class ServiceCapability:
    service_id: str
    name: str
    description: str
    operations: list[Operation]
    enabled_by_default: bool = True
    preference_key: str = ""

CAPABILITY_REGISTRY: dict[str, ServiceCapability] = {}

def register_capability(capability: ServiceCapability) -> None:
    CAPABILITY_REGISTRY[capability.service_id] = capability

def get_enabled_capabilities(preferences: dict) -> list[ServiceCapability]:
    # Filter by preference settings

def build_capabilities_prompt(preferences: dict) -> str:
    # Generate prompt section from enabled capabilities
```

This pattern provides:
- Central registry for all capabilities
- Preference-based enabling/disabling
- Dynamic prompt generation
- Runtime discovery
