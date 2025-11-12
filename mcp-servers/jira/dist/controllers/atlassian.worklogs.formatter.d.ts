import { z } from 'zod';
import { IssueWorklogSchema } from '../services/vendor.atlassian.issues.types.js';
type Worklog = z.infer<typeof IssueWorklogSchema>;
/**
 * Format a list of worklogs for display
 * @param worklogs Array of worklog objects
 * @param issueKey The issue key for context
 * @returns Formatted string for display
 */
export declare function formatWorklogsList(worklogs: Worklog[], issueKey: string): string;
/**
 * Format confirmation for added worklog
 * @param worklog The added worklog object
 * @param issueKey The issue key
 * @returns Formatted confirmation message
 */
export declare function formatAddedWorklogConfirmation(worklog: Worklog, issueKey: string): string;
/**
 * Format confirmation for updated worklog
 * @param worklog The updated worklog object
 * @param issueKey The issue key
 * @returns Formatted confirmation message
 */
export declare function formatUpdatedWorklogConfirmation(worklog: Worklog, issueKey: string): string;
/**
 * Format confirmation for deleted worklog
 * @param issueKey The issue key
 * @param worklogId The deleted worklog ID
 * @returns Formatted confirmation message
 */
export declare function formatDeletedWorklogConfirmation(issueKey: string, worklogId: string): string;
export {};
