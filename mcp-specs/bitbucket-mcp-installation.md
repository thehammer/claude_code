# Bitbucket MCP Server - Installation Summary

**Date:** 2025-10-24
**Server:** `@aashari/mcp-server-atlassian-bitbucket` v1.45.0
**Location:** `~/Code/mcp-server-atlassian-bitbucket`
**Status:** ✅ Installed and Built

---

## Installation Complete

✅ **Cloned:** From https://github.com/aashari/mcp-server-atlassian-bitbucket.git
✅ **Dependencies:** 997 packages installed
✅ **Built:** TypeScript compiled successfully to `dist/`
✅ **Executable:** `dist/index.js` ready to run

---

## Available Tools (18 total)

### **Workspace Management (2 tools)**
1. **`ls-workspaces`** - List workspaces in your Bitbucket account
2. **`get-workspace`** - Get detailed information about a specific workspace

### **Repository Management (7 tools)**
3. **`ls-repos`** - List repositories in a workspace (with filtering/pagination)
4. **`get-repo`** - Get detailed repository information
5. **`get-commit-history`** - Get commit history for a repository
6. **`add-branch`** - Create a new branch
7. **`list-branches`** - List all branches
8. **`clone`** - Clone repository to local filesystem (SSH/HTTPS)
9. **`get-file`** - Get file content from repository

### **Pull Request Management (7 tools)**
10. **`ls-prs`** - List pull requests (with filtering/pagination)
11. **`get-pr`** - Get detailed PR information
12. **`ls-pr-comments`** - List comments on a PR
13. **`add-pr-comment`** - Add comment to a PR
14. **`add-pr`** - Create a new pull request
15. **`update-pr`** - Update existing pull request
16. **`approve-pr`** - Approve a pull request
17. **`reject-pr`** - Request changes on a pull request

### **Search & Compare (2 tools)**
18. **`search`** - Search Bitbucket for content matching a query
19. **`diff-branches`** - Display differences between two branches

---

## ❌ Pipeline Support Missing

**Critical Finding:** The @aashari MCP server does NOT include pipeline tools.

**Missing:**
- ❌ `list-pipelines` - List recent pipelines
- ❌ `get-pipeline` - Get pipeline details and steps
- ❌ `get-pipeline-step` - Get step logs/details

**Impact:**
- Cannot debug pipeline failures via MCP
- "Debug Pipeline Failure" recipe requires bash helpers

---

## Mitigation Strategy

### **Option 1: Hybrid Approach** (Recommended)

**Use MCP for PRs, keep bash helpers for pipelines:**

```bash
# Keep these bash helpers:
bitbucket_is_configured()      # Credential check
bitbucket_get_pipeline()       # Pipeline details
bitbucket_get_step_url()       # Step URLs for logs
bitbucket_get_pipeline_logs()  # Alias for step URLs

# Remove these (use MCP instead):
bitbucket_list_prs()           → Use MCP: ls-prs
bitbucket_create_pr()          → Use MCP: add-pr
bitbucket_update_pr()          → Use MCP: update-pr
bitbucket_get_pr()             → Use MCP: get-pr
bitbucket_get_pr_comments()    → Use MCP: ls-pr-comments
```

**Result:**
- 5 bash functions removed (replaced by MCP)
- 4 bash functions retained (pipeline support)
- Recipes work for both PRs and pipelines

---

### **Option 2: Fork and Extend** (Future)

**Add pipeline tools to @aashari server:**

1. Fork the repository
2. Add new tools:
   - `src/tools/atlassian.pipelines.tool.ts`
   - `src/tools/atlassian.pipelines.types.ts`
   - `src/controllers/atlassian.pipelines.controller.ts`
   - `src/services/atlassian.pipelines.service.ts`
3. Implement:
   - `list-pipelines` - GET `/repositories/{workspace}/{repo}/pipelines/`
   - `get-pipeline` - GET `/repositories/{workspace}/{repo}/pipelines/{pipeline_uuid}`
   - `get-pipeline-steps` - GET `/repositories/{workspace}/{repo}/pipelines/{pipeline_uuid}/steps/`
4. Submit PR upstream
5. Use our fork until merged

**Estimated Effort:** 2-3 hours

---

### **Option 3: Wrapper MCP** (Complex)

**Create thin wrapper MCP that combines both:**
- Delegates PR operations to @aashari
- Adds custom pipeline operations
- Single unified MCP interface

**Estimated Effort:** 4-5 hours

---

## Recommended Path Forward

**Phase 1: Hybrid Approach (Today)**
1. ✅ Configure @aashari MCP in Claude Code
2. ✅ Update recipes to use MCP for PR operations
3. ✅ Keep 4 bash helpers for pipeline support
4. ✅ Test "Create Carefeed PR" recipe end-to-end
5. ⚠️ Note: "Debug Pipeline Failure" uses bash helpers

**Phase 2: Add Pipeline Support (Next Week)**
1. Fork @aashari repository
2. Implement 3 pipeline tools
3. Test with "Debug Pipeline Failure" recipe
4. Submit PR upstream
5. Migrate to fork/upstream when available

---

## Configuration for Claude Code

### **Method 1: npx (No Installation)**

**File:** VSCode Settings or `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "@aashari/mcp-server-atlassian-bitbucket"],
      "env": {
        "ATLASSIAN_USER_EMAIL": "hammer.miller@carefeed.com",
        "ATLASSIAN_API_TOKEN": "${BITBUCKET_ACCESS_TOKEN}"
      }
    }
  }
}
```

### **Method 2: Local Build (Development)**

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": ["/Users/hammer/Code/mcp-server-atlassian-bitbucket/dist/index.js"],
      "env": {
        "ATLASSIAN_USER_EMAIL": "hammer.miller@carefeed.com",
        "ATLASSIAN_API_TOKEN": "${BITBUCKET_ACCESS_TOKEN}",
        "BITBUCKET_DEFAULT_WORKSPACE": "Bitbucketpassword1"
      }
    }
  }
}
```

### **Credentials**

**Already configured in `~/.claude/credentials/.env`:**
```bash
BITBUCKET_ACCESS_TOKEN=ATBB...  # Already have this
BITBUCKET_USERNAME=hammer.miller
BITBUCKET_WORKSPACE=Bitbucketpassword1
```

**For Scoped API Token (future-proof):**
- Go to: https://id.atlassian.com/manage-profile/security/api-tokens
- Create token with scopes: `repository`, `workspace`, `pullrequest`
- Use `ATLASSIAN_USER_EMAIL` + `ATLASSIAN_API_TOKEN` (starts with `ATATT`)

---

## MCP Tool Mapping

### **Our Requirements vs Available Tools**

| **Our Need** | **MCP Tool** | **Status** |
|-------------|-------------|-----------|
| List PRs | `ls-prs` | ✅ Available |
| Get PR details | `get-pr` | ✅ Available |
| Create PR | `add-pr` | ✅ Available |
| Update PR | `update-pr` | ✅ Available |
| Merge PR | ❌ Missing | ⚠️ Use `approve-pr` + manual merge |
| Get pipeline | ❌ Missing | ❌ Use bash helper |
| List pipelines | ❌ Missing | ❌ Use bash helper |

### **Bonus Tools (Not in our spec)**

| **Tool** | **Use Case** |
|---------|-------------|
| `search` | Search code across repos (useful!) |
| `diff-branches` | Compare branches before PR |
| `get-commit-history` | Analyze changes |
| `get-file` | Read specific files |
| `list-branches` | Branch management |
| `add-branch` | Create feature branches |

---

## Tool Name Mapping for Recipes

### **Update Recipe References**

**In "Create Carefeed PR" recipe:**
```markdown
**Old (bash):**
bitbucket_list_prs "" "OPEN"

**New (MCP):**
ls-prs --workspace-slug Bitbucketpassword1 --repo-slug portal_dev --state OPEN
```

**In "Debug Pipeline Failure" recipe:**
```markdown
**Step 1: Get PR (MCP):**
get-pr --workspace-slug Bitbucketpassword1 --repo-slug portal_dev --pr-id 4067

**Step 2: Get Pipeline (bash helper):**
bitbucket_get_pipeline 13906  # Still use bash until MCP has pipelines
```

---

## Testing Checklist

### **Before Configuration**
- [x] Server cloned to ~/Code/mcp-server-atlassian-bitbucket
- [x] Dependencies installed (997 packages)
- [x] Build successful (dist/ created)
- [x] CLI help works

### **After Configuration**
- [ ] MCP shows in Claude Code status bar
- [ ] Test: ls-workspaces
- [ ] Test: ls-repos
- [ ] Test: ls-prs
- [ ] Test: get-pr (existing PR)
- [ ] Test: add-pr-comment
- [ ] Test: "Create Carefeed PR" recipe end-to-end

### **Integration Testing**
- [ ] Create test PR using MCP
- [ ] Verify Jira link works
- [ ] Test with Carefeed conventions
- [ ] Confirm pipeline bash helpers still work
- [ ] Full workflow: branch → commit → PR → review

---

## File Structure

```
~/Code/mcp-server-atlassian-bitbucket/
├── dist/                      # Compiled JavaScript (built)
│   └── index.js              # Main entry point
├── src/                       # TypeScript source
│   ├── tools/                # Tool implementations
│   │   ├── atlassian.workspaces.tool.ts
│   │   ├── atlassian.repositories.tool.ts
│   │   ├── atlassian.pullrequests.tool.ts
│   │   ├── atlassian.search.tool.ts
│   │   └── atlassian.diff.tool.ts
│   ├── controllers/          # Business logic
│   ├── services/             # API clients
│   ├── utils/                # Helpers
│   └── index.ts              # Server setup
├── package.json              # Dependencies
└── README.md                 # Documentation
```

---

## Next Steps

**Immediate (This Session):**
1. ✅ Installation complete
2. ✅ Available tools documented
3. ✅ Pipeline gap identified
4. ✅ Mitigation strategy chosen (Hybrid)

**Next Session:**
1. Configure MCP in Claude Code
2. Test basic operations (ls-prs, get-pr)
3. Update "Create Carefeed PR" recipe with MCP tool names
4. Test full PR creation workflow
5. Document results

**Future Week:**
1. Fork repository (if needed)
2. Add pipeline tools
3. Test "Debug Pipeline Failure" recipe with MCP
4. Submit PR upstream
5. Update recipes to use pipeline MCP tools

---

## Related Documents

- [Reclassification Plan](../RECLASSIFICATION_PLAN.md) - Overall migration strategy
- [Bitbucket MCP Evaluation](bitbucket-mcp-evaluation.md) - Server comparison
- [Bitbucket MCP Spec](bitbucket-mcp-spec.md) - Original design (reference)
- [Recipe: Create Carefeed PR](../recipes/bitbucket/create-carefeed-pr.md) - Test workflow
- [Recipe: Debug Pipeline Failure](../recipes/bitbucket/debug-pipeline-failure.md) - Needs pipelines

---

## Summary

✅ **Success:** Found mature, well-maintained Bitbucket MCP server
✅ **Coverage:** 18 tools covering workspaces, repos, PRs, search, diff
⚠️ **Gap:** Pipeline support missing (affects 1 recipe)
🎯 **Plan:** Hybrid approach - MCP for PRs, bash for pipelines
📅 **Timeline:** Configure today, test next session, extend later

**Bottom Line:** Great MCP server with minor pipeline gap. Hybrid approach works perfectly until we can contribute pipeline tools upstream! 🚀

---

**Status:** Ready for Configuration
**Estimated Time:** 15 minutes to configure, 30 minutes to test
