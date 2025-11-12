"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomFieldTools = registerCustomFieldTools;
const zod_1 = require("zod");
const logger_util_js_1 = require("../utils/logger.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const atlassian_customfields_controller_js_1 = __importDefault(require("../controllers/atlassian.customfields.controller.js"));
// Create a contextualized logger for this file
const toolLogger = logger_util_js_1.Logger.forContext('tools/atlassian.customfields.tool.ts');
// Log tool module initialization
toolLogger.debug('Jira custom fields tool module initialized');
/**
 * Tool arguments schema for getting custom field options
 */
const GetCustomFieldOptionsToolArgsSchema = zod_1.z.object({
    fieldId: zod_1.z
        .string()
        .describe('Custom field ID (numeric part only, e.g., "10275" for customfield_10275)'),
    startAt: zod_1.z
        .number()
        .optional()
        .default(0)
        .describe('Starting index for pagination (default: 0)'),
    maxResults: zod_1.z
        .number()
        .optional()
        .default(100)
        .describe('Maximum results to return (default: 100, max: 100)'),
});
/**
 * MCP Tool: Get Custom Field Options
 *
 * Gets the available options for a custom field in Jira.
 * Useful for discovering allowed values for select lists, checkboxes, etc.
 *
 * @param {GetCustomFieldOptionsToolArgsType} args - Tool arguments for getting custom field options
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted options
 * @throws Will return error message if options retrieval fails
 */
async function getCustomFieldOptions(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('tools/atlassian.customfields.tool.ts', 'getCustomFieldOptions');
    methodLogger.debug('Getting custom field options:', args);
    try {
        const validatedArgs = GetCustomFieldOptionsToolArgsSchema.parse(args);
        const result = await atlassian_customfields_controller_js_1.default.getCustomFieldOptions(validatedArgs.fieldId, validatedArgs.startAt, validatedArgs.maxResults);
        methodLogger.debug('Successfully retrieved custom field options');
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
        methodLogger.error('Error getting custom field options:', error);
        return (0, error_util_js_1.formatErrorForMcpTool)(error);
    }
}
/**
 * Register custom field tools with the MCP server
 * @param server MCP server instance
 */
function registerCustomFieldTools(server) {
    toolLogger.debug('Registering custom field tools');
    // Register get custom field options tool
    server.tool('jira_get_customfield_options', 'Get available options for a custom field. Use this to discover valid values for select lists, checkboxes, and other custom fields that have predefined options. Provide the numeric field ID only (e.g., "10275" for customfield_10275).', GetCustomFieldOptionsToolArgsSchema.shape, getCustomFieldOptions);
    toolLogger.debug('Custom field tools registered successfully');
}
