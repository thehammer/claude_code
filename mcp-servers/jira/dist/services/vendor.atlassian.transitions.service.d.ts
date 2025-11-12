import { JiraTransitionsResponse, GetTransitionsParams, TransitionIssueParams } from './vendor.atlassian.transitions.types.js';
/**
 * Get available transitions for a Jira issue.
 *
 * @param {GetTransitionsParams} params - Parameters including issueIdOrKey.
 * @returns {Promise<JiraTransitionsResponse>} Raw API response with available transitions.
 * @throws {Error} If credentials are missing or API request fails.
 */
declare function getTransitions(params: GetTransitionsParams): Promise<JiraTransitionsResponse>;
/**
 * Transition a Jira issue to a new status.
 *
 * @param {TransitionIssueParams} params - Parameters including issueIdOrKey, transitionId, optional comment and fields.
 * @returns {Promise<void>} Resolves when transition is successful.
 * @throws {Error} If credentials are missing or API request fails.
 */
declare function transitionIssue(params: TransitionIssueParams): Promise<void>;
declare const _default: {
    getTransitions: typeof getTransitions;
    transitionIssue: typeof transitionIssue;
};
export default _default;
