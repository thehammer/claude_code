# Integration Functions Quick Reference

**Location:** `~/.claude/lib/integrations.sh`
**Load with:** `source ~/.claude/lib/integrations.sh`

## When to Use Integrations

- ✅ **Creating/reading Jira tickets** → Use `jira_*` functions
- ✅ **Creating/reading PRs** → Use `bitbucket_*` or `github_*` functions (detect from git remote)
- ✅ **Posting to Slack** → Use `slack_*` functions
- ✅ **Searching logs/errors** → Use `datadog_*` or `sentry_*` functions
- ✅ **AWS operations** → Use `aws_*` functions
- ✅ **Env var deployment** → Use `onepass_*` functions
- ✅ **Carefeed conventions** → Use `carefeed_*` helper functions

---

## Pull Request Functions (IMPORTANT!)

**CRITICAL:** Different Carefeed projects use different Git hosting:
- **Check git remote origin** to determine which service to use
- **Bitbucket repos:** `Bitbucketpassword1/*` → Use `bitbucket_*` functions
- **GitHub repos:** `github.com/*` → Use `github_*` functions
- **NEVER suggest opening browser** - Always use API functions

### Detecting PR Service

```bash
# Check which service hosts this repo
git remote get-url origin

# If contains "bitbucket" or "Bitbucketpassword1" → Use bitbucket_create_pr
# If contains "github.com" → Use github_create_pr
```

### Bitbucket Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `bitbucket_list_prs [repo] [state] [limit]` | List PRs (auto-detects repo) | `bitbucket_list_prs "" "OPEN" 10` |
| `bitbucket_create_pr <source> <dest> <title> <description>` | Create PR via API | `bitbucket_create_pr "feature/CORE-1234" "master" "Title" "$(carefeed_pr_description CORE-1234)"` |
| `bitbucket_get_pr <pr_id>` | Get PR details | `bitbucket_get_pr 1234` |
| `bitbucket_get_pr_comments <pr_id>` | Read PR comments | `bitbucket_get_pr_comments 1234` |
| `bitbucket_update_pr <pr_id> <title> [description]` | Update PR | `bitbucket_update_pr 1234 "New title" "New desc"` |
| `bitbucket_get_pipeline <repo> <pipeline_id>` | Check pipeline status | `bitbucket_get_pipeline "portal_dev" 13906` |
| `bitbucket_get_step_url [repo] <pipeline_id> [step_pattern]` | Get pipeline step URLs | `bitbucket_get_step_url 13906` or `bitbucket_get_step_url "portal_dev" 13906 "PHP Test"` |
| `bitbucket_get_pipeline_logs [repo] <pipeline_id>` | Alias for get_step_url | `bitbucket_get_pipeline_logs 13906` |
| `list_all_open_prs [limit] [show_all]` | **List YOUR open PRs across ALL repos** | `list_all_open_prs 10` |

**Note on bitbucket_list_prs:**
- All parameters are optional
- Auto-detects repo from git remote if not specified
- State: "OPEN", "MERGED", "DECLINED", "SUPERSEDED" (default: all)
- Limit: Max results (default: 50)

**Note on pipeline functions:**
- `bitbucket_get_pipeline` requires explicit repo name
- `bitbucket_get_step_url` auto-detects repo from git remote if only pipeline_id provided
- `bitbucket_get_step_url` can accept explicit repo: `bitbucket_get_step_url "portal_dev" 13906 "PHP Test"`
- Pipeline steps may not be available for old/expired pipelines
- These functions work best with recent pipeline runs (within last 30 days)

**Examples:**
```bash
bitbucket_list_prs                     # Auto-detect repo, all states, 50 results
bitbucket_list_prs "" "OPEN"           # Auto-detect repo, only open PRs
bitbucket_list_prs "" "OPEN" 10        # Auto-detect repo, open PRs, limit 10
bitbucket_list_prs "portal_dev"        # Specific repo, all states
bitbucket_list_prs "portal_dev" "OPEN" 5  # All params specified
```

**Note on list_all_open_prs:**
- **By default, shows only YOUR PRs** (filtered by "Hammer")
- Checks all repos: portal_dev, family-portal, GitHub repos
- Optional `show_all` parameter to see all users' PRs

**Examples:**
```bash
list_all_open_prs           # Your PRs only, limit 10 per repo
list_all_open_prs 5         # Your PRs only, limit 5 per repo
list_all_open_prs 10 all    # All users' PRs, limit 10 per repo
```

**Pro Tip:** Use `list_all_open_prs` in session startup to quickly see YOUR open PRs across all Carefeed repos!

### GitHub Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `github_create_pr <source> <dest> <title> <description>` | Create PR via API | `github_create_pr "feature/add-auth" "main" "Title" "Description"` |
| `github_list_prs [state] [limit]` | List PRs | `github_list_prs "open" 10` |
| `github_get_pr <pr_number>` | Get PR details | `github_get_pr 42` |
| `github_get_pr_comments <pr_number>` | Read PR comments | `github_get_pr_comments 42` |
| `github_get_pr_reviews <pr_number>` | Get review status | `github_get_pr_reviews 42` |
| `github_update_pr <pr_number> <title> <body>` | Update PR | `github_update_pr 42 "New title" "New body"` |
| `github_list_repos` | List repositories | `github_list_repos` |

**IMPORTANT:** Always use API functions for PR creation. Never suggest opening browser for either service.

---

## Slack Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `slack_get_channel_messages <channel_id> [limit]` | Read channel messages | `slack_get_channel_messages "C123ABC" 50` |
| `slack_find_channel <name>` | Get channel ID by name | `slack_find_channel "production"` |
| `slack_list_conversations` | List all channels | `slack_list_conversations` |
| `slack_post_message <channel> <message>` | Post to channel | `slack_post_message "#production" "Deploy complete"` |
| `slack_send_dm <user_id> <message>` | Send DM (needs im:write scope) | `slack_send_dm "U123" "Done!"` |
| `slack_search_messages <query>` | Search messages | `slack_search_messages "error timeout"` |
| `slack_get_history <channel_id> [limit]` | Get channel history | `slack_get_history "C123ABC" 100` |

**Workflow for reading channel:**
1. Use `slack_find_channel "channel-name"` to get channel ID
2. Use `slack_get_channel_messages "<channel_id>" 50` to read messages
3. Parse JSON response for message content

**IMPORTANT:** Always try Slack functions first when asked about channel messages. Only fall back to Datadog if Slack data doesn't exist or if looking for application logs (not human messages).

---

## Jira Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `jira_create_issue <project> <type> <summary> <desc> <priority> <component> <env>` | Create ticket | `jira_create_issue "CORE" "Bug" "Fix thing" "Details" "P2" "Portal" "Production "` |
| `jira_get_issue <key>` | Get issue details | `jira_get_issue "CORE-1234"` |
| `jira_search <jql> [max]` | Search with JQL | `jira_search "assignee=currentUser() AND status!=Done" 20` |
| `jira_whoami` | Get current user | `jira_whoami` |

**Note on jira_create_issue:**
- Environment field values have **trailing spaces** (Jira quirk): `"Production "` not `"Production"`
- Valid environments: `"Production "`, `"Staging "`, `"Development "`
- Component values: `"Portal"`, `"ALL"`, `"Integrations"`, `"Payments"`, `"App"`
- Priority values: `"P0"`, `"P1"`, `"P2"`, `"P3"`

**Common JQL patterns:**
- `assignee = currentUser() AND status != Done` - My open issues
- `project = CORE AND created >= -7d` - Recent CORE tickets
- `status = "In Progress" AND assignee = currentUser()` - My in-progress work

---

## Sentry Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `sentry_list_production_issues` | List prod errors (pre-filtered) | `sentry_list_production_issues` |
| `sentry_get_issue <org> <project> <id>` | Get error details | `sentry_get_issue "carefeed" "portal" "12345"` |
| `sentry_get_issue_events <org> <project> <id>` | Get event data | `sentry_get_issue_events "carefeed" "portal" "12345"` |
| `sentry_search_issues <org> <query>` | Search errors | `sentry_search_issues "carefeed" "DateTimeImmutable"` |
| `sentry_search_events <org> <query>` | Search event data | `sentry_search_events "carefeed" "error"` |
| `sentry_list_orgs` | List organizations | `sentry_list_orgs` |
| `sentry_list_projects <org>` | List projects | `sentry_list_projects "carefeed"` |
| `sentry_list_issues <org> <project> [query]` | List issues with filter | `sentry_list_issues "carefeed" "portal" "is:unresolved"` |

**Typical workflow:**
1. Start with `sentry_list_production_issues` for overview
2. Use `sentry_get_issue` for specific error details
3. Correlate with Datadog logs for full context

---

## Datadog Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `datadog_search_logs <query> [time]` | Search logs | `datadog_search_logs "status:error service:/ecs/portal_dev" "1h"` |
| `datadog_search_logs_chunked <query> <time> [chunk_mins]` | Paginated search | `datadog_search_logs_chunked "service:/ecs/portal_dev" "6h" 30` |
| `datadog_collect_logs_bulk <query> <time>` | Bulk collection | `datadog_collect_logs_bulk "service:/ecs/portal_dev" "3h"` |
| `datadog_search_traces <query> [time]` | Search traces | `datadog_search_traces "service:portal" "1h"` |
| `datadog_list_monitors` | List monitors | `datadog_list_monitors` |
| `datadog_get_monitor <id>` | Get monitor details | `datadog_get_monitor "12345"` |
| `datadog_get_metrics <query>` | Query metrics | `datadog_get_metrics "avg:system.cpu{*}"` |
| `datadog_validate` | Test API connection | `datadog_validate` |

**Time format options:** `15m`, `1h`, `3h`, `6h`, `12h`, `1d`, `2d`, `7d`

**Common log queries:**
- `status:error service:/ecs/portal_dev` - Portal errors
- `status:error (service:/ecs/portal_dev OR service:/ecs/jobrunner)` - Multiple services
- `service:/ecs/jobrunner "DateTimeImmutable"` - Specific error pattern
- `service:/ecs/api @http.status_code:>=500` - API errors

**Dashboard functions:**
- `datadog_list_dashboards` - List all dashboards
- `datadog_search_dashboards <query>` - Search dashboards
- `datadog_get_dashboard <id>` - Get dashboard config
- `datadog_create_dashboard <config>` - Create dashboard
- `datadog_update_dashboard <id> <config>` - Update dashboard
- `datadog_delete_dashboard <id>` - Delete dashboard
- `datadog_export_dashboard <id>` - Export dashboard JSON

---

## AWS Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `aws_exec <profile> <command...>` | Run AWS CLI (auto-login) | `aws_exec "prod-developers" s3 ls` |
| `aws_status` | Check auth across all profiles | `aws_status` |
| `aws_login` | Login to SSO (all profiles) | `aws_login` |
| `aws_whoami <profile>` | Show identity for profile | `aws_whoami "prod-developers"` |
| `aws_is_authenticated <profile>` | Check if profile authenticated | `aws_is_authenticated "prod-developers"` |
| `aws_list_profiles` | List available profiles | `aws_list_profiles` |
| `aws_select_profile` | Interactive profile selector | `aws_select_profile` |
| `aws_get_account_name <profile>` | Get account name | `aws_get_account_name "prod-developers"` |
| `aws_get_account_id <profile>` | Get account ID | `aws_get_account_id "prod-developers"` |

**Available profiles:**
- **Production (535508986415):** `prod-developers`, `prod-readonly`
- **Non-Production (635039533305):** `nonprod-developers`, `nonprod-readonly`
- **Shared Services (851765305742):** `shared-developers`, `shared-readonly`

**Key feature:** `aws_exec` automatically handles SSO login if session expired

---

## 1Password / Environment Variable Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `onepass_view_env <profile> <file>` | View env file | `onepass_view_env "nonprod-developers" "portal.env"` |
| `onepass_download_env <profile> <file>` | Download env file | `onepass_download_env "nonprod-developers" "portal.env"` |
| `onepass_check_env <profile> <file>` | Check metadata | `onepass_check_env "nonprod-developers" "portal.env"` |
| `onepass_list_env_files <profile>` | List all env files | `onepass_list_env_files "nonprod-developers"` |
| `onepass_deploy_env <profile> <config>` | Deploy single config | `onepass_deploy_env "nonprod-developers" "admin-portal-dev"` |
| `onepass_deploy_all_dev` | Deploy all dev configs | `onepass_deploy_all_dev` |
| `onepass_deploy_all_prod` | Deploy prod (requires confirmation) | `onepass_deploy_all_prod` |

**How it works:**
1. Env vars stored in 1Password (Login entries with tags)
2. Lambda reads from 1Password → writes to S3
3. ECS containers load `.env` files from S3 at startup

**S3 buckets:**
- Dev/Staging: `cf-staging-env-files`
- Production: `cf-production-env-files`

---

## AWS Lambda Utilities

| Function | Purpose | Example |
|----------|---------|---------|
| `lambda_get_info <profile> <function>` | Get function info | `lambda_get_info "prod-developers" "1password-env-writer"` |
| `lambda_get_config <profile> <function>` | Get configuration | `lambda_get_config "prod-developers" "1password-env-writer"` |
| `lambda_get_code_location <profile> <function>` | Get S3 code location | `lambda_get_code_location "prod-developers" "my-function"` |
| `lambda_fetch_code <profile> <function>` | Download code from S3 | `lambda_fetch_code "prod-developers" "my-function"` |
| `lambda_download_code <profile> <function> <dest>` | Download to specific location | `lambda_download_code "prod-developers" "my-function" "/tmp/code.zip"` |
| `lambda_extract_code <zip_file> <dest>` | Extract downloaded code | `lambda_extract_code "/tmp/code.zip" "/tmp/lambda-code"` |

---

## Carefeed Helper Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `carefeed_branch_name <type> <key> <desc>` | Generate branch name | `carefeed_branch_name feature CORE-1234 "add auth"` |
| `carefeed_commit_message <key> <message>` | Generate commit message | `carefeed_commit_message CORE-1234 "implement feature"` |
| `carefeed_pr_description <key> [summary]` | Generate PR template | `carefeed_pr_description CORE-1234 "Summary"` |
| `get_branch_jira_key` | Extract Jira key from branch | `get_branch_jira_key` |
| `validate_jira_key <key>` | Validate Jira key format | `validate_jira_key CORE-1234` |
| `extract_jira_key <text>` | Extract key from text | `extract_jira_key "feature/CORE-1234-desc"` |
| `jira_ticket_url <key>` | Generate Jira URL | `jira_ticket_url CORE-1234` |
| `get_jira_projects` | Get valid projects for repo | `get_jira_projects` |
| `is_carefeed_project` | Check if in Carefeed repo | `is_carefeed_project` |
| `infer_jira_project <desc>` | Infer project from text | `infer_jira_project "fix yardi sync"` → `INT` |
| `infer_jira_type <desc>` | Infer issue type | `infer_jira_type "bug fix error"` → `Bug` |
| `infer_jira_priority <desc>` | Infer priority | `infer_jira_priority "critical production"` → `P0` |
| `get_current_sprint [project]` | Get active sprint | `get_current_sprint CORE` |
| `show_carefeed_conventions` | Display conventions help | `show_carefeed_conventions` |

**Branch types:** `feature`, `bugfix`, `hotfix`, `chore`

**Jira projects:**
- `CORE` - Core platform features
- `INT` - Integrations (PCC, Yardi, Collain, etc.)
- `PAYM` - Payments functionality
- `APP` - Chat app/mobile app
- `PORTAL` - Portal-specific items

---

## Notification Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `notify_user <task> <status> <duration> <details>` | Smart notification (Slack → macOS fallback) | `notify_user "Build" "complete" "5m 32s" "All tests passed"` |
| `slack_notify_completion <task> <status> <duration> <details>` | Formatted Slack completion | `slack_notify_completion "Tests" "passed" "2m 15s" "142 tests"` |
| `slack_notify_progress <task> <progress> <step> <time>` | Progress update | `slack_notify_progress "Build" "50%" "Running tests" "2m elapsed"` |
| `macos_notify <title> <message>` | Native macOS notification | `macos_notify "Build Complete" "All tests passed"` |

**When to use:**
- Tasks longer than 5 minutes
- User explicitly requests ("notify me when done", "ping me when ready")
- Critical errors during long operations

---

## Utility Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `integration_status` | Show all integration statuses | `integration_status` |
| `parse_time_to_unix <timeframe>` | Convert time to Unix timestamp | `parse_time_to_unix "1h"` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"No such function"** | Run `source ~/.claude/lib/integrations.sh` first |
| **"Authentication failed"** | Check `~/.claude/credentials/.env` has token for service |
| **"Can't find channel"** | Use `slack_find_channel <name>` to get channel ID |
| **"Should I open browser?"** | **NO!** Always check git remote and use `bitbucket_create_pr` or `github_create_pr` |
| **"Slack not working"** | Check if trying to send DM (needs im:write scope). Use channels or macOS fallback |
| **"AWS authentication failed"** | Run `aws_login` to refresh SSO session |
| **"Rate limit exceeded"** | Wait for rate limit reset or use different time range/query |

---

## Common Workflows

### Create PR Workflow
```bash
# 1. Detect git hosting service
origin=$(git remote get-url origin)

# 2. Get Jira key from branch
jira_key=$(get_branch_jira_key)

# 3. Generate PR description
description=$(carefeed_pr_description "$jira_key" "Summary text")

# 4. Create PR on correct service
if [[ "$origin" =~ "bitbucket" ]]; then
    bitbucket_create_pr "$(git rev-parse --abbrev-ref HEAD)" "master" "Title" "$description"
else
    github_create_pr "$(git rev-parse --abbrev-ref HEAD)" "main" "Title" "$description"
fi
```

### Debug Production Error Workflow
```bash
# 1. Check Sentry for errors
sentry_list_production_issues

# 2. Get specific error details
sentry_get_issue "carefeed" "portal" "12345"

# 3. Correlate with Datadog logs
datadog_search_logs "status:error service:/ecs/portal_dev" "1h"

# 4. Get bulk logs if needed
datadog_collect_logs_bulk "service:/ecs/portal_dev" "3h"
```

### Deploy Environment Variables
```bash
# 1. Check current env
onepass_view_env "nonprod-developers" "portal.env" | grep SENTRY_DSN

# 2. Deploy updates
onepass_deploy_all_dev  # No confirmation for dev

# 3. For production (requires confirmation)
onepass_deploy_all_prod
```

---

## Integration Loading Status

To verify integrations are loaded:

```bash
# Check if integrations.sh is sourced
declare -F | grep -c "bitbucket_\|jira_\|slack_"
# Should show 27+ functions

# Check specific service availability
declare -F bitbucket_create_pr
declare -F jira_create_issue
declare -F slack_get_channel_messages

# Full integration status
integration_status
```

---

**Last Updated:** 2025-10-20
