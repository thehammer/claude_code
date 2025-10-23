# Claude Code Helper Functions

**Reorganized:** 2025-10-23
**Structure:** Category-based modular organization

This directory contains all helper functions for Claude Code, organized by category and purpose.

---

## Quick Start

### Load Everything (Coding/Debugging Sessions)
```bash
source ~/.claude/lib/core/loader.sh coding
```

### Load Minimal (Clauding/Personal Sessions)
```bash
source ~/.claude/lib/core/loader.sh clauding
```

### Backward Compatibility (Deprecated)
```bash
source ~/.claude/lib/integrations.sh  # Warns and loads all
```

---

## Directory Structure

```
~/.claude/lib/
├── core/                    # Core orchestration (always loaded)
│   ├── loader.sh           # Smart session-aware loader
│   ├── credentials.sh      # Load .env credentials
│   └── utilities.sh        # Cross-cutting utilities
│
├── local/                   # Local system automation
│   ├── vscode.sh           # VSCode UI control (4 functions)
│   └── study-tracker.sh    # Study execution tracking
│
├── conventions/             # Team/project conventions
│   └── carefeed.sh         # Carefeed team standards (15 functions)
│
├── services/
│   ├── mcp-candidates/     # 🎯 Converting to MCP (Phase 2-4)
│   │   ├── bitbucket.sh   # PR management (10 functions)
│   │   ├── slack.sh       # Messaging (12 functions)
│   │   ├── sentry.sh      # Error tracking (10 functions)
│   │   ├── datadog.sh     # Logs/monitoring (17 functions)
│   │   └── github.sh      # PR management (9 functions)
│   │
│   └── _bash/              # ⚙️ Staying as bash CLI wrappers
│       ├── aws.sh         # AWS CLI wrappers (15 functions)
│       ├── onepassword.sh # 1Password CLI (4 functions)
│       └── confluence.sh  # Confluence API (2 functions)
│
├── mcp/                     # MCP integration helpers
│   └── jira_helpers.sh     # Jira MCP tool helpers
│
└── legacy/                  # Deprecated files (for git history)
    ├── bitbucket-api.sh    # Obsolete
    ├── get-pipeline-log.sh # Obsolete
    └── get-pr-pipeline-log.sh # Obsolete
```

---

## Category Descriptions

### Core (Always Loaded)
Essential functions that every session needs:
- **loader.sh** - Session-aware loading (THIS IS THE ENTRY POINT)
- **credentials.sh** - Loads ~/.claude/credentials/.env
- **utilities.sh** - Time parsing, notifications, cross-service aggregators

### Local (Always Loaded)
Local system automation, no network calls:
- **vscode.sh** - VSCode UI automation via AppleScript
- **study-tracker.sh** - Learning execution tracking system

### Conventions (Context-Aware)
Team-specific conventions, loaded if in Carefeed project:
- **carefeed.sh** - Branch naming, commit messages, PR templates, inference helpers

### Services / MCP Candidates
These are bash functions that **will convert to MCP** in Phase 2-4:
- **bitbucket.sh** → MCP Week 2
- **slack.sh** → MCP Week 2-3
- **sentry.sh** → MCP Week 3
- **datadog.sh** → MCP Week 4 (partial - core functions only)
- **github.sh** → MCP Week 5

### Services / Bash Wrappers
These **stay as bash** - they wrap existing CLI tools:
- **aws.sh** - Wraps AWS CLI
- **onepassword.sh** - Wraps `op` CLI
- **confluence.sh** - Low usage, simple API calls

### MCP Helpers
Functions that bridge MCP tools with bash conventions:
- **jira_helpers.sh** - Helpers for working with Jira MCP tools

---

## Loading Behavior by Session Type

| Session Type | What Loads |
|--------------|-----------|
| **coding** | Core + Local + Conventions + All Services |
| **debugging** | Core + Local + Conventions + All Services |
| **analysis** | Core + Local + Conventions + All Services |
| **planning** | Core + Local + Conventions + All Services |
| **presenting** | Core + Local + Conventions + All Services |
| **learning** | Core + Local (skip services!) |
| **personal** | Core + Local (skip services!) |
| **clauding** | Core + Local (skip services!) |

**Performance:**
- Coding session: ~77 functions loaded
- Clauding session: ~5 functions loaded
- **90% reduction** in unnecessary loading for clauding!

---

## Migration from Old Structure

### Before (Deprecated)
```bash
source ~/.claude/lib/integrations.sh  # 87KB monolith, all 82 functions
```

### After (New)
```bash
source ~/.claude/lib/core/loader.sh coding  # Modular, session-aware
```

### Backward Compatibility
The old `integrations.sh` still exists as a compatibility wrapper that:
1. Prints deprecation warning
2. Loads all functions via new loader
3. Will be removed: 2025-11-15

**Update your scripts now!**

---

## Adding New Functions

### 1. Determine Category

**Is it an API integration?**
- Will it convert to MCP? → `services/mcp-candidates/{service}.sh`
- Wraps a CLI tool? → `services/_bash/{service}.sh`

**Is it team/project-specific?**
- Carefeed conventions? → `conventions/carefeed.sh`
- Other project? → Create `conventions/{project}.sh`

**Is it local system automation?**
- macOS/UI automation? → `local/{feature}.sh`
- System tools? → `local/{feature}.sh`

**Is it cross-cutting?**
- Time parsing? Notifications? Aggregators? → `core/utilities.sh`

### 2. Add Function

Edit the appropriate file and add your function:
```bash
# Example: Adding new Bitbucket helper
vim ~/.claude/lib/services/mcp-candidates/bitbucket.sh

# Add function with clear comments
function bitbucket_new_helper() {
    # Your implementation
}
```

### 3. Test

Reload the loader and test:
```bash
source ~/.claude/lib/core/loader.sh coding
declare -F | grep bitbucket_new_helper
```

### 4. Document

Update INTEGRATIONS_REFERENCE.md if it's a service integration.

---

## File Sizes

**Old structure:**
- integrations.sh: 87 KB (everything)

**New structure (largest files):**
- datadog.sh: ~15 KB
- bitbucket.sh: ~12 KB
- slack.sh: ~10 KB
- aws.sh: ~12 KB
- All others: <10 KB

**Largest file is now <20% the size of old monolith!**

---

## Function Count

**Total: ~101 functions**

By category:
- MCP Candidates: 58 functions (converting to MCP)
- Bash Wrappers: 21 functions (staying bash)
- Conventions: 15 functions (Carefeed)
- Core/Local: 7 functions (utilities, vscode, study)

**After MCP Phase 2-4:**
- ~61 MCP tools (Jira, Bitbucket, Slack, Sentry, Datadog, GitHub)
- ~40 bash functions (wrappers, conventions, local tools)

---

## Troubleshooting

### Functions not loading?
```bash
# Check if loader ran
source ~/.claude/lib/core/loader.sh coding

# Verify function count
declare -F | grep -c "bitbucket_\|slack_\|github_"

# Should see 70+ for coding session, 0 for clauding
```

### Credentials not loading?
```bash
# Check .env file exists
ls -la ~/.claude/credentials/.env

# Source credentials manually
source ~/.claude/lib/core/credentials.sh

# Check variables
echo $ATLASSIAN_API_TOKEN
```

### Old integrations.sh still in use?
```bash
# Search for old references
grep -r "integrations.sh" ~/.claude/session-types/

# Update to new loader
sed -i '' 's/integrations.sh/core\/loader.sh coding/g' ~/.claude/session-types/coding.md
```

---

## Related Documentation

- **Function Reference:** `~/.claude/INTEGRATIONS_REFERENCE.md`
- **MCP Analysis:** `~/.claude/session-notes/clauding/INTEGRATION_MCP_ANALYSIS.md`
- **Reorganization Plan:** `~/.claude/session-notes/clauding/HELPER_REORGANIZATION_PROPOSAL.md`
- **Session Types:** `~/.claude/session-types/*.md`

---

**Questions?** Check the clauding session notes or run `/start clauding` to improve this further!

**Last Updated:** 2025-10-23
