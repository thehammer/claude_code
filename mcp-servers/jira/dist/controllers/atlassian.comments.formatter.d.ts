/**
 * Interface for Jira comment objects
 */
interface IssueComment {
    id: string;
    self: string;
    author?: {
        accountId: string;
        active: boolean;
        displayName: string;
        self: string;
    };
    body?: string | unknown;
    created: string;
    updated: string;
    updateAuthor?: {
        accountId: string;
        active: boolean;
        displayName: string;
        self: string;
    };
    visibility?: {
        identifier: string;
        type: string;
        value: string;
    };
}
/**
 * Format a list of comments for a Jira issue
 *
 * @param comments - Array of comment objects from the Jira API
 * @param issueIdOrKey - ID or key of the issue the comments belong to
 * @param baseUrl - Optional base URL for the Jira instance
 * @returns Formatted string with comments in markdown format
 */
export declare function formatCommentsList(comments: IssueComment[], issueIdOrKey: string, baseUrl?: string): string;
/**
 * Format a confirmation message for a newly added comment
 *
 * @param comment - The newly created comment object from the Jira API
 * @param issueIdOrKey - ID or key of the issue the comment was added to
 * @param baseUrl - Optional base URL for the Jira instance
 * @returns Formatted string with confirmation message in markdown format
 */
export declare function formatAddedCommentConfirmation(comment: IssueComment, issueIdOrKey: string, baseUrl?: string): string;
export {};
