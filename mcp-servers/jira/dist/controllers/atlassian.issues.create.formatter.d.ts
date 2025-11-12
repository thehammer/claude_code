/**
 * Formatter for Jira issue creation responses
 */
import { CreateMetaResponse, CreateIssueResponse } from '../services/vendor.atlassian.issues.types.js';
/**
 * Format create metadata response for display
 * @param metadata - Create metadata response from Jira API
 * @param projectKey - Project key for context
 * @returns Formatted string with create metadata in markdown format
 */
export declare function formatCreateMeta(metadata: CreateMetaResponse, projectKey: string): string;
/**
 * Format create issue response for display
 * @param response - Create issue response from Jira API
 * @returns Formatted string with creation result in markdown format
 */
export declare function formatCreateIssueResponse(response: CreateIssueResponse): string;
