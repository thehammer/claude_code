import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Register the jira_ls_statuses tool with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance
 */
declare function registerTools(server: McpServer): void;
declare const _default: {
    registerTools: typeof registerTools;
};
export default _default;
