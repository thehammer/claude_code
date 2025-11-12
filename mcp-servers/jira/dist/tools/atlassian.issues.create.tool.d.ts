import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Register Atlassian Issues Create MCP Tools
 *
 * Registers the get-create-meta and create-issue tools with the MCP server.
 * Each tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
declare function registerTools(server: McpServer): void;
declare const _default: {
    registerTools: typeof registerTools;
};
export default _default;
