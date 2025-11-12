"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const atlassian_comments_controller_js_1 = __importDefault(require("../controllers/atlassian.comments.controller.js"));
/**
 * CLI module for managing Jira issue comments.
 * Provides commands for listing comments and adding new comments to issues.
 * All commands require valid Atlassian credentials.
 */
// Create a logger context for this file
const cliLogger = logger_util_js_1.Logger.forContext('cli/atlassian.comments.cli.ts');
cliLogger.debug('Jira comments CLI module initialized');
/**
 * Register Jira Comments CLI commands
 * @param program - Commander program
 */
function register(program) {
    const methodLogger = logger_util_js_1.Logger.forContext('cli/atlassian.comments.cli.ts', 'register');
    methodLogger.debug('Registering Jira Comments CLI commands...');
    registerListCommentsCommand(program);
    registerAddCommentCommand(program);
    methodLogger.debug('CLI commands registered successfully');
}
/**
 * Register the command for listing comments for a specific issue
 * @param program - The Commander program
 */
function registerListCommentsCommand(program) {
    program
        .command('ls-comments')
        .description('List comments for a specific Jira issue, with pagination.')
        .requiredOption('-i, --issue-id-or-key <idOrKey>', 'ID or key of the issue to get comments for (e.g., "PROJ-123").')
        .option('-l, --limit <number>', 'Maximum number of comments to return (1-100).')
        .option('-s, --start-at <number>', 'Index of the first comment to return (0-based).')
        .option('-o, --order-by <sorting>', 'Sort field and direction (e.g., "created DESC" or "updated ASC").')
        .action(async (options) => {
        const actionLogger = logger_util_js_1.Logger.forContext('cli/atlassian.comments.cli.ts', 'ls-comments');
        try {
            actionLogger.debug('Processing command options', options);
            // Parse limit if provided
            let limit;
            if (options.limit) {
                limit = parseInt(options.limit, 10);
                if (isNaN(limit) || limit <= 0) {
                    throw new Error('Invalid --limit value: Must be a positive integer.');
                }
            }
            // Parse startAt if provided
            let startAt;
            if (options.startAt) {
                startAt = parseInt(options.startAt, 10);
                if (isNaN(startAt) || startAt < 0) {
                    throw new Error('Invalid --start-at value: Must be a non-negative integer.');
                }
            }
            // Call the controller
            const result = await atlassian_comments_controller_js_1.default.listComments({
                issueIdOrKey: options.issueIdOrKey,
                limit,
                startAt,
                orderBy: options.orderBy,
            });
            // Output the content
            console.log(result.content);
        }
        catch (error) {
            actionLogger.error('Error listing comments', error);
            (0, error_util_js_1.handleCliError)(error);
        }
    });
}
/**
 * Register the command for adding a comment to a specific issue
 * @param program - The Commander program
 */
function registerAddCommentCommand(program) {
    program
        .command('add-comment')
        .description('Add a comment to a specific Jira issue.')
        .requiredOption('-i, --issue-id-or-key <idOrKey>', 'ID or key of the issue to add a comment to (e.g., "PROJ-123").')
        .requiredOption('-b, --body <text>', 'Content of the comment to add. Supports Markdown formatting.')
        .action(async (options) => {
        const actionLogger = logger_util_js_1.Logger.forContext('cli/atlassian.comments.cli.ts', 'add-comment');
        try {
            actionLogger.debug('Processing command options', {
                issueIdOrKey: options.issueIdOrKey,
                bodyLength: options.body?.length || 0,
            });
            // Call the controller
            const result = await atlassian_comments_controller_js_1.default.addComment({
                issueIdOrKey: options.issueIdOrKey,
                commentBody: options.body,
            });
            // Output the content
            console.log(result.content);
        }
        catch (error) {
            actionLogger.error('Error adding comment', error);
            (0, error_util_js_1.handleCliError)(error);
        }
    });
}
exports.default = { register };
