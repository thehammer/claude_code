import { ControllerResponse } from '../types/common.types.js';
import { GetIssueToolArgsType, ListIssuesToolArgsType } from '../tools/atlassian.issues.types.js';
/**
 * List Jira issues with optional filtering
 * @param options - Optional filter options for the issues list
 * @param options.jql - JQL query to filter issues
 * @param options.limit - Maximum number of issues to return
 * @param options.cursor - Pagination cursor for retrieving the next set of results
 * @returns Promise with formatted issue list content and pagination information
 */
declare function list(options?: ListIssuesToolArgsType): Promise<ControllerResponse>;
/**
 * Get a single Jira issue by ID or key
 * @param identifier Issue identifier (ID or key)
 * @returns Detailed issue information formatted as Markdown
 */
declare function get(identifier: GetIssueToolArgsType): Promise<ControllerResponse>;
declare const _default: {
    list: typeof list;
    get: typeof get;
};
export default _default;
