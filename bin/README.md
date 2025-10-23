# Claude Code Helper Scripts

**97 ready-to-use helper scripts** organized by service and function.

## Quick Start

```bash
# List your open PRs
~/.claude/bin/utilities/list-all-open-prs

# Create a Carefeed branch name
~/.claude/bin/carefeed/branch-name feature CORE-1234 "add authentication"

# Search Datadog logs
~/.claude/bin/services/datadog/search-logs "status:error service:portal_dev" "1h"

# Send a Slack DM
~/.claude/bin/services/slack/send-dm "U12345" "Hello!"
```

## Directory Structure

```
~/.claude/bin/
├── services/          # External service integrations (82 scripts)
│   ├── bitbucket/    # PR management, pipelines (9)
│   ├── github/       # PR management, repos (9)
│   ├── slack/        # Messaging, notifications (12)
│   ├── sentry/       # Error tracking (9)
│   ├── datadog/      # Logs, metrics, dashboards (16)
│   ├── aws/          # Lambda, secrets, accounts (15)
│   ├── onepassword/  # Secret management (4)
│   └── confluence/   # Documentation search (2)
├── utilities/        # Cross-service tools (3)
├── carefeed/         # Team conventions (5)
├── study/            # Session tracking (8)
└── vscode/           # Editor automation (4)
```

## Services

### Bitbucket (9 scripts)
Pull request management and pipeline monitoring.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if Bitbucket credentials are set up |
| `list-prs` | List pull requests (OPEN/MERGED/DECLINED) |
| `create-pr` | Create a new pull request |
| `update-pr` | Update PR title, description, or reviewers |
| `get-pr` | Get detailed PR information |
| `get-pr-comments` | Get PR comments and activity |
| `get-pipeline` | Get pipeline status and details |
| `get-step-url` | Get URL for a specific pipeline step |
| `get-pipeline-logs` | Alias for get-step-url |

**Example:**
```bash
~/.claude/bin/services/bitbucket/list-prs portal_dev OPEN 10
```

---

### GitHub (9 scripts)
GitHub repository and pull request management.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if GitHub credentials are set up |
| `whoami` | Get current authenticated GitHub user |
| `list-prs` | List pull requests |
| `get-pr` | Get detailed PR information |
| `create-pr` | Create a new pull request |
| `update-pr` | Update PR details |
| `get-pr-comments` | Get PR comments |
| `get-pr-reviews` | Get PR reviews |
| `list-repos` | List repositories |

---

### Slack (12 scripts)
Team messaging and notifications.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if Slack credentials are set up |
| `whoami` | Get current authenticated Slack user |
| `list-conversations` | List channels and DMs |
| `get-history` | Get channel message history |
| `search-messages` | Search messages across workspace |
| `get-user-info` | Get user information |
| `find-channel` | Find channel by name |
| `get-channel-messages` | Get messages from a channel |
| `send-dm` | Send a direct message |
| `post-message` | Post message to a channel |
| `notify-completion` | Send task completion notification |
| `notify-progress` | Send progress update |

**Example:**
```bash
~/.claude/bin/services/slack/post-message "general" "Deployment complete!"
```

---

### Sentry (9 scripts)
Error tracking and issue management.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if Sentry credentials are set up |
| `whoami` | Get current authenticated Sentry user |
| `list-orgs` | List Sentry organizations |
| `list-projects` | List projects in an organization |
| `list-issues` | List issues (unresolved/all) |
| `get-issue` | Get detailed issue information |
| `get-issue-events` | Get events for an issue |
| `search-issues` | Search issues with filters |
| `list-production-issues` | List unresolved production issues |

**Example:**
```bash
~/.claude/bin/services/sentry/list-issues carefeed portal_dev is:unresolved 10
```

---

### Datadog (16 scripts)
Log search, metrics, dashboards, and monitoring.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if Datadog credentials are set up |
| `validate` | Validate Datadog API connection |
| `search-logs` | Search logs with query and time range |
| `search-logs-paginated` | Search logs with pagination |
| `collect-logs-bulk` | Collect large volume of logs |
| `get-metrics` | Query metrics |
| `list-monitors` | List monitors |
| `get-monitor` | Get monitor details |
| `search-traces` | Search APM traces |
| `list-dashboards` | List dashboards |
| `get-dashboard` | Get dashboard definition |
| `create-dashboard` | Create a new dashboard |
| `update-dashboard` | Update existing dashboard |
| `delete-dashboard` | Delete a dashboard |
| `search-dashboards` | Search dashboards by name/tag |
| `export-dashboard` | Export dashboard as JSON |

**Example:**
```bash
~/.claude/bin/services/datadog/search-logs "status:error service:/ecs/portal_dev" "2h"
```

---

### AWS (15 scripts)
Lambda functions, secrets, and account management.

| Script | Description |
|--------|-------------|
| `is-authenticated` | Check if AWS session is authenticated |
| `login` | Login to AWS via SSO |
| `whoami` | Get current AWS identity |
| `exec` | Execute AWS CLI command |
| `list-profiles` | List available AWS profiles |
| `select-profile` | Select AWS profile |
| `get-account-name` | Get account alias/name |
| `get-account-id` | Get account ID |
| `status` | Show current session status |
| `lambda-get-config` | Get Lambda function configuration |
| `lambda-get-code-location` | Get Lambda code S3 location |
| `lambda-download-code` | Download Lambda deployment package |
| `lambda-extract-code` | Extract Lambda code locally |
| `lambda-get-info` | Get Lambda function info summary |
| `lambda-fetch-code` | Download and extract Lambda code |

**Example:**
```bash
~/.claude/bin/services/aws/lambda-get-info my-function
```

---

### 1Password (4 scripts)
Secret and credential management.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if 1Password CLI is configured |
| `get-item` | Get item by name/ID |
| `list-items` | List items in vault |
| `deploy-env` | Deploy environment variables from 1Password |

---

### Confluence (2 scripts)
Documentation search.

| Script | Description |
|--------|-------------|
| `is-configured` | Check if Confluence credentials are set up |
| `search` | Search Confluence pages |

---

## Utilities (3 scripts)

Cross-service aggregation and system tools.

| Script | Description |
|--------|-------------|
| `list-all-open-prs` | List YOUR open PRs across all repos (Bitbucket + GitHub) |
| `notify-user` | Send notification about task completion |
| `macos-notify` | Show macOS notification banner |

**Example:**
```bash
~/.claude/bin/utilities/list-all-open-prs 10
~/.claude/bin/utilities/list-all-open-prs 10 all  # Show all users' PRs
```

---

## Carefeed (5 scripts)

Team conventions and standards.

| Script | Description |
|--------|-------------|
| `branch-name` | Generate Carefeed-standard branch name |
| `commit-message` | Generate Carefeed-standard commit message |
| `pr-description` | Generate Carefeed-standard PR description template |
| `show-conventions` | Display Carefeed Git conventions |
| `jira-ticket-url` | Generate Jira ticket URL |

**Example:**
```bash
~/.claude/bin/carefeed/branch-name feature CORE-1234 "add user authentication"
# Output: feature/CORE-1234-add-user-authentication

~/.claude/bin/carefeed/commit-message CORE-1234 "add login form"
# Output: CORE-1234 - add login form
```

---

## Study Tracker (8 scripts)

Session tracking for experiments and investigations.

| Script | Description |
|--------|-------------|
| `init` | Initialize a new study run |
| `save-artifact` | Save artifact to study run |
| `complete` | Mark study run as complete |
| `list` | List recent study runs |
| `get` | Get details of a specific run |
| `latest` | Get latest run for a study |
| `compare` | Compare two study runs |
| `cleanup` | Clean up old study runs |

**Example:**
```bash
run_id=$(~/.claude/bin/study/init "performance-test" "Testing cache optimization")
~/.claude/bin/study/save-artifact "results.json" < results.json
~/.claude/bin/study/complete "Cache hit rate improved 40%"
```

---

## VSCode (4 scripts)

Editor automation via AppleScript.

| Script | Description |
|--------|-------------|
| `get-main-area-path` | Get AppleScript path to main editor area |
| `get-claude-sessions` | List Claude Code session tabs |
| `get-active-tabs` | List currently active tabs |
| `close-tab-by-name` | Close tab by name |

---

## Usage Tips

### 1. Shorter Paths with Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export CLAUDE_BIN="$HOME/.claude/bin"
alias cb="$CLAUDE_BIN"

# Now you can use:
cb/utilities/list-all-open-prs
cb/services/slack/post-message "general" "Hello!"
```

### 2. Tab Completion

Scripts support tab completion for directory navigation:

```bash
cd ~/.claude/bin/services/bitbucket/<TAB>
# Shows: create-pr  get-pipeline  get-pr  is-configured  list-prs  update-pr
```

### 3. Script Help

Most scripts show usage when called without arguments:

```bash
~/.claude/bin/services/bitbucket/list-prs
# Usage: bitbucket_list_prs <repo> <state> [limit]
```

### 4. Checking Configuration

Each service has an `is-configured` script:

```bash
~/.claude/bin/services/bitbucket/is-configured && echo "✓ Ready"
~/.claude/bin/services/slack/is-configured && echo "✓ Ready"
```

---

## Architecture

Each script is a thin wrapper that:
1. Sources only its required dependencies
2. Calls the underlying function from `~/.claude/lib/`
3. Passes all arguments through

**Example script:**
```bash
#!/usr/bin/env bash
set -eo pipefail

LIB_DIR="$HOME/.claude/lib"
source "$LIB_DIR/core/credentials.sh"
source "$LIB_DIR/services/mcp-candidates/bitbucket.sh"

bitbucket_list_prs "$@"
```

---

## Regenerating Scripts

If you update function definitions in `~/.claude/lib/`, regenerate wrappers:

```bash
~/.claude/bin/generate-wrappers.sh
```

This will recreate all 97 scripts with updated dependencies.

---

## See Also

- **Library source:** `~/.claude/lib/` - Original function definitions
- **Session types:** `~/.claude/session-types/` - Context loading for different workflows
- **Integration docs:** `~/.claude/INTEGRATIONS_REFERENCE.md` - Detailed API documentation

---

**Generated:** 2025-10-23
**Total Scripts:** 97
**Version:** 2.0 (Script-based architecture)
