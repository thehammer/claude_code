---
title: Creating MCP Servers
tags:
  - guide
  - mcp
  - typescript
created: 2025-12-23
updated: 2025-12-23
---

# Creating MCP Servers

Guide for creating new MCP servers following established patterns.

## Directory Structure

```
~/.claude/mcp-servers/{name}/
├── src/
│   ├── index.ts           # Entry point
│   ├── utils/
│   │   ├── config.ts      # Configuration
│   │   └── logger.ts      # Logging
│   ├── services/
│   │   └── {name}.service.ts  # Business logic
│   └── tools/
│       ├── {name}.types.ts    # Zod schemas
│       └── {name}.tool.ts     # Tool registration
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env
└── .gitignore
```

## Key Patterns

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": false,
    "declaration": false,
    "skipLibCheck": true
  }
}
```

Using `strict: false` avoids MCP SDK type explosion issues.

### Tool Registration
```typescript
function getRegisterTool(server: McpServer) {
  return (server as any).tool.bind(server);
}

export function registerTools(server: McpServer): void {
  const registerTool = getRegisterTool(server);

  registerTool(
    'tool_name',
    'Tool description',
    Schema.shape,
    async (params) => { /* handler */ }
  );
}
```

### ES Module Entry Point
```typescript
// Don't use require.main === module
main().catch((err) => {
  logger.error('Unhandled error', err);
  process.exit(1);
});
```

### Dockerfile
```dockerfile
# Install all deps for build
RUN npm ci

# Build
RUN npm run build

# Prune to production
RUN npm prune --production && rm -rf src tsconfig.json
```

## Management

```bash
# Start
~/.claude/mcp-servers/bin/mcp-up {name}

# Stop
~/.claude/mcp-servers/bin/mcp-down {name}

# Status
~/.claude/mcp-servers/bin/mcp-status
```

## Ports

| MCP | Port |
|-----|------|
| Jira | 3000 |
| Bitbucket | 3001 |
| Session Memory | 3002 |
| Slack | 3003 |
| Datadog | 3004 |
| Sentry | 3005 |
| Knowledge | 3006 |
