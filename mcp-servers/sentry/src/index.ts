#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';

import { config } from './utils/config';
import { Logger } from './utils/logger';
import sentryTools from './tools/sentry.tool';

const VERSION = '1.0.0';
const PACKAGE_NAME = 'sentry-mcp';

const logger = Logger.forContext('index');

let serverInstance: McpServer | null = null;
let transportInstance: StreamableHTTPServerTransport | StdioServerTransport | null = null;

/**
 * Start the MCP server
 */
async function startServer(mode: 'stdio' | 'http' = 'stdio'): Promise<McpServer> {
  logger.info(`Starting ${PACKAGE_NAME} v${VERSION}`);

  if (!config.isConfigured) {
    logger.warn('Sentry credentials not configured. Set SENTRY_API_TOKEN.');
  }

  serverInstance = new McpServer({
    name: PACKAGE_NAME,
    version: VERSION,
  });

  // Register tools
  logger.info('Registering tools...');
  sentryTools.registerTools(serverInstance);
  logger.info('Tools registered');

  if (mode === 'stdio') {
    logger.info('Using STDIO transport');
    transportInstance = new StdioServerTransport();

    try {
      await serverInstance.connect(transportInstance);
      logger.info('MCP server started on STDIO transport');
      setupGracefulShutdown();
      return serverInstance;
    } catch (err) {
      logger.error('Failed to start on STDIO transport', err);
      process.exit(1);
    }
  } else {
    // HTTP Transport with Express
    logger.info('Using HTTP transport');

    const app = express();
    app.use(cors());
    app.use(express.json());

    const mcpEndpoint = '/mcp';

    // Create transport instance
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // Connect server to transport
    await serverInstance.connect(transport);
    transportInstance = transport;

    // Handle all MCP requests
    app.all(mcpEndpoint, (req: Request, res: Response) => {
      transport
        .handleRequest(req, res, req.body)
        .catch((err: unknown) => {
          logger.error('Error handling request', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
    });

    // Health check endpoint
    app.get('/', (_req: Request, res: Response) => {
      res.send(`${PACKAGE_NAME} v${VERSION} is running`);
    });

    // Start HTTP server
    await new Promise<void>((resolve) => {
      app.listen(config.port, () => {
        logger.info(`HTTP transport listening on http://localhost:${config.port}${mcpEndpoint}`);
        resolve();
      });
    });

    setupGracefulShutdown();
    return serverInstance;
  }
}

/**
 * Set up graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
  const shutdown = async () => {
    try {
      logger.info('Shutting down gracefully...');

      if (
        transportInstance &&
        'close' in transportInstance &&
        typeof transportInstance.close === 'function'
      ) {
        await transportInstance.close();
      }

      if (serverInstance && typeof serverInstance.close === 'function') {
        await serverInstance.close();
      }

      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err);
      process.exit(1);
    }
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal as NodeJS.Signals, shutdown);
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const mode = config.transportMode;
  logger.info(`Starting server with ${mode.toUpperCase()} transport`);
  await startServer(mode);
  logger.info('Server is running');
}

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    logger.error('Unhandled error in main', err);
    process.exit(1);
  });
}

export { startServer };
