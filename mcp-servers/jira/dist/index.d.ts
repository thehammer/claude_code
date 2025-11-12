#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Start the MCP server with the specified transport mode
 *
 * @param mode The transport mode to use (stdio or sse)
 * @returns Promise that resolves to the server instance when started successfully
 */
export declare function startServer(mode?: 'stdio' | 'http'): Promise<McpServer>;
