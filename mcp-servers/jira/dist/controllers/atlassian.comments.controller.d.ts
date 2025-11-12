import { ControllerResponse } from '../types/common.types.js';
/**
 * List comments for a specific Jira issue
 *
 * @async
 * @param {object} options - Controller options for listing comments
 * @param {string} options.issueIdOrKey - The ID or key of the issue to get comments for
 * @param {number} [options.limit=25] - Maximum number of comments to return (1-100)
 * @param {number} [options.startAt] - Index of the first comment to return (0-based offset)
 * @param {string} [options.orderBy] - Field and direction to order results by (e.g., "created DESC")
 * @returns {Promise<ControllerResponse>} - Promise containing formatted comments list and pagination information
 * @throws {Error} - Throws standardized error if operation fails
 */
declare function listComments(options: {
    issueIdOrKey: string;
    limit?: number;
    startAt?: number;
    orderBy?: string;
}): Promise<ControllerResponse>;
/**
 * Add a comment to a Jira issue
 *
 * @async
 * @param {object} options - Controller options for adding a comment
 * @param {string} options.issueIdOrKey - The ID or key of the issue to add a comment to
 * @param {string} options.commentBody - The content of the comment to add (supports Markdown formatting)
 * @returns {Promise<ControllerResponse>} - Promise containing confirmation message
 * @throws {Error} - Throws standardized error if operation fails
 */
declare function addComment(options: {
    issueIdOrKey: string;
    commentBody: string;
}): Promise<ControllerResponse>;
declare const _default: {
    listComments: typeof listComments;
    addComment: typeof addComment;
};
export default _default;
