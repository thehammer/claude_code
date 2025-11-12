"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const atlassian_issues_controller_js_1 = __importDefault(require("../controllers/atlassian.issues.controller.js"));
const formatter_util_js_1 = require("../utils/formatter.util.js");
/**
 * CLI module for managing Jira issues.
 * Provides commands for listing issues and retrieving issue details.
 * All commands require valid Atlassian credentials.
 */
// Create a contextualized logger for this file
const cliLogger = logger_util_js_1.Logger.forContext('cli/atlassian.issues.cli.ts');
// Log CLI module initialization
cliLogger.debug('Jira issues CLI module initialized');
/**
 * Register Jira Issues CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
function register(program) {
    const methodLogger = logger_util_js_1.Logger.forContext('cli/atlassian.issues.cli.ts', 'register');
    methodLogger.debug('Registering Jira Issues CLI commands...');
    registerListIssuesCommand(program);
    registerGetIssueCommand(program);
    methodLogger.debug('CLI commands registered successfully');
}
/**
 * Register the command for listing Jira issues
 * @param program - The Commander program instance
 */
function registerListIssuesCommand(program) {
    program
        .command('ls-issues')
        .description('Search for Jira issues using JQL (Jira Query Language), with pagination.')
        .option('-l, --limit <number>', 'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results.', '25')
        .option('-c, --start-at <number>', 'Index of the first item to return (0-based offset, starts at 0). Note: Jira uses offset-based pagination with startAt instead of cursor-based pagination used in other servers.')
        .option('-q, --jql <jql>', "Filter issues using JQL syntax (e.g., \"project = TEAM AND status = 'In Progress'\"). NOTE: JQL functions requiring user context (like currentUser()) may not work reliably with API token authentication and can cause errors; use explicit account IDs instead (e.g., assignee = 'accountid:...'). If omitted, returns issues according to your Jira default search.")
        .option('-p, --project-key-or-id <keyOrId>', 'Filter by a specific project key or ID. If --jql is also provided, this will be ANDed with it (e.g., project = YOUR_KEY AND (YOUR_JQL)).')
        .option('-s, --statuses <statuses...>', 'Filter by one or more status names (repeatable). Status names are case-sensitive and must match exactly as they appear in Jira (e.g., "In Progress", not "in progress"). Use the ls-statuses command first to find exact status names.')
        .option('-o, --order-by <field>', 'JQL ORDER BY clause (e.g., "priority DESC"). If not provided and a JQL query without ORDER BY is given, default sort is "updated DESC".')
        .action(async (options) => {
        const actionLogger = logger_util_js_1.Logger.forContext('cli/atlassian.issues.cli.ts', 'ls-issues');
        try {
            actionLogger.debug('Processing command options:', options);
            // Validate limit if provided
            let limit;
            if (options.limit) {
                limit = parseInt(options.limit, 10);
                if (isNaN(limit) || limit <= 0) {
                    throw new Error('Invalid --limit value: Must be a positive integer.');
                }
            }
            // Validate startAt if provided
            let startAt;
            if (options.startAt !== undefined) {
                startAt = parseInt(options.startAt, 10);
                if (isNaN(startAt) || startAt < 0) {
                    throw new Error('Invalid --start-at value: Must be a non-negative integer.');
                }
            }
            const filterOptions = {
                ...(options.jql && { jql: options.jql }),
                ...(options.projectKeyOrId && {
                    projectKeyOrId: options.projectKeyOrId,
                }),
                ...(options.statuses && { statuses: options.statuses }),
                ...(options.orderBy && { orderBy: options.orderBy }),
                ...(limit !== undefined && { limit: limit }),
                ...(startAt !== undefined && { startAt: startAt }),
            };
            actionLogger.debug('Fetching issues with filters:', filterOptions);
            const result = await atlassian_issues_controller_js_1.default.list(filterOptions);
            actionLogger.debug('Successfully retrieved issues');
            // Print the main content
            console.log((0, formatter_util_js_1.formatHeading)('Issues', 2));
            console.log(result.content);
        }
        catch (error) {
            actionLogger.error('Operation failed:', error);
            (0, error_util_js_1.handleCliError)(error);
        }
    });
}
/**
 * Register the command for retrieving a specific Jira issue
 * @param program - The Commander program instance
 */
function registerGetIssueCommand(program) {
    program
        .command('get-issue')
        .description('Get detailed information about a specific Jira issue using its ID or key.')
        .requiredOption('-i, --issue-id-or-key <idOrKey>', 'The ID or key of the Jira issue to retrieve (e.g., "10001" or "PROJ-123"). This is required and must be a valid issue ID or key from your Jira instance.')
        .action(async (options) => {
        const actionLogger = logger_util_js_1.Logger.forContext('cli/atlassian.issues.cli.ts', 'get-issue');
        try {
            actionLogger.debug('Processing command options:', options);
            // Validate issue ID/key
            if (!options.issueIdOrKey ||
                options.issueIdOrKey.trim() === '') {
                throw new Error('Issue ID or key must not be empty.');
            }
            actionLogger.debug(`Fetching issue: ${options.issueIdOrKey}`);
            const result = await atlassian_issues_controller_js_1.default.get({
                issueIdOrKey: options.issueIdOrKey,
            });
            // Print the content
            console.log(result.content);
        }
        catch (error) {
            (0, error_util_js_1.handleCliError)(error);
        }
    });
}
exports.default = { register };
