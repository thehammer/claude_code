# Getting Started with Claude Code Dotfiles

Welcome! This guide will help you get up and running with this Claude Code configuration.

## Quick Start

```bash
# 1. Clone the dotfiles (if you haven't already)
git clone git@github.com:YOUR_ORG/claude-dotfiles.git ~/.claude

# 2. Run bootstrap
~/.claude/bin/bootstrap

# 3. Configure credentials
cp ~/.claude/credentials/.env.example ~/.claude/credentials/.env
# Edit with your API keys

# 4. Start Claude Code
claude

# 5. Begin a session
/start coding
```

## What's Included

This configuration provides a structured, productivity-focused Claude Code setup:

### Session Types

Start sessions with context tailored to your task:

| Command | Purpose |
|---------|---------|
| `/start coding` | Building features, fixing bugs |
| `/start debugging` | Investigating errors, troubleshooting |
| `/start planning` | Task prioritization, roadmaps |
| `/start presenting` | Creating PRs, writing docs |
| `/start reviewing` | Code review |
| `/start clauding` | Improving this configuration |

### Skills

Specialized workflows activated automatically or on-demand:

- **bitbucket-workflow** - Create PRs with auto-linked Jira tickets
- **jira-workflow** - Create tickets with smart defaults
- **session-context** - Lazy-load calendar, PRs, notes

### Slash Commands

Quick actions available in any session:

- `/calendar` - Show today's schedule
- `/prs` - List open pull requests
- `/notes` - Recent session notes
- `/todos` - Project TODO items
- `/full-context` - Load everything

### MCP Servers

Pre-configured Model Context Protocol servers:

- **Jira** (port 3000) - Full Jira integration
- **Bitbucket** (port 3001) - Repository and PR management

## Directory Structure

```
~/.claude/
├── bin/                    # Executable scripts
│   └── bootstrap           # This setup script
├── commands/               # Slash command definitions
├── credentials/            # API keys and tokens (git-ignored)
├── lib/                    # Helper functions
│   ├── core/              # Core utilities
│   └── local/             # Local-only helpers
├── mcp-servers/           # MCP server Docker configs
│   ├── jira/
│   └── bitbucket/
├── recipes/               # Step-by-step guides
├── session-notes/         # Your session notes (git-ignored)
├── session-types/         # Session type definitions
├── skills/                # Skill definitions
├── templates/             # Templates for notes, etc.
├── CLAUDE.md              # Auto-loaded instructions
├── PREFERENCES.md         # Your preferences
├── SESSION_START.md       # Session startup orchestration
├── settings.json          # Claude Code settings
└── GETTING_STARTED.md     # This file
```

## Configuration

### 1. Credentials

Create `~/.claude/credentials/.env` with your API tokens:

```bash
# Required for Jira/Bitbucket MCP
ATLASSIAN_SITE_NAME=your-site.atlassian.net
ATLASSIAN_USER_EMAIL=your-email@company.com
ATLASSIAN_API_TOKEN=your-api-token
BITBUCKET_DEFAULT_WORKSPACE=your-workspace

# Optional integrations
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxx
DATADOG_API_KEY=your-key
SENTRY_AUTH_TOKEN=your-token
```

**Getting Atlassian API Token:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Copy to your .env file

### 2. MCP Servers

Start the MCP servers for Jira and Bitbucket integration:

```bash
# Start Jira MCP
cd ~/.claude/mcp-servers/jira
docker-compose up -d

# Start Bitbucket MCP
cd ~/.claude/mcp-servers/bitbucket
docker-compose up -d

# Verify running
docker ps --filter "name=mcp-server"
```

### 3. Preferences

Edit `~/.claude/PREFERENCES.md` to customize:

- Your name and role
- Coding style preferences
- Project conventions
- Communication preferences

### 4. Calendar Integration (Optional)

For calendar integration via Microsoft 365:

```bash
# Install m365 CLI
npm install -g @pnp/cli-microsoft365

# Login (opens browser)
m365 login

# Test
m365 status
```

## Session Workflow

### Starting a Session

```bash
# Start Claude Code
claude

# Begin a typed session
/start coding
```

The session will:
1. Load relevant context (git status, preferences)
2. Show available capabilities
3. Display session summary

### During a Session

- Use slash commands for quick actions
- Skills activate automatically when needed
- Session notes are saved for continuity

### Ending a Session

When done, Claude will offer to:
1. Summarize accomplishments
2. Save session notes
3. Update TODOs if needed

## Common Tasks

### Create a Jira Ticket

```
"Create a bug ticket for the login timeout issue"
```
The jira-workflow skill handles project detection, type inference, and field population.

### Create a Pull Request

```
"Create a PR for this branch"
```
The bitbucket-workflow skill:
- Extracts Jira key from branch name
- Generates description from commits
- Links to Jira ticket

### Search Logs

```
"Search Datadog for errors in the last hour"
```
Uses configured Datadog credentials to query logs.

### Check Calendar

```
/calendar
```
Shows today's meetings (requires m365 CLI setup).

## Customization

### Adding a Session Type

1. Create `~/.claude/session-types/mytype.md`:

```markdown
# My Session Type

## Purpose
What this session type is for.

## Context to Load
What context to load at startup.

## Integrations
Which integrations are pre-loaded vs on-demand.

## Summary Format
How to present the startup summary.
```

2. Update `SESSION_START.md` to include in valid types list.

### Adding a Skill

1. Create `~/.claude/skills/myskill/`:
   - `myskill.md` - Skill definition and instructions

2. Skills are auto-discovered by Claude Code.

### Adding a Slash Command

1. Create `~/.claude/commands/mycommand.md`:

```markdown
Instructions for what the command should do.

The command name comes from the filename.
```

2. Use with `/mycommand` in Claude.

## Troubleshooting

### MCP Servers Not Working

```bash
# Check if running
docker ps --filter "name=mcp"

# Check logs
docker logs jira-mcp-server --tail 50

# Restart
cd ~/.claude/mcp-servers/jira
docker-compose restart
```

### Credentials Not Found

```bash
# Verify .env exists
cat ~/.claude/credentials/.env

# Check symlinks in mcp-servers
ls -la ~/.claude/mcp-servers/jira/.env
```

### Session Type Not Found

```bash
# List available types
ls ~/.claude/session-types/

# Check for typos in command
/start coding  # not /start code
```

### Bootstrap Fails

```bash
# Run with check only
~/.claude/bin/bootstrap --check

# Check prerequisites
which git claude docker
```

## Updating

When the dotfiles repo is updated:

```bash
cd ~/.claude
git pull
~/.claude/bin/bootstrap --update
```

The bootstrap script is idempotent - safe to run multiple times.

## Getting Help

- **In-session:** Ask Claude about any feature
- **Slash commands:** Type `/` to see available commands
- **Documentation:** Check files in `~/.claude/*.md`
- **Recipes:** Step-by-step guides in `~/.claude/recipes/`

## Files Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-loaded on every message (session continuity) |
| `SESSION_START.md` | Orchestrates session startup |
| `PREFERENCES.md` | Your personal preferences |
| `INTEGRATIONS.md` | Integration documentation |
| `SETTINGS.md` | Settings file documentation |
| `PERMISSIONS.md` | Permission configuration guide |
| `WRAPUP.md` | Session end procedures |

## Philosophy

This configuration follows several principles:

1. **Lazy Loading** - Only load context when needed to save tokens
2. **Session Types** - Different contexts for different work
3. **Skills Over Scripts** - Reusable workflows as skills
4. **Idempotent Setup** - Safe to run bootstrap anytime
5. **Git-Ignored Secrets** - Credentials never committed

Enjoy your enhanced Claude Code experience!
