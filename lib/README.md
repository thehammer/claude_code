# Claude Code Helper Libraries

## Architecture

```
lib/
├── core/               # Always loaded
│   ├── loader.sh       # Session-aware loader (entry point)
│   ├── credentials.sh  # Load .env credentials
│   ├── utilities.sh    # Cross-cutting utilities
│   ├── m365.sh         # Microsoft 365 CLI wrapper
│   ├── calendar.sh     # Calendar helpers
│   └── layers.sh       # Layer system support
│
├── local/              # Local system automation
│   ├── macos.sh        # macOS automation (AppleScript)
│   ├── vscode.sh       # VSCode UI control
│   ├── tmux.sh         # Tmux integration
│   └── study-tracker.sh # Learning tracker
│
├── services/           # API client libraries (curl-based)
│   ├── jira.sh         # Jira REST API
│   ├── datadog.sh      # Datadog logs, traces, metrics, monitors
│   ├── slack.sh        # Slack messages, search, notifications
│   ├── sentry.sh       # Sentry error tracking
│   ├── github.sh       # GitHub API (prefer `gh` CLI when available)
│   ├── sessions.sh     # Claude Code session history search
│   │
│   └── _bash/          # CLI tool wrappers
│       ├── aws.sh      # AWS CLI wrappers
│       ├── onepassword.sh # 1Password `op` CLI
│       └── confluence.sh  # Confluence API
│
└── conventions/        # Team conventions (loaded per-project)
    └── carefeed.sh     # Branch naming, commit messages, etc.
```

## Usage

Skills and agents source what they need directly:

```bash
source ~/.claude/lib/core/credentials.sh
source ~/.claude/lib/services/slack.sh
slack_validate
```

The loader is used by session startup scripts to bulk-load everything:

```bash
source ~/.claude/lib/core/loader.sh coding    # Load all services
source ~/.claude/lib/core/loader.sh clauding  # Skip services
```

## Adding New Functions

1. Add to the appropriate `lib/services/{service}.sh` file
2. Create a skill in `skills/{name}/SKILL.md` if user-invocable
3. Update the agent in `agents/{name}.md` if agent-delegated
