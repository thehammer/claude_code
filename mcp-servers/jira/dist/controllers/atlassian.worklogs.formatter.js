"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatWorklogsList = formatWorklogsList;
exports.formatAddedWorklogConfirmation = formatAddedWorklogConfirmation;
exports.formatUpdatedWorklogConfirmation = formatUpdatedWorklogConfirmation;
exports.formatDeletedWorklogConfirmation = formatDeletedWorklogConfirmation;
const logger_util_js_1 = require("../utils/logger.util.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
const adf_to_markdown_util_js_1 = require("../utils/adf-to-markdown.util.js");
/**
 * Convert seconds to human-readable duration
 * @param seconds Number of seconds
 * @returns Human-readable duration (e.g., "2h 30m")
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const days = Math.floor(hours / 8); // Assuming 8-hour work day
    const remainingHours = hours % 8;
    const parts = [];
    if (days > 0) {
        parts.push(`${days}d`);
    }
    if (remainingHours > 0) {
        parts.push(`${remainingHours}h`);
    }
    if (minutes > 0 && days === 0) {
        // Only show minutes if less than a day
        parts.push(`${minutes}m`);
    }
    return parts.join(' ') || '0m';
}
/**
 * Format a list of worklogs for display
 * @param worklogs Array of worklog objects
 * @param issueKey The issue key for context
 * @returns Formatted string for display
 */
function formatWorklogsList(worklogs, issueKey) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.formatter.ts', 'formatWorklogsList');
    methodLogger.debug(`Formatting ${worklogs.length} worklogs for issue ${issueKey}`);
    if (worklogs.length === 0) {
        return `${(0, formatter_util_js_1.formatHeading)('Worklogs for Issue ' + issueKey, 2)}\n\nNo worklogs found for this issue.`;
    }
    // Calculate total time
    const totalSeconds = worklogs.reduce((sum, worklog) => sum + (worklog.timeSpentSeconds || 0), 0);
    const totalTimeFormatted = formatDuration(totalSeconds);
    // Format header
    let output = (0, formatter_util_js_1.formatHeading)(`Worklogs for Issue ${issueKey}`, 2) + '\n\n';
    output +=
        (0, formatter_util_js_1.formatHeading)(`Total Time Logged: ${totalTimeFormatted}`, 3) + '\n\n';
    // Format each worklog
    worklogs.forEach((worklog, index) => {
        const author = worklog.author?.displayName || 'Unknown';
        const started = worklog.started
            ? (0, formatter_util_js_1.formatDate)(new Date(worklog.started))
            : 'Unknown date';
        const timeSpent = worklog.timeSpent || formatDuration(worklog.timeSpentSeconds || 0);
        const worklogId = worklog.id || 'Unknown';
        // Format worklog header
        output += (0, formatter_util_js_1.formatHeading)(`${index + 1}. ${author} - ${started}`, 4);
        output += '\n';
        // Format worklog details
        const details = [
            `**Time Spent**: ${timeSpent}`,
            `**ID**: ${worklogId}`,
        ];
        // Add comment if present
        if (worklog.comment) {
            let commentText = '';
            try {
                // Try to convert ADF to markdown
                if (typeof worklog.comment === 'object' &&
                    'type' in worklog.comment &&
                    worklog.comment.type === 'doc') {
                    commentText = (0, adf_to_markdown_util_js_1.adfToMarkdown)(worklog.comment);
                }
                else if (typeof worklog.comment === 'string') {
                    commentText = worklog.comment;
                }
                if (commentText.trim()) {
                    details.push(`**Comment**: ${commentText.trim()}`);
                }
            }
            catch (error) {
                methodLogger.warn('Failed to parse worklog comment', error);
            }
        }
        output += details.map((detail) => `- ${detail}`).join('\n') + '\n\n';
    });
    // Add footer
    output += (0, formatter_util_js_1.formatSeparator)() + '\n';
    output += `Showing ${worklogs.length} worklog${worklogs.length !== 1 ? 's' : ''}`;
    return output;
}
/**
 * Format confirmation for added worklog
 * @param worklog The added worklog object
 * @param issueKey The issue key
 * @returns Formatted confirmation message
 */
function formatAddedWorklogConfirmation(worklog, issueKey) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.formatter.ts', 'formatAddedWorklogConfirmation');
    methodLogger.debug(`Formatting added worklog confirmation for ${issueKey}`);
    let output = (0, formatter_util_js_1.formatHeading)('Worklog Added Successfully', 2) + '\n\n';
    const details = [
        `**Issue**: ${issueKey}`,
        `**Time Logged**: ${worklog.timeSpent || formatDuration(worklog.timeSpentSeconds || 0)}`,
        `**Started**: ${worklog.started ? (0, formatter_util_js_1.formatDate)(new Date(worklog.started)) : 'Unknown'}`,
        `**Worklog ID**: ${worklog.id || 'Unknown'}`,
    ];
    // Add comment if present
    if (worklog.comment) {
        try {
            let commentText = '';
            if (typeof worklog.comment === 'object' &&
                'type' in worklog.comment &&
                worklog.comment.type === 'doc') {
                commentText = (0, adf_to_markdown_util_js_1.adfToMarkdown)(worklog.comment);
            }
            else if (typeof worklog.comment === 'string') {
                commentText = worklog.comment;
            }
            if (commentText.trim()) {
                details.push(`**Comment**: ${commentText.trim()}`);
            }
        }
        catch (error) {
            methodLogger.warn('Failed to parse worklog comment', error);
        }
    }
    output += details.map((detail) => `- ${detail}`).join('\n');
    return output;
}
/**
 * Format confirmation for updated worklog
 * @param worklog The updated worklog object
 * @param issueKey The issue key
 * @returns Formatted confirmation message
 */
function formatUpdatedWorklogConfirmation(worklog, issueKey) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.formatter.ts', 'formatUpdatedWorklogConfirmation');
    methodLogger.debug(`Formatting updated worklog confirmation for ${issueKey}`);
    let output = (0, formatter_util_js_1.formatHeading)('Worklog Updated Successfully', 2) + '\n\n';
    const details = [
        `**Issue**: ${issueKey}`,
        `**Worklog ID**: ${worklog.id || 'Unknown'}`,
        `**Time Spent**: ${worklog.timeSpent || formatDuration(worklog.timeSpentSeconds || 0)}`,
        `**Started**: ${worklog.started ? (0, formatter_util_js_1.formatDate)(new Date(worklog.started)) : 'Unknown'}`,
        `**Last Updated**: ${worklog.updated ? (0, formatter_util_js_1.formatDate)(new Date(worklog.updated)) : 'Unknown'}`,
    ];
    // Add comment if present
    if (worklog.comment) {
        try {
            let commentText = '';
            if (typeof worklog.comment === 'object' &&
                'type' in worklog.comment &&
                worklog.comment.type === 'doc') {
                commentText = (0, adf_to_markdown_util_js_1.adfToMarkdown)(worklog.comment);
            }
            else if (typeof worklog.comment === 'string') {
                commentText = worklog.comment;
            }
            if (commentText.trim()) {
                details.push(`**Comment**: ${commentText.trim()}`);
            }
        }
        catch (error) {
            methodLogger.warn('Failed to parse worklog comment', error);
        }
    }
    output += details.map((detail) => `- ${detail}`).join('\n');
    return output;
}
/**
 * Format confirmation for deleted worklog
 * @param issueKey The issue key
 * @param worklogId The deleted worklog ID
 * @returns Formatted confirmation message
 */
function formatDeletedWorklogConfirmation(issueKey, worklogId) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.worklogs.formatter.ts', 'formatDeletedWorklogConfirmation');
    methodLogger.debug(`Formatting deleted worklog confirmation for ${issueKey}`);
    let output = (0, formatter_util_js_1.formatHeading)('Worklog Deleted Successfully', 2) + '\n\n';
    const details = [
        `**Issue**: ${issueKey}`,
        `**Deleted Worklog ID**: ${worklogId}`,
    ];
    output += details.map((detail) => `- ${detail}`).join('\n');
    return output;
}
