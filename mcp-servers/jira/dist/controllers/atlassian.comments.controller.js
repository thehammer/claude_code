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
const atlassian_comments_formatter_js_1 = require("./atlassian.comments.formatter.js");
const adf_from_markdown_util_js_1 = require("../utils/adf-from-markdown.util.js");
const adf_from_text_util_js_1 = require("../utils/adf-from-text.util.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
// Create a contextualized logger for this file
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.comments.controller.ts');
// Log controller initialization
controllerLogger.debug('Jira comments controller initialized');
/**
 * List comments for a specific Jira issue
 *
 * @async
 * @param {object} options - Controller options for listing comments
 * @param {string} options.issueIdOrKey - The ID or key of the issue to get comments for
 * @param {number} [options.limit=25] - Maximum number of comments to return (1-100)
 * @param {number} [options.startAt] - Index of the first comment to return (0-based offset)
 * @param {string} [options.orderBy] - Field and direction to order results by (e.g., "created DESC")
 * @returns {Promise<ControllerResponse>} - Promise containing formatted comments list and pagination information
 * @throws {Error} - Throws standardized error if operation fails
 */
async function listComments(options) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.comments.controller.ts', 'listComments');
    try {
        methodLogger.debug('Listing comments for issue', options);
        // Check if credentials exist
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw (0, error_util_js_1.createAuthMissingError)('List issue comments');
        }
        // Apply defaults for pagination
        const params = (0, defaults_util_js_1.applyDefaults)(options, {
            limit: defaults_util_js_1.DEFAULT_PAGE_SIZE,
            startAt: 0,
        }); // Cast back to original type to preserve optional properties
        // Extract the required parameters
        const { issueIdOrKey, limit, startAt, orderBy } = params;
        // Map controller options to service parameters
        const serviceParams = {
            startAt,
            maxResults: limit,
            orderBy,
            expand: ['renderedBody'], // Include rendered content for HTML fallback
        };
        // Call the service to get comments
        const commentsData = await vendor_atlassian_issues_service_js_1.default.getComments(issueIdOrKey, serviceParams);
        // Extract pagination information
        const pagination = (0, pagination_util_js_1.extractPaginationInfo)(commentsData, pagination_util_js_1.PaginationType.OFFSET, 'Issue Comments');
        // Construct Jira base URL for linking
        const baseUrl = credentials
            ? `https://${credentials.siteName}.atlassian.net`
            : undefined;
        // Format comments using the formatter
        const formattedContent = (0, atlassian_comments_formatter_js_1.formatCommentsList)(commentsData.comments, issueIdOrKey, baseUrl);
        // Combine formatted content with pagination information
        let finalContent = formattedContent;
        if (pagination &&
            (pagination.hasMore || pagination.count !== undefined)) {
            const paginationString = (0, formatter_util_js_1.formatPagination)(pagination);
            finalContent += '\n\n' + paginationString;
        }
        // Return the controller response
        return {
            content: finalContent,
        };
    }
    catch (error) {
        // Handle and propagate errors using standard error handler
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Issue Comments', 'listing', 'controllers/atlassian.comments.controller.ts@listComments', options.issueIdOrKey, options));
    }
}
/**
 * Add a comment to a Jira issue
 *
 * @async
 * @param {object} options - Controller options for adding a comment
 * @param {string} options.issueIdOrKey - The ID or key of the issue to add a comment to
 * @param {string} options.commentBody - The content of the comment to add (supports Markdown formatting)
 * @returns {Promise<ControllerResponse>} - Promise containing confirmation message
 * @throws {Error} - Throws standardized error if operation fails
 */
async function addComment(options) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.comments.controller.ts', 'addComment');
    try {
        methodLogger.debug('Adding comment to issue', {
            issueIdOrKey: options.issueIdOrKey,
            commentBodyLength: options.commentBody?.length || 0,
        });
        // Check if credentials exist
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            throw (0, error_util_js_1.createAuthMissingError)('Atlassian credentials required to add issue comment');
        }
        // Extract the required parameters
        const { issueIdOrKey, commentBody } = options;
        // Validate the comment body is not empty
        if (!commentBody || commentBody.trim() === '') {
            throw (0, error_util_js_1.createApiError)('Comment body cannot be empty', 400);
        }
        // Convert markdown to ADF format with explicit error handling
        let adfBody;
        try {
            methodLogger.debug('Converting Markdown to ADF format');
            adfBody = (0, adf_from_markdown_util_js_1.markdownToAdf)(commentBody);
        }
        catch (adfError) {
            methodLogger.error('ADF conversion failed:', adfError);
            // Try fallback to simple plain text conversion
            methodLogger.debug('Falling back to simple text conversion');
            try {
                adfBody = (0, adf_from_text_util_js_1.textToAdf)(commentBody);
            }
            catch (textAdfError) {
                // If even the simple conversion fails, throw a validation error
                methodLogger.error('Fallback text-to-ADF conversion failed:', textAdfError);
                throw (0, error_util_js_1.createApiError)('Failed to convert comment to Jira-compatible format. Please simplify the comment content.', 400, { originalError: adfError, fallbackError: textAdfError });
            }
            // Log the fallback success
            methodLogger.info('Used text fallback for ADF conversion');
        }
        // Prepare the comment data for service
        const commentData = {
            body: adfBody,
            expand: ['renderedBody'], // Include rendered content for HTML fallback
        };
        // Call the service to add the comment
        const createdComment = await vendor_atlassian_issues_service_js_1.default.addComment(issueIdOrKey, commentData);
        // Construct Jira base URL for linking
        const baseUrl = credentials
            ? `https://${credentials.siteName}.atlassian.net`
            : undefined;
        // Format the confirmation message
        const formattedContent = (0, atlassian_comments_formatter_js_1.formatAddedCommentConfirmation)(createdComment, issueIdOrKey, baseUrl);
        // Return the controller response
        return {
            content: formattedContent,
        };
    }
    catch (error) {
        // Handle and propagate errors using standard error handler
        throw (0, error_handler_util_js_1.handleControllerError)(error, (0, error_handler_util_js_1.buildErrorContext)('Issue Comment', 'adding', 'controllers/atlassian.comments.controller.ts@addComment', options.issueIdOrKey, {
            commentBodyLength: options.commentBody?.length || 0,
            commentBodyPreview: options.commentBody
                ? options.commentBody.length > 100
                    ? options.commentBody.substring(0, 100) + '...'
                    : options.commentBody
                : '<empty>',
        }));
    }
}
exports.default = {
    listComments,
    addComment,
};
