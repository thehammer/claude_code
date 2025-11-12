"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_atlassian_statuses_service_js_1 = __importDefault(require("../services/vendor.atlassian.statuses.service.js"));
const logger_util_js_1 = require("../utils/logger.util.js");
const error_handler_util_js_1 = require("../utils/error-handler.util.js");
const atlassian_statuses_formatter_js_1 = require("./atlassian.statuses.formatter.js");
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.statuses.controller.ts');
controllerLogger.debug('Jira statuses controller initialized');
/**
 * List Jira statuses, optionally filtering by project.
 *
 * Handles fetching statuses either globally or for a specific project,
 * processing the potentially different API responses, and formatting the result.
 *
 * @param {ListStatusesToolArgsType} options - Options including optional projectKeyOrId.
 * @returns {Promise<ControllerResponse>} Formatted list of statuses.
 */
async function listStatuses(options = {}) {
    const methodLogger = controllerLogger.forMethod('listStatuses');
    methodLogger.debug('Listing Jira statuses...', options);
    try {
        const rawResponse = await vendor_atlassian_statuses_service_js_1.default.listStatuses(options);
        let uniqueStatuses = [];
        if (options.projectKeyOrId) {
            // Handle project-specific response (array of issue types with nested statuses)
            methodLogger.debug('Processing project-specific status response');
            const projectResponse = rawResponse;
            const statusMap = new Map();
            projectResponse.forEach((issueType) => {
                issueType.statuses.forEach((status) => {
                    if (!statusMap.has(status.id)) {
                        statusMap.set(status.id, status);
                    }
                });
            });
            uniqueStatuses = Array.from(statusMap.values());
            methodLogger.debug(`Found ${uniqueStatuses.length} unique statuses for project`);
        }
        else {
            // Handle global response (simple array of statuses)
            methodLogger.debug('Processing global status response');
            uniqueStatuses = rawResponse;
            methodLogger.debug(`Found ${uniqueStatuses.length} global statuses`);
        }
        // Sort statuses alphabetically by name for consistent output
        uniqueStatuses.sort((a, b) => a.name.localeCompare(b.name));
        // Format the unique statuses
        const formattedContent = (0, atlassian_statuses_formatter_js_1.formatStatusesList)(uniqueStatuses, options.projectKeyOrId);
        return {
            content: formattedContent,
            // Pagination is not typically supported/needed for status lists
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, {
            entityType: 'Statuses',
            operation: 'listing',
            source: 'controllers/atlassian.statuses.controller.ts@listStatuses',
            additionalInfo: options,
        });
    }
}
exports.default = { listStatuses };
