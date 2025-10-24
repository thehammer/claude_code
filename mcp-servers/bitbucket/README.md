# Bitbucket MCP Server (Docker)

This directory contains a Dockerized version of the @aashari Bitbucket MCP server running in HTTP mode.

## Quick Start

### 1. Create .env file

```bash
cd ~/.claude/mcp-servers/bitbucket

# Link to your existing credentials
ln -s ~/.claude/credentials/.env .env
```

Or copy and fill in the example:

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Build and start the server

```bash
docker-compose up -d --build
```

**Note:** First build takes ~2 minutes (npm install in container)

### 3. Check the logs

```bash
docker-compose logs -f
```

### 4. Test the connection

```bash
# Health check
curl http://localhost:3001/

# Should return: "Bitbucket MCP Server v1.45.0 is running"
```

## Configuration

The server runs on **port 3001** (Jira uses 3000). You can change this in `docker-compose.yml`.

## Environment Variables

- `ATLASSIAN_EMAIL`: Your Atlassian account email (for scoped tokens)
- `BITBUCKET_ACCESS_TOKEN`: Your Bitbucket access token (ATATT...)
- `BITBUCKET_WORKSPACE`: Your default workspace slug (e.g., "Bitbucketpassword1")

**Legacy (deprecated June 2026):**
- `ATLASSIAN_BITBUCKET_USERNAME`: Bitbucket username
- `ATLASSIAN_BITBUCKET_APP_PASSWORD`: App password

## Connecting from Claude Code

### Option 1: VSCode Settings (Recommended)

Add to your workspace or user settings:

```json
{
  "mcpServers": {
    "bitbucket": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

### Option 2: Global Settings File

Update `~/.claude/settings.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "bitbucket": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

## Available Tools (18 total)

### Workspaces & Repositories
- `ls-workspaces` - List workspaces
- `get-workspace` - Get workspace details
- `ls-repos` - List repositories
- `get-repo` - Get repository details
- `get-commit-history` - Get commit history
- `add-branch` - Create new branch
- `list-branches` - List all branches
- `get-file` - Get file content

### Pull Requests
- `ls-prs` - List pull requests
- `get-pr` - Get PR details
- `ls-pr-comments` - List PR comments
- `add-pr-comment` - Add comment to PR
- `add-pr` - Create pull request
- `update-pr` - Update pull request
- `approve-pr` - Approve pull request
- `reject-pr` - Request changes

### Search & Compare
- `search` - Search code
- `diff-branches` - Compare branches

## Port Allocation

- **3000**: Jira MCP Server
- **3001**: Bitbucket MCP Server

## Managing the Container

### View logs
```bash
docker-compose logs -f
```

### Restart
```bash
docker-compose restart
```

### Stop
```bash
docker-compose down
```

### Rebuild after updates
```bash
cd ~/Code/mcp-server-atlassian-bitbucket
git pull
npm run build

cd ~/.claude/mcp-servers/bitbucket
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check status
```bash
docker ps | grep bitbucket
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check if port 3001 is already in use
lsof -i :3001

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Can't connect from Claude Code
1. Verify container is running: `docker ps | grep bitbucket`
2. Test endpoint: `curl http://localhost:3001/`
3. Check logs: `docker-compose logs -f`
4. Restart Claude Code/VSCode

### Authentication errors
1. Check credentials in `.env`
2. Verify token hasn't expired
3. Test credentials manually:
   ```bash
   export ATLASSIAN_EMAIL="your.email@company.com"
   export ATLASSIAN_API_TOKEN="your_token"

   cd ~/Code/mcp-server-atlassian-bitbucket
   node dist/index.js ls-workspaces
   ```

## Architecture

```
~/.claude/mcp-servers/bitbucket/
├── Dockerfile                    # Container definition
├── docker-compose.yml            # Service configuration
├── .env                          # Credentials (symlink)
├── .env.example                  # Example credentials
└── README.md                     # This file

~/Code/mcp-server-atlassian-bitbucket/
├── dist/                         # Built JavaScript (source)
├── src/                          # TypeScript source
└── package.json                  # Dependencies
```

**Build Process:**
1. docker-compose builds from source repo (`~/Code/mcp-server-atlassian-bitbucket`)
2. Copies `dist/` (pre-built) into container
3. Runs npm ci for production dependencies
4. Starts server in HTTP mode on port 3001

## Next Steps

After starting the container:

1. ✅ Verify running: `docker ps | grep bitbucket`
2. ✅ Test health: `curl http://localhost:3001/`
3. ✅ Configure Claude Code (see above)
4. ✅ Test tools: Use Claude to list PRs, repos, etc.
5. ✅ Update recipes to use MCP tools

## Related Documentation

- [Bitbucket MCP Installation](~/.claude/mcp-specs/bitbucket-mcp-installation.md)
- [Bitbucket MCP Evaluation](~/.claude/mcp-specs/bitbucket-mcp-evaluation.md)
- [Recipe: Create Carefeed PR](~/.claude/recipes/bitbucket/create-carefeed-pr.md)
