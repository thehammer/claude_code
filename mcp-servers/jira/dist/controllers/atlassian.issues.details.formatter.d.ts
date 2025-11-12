/**
 * Formatter for Jira issue details
 */
import { Issue } from '../services/vendor.atlassian.issues.types.js';
/**
 * Format detailed issue information for display
 * @param issueData - Raw issue data from the API
 * @returns Formatted string with issue details in markdown format
 */
export declare function formatIssueDetails(issueData: Issue): string;
