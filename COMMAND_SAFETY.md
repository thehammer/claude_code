# Command Safety Policy

This document categorizes commands by their safety level and defines which operations require explicit approval.

## Safety Categories

### 🟢 GREEN: Local Read-Only Operations
**Can be pre-approved** - No changes to local or remote systems

**Examples:**
- `git status`, `git log`, `git diff`
- `cat`, `grep`, `find`, `ls`
- `Read` tool for any file
- `Glob`, `Grep` tools
- API read operations: `sentry_list_issues`, `sentry_get_issue`, `datadog_search_logs`, `datadog_list_monitors`
- `bitbucket_list_prs`, `jira_search`, `confluence_search`
- `source ~/.claude/lib/integrations.sh` (just loads functions)
- `php artisan --help`, `composer show`
- Database read queries: `SELECT` statements

**Pre-approval pattern:**
- These should all use wildcards: `git log:*`, `sentry_list_issues:*`, etc.
- Safe to approve once and forget

---

### 🟡 YELLOW: Local Write Operations
**Can be pre-approved with caution** - Changes local files but not remote systems

**Examples:**
- `Edit`, `Write`, `NotebookEdit` tools
- `git add`, `git commit`, `git checkout`, `git branch`
- `mkdir`, `chmod`, `mv` (local files)
- `composer install`, `composer require`
- `php artisan migrate` (local/test database only)
- `npm install`, `pip install`
- Test database operations: `php artisan db:rebuild`

**Pre-approval pattern:**
- Can be pre-approved: `git add:*`, `git commit:*`, `composer install:*`
- Generally safe since changes are local
- Can be reverted with git

**Exceptions requiring approval:**
- Operations on production databases
- Changes to critical config files
- Destructive operations: `rm -rf`, `DROP TABLE`, etc.

---

### 🟠 ORANGE: Remote Read + Local Write
**Requires confirmation** - Reads from remote and modifies local state

**Examples:**
- `git pull` - Fetches from remote and merges into local branch
- `git fetch` - Updates local tracking branches
- `git clone` - Creates new local repository
- `composer update` - Downloads and updates packages
- `npm update` - Downloads and updates packages

**Policy:**
- SHOULD require confirmation each time
- Or pre-approve with clear understanding of what's being pulled

**Rationale:**
- Could introduce unexpected changes to local codebase
- Important to know when external code is being pulled in

---

### 🔴 RED: Remote Write Operations
**ALWAYS requires explicit confirmation** - Modifies remote/external systems

**NEVER pre-approve these patterns!**

#### Git Remote Operations
- `git push` - Modifies remote repository
- `git push --force` - Destructive remote modification
- `git tag -d` + `git push origin :refs/tags/...` - Deletes remote tags

**Exception:** `git push:*` might be acceptable for established workflows, but should show what's being pushed first.

#### API Write Operations
- `bitbucket_create_pr` - Creates pull request
- `jira_create_issue` - Creates Jira ticket
- `jira_update_issue` - Modifies Jira ticket
- `confluence_create_page` - Creates Confluence page
- `confluence_update_page` - Modifies Confluence page
- `slack_post_message` - Posts to Slack channel

**Policy:**
- MUST show user what will be created/modified BEFORE executing
- MUST wait for explicit confirmation
- SHOULD include a summary of the action in the prompt

#### Production Operations
- Database operations on production DB
- Deployment commands: `deploy`, `release`, etc.
- Infrastructure changes: AWS, GCP, Azure commands
- Service restarts in production

**Policy:**
- NEVER auto-execute
- ALWAYS require confirmation
- SHOULD require typing "yes" or similar explicit action

---

## Implementation Strategy

### For Claude Code

**When executing commands, categorize first:**

1. **Green (Local Read):** Execute immediately if pre-approved
   ```bash
   # Can run without prompting if pattern approved
   git status
   sentry_list_issues "carefeed" "portal" "is:unresolved"
   datadog_search_logs "status:error" "1h"
   ```

2. **Yellow (Local Write):** Execute if pre-approved, otherwise prompt
   ```bash
   # Can run if pattern approved
   git add .
   git commit -m "message"
   ```

3. **Orange (Remote Read):** Inform user and execute
   ```bash
   # Tell user what you're doing
   "I'm going to pull the latest changes from origin..."
   git pull
   ```

4. **Red (Remote Write):** ALWAYS inform and confirm
   ```bash
   # MUST show what will happen and wait for confirmation
   "I'm about to push these commits to origin/master:"
   [show commits]
   "Proceed? (yes/no)"
   # Only execute after explicit approval
   git push origin master
   ```

### Example: Creating a Pull Request

**WRONG (auto-execute):**
```bash
bitbucket_create_pr "portal_dev" "master" "hammer/feature" "Add new feature" "Description..."
```

**RIGHT (inform and confirm):**
```
I'll create a pull request with these details:

**Repository:** portal_dev
**Source:** hammer/feature
**Destination:** master
**Title:** Add new feature
**Description:**
- Implemented X
- Fixed Y
- Added tests

**Commits included:**
- abc123 Implement feature X
- def456 Add tests for X

This will create a DRAFT pull request that you can review before publishing.

Proceed with creating this PR? (yes/no)
```

### Example: Posting to Slack

**WRONG (auto-execute):**
```bash
slack_post_message "#deployments" "Deployed v1.2.3 to production"
```

**RIGHT (inform and confirm):**
```
I'll post this message to #deployments:

---
📦 Deployed v1.2.3 to production

Changes:
- Fixed authentication bug (CORE-1234)
- Updated dependencies
- Performance improvements

See PR #3846 for details.
---

This will be visible to the entire #deployments channel.

Proceed with posting? (yes/no)
```

---

## Command Pattern Approval Guide

### Recommended Pre-Approvals

Add these to your IDE settings or approve interactively with "Yes, and don't ask again":

#### Safe Read Operations (Green)
```
source:*
git status:*
git log:*
git diff:*
git branch:*
cat:*
grep:*
find:*
ls:*
sentry_list_issues:*
sentry_get_issue:*
sentry_search_issues:*
datadog_search_logs:*
datadog_list_monitors:*
datadog_get_monitor:*
bitbucket_list_prs:*
jira_search:*
confluence_search:*
python3:*
php:*
composer show:*
```

#### Safe Local Write Operations (Yellow)
```
git add:*
git commit:*
git checkout:*
git branch:*
mkdir:*
chmod:*
composer install:*
npm install:*
php artisan test:*
```

### NEVER Pre-Approve (Red)

These should ALWAYS require confirmation:
```
# DO NOT ADD THESE TO PRE-APPROVED LIST:
git push:*
bitbucket_create_pr:*
bitbucket_merge_pr:*
jira_create_issue:*
jira_update_issue:*
confluence_create_page:*
confluence_update_page:*
slack_post_message:*
```

---

## Workflow: Reviewing Claude's Actions

### Before Approving a Command

Ask yourself:
1. ✅ **What does this command do?** (read the command)
2. ✅ **What will it change?** (local vs remote)
3. ✅ **Can I undo it?** (git revert, delete, etc.)
4. ✅ **Is this what I wanted?** (matches my request)

### Red Flags

⚠️ **Stop and review carefully if you see:**
- Commands with `--force` or `-f` flags
- Commands that modify production systems
- Commands posting to public channels
- Commands creating external records (tickets, pages)
- Commands with credentials in arguments
- Complex piped commands you don't understand

---

## Integration Helper Function Safety

When creating helper functions in `~/.claude/lib/integrations.sh`, follow these conventions:

### Naming Convention

```bash
# Read operations: Use _list, _get, _search prefix
sentry_list_issues()    # GREEN - read only
sentry_get_issue()      # GREEN - read only
sentry_search_issues()  # GREEN - read only

# Write operations: Use _create, _update, _delete prefix
sentry_create_issue()   # RED - writes to remote
sentry_update_issue()   # RED - writes to remote
sentry_delete_issue()   # RED - writes to remote (destructive!)
```

### Function Documentation

```bash
# GREEN: Safe read operation
# Can be pre-approved
sentry_list_issues() {
    # Lists issues from Sentry (read-only)
    local org=$1
    local project=$2
    # ... implementation
}

# RED: Remote write operation
# REQUIRES confirmation before execution
sentry_create_issue() {
    # Creates a new issue in Sentry (REMOTE WRITE)
    echo "⚠️  WARNING: This will create an issue in Sentry"
    echo "   Organization: $1"
    echo "   Project: $2"
    echo "   Title: $3"
    echo ""
    read -p "Proceed? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        return 1
    fi
    # ... implementation
}
```

---

## Special Cases

### Database Operations

**Local/Test Database (Yellow):**
```bash
php artisan migrate              # Local DB - can be pre-approved
php artisan db:rebuild          # Test DB - can be pre-approved
mysql -u test -p test_db        # Test DB - can be pre-approved
```

**Production Database (Red):**
```bash
php artisan migrate --env=production    # NEVER auto-approve
mysql -u prod -p production_db          # NEVER auto-approve
```

### Git Operations

**Safe Local (Yellow):**
```bash
git commit                      # Yellow - local only
git branch -D feature           # Yellow - local only
git reset --hard                # Yellow - local only (but destructive!)
```

**Remote Changing (Red):**
```bash
git push                        # Red - modifies remote
git push --force               # Red - DANGEROUS, modifies remote
git push --delete origin branch # Red - DANGEROUS, deletes remote branch
```

---

## Summary

| Category | Color | Pre-Approve? | Examples |
|----------|-------|--------------|----------|
| Local Read | 🟢 Green | ✅ Yes | git status, sentry_list_issues, datadog_search_logs |
| Local Write | 🟡 Yellow | ✅ Yes (with caution) | git commit, Edit tool, composer install |
| Remote Read | 🟠 Orange | ⚠️ Maybe | git pull, composer update |
| Remote Write | 🔴 Red | ❌ NEVER | git push, create PR, post to Slack |

**Golden Rule:** If it modifies anything outside this computer, require explicit confirmation every time.

---

**Last Updated:** 2025-10-10
