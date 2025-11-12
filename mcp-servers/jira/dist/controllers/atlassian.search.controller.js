"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const error_handler_util_js_1 = require("../utils/error-handler.util.js");
const defaults_util_js_1 = require("../utils/defaults.util.js");
const atlassian_issues_controller_js_1 = __importDefault(require("./atlassian.issues.controller.js"));
/**
 * Search for Jira issues using JQL
 *
 * @param {ListIssuesToolArgsType} options - Options for the search
 * @returns {Promise<ControllerResponse>} Formatted search results in Markdown
 */
async function search(options = {}) {
    const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.search.controller.ts', 'search');
    controllerLogger.debug('Searching Jira content with options:', options);
    try {
        // Apply defaults to options
        const mergedOptions = (0, defaults_util_js_1.applyDefaults)(options, {
            limit: defaults_util_js_1.DEFAULT_PAGE_SIZE,
            jql: '',
            startAt: 0,
            projectKeyOrId: '',
            statuses: [],
            orderBy: '',
        });
        // Search issues using the issues controller
        const result = await atlassian_issues_controller_js_1.default.list({
            jql: mergedOptions.jql,
            limit: mergedOptions.limit,
            startAt: mergedOptions.startAt,
            projectKeyOrId: mergedOptions.projectKeyOrId,
            statuses: mergedOptions.statuses,
            orderBy: mergedOptions.orderBy,
        });
        // Format the search results
        // Note: result.content from issues controller already includes JQL and pagination info
        const formattedContent = `# Jira Search Results\n\n${result.content}`;
        controllerLogger.debug('Successfully retrieved and formatted search results');
        return {
            content: formattedContent,
        };
    }
    catch (error) {
        return (0, error_handler_util_js_1.handleControllerError)(error, {
            source: 'Jira',
            operation: 'search',
            entityType: 'issues',
        });
    }
}
exports.default = {
    search,
};
