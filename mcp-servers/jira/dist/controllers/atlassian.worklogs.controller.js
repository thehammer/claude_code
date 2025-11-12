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
const atlassian_worklogs_formatter_js_1 = require("./atlassian.worklogs.formatter.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
const adf_from_markdown_util_js_1 = require("../utils/adf-from-markdown.util.js");
const adf_from_text_util_js_1 = require("../utils/adf-from-text.util.js");
// Create a contextualized logger for this file
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.controller.ts');
// Log controller initialization
controllerLogger.debug('Jira worklogs controller initialized');
/**
 * Parse time duration string to seconds
 * Supports formats like "2h 30m", "1d", "45m", "1d 2h 30m"
 * @param timeString Time string in Jira format
 * @returns Number of seconds
 */
function parseTimeToSeconds(timeString) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.controller.ts', 'parseTimeToSeconds');
    methodLogger.debug(`Parsing time string: ${timeString}`);
    const regex = /(\d+)([dwhmsDWHMS])/g;
    let totalSeconds = 0;
    let match;
    while ((match = regex.exec(timeString)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'w':
                totalSeconds += value * 5 * 8 * 3600; // 5 days * 8 hours
                break;
            case 'd':
                totalSeconds += value * 8 * 3600; // 8 hours per day
                break;
            case 'h':
                totalSeconds += value * 3600;
                break;
            case 'm':
                totalSeconds += value * 60;
                break;
            case 's':
                totalSeconds += value;
                break;
        }
    }
    methodLogger.debug(`Parsed ${timeString} to ${totalSeconds} seconds`);
    return totalSeconds;
}
/**
 * List worklogs for a Jira issue
 * @param options Options for listing worklogs
 * @returns Promise with formatted worklog list
 */
async function listWorklogs(options) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.controller.ts', 'listWorklogs');
    methodLogger.debug('Listing worklogs for issue:', options);
    try {
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw new Error('Atlassian credentials are required for this operation');
        }
        // Apply defaults
        const defaults = {
            limit: defaults_util_js_1.DEFAULT_PAGE_SIZE,
            startAt: 0,
        };
        const mergedOptions = (0, defaults_util_js_1.applyDefaults)(options, defaults);
        // Get worklogs from service
        const worklogsData = await vendor_atlassian_issues_service_js_1.default.getWorklogs(mergedOptions.issueIdOrKey, {
            startAt: mergedOptions.startAt,
            maxResults: mergedOptions.limit,
            expand: mergedOptions.expand,
        });
        methodLogger.debug(`Retrieved ${worklogsData.worklogs?.length || 0} worklogs out of ${worklogsData.total || 0} total`);
        // Extract pagination info
        const pagination = (0, pagination_util_js_1.extractPaginationInfo)(worklogsData, pagination_util_js_1.PaginationType.OFFSET, 'Worklog');
        // Format worklogs
        const formattedWorklogs = (0, atlassian_worklogs_formatter_js_1.formatWorklogsList)(worklogsData.worklogs || [], mergedOptions.issueIdOrKey);
        // Add pagination if needed
        let contentWithPagination = formattedWorklogs;
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
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Worklogs', 'listing', 'controllers/atlassian.worklogs.controller.ts@listWorklogs', options.issueIdOrKey, { issueIdOrKey: options.issueIdOrKey }));
    }
}
/**
 * Add a worklog to a Jira issue
 * @param options Options for adding worklog
 * @returns Promise with confirmation message
 */
async function addWorklog(options) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.controller.ts', 'addWorklog');
    methodLogger.debug('Adding worklog to issue:', options);
    try {
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw new Error('Atlassian credentials are required for this operation');
        }
        // Convert time spent to seconds
        const timeSpentSeconds = parseTimeToSeconds(options.timeSpent);
        if (timeSpentSeconds === 0) {
            throw (0, error_util_js_1.createApiError)(`Invalid time format: "${options.timeSpent}". Use format like "2h 30m", "1d", etc.`, 400);
        }
        // Convert comment to ADF if provided
        let commentAdf;
        if (options.comment) {
            try {
                commentAdf = (0, adf_from_markdown_util_js_1.markdownToAdf)(options.comment);
            }
            catch (error) {
                methodLogger.warn('Failed to convert markdown to ADF, falling back to text', error);
                commentAdf = (0, adf_from_text_util_js_1.textToAdf)(options.comment);
            }
        }
        // Build request parameters
        const params = {
            timeSpentSeconds,
            started: options.started,
        };
        if (commentAdf) {
            params.comment = commentAdf;
        }
        // Handle estimate adjustment
        if (options.adjustEstimate) {
            params.adjustEstimate = options.adjustEstimate;
            if (options.adjustEstimate === 'new' && options.newEstimate) {
                params.newEstimate = options.newEstimate;
            }
            else if (options.adjustEstimate === 'manual' &&
                options.reduceBy) {
                params.reduceBy = options.reduceBy;
            }
        }
        // Add worklog via service
        const addedWorklog = await vendor_atlassian_issues_service_js_1.default.addWorklog(options.issueIdOrKey, params);
        methodLogger.debug(`Successfully added worklog with ID: ${addedWorklog.id}`);
        // Format confirmation
        const confirmation = (0, atlassian_worklogs_formatter_js_1.formatAddedWorklogConfirmation)(addedWorklog, options.issueIdOrKey);
        return {
            content: confirmation,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Worklog', 'adding', 'controllers/atlassian.worklogs.controller.ts@addWorklog', options.issueIdOrKey, {
            issueIdOrKey: options.issueIdOrKey,
            timeSpent: options.timeSpent,
        }));
    }
}
/**
 * Update an existing worklog
 * @param options Options for updating worklog
 * @returns Promise with confirmation message
 */
async function updateWorklog(options) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.controller.ts', 'updateWorklog');
    methodLogger.debug('Updating worklog:', options);
    try {
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw new Error('Atlassian credentials are required for this operation');
        }
        // Build update parameters
        const params = {};
        // Convert time spent to seconds if provided
        if (options.timeSpent) {
            const timeSpentSeconds = parseTimeToSeconds(options.timeSpent);
            if (timeSpentSeconds === 0) {
                throw (0, error_util_js_1.createApiError)(`Invalid time format: "${options.timeSpent}". Use format like "2h 30m", "1d", etc.`, 400);
            }
            params.timeSpentSeconds = timeSpentSeconds;
        }
        // Convert comment to ADF if provided
        if (options.comment) {
            try {
                params.comment = (0, adf_from_markdown_util_js_1.markdownToAdf)(options.comment);
            }
            catch (error) {
                methodLogger.warn('Failed to convert markdown to ADF, falling back to text', error);
                params.comment = (0, adf_from_text_util_js_1.textToAdf)(options.comment);
            }
        }
        // Add started time if provided
        if (options.started) {
            params.started = options.started;
        }
        // Update worklog via service
        const updatedWorklog = await vendor_atlassian_issues_service_js_1.default.updateWorklog(options.issueIdOrKey, options.worklogId, params);
        methodLogger.debug(`Successfully updated worklog ID: ${options.worklogId}`);
        // Format confirmation
        const confirmation = (0, atlassian_worklogs_formatter_js_1.formatUpdatedWorklogConfirmation)(updatedWorklog, options.issueIdOrKey);
        return {
            content: confirmation,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Worklog', 'updating', 'controllers/atlassian.worklogs.controller.ts@updateWorklog', `${options.issueIdOrKey}/${options.worklogId}`, {
            issueIdOrKey: options.issueIdOrKey,
            worklogId: options.worklogId,
        }));
    }
}
/**
 * Delete a worklog from a Jira issue
 * @param options Options for deleting worklog
 * @returns Promise with confirmation message
 */
async function deleteWorklog(options) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.controller.ts', 'deleteWorklog');
    methodLogger.debug('Deleting worklog:', options);
    try {
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw new Error('Atlassian credentials are required for this operation');
        }
        // Build delete parameters
        const params = {};
        // Handle estimate adjustment
        if (options.adjustEstimate) {
            params.adjustEstimate = options.adjustEstimate;
            if (options.adjustEstimate === 'new' && options.newEstimate) {
                params.newEstimate = options.newEstimate;
            }
            else if (options.adjustEstimate === 'manual' &&
                options.increaseBy) {
                params.increaseBy = options.increaseBy;
            }
        }
        // Delete worklog via service
        await vendor_atlassian_issues_service_js_1.default.deleteWorklog(options.issueIdOrKey, options.worklogId, params);
        methodLogger.debug(`Successfully deleted worklog ID: ${options.worklogId}`);
        // Format confirmation
        const confirmation = (0, atlassian_worklogs_formatter_js_1.formatDeletedWorklogConfirmation)(options.issueIdOrKey, options.worklogId);
        return {
            content: confirmation,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Worklog', 'deleting', 'controllers/atlassian.worklogs.controller.ts@deleteWorklog', `${options.issueIdOrKey}/${options.worklogId}`, {
            issueIdOrKey: options.issueIdOrKey,
            worklogId: options.worklogId,
        }));
    }
}
exports.default = {
    listWorklogs,
    addWorklog,
    updateWorklog,
    deleteWorklog,
};
