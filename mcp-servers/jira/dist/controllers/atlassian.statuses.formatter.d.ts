import { JiraStatusDetail } from '../services/vendor.atlassian.statuses.types.js';
/**
 * Formats a list of Jira statuses into a Markdown string.
 *
 * @param {JiraStatusDetail[]} statuses - Array of unique status details.
 * @param {string} [projectKeyOrId] - Optional project context for the heading.
 * @returns {string} Formatted Markdown string.
 */
export declare function formatStatusesList(statuses: JiraStatusDetail[], projectKeyOrId?: string): string;
