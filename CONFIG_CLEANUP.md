# ~/.claude.json Cleanup Analysis

## Current Size: 112KB (1,729 lines)

### Size Breakdown

| Section | Size | % of Total | Can Clean? |
|---------|------|------------|------------|
| **projects (history)** | 58KB | 52% | ✅ Yes - Trim old history |
| **cachedChangelog** | 31KB | 28% | ✅ Yes - Delete entirely |
| **permissions** | 1.2KB | 1% | ⚠️ Maybe - Some consolidation possible |
| **mcpServers** | <1KB | <1% | ❌ No - Need these |
| **Other metadata** | ~22KB | 19% | ⚠️ Check tipsHistory |

**Total cleanup potential: ~89KB (80% reduction) → 23KB final size**

---

## Issue #1: Project History (58KB, 52%)

### Problem
Each project stores conversation history. Older sessions accumulate over time.

### Current State
```
/Users/hammer/Code/portal_dev: 100 history items
/Users/hammer/.claude: 100 history items
/Users/hammer/Code/homebridge-tesmart: 52 history items
/Users/hammer/Code/php_graph: 35 history items
/Users/hammer: 26 history items
/Users/hammer/sandbox: 26 history items
/Users/hammer/Code/family-portal: 0 history items

Total: 339 history items
```

### Recommendations

**Option A: Trim to recent N items per project**
- Keep last 20-30 history items per project
- Estimated savings: ~40KB

**Option B: Archive and clear**
- Export history to backup file
- Clear all history
- Estimated savings: 58KB

**Option C: Remove inactive projects**
- Keep only actively used projects
- Remove: /Users/hammer (home dir?), sandbox (test dir?)
- Estimated savings: ~5-10KB

### Implementation

**Manual trim (safe):**
```bash
# Backup first
cp ~/.claude.json ~/.claude.json.backup

# Trim each project to last 20 items
cat ~/.claude.json | jq '
  .projects = (.projects | with_entries(
    .value.history = (.value.history | .[-20:])
  ))
' > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json
```

**Clear all history (aggressive):**
```bash
cp ~/.claude.json ~/.claude.json.backup

cat ~/.claude.json | jq '
  .projects = (.projects | with_entries(
    .value.history = []
  ))
' > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json
```

---

## Issue #2: Cached Changelog (31KB, 28%)

### Problem
Claude Code caches the changelog text for display. This is regenerated on updates.

### Recommendation
**Delete it - will be regenerated when needed**

### Implementation
```bash
cp ~/.claude.json ~/.claude.json.backup

cat ~/.claude.json | jq 'del(.cachedChangelog)' > ~/.claude.json.tmp && \
mv ~/.claude.json.tmp ~/.claude.json
```

**Savings: 31KB (28%)**

---

## Issue #3: Permissions (1.2KB, 1%)

### Current State

**Allow patterns (40):**
- `Bash` (base pattern)
- `Bash(~/.claude/lib/*.sh:*)` (helper scripts)
- 18 function prefixes: `Bash(aws_:*)`, `Bash(bitbucket_:*)`, etc.
- File operations: `Edit(**)`, `Glob(**)`, `Grep(**)`, `Read(//**)`, `Write(**)`
- Web: `WebFetch(domain:**)`, `WebSearch`
- 7 MCP Bitbucket tools
- 6 MCP Jira tools

**Deny patterns (5):**
- `Bash(DROP DATABASE:*)`
- `Bash(git push --force:*)`
- `Bash(rm -rf /:*)`
- `Bash(rm -rf /*:*)`
- `Bash(rm -rf ~:*)`

**Ask patterns (10):**
- (Not shown in output, but listed as 10 items)

### Consolidation Opportunities

**Minimal (Current approach is already good):**
- 18 function prefix patterns are specific and intentional
- Could combine some: `Bash(*_:*)` would match all, but less secure
- **Recommendation: Keep as-is for security/granularity**

**Savings: <100 bytes, not worth it**

---

## Issue #4: Tips History & Other Metadata (~22KB)

### Check What's There
```bash
cat ~/.claude.json | jq '.tipsHistory | length'
cat ~/.claude.json | jq '.cachedStatsigGates'
cat ~/.claude.json | jq '.cachedDynamicConfigs'
```

### Potential Cleanup
- `tipsHistory`: List of dismissed tips - can clear if desired
- `cachedStatsigGates`: Feature flags - keep
- `cachedDynamicConfigs`: Remote configs - keep

---

## Recommended Cleanup Script

```bash
#!/usr/bin/env bash

# ~/.claude/bin/cleanup-config.sh

set -e

CONFIG_FILE="$HOME/.claude.json"
BACKUP_FILE="$HOME/.claude.json.backup-$(date +%Y%m%d-%H%M%S)"

echo "🧹 Cleaning up ~/.claude.json"
echo ""

# Backup
echo "Creating backup: $BACKUP_FILE"
cp "$CONFIG_FILE" "$BACKUP_FILE"

# Analyze before
BEFORE_SIZE=$(du -h "$CONFIG_FILE" | awk '{print $1}')
echo "Before: $BEFORE_SIZE"
echo ""

# Cleanup operations
echo "Applying cleanup..."

cat "$CONFIG_FILE" | jq '
  # Remove cached changelog (will regenerate)
  del(.cachedChangelog) |

  # Trim project history to last 20 items per project
  .projects = (.projects | with_entries(
    .value.history = (.value.history | if length > 20 then .[-20:] else . end)
  )) |

  # Optional: Clear tips history (uncomment if desired)
  # .tipsHistory = [] |

  # Keep everything else
  .
' > "${CONFIG_FILE}.tmp"

# Replace original
mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"

# Analyze after
AFTER_SIZE=$(du -h "$CONFIG_FILE" | awk '{print $1}')
echo ""
echo "After: $AFTER_SIZE"
echo ""
echo "✅ Cleanup complete!"
echo "Backup saved: $BACKUP_FILE"
```

---

## Expected Results

### Before Cleanup
```
Size: 112KB
Lines: 1,729
Projects: 7
History items: 339
```

### After Cleanup (Conservative)
```
Size: ~30KB (73% reduction)
Lines: ~500
Projects: 7
History items: 140 (20 per active project)
```

### After Cleanup (Aggressive)
```
Size: ~23KB (80% reduction)
Lines: ~350
Projects: 7
History items: 0
```

---

## Safety Notes

1. **Always backup before cleanup**
   ```bash
   cp ~/.claude.json ~/.claude.json.backup
   ```

2. **Verify JSON is valid after changes**
   ```bash
   jq empty ~/.claude.json && echo "✅ Valid JSON"
   ```

3. **History is conversation/continue data**
   - Losing history means you can't `--continue` old sessions
   - Recent sessions (last 20) should be enough for most use cases
   - Older history can be archived if needed

4. **Config sync with VSCode**
   - This only cleans CLI config (`~/.claude.json`)
   - VSCode extension uses `~/.claude/settings.json`
   - Run `sync-global-configs` after cleanup if needed

---

## Alternative: Periodic Auto-Cleanup

Add to session wrapup or create a monthly cleanup job:

```bash
# In WRAPUP.md or as a cron job
~/.claude/bin/cleanup-config.sh
```

Or add to `.zshrc`:
```bash
# Monthly auto-cleanup
if [ -f ~/.claude/.last-config-cleanup ]; then
  LAST_CLEANUP=$(cat ~/.claude/.last-config-cleanup)
  DAYS_AGO=$(( ($(date +%s) - $LAST_CLEANUP) / 86400 ))
  if [ $DAYS_AGO -gt 30 ]; then
    echo "ℹ️  Config cleanup recommended (last: $DAYS_AGO days ago)"
    echo "Run: ~/.claude/bin/cleanup-config.sh"
  fi
fi
```

---

## Manual Inspection Commands

### Check specific sections
```bash
# Permissions
jq '.permissions' ~/.claude.json

# Project history counts
jq -r '.projects | to_entries[] | "\(.key): \(.value.history | length) items"' ~/.claude.json

# Large fields
jq 'to_entries | .[] | select(.value | type == "string" and (. | length) > 1000) | {key, size: (.value | length)}' ~/.claude.json

# Total line count by section
jq -c '.projects' ~/.claude.json | wc -l
jq -c '.cachedChangelog' ~/.claude.json | wc -l
```

### Export history before clearing
```bash
# Save history to archive
jq '.projects' ~/.claude.json > ~/.claude/project-history-backup-$(date +%Y%m%d).json
```

---

## Questions to Consider

1. **How far back do you need to `--continue` sessions?**
   - If 20 sessions is enough, trim to 20
   - If you need more, adjust the number

2. **Do you use all 7 projects?**
   - Consider removing inactive ones
   - `/Users/hammer` and `/sandbox` might not need history

3. **Do you reference old tips?**
   - `tipsHistory` can probably be cleared

4. **How often to cleanup?**
   - Monthly? Quarterly?
   - Part of session wrapup?

---

**Next Steps:**
1. Review this analysis
2. Decide on cleanup strategy (conservative vs aggressive)
3. Run cleanup script
4. Verify config still works
5. Consider periodic auto-cleanup

**Files to create:**
- `~/.claude/bin/cleanup-config.sh` - Cleanup script
- `~/.claude/.last-config-cleanup` - Timestamp tracker
