import { GetTransitionsToolArgsType, TransitionIssueToolArgsType } from '../tools/atlassian.transitions.types.js';
import { ControllerResponse } from '../types/common.types.js';
/**
 * Get available transitions for a Jira issue.
 *
 * @param {GetTransitionsToolArgsType} options - Options including issueIdOrKey.
 * @returns {Promise<ControllerResponse>} Formatted list of transitions.
 */
declare function getTransitions(options: GetTransitionsToolArgsType): Promise<ControllerResponse>;
/**
 * Transition a Jira issue to a new status.
 *
 * @param {TransitionIssueToolArgsType} options - Options including issueIdOrKey, transitionId, and optional comment.
 * @returns {Promise<ControllerResponse>} Success message.
 */
declare function transitionIssue(options: TransitionIssueToolArgsType): Promise<ControllerResponse>;
declare const _default: {
    getTransitions: typeof getTransitions;
    transitionIssue: typeof transitionIssue;
};
export default _default;
