"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const defaults_util_js_1 = require("../utils/defaults.util.js");
const transport_util_js_1 = require("../utils/transport.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const error_handler_util_js_1 = require("../utils/error-handler.util.js");
const pagination_util_js_1 = require("../utils/pagination.util.js");
const vendor_atlassian_issues_service_js_1 = __importDefault(require("../services/vendor.atlassian.issues.service.js"));
const vendor_atlassian_devinfo_service_js_1 = __importDefault(require("../services/vendor.atlassian.devinfo.service.js"));
const atlassian_issues_list_formatter_js_1 = require("./atlassian.issues.list.formatter.js");
const atlassian_issues_details_formatter_js_1 = require("./atlassian.issues.details.formatter.js");
const atlassian_issues_development_formatter_js_1 = require("./atlassian.issues.development.formatter.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
/**
 * Controller for managing Jira issues.
 * Provides functionality for listing issues and retrieving issue details.
 */
// Define default fields here (or import if defined elsewhere)
const DEFAULT_ISSUE_FIELDS = [
    'summary',
    'description',
    'status',
    'issuetype',
    'priority',
    'project',
    'assignee',
    'reporter',
    'creator',
    'created',
    'updated',
    'timetracking',
    'comment',
    'attachment',
    'worklog',
    'issuelinks',
    'labels',
];
// Create a contextualized logger for this file
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.issues.controller.ts');
// Log controller initialization
controllerLogger.debug('Jira issues controller initialized');
/**
 * List Jira issues with optional filtering
 * @param options - Optional filter options for the issues list
 * @param options.jql - JQL query to filter issues
 * @param options.limit - Maximum number of issues to return
 * @param options.cursor - Pagination cursor for retrieving the next set of results
 * @returns Promise with formatted issue list content and pagination information
 */
async function list(options = {}) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.issues.controller.ts', 'list');
    methodLogger.debug('Listing Jira issues (raw options received):', options);
    try {
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw new Error('Atlassian credentials are required for this operation');
        }
        // Create a defaults object with proper typing
        const defaults = {
            limit: defaults_util_js_1.DEFAULT_PAGE_SIZE,
            orderBy: 'updated DESC', // Jira default sort
            startAt: 0, // Default startAt to 0
        };
        // Apply defaults
        const mergedOptions = (0, defaults_util_js_1.applyDefaults)(options, defaults);
        methodLogger.debug('Listing Jira issues (merged options after defaults):', mergedOptions);
        // Revert to simpler JQL building logic, using statuses
        const jqlParts = [];
        if (mergedOptions.jql && mergedOptions.jql.trim() !== '') {
            jqlParts.push(mergedOptions.jql); // Pass user JQL directly without wrapping
        }
        if (mergedOptions.projectKeyOrId) {
            // No need to escape simple keys/IDs typically
            jqlParts.push(`project = ${mergedOptions.projectKeyOrId}`);
        }
        if (mergedOptions.statuses && mergedOptions.statuses.length > 0) {
            // Simply quote the status names without complex normalization
            // Status names in Jira are case-sensitive and must match exactly
            const quotedStatuses = mergedOptions.statuses.map((status) => `"${status.trim()}"`);
            const statusQuery = quotedStatuses.length === 1
                ? `status = ${quotedStatuses[0]}`
                : `status IN (${quotedStatuses.join(', ')})`;
            jqlParts.push(statusQuery);
        }
        let finalJql = jqlParts.join(' AND ');
        // Handle the case where no search criteria are provided
        if (finalJql.trim() === '') {
            // Default search if no criteria provided - must be bounded for new API
            // Use a reasonable time window to ensure the query is bounded
            finalJql = 'updated >= -90d';
        }
        // Apply ordering logic only after ensuring we have a base query
        if (mergedOptions.orderBy) {
            if (!finalJql.toUpperCase().includes('ORDER BY')) {
                finalJql += ` ORDER BY ${mergedOptions.orderBy}`;
            }
            else {
                methodLogger.warn('orderBy parameter ignored as provided JQL already contains ORDER BY clause.');
            }
        }
        else if (finalJql.trim() !== '' &&
            !finalJql.toUpperCase().includes('ORDER BY')) {
            // Apply default sort only if some JQL exists and no order is specified
            finalJql += ' ORDER BY updated DESC';
        }
        methodLogger.debug(`Executing generated JQL: ${finalJql}`);
        const params = {
            jql: finalJql,
            maxResults: mergedOptions.limit,
            startAt: mergedOptions.startAt,
            expand: ['renderedFields', 'names'],
            fields: DEFAULT_ISSUE_FIELDS, // Use defined constant
        };
        const issuesData = await vendor_atlassian_issues_service_js_1.default.search(params);
        methodLogger.debug(`Retrieved ${issuesData.issues.length} issues${issuesData.isLast ? ' (final page)' : ' (more available)'}`);
        const pagination = (0, pagination_util_js_1.extractPaginationInfo)(issuesData, pagination_util_js_1.PaginationType.OFFSET, 'Issue');
        // The formatter expects an object with issues and baseUrl
        if (!credentials || !credentials.siteName) {
            // Handle missing credentials/siteName - perhaps throw an error or default cautiously
            throw new Error('Missing necessary credentials (siteName) to construct base URL.');
        }
        const baseUrl = `https://${credentials.siteName}.atlassian.net`; // Construct baseUrl from siteName
        const formatterInput = {
            issues: issuesData.issues || [],
            baseUrl: baseUrl,
        };
        const formattedIssues = (0, atlassian_issues_list_formatter_js_1.formatIssuesList)(formatterInput);
        // Create JQL info section
        const jqlInfoText = `**Executed JQL Query:** \`${finalJql}\``;
        // Combine JQL info and issues content
        const finalContent = jqlInfoText + '\n\n' + formattedIssues;
        // Combine formatted content with pagination information
        let contentWithPagination = finalContent;
        if (pagination &&
            (pagination.hasMore || pagination.count !== undefined)) {
            const paginationString = (0, formatter_util_js_1.formatPagination)(pagination);
            contentWithPagination += '\n\n' + paginationString;
        }
        return {
            content: contentWithPagination,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Issues', 'listing', 'controllers/atlassian.issues.controller.ts@list', undefined, { options, jql: options.jql }));
    }
}
/**
 * Get a single Jira issue by ID or key
 * @param identifier Issue identifier (ID or key)
 * @returns Detailed issue information formatted as Markdown
 */
async function get(identifier) {
    const { issueIdOrKey } = identifier;
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.issues.controller.ts', 'get');
    methodLogger.debug(`Getting Jira issue with ID/key: ${issueIdOrKey}...`);
    // Validate issue ID/key format
    if (!issueIdOrKey || issueIdOrKey === 'invalid') {
        throw (0, error_util_js_1.createApiError)('Invalid issue ID or key', 400);
    }
    try {
        // Always include all fields
        const fields = [
            'summary',
            'description',
            'status',
            'issuetype',
            'priority',
            'project',
            'assignee',
            'reporter',
            'creator',
            'created',
            'updated',
            'timetracking',
            'comment',
            'attachment',
            'worklog',
            'issuelinks',
        ];
        // Get issue details
        const issueData = await vendor_atlassian_issues_service_js_1.default.get(issueIdOrKey, {
            fields,
        });
        methodLogger.debug(`Retrieved issue: ${issueIdOrKey}`);
        // Format the issue data for display using the formatter
        const formattedIssue = (0, atlassian_issues_details_formatter_js_1.formatIssueDetails)(issueData);
        // Get development information if available
        let devInfoSummary = null;
        let devInfoCommits = null;
        let devInfoBranches = null;
        let devInfoPullRequests = null;
        try {
            // Use the issue ID to get development information
            methodLogger.debug(`Getting development information for issue ID: ${issueData.id}...`);
            // Get summary first to check if there's any dev info available
            devInfoSummary = await vendor_atlassian_devinfo_service_js_1.default.getSummary(issueData.id);
            // If there's any development information available, get the details
            if (devInfoSummary?.summary?.repository?.overall?.count ||
                devInfoSummary?.summary?.branch?.overall?.count ||
                devInfoSummary?.summary?.pullrequest?.overall?.count) {
                // Fetch detailed development information
                methodLogger.debug('Development information available, fetching details...');
                // Run these in parallel for better performance
                [devInfoCommits, devInfoBranches, devInfoPullRequests] =
                    await Promise.all([
                        vendor_atlassian_devinfo_service_js_1.default.getCommits(issueData.id),
                        vendor_atlassian_devinfo_service_js_1.default.getBranches(issueData.id),
                        vendor_atlassian_devinfo_service_js_1.default.getPullRequests(issueData.id),
                    ]);
                methodLogger.debug('Successfully retrieved development information');
            }
            else {
                methodLogger.debug('No development information available for this issue');
            }
        }
        catch (error) {
            // Log the error but don't fail the whole request
            methodLogger.warn('Failed to retrieve development information:', error);
        }
        // Format development information if available
        const formattedDevInfo = (0, atlassian_issues_development_formatter_js_1.formatDevelopmentInfo)(devInfoSummary, devInfoCommits, devInfoBranches, devInfoPullRequests);
        // Combine the formatted issue details with the formatted development information
        const combinedContent = formattedDevInfo
            ? `${formattedIssue}\n${formattedDevInfo}`
            : formattedIssue;
        return {
            content: combinedContent,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Issue', 'retrieving', 'controllers/atlassian.issues.controller.ts@get', issueIdOrKey));
    }
}
exports.default = {
    list,
    get,
};
