# Bitbucket MCP Server Evaluation

**Created:** 2025-10-24
**Status:** Evaluation Phase
**Decision:** Use existing MCP instead of building from scratch

---

## Summary

Good news! There are several mature, open-source Bitbucket MCP servers available. Instead of building from scratch, we should evaluate and adopt the best existing option.

---

## Top Candidates

### 1. **@aashari/mcp-server-atlassian-bitbucket** ⭐ **RECOMMENDED**

**GitHub:** https://github.com/aashari/mcp-server-atlassian-bitbucket
**NPM:** `@aashari/mcp-server-atlassian-bitbucket`
**Type:** Node.js/TypeScript

**Features:**
- ✅ List workspaces and repositories
- ✅ Get repository details
- ✅ List and get pull requests
- ✅ Create PRs and add comments
- ✅ Approve PRs
- ✅ Access file contents
- ✅ View commit history
- ✅ Compare branches
- ✅ Search code across repositories

**Authentication:**
- ✅ Scoped API Tokens (recommended - future-proof)
- ✅ App Passwords (legacy, but supported)
- ⚠️ Note: App passwords deprecated by Atlassian (June 2026)

**Pros:**
- Comprehensive feature set
- Future-proof authentication (scoped tokens)
- Active maintenance
- Good documentation
- Easy npm installation
- Claude Desktop compatible

**Cons:**
- May have features we don't need
- Need to verify pipeline support

---

### 2. **MatanYemini/bitbucket-mcp**

**GitHub:** https://github.com/MatanYemini/bitbucket-mcp
**NPM:** `bitbucket-mcp`
**Type:** Node.js

**Features:**
- ✅ List and get repositories
- ✅ Pull request management (list, create, get, update)
- ✅ PR approvals and merging
- ✅ PR comments (general and inline)
- ✅ Request changes
- ✅ Activity logs
- ✅ **Safe by design**: No DELETE operations

**Authentication:**
- ✅ BITBUCKET_TOKEN
- ✅ Username + App Password

**Pros:**
- Safety-first design (no deletes)
- Simple installation via npx
- Good PR management features
- Can run without installation

**Cons:**
- Unknown if supports pipelines
- May lack code search/file access features
- Documentation less detailed

---

### 3. **n11tech/mcp-bitbucket**

**GitHub:** https://github.com/n11tech/mcp-bitbucket
**Type:** Node.js/TypeScript

**Focus:** Bitbucket Server/Data Center (self-hosted)

**Pros:**
- TypeScript implementation
- Secure interactions
- Server/Data Center focus

**Cons:**
- ❌ **Not suitable** - Targets self-hosted Bitbucket Server, not Bitbucket Cloud
- We use Bitbucket Cloud, not Server

---

### 4. **Ibrahimogod/bitbucket-mcp**

**GitHub:** https://github.com/Ibrahimogod/bitbucket-mcp
**Type:** Rust

**Features:**
- ✅ Full Bitbucket Cloud REST API support
- ✅ High performance (Rust)
- ✅ Stateless architecture
- ✅ Docker deployment

**Pros:**
- High performance
- Full API coverage
- Modern architecture

**Cons:**
- Rust implementation (harder to customize)
- Requires Docker or Rust toolchain
- May be overkill for our needs
- Less community adoption

---

## Comparison Matrix

| **Feature** | **@aashari** | **MatanYemini** | **n11tech** | **Ibrahimogod** |
|------------|-------------|-----------------|-------------|-----------------|
| **PR Management** | ✅ Full | ✅ Full | ✅ | ✅ Full |
| **Pipeline Support** | ❓ TBD | ❓ TBD | ❓ | ✅ |
| **Code Search** | ✅ | ❌ | ✅ | ✅ |
| **File Access** | ✅ | ❌ | ✅ | ✅ |
| **Branch Ops** | ✅ | ❓ | ✅ | ✅ |
| **Scoped Tokens** | ✅ | ❌ | ✅ | ✅ |
| **Cloud Support** | ✅ | ✅ | ❌ | ✅ |
| **NPM Install** | ✅ Easy | ✅ Easy | ✅ Easy | ❌ Rust |
| **Safety Features** | ❓ | ✅ No DELETE | ❓ | ❓ |
| **Documentation** | ✅ Good | ✅ Good | ✅ Good | ⚠️  Limited |

---

## Our Requirements Check

### Must-Have (from our spec):
1. ✅ **List pull requests** - All support
2. ✅ **Get PR details** - All support
3. ✅ **Create PR** - All support
4. ✅ **Update PR** - All support
5. ✅ **Merge PR** - All support
6. ❓ **Get pipeline details** - Need to verify
7. ❓ **List pipelines** - Need to verify

### Nice-to-Have:
8. ✅ **Auto-detect repository** - Can implement wrapper
9. ✅ **Pagination handling** - All support
10. ✅ **Error handling** - All support

### Deal-Breakers:
- ❌ **No Cloud support** - Eliminates n11tech
- ❌ **Difficult installation** - Concern for Ibrahimogod/Rust

---

## Recommendation

### **Primary Choice: @aashari/mcp-server-atlassian-bitbucket**

**Why:**
1. ✅ Comprehensive feature set (PR management + code access)
2. ✅ Future-proof authentication (scoped API tokens)
3. ✅ Easy npm installation
4. ✅ Good documentation
5. ✅ Claude Desktop compatible
6. ✅ Active maintenance
7. ✅ TypeScript implementation (easy to understand/fork if needed)

**Concerns:**
- ❓ Pipeline support unclear (need to test)
- ⚠️  If pipelines missing, we may need to:
  - Submit PR to add pipeline tools
  - Fork and extend
  - Supplement with our bash helpers

### **Backup Choice: MatanYemini/bitbucket-mcp**

**Why:**
- ✅ Safety-first design (no DELETE)
- ✅ Simple installation
- ✅ Good PR management
- ✅ Can run via npx (no install needed)

**When to use:**
- If @aashari lacks critical features
- If we want maximum safety
- If we only need PR management (not code search)

---

## Testing Plan

### Phase 1: Quick Evaluation

```bash
# Test @aashari MCP server
npm install -g @aashari/mcp-server-atlassian-bitbucket

# Configure (see below)
# Test basic operations:
# - List repositories
# - List PRs
# - Get PR details
# - Create test PR
# - Test pipeline access (critical)
```

### Phase 2: Feature Verification

**Test our 7 required operations:**
1. List PRs: `list-pull-requests`
2. Get PR: `get-pull-request`
3. Create PR: `create-pull-request`
4. Update PR: (check available tools)
5. Merge PR: `approve-pull-request` or similar
6. Get pipeline: ❓ **Test this**
7. List pipelines: ❓ **Test this**

### Phase 3: Workflow Integration

**Test with our recipes:**
1. Run "Create Carefeed PR" recipe using MCP tools
2. Run "Debug Pipeline Failure" recipe
3. Verify all steps work
4. Document any gaps

---

## Configuration

### Install @aashari Server

```bash
npm install -g @aashari/mcp-server-atlassian-bitbucket
```

### Claude Code Configuration

**File:** `~/.config/Claude/claude_desktop_config.json` or VSCode settings

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": [
        "-y",
        "@aashari/mcp-server-atlassian-bitbucket"
      ],
      "env": {
        "BITBUCKET_URL": "https://api.bitbucket.org/2.0",
        "BITBUCKET_WORKSPACE": "Bitbucketpassword1",
        "BITBUCKET_TOKEN": "${BITBUCKET_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Alternative (local installation):**
```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": [
        "/usr/local/lib/node_modules/@aashari/mcp-server-atlassian-bitbucket/dist/index.js"
      ],
      "env": {
        "BITBUCKET_URL": "https://api.bitbucket.org/2.0",
        "BITBUCKET_WORKSPACE": "Bitbucketpassword1",
        "BITBUCKET_TOKEN": "${BITBUCKET_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Credentials

**Use existing credentials from `~/.claude/credentials/.env`:**
```bash
# Already have these
BITBUCKET_ACCESS_TOKEN=ATBB...
BITBUCKET_USERNAME=hammer.miller
BITBUCKET_WORKSPACE=Bitbucketpassword1
```

**Create scoped API token (if needed):**
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name: "Claude Code MCP"
4. Copy token → Save to `.env` as `BITBUCKET_ACCESS_TOKEN`

---

## Gaps & Mitigation

### If Pipeline Support Missing

**Option 1: Fork and Add Pipeline Tools**
- Clone @aashari/mcp-server-atlassian-bitbucket
- Add tools:
  - `get-pipeline`
  - `list-pipelines`
  - `get-pipeline-step`
- Submit PR upstream

**Option 2: Hybrid Approach**
- Use MCP for PR operations
- Keep bash helpers for pipeline operations
- Update recipes to use both

**Option 3: Supplement with Wrapper**
- Create thin wrapper MCP server
- Delegates to @aashari for PRs
- Adds custom pipeline tools
- Single MCP interface

---

## Decision Tree

```
Does @aashari support pipelines?
├─ YES: ✅ Use @aashari exclusively
│         Remove all Bitbucket bash helpers except is_configured
│         Update recipes to use MCP tools
│         Test workflows end-to-end
│
└─ NO: Choose mitigation strategy
       ├─ Pipeline access critical?
       │  ├─ YES: Fork @aashari or build wrapper
       │  └─ NO: Use @aashari + keep pipeline helpers
       │
       └─ Alternative: Try MatanYemini (check pipeline support)
```

---

## Next Steps

1. ✅ **Install @aashari server** globally
2. ✅ **Configure** in Claude Code settings
3. ✅ **Test basic operations** (list repos, list PRs)
4. ⚠️  **Test pipeline support** (critical)
5. 📝 **Document findings** here
6. 🔄 **Update recipes** to reference MCP tools
7. 🗑️  **Remove bash helpers** (except is_configured)
8. ✅ **Test workflows** end-to-end

---

## Timeline

**Immediate (Next 30 min):**
- Install and test @aashari
- Verify feature coverage
- Test pipeline support

**Today:**
- Complete evaluation
- Make final decision
- Configure in Claude Code
- Test basic operations

**This Week:**
- Update recipes to use MCP
- Remove deprecated bash helpers
- Test full workflows
- Document any gaps

---

## Success Criteria

✅ **Evaluation complete when:**
- All 7 required operations tested
- Pipeline support verified (or mitigation planned)
- Configuration working in Claude Code
- At least one full workflow tested (create PR or debug pipeline)

✅ **Migration complete when:**
- Recipes updated to use MCP tools
- Bash helpers removed (except `is_configured`)
- All workflows tested and working
- Documentation updated

---

## Related Documents

- [Bitbucket MCP Spec](bitbucket-mcp-spec.md) - Our original spec (reference)
- [Reclassification Plan](../RECLASSIFICATION_PLAN.md) - Overall migration strategy
- [Recipe: Create Carefeed PR](../recipes/bitbucket/create-carefeed-pr.md) - Test workflow
- [Recipe: Debug Pipeline Failure](../recipes/bitbucket/debug-pipeline-failure.md) - Test workflow

---

**Status:** Ready for Testing
**Recommended Action:** Install @aashari and verify pipeline support
**Estimated Time:** 30 minutes for evaluation, 1-2 hours for full integration
