# Integration Scripts Quick Reference

**Location:** `~/.claude/bin/`
**Architecture:** Standalone scripts (no sourcing required!)
**Total Scripts:** 97 across 8 services + utilities

## Quick Start

All integration functions are now **standalone scripts**. Just call them directly:

```bash
# List your open PRs
~/.claude/bin/utilities/list-all-open-prs 10

# Create a PR
~/.claude/bin/services/bitbucket/create-pr "feature/branch" "master" "Title" "Description"

# Search logs
~/.claude/bin/services/datadog/search-logs "status:error" "1h"

# Send Slack message
~/.claude/bin/services/slack/post-message "general" "Hello!"
```

**No need to source anything** - each script loads only its dependencies.

---

## Complete Catalog

See [~/.claude/bin/README.md](~/.claude/bin/README.md) for comprehensive documentation.

**Quick navigation:**
```bash
ls ~/.claude/bin/services/        # List all services
ls ~/.claude/bin/services/bitbucket/   # List Bitbucket scripts
ls ~/.claude/bin/carefeed/        # List Carefeed helpers
```

---

## When to Use Integrations

- ✅ **Creating/reading Jira tickets** → Use Jira MCP tools
- ✅ **Creating/reading PRs** → Use `services/bitbucket/*` or `services/github/*` scripts
- ✅ **Posting to Slack** → Use `services/slack/*` scripts
- ✅ **Searching logs/errors** → Use `services/datadog/*` or `services/sentry/*` scripts
- ✅ **AWS operations** → Use `services/aws/*` scripts
- ✅ **Env var deployment** → Use `services/onepassword/*` scripts
- ✅ **Carefeed conventions** → Use `carefeed/*` helper scripts

---

## Pull Request Scripts (IMPORTANT!)

**CRITICAL:** Different Carefeed projects use different Git hosting:
- **Check git remote origin** to determine which service to use
- **Bitbucket repos:** `Bitbucketpassword1/*` → Use `services/bitbucket/*` scripts
- **GitHub repos:** `github.com/*` → Use `services/github/*` scripts
- **NEVER suggest opening browser** - Always use API scripts

### Detecting PR Service

```bash
# Check which service hosts this repo
git remote get-url origin

# If contains "bitbucket" or "Bitbucketpassword1" → Use services/bitbucket/*
# If contains "github.com" → Use services/github/*
```

### Bitbucket Scripts (9 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `list-prs <repo> <state> [limit]` | List PRs (auto-detects repo) | `list-prs "" "OPEN" 10` |
| `create-pr <source> <dest> <title> <desc>` | Create PR via API | `create-pr "feature/CORE-1234" "master" "Title" "Description"` |
| `get-pr <pr_id>` | Get PR details | `get-pr 1234` |
| `get-pr-comments <pr_id>` | Read PR comments | `get-pr-comments 1234` |
| `update-pr <pr_id> <title> [desc]` | Update PR | `update-pr 1234 "New title" "New desc"` |
| `get-pipeline <repo> <pipeline_id>` | Check pipeline status | `get-pipeline "portal_dev" 13906` |
| `get-step-url <pipeline_id> [step]` | Get pipeline step URLs | `get-step-url 13906 "PHP Test"` |
| `get-pipeline-logs <pipeline_id>` | Alias for get-step-url | `get-pipeline-logs 13906` |
| `is-configured` | Check if credentials are set | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/bitbucket/list-prs "" "OPEN" 10
~/.claude/bin/services/bitbucket/create-pr "feature/branch" "master" "Title" "Desc"
```

**Examples:**
```bash
cd ~/.claude/bin/services/bitbucket

./list-prs                     # Auto-detect repo, all states, default limit
./list-prs "" "OPEN"           # Auto-detect repo, only open PRs
./list-prs "" "OPEN" 10        # Auto-detect repo, open PRs, limit 10
./list-prs "portal_dev"        # Specific repo, all states
./list-prs "portal_dev" "OPEN" 5  # All params specified
```

### GitHub Scripts (9 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `create-pr <source> <dest> <title> <desc>` | Create PR via API | `create-pr "feature/add-auth" "main" "Title" "Desc"` |
| `list-prs [state] [limit]` | List PRs | `list-prs "open" 10` |
| `get-pr <pr_number>` | Get PR details | `get-pr 42` |
| `get-pr-comments <pr_number>` | Read PR comments | `get-pr-comments 42` |
| `get-pr-reviews <pr_number>` | Get review status | `get-pr-reviews 42` |
| `update-pr <pr_number> <title> <body>` | Update PR | `update-pr 42 "New title" "New body"` |
| `list-repos` | List repositories | `list-repos` |
| `whoami` | Get current GitHub user | `whoami` |
| `is-configured` | Check if credentials are set | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/github/create-pr "feature/branch" "main" "Title" "Desc"
~/.claude/bin/services/github/list-prs "open" 10
```

---

## Slack Scripts (12 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `post-message <channel> <text>` | Post to channel | `post-message "general" "Hello!"` |
| `send-dm <user_id> <text>` | Send direct message | `send-dm "U12345" "Hi there"` |
| `get-channel-messages <channel> [limit]` | Get recent messages | `get-channel-messages "general" 50` |
| `find-channel <name>` | Find channel ID by name | `find-channel "engineering"` |
| `get-history <channel_id> [limit]` | Get channel history | `get-history "C12345" 100` |
| `search-messages <query> [count]` | Search all messages | `search-messages "error" 50` |
| `get-user-info <user_id>` | Get user details | `get-user-info "U12345"` |
| `list-conversations [types]` | List channels/DMs | `list-conversations "public_channel"` |
| `notify-completion <task> [duration]` | Send completion notice | `notify-completion "deploy" "5m"` |
| `notify-progress <task> <status>` | Send progress update | `notify-progress "build" "running tests"` |
| `whoami` | Get current Slack user | `whoami` |
| `is-configured` | Check if credentials are set | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/slack/post-message "general" "Deployment complete!"
~/.claude/bin/services/slack/send-dm "U12345" "PR ready for review"
```

**Important:** When asked about Slack channels, ALWAYS try `get-channel-messages` first. Only fall back to Datadog for application logs, not human messages.

---

## Sentry Scripts (9 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `list-issues <org> <project> <query> [limit]` | List issues | `list-issues carefeed portal_dev "is:unresolved" 10` |
| `get-issue <issue_id>` | Get issue details | `get-issue PORTAL-1ABC` |
| `get-issue-events <issue_id> [limit]` | Get events for issue | `get-issue-events PORTAL-1ABC 50` |
| `search-issues <org> <project> <query>` | Search issues | `search-issues carefeed portal_dev "error:timeout"` |
| `list-production-issues <org> <project>` | List unresolved prod issues | `list-production-issues carefeed portal_dev` |
| `list-projects <org>` | List projects in org | `list-projects carefeed` |
| `list-orgs` | List organizations | `list-orgs` |
| `whoami` | Get current Sentry user | `whoami` |
| `is-configured` | Check if credentials are set | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/sentry/list-issues carefeed portal_dev "is:unresolved" 10
~/.claude/bin/services/sentry/get-issue PORTAL-1ABC
```

---

## Datadog Scripts (16 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `search-logs <query> <time_range>` | Search logs | `search-logs "status:error service:portal_dev" "1h"` |
| `search-logs-paginated <query> <from> <to>` | Paginated search | `search-logs-paginated "error" "now-1d" "now"` |
| `collect-logs-bulk <query> <from> <to>` | Bulk collect logs | `collect-logs-bulk "status:error" "now-24h" "now"` |
| `get-metrics <query> <from> <to>` | Query metrics | `get-metrics "avg:system.cpu.user" "now-1h" "now"` |
| `list-monitors [query]` | List monitors | `list-monitors "tag:production"` |
| `get-monitor <monitor_id>` | Get monitor details | `get-monitor 12345` |
| `search-traces <query> <from> <to>` | Search APM traces | `search-traces "service:api" "now-1h" "now"` |
| `list-dashboards` | List dashboards | `list-dashboards` |
| `get-dashboard <dashboard_id>` | Get dashboard | `get-dashboard "abc-123"` |
| `create-dashboard <title> <widgets>` | Create dashboard | `create-dashboard "My Dashboard" "{...}"` |
| `update-dashboard <id> <title> <widgets>` | Update dashboard | `update-dashboard "abc-123" "New Title" "{...}"` |
| `delete-dashboard <dashboard_id>` | Delete dashboard | `delete-dashboard "abc-123"` |
| `search-dashboards <query>` | Search dashboards | `search-dashboards "production"` |
| `export-dashboard <dashboard_id>` | Export as JSON | `export-dashboard "abc-123"` |
| `validate` | Test API connection | `validate` |
| `is-configured` | Check if credentials are set | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/datadog/search-logs "status:error service:/ecs/portal_dev" "2h"
~/.claude/bin/services/datadog/get-metrics "avg:system.cpu.user{service:api}" "now-1h" "now"
```

**Time range formats:**
- Relative: `"1h"`, `"24h"`, `"7d"`
- Absolute: `"now-6h"`, `"now-1d"`
- Timestamps: Unix timestamps or ISO 8601

---

## AWS Scripts (15 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `login [profile]` | Login via AWS SSO | `login` |
| `whoami` | Get current identity | `whoami` |
| `status` | Show session status | `status` |
| `is-authenticated` | Check if logged in | `is-authenticated` |
| `exec <command>` | Execute AWS CLI command | `exec "s3 ls"` |
| `list-profiles` | List available profiles | `list-profiles` |
| `select-profile <profile>` | Switch profile | `select-profile "production"` |
| `get-account-id` | Get account ID | `get-account-id` |
| `get-account-name` | Get account alias | `get-account-name` |
| `lambda-get-info <function>` | Get Lambda summary | `lambda-get-info "my-function"` |
| `lambda-get-config <function>` | Get Lambda config | `lambda-get-config "my-function"` |
| `lambda-get-code-location <function>` | Get code S3 location | `lambda-get-code-location "my-function"` |
| `lambda-download-code <function> <dest>` | Download code zip | `lambda-download-code "my-function" "./code.zip"` |
| `lambda-extract-code <function> <dest>` | Extract code locally | `lambda-extract-code "my-function" "./code"` |
| `lambda-fetch-code <function> <dest>` | Download + extract | `lambda-fetch-code "my-function" "./code"` |

**Full paths:**
```bash
~/.claude/bin/services/aws/login
~/.claude/bin/services/aws/lambda-get-info "portal-api-handler"
```

---

## 1Password Scripts (4 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `get-item <name>` | Get item by name | `get-item "API Key"` |
| `list-items [vault]` | List items | `list-items "Development"` |
| `deploy-env <env_file> <op_path>` | Deploy env vars | `deploy-env ".env" "op://vault/item"` |
| `is-configured` | Check if CLI is set up | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/onepassword/get-item "DATABASE_URL"
~/.claude/bin/services/onepassword/deploy-env ".env.production" "op://prod/env-vars"
```

---

## Confluence Scripts (2 scripts)

| Script | Purpose | Example |
|--------|---------|---------|
| `search <query>` | Search pages | `search "deployment process"` |
| `is-configured` | Check if credentials are set | `is-configured` |

**Full paths:**
```bash
~/.claude/bin/services/confluence/search "API documentation"
```

---

## Utilities (3 scripts)

Cross-service aggregation tools.

| Script | Purpose | Example |
|--------|---------|---------|
| `list-all-open-prs [limit] [show_all]` | List YOUR PRs across all repos | `list-all-open-prs 10` |
| `notify-user <task> [status] [duration]` | Send completion notification | `notify-user "deploy" "success" "5m"` |
| `macos-notify <title> <message>` | Show macOS notification | `macos-notify "Build" "Complete"` |

**Full paths:**
```bash
~/.claude/bin/utilities/list-all-open-prs 10
~/.claude/bin/utilities/list-all-open-prs 10 all  # Show all users' PRs
```

**Note on list-all-open-prs:**
- **By default, shows only YOUR PRs** (filtered by your Bitbucket/GitHub user)
- Checks all repos: portal_dev, family-portal, GitHub repos
- Optional `show_all` parameter to see all users' PRs

---

## Carefeed Helpers (5 scripts)

Team-specific convention helpers.

| Script | Purpose | Example |
|--------|---------|---------|
| `branch-name <type> <jira> <desc>` | Generate branch name | `branch-name feature CORE-1234 "add auth"` |
| `commit-message <jira> <message>` | Generate commit message | `commit-message CORE-1234 "implement feature"` |
| `pr-description <jira> [summary]` | Generate PR template | `pr-description CORE-1234 "Add login"` |
| `show-conventions` | Display Git conventions | `show-conventions` |
| `jira-ticket-url <jira>` | Generate Jira URL | `jira-ticket-url CORE-1234` |

**Full paths:**
```bash
~/.claude/bin/carefeed/branch-name feature CORE-1234 "add user authentication"
# Output: feature/CORE-1234-add-user-authentication

~/.claude/bin/carefeed/commit-message CORE-1234 "add login form"
# Output: CORE-1234 - add login form

~/.claude/bin/carefeed/pr-description CORE-1234 "Implement user authentication"
# Output: Full PR template with Jira link
```

---

## Study Tracker (8 scripts)

Session tracking for experiments and investigations.

| Script | Purpose | Example |
|--------|---------|---------|
| `init <name> <description>` | Start study run | `init "perf-test" "Testing caching"` |
| `save-artifact <name> <data>` | Save artifact | `save-artifact "results.json" < data.json` |
| `complete <summary> [finding]` | Complete study | `complete "Cache improved 40%"` |
| `list [study] [limit]` | List study runs | `list "perf-test" 10` |
| `get <run_id>` | Get run details | `get "perf-test-20251023-100000"` |
| `latest <study>` | Get latest run | `latest "perf-test"` |
| `compare <run1> <run2>` | Compare runs | `compare "run1" "run2"` |
| `cleanup [keep_count]` | Clean old runs | `cleanup 20` |

**Full paths:**
```bash
run_id=$(~/.claude/bin/study/init "cache-optimization" "Testing Redis cache")
~/.claude/bin/study/save-artifact "metrics.json" < metrics.json
~/.claude/bin/study/complete "Hit rate improved from 60% to 85%"
```

---

## VSCode Automation (4 scripts)

Editor automation via AppleScript.

| Script | Purpose | Example |
|--------|---------|---------|
| `get-main-area-path` | Get AppleScript path | `get-main-area-path` |
| `get-claude-sessions` | List Claude tabs | `get-claude-sessions` |
| `get-active-tabs` | List active tabs | `get-active-tabs` |
| `close-tab-by-name <name>` | Close tab | `close-tab-by-name "Settings"` |

**Full paths:**
```bash
~/.claude/bin/vscode/get-claude-sessions
~/.claude/bin/vscode/close-tab-by-name "Untitled-1"
```

---

## Migration Notes

### Old vs New

**Before (Functions):**
```bash
source ~/.claude/lib/core/loader.sh coding && bitbucket_list_prs "" "OPEN" 10
```

**After (Scripts):**
```bash
~/.claude/bin/services/bitbucket/list-prs "" "OPEN" 10
```

### Benefits

1. **No sourcing required** - Just call scripts directly
2. **Faster execution** - Each script loads only ~5 dependencies vs 70+ functions
3. **Better discoverability** - `ls ~/.claude/bin/services/` shows everything
4. **Cleaner syntax** - No `source &&` chains
5. **Self-documenting** - Directory structure shows organization

### Backward Compatibility

The old function-based approach still works if you source the library files directly, but **scripts are now the recommended approach**.

---

## Complete Documentation

For comprehensive documentation with usage examples, see:

**[~/.claude/bin/README.md](~/.claude/bin/README.md)** - Complete catalog with detailed examples

---

**Last Updated:** 2025-10-23
**Architecture Version:** 2.0 (Script-based)
**Total Scripts:** 97
