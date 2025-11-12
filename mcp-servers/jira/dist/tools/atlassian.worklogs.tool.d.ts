import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Register Jira worklog tools with the MCP server
 * @param server The MCP server instance
 */
declare function registerTools(server: McpServer): void;
declare const _default: {
    registerTools: typeof registerTools;
};
export default _default;
