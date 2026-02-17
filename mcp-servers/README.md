# MCP Servers - Deployment Architecture

This directory contains **Docker deployment configurations** for MCP servers.

**Important:** This directory does NOT contain source code. All source code lives in:
- **GitHub forks:** `github.com/<your-org>/[repo-name]`
- **Local development:** `~/Code/[repo-name]`

## Directory Structure

```
~/.claude/mcp-servers/
├── README.md              # This file
├── bin/                   # Management scripts
│   ├── mcp-up             # Start all services
│   ├── mcp-down           # Stop all services
│   └── mcp-status         # Show service status
├── shared/                # Shared infrastructure
│   ├── docker-compose.yml # PostgreSQL + pgvector
│   ├── init.sql           # Database initialization
│   └── .env               # Database credentials
└── [server-name]/         # One directory per MCP server
    ├── Dockerfile           # Build config
    ├── docker-compose.yml   # Runtime config
    ├── .env                 # Symlink to credentials
    └── README.md            # Server-specific docs
```

## Quick Start

```bash
# Start all MCP servers and shared infrastructure
~/.claude/mcp-servers/bin/mcp-up

# Check status
~/.claude/mcp-servers/bin/mcp-status

# Stop specific server
~/.claude/mcp-servers/bin/mcp-down jira

# Stop everything including database
~/.claude/mcp-servers/bin/mcp-down --all --include-shared
```

## Current MCP Servers

### Jira MCP Server

**Status:** ✅ Production (HTTP mode, port 3000)

**Source:**
- Fork: https://github.com/<your-org>/mcp-server-atlassian-jira
- Local: `~/Code/mcp-server-atlassian-jira`
- Upstream: https://github.com/aashari/mcp-server-atlassian-jira

**Deployment:**
- Directory: `~/.claude/mcp-servers/jira/`
- Container: `jira-mcp-server`
- Port: 3000
- Tools: 15 (including custom workflow transitions)

**Custom Features:**
- `jira_get_transitions` - Get available workflow transitions
- `jira_transition_issue` - Move issues through workflow

### Bitbucket MCP Server

**Status:** ✅ Production (HTTP mode, port 3001)

**Source:**
- Local: `~/Code/mcp-server-atlassian-bitbucket` (Not forked yet)
- Upstream: https://github.com/aashari/mcp-server-atlassian-bitbucket

**Deployment:**
- Directory: `~/.claude/mcp-servers/bitbucket/`
- Container: `bitbucket-mcp-server`
- Port: 3001
- Tools: 18 (workspaces, repos, PRs, search, diff)

**Tools Available:**
- Workspace: `ls-workspaces`, `get-workspace`
- Repository: `ls-repos`, `get-repo`, `get-commit-history`, `add-branch`, `list-branches`, `get-file`
- Pull Requests: `ls-prs`, `get-pr`, `ls-pr-comments`, `add-pr-comment`, `add-pr`, `update-pr`, `approve-pr`, `reject-pr`
- Utilities: `search`, `diff-branches`

**Known Gaps:**
- ❌ Pipeline tools not available (will use bash helpers temporarily)
- Future: Fork and add pipeline tools (`get-pipeline`, `list-pipelines`, `get-pipeline-steps`)

---

## Workflow for Adding/Modifying MCP Servers

### 1. Fork Upstream Repository

```bash
# Via GitHub web UI or CLI
gh repo fork upstream/repo-name --org <your-org>
```

### 2. Clone Fork Locally

```bash
cd ~/Code
git clone git@github.com:<your-org>/[repo-name].git
cd [repo-name]

# Add upstream for pulling updates
git remote add upstream https://github.com/[original-org]/[repo-name].git
```

### 3. Create Deployment Config

```bash
mkdir -p ~/.claude/mcp-servers/[server-name]
cd ~/.claude/mcp-servers/[server-name]

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY scripts ./scripts
RUN npm ci --only=production --ignore-scripts
COPY dist ./dist
RUN chmod +x dist/index.js
ENV TRANSPORT_MODE=http
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/index.js"]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  server-name-mcp:
    image: my-[server-name]-mcp:latest
    container_name: [server-name]-mcp-server
    ports:
      - "3000:3000"
    environment:
      - TRANSPORT_MODE=http
      - PORT=3000
      # Add server-specific env vars
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
EOF

# Symlink credentials
ln -s ~/.claude/credentials/.env .env
```

### 4. Build and Deploy

```bash
# Build from fork source
cd ~/Code/[repo-name]
npm install
npm run build

# Build Docker image
docker build -f ~/.claude/mcp-servers/[server-name]/Dockerfile \
  -t my-[server-name]-mcp:latest .

# Deploy
cd ~/.claude/mcp-servers/[server-name]
docker-compose up -d
```

### 5. Test Deployment

```bash
# Check container health
docker ps --filter "name=[server-name]-mcp-server"

# Check logs
docker logs [server-name]-mcp-server --tail 50

# Test MCP tools in Claude Code
# (Tools should appear automatically if settings.json is configured)
```

### 6. Update Claude Code Settings

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "[server-name]": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

---

## Making Changes to MCP Servers

### For Bug Fixes or Features

```bash
# 1. Make changes in fork
cd ~/Code/[repo-name]
git checkout -b feature/my-feature

# ... make changes ...

# 2. Test locally
npm run build
npm test

# 3. Commit and push
git add -A
git commit -m "feat: Add new feature"
git push origin feature/my-feature

# 4. Rebuild Docker image
docker build -f ~/.claude/mcp-servers/[server-name]/Dockerfile \
  -t my-[server-name]-mcp:latest .

# 5. Restart container
cd ~/.claude/mcp-servers/[server-name]
docker-compose restart

# 6. Test in Claude Code
# Verify new features work as expected
```

### For Upstream Updates

```bash
cd ~/Code/[repo-name]

# Fetch upstream changes
git fetch upstream

# Merge upstream main into your fork
git checkout main
git merge upstream/main

# Resolve conflicts if any
# ...

# Push updated main
git push origin main

# Rebuild and redeploy (follow steps 4-6 above)
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs [server-name]-mcp-server

# Common issues:
# - Missing environment variables (check .env symlink)
# - Port already in use (change in docker-compose.yml)
# - Build failed (check Dockerfile COPY paths)
```

### Tools Not Appearing in Claude Code

```bash
# 1. Verify container is running
docker ps --filter "name=[server-name]-mcp-server"

# 2. Test HTTP endpoint
curl http://localhost:3000/

# 3. Check settings.json syntax
cat ~/.claude/settings.json | jq .

# 4. Restart VS Code
code --restart
```

### Image Size Too Large

```bash
# Use multi-stage builds
# Example Dockerfile:
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

---

## Best Practices

### DO ✅
- Keep source code in `~/Code/[repo-name]`
- Fork to your organization for team access
- Use Docker for consistent deployments
- Test changes before committing
- Document custom features in README
- Use semantic versioning for releases

### DON'T ❌
- Don't store source code in `~/.claude/mcp-servers/`
- Don't commit `node_modules/` or `dist/` to git
- Don't hardcode credentials in Dockerfiles
- Don't skip testing after rebuilding
- Don't use `:latest` tag in production (use versioned tags)

---

## Example: Complete Workflow

Here's a complete example of adding workflow transitions to Jira MCP:

```bash
# 1. Fork upstream
gh repo fork aashari/mcp-server-atlassian-jira --org <your-org>

# 2. Clone locally
cd ~/Code
git clone git@github.com:<your-org>/mcp-server-atlassian-jira.git
cd mcp-server-atlassian-jira

# 3. Create feature branch
git checkout -b feature/workflow-transitions

# 4. Add new files
# ... created 8 new TypeScript files ...

# 5. Build and test
npm install
npm run build
npm test

# 6. Commit changes
git add -A
git commit -m "feat: Add workflow transition tools"

# 7. Push to fork
git push origin feature/workflow-transitions

# 8. Merge to main
git checkout main
git merge feature/workflow-transitions
git push origin main

# 9. Build Docker image
docker build -f ~/.claude/mcp-servers/jira/Dockerfile \
  -t my-jira-mcp:latest .

# 10. Deploy
cd ~/.claude/mcp-servers/jira
docker-compose down
docker-compose up -d

# 11. Test in Claude Code
# "What transitions are available for CORE-123?"
# ✅ Works!
```

---

## Shared Infrastructure

The `shared/` directory contains infrastructure used by multiple MCP servers:

### PostgreSQL with pgvector

Provides semantic search capabilities for MCPs that need embedding storage and vector similarity search.

**Configuration:**

```yaml
# shared/docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: mcp-postgres
    ports:
      - "5433:5432"  # Port 5433 to avoid conflicts
    environment:
      POSTGRES_USER: mcp
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: mcp
```

**Initial Schema:**

The `shared/init.sql` script creates:
- `pgvector` extension for vector similarity search
- `session_memory` schema for Claude Code session storage
- Tables for sessions and messages with embedding columns
- IVFFlat indexes for efficient semantic search

**Connecting from MCPs:**

MCPs can connect to the shared database via the Docker network:

```
postgresql://mcp:password@mcp-postgres:5432/mcp
```

Or from the host:

```
postgresql://mcp:password@localhost:5433/mcp
```

---

## Future MCP Servers

**Planned:**
- **Session Memory MCP** (semantic search over Claude Code sessions) - *Next up*
- Slack MCP (for notifications, channel management)
- Sentry MCP (for error tracking, issue management)
- Datadog MCP (for log search, monitoring)
- GitHub MCP (for GitHub repos and PRs)
- Database MCP (for schema inspection, queries)

**Pattern:** All will follow the same fork → develop → deploy workflow.

---

**Last Updated:** 2025-12-23
**Maintained By:** your team
