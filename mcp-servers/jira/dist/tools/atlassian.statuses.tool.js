"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const atlassian_statuses_types_js_1 = require("./atlassian.statuses.types.js");
const atlassian_statuses_controller_js_1 = __importDefault(require("../controllers/atlassian.statuses.controller.js"));
const toolLogger = logger_util_js_1.Logger.forContext('tools/atlassian.statuses.tool.ts');
toolLogger.debug('Jira statuses tool module initialized');
/**
 * Handler for jira_ls_statuses tool.
 * Lists available Jira statuses, optionally filtering by project.
 *
 * @param {ListStatusesToolArgsType} args - Tool arguments with optional projectKeyOrId
 * @returns {Promise<object>} MCP response object with formatted Markdown
 */
async function handleListStatuses(args) {
    const methodLogger = toolLogger.forMethod('handleListStatuses');
    methodLogger.debug('Listing Jira statuses with arguments:', args);
    try {
        const result = await atlassian_statuses_controller_js_1.default.listStatuses(args);
        methodLogger.debug('Successfully retrieved statuses');
        return {
            content: [
                {
                    type: 'text',
                    text: result.content,
                },
            ],
        };
    }
    catch (error) {
        methodLogger.error('Failed to list statuses', error);
        return (0, error_util_js_1.formatErrorForMcpTool)(error);
    }
}
/**
 * Register the jira_ls_statuses tool with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance
 */
function registerTools(server) {
    const methodLogger = toolLogger.forMethod('registerTools');
    methodLogger.debug('Registering Jira statuses tools...');
    server.tool('jira_ls_statuses', `Lists available Jira statuses, either globally or for a specific project (\`projectKeyOrId\`).
Use this to discover valid status names and IDs needed for filtering issues (e.g., in \`jira_ls_issues\`).
**Important:** This tool returns *all* available statuses in a single response. The underlying Jira API does not support pagination for this endpoint, so parameters like \`limit\` or pagination tokens are not applicable.
Returns a formatted Markdown list of statuses including name, ID, description, and category (To Do, In Progress, Done).
Requires Jira credentials to be configured.`, atlassian_statuses_types_js_1.ListStatusesToolArgs.shape, handleListStatuses);
    methodLogger.debug('Successfully registered Jira statuses tools');
}
exports.default = { registerTools };
