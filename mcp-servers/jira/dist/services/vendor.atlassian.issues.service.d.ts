import { Issue, IssuesResponse, SearchIssuesParams, GetIssueByIdParams, PageOfComments, IssueCommentSchema, ListCommentsParams, AddCommentParams, IssueWorklog, IssueWorklogContainer, CreateMetaResponse, GetCreateMetaParams, CreateIssueParams, CreateIssueResponse } from './vendor.atlassian.issues.types.js';
import { z } from 'zod';
interface WorklogCreateData {
    timeSpentSeconds?: number;
    timeSpent?: string;
    started?: string;
    comment?: string | {
        type: string;
        version: number;
        content: unknown[];
    };
    visibility?: {
        type: string;
        identifier?: string;
        value?: string;
    };
    adjustEstimate?: string;
    newEstimate?: string;
    reduceBy?: string;
}
interface WorklogUpdateData {
    timeSpentSeconds?: number;
    timeSpent?: string;
    started?: string;
    comment?: string | {
        type: string;
        version: number;
        content: unknown[];
    };
    visibility?: {
        type: string;
        identifier?: string;
        value?: string;
    };
}
interface WorklogDeleteParams {
    adjustEstimate?: string;
    newEstimate?: string;
    increaseBy?: string;
}
/**
 * @namespace VendorAtlassianIssuesService
 * @description Service for interacting with Jira Issues API.
 * Provides methods for searching issues and retrieving issue details.
 * All methods require valid Atlassian credentials configured in the environment.
 */
/**
 * Search for Jira issues using JQL and other criteria
 *
 * Retrieves a list of issues from Jira based on JQL query and other
 * search parameters. Uses the new enhanced JQL search API endpoint.
 * Supports pagination with nextPageToken, field selection, and expansion.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {SearchIssuesParams} [params={}] - Optional parameters for customizing the search
 * @param {string} [params.jql] - JQL query string for filtering issues
 * @param {number} [params.startAt] - Pagination start index (converted to nextPageToken internally)
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @param {string[]} [params.fields] - Issue fields to include in response
 * @param {string[]} [params.expand] - Issue data to expand in response
 * @param {boolean} [params.validateQuery] - Whether to validate the JQL query
 * @param {string[]} [params.properties] - Issue properties to include in response
 * @param {boolean} [params.fieldsByKeys] - Whether to use field keys instead of IDs
 * @param {string} [params.nextPageToken] - Token for retrieving next page of results
 * @param {boolean} [params.reconcileIssues] - Whether to reconcile issue data
 * @returns {Promise<IssuesResponse>} Promise containing the issues search response with results and pagination info
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Search for issues with pagination
 * const response = await search({
 *   jql: "project = ABC AND status = 'In Progress'",
 *   maxResults: 10
 * });
 */
declare function search(params?: SearchIssuesParams): Promise<IssuesResponse>;
/**
 * Get detailed information about a specific Jira issue
 *
 * Retrieves comprehensive details about a single issue, including metadata,
 * description, comments, and more.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} idOrKey - The ID or key of the issue to retrieve
 * @param {GetIssueByIdParams} [params={}] - Optional parameters for customizing the response
 * @param {string[]} [params.fields] - Issue fields to include in response
 * @param {string[]} [params.expand] - Issue data to expand in response
 * @param {string[]} [params.properties] - Issue properties to include in response
 * @param {boolean} [params.fieldsByKeys] - Whether to use field keys instead of IDs
 * @param {boolean} [params.updateHistory] - Whether to update issue view history
 * @returns {Promise<Issue>} Promise containing the detailed issue information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get issue details with expanded changelog
 * const issue = await get('ABC-123', {
 *   expand: ['changelog']
 * });
 */
declare function get(idOrKey: string, params?: GetIssueByIdParams): Promise<Issue>;
/**
 * Get comments for a specific Jira issue
 *
 * Retrieves the list of comments for an issue with pagination support.
 * Can be sorted and expanded as needed.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to get comments for
 * @param {ListCommentsParams} [params={}] - Optional parameters for customizing the response
 * @param {number} [params.startAt] - Pagination start index
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @param {string} [params.orderBy] - Field and direction to order results by
 * @param {string[]} [params.expand] - Comment data to expand in response (e.g., 'renderedBody')
 * @returns {Promise<PageOfComments>} Promise containing the comments with pagination information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get comments for an issue with pagination
 * const comments = await getComments('ABC-123', {
 *   maxResults: 10,
 *   expand: ['renderedBody']
 * });
 */
declare function getComments(issueIdOrKey: string, params?: ListCommentsParams): Promise<PageOfComments>;
/**
 * Add a comment to a specific Jira issue
 *
 * Creates a new comment on the specified issue with the provided content.
 * The comment body must be provided in Atlassian Document Format (ADF).
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to add a comment to
 * @param {AddCommentParams} commentData - Parameters for the comment to add
 * @returns {Promise<z.infer<typeof IssueCommentSchema>>} Promise containing the created comment information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Add a comment with ADF content
 * const comment = await addComment('ABC-123', {
 *   body: {
 *     version: 1,
 *     type: "doc",
 *     content: [
 *       {
 *         type: "paragraph",
 *         content: [
 *           {
 *             type: "text",
 *             text: "This is a test comment"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * });
 */
declare function addComment(issueIdOrKey: string, commentData: AddCommentParams): Promise<z.infer<typeof IssueCommentSchema>>;
/**
 * Get worklogs for a specific Jira issue
 *
 * Retrieves the list of worklogs for an issue with pagination support.
 * Time tracking must be enabled in Jira for this operation to work.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to get worklogs for
 * @param {ListWorklogsParams} [params={}] - Optional parameters for customizing the response
 * @param {number} [params.startAt] - Pagination start index
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @param {string[]} [params.expand] - Worklog data to expand in response
 * @returns {Promise<IssueWorklogContainer>} Promise containing the worklogs with pagination information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get worklogs for an issue with pagination
 * const worklogs = await getWorklogs('ABC-123', {
 *   maxResults: 10,
 *   expand: ['properties']
 * });
 */
declare function getWorklogs(issueIdOrKey: string, params?: {
    startAt?: number;
    maxResults?: number;
    expand?: string[];
}): Promise<IssueWorklogContainer>;
/**
 * Add a worklog to a specific Jira issue
 *
 * Creates a new worklog on the specified issue with time spent and optional comment.
 * Time tracking must be enabled in Jira for this operation to work.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue to add a worklog to
 * @param {WorklogCreateData} worklogData - Parameters for the worklog to add
 * @returns {Promise<IssueWorklog>} Promise containing the created worklog information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Add a worklog with time spent and comment
 * const worklog = await addWorklog('ABC-123', {
 *   timeSpentSeconds: 7200,
 *   comment: { ... }, // ADF format
 *   started: "2024-01-22T10:00:00.000+0000"
 * });
 */
declare function addWorklog(issueIdOrKey: string, worklogData: WorklogCreateData): Promise<IssueWorklog>;
/**
 * Update an existing worklog
 *
 * Updates a worklog on the specified issue with new time spent, comment, or start time.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue
 * @param {string} worklogId - The ID of the worklog to update
 * @param {WorklogUpdateData} updateData - Parameters for the worklog update
 * @returns {Promise<IssueWorklog>} Promise containing the updated worklog information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 */
declare function updateWorklog(issueIdOrKey: string, worklogId: string, updateData: WorklogUpdateData): Promise<IssueWorklog>;
/**
 * Delete a worklog from a Jira issue
 *
 * Removes a worklog from the specified issue with optional estimate adjustment.
 *
 * @async
 * @memberof VendorAtlassianIssuesService
 * @param {string} issueIdOrKey - The ID or key of the issue
 * @param {string} worklogId - The ID of the worklog to delete
 * @param {WorklogDeleteParams} [params={}] - Optional parameters for estimate adjustment
 * @returns {Promise<void>} Promise that resolves when the worklog is deleted
 * @throws {Error} If Atlassian credentials are missing or API request fails
 */
declare function deleteWorklog(issueIdOrKey: string, worklogId: string, params?: WorklogDeleteParams): Promise<void>;
/**
 * Get create metadata for project issue types
 *
 * @param projectIdOrKey - Project ID or key
 * @param issueTypeId - Optional specific issue type ID
 * @param params - Optional parameters for filtering
 * @returns Promise containing create metadata
 */
declare function getCreateMeta(projectIdOrKey: string, issueTypeId?: string, params?: GetCreateMetaParams): Promise<CreateMetaResponse>;
/**
 * Create a new Jira issue
 *
 * @param params - Issue creation parameters with fields data
 * @returns Promise containing the created issue response
 */
declare function createIssue(params: CreateIssueParams): Promise<CreateIssueResponse>;
declare const _default: {
    search: typeof search;
    get: typeof get;
    getComments: typeof getComments;
    addComment: typeof addComment;
    getWorklogs: typeof getWorklogs;
    addWorklog: typeof addWorklog;
    updateWorklog: typeof updateWorklog;
    deleteWorklog: typeof deleteWorklog;
    getCreateMeta: typeof getCreateMeta;
    createIssue: typeof createIssue;
};
export default _default;
