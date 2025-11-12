"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStatusesList = formatStatusesList;
const logger_util_js_1 = require("../utils/logger.util.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
const formatterLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.statuses.formatter.ts');
/**
 * Formats a list of Jira statuses into a Markdown string.
 *
 * @param {JiraStatusDetail[]} statuses - Array of unique status details.
 * @param {string} [projectKeyOrId] - Optional project context for the heading.
 * @returns {string} Formatted Markdown string.
 */
function formatStatusesList(statuses, projectKeyOrId) {
    formatterLogger.debug(`Formatting ${statuses.length} statuses`, projectKeyOrId ? { projectKeyOrId } : {});
    if (!statuses || statuses.length === 0) {
        const context = projectKeyOrId ? ` for project ${projectKeyOrId}` : '';
        return (`No statuses found${context}.` +
            '\n\n' +
            (0, formatter_util_js_1.formatSeparator)() +
            '\n' +
            `*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    }
    const heading = projectKeyOrId
        ? `Statuses for Project ${projectKeyOrId}`
        : 'Available Jira Statuses';
    const lines = [(0, formatter_util_js_1.formatHeading)(heading, 1), ''];
    statuses.forEach((status) => {
        const statusDetails = {
            Name: status.name,
            ID: status.id,
            Category: status.statusCategory.name,
            Description: status.description || 'N/A',
        };
        lines.push((0, formatter_util_js_1.formatBulletList)(statusDetails));
        lines.push(''); // Add space between statuses
    });
    // Remove trailing newline
    if (lines[lines.length - 1] === '') {
        lines.pop();
    }
    // Add standard footer with timestamp
    lines.push('\n\n' + (0, formatter_util_js_1.formatSeparator)());
    lines.push(`*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    return lines.join('\n');
}
