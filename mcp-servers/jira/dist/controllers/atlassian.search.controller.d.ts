import { ControllerResponse } from '../types/common.types.js';
import { ListIssuesToolArgsType } from '../tools/atlassian.issues.types.js';
/**
 * Search for Jira issues using JQL
 *
 * @param {ListIssuesToolArgsType} options - Options for the search
 * @returns {Promise<ControllerResponse>} Formatted search results in Markdown
 */
declare function search(options?: ListIssuesToolArgsType): Promise<ControllerResponse>;
declare const _default: {
    search: typeof search;
};
export default _default;
