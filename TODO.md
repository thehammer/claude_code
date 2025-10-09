# Global TODO List

This file tracks cross-project tasks, global improvements, and system-wide enhancements.

---

## High Priority

### Establish Git Management for Claude Directories
**Description:** Create a mechanism for managing the two `.claude/` directories in git

**Context:**
- `~/.claude/` - Global configuration (preferences, credentials, integrations, session management)
- `.claude/` - Project-specific configuration (session notes, project patterns, technical debt)

**Challenges:**
- Global directory should be in its own git repo (personal config)
- Project directory should be in project git repo (team-shared)
- Credentials must never be committed (`.gitignore` protection)
- Need way to version control preferences, templates, and documentation

**Proposed Approach:**
1. Create `~/.claude/.gitignore` to exclude sensitive files:
   ```
   credentials/
   todos/
   shell-snapshots/
   ide/
   plugins/
   projects/
   statsig/
   ```
2. Initialize `~/.claude/` as a git repo (personal dotfiles)
3. Ensure project `.claude/` has proper `.gitignore` (exclude `session-notes/` as they're personal)
4. Document which files are shareable vs personal

**Benefits:**
- Version control for global preferences and workflows
- Easy to share project-specific patterns with team
- Backup and sync across machines
- Track evolution of Claude Code setup

---

## Medium Priority

### Complete Integration Setup

#### GitHub Integration
**Description:** Configure GitHub API access tokens and test integration

**Tasks:**
- Generate GitHub Personal Access Token with repo and workflow scopes
- Add to `~/.claude/credentials/.env` as `GITHUB_TOKEN`
- Enable read features in `~/.claude/credentials/services/github.json`
- Test with `gh` CLI if available
- Verify can list PRs and check Actions status

**Use Cases:**
- Check GitHub Actions status for repositories
- List and review PRs on GitHub-hosted projects
- Create PRs if needed

---

#### Slack Integration
**Description:** Set up Slack bot token for deployment notifications

**Tasks:**
- Create or use existing Slack app
- Generate Bot User OAuth Token with `chat:write` and `channels:read` scopes
- Add to `~/.claude/credentials/.env` as `SLACK_BOT_TOKEN`
- Test posting to a test channel
- Coordinate with existing Slack service in portal_dev project

**Use Cases:**
- Post deployment notifications to `#deployments`
- Share updates with team channels
- Alert on critical issues found during development

**Note:** Portal project already has Slack service interface created on `hammer/slack-interface` branch

---

#### Microsoft 365 Integration
**Description:** Set up MS365 CLI/API integration to assist with tasks, emails, and calendars

**Tasks:**
- Research MS365 CLI options (`microsoft365-cli`, `az` CLI, or Graph API)
- Determine authentication method (app registration, device code flow, etc.)
- Add credentials to `~/.claude/credentials/.env` (e.g., `MS365_CLIENT_ID`, `MS365_TENANT_ID`, `MS365_CLIENT_SECRET`)
- Create helper functions in `~/.claude/lib/integrations.sh` for common operations
- Test basic operations: list emails, create calendar events, manage tasks
- Document in `~/.claude/INTEGRATIONS.md` and `~/.claude/API_NOTES.md`

**Use Cases:**
- Manage Outlook tasks and to-do lists
- Read and send emails via Outlook
- Create and manage calendar events
- Integration with personal productivity workflows

**API Options:**
- **Microsoft Graph API** - REST API for all MS365 services
- **CLI for Microsoft 365** - Command-line tool (npm package)
- **Azure CLI** - With MS Graph extensions

---

#### Stable Diffusion / ComfyUI Integration
**Description:** Local image generation with Stable Diffusion via ComfyUI - COMPLETED

**Status:** ✅ Fully operational

**Installation Location:** `~/ComfyUI`

**Components Installed:**
- ComfyUI v0.3.64 with Python 3.13 virtual environment
- Stable Diffusion 1.5 model (4GB)
- IP-Adapter Plus custom node for face work
- CLIP Vision encoder (2.4GB)
- IP-Adapter Plus Face model (94MB)

**Python API Scripts:**
- `~/ComfyUI/comfyui_api.py` - Main API client with text-to-image + face insertion
- `~/ComfyUI/faceswap.py` - Image-to-image face swapping utility

**Server:**
- Runs on: http://127.0.0.1:8188
- Start: `cd ~/ComfyUI && source venv/bin/activate && python main.py`
- Web UI available for visual workflow editing

**Usage Examples:**
```bash
# Text-to-image with face insertion
cd ~/ComfyUI
source venv/bin/activate
python comfyui_api.py "1960s movie poster" ~/face.jpg output.png

# Face swap in existing image
python faceswap.py ~/base_image.jpg ~/face.jpg output.png
```

**Hardware:** Optimized for Apple Silicon (M4) with Metal Performance Shaders

**Completed:** 2025-10-08

---

## Low Priority

None currently.

---

## Completed

### Integration System Setup ✅
**Completed:** 2025-10-06

Built complete credential management and API integration system:
- Created `~/.claude/credentials/` structure with `.env` and service configs
- Implemented `~/.claude/lib/integrations.sh` with helper functions
- Documented in `~/.claude/INTEGRATIONS.md`, `~/.claude/API_NOTES.md`, `~/.claude/PERMISSIONS.md`
- Configured and tested Jira, Confluence, and Bitbucket integrations
- Integrated into session startup (`SESSION_START.md`) and wrapup (`WRAPUP.md`)
- Added PR listing to startup and wrapup procedures

**Working Integrations:**
- ✅ Jira - Search issues, read tickets
- ✅ Confluence - Search and read documentation
- ✅ Bitbucket - List PRs, check pipeline status
- ✅ Sentry - Error tracking and debugging (completed 2025-10-07)
- ✅ Datadog - Monitoring and logs (completed 2025-10-07)

**Pending:**
- ❌ GitHub - Not yet configured
- ❌ Slack - Not yet configured

---

### Sentry and Datadog Integrations ✅
**Completed:** 2025-10-07

Successfully integrated Sentry and Datadog APIs:
- Fixed Sentry API authentication (token whitespace trimming)
- Added helper functions to `~/.claude/lib/integrations.sh`
- Documented in `~/.claude/INTEGRATIONS.md` and `~/.claude/API_NOTES.md`
- Analyzed Datadog/Sentry error correlation for portal_dev
- Identified monitoring coverage gaps (14% overlap)

---

**Last Updated:** 2025-10-08
