# Sync Permissions Down: Global → Project

**Version:** 1.0
**Created:** 2025-10-24
**Category:** Permissions Management

## Goal

Merge global permissions from `~/.claude/settings.json` into project-local `<project>/.claude/settings.local.json`, ensuring project sessions have access to all global permissions while preserving project-specific overrides.

## Why This Exists

**Problem:** Claude Code's permission cascade completely replaces global settings with project settings - they don't merge. This causes:
- Permission prompts for operations that are globally approved
- Fragmented permission management across projects
- Loss of context when working in project directories

**Solution:** At session start, intelligently merge global permissions into project settings, consolidating redundant patterns and maintaining both global baseline and project-specific needs.

## Prerequisites

- Global settings file exists: `~/.claude/settings.json`
- Project has local settings: `.claude/settings.local.json`
- Working directory is project root

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Project path | Yes | Current working directory (from `pwd`) |
| Global settings | Yes | `~/.claude/settings.json` |
| Project settings | Yes | `.claude/settings.local.json` |

## Steps

### 1. Read Both Settings Files

```bash
# Read global permissions
GLOBAL_ALLOW=$(jq -r '.permissions.allow[]' ~/.claude/settings.json)
GLOBAL_DENY=$(jq -r '.permissions.deny[]' ~/.claude/settings.json)
GLOBAL_ASK=$(jq -r '.permissions.ask[]' ~/.claude/settings.json)

# Read project permissions
PROJECT_ALLOW=$(jq -r '.permissions.allow[]' .claude/settings.local.json)
PROJECT_DENY=$(jq -r '.permissions.deny[]' .claude/settings.local.json)
PROJECT_ASK=$(jq -r '.permissions.ask[]' .claude/settings.local.json)
```

### 2. Combine and Deduplicate

**For `allow` array:**
- Combine global + project patterns
- Remove exact duplicates
- Apply smart consolidation (see Consolidation Rules below)

**For `deny` array:**
- Combine global + project patterns
- Keep all (safety first)
- Warn if project denies something global allows (conflict!)

**For `ask` array:**
- Combine global + project patterns
- Remove if absorbed by global `allow` wildcard
- Keep project-specific asks

### 3. Smart Consolidation

**Wildcard Absorption Rules:**
- `Write(**)` absorbs `Write(/path/**)`
- `Read(**)` absorbs `Read(/path/**)`
- `Bash(*)` absorbs `Bash(command:*)`
- `Edit(**)` absorbs `Edit(/path/**)`
- More specific patterns kept only if no wildcard exists

**Example:**
```
Before: ["Write(**)", "Write(//Users/hammer/.claude/**)", "Write(/tmp/**)"]
After:  ["Write(**)"]

Before: ["Bash(git:*)", "Bash(npm:*)", "Bash(docker:*)"]
After:  ["Bash(git:*)", "Bash(npm:*)", "Bash(docker:*)"]  # No wildcard, keep all
```

### 4. Handle Conflicts

**If project `deny` conflicts with global `allow`:**
```
⚠️  Conflict detected:
Global allows: Write(/Users/hammer/Code/**)
Project denies: Write(/Users/hammer/Code/project/secrets/**)

This is intentional project-level protection. Keeping project deny.
```
✅ Keep project deny (more specific wins)

**If project `ask` conflicts with global `allow`:**
```
⚠️  Pattern in project 'ask' but global 'allow':
- Bash(git push:*)

Options:
1. Trust global (remove from project ask)
2. Keep project override (more cautious in this project)

Choice? [1/2]:
```

### 5. Write Updated Settings

```bash
# Build merged JSON
jq --argjson allow "$MERGED_ALLOW" \
   --argjson deny "$MERGED_DENY" \
   --argjson ask "$MERGED_ASK" \
   '.permissions = {allow: $allow, deny: $deny, ask: $ask}' \
   .claude/settings.local.json > .claude/settings.local.json.tmp

# Backup original
cp .claude/settings.local.json .claude/settings.local.json.backup

# Apply update
mv .claude/settings.local.json.tmp .claude/settings.local.json
```

### 6. Report Changes

```
✅ Permission sync complete (global → project)

Summary:
- Allow patterns: 15 global + 8 project = 18 merged (5 consolidated)
- Deny patterns: 5 global + 0 project = 5 total
- Ask patterns: 9 global + 2 project = 11 total

Backup saved: .claude/settings.local.json.backup
```

## Consolidation Algorithm

**Pseudocode:**
```python
def consolidate_patterns(patterns):
    wildcards = [p for p in patterns if "(**)" in p or "(*)"]
    specific = [p for p in patterns if p not in wildcards]

    result = wildcards.copy()

    for pattern in specific:
        if not absorbed_by_wildcard(pattern, wildcards):
            result.append(pattern)

    return sorted(result, key=pattern_specificity)

def absorbed_by_wildcard(pattern, wildcards):
    # Write(//Users/hammer/.claude/**) absorbed by Write(**)
    # Bash(git add:*) absorbed by Bash(*)
    # Read(/specific/path) NOT absorbed by Read(**)

    tool = extract_tool(pattern)  # "Write", "Bash", etc.

    for wildcard in wildcards:
        if wildcard == f"{tool}(**)":
            return True
        if tool == "Bash" and wildcard == "Bash(*)":
            return True

    return False
```

## Expected Output

**Before:**
```json
{
  "permissions": {
    "allow": [
      "Read(//Users/hammer/.claude/**)",
      "Bash(source:*)",
      "Bash(git add:*)",
      "Bash(npm install:*)"
    ],
    "deny": [],
    "ask": []
  }
}
```

**After (with global Write(**), Bash(*), Edit(**):**
```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(**)",
      "Edit(**)",
      "Bash(*)",
      "Glob(**)",
      "Grep(**)",
      "WebSearch(**)",
      "WebFetch(**)"
    ],
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(git push --force:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(rm:*)"
    ]
  }
}
```

## Error Handling

**Missing global settings:**
```
❌ Error: ~/.claude/settings.json not found
Cannot sync permissions without global settings file.
```
→ Exit recipe, report error

**Missing project settings:**
```
ℹ️  No .claude/settings.local.json found
This is normal - project uses global settings only.
```
→ Skip sync (not needed)

**Invalid JSON:**
```
❌ Error: .claude/settings.local.json contains invalid JSON
Run: jq '.' .claude/settings.local.json
```
→ Exit recipe, show validation command

**Merge conflicts:**
```
⚠️  Unable to auto-resolve:
Project asks: Bash(git push:*)
Global allows: Bash(*)

Recommendation: Remove from project 'ask' to trust global settings.
Proceed? [y/n]:
```
→ Ask user for resolution

## Related Recipes

- **[Sync Permissions Up](sync-up-project-to-global.md)** - Reverse sync (project → global)
- **[Audit Project Permissions](audit-project-permissions.md)** - Review all project settings

## Notes

### Permission Cascade Behavior

Claude Code resolves permissions in this order:
```
Project Local → Project Team → Global → Prompt User
     ↓
  FIRST MATCH WINS (no merging!)
```

This recipe implements the merge that Claude Code doesn't do natively.

### When to Run

**Automatically:** In `SESSION_START.md` for all session types
**Manually:** When global settings change and you want to update projects
**After onboarding:** When setting up a new project with local overrides

### Backup Strategy

Recipe always creates `.backup` file before modifying. If sync fails:
```bash
mv .claude/settings.local.json.backup .claude/settings.local.json
```

### Performance

- Fast for typical settings (<100 patterns)
- Uses `jq` for JSON manipulation (native tool)
- No external dependencies

## Examples

### Example 1: Fresh Project with Minimal Settings

**Before:**
```json
{
  "permissions": {
    "allow": ["Read(//Users/hammer/.claude/**)"],
    "deny": [],
    "ask": []
  }
}
```

**After sync with global:**
```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(**)",
      "Edit(**)",
      "Bash(*)",
      ...all global patterns...
    ],
    "deny": [...global denies...],
    "ask": [...global asks...]
  }
}
```

### Example 2: Project with Specific Overrides

**Project has:** `Bash(git push:*)` in `ask` (wants confirmation)
**Global has:** `Bash(*)` in `allow` (auto-approve all bash)

**Conflict resolution:**
```
⚠️  Project asks for 'git push' but global auto-approves all Bash
Options:
1. Trust global (remove project ask, auto-approve git push)
2. Keep project override (still ask for git push in this project)

Choice? [1/2]: 2

✅ Keeping project-level caution for git push
```

### Example 3: Project Denies Production Operations

**Project:** `homebridge-tesmart` (personal project)
**Global allows:** `Bash(aws:*)` (work projects need AWS)
**Project denies:** `Bash(aws:*)` (no AWS in hobby projects)

**Resolution:**
```
ℹ️  Project denies 'Bash(aws:*)' which global allows
This is normal for isolating work/personal operations.
Keeping project deny for safety.

✅ Project protection: AWS operations blocked
```

## Version History

- **v1.0** (2025-10-24): Initial recipe for sync-down operation

---

**Meta Notes:**
This recipe itself can evolve! If you discover better consolidation rules or edge cases, update this document. The recipe is the living documentation of how permission sync works.
