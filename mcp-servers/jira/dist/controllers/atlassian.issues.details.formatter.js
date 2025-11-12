"use strict";
/**
 * Formatter for Jira issue details
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIssueDetails = formatIssueDetails;
const adf_to_markdown_util_js_1 = require("../utils/adf-to-markdown.util.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
const atlassian_issues_utils_formatter_js_1 = require("./atlassian.issues.utils.formatter.js");
/**
 * Format detailed issue information for display
 * @param issueData - Raw issue data from the API
 * @returns Formatted string with issue details in markdown format
 */
function formatIssueDetails(issueData) {
    // Prepare URL
    const issueUrl = issueData.self.replace('/rest/api/3/issue/', '/browse/');
    const lines = [
        (0, formatter_util_js_1.formatHeading)(`Jira Issue: ${issueData.fields.summary}`, 1),
        '',
    ];
    // Add a brief summary line
    if (issueData.fields.status) {
        const statusEmoji = (0, atlassian_issues_utils_formatter_js_1.getStatusEmoji)(issueData.fields.status.name);
        const priorityEmoji = (0, atlassian_issues_utils_formatter_js_1.getPriorityEmoji)(issueData.fields.priority?.name);
        const summary = `> ${statusEmoji}A ${issueData.fields.status.name.toLowerCase()} issue ${priorityEmoji ? `with ${priorityEmoji}${issueData.fields.priority?.name} priority ` : ''}in the ${issueData.fields.project?.name} project.`;
        lines.push(summary);
        lines.push('');
    }
    // Basic Information section
    lines.push((0, formatter_util_js_1.formatHeading)('Basic Information', 2));
    const basicProperties = {
        ID: issueData.id,
        Key: issueData.key,
        Project: issueData.fields.project
            ? `${issueData.fields.project.name} (${issueData.fields.project.key})`
            : undefined,
        Type: issueData.fields.issuetype?.name,
        Status: `${(0, atlassian_issues_utils_formatter_js_1.getStatusEmoji)(issueData.fields.status?.name)}${issueData.fields.status?.name}`,
        Priority: `${(0, atlassian_issues_utils_formatter_js_1.getPriorityEmoji)(issueData.fields.priority?.name)}${issueData.fields.priority?.name}`,
    };
    lines.push((0, formatter_util_js_1.formatBulletList)(basicProperties, (key) => key));
    // Add issue type description if available
    if (issueData.fields.issuetype?.description) {
        lines.push(`  *${issueData.fields.issuetype.description}*`);
    }
    // Description
    if (issueData.fields.description) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Description', 2));
        // Handle different description formats
        if (typeof issueData.fields.description === 'string') {
            lines.push(issueData.fields.description);
        }
        else if (typeof issueData.fields.description === 'object') {
            lines.push((0, adf_to_markdown_util_js_1.adfToMarkdown)(issueData.fields.description));
        }
        else {
            lines.push('*Description format not supported*');
        }
    }
    // People
    lines.push('');
    lines.push((0, formatter_util_js_1.formatHeading)('People', 2));
    const peopleProperties = {
        Assignee: issueData.fields.assignee?.displayName || 'Unassigned',
        Reporter: issueData.fields.reporter?.displayName,
    };
    // Add creator only if different from reporter
    if (issueData.fields.creator &&
        (!issueData.fields.reporter ||
            issueData.fields.creator.displayName !==
                issueData.fields.reporter?.displayName)) {
        peopleProperties['Creator'] = issueData.fields.creator.displayName;
    }
    lines.push((0, formatter_util_js_1.formatBulletList)(peopleProperties, (key) => key));
    // Additional people details
    if (issueData.fields.assignee &&
        issueData.fields.assignee.active !== undefined) {
        lines.push(`  - **Active**: ${issueData.fields.assignee.active ? 'Yes' : 'No'}`);
    }
    if (issueData.fields.reporter &&
        issueData.fields.reporter.active !== undefined) {
        lines.push(`  - **Active**: ${issueData.fields.reporter.active ? 'Yes' : 'No'}`);
    }
    if (issueData.fields.creator &&
        (!issueData.fields.reporter ||
            issueData.fields.creator.displayName !==
                issueData.fields.reporter?.displayName) &&
        issueData.fields.creator.active !== undefined) {
        lines.push(`  - **Active**: ${issueData.fields.creator.active ? 'Yes' : 'No'}`);
    }
    // Dates
    lines.push('');
    lines.push((0, formatter_util_js_1.formatHeading)('Dates', 2));
    const dateProperties = {
        Created: (0, formatter_util_js_1.formatDate)(issueData.fields.created),
        Updated: (0, formatter_util_js_1.formatDate)(issueData.fields.updated),
    };
    lines.push((0, formatter_util_js_1.formatBulletList)(dateProperties, (key) => key));
    // Time tracking
    if (issueData.fields.timetracking &&
        (issueData.fields.timetracking.originalEstimate ||
            issueData.fields.timetracking.remainingEstimate ||
            issueData.fields.timetracking.timeSpent)) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Time Tracking', 2));
        const timeTrackingProperties = {
            'Original Estimate': issueData.fields.timetracking.originalEstimate,
            'Remaining Estimate': issueData.fields.timetracking.remainingEstimate,
            'Time Spent': issueData.fields.timetracking.timeSpent,
        };
        lines.push((0, formatter_util_js_1.formatBulletList)(timeTrackingProperties, (key) => key));
    }
    // Attachments
    if (issueData.fields.attachment && issueData.fields.attachment.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Attachments', 2));
        issueData.fields.attachment.forEach((attachment, index) => {
            lines.push((0, formatter_util_js_1.formatHeading)(attachment.filename, 3));
            const attachmentProperties = {
                'Content Type': attachment.mimeType,
                Size: (0, atlassian_issues_utils_formatter_js_1.formatFileSize)(attachment.size),
                'Created At': (0, formatter_util_js_1.formatDate)(attachment.created),
                Author: attachment.author?.displayName,
            };
            lines.push((0, formatter_util_js_1.formatBulletList)(attachmentProperties, (key) => key));
            if (attachment.content) {
                lines.push(`[Download](${attachment.content})`);
            }
            // Add separator between attachments
            if (index < issueData.fields.attachment.length - 1) {
                lines.push('');
            }
        });
    }
    // Comments
    if (issueData.fields.comment) {
        const comments = Array.isArray(issueData.fields.comment)
            ? issueData.fields.comment
            : issueData.fields.comment.comments || [];
        if (comments.length > 0) {
            lines.push('');
            lines.push((0, formatter_util_js_1.formatHeading)('Comments', 2));
            comments.forEach((comment, index) => {
                lines.push((0, formatter_util_js_1.formatHeading)(`${comment.author?.displayName || 'Anonymous'} - ${(0, formatter_util_js_1.formatDate)(comment.created)}`, 3));
                // Format comment body
                if (typeof comment.body === 'string') {
                    lines.push(comment.body);
                }
                else if (typeof comment.body === 'object') {
                    lines.push((0, adf_to_markdown_util_js_1.adfToMarkdown)(comment.body));
                }
                else {
                    lines.push('*Comment content not available*');
                }
                // Add separator between comments
                if (index < comments.length - 1) {
                    lines.push('');
                    lines.push((0, formatter_util_js_1.formatSeparator)());
                    lines.push('');
                }
            });
        }
    }
    // Issue Links (Revised Logic)
    if (issueData.fields.issuelinks && issueData.fields.issuelinks.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Linked Issues', 2));
        // Group links by relationship type
        const groupedLinks = {};
        issueData.fields.issuelinks.forEach((link) => {
            let relationship = '';
            let targetIssue;
            if (link.inwardIssue) {
                relationship = link.type.inward; // e.g., "is blocked by"
                targetIssue = link.inwardIssue;
            }
            else if (link.outwardIssue) {
                relationship = link.type.outward; // e.g., "blocks"
                targetIssue = link.outwardIssue;
            }
            if (relationship && targetIssue) {
                if (!groupedLinks[relationship]) {
                    groupedLinks[relationship] = [];
                }
                // Store the original link object, we need both inward/outward later
                groupedLinks[relationship].push(link);
            }
        });
        // Format grouped links
        for (const relationship in groupedLinks) {
            if (Object.prototype.hasOwnProperty.call(groupedLinks, relationship)) {
                lines.push('');
                lines.push((0, formatter_util_js_1.formatHeading)(relationship, 3)); // Use relationship as subheading
                const linksList = {};
                groupedLinks[relationship].forEach((link) => {
                    // Explicitly type targetIssueInfo
                    const targetIssueInfo = link.inwardIssue || link.outwardIssue;
                    if (targetIssueInfo) {
                        const targetIssueUrl = targetIssueInfo.self.replace('/rest/api/3/issue/', '/browse/');
                        // Add status emoji to linked issues
                        const statusEmoji = (0, atlassian_issues_utils_formatter_js_1.getStatusEmoji)(targetIssueInfo.fields.status?.name);
                        // Try to use summary, fall back to Key + Status if not available
                        const displayTitle = targetIssueInfo.fields.summary
                            ? `${statusEmoji}${targetIssueInfo.fields.summary}`
                            : targetIssueInfo.fields.status?.name
                                ? `${statusEmoji}${targetIssueInfo.key} (${targetIssueInfo.fields.status.name})`
                                : targetIssueInfo.key;
                        linksList[targetIssueInfo.key] = {
                            url: targetIssueUrl,
                            title: displayTitle,
                        };
                    }
                });
                lines.push((0, formatter_util_js_1.formatBulletList)(linksList, (key) => key)); // Key is the issue key
            }
        }
    }
    // Links section
    lines.push('');
    lines.push((0, formatter_util_js_1.formatHeading)('Links', 2));
    lines.push(`- ${(0, formatter_util_js_1.formatUrl)(issueUrl, 'Open in Jira')}`);
    // Add standard footer with timestamp
    lines.push('\n\n' + (0, formatter_util_js_1.formatSeparator)());
    lines.push(`*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    // Optionally keep the direct link
    if (issueUrl) {
        lines.push(`*View this issue in Jira: ${issueUrl}*`);
    }
    return lines.join('\n');
}
