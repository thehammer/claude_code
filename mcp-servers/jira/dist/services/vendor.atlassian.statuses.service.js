"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const transport_util_js_1 = require("../utils/transport.util.js");
const vendor_atlassian_statuses_types_js_1 = require("./vendor.atlassian.statuses.types.js");
const error_util_js_1 = require("../utils/error.util.js");
const validation_util_js_1 = require("../utils/validation.util.js");
// Create a contextualized logger for this file
const serviceLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.statuses.service.ts');
const API_PATH = '/rest/api/3';
/**
 * List available Jira statuses.
 *
 * If projectKeyOrId is provided, fetches statuses relevant to that specific project's workflows.
 * Otherwise, fetches all statuses available in the Jira instance.
 *
 * @param {ListStatusesParams} params - Parameters including optional projectKeyOrId.
 * @returns {Promise<JiraGlobalStatusesResponse | JiraProjectStatusesResponse>} Raw API response.
 * @throws {Error} If credentials are missing or API request fails.
 */
async function listStatuses(params = {}) {
    const methodLogger = serviceLogger.forMethod('listStatuses');
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)('List statuses');
    }
    let path;
    if (params.projectKeyOrId) {
        methodLogger.debug(`Fetching statuses for project: ${params.projectKeyOrId}`);
        path = `${API_PATH}/project/${encodeURIComponent(params.projectKeyOrId)}/statuses`;
        try {
            const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
            return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_statuses_types_js_1.JiraProjectStatusesResponseSchema, `project statuses for ${params.projectKeyOrId}`, 'statuses.service');
        }
        catch (error) {
            // McpError is already properly structured from fetchAtlassian or validation
            if (error instanceof error_util_js_1.McpError) {
                throw error;
            }
            // Unexpected errors need to be wrapped
            methodLogger.error(`Unexpected error fetching statuses for project ${params.projectKeyOrId}:`, error);
            throw error;
        }
    }
    else {
        methodLogger.debug('Fetching global statuses');
        path = `${API_PATH}/status`;
        try {
            const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
            return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_statuses_types_js_1.JiraGlobalStatusesResponseSchema, 'global statuses', 'statuses.service');
        }
        catch (error) {
            // McpError is already properly structured from fetchAtlassian or validation
            if (error instanceof error_util_js_1.McpError) {
                throw error;
            }
            // Unexpected errors need to be wrapped
            methodLogger.error('Unexpected error fetching global statuses:', error);
            throw error;
        }
    }
}
exports.default = { listStatuses };
