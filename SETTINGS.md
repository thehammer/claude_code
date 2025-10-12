# Claude Code Settings Configuration

This document explains how to configure Claude Code settings for persistent permissions and other behaviors.

## Settings File Locations

Claude Code uses a cascading settings system:

### Global Settings
**Location:** `~/.claude/settings.json`

Applies to all projects and all Claude Code sessions. Use this for:
- Permission patterns that should always be allowed/denied
- Global preferences and defaults
- User-wide configuration

### Project Settings
**Location:** `.claude/settings.json` or `.claude/settings.local.json`

Applies only to the current project. Use this for:
- Project-specific permissions
- Team-shared settings (`.claude/settings.json` - commit to git)
- Personal project overrides (`.claude/settings.local.json` - add to .gitignore)

### Resolution Order
When Claude Code needs to check permissions, it looks in this order:
1. Project `.claude/settings.local.json` (personal overrides)
2. Project `.claude/settings.json` (team settings)
3. Global `~/.claude/settings.json` (user defaults)

Later files override earlier ones for the same permission pattern.

---

## Permissions Configuration

The `permissions` object has three arrays:

```json
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Read(//**)"
    ],
    "deny": [
      "Bash(rm -rf:*)"
    ],
    "ask": [
      "Bash(git push:*)"
    ]
  }
}
```

### `allow` Array
Operations that Claude can perform **without asking**. Use for:
- ✅ Safe read operations (Read, Glob, Grep)
- ✅ Local status checks (git status, docker ps)
- ✅ Local writes (Edit, Write, git commit)
- ✅ Test operations (running tests)
- ✅ Non-destructive commands

**Examples:**
- `"Read(//**)"` - Allow reading any file
- `"Bash(git status:*)"` - Allow all git status commands
- `"Bash(source:*)"` - Allow sourcing scripts
- `"Edit(**)"` - Allow editing any file
- `"Bash(php artisan test:*)"` - Allow running tests

### `deny` Array
Operations that Claude **can never perform**. Use for:
- ❌ Destructive operations (rm -rf, DROP DATABASE)
- ❌ Dangerous commands you never want automated
- ❌ Commands that should require manual execution

**Examples:**
- `"Bash(rm -rf:*)"` - Never allow recursive force delete
- `"Bash(git push --force:*)"` - Never allow force push
- `"Bash(sudo rm:*)"` - Never allow sudo rm

### `ask` Array
Operations that **always require confirmation**. Use for:
- ⚠️ Remote-changing operations (git push, creating PRs)
- ⚠️ Commands you want to review first
- ⚠️ Potentially risky but sometimes needed operations

**Examples:**
- `"Bash(git push:*)"` - Always confirm before pushing
- `"Bash(gh pr create:*)"` - Always confirm before creating PR
- `"Bash(composer update:*)"` - Always confirm before updating deps

---

## Pattern Matching

Permissions use glob-style pattern matching:

### Tool Patterns
```json
"Read(//**)"              // Allow reading any file anywhere
"Read(//Users/hammer/**)" // Allow reading files under /Users/hammer
"Edit(**)"                // Allow editing any file in workspace
"Glob(**)"                // Allow all glob operations
"Grep(**)"                // Allow all grep operations
```

### Bash Command Patterns
```json
"Bash(git status:*)"      // Match "git status" with any arguments
"Bash(git:*)"             // Match any git command
"Bash(php artisan test:*)"// Match php artisan test with any args
"Bash(source:*)"          // Match sourcing any script
"Bash(bitbucket_*:*)"     // Match any function starting with bitbucket_
```

### Wildcards
- `*` - Matches anything within a path segment
- `**` - Matches anything including path separators
- `:*` - Matches any arguments after the command

---

## Current Global Configuration

The global `~/.claude/settings.json` file includes:

### Always Allowed (Green/Yellow Operations)
- **File Operations:** Read, Glob, Grep, Edit, Write
- **Basic Commands:** ls, cd, pwd, cat, head, tail, echo, find, grep, etc.
- **Git Local:** status, diff, log, add, commit, stash, checkout, etc.
- **Git Remote Reads:** pull, fetch, merge (safe to auto-approve)
- **Development:** composer, php, artisan, phpunit, rector
- **Integration Helpers:** All bitbucket_*, confluence_*, jira_*, datadog_*, sentry_*, slack_* functions
- **Package Managers:** npm, pip, brew (read operations)
- **Utilities:** docker, curl, wget, jq, python, node

### Always Ask (Red Operations)
- **Remote Writes:** git push, gh pr create, gh pr merge
- **Destructive:** rm, rmdir, dangerous mv operations
- **Privileged:** sudo, su

### Never Allowed (Black Operations)
- Currently empty - add patterns here for things you never want Claude to do

---

## How Interactive Approvals Work

When you click "Yes, and don't ask again" in the UI:
- Claude Code adds the pattern to the appropriate settings file
- The approval persists across sessions
- Future similar operations won't prompt

**Which file gets updated:**
- If you're in a project, it updates `.claude/settings.local.json`
- If no project is open, it updates global `~/.claude/settings.json`

---

## Best Practices

### 1. Start with Global Allow List
Put common safe operations in `~/.claude/settings.json`:
```json
{
  "permissions": {
    "allow": [
      "Read(//**)",
      "Bash(git status:*)",
      "Bash(source:*)",
      "Edit(**)"
    ]
  }
}
```

### 2. Always Ask for Remote Changes
Keep remote-changing operations in the `ask` array:
```json
{
  "permissions": {
    "ask": [
      "Bash(git push:*)",
      "Bash(gh pr create:*)"
    ]
  }
}
```

### 3. Project-Specific Overrides
Use project `.claude/settings.local.json` for specific needs:
```json
{
  "permissions": {
    "allow": [
      "Bash(php artisan db:rebuild:*)"
    ]
  }
}
```

### 4. Never Auto-Approve Destructive Operations
Keep these in `ask` or `deny`:
- `rm -rf`
- `DROP DATABASE`
- `git push --force`
- Production deployments
- Anything that deletes data

### 5. Review Periodically
Check `~/.claude/settings.json` occasionally:
- Remove patterns you no longer use
- Tighten patterns that are too broad
- Add new patterns for common operations

---

## Troubleshooting

### Still Getting Permission Prompts

**Check pattern matches:**
```bash
# If you're seeing prompts for: git status --short
# Your pattern needs to match the full command:
"Bash(git status:*)"  # ✅ Matches "git status --short"
"Bash(git status)"    # ❌ Doesn't match (no wildcard)
```

**Check file location:**
```bash
# View your global settings:
cat ~/.claude/settings.json

# View project settings:
cat .claude/settings.json
cat .claude/settings.local.json
```

**Check for conflicts:**
- `deny` overrides `allow`
- More specific patterns override general ones
- Project settings override global settings

### Permission Not Working

**Restart VS Code:**
Settings changes may require restarting the IDE.

**Check JSON syntax:**
```bash
# Validate JSON:
jq . ~/.claude/settings.json
```

**Check pattern format:**
```json
// ✅ Correct:
"Bash(git status:*)"

// ❌ Wrong:
"git status:*"        // Missing Bash() wrapper
"Bash(git status*)"   // Missing colon before wildcard
```

---

## Integration with Helper Functions

All integration helper functions are pre-approved in the global settings:

```json
{
  "permissions": {
    "allow": [
      "Bash(source:*)",          // Loading integration scripts
      "Bash(bitbucket_*:*)",     // All Bitbucket helpers
      "Bash(confluence_*:*)",    // All Confluence helpers
      "Bash(jira_*:*)",          // All Jira helpers
      "Bash(datadog_*:*)",       // All Datadog helpers
      "Bash(sentry_*:*)",        // All Sentry helpers
      "Bash(slack_*:*)"          // All Slack helpers
    ]
  }
}
```

This means when you create new helper functions following the naming convention (e.g., `bitbucket_new_function`), they're automatically approved without needing to update permissions.

---

## Example: Complete Setup

**Global settings** (`~/.claude/settings.json`):
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read(//**)",
      "Glob(**)",
      "Grep(**)",
      "Edit(**)",
      "Write(**)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(source:*)",
      "Bash(ls:*)",
      "Bash(cat:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(gh pr create:*)"
    ],
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(git push --force:*)"
    ]
  }
}
```

**Project settings** (`.claude/settings.local.json`):
```json
{
  "permissions": {
    "allow": [
      "Bash(php artisan test:*)",
      "Bash(composer install:*)"
    ]
  }
}
```

---

## Additional Settings

The settings file supports many other options. See the [Claude Code documentation](https://docs.claude.com/en/docs/claude-code/settings) for complete details:

- `apiKeyHelper` - Custom authentication scripts
- `env` - Environment variables for sessions
- `hooks` - Custom commands before/after tool executions
- `statusLine` - Custom status bar display
- `model` - Override default model
- And more...

---

## See Also

- [PERMISSIONS.md](PERMISSIONS.md) - Permission recommendations and rationale
- [COMMAND_SAFETY.md](COMMAND_SAFETY.md) - Command safety categorization system
- [INTEGRATIONS.md](INTEGRATIONS.md) - External service integrations
- [Claude Code Settings Schema](https://json.schemastore.org/claude-code-settings.json)

---

**Last Updated:** 2025-10-11
