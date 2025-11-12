import { JiraTransition } from '../services/vendor.atlassian.transitions.types.js';
/**
 * Format a list of transitions into a Markdown string.
 *
 * @param {JiraTransition[]} transitions - Array of transition objects.
 * @param {string} issueIdOrKey - The issue key or ID.
 * @returns {string} Formatted Markdown string.
 */
export declare function formatTransitionsList(transitions: JiraTransition[], issueIdOrKey: string): string;
/**
 * Format a successful transition response into a Markdown string.
 *
 * @param {string} issueIdOrKey - The issue key or ID.
 * @param {string} transitionName - The name of the transition applied.
 * @param {string} newStatus - The new status name.
 * @returns {string} Formatted Markdown string.
 */
export declare function formatTransitionSuccess(issueIdOrKey: string, transitionName: string, newStatus: string): string;
