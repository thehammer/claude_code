# Global Configuration Synchronization

**Created:** 2025-10-25
**Status:** Active
**Automation:** Runs at session start (step 0.3 in SESSION_START.md)

---

## Problem

Claude Code has two separate global configuration files that serve different purposes:

| File | Used By | Purpose |
|------|---------|---------|
| `~/.claude.json` | **CLI** (`claude` command) | MCP servers, permissions, CLI state |
| `~/.claude/settings.json` | **VSCode Extension** | Permissions, MCP servers, UI settings |

**Without synchronization:**
- ❌ MCP servers configured in VSCode don't work in CLI sessions
- ❌ Permission changes in one context don't apply to the other
- ❌ Inconsistent behavior between CLI and VSCode
- ❌ Confusing debugging ("Why can't Claude see my Bitbucket MCP tools?")

---

## Solution

**Automated bidirectional sync** that runs at every session start, keeping both files in harmony.

### Sync Script Location

```
~/.claude/bin/sync-global-configs
```

### What Gets Synced

**1. MCP Servers** (bidirectional)
- Server names and configurations
- HTTP endpoints
- Command-based servers
- Both files end up with the same MCP servers

**2. Permissions** (bidirectional)
- `allow` patterns
- `deny` patterns
- `ask` patterns
- Smart consolidation (wildcards absorb specific patterns)

**3. What Stays Separate**

- CLI-specific state (`numStartups`, `promptQueueUseCount`, etc.)
- VSCode-specific settings (`$schema`, UI preferences)
- User IDs and session tracking

---

## Usage

### Automatic (Recommended)

The sync runs automatically at every session start (step 0.3 in SESSION_START.md):

```bash
/start coding
# Sync runs automatically before session begins
```

### Manual

```bash
# Sync both files
sync-global-configs

# Preview changes without applying
sync-global-configs --dry-run

# Show detailed sync information
sync-global-configs --verbose

# Combine options
sync-global-configs --dry-run --verbose
```

---

## Examples

### Example 1: Adding MCP Server in VSCode

**Scenario:** You configure a new Slack MCP server in VSCode extension

**Before:**
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "bitbucket": { "type": "http", "url": "http://localhost:3001/mcp" },
    "jira": { "type": "http", "url": "http://localhost:3000/mcp" },
    "slack": { "type": "http", "url": "http://localhost:3002/mcp" }  // NEW!
  }
}

// ~/.claude.json
{
  "mcpServers": {
    "bitbucket": { ... },
    "jira": { ... }
    // Missing slack!
  }
}
```

**After sync:**
```bash
sync-global-configs

# Output:
MCP servers to add to .claude.json:
  + slack: http://localhost:3002/mcp

✅ Sync complete!
Both files now have: 3 MCP servers
```

**Result:** Slack MCP tools now available in CLI sessions!

### Example 2: Adding Permissions via CLI

**Scenario:** You approve a new permission during a CLI session ("don't ask again")

**Before:**
```json
// ~/.claude.json (gets the new permission first)
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Bash(kubectl:*)"  // NEW!
    ]
  }
}

// ~/.claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(*)"
      // Missing kubectl!
    ]
  }
}
```

**After sync:**
```bash
sync-global-configs

# Output:
Permissions to sync to settings.json:
  + 1 new allow patterns

✅ Sync complete!
```

**Result:** VSCode extension also has kubectl permission!

### Example 3: No Changes (Fast)

**Scenario:** Both files already in sync

```bash
sync-global-configs

# Output (instant):
MCP servers: already in sync ✓
Permissions: already in sync ✓

✅ Sync complete!
```

---

## How It Works

### Merge Strategy

**For MCP Servers:**
```
Result = .claude.json servers + settings.json servers
```

If both files have the same server name, settings.json wins (source of truth).

**For Permissions:**
```
Result = union(.claude.json, settings.json) | deduplicate | consolidate
```

**Consolidation Rules:**
- `Write(**)` absorbs `Write(/specific/path/**)`
- `Bash(*)` absorbs `Bash(command:*)`
- More specific patterns kept only if no wildcard exists

**Example:**
```
Before: ["Write(**)", "Write(/Users/hammer/.claude/**)", "Bash(*)", "Bash(git:*)"]
After:  ["Write(**)", "Bash(*)"]
```

### Conflict Resolution

**No conflicts possible!** The sync is **additive only**:
- MCP servers from both files are combined
- Permissions from both files are combined
- Nothing is ever removed
- More permissive patterns absorb restrictive ones

**Why this is safe:**
- If you approve something in CLI, you want it in VSCode too
- If you configure an MCP server in VSCode, you want it in CLI too
- Sync makes both environments equally capable

---

## Safety

### Backups

Every sync creates automatic backups:
```
~/.claude.json.backup
~/.claude/settings.json.backup
```

### Restore from Backup

```bash
# If sync goes wrong (should never happen, but just in case)
mv ~/.claude.json.backup ~/.claude.json
mv ~/.claude/settings.json.backup ~/.claude/settings.json
```

### Validation

The script validates JSON before and after:
```bash
# Before modifying
jq empty ~/.claude.json || exit 1
jq empty ~/.claude/settings.json || exit 1

# After modifying
if ! jq empty ~/.claude.json.tmp; then
    # Restore from backup automatically
    mv ~/.claude.json.backup ~/.claude.json
    exit 1
fi
```

**If validation fails:** Automatic rollback from backup.

---

## Troubleshooting

### MCP Tools Not Available in CLI

**Symptom:** VSCode has MCP tools, but CLI doesn't

**Cause:** `.claude.json` missing MCP servers

**Fix:**
```bash
sync-global-configs
# Then restart your Claude session
```

### Permissions Not Syncing

**Symptom:** Approved permission in VSCode, still prompted in CLI

**Cause:** Permission added to settings.json but not synced to .claude.json

**Fix:**
```bash
# Check if sync is running at session start
grep "sync-global-configs" ~/.claude/SESSION_START.md

# Run manual sync
sync-global-configs --verbose
```

### Invalid JSON Error

**Symptom:** Sync reports "contains invalid JSON"

**Cause:** One of the config files has syntax errors

**Fix:**
```bash
# Identify the broken file
jq empty ~/.claude.json
jq empty ~/.claude/settings.json

# Fix the JSON syntax manually
# Or restore from backup
mv ~/.claude.json.backup ~/.claude.json
```

---

## When Sync Runs

### Automatically

1. **Every session start** (step 0.3 in SESSION_START.md)
   - Runs before tmux window rename
   - Runs before project permission sync
   - Ensures consistent state from the start

2. **After /start command**
   - Integrated into session initialization
   - No manual intervention needed

### Manually

Run `sync-global-configs` anytime you:
- Add a new MCP server in VSCode
- Approve new permissions in CLI
- Modify either config file directly
- Want to verify both files are in sync

---

## Performance

**Fast:** Typical sync takes < 100ms

**Instant when in sync:**
```bash
time sync-global-configs
# real    0m0.045s  (already in sync)
```

**With changes:**
```bash
time sync-global-configs
# real    0m0.083s  (merged 5 new patterns)
```

**Why it's fast:**
- Pure `jq` operations (native tool)
- No external API calls
- Simple file I/O

---

## Architecture

### File Structure

```
~/.claude/
├── .claude.json                    # CLI config (MCP + permissions + state)
├── settings.json                   # VSCode config (MCP + permissions)
├── bin/
│   └── sync-global-configs         # Sync script
├── SESSION_START.md                # Calls sync at step 0.3
└── CONFIG_SYNC.md                  # This file
```

### Data Flow

```
Session Start
     ↓
Step 0.3: Run sync
     ↓
Read .claude.json ──┐
                    ├──→ Merge MCP servers ──→ Write to both
Read settings.json ─┘    Merge permissions
     ↓
Both files now consistent
     ↓
Continue session with full MCP/permission access
```

---

## Related Documentation

- **[SETTINGS.md](SETTINGS.md)** - settings.json configuration guide
- **[PERMISSIONS.md](PERMISSIONS.md)** - Permission system overview
- **[SESSION_START.md](SESSION_START.md)** - Session initialization (calls sync at step 0.3)
- **[MCP Installation](mcp-specs/bitbucket-mcp-installation.md)** - Setting up MCP servers

---

## Version History

### v1.0 (2025-10-25)
- Initial implementation
- Bidirectional sync for MCP servers
- Bidirectional sync for permissions
- Smart consolidation (wildcards absorb patterns)
- Automatic backups
- JSON validation with rollback
- Integrated into SESSION_START.md (step 0.3)

### Future Enhancements

**Potential improvements:**
- Detect and report conflicts (currently additive-only)
- Support for project-specific MCP servers
- Periodic background sync (watch for file changes)
- Sync to multiple config locations (team-shared configs)

---

## Meta

This sync system solves a real pain point discovered during Bitbucket MCP testing:

**Original Issue:** MCP server was configured in settings.json, Docker container running, but CLI couldn't see the tools.

**Root Cause:** CLI reads from .claude.json, not settings.json

**Solution:** This automated sync system keeps both files in harmony

**Result:** MCP tools and permissions work consistently everywhere! 🎉
