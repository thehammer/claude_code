# Getting Started

This guide walks you through setting up and using this Claude Code configuration. For a full feature overview, see [README.md](README.md).

## Quick Start

```bash
# 1. Clone the dotfiles
git clone git@github.com:thehammer/claude_code.git ~/.claude

# 2. Configure credentials
cp ~/.claude/credentials/.env.example ~/.claude/credentials/.env
# Edit ~/.claude/credentials/.env with your API keys

# 3. Start Claude Code
claude

# 4. Begin a session
/start coding
```

If you already have a `~/.claude/` directory, see [README.md](README.md) for cherry-pick and fork options.

## Step 1: Credentials

Create your credentials file:

```bash
cp ~/.claude/credentials/.env.example ~/.claude/credentials/.env
```

Edit `~/.claude/credentials/.env` and add the tokens you need. All services are optional — add only what you use:

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| Atlassian (Jira, Confluence, Bitbucket) | API token + email + site name | [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| GitHub | Personal access token | [GitHub Tokens](https://github.com/settings/tokens) |
| Slack | Bot token + user token | [Slack API Apps](https://api.slack.com/apps) |
| Datadog | API key + app key | [Datadog API Keys](https://app.datadoghq.com/organization-settings/api-keys) |
| Sentry | Auth token | [Sentry Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/) |
| AWS | Access key + secret (or `~/.aws/credentials`) | [AWS Console](https://console.aws.amazon.com/iam/) |
| 1Password | Service account token | [1Password Developer Tools](https://my.1password.com/developer-tools/service-accounts) |

See `credentials/.env.example` for detailed setup instructions per service.

## Step 2: MCP Servers (Optional)

MCP servers give Claude direct tool access to external services. Start the ones you need:

```bash
# Jira (port 3000)
cd ~/.claude/mcp-servers/jira && docker-compose up -d

# Bitbucket (port 3001)
cd ~/.claude/mcp-servers/bitbucket && docker-compose up -d

# Sentry
cd ~/.claude/mcp-servers/sentry && docker-compose up -d

# Verify running
docker ps --filter "name=mcp"
```

MCP servers require Docker. If you don't use Docker, the bash CLI wrappers in `lib/services/` provide equivalent functionality.

## Step 3: Preferences

Edit `~/.claude/PREFERENCES.md` to set:

- **Your name** — used in greetings and session notes
- **Timezone** — for calendar display and timestamps
- **Verbosity** — how much Claude explains what it's doing
- **Communication style** — professional, casual, etc.
- **Notification preferences** — Slack, macOS notifications

## Step 4: Calendar (Optional)

For Microsoft 365 calendar integration:

```bash
# Install m365 CLI
npm install -g @pnp/cli-microsoft365

# Login (opens browser for OAuth)
m365 login

# Verify
m365 status
```

Then use `/calendar` in any session.

## Using Sessions

### Start a Session

```bash
claude
/start coding
```

Available session types:

| Command | Purpose |
|---------|---------|
| `/start coding` | Building features, fixing bugs (default) |
| `/start debugging` | Investigating errors, troubleshooting |
| `/start analysis` | Understanding codebase, architecture review |
| `/start planning` | Task prioritization, roadmaps |
| `/start presenting` | Creating PRs, writing docs |
| `/start reviewing` | Code review |
| `/start learning` | Understanding technologies and patterns |
| `/start personal` | Side projects, hobbies |
| `/start clauding` | Improving this configuration |
| `/start commander` | Multi-agent orchestration |
| `/start organizing` | File and project organization |

You can add a description: `/start debugging the login timeout on production`

### During a Session

Use slash commands for quick actions:

| Command | Purpose |
|---------|---------|
| `/calendar` | Show today's schedule |
| `/prs` | List open pull requests |
| `/notes` | Recent session notes |
| `/todos` | Project TODO items |
| `/full-context` | Load everything at once |
| `/branch` | Create a branch with git worktree |
| `/lock` | Manage workspace locks |
| `/help` | Overview of available commands |

Skills activate automatically when relevant:
- **jira-workflow** — say "create a ticket for..." and it handles project/type/priority inference
- **session-context** — lazy-loads calendar, PRs, and notes when you ask for them

### End a Session

```
/wrapup
```

Claude summarizes accomplishments, saves session notes, and updates TODOs.

### Resume a Session

```bash
claude --continue
```

Sessions resume automatically — Claude detects the previous session type and reloads context.

## Common Tasks

### Create a Jira Ticket

```
Create a bug ticket for the login timeout issue
```

The jira-workflow skill infers the project, type, and priority from your description.

### Create a Pull Request

```
Create a PR for this branch
```

Claude generates a description from your commits and links to Jira tickets found in the branch name.

### Search Logs

```
Search Datadog for errors in the last hour
```

Uses the Datadog MCP server or bash helpers depending on what's available.

### Investigate an Error

```
Look into this Sentry issue: PROJ-1234
```

The sentry-agent fetches error details, stack traces, and frequency data.

### Check Calendar

```
/calendar
```

Shows today's meetings with times in your configured timezone.

## Customization

### Add a Session Type

Create `~/.claude/session-types/mytype.md`:

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

### Add an Agent

Create `~/.claude/agents/myagent.md`:

```markdown
---
name: myagent
description: What this agent does. When to use it.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a specialized agent for [domain]. Your job is to...

## When invoked:
1. Understand the problem
2. Search for relevant code
3. Provide recommendations
```

### Add a Slash Command

Create `~/.claude/commands/mycommand.md`:

```markdown
Instructions for what the command should do.
The command name comes from the filename.
Available as /mycommand in Claude.
```

### Add a Hook

Create `~/.claude/hooks/myhook.sh` (must be executable), then register it in `settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "~/.claude/hooks/myhook.sh", "timeout": 10 }]
      }
    ]
  }
}
```

### Add a Recipe

Create `~/.claude/recipes/category/myrecipe.md` following the template in `recipes/TEMPLATE.md`. Recipes are human-readable workflow documents that Claude reads and adapts.

### Add a Layer (Advanced)

The layer system separates personal config from team-specific config. See [README.md](README.md#layer-system) for details. This is a custom feature, not standard Claude Code.

```bash
~/.claude/bin/claude-layer add git@github.com:YourOrg/claude-config.git myteam
```

## Troubleshooting

### MCP Servers Not Working

```bash
# Check if running
docker ps --filter "name=mcp"

# Check logs
docker logs jira-mcp-server --tail 50

# Restart
cd ~/.claude/mcp-servers/jira && docker-compose restart
```

### Credentials Not Found

```bash
# Verify .env exists and has content
ls -la ~/.claude/credentials/.env

# Check file permissions (should be 600)
chmod 600 ~/.claude/credentials/.env
```

### Session Type Not Found

```bash
# List available types
ls ~/.claude/session-types/

# Check for typos
/start coding  # not /start code
```

### Hooks Not Running

Check `settings.json` — hooks must be registered under the correct matcher (`PreToolUse` or `PostToolUse`) and the script must be executable (`chmod +x`).

## Updating

```bash
cd ~/.claude && git pull
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-loaded on every message — session continuity, safety rules |
| `SESSION_START.md` | Orchestrates session startup and context loading |
| `PREFERENCES.md` | Your personal preferences and communication style |
| `WRAPUP.md` | Session end procedures |
| `settings.json` | Claude Code settings — permissions, hooks, MCP servers, plugins |
| `statusline.sh` | Custom status bar (model, cost, context usage) |
| `lib/core/loader.sh` | Smart library loader — loads helpers based on session type |
| `credentials/.env.example` | Template for all supported API credentials |
