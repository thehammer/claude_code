"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const transport_util_js_1 = require("../utils/transport.util.js");
const vendor_atlassian_transitions_types_js_1 = require("./vendor.atlassian.transitions.types.js");
const error_util_js_1 = require("../utils/error.util.js");
const validation_util_js_1 = require("../utils/validation.util.js");
const adf_from_text_util_js_1 = require("../utils/adf-from-text.util.js");
// Create a contextualized logger for this file
const serviceLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.transitions.service.ts');
const API_PATH = '/rest/api/3';
/**
 * Get available transitions for a Jira issue.
 *
 * @param {GetTransitionsParams} params - Parameters including issueIdOrKey.
 * @returns {Promise<JiraTransitionsResponse>} Raw API response with available transitions.
 * @throws {Error} If credentials are missing or API request fails.
 */
async function getTransitions(params) {
    const methodLogger = serviceLogger.forMethod('getTransitions');
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)('Get transitions');
    }
    const { issueIdOrKey } = params;
    methodLogger.debug(`Fetching transitions for issue: ${issueIdOrKey}`);
    const path = `${API_PATH}/issue/${encodeURIComponent(issueIdOrKey)}/transitions`;
    try {
        const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
        return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_transitions_types_js_1.JiraTransitionsResponseSchema, `transitions for ${issueIdOrKey}`, 'transitions.service');
    }
    catch (error) {
        // McpError is already properly structured from fetchAtlassian or validation
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        // Unexpected errors need to be wrapped
        methodLogger.error(`Unexpected error fetching transitions for issue ${issueIdOrKey}:`, error);
        throw error;
    }
}
/**
 * Transition a Jira issue to a new status.
 *
 * @param {TransitionIssueParams} params - Parameters including issueIdOrKey, transitionId, optional comment and fields.
 * @returns {Promise<void>} Resolves when transition is successful.
 * @throws {Error} If credentials are missing or API request fails.
 */
async function transitionIssue(params) {
    const methodLogger = serviceLogger.forMethod('transitionIssue');
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)('Transition issue');
    }
    const { issueIdOrKey, transitionId, comment, fields } = params;
    methodLogger.debug(`Transitioning issue ${issueIdOrKey} with transition ID: ${transitionId}`);
    const path = `${API_PATH}/issue/${encodeURIComponent(issueIdOrKey)}/transitions`;
    // Build request body
    // Note: Jira API requires the transition ID as a number, not a string
    const body = {
        transition: { id: parseInt(transitionId, 10) },
    };
    // Add comment if provided
    if (comment) {
        body.update = {
            comment: [
                {
                    add: {
                        body: (0, adf_from_text_util_js_1.textToAdf)(comment),
                    },
                },
            ],
        };
    }
    // Add fields if provided
    if (fields) {
        body.fields = fields;
    }
    try {
        // Note: fetchAtlassian handles JSON.stringify internally, pass object not string
        await (0, transport_util_js_1.fetchAtlassian)(credentials, path, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        methodLogger.debug(`Successfully transitioned issue ${issueIdOrKey}`);
    }
    catch (error) {
        // McpError is already properly structured from fetchAtlassian
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        // Unexpected errors need to be wrapped
        methodLogger.error(`Unexpected error transitioning issue ${issueIdOrKey}:`, error);
        throw error;
    }
}
exports.default = { getTransitions, transitionIssue };
