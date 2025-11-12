"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const atlassian_worklogs_controller_js_1 = __importDefault(require("../controllers/atlassian.worklogs.controller.js"));
const atlassian_worklogs_types_js_1 = require("./atlassian.worklogs.types.js");
// Create a contextualized logger for this file
const toolLogger = logger_util_js_1.Logger.forContext('tools/atlassian.worklogs.tool.ts');
// Log tool initialization
toolLogger.debug('Jira worklogs tool initialized');
/**
 * Handler for listing worklogs for an issue
 * @param args Tool arguments
 * @returns Formatted list of worklogs
 */
async function handleListWorklogs(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('tools/atlassian.worklogs.tool.ts', 'handleListWorklogs');
    methodLogger.debug('Handling list worklogs request', args);
    try {
        const result = await atlassian_worklogs_controller_js_1.default.listWorklogs(args);
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
        methodLogger.error('Error listing worklogs', error);
        return (0, error_util_js_1.formatErrorForMcpTool)(error);
    }
}
/**
 * Handler for adding a worklog to an issue
 * @param args Tool arguments
 * @returns Confirmation of added worklog
 */
async function handleAddWorklog(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('tools/atlassian.worklogs.tool.ts', 'handleAddWorklog');
    methodLogger.debug('Handling add worklog request', args);
    try {
        const result = await atlassian_worklogs_controller_js_1.default.addWorklog(args);
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
        methodLogger.error('Error adding worklog', error);
        return (0, error_util_js_1.formatErrorForMcpTool)(error);
    }
}
/**
 * Handler for updating an existing worklog
 * @param args Tool arguments
 * @returns Confirmation of updated worklog
 */
async function handleUpdateWorklog(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('tools/atlassian.worklogs.tool.ts', 'handleUpdateWorklog');
    methodLogger.debug('Handling update worklog request', args);
    try {
        const result = await atlassian_worklogs_controller_js_1.default.updateWorklog(args);
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
        methodLogger.error('Error updating worklog', error);
        return (0, error_util_js_1.formatErrorForMcpTool)(error);
    }
}
/**
 * Handler for deleting a worklog
 * @param args Tool arguments
 * @returns Confirmation of deleted worklog
 */
async function handleDeleteWorklog(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('tools/atlassian.worklogs.tool.ts', 'handleDeleteWorklog');
    methodLogger.debug('Handling delete worklog request', args);
    try {
        const result = await atlassian_worklogs_controller_js_1.default.deleteWorklog(args);
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
        methodLogger.error('Error deleting worklog', error);
        return (0, error_util_js_1.formatErrorForMcpTool)(error);
    }
}
/**
 * Register Jira worklog tools with the MCP server
 * @param server The MCP server instance
 */
function registerTools(server) {
    const registerLogger = logger_util_js_1.Logger.forContext('tools/atlassian.worklogs.tool.ts', 'registerTools');
    registerLogger.debug('Registering Jira worklog tools');
    // Register list worklogs tool
    server.tool('jira_ls_worklogs', 'List worklogs for a Jira issue. Shows all work logged on an issue including time spent, authors, and comments.', atlassian_worklogs_types_js_1.ListWorklogsToolArgsSchema.shape, handleListWorklogs);
    registerLogger.debug('Registered jira_ls_worklogs tool');
    // Register add worklog tool
    server.tool('jira_add_worklog', 'Add a worklog entry to a Jira issue. Logs time spent working on an issue with optional comment and estimate adjustment.', atlassian_worklogs_types_js_1.AddWorklogToolArgsSchema.shape, handleAddWorklog);
    registerLogger.debug('Registered jira_add_worklog tool');
    // Register update worklog tool
    server.tool('jira_update_worklog', 'Update an existing worklog entry. Modify the time spent, comment, or start time of a previously logged work entry.', atlassian_worklogs_types_js_1.UpdateWorklogToolArgsSchema.shape, handleUpdateWorklog);
    registerLogger.debug('Registered jira_update_worklog tool');
    // Register delete worklog tool
    server.tool('jira_delete_worklog', 'Delete a worklog entry from a Jira issue. Removes a previously logged work entry with optional estimate adjustment.', atlassian_worklogs_types_js_1.DeleteWorklogToolArgsSchema.shape, handleDeleteWorklog);
    registerLogger.debug('Registered jira_delete_worklog tool');
    registerLogger.debug('All Jira worklog tools registered successfully');
}
exports.default = { registerTools };
