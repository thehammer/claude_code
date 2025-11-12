# Permissions Summary

## Web Request Permissions

### Current Configuration (Updated Oct 30, 2025)

```
✅ WebFetch(**)         ← NEW: Catches ALL WebFetch calls
✅ WebFetch(domain:**)  ← Specific to domain parameter
✅ WebSearch            ← All web searches
```

**Why three patterns?**
- `WebFetch(**)` - Broad catch-all for any WebFetch invocation
- `WebFetch(domain:**)` - Specific pattern for domain-filtered fetches
- `WebSearch` - Web search functionality

**Result:** No more web request prompts in any session.

---

## Complete Permissions Breakdown

### ALLOW Patterns (41 total)

#### File Operations (4)
```
✅ Edit(**)      - Edit any file
✅ Glob(**)      - Search files by pattern
✅ Grep(**)      - Search file contents
✅ Read(//**)    - Read any file
✅ Write(**)     - Write any file
```

#### Web Operations (3)
```
✅ WebFetch(**)         - Fetch any URL
✅ WebFetch(domain:**)  - Fetch with domain filtering
✅ WebSearch            - Web search
```

#### Bash Commands (20)

**General:**
```
✅ Bash                          - Basic bash commands
✅ Bash(~/.claude/lib/*.sh:*)    - Helper scripts
```

**Integration Prefixes (18):**
```
✅ Bash(aws_:*)        - AWS CLI helpers
✅ Bash(bitbucket_:*)  - Bitbucket helpers
✅ Bash(carefeed_:*)   - Carefeed team helpers
✅ Bash(datadog_:*)    - Datadog helpers
✅ Bash(extract_:*)    - Extraction helpers
✅ Bash(get_:*)        - Getter helpers
✅ Bash(github_:*)     - GitHub helpers
✅ Bash(infer_:*)      - Inference helpers
✅ Bash(is_:*)         - Validation helpers
✅ Bash(jira_:*)       - Jira helpers
✅ Bash(m365:*)        - Microsoft 365 helpers
✅ Bash(mv:*)          - Move helpers
✅ Bash(op_:*)         - 1Password helpers
✅ Bash(sentry_:*)     - Sentry helpers
✅ Bash(show_:*)       - Display helpers
✅ Bash(slack_:*)      - Slack helpers
✅ Bash(validate_:*)   - Validation helpers
✅ Bash(vscode_:*)     - VSCode automation helpers
```

#### MCP Tools (13)

**Bitbucket (7):**
```
✅ mcp__bitbucket__bb_add_pr                - Create PR
✅ mcp__bitbucket__bb_get_pipeline          - Get pipeline details
✅ mcp__bitbucket__bb_get_pr                - Get PR details
✅ mcp__bitbucket__bb_list_pipeline_steps   - List pipeline steps
✅ mcp__bitbucket__bb_list_pipelines        - List pipelines
✅ mcp__bitbucket__bb_ls_prs                - List PRs
✅ mcp__bitbucket__bb_update_pr             - Update PR
```

**Jira (6):**
```
✅ mcp__jira__jira_create_issue        - Create issue
✅ mcp__jira__jira_get_create_meta     - Get creation metadata
✅ mcp__jira__jira_get_issue           - Get issue details
✅ mcp__jira__jira_get_transitions     - Get workflow transitions
✅ mcp__jira__jira_ls_issues           - List issues
✅ mcp__jira__jira_transition_issue    - Change issue status
```

---

### DENY Patterns (5 total)

**Destructive Operations:**
```
❌ Bash(DROP DATABASE:*)     - Prevent database drops
❌ Bash(git push --force:*)  - Prevent force pushes
❌ Bash(rm -rf /:*)          - Prevent root deletion
❌ Bash(rm -rf /*:*)         - Prevent root wildcard deletion
❌ Bash(rm -rf ~:*)          - Prevent home directory deletion
```

---

### ASK Patterns (10 total)

**Require Confirmation:**
```
⚠️  Bash(gh pr create:*)   - Creating PRs
⚠️  Bash(gh pr merge:*)    - Merging PRs
⚠️  Bash(git push:*)       - Pushing to remote
⚠️  Bash(mv /dev/null:*)   - Moving to /dev/null
⚠️  Bash(rm:*)             - Removing files
⚠️  Bash(rmdir:*)          - Removing directories
⚠️  Bash(su:*)             - Switch user
⚠️  Bash(sudo /dev/null:*) - Sudo with /dev/null
⚠️  Bash(sudo rm:*)        - Sudo remove
⚠️  Bash(sudo rmdir:*)     - Sudo remove directory
```

---

## Permission Philosophy

### Wildcard Strategy
- **Broad wildcards** (`**`, `*`) for common operations (Edit, Read, Write, Glob, Grep)
- **Prefix-based** (`aws_:*`, `jira_:*`) for helper function namespaces
- **Specific denials** for dangerous operations (force push, rm -rf)
- **Confirmation required** for risky operations (git push, rm, sudo)

### Why Not Consolidate?

**Current: 18 separate Bash prefix patterns**
```
Bash(aws_:*), Bash(bitbucket_:*), Bash(jira_:*), etc.
```

**Could consolidate to:**
```
Bash(*_:*)  ← Matches all function prefixes
```

**Why we don't:**
1. **Security** - Granular control over which integration helpers are allowed
2. **Auditing** - Clear visibility into what's permitted
3. **Flexibility** - Can remove specific integrations without affecting others
4. **Documentation** - Self-documenting permissions list

**Tradeoff:** Slightly longer permissions list vs. better security and control

---

## Sync Between CLI and VSCode

Both `~/.claude.json` (CLI) and `~/.claude/settings.json` (VSCode extension) should have identical permissions.

**Verify sync:**
```bash
~/.claude/bin/sync-global-configs
```

**Manual check:**
```bash
# CLI
jq '.permissions' ~/.claude.json

# VSCode
jq '.permissions' ~/.claude/settings.json
```

---

## Common Issues

### "Getting web request prompts"
**Solution:** Ensure you have all three patterns:
- `WebFetch(**)`
- `WebFetch(domain:**)`
- `WebSearch`

### "Prompts for helper functions"
**Check:** Do you have the specific prefix pattern?
```bash
jq '.permissions.allow[] | select(test("your_prefix"))' ~/.claude.json
```

### "Permissions not working in VSCode"
**Solution:** Run sync script:
```bash
~/.claude/bin/sync-global-configs
```

### "Want to add new permission"
**CLI:**
```bash
jq '.permissions.allow += ["YourPattern"]' ~/.claude.json > /tmp/claude.json && \
mv /tmp/claude.json ~/.claude.json && \
~/.claude/bin/sync-global-configs
```

**VSCode:** Add to `~/.claude/settings.json` and sync, or just use CLI method above

---

## Security Best Practices

### ✅ DO
- Use specific patterns for sensitive operations
- Maintain DENY list for destructive commands
- Use ASK for operations that modify remote state
- Keep CLI and VSCode synced

### ❌ DON'T
- Use `Bash(**)` without thought (too broad)
- Remove DENY patterns (safety net)
- Skip ASK patterns for git push, PR merge
- Forget to sync after changes

---

## Files

**Configuration:**
- `~/.claude.json` - CLI config
- `~/.claude/settings.json` - VSCode extension config

**Scripts:**
- `~/.claude/bin/sync-global-configs` - Sync permissions between configs

**Backups:**
- Created automatically during sync: `~/.claude.json.backup`, `~/.claude/settings.json.backup`

---

**Last Updated:** 2025-10-30
**Total Patterns:** 41 allow, 5 deny, 10 ask (56 total)
