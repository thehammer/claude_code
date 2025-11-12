# Claude Code Ecosystem Reference

This document provides a comprehensive overview of Claude Code's standard extension mechanisms and features.

---

## Core Extension Mechanisms

| Type | Trigger | Scope | Best For |
|------|---------|-------|----------|
| **MCP** | Model-invoked | System/Project/User | External tool integration (APIs, databases, services) |
| **Skills** | Model-invoked | Project/User/Plugin | Modular capabilities Claude uses autonomously |
| **Slash Commands** | User-invoked | Project/User | Quick prompts and workflows |
| **Hooks** | Event-triggered | System/Project/User | Automated actions on lifecycle events |
| **Sub-agents** | Model/User-invoked | Project/User/Plugin | Specialized agents for complex tasks |
| **Plugins** | Package format | Installable | Bundle of commands/skills/agents/hooks/MCPs |

---

## 1. MCP (Model Context Protocol)

**Purpose:** Connect Claude to external tools, databases, and APIs through a universal adapter protocol.

**How it works:**
- Uses HTTP, SSE, or stdio transports for bidirectional communication
- Claude automatically calls MCP tools when relevant to the task
- 40+ pre-built servers available (Jira, GitHub, Sentry, Stripe, Notion, etc.)

**Configuration:**
```bash
# HTTP server (recommended for cloud services)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Local stdio server (direct system access)
claude mcp add --transport stdio airtable \
  --env AIRTABLE_API_KEY=YOUR_KEY \
  -- npx -y airtable-mcp-server

# Management
claude mcp list              # View configured servers
claude mcp remove [name]     # Delete a server
/mcp                        # Check status in session
```

**Scopes:**
- **Local** (default): Personal, project-specific servers
- **Project**: Shared via `.mcp.json` in version control
- **User**: Available across all projects

**Use cases:**
- "Add the feature from JIRA issue ENG-4521 and create a GitHub PR"
- "Check Sentry for recent errors and analyze their frequency"
- "Query our PostgreSQL database to find users matching criteria"

**Current setup:** Your Jira and Bitbucket integrations are MCPs!

---

## 2. Skills

**Purpose:** Modular capabilities that Claude autonomously invokes based on task context.

**How it works:**
- Markdown files with YAML frontmatter describing when to use them
- Claude reads the description and automatically activates when relevant
- Separate from slash commands (model-invoked vs user-invoked)

**Structure:**
```markdown
---
name: skill-identifier
description: What it does and when Claude should use it
---

# Instructions for Claude

[Detailed instructions here...]
```

**Locations:**
- Personal: `~/.claude/skills/`
- Project: `.claude/skills/`
- Plugin: Distributed via plugins

**Key insight:** The `description` field is critical for discoverability. Include both:
1. What the skill does
2. When Claude should use it

**Example:**
```yaml
---
name: pdf-tools
description: Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

**Difference from commands:**
- Skills: Claude decides when to use them
- Commands: User explicitly invokes with `/command`

---

## 3. Slash Commands

**Purpose:** User-invoked custom prompts and workflows accessible via `/command` syntax.

**How it works:**
- Markdown files in `.claude/commands/` (project) or `~/.claude/commands/` (user)
- Supports parameters, bash execution, and file references
- Can include frontmatter for metadata

**Basic structure:**
```markdown
<!-- In .claude/commands/optimize.md -->
Analyze this code for performance issues and suggest optimizations.
```

Usage: `/optimize`

**Parameter handling:**
```markdown
<!-- Capture all arguments -->
Fix issue $ARGUMENTS in the codebase.

<!-- Positional parameters -->
Create a $1 component called $2 with $3 functionality.
```

Usage: `/fix-issue 123 high-priority` or `/create component Button click-handler`

**Advanced features:**

**Bash execution:**
```markdown
---
allowed-tools: Bash(git status:*), Bash(git diff:*)
---
Current changes: !`git status`

Review these changes for quality issues.
```

**Frontmatter metadata:**
```yaml
---
description: Review code for security vulnerabilities
allowed-tools: Bash(grep:*), Read(**)
model: sonnet
argument-hint: [file-path]
---
```

**File references:**
```markdown
Review @src/components/Button.tsx for accessibility issues.
```

**Namespacing:**
- Store in subdirectories: `.claude/commands/frontend/component.md`
- Creates command: `/component`

**Built-in commands:**
- `/help`, `/clear`, `/model`, `/sandbox`, `/memory`, `/hooks`, `/agents`, `/mcp`

**Current setup:** Your `/start` command follows this pattern perfectly!

---

## 4. Hooks

**Purpose:** Execute shell commands automatically at specific lifecycle events.

**How it works:**
- User-defined bash commands that trigger on events
- Some hooks can block actions (PreToolUse)
- Configured via `/hooks` command or settings files

**Available events:**

| Event | When It Fires | Can Block? |
|-------|---------------|------------|
| `PreToolUse` | Before any tool call | ✅ Yes |
| `PostToolUse` | After tool execution | No |
| `UserPromptSubmit` | When user submits prompt | No |
| `Notification` | When Claude sends alerts | No |
| `Stop` | When Claude finishes responding | No |
| `SubagentStop` | When subagent completes | No |
| `PreCompact` | Before compaction | No |
| `SessionStart` | Session begins | No |
| `SessionEnd` | Session ends | No |

**Common use cases:**

**Automated formatting:**
```bash
# PostToolUse hook for TypeScript files
if [[ "$TOOL_NAME" == "Write" ]] && [[ "$FILE_PATH" == *.ts ]]; then
    prettier --write "$FILE_PATH"
fi
```

**Command logging:**
```bash
# PreToolUse hook for Bash commands
if [[ "$TOOL_NAME" == "Bash" ]]; then
    echo "$(date): $COMMAND" >> ~/.claude/bash-log.txt
fi
```

**File protection:**
```bash
# PreToolUse hook to block production changes
if [[ "$FILE_PATH" == *production* ]]; then
    echo "❌ Blocked: Cannot modify production files"
    exit 1  # Non-zero exit blocks the action
fi
```

**Notification customization:**
```bash
# Notification hook
osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\""
```

**Security warning:** ⚠️ Hooks execute with your environment's credentials. Review hook code carefully before registration.

**Configuration:**
Use `/hooks` command or edit settings files directly.

---

## 5. Sub-agents

**Purpose:** Specialized AI assistants with dedicated expertise and separate context windows.

**How it works:**
- Pre-configured AI personalities for specific task domains
- Each has its own context window (doesn't pollute main conversation)
- Claude delegates automatically when task matches agent expertise
- Can also be invoked explicitly

**When to use sub-agents vs. direct tools:**

**Use sub-agents:**
- Complex, domain-specific tasks requiring specialized expertise
- Context preservation (keep main conversation clean)
- Reusable workflows across projects

**Use direct tools:**
- Simple, one-off operations
- Need immediate results without delegation overhead
- Task doesn't require specialized configuration

**Locations:**
1. **Project subagents** (`.claude/agents/`) - Highest priority
2. **User subagents** (`~/.claude/agents/`) - Available everywhere
3. **Plugin agents** - Provided by plugins

**Structure:**
```markdown
<!-- In .claude/agents/code-reviewer.md -->
---
name: code-reviewer
description: Expert code reviewer focusing on best practices, security, and maintainability
---

You are a senior software engineer specializing in code review...

[Detailed instructions for the agent]
```

**Invocation:**

**Automatic:**
Claude delegates when task description matches agent expertise.

**Explicit:**
"Use the code-reviewer subagent to check my recent changes"

**Management:**
- `/agents` - Interactive management (view, create, edit, delete)
- `--agents` flag - CLI-based dynamic agents for testing

**Examples:**
- `code-reviewer` - Reviews code for quality and security
- `test-runner` - Executes tests and analyzes failures
- `security-auditor` - Scans for vulnerabilities
- `refactor-specialist` - Suggests architectural improvements

---

## 6. Plugins

**Purpose:** Package and distribute bundles of commands, skills, agents, hooks, and MCPs.

**How it works:**
- Plugins are containers that can include any combination of extensions
- Installable via plugin marketplaces or local directories
- Enable sharing configurations across teams and community

**Structure:**
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Metadata (name, version, author)
├── commands/                 # Optional slash commands
│   └── custom-cmd.md
├── agents/                   # Optional subagents
│   └── specialist.md
├── skills/                   # Optional Skills
│   └── SKILL.md
├── hooks/                    # Optional event handlers
│   └── pre-tool-use.sh
└── mcp-servers/             # Optional MCP configurations
    └── server-config.json
```

**Manifest example** (`.claude-plugin/plugin.json`):
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Custom workflow automation",
  "author": "Your Name",
  "repository": "https://github.com/you/plugin"
}
```

**Creating a plugin:**
1. Create directory structure with `.claude-plugin/plugin.json`
2. Add commands, skills, agents, hooks as needed
3. Set up test marketplace locally
4. Install and test: `claude plugin install ./my-plugin`

**Distribution:**
- Local installation
- Team repositories
- Public plugin marketplaces

**Key distinction:** Plugins are packages; Skills within plugins are model-invoked.

---

## Other Ecosystem Features

### Memory

**Purpose:** Persistent preferences and instructions across sessions.

**How it works:**
- Hierarchical system with four memory levels
- Automatically loaded into context at session start
- Add quickly with `#` prefix or `/memory` command

**Levels (precedence order):**
1. **Personal** (`~/.claude/CLAUDE.md`)
2. **Project** (`./CLAUDE.md` or `./.claude/CLAUDE.md`) - Shared via git
3. **Organization** (System-level) - Enterprise deployment
4. **Global** (Anthropic defaults)

**Use cases:**

**Project memory:**
- Team coding standards
- Frequently used build commands
- Project-specific architectural patterns
- Shared conventions

**Organization memory:**
- Company-wide security policies
- Compliance requirements
- Enterprise coding standards

**Current setup:** Your `~/.claude/CLAUDE.md` file is using Memory!

**Quick add:** Start input with `#` to save as memory
**Edit:** `/memory` opens memory files in editor

---

### Output Styles

**Purpose:** Customize Claude's behavior by replacing the system prompt.

**How it works:**
- System prompt replacements (not additions like CLAUDE.md)
- Changes Claude's personality and response style
- Preserves core capabilities (file management, scripts, TODOs)

**Built-in styles:**
- **Default**: Concise, software engineering focused
- **Explanatory**: Educational insights about implementation choices
- **Learning**: Collaborative mode with `TODO(human)` comments for you to implement

**Custom styles:**

**Location:**
- User: `~/.claude/output-styles/[name].md`
- Project: `.claude/output-styles/[name].md`

**Structure:**
```markdown
---
name: Your Style Name
description: What it does
---

# Instructions
[Your custom system prompt here...]
```

**Create:** `/output-style:new [description]`
**Switch:** `/output-style [name]` or `/output-style` for menu

**Key difference from CLAUDE.md:**
- Output Styles: Replace system prompt
- CLAUDE.md: Added as user message (higher precedence)

---

### Checkpointing

**Purpose:** Track and rewind changes without git.

**Commands:**
- `/checkpoint [name]` - Save current state
- `/revert [name]` - Restore previous state
- `/diff [name]` - Compare with checkpoint

**Use cases:**
- Experimental refactoring
- Trying multiple approaches
- Quick rollback without git operations

---

### Headless Mode

**Purpose:** Programmatic API for automation and CI/CD integration.

**How it works:**
- JSON request/response format
- Non-interactive execution
- Perfect for pipelines and automated workflows

**Use cases:**
- GitHub Actions integration
- GitLab CI/CD pipelines
- Automated code review
- Scheduled maintenance tasks

**Documentation:** See [Headless Mode](https://docs.claude.com/en/docs/claude-code/headless.md)

---

### Sandboxing

**Purpose:** Isolated execution environments for security.

**Options:**
- Docker containers
- Kubernetes pods
- E2 (cloud sandboxing)
- Custom sandbox implementations

**Use cases:**
- Untrusted code execution
- Multi-tenant environments
- Enterprise security requirements
- Compliance isolation

---

## Comparison: Current Setup vs. Official Features

### What You've Built

| Your Implementation | Official Equivalent | Status |
|-------------------|---------------------|---------|
| Session types | Output Styles + Sub-agents | ✅ Similar pattern |
| Helper scripts in `~/.claude/lib/` | Skills | Could be Skills |
| `/start` command | Slash Commands | ✅ Already compliant |
| Session notes templates | Memory | Could use Memory |
| Integration wrappers | MCP servers | Similar approach |
| `~/.claude/PREFERENCES.md` | CLAUDE.md (Memory) | Different name |
| Manual helper sourcing | Skills/MCPs | More explicit control |

### Key Differences

**Your approach:**
- ✅ Explicit control and orchestration
- ✅ Highly customized for your workflow
- ✅ Script-based (predictable, debuggable)
- ⚠️ Manual coordination required
- ⚠️ Not shareable via standard mechanisms

**Official features:**
- ✅ Autonomous invocation (Skills, Sub-agents)
- ✅ Standardized protocols (MCPs)
- ✅ Event-driven automation (Hooks)
- ✅ Shareable via Plugins
- ⚠️ Less explicit control
- ⚠️ Requires trust in Claude's decision-making

---

## Integration Opportunities

### 1. Convert Helpers to Skills

**Current:** 97 integration scripts in `~/.claude/bin/`

**Opportunity:** Package as Skills that Claude invokes automatically

**Example:**
```markdown
<!-- ~/.claude/skills/bitbucket-tools/SKILL.md -->
---
name: bitbucket-tools
description: Bitbucket operations including PR management, pipeline checks,
  branch operations, and code review. Use when working with Bitbucket PRs,
  repositories, or CI/CD pipelines.
---

Available tools in ~/.claude/bin/services/bitbucket/:
- bb_ls_prs - List pull requests
- bb_get_pr - Get PR details
- bb_add_pr - Create new PR
[etc...]

Call these scripts directly when Bitbucket operations are needed.
```

**Benefits:**
- Claude knows when to use Bitbucket tools
- No manual sourcing required
- Autonomous tool selection

### 2. Package as Plugin

**Structure:**
```
claude-hammer-workflows/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── start.md          # Your /start command
├── skills/
│   ├── bitbucket-tools/SKILL.md
│   ├── jira-tools/SKILL.md
│   └── session-management/SKILL.md
├── agents/
│   ├── session-reviewer.md
│   └── config-optimizer.md
└── templates/
    └── session-notes/
```

**Benefits:**
- Shareable with team/community
- Standard installation: `claude plugin install`
- Versioned and distributable

### 3. Add Hooks for Automation

**Opportunities:**

**Session cleanup (SessionEnd):**
```bash
# Auto-save session notes
~/.claude/bin/save-session-notes.sh
```

**Permission sync (SessionStart):**
```bash
# Already manual in SESSION_START.md
~/.claude/bin/sync-global-configs
```

**Git safety (PreToolUse):**
```bash
# Block commits with secrets
if [[ "$TOOL_NAME" == "Bash" ]] && [[ "$COMMAND" == *"git commit"* ]]; then
    if git diff --cached | grep -iE "password|secret|token"; then
        echo "❌ Blocked: Potential secret in staged changes"
        exit 1
    fi
fi
```

### 4. Create Session Sub-agents

**Current:** Session types are orchestrators

**Opportunity:** Create specialized sub-agents for session types

**Example:**
```markdown
<!-- ~/.claude/agents/session-reviewer.md -->
---
name: session-reviewer
description: Reviews completed sessions and suggests improvements to session
  type definitions, token usage, and workflow efficiency
---

You are an expert at analyzing Claude Code session logs and configurations...
```

Usage: `/wrapup` could invoke session-reviewer automatically

### 5. Adopt Memory Standard

**Current:** `~/.claude/PREFERENCES.md`

**Opportunity:** Rename to `~/.claude/CLAUDE.md` for official Memory support

**Benefits:**
- Quick add with `#` prefix
- `/memory` command support
- Standard hierarchy (personal → project → org)
- Better documentation alignment

---

## Decision Matrix: When to Use What

| Need | Use | Not |
|------|-----|-----|
| External API integration | MCP | Skills |
| Autonomous capability selection | Skills | Slash Commands |
| User-triggered workflows | Slash Commands | Skills |
| Automated lifecycle actions | Hooks | Manual scripts |
| Complex specialized tasks | Sub-agents | Direct tools |
| Share team workflows | Plugins | Manual setup |
| Persistent preferences | Memory (CLAUDE.md) | Config files |
| Change Claude's personality | Output Styles | CLAUDE.md |
| Track experimental changes | Checkpointing | Git |
| CI/CD integration | Headless Mode | Interactive |
| Security isolation | Sandboxing | Trust mode |

---

## Recommended Actions

### Short-term (Easy wins)

1. **Rename PREFERENCES.md to CLAUDE.md** - Adopt official Memory standard
2. **Create Skills for major integrations** - Bitbucket, Jira, Datadog as separate skills
3. **Add SessionEnd hook** - Automate wrapup tasks
4. **Document current commands** - Your `/start` already compliant, just add frontmatter

### Medium-term (Significant improvement)

5. **Create session sub-agents** - Dedicated agents for coding, debugging, reviewing
6. **Add PreToolUse hooks** - Git safety, file protection, secret detection
7. **Package critical workflows as Skills** - Session management, permission sync
8. **Explore Output Styles** - Alternative to session types for simpler cases

### Long-term (Full integration)

9. **Package as plugin** - Share your sophisticated setup with community
10. **Contribute to plugin marketplace** - Help others benefit from your patterns
11. **Convert remaining scripts to Skills** - Full autonomous operation
12. **Build custom MCPs** - Carefeed-specific integrations as proper MCPs

---

## Resources

**Official Documentation:**
- [MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp.md)
- [Skills Guide](https://docs.claude.com/en/docs/claude-code/skills.md)
- [Plugins Guide](https://docs.claude.com/en/docs/claude-code/plugins.md)
- [Hooks Guide](https://docs.claude.com/en/docs/claude-code/hooks-guide.md)
- [Slash Commands](https://docs.claude.com/en/docs/claude-code/slash-commands.md)
- [Sub-agents](https://docs.claude.com/en/docs/claude-code/sub-agents.md)
- [Memory](https://docs.claude.com/en/docs/claude-code/memory.md)
- [Output Styles](https://docs.claude.com/en/docs/claude-code/output-styles.md)

**Full Documentation Map:**
[https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)

---

**Last Updated:** 2025-10-29
**Session:** Clauding - Ecosystem documentation
