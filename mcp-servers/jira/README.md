# Jira MCP Server (Docker)

This directory contains a Dockerized version of the aashari Jira MCP server running in HTTP mode.

## Quick Start

### 1. Create .env file

```bash
# Link to your existing credentials
ln -s ~/.claude/credentials/.env .env
```

Or copy and fill in the example:

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start the server

```bash
docker-compose up -d
```

### 3. Check the logs

```bash
docker-compose logs -f
```

### 4. Test the connection

```bash
curl http://localhost:3000/health
```

## Configuration

The server runs on port 3000 by default. You can change this in `docker-compose.yml`.

## Environment Variables

- `ATLASSIAN_SITE_NAME`: Your Atlassian site (e.g., "carefeed")
- `ATLASSIAN_EMAIL`: Your Atlassian account email
- `ATLASSIAN_API_TOKEN`: Your Atlassian API token

## Connecting from Claude Code

Update your `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "jira": {
      "type": "http",
      "url": "http://localhost:3000"
    }
  }
}
```

## Stopping the server

```bash
docker-compose down
```

## Rebuilding after updates

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
