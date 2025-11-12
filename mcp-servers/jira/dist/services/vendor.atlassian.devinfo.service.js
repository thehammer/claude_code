"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const transport_util_js_1 = require("../utils/transport.util.js");
const vendor_atlassian_issues_types_js_1 = require("./vendor.atlassian.issues.types.js");
const error_util_js_1 = require("../utils/error.util.js");
const validation_util_js_1 = require("../utils/validation.util.js");
// Create a contextualized logger for this file
const logger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.devinfo.service.ts');
// Log service initialization
logger.debug('Jira development info service initialized');
/**
 * Base API path for Dev Status API
 * @constant {string}
 */
const API_PATH = '/rest/dev-status/latest';
/**
 * Get development information summary for an issue
 * @param issueId The issue ID
 * @returns Development information summary
 */
async function getSummary(issueId) {
    const methodLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.devinfo.service.ts', 'getSummary');
    methodLogger.debug(`Getting development info summary for issue ${issueId}`);
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)(`Get dev info summary for issue ${issueId}`);
    }
    try {
        const path = `${API_PATH}/issue/summary?issueId=${issueId}`;
        methodLogger.debug(`Calling Jira API: ${path}`);
        const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
        return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_issues_types_js_1.DevInfoSummaryResponseSchema, `dev info summary for issue ${issueId}`, 'devinfo.service');
    }
    catch (error) {
        // McpError is already properly structured from fetchAtlassian or validation
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        methodLogger.error(`Error fetching development info summary for issue ${issueId}:`, error);
        throw error;
    }
}
/**
 * Get detailed commit information for an issue
 * @param issueId The issue ID
 * @returns Commit information details
 */
async function getCommits(issueId) {
    const methodLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.devinfo.service.ts', 'getCommits');
    methodLogger.debug(`Getting commits for issue ${issueId}`);
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)(`Get commits for issue ${issueId}`);
    }
    try {
        // Bitbucket is the application type revealed in testing
        const path = `${API_PATH}/issue/detail?issueId=${issueId}&applicationType=bitbucket&dataType=repository`;
        methodLogger.debug(`Calling Jira API: ${path}`);
        const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
        return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_issues_types_js_1.DevInfoResponseSchema, `dev info commits for issue ${issueId}`, 'devinfo.service');
    }
    catch (error) {
        // McpError is already properly structured from fetchAtlassian or validation
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        methodLogger.error(`Error fetching commit information for issue ${issueId}:`, error);
        throw error;
    }
}
/**
 * Get branch information for an issue
 * @param issueId The issue ID
 * @returns Branch information details
 */
async function getBranches(issueId) {
    const methodLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.devinfo.service.ts', 'getBranches');
    methodLogger.debug(`Getting branches for issue ${issueId}`);
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)(`Get branches for issue ${issueId}`);
    }
    try {
        const path = `${API_PATH}/issue/detail?issueId=${issueId}&applicationType=bitbucket&dataType=branch`;
        methodLogger.debug(`Calling Jira API: ${path}`);
        const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
        return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_issues_types_js_1.DevInfoResponseSchema, `dev info branches for issue ${issueId}`, 'devinfo.service');
    }
    catch (error) {
        // McpError is already properly structured from fetchAtlassian or validation
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        methodLogger.error(`Error fetching branch information for issue ${issueId}:`, error);
        throw error;
    }
}
/**
 * Get pull request information for an issue
 * @param issueId The issue ID
 * @returns Pull request information details
 */
async function getPullRequests(issueId) {
    const methodLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.devinfo.service.ts', 'getPullRequests');
    methodLogger.debug(`Getting pull requests for issue ${issueId}`);
    const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
    if (!credentials) {
        throw (0, error_util_js_1.createAuthMissingError)(`Get pull requests for issue ${issueId}`);
    }
    try {
        const path = `${API_PATH}/issue/detail?issueId=${issueId}&applicationType=bitbucket&dataType=pullrequest`;
        methodLogger.debug(`Calling Jira API: ${path}`);
        const rawData = await (0, transport_util_js_1.fetchAtlassian)(credentials, path);
        return (0, validation_util_js_1.validateResponse)(rawData, vendor_atlassian_issues_types_js_1.DevInfoResponseSchema, `dev info pull requests for issue ${issueId}`, 'devinfo.service');
    }
    catch (error) {
        // McpError is already properly structured from fetchAtlassian or validation
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        methodLogger.error(`Error fetching pull request information for issue ${issueId}:`, error);
        throw error;
    }
}
/**
 * Get all development information for an issue (summary, commits, branches, pull requests)
 * @param issueId The issue ID
 * @returns Complete development information
 */
async function getAllDevInfo(issueId) {
    const methodLogger = logger_util_js_1.Logger.forContext('services/vendor.atlassian.devinfo.service.ts', 'getAllDevInfo');
    methodLogger.debug(`Getting all development info for issue ${issueId}`);
    try {
        const [summary, commits, branches, pullRequests] = await Promise.all([
            getSummary(issueId),
            getCommits(issueId),
            getBranches(issueId),
            getPullRequests(issueId),
        ]);
        return {
            summary,
            commits,
            branches,
            pullRequests,
        };
    }
    catch (error) {
        methodLogger.error(`Error fetching all development information for issue ${issueId}:`, error);
        throw error;
    }
}
exports.default = {
    getSummary,
    getCommits,
    getBranches,
    getPullRequests,
    getAllDevInfo,
};
