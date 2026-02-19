# Claude Code Dotfiles

A comprehensive `~/.claude/` configuration for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's CLI coding agent. Includes session management, custom agents, service integrations, shell helpers, MCP servers, hooks, recipes, and a layer system for separating personal and team-specific config.

## Quick Start

### Option 1: Full Adoption (Recommended)

Clone this repo as your `~/.claude/` directory. Best if you're starting fresh or want the complete setup.

```bash
# Back up existing config if any
[ -d ~/.claude ] && mv ~/.claude ~/.claude.bak

# Clone
git clone git@github.com:thehammer/claude_code.git ~/.claude

# Configure credentials
cp ~/.claude/credentials/.env.example ~/.claude/credentials/.env
# Edit with your API keys (see Credentials section below)

# Start Claude Code
claude
/start coding
```

### Option 2: Cherry-Pick

If you already have a `~/.claude/` setup and want to adopt specific pieces:

```bash
# Clone somewhere temporary
git clone git@github.com:thehammer/claude_code.git /tmp/claude-dotfiles

# Copy what you want (examples)
cp -r /tmp/claude-dotfiles/agents/ ~/.claude/agents/
cp -r /tmp/claude-dotfiles/hooks/ ~/.claude/hooks/
cp -r /tmp/claude-dotfiles/session-types/ ~/.claude/session-types/
cp /tmp/claude-dotfiles/SESSION_START.md ~/.claude/
cp /tmp/claude-dotfiles/statusline.sh ~/.claude/

# Clean up
rm -rf /tmp/claude-dotfiles
```

### Option 3: Fork and Customize

Fork the repo and make it your own. Remove what you don't need, add your own agents and recipes.

```bash
# After forking on GitHub
git clone git@github.com:YOU/claude_code.git ~/.claude
```

## What's Included

### Agents (`agents/`)

Custom [subagents](https://docs.anthropic.com/en/docs/claude-code/agents) that Claude spawns via the Task tool for specialized work. Each agent has its own tools, model, and system prompt.

| Agent | Description |
|-------|-------------|
| `calendar-fetcher` | Fetch and display M365 calendar events |
| `codebase-explainer` | Trace code flow and explain architecture |
| `confluence-agent` | Search and read Confluence wikis |
| `datadog-agent` | Search logs, traces, and metrics in Datadog |
| `dependency-auditor` | Check for outdated or vulnerable dependencies |
| `ecs-investigator` | Debug ECS/container issues (read-only) |
| `git-historian` | Search git history for when and why things changed |
| `jira-agent` | Search, triage, and manage Jira tickets |
| `laravel-expert` | Debug Laravel issues and suggest patterns |
| `pipeline-debugger` | Investigate GitHub Actions workflow failures |
| `sentry-agent` | Investigate Sentry errors and issues |
| `session-researcher` | Find context from past Claude Code sessions |
| `slack-retriever` | Retrieve Slack messages and threads from URLs |
| `slack-url-to-logs` | Find Datadog logs for a Slack conversation |
| `test-writer` | Generate tests for code |

### Session Types (`session-types/`)

Context-aware session modes loaded via `/start <type>`. Each type controls what gets loaded (integrations, context) and how Claude behaves.

| Type | Purpose |
|------|---------|
| `coding` | Building features, fixing bugs (default) |
| `debugging` | Investigating errors, troubleshooting |
| `analysis` | Understanding codebase, evaluating architecture |
| `planning` | Task prioritization, roadmaps |
| `presenting` | Creating PRs, writing docs, summaries |
| `reviewing` | Code review |
| `learning` | Understanding technologies and patterns |
| `personal` | Side projects, hobbies |
| `clauding` | Improving this configuration itself |
| `commander` | Multi-agent orchestration |
| `organizing` | File and project organization |

Session startup is orchestrated by `SESSION_START.md` which reads the session type definition, loads the appropriate context via `lib/core/loader.sh`, and presents a summary.

### Slash Commands (`commands/`)

Quick actions available in any session by typing `/<name>`:

| Command | Purpose |
|---------|---------|
| `/start` | Begin a typed session with context |
| `/calendar` | Show today's schedule |
| `/prs` | List open pull requests |
| `/notes` | Recent session notes |
| `/todos` | Project TODO items |
| `/full-context` | Load everything (calendar, PRs, notes, TODOs) |
| `/wrapup` | End-of-day summary and session notes |
| `/branch` | Create a branch with git worktree |
| `/lock` | Workspace lock management |
| `/help` | Overview of available commands |

### Skills (`skills/`)

Multi-step workflows that Claude activates automatically or on-demand:

| Skill | Purpose |
|-------|---------|
| `jira-workflow` | Create Jira tickets with smart defaults (auto-infers project, type, priority) |
| `session-context` | Lazy-load calendar, PRs, notes, TODOs on demand |

### Hooks (`hooks/`)

Shell scripts triggered by Claude's tool use, configured in `settings.json`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `workspace-lock.sh` | Pre: Edit, Write, Bash | Prevent edits in locked workspaces |
| `doc-file-guard.sh` | Pre: Write | Prevent overwriting documentation files |
| `typescript-check.sh` | Post: Edit, Write | Run type checking after TypeScript changes |
| `console-log-warning.sh` | Post: Edit, Write | Warn about console.log left in code |

### Shell Libraries (`lib/`)

Bash function libraries loaded by `lib/core/loader.sh` based on session type.

**Core (`lib/core/`):**

| Library | Purpose |
|---------|---------|
| `loader.sh` | Smart loader — loads libraries based on session type |
| `layers.sh` | Layer system for multi-source configuration |
| `credentials.sh` | Credential loading from `.env` files |
| `utilities.sh` | Common utility functions |
| `calendar.sh` | M365 calendar helpers |
| `m365.sh` | Microsoft 365 CLI wrapper with auto-auth |
| `ide.sh` | IDE integration (VS Code, Cursor) |
| `locks.sh` | Workspace lock management |
| `pr-diff.sh` | PR diff analysis helpers |
| `worktree.sh` | Git worktree management |

**Service Wrappers (`lib/services/`):**

| Library | Purpose |
|---------|---------|
| `_bash/aws.sh` | AWS CLI helpers |
| `_bash/onepassword.sh` | 1Password CLI helpers |
| `_bash/confluence.sh` | Confluence API helpers |
| `mcp-candidates/bitbucket.sh` | Bitbucket API (bash fallback) |
| `mcp-candidates/datadog.sh` | Datadog API (bash fallback) |
| `mcp-candidates/github.sh` | GitHub API (bash fallback) |
| `mcp-candidates/sentry.sh` | Sentry API (bash fallback) |
| `mcp-candidates/slack.sh` | Slack API (bash fallback) |

**Local (`lib/local/`):**

| Library | Purpose |
|---------|---------|
| `tmux.sh` | Tmux session/pane management |
| `vscode.sh` | VS Code automation |
| `lazy-context.sh` | Deferred context loading |
| `study-tracker.sh` | Learning session tracking |

### MCP Servers (`mcp-servers/`)

[Model Context Protocol](https://modelcontextprotocol.io) servers that give Claude direct tool access to external services:

| Server | Port | Purpose |
|--------|------|---------|
| Jira | 3000 | Full Jira integration (issues, transitions, comments) |
| Bitbucket | 3001 | Repository and PR management |
| Session Memory | 3002 | Semantic search across past Claude sessions |
| Datadog | 3004 | Log search, traces, metrics, monitors |
| Sentry | — | Error tracking (TypeScript, Docker) |

Each server has its own `docker-compose.yml` for easy startup.

### Recipes (`recipes/`)

Human-readable, step-by-step workflow documents that Claude reads and adapts to your situation. Unlike scripts, recipes explain the *why* and let Claude handle the *how*.

| Category | Recipes |
|----------|---------|
| `aws/` | ECS/Lambda connection |
| `calendar/` | Fetch events, display schedule |
| `confluence/` | Read pages |
| `permissions/` | Sync settings between global and project |
| `slack/` | Retrieve messages, setup user token |
| `tmux/` | New Claude tab, start coding session |

### Bin Scripts (`bin/`)

Executable CLI tools:

| Script | Purpose |
|--------|---------|
| `bootstrap` | Initial setup and dependency checks |
| `claude-layer` | Layer management CLI (see Layer System below) |
| `ide` / `ide-switcher` / `ide-dashboard` | IDE integration tools |
| `figma_describe` / `figma_get` / `figma_ui` | Figma design file tools |
| `index-sessions` / `session-commands` / `search-session-commands` | Session history tools |
| `services/*` | CLI wrappers for AWS, Bitbucket, Confluence, Datadog, GitHub, 1Password, Sentry, Slack |

### Other Components

| Component | Purpose |
|-----------|---------|
| `CLAUDE.md` | Auto-loaded on every message — session continuity rules, safety guardrails |
| `PREFERENCES.md` | Personal preferences (name, timezone, verbosity, communication style) |
| `settings.json` | Claude Code settings (permissions, hooks, MCP servers, plugins) |
| `statusline.sh` | Custom powerline-style status bar showing model, cost, context usage |
| `knowledge/` | MkDocs-based documentation for this configuration |
| `templates/` | Templates for session notes and credentials |
| `easter-eggs/` | Date-based surprises |

## Layer System

> **Note:** The layer system is custom to this repo — it is not a standard Claude Code feature from Anthropic. It's entirely optional.

Layers solve the problem of separating **personal** config (this public repo) from **team/company-specific** config (private repos). A layer is a git repository cloned into `~/.claude/layers/<name>/` that mirrors the same directory structure.

### How It Works

```
~/.claude/                          # Personal config (this repo)
├── lib/core/layers.sh              # Layer system implementation
├── layers/
│   └── myteam/                     # A layer (separate git repo, gitignored)
│       ├── LAYER.md                # Layer metadata
│       ├── commands/               # Team slash commands
│       ├── lib/                    # Team shell libraries
│       ├── hooks/                  # Team hooks
│       └── recipes/                # Team recipes
```

**Precedence:** Personal config always wins. If both personal and a layer have `lib/helpers.sh`, the personal version is used.

**Key functions** (from `lib/core/layers.sh`):
- `layer_find "lib/helpers.sh"` — find a file across personal + layers
- `layer_source "lib/helpers.sh"` — source from best available location
- `layer_glob "commands/*.md"` — list files across all sources

### Using the Layer CLI

```bash
# Add a team layer from git
~/.claude/bin/claude-layer add git@github.com:YourOrg/claude-config.git myteam

# List installed layers
~/.claude/bin/claude-layer list

# Update a layer
~/.claude/bin/claude-layer update myteam

# Sync commands/hooks from layers into main dirs
~/.claude/bin/claude-layer sync
```

### Without the Layer System

If you don't need layers, everything works fine without them. The layer functions are only called when `lib/core/layers.sh` exists and is sourced. No layer-specific code runs if no layers are installed. You can delete `lib/core/layers.sh` and `bin/claude-layer` with no impact on the rest of the setup.

## Directory Structure

```
~/.claude/
├── agents/                 # Custom subagent definitions (*.md)
├── bin/                    # Executable scripts and CLI tools
│   ├── bootstrap           # Setup script
│   ├── claude-layer        # Layer management CLI
│   └── services/           # Service CLI wrappers (aws, bitbucket, etc.)
├── commands/               # Slash command definitions (*.md)
├── credentials/            # API keys and tokens (gitignored)
│   ├── .env.example        # Template with all supported credentials
│   └── .env                # Your actual credentials (gitignored)
├── docs/                   # Additional documentation
├── easter-eggs/            # Date-based fun
├── hooks/                  # Tool-use hooks (*.sh)
├── knowledge/              # MkDocs documentation site
├── layers/                 # Layer repos (gitignored)
├── lib/                    # Shell function libraries
│   ├── core/               # Always-loaded core libraries
│   ├── local/              # Local system helpers (tmux, vscode)
│   ├── mcp/                # MCP helper functions
│   └── services/           # External service API wrappers
├── mcp-servers/            # MCP server Docker configurations
│   ├── bitbucket/
│   ├── jira/
│   └── sentry/
├── plugins/                # Claude Code plugin configurations
├── recipes/                # Step-by-step workflow guides
│   ├── aws/
│   ├── calendar/
│   ├── confluence/
│   ├── slack/
│   └── tmux/
├── session-types/          # Session type definitions (*.md)
├── skills/                 # Multi-step workflow definitions
├── templates/              # Templates for notes, credentials
├── CLAUDE.md               # Auto-loaded every message
├── PREFERENCES.md          # Personal preferences
├── SESSION_START.md        # Session startup orchestration
├── WRAPUP.md               # Session end procedures
├── settings.json           # Claude Code settings (permissions, hooks, MCP)
└── statusline.sh           # Custom status bar script
```

## Configuration

### Credentials

Copy the example and fill in your API keys:

```bash
cp ~/.claude/credentials/.env.example ~/.claude/credentials/.env
```

Supported services (all optional):
- **Atlassian** (Jira, Confluence, Bitbucket) — API token from [Atlassian settings](https://id.atlassian.com/manage-profile/security/api-tokens)
- **GitHub** — Personal access token from [GitHub settings](https://github.com/settings/tokens)
- **Slack** — Bot + user tokens from [Slack API](https://api.slack.com/apps)
- **Datadog** — API + app keys from [Datadog settings](https://app.datadoghq.com/organization-settings/api-keys)
- **Sentry** — Auth token from [Sentry settings](https://sentry.io/settings/account/api/auth-tokens/)
- **AWS** — Standard AWS credentials or `~/.aws/credentials`
- **1Password** — Service account token

See `credentials/.env.example` for detailed setup instructions per service.

### MCP Servers

Start the servers you need:

```bash
# Jira
cd ~/.claude/mcp-servers/jira && docker-compose up -d

# Bitbucket
cd ~/.claude/mcp-servers/bitbucket && docker-compose up -d

# Sentry
cd ~/.claude/mcp-servers/sentry && docker-compose up -d
```

MCP server connections are configured in `settings.json` under `mcpServers`.

### Preferences

Edit `PREFERENCES.md` to set:
- Your name and timezone
- Communication style and verbosity
- Notification preferences (Slack, macOS)
- Coding conventions

### Customization

**Add a session type:** Create `session-types/mytype.md` following the existing patterns.

**Add an agent:** Create `agents/myagent.md` with frontmatter (`name`, `description`, `tools`, `model`) and a system prompt.

**Add a slash command:** Create `commands/mycommand.md` with the command instructions.

**Add a hook:** Create `hooks/myhook.sh` and register it in `settings.json` under `hooks`.

**Add a recipe:** Create `recipes/category/myrecipe.md` following `recipes/TEMPLATE.md`.

## Session Workflow

```bash
# Start a session
claude
/start coding

# During the session — use slash commands
/calendar          # Check schedule
/prs               # Check open PRs
/todos             # Check TODOs

# End the session
/wrapup            # Summarize and save notes
```

Sessions automatically:
1. Load context based on session type (git status, preferences, integrations)
2. Resume seamlessly when using `claude --continue`
3. Save notes for future reference on `/wrapup`

## Philosophy

1. **Lazy Loading** — Only load context when needed to save tokens
2. **Session Types** — Different contexts for different work
3. **Recipes over Scripts** — Flexible, documented workflows that Claude adapts
4. **Layers** — Separate personal from team config cleanly
5. **Gitignored Secrets** — Credentials, session notes, and company data never committed

## License

MIT
