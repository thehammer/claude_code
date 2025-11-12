/**
 * Formatter for Jira issues list
 */
import { IssuesData } from './atlassian.issues.types.formatter.js';
/**
 * Format a list of issues for display
 * @param issuesData - Raw issues data from the API
 * @returns Formatted string with issues information in markdown format
 */
export declare function formatIssuesList(issuesData: IssuesData): string;
