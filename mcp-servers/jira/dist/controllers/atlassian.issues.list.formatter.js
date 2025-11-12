"use strict";
/**
 * Formatter for Jira issues list
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIssuesList = formatIssuesList;
const formatter_util_js_1 = require("../utils/formatter.util.js");
const atlassian_issues_utils_formatter_js_1 = require("./atlassian.issues.utils.formatter.js");
/**
 * Format a list of issues for display
 * @param issuesData - Raw issues data from the API
 * @returns Formatted string with issues information in markdown format
 */
function formatIssuesList(issuesData) {
    const { issues } = issuesData;
    if (!issues || issues.length === 0) {
        return ('No issues found.' +
            '\n\n' +
            (0, formatter_util_js_1.formatSeparator)() +
            '\n' +
            `*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    }
    const lines = [(0, formatter_util_js_1.formatHeading)('Jira Issues', 1), ''];
    const formattedIssues = (0, formatter_util_js_1.formatNumberedList)(issues, (issue) => {
        const itemLines = [];
        itemLines.push((0, formatter_util_js_1.formatHeading)(`${issue.key}: ${issue.fields.summary}`, 2));
        const properties = {
            Key: issue.key,
            Summary: issue.fields.summary,
            Type: issue.fields.issuetype?.name,
            Status: `${(0, atlassian_issues_utils_formatter_js_1.getStatusEmoji)(issue.fields.status?.name)}${issue.fields.status?.name}`,
            Priority: `${(0, atlassian_issues_utils_formatter_js_1.getPriorityEmoji)(issue.fields.priority?.name)}${issue.fields.priority?.name}`,
            Project: issue.fields.project?.name,
            Assignee: issue.fields.assignee?.displayName,
            Reporter: issue.fields.reporter?.displayName,
            'Created On': (0, formatter_util_js_1.formatDate)(issue.fields.created),
            'Updated On': (0, formatter_util_js_1.formatDate)(issue.fields.updated),
            URL: {
                url: `${issuesData.baseUrl}/browse/${issue.key}`,
                title: issue.key,
            },
        };
        itemLines.push((0, formatter_util_js_1.formatBulletList)(properties));
        return itemLines.join('\n');
    });
    lines.push(formattedIssues);
    lines.push('\n\n' + (0, formatter_util_js_1.formatSeparator)());
    lines.push(`*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    return lines.join('\n');
}
