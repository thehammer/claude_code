# Sync Permissions Up: Project → Global

**Version:** 1.0
**Created:** 2025-10-24
**Category:** Permissions Management

## Goal

Extract new permissions from project-local `<project>/.claude/settings.local.json` that were added during the session and consolidate them back into global `~/.claude/settings.json`, promoting useful patterns to be available across all projects.

## Why This Exists

**Problem:** During a session, Claude may request new permissions that get added to project-local settings via "don't ask again". These permissions:
- Remain isolated to that project
- Don't benefit other projects where they'd be useful
- Accumulate as bloat in project files
- Cause fragmentation of permission management

**Solution:** At session end, review new project permissions, identify which should be promoted to global, consolidate them intelligently, and update global settings.

## Prerequisites

- Global settings file exists: `~/.claude/settings.json`
- Project has local settings: `.claude/settings.local.json`
- Session start created backup: `.claude/settings.local.json.session-start` (optional but helpful)
- Working directory is project root

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Project path | Yes | Current working directory (from `pwd`) |
| Global settings | Yes | `~/.claude/settings.json` |
| Project settings | Yes | `.claude/settings.local.json` |
| Session start backup | No | `.claude/settings.local.json.session-start` (to identify new permissions) |

## Steps

### 1. Identify New Permissions

**If session start backup exists:**
```bash
# Compare current vs session start to find NEW permissions
CURRENT_ALLOW=$(jq -r '.permissions.allow[]' .claude/settings.local.json | sort)
START_ALLOW=$(jq -r '.permissions.allow[]' .claude/settings.local.json.session-start | sort)

# New permissions = current - start
NEW_ALLOW=$(comm -13 <(echo "$START_ALLOW") <(echo "$CURRENT_ALLOW"))
```

**If no backup (manual sync):**
```bash
# Find project-only permissions (not in global)
PROJECT_ALLOW=$(jq -r '.permissions.allow[]' .claude/settings.local.json | sort)
GLOBAL_ALLOW=$(jq -r '.permissions.allow[]' ~/.claude/settings.json | sort)

# Project-only = project - global
PROJECT_ONLY=$(comm -13 <(echo "$GLOBAL_ALLOW") <(echo "$PROJECT_ALLOW"))
```

### 2. Categorize New Permissions

**Auto-promote (obviously useful everywhere):**
- Generic tool wildcards: `Read(**)`, `Write(**)`, `Bash(*)`
- Common operations: `Bash(git:*)`, `Bash(npm:*)`, `Bash(docker:*)`
- Safe read operations: `Read(/any/path/**)`

**Review with user (project-specific or potentially unsafe):**
- Specific file writes: `Write(/Users/hammer/Code/project/**)`
- Remote operations: `Bash(git push:*)`, `Bash(gh pr create:*)`
- Destructive operations: `Bash(rm:*)`, `Bash(docker system prune:*)`
- Project tools: `Bash(php artisan:*)`, `Bash(herd:*)`

**Never promote (project-only context):**
- Absolute project paths: `Read(//Users/hammer/Code/this-project/**)`
- Project-specific commands with hardcoded values
- One-off commands with full heredocs/embedded data

### 3. Present Promotable Permissions

```
📋 New permissions added during session: 8

Auto-promoting to global (obviously useful): 3
  ✅ Bash(gh pr view:*)
  ✅ Bash(curl:*)
  ✅ Read(/private/tmp/**)

Review for global promotion: 5

1. Bash(php artisan:*)
   Context: Laravel/Carefeed projects
   Promote? [y/n/skip]:

2. Bash(herd:*)
   Context: Laravel Herd (local dev)
   Promote? [y/n/skip]:

3. Write(/Users/hammer/Code/portal_dev/.env)
   Context: Project-specific env file
   Promote? [n/skip]: n ← automatically suggest 'n'

4. Bash(git push origin feature/CORE-3982:*)
   Context: One-off command with specific branch
   Promote? [n/skip]: n ← automatically suggest 'n'

5. Bash(bitbucket_create_pr:*)
   Context: Bitbucket helper function
   Promote? [y/n/skip]: y

---

Summary:
✅ Promoting: 5 patterns
⏭️  Skipping: 2 patterns (project-specific)
❌ Rejecting: 1 pattern (one-off command)
```

### 4. Smart Consolidation for Global

Before adding to global, check if new patterns are absorbed by existing wildcards:

```bash
# Example: Don't add Bash(git add:*) if Bash(*) exists
# Example: Don't add Write(/tmp/**) if Write(**) exists

for pattern in $PROMOTABLE; do
    if absorbed_by_existing_global_wildcard "$pattern"; then
        echo "⏭️  Skipped: $pattern (absorbed by existing global wildcard)"
    else
        ADD_TO_GLOBAL+=("$pattern")
    fi
done
```

### 5. Handle Deny and Ask Arrays

**New project `deny` patterns:**
```
⚠️  Project added deny: Bash(rm -rf /critical/path:*)

This is a safety measure. Should it be global?
Options:
1. Promote to global (protect all projects)
2. Keep project-only (specific to this project)

Choice? [1/2]:
```

**New project `ask` patterns:**
```
ℹ️  Project added ask: Bash(git push:*)

This adds confirmation for git push in this project.
Options:
1. Promote to global (ask everywhere)
2. Keep project-only (only cautious in this project)
3. Ignore (global already allows via Bash(*))

Choice? [1/2/3]:
```

### 6. Update Global Settings

```bash
# Backup global settings
cp ~/.claude/settings.json ~/.claude/settings.json.backup

# Merge promoted patterns into global
jq --argjson new "$PROMOTED_ALLOW" \
   '.permissions.allow += $new | .permissions.allow |= unique | sort' \
   ~/.claude/settings.json > ~/.claude/settings.json.tmp

mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

### 7. Clean Up Project Settings

After promoting patterns to global, optionally simplify project settings:

```
🧹 Project settings can be simplified

Current project allow: 47 patterns
After removing promoted: 12 patterns (73% reduction)

Simplify project settings? [y/n]: y

✅ Removed 35 patterns now covered by global
✅ Project settings simplified
```

### 8. Report Results

```
✅ Permission sync complete (project → global)

Global changes:
  + 5 new allow patterns
  + 1 new deny pattern
  + 0 new ask patterns

Project cleanup:
  - Removed 35 patterns (now in global)
  - 12 project-specific patterns remain

Backups saved:
  - ~/.claude/settings.json.backup
  - .claude/settings.local.json.backup

Next session: Global permissions available everywhere!
```

## Pattern Categorization Logic

### Auto-Promote (No User Input)

```
Generic Wildcards:
- Read(**), Write(**), Edit(**), Glob(**), Grep(**)
- Bash(*), WebSearch(**), WebFetch(**)

Common Development Tools:
- Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(node:*)
- Bash(docker:*), Bash(curl:*), Bash(jq:*)

Safe Operations:
- Read(/tmp/**), Read(/private/tmp/**)
- Bash(command -v:*), Bash(which:*)
```

### Review Required

```
Project-Specific Tools:
- Bash(php:*), Bash(artisan:*), Bash(composer:*)
- Bash(python3:*), Bash(pip:*)
- Bash(cargo:*), Bash(go:*)

Integration Helpers:
- Bash(bitbucket_*:*), Bash(jira_*:*), Bash(slack_*:*)

Remote/Dangerous Operations:
- Bash(git push:*), Bash(rm:*)
- Bash(ssh:*), Bash(scp:*)
```

### Never Promote (Auto-Skip)

```
Absolute Project Paths:
- Read(//Users/hammer/Code/specific-project/**)
- Write(/Users/hammer/Code/specific-project/.env)

One-Off Commands:
- Commands with heredocs (<<EOF)
- Commands with specific branch/file names
- Commands with embedded credentials or data

Over-Specific Patterns:
- Bash(git commit -m "exact message here":*)
- Bash(specific command with 10 args:*)
```

## Expected Output

### Example: Carefeed Project Session

**New patterns in project after session:**
```json
"allow": [
  "Bash(php artisan:*)",           ← Laravel tool
  "Bash(herd:*)",                  ← Local dev tool
  "Bash(composer:*)",              ← PHP dependency manager
  "Bash(bitbucket_create_pr:*)",  ← Helper function
  "Write(/Users/hammer/Code/portal_dev/.env)",  ← Project file
  "Bash(git push origin feature/CORE-3982:*)"   ← One-off command
]
```

**Promotion decisions:**
```
✅ Bash(php artisan:*)          → Yes (useful for all Carefeed projects)
✅ Bash(herd:*)                 → Yes (useful for all Laravel projects)
✅ Bash(composer:*)             → Yes (useful for all PHP projects)
✅ Bash(bitbucket_create_pr:*)  → Yes (helper function, already in pattern)
⏭️  Write(//Users/hammer/Code/portal_dev/.env) → Skip (project-specific path)
⏭️  Bash(git push origin feature/CORE-3982:*) → Skip (one-off command)
```

**Result in global:**
```json
"allow": [
  "Bash(*)",                     ← Already exists, absorbs php/herd/composer
  "Bash(bitbucket_*:*)",        ← Already exists, absorbs bitbucket_create_pr
  ...existing patterns...
]
```

**No changes needed!** New patterns already absorbed by existing global wildcards.

## Error Handling

**Missing global settings:**
```
❌ Error: ~/.claude/settings.json not found
Cannot sync without global settings file.
```
→ Exit recipe, report error

**No new permissions:**
```
ℹ️  No new permissions added during session
Project settings unchanged from session start.
Nothing to sync up.
```
→ Exit recipe early (success, no work needed)

**Invalid JSON after edit:**
```
❌ Error: Updated global settings contains invalid JSON
Restoring backup: mv ~/.claude/settings.json.backup ~/.claude/settings.json

Please report this issue!
```
→ Auto-restore backup, report problem

**User interrupts review:**
```
⚠️  Sync interrupted by user
Completed: 3/8 patterns reviewed
Nothing changed yet (changes applied after review completes)

Resume sync? [y/n]:
```

## Related Recipes

- **[Sync Permissions Down](sync-down-global-to-project.md)** - Opposite direction (global → project)
- **[Audit All Project Permissions](audit-all-projects.md)** - Review permissions across all projects
- **[Clean Project Settings](clean-project-settings.md)** - Remove redundant project permissions

## Notes

### Session Start Backup

The sync-down recipe should create `.claude/settings.local.json.session-start` backup:
```bash
# In SESSION_START.md, before running sync-down recipe
cp .claude/settings.local.json .claude/settings.local.json.session-start
```

This allows sync-up to identify **only new** permissions, not review all project permissions.

### Consolidation Benefits

By promoting useful patterns to global:
- ✅ Fewer permission prompts across projects
- ✅ Simpler project settings files
- ✅ Single source of truth for common operations
- ✅ Easier permission management

### When NOT to Promote

Keep in project-only if:
- Project-specific tooling (only used in this project)
- Security boundaries (personal vs work projects)
- Experimental permissions (testing, not ready for global)
- One-off operations (specific command, won't repeat)

### Interactive vs Automatic

**For coding sessions:** Present full review (user is actively working)
**For automated/CI:** Use auto-promote only, skip review questions
**For clauding sessions:** Full review with explanations (meta-improvement context)

## Examples

### Example 1: Promoting Integration Helper

**New pattern:** `Bash(sentry_list_issues:*)`

**Review:**
```
Bash(sentry_list_issues:*)
Context: Sentry integration helper
Used in: Debugging session

Global already has: Bash(sentry_*:*)

Decision: Already absorbed by existing wildcard
Action: Skip (no global change needed)
```

### Example 2: Promoting New Tool

**New pattern:** `Bash(kubectl:*)`

**Review:**
```
Bash(kubectl:*)
Context: Kubernetes CLI tool
Used in: Deployment tasks

Not in global settings.

Promote to global? [y/n]: y
✅ Adding Bash(kubectl:*) to global settings
```

### Example 3: Rejecting One-Off Command

**New pattern:** `Bash(git commit -m "$(cat <<'EOF'\nfix(tsconfig): disable allowImportingTsExtensions...\nEOF\n)":*)`

**Review:**
```
Bash(git commit -m "$(cat <<'EOF'...618 lines...EOF\n)":*)
Context: Specific commit with full message

This is a one-off command with embedded data.
Should NOT be promoted to global.

Action: Auto-skip (one-off pattern)
```

## Version History

- **v1.0** (2025-10-24): Initial recipe for sync-up operation

---

**Meta Notes:**
This recipe completes the bidirectional sync system:
- Sync-down: Ensures projects have global baseline
- Sync-up: Promotes useful project patterns to global

Together, they maintain permission harmony across all projects!
