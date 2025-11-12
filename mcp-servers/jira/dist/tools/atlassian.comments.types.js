"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommentToolArgs = exports.ListCommentsToolArgs = void 0;
const zod_1 = require("zod");
/**
 * Base pagination arguments for comment operations
 */
const PaginationArgs = {
    limit: zod_1.z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe('Maximum number of comments to return (1-100). Default is 25.'),
    startAt: zod_1.z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe('Index of the first comment to return (0-based offset). Used with limit for pagination.'),
};
/**
 * Arguments for listing comments on a Jira issue
 */
exports.ListCommentsToolArgs = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the Jira issue to get comments from (e.g., "PROJ-123" or "10001").'),
    ...PaginationArgs,
    orderBy: zod_1.z
        .string()
        .regex(/^(-)?(created|updated)$/i, {
        message: 'orderBy must be "created", "-created", "updated", or "-updated" (prefix with "-" for descending order).',
    })
        .optional()
        .describe('Sort comments by field and direction. Use "created" or "updated" for ascending order, and "-created" or "-updated" for descending order.'),
});
/**
 * Arguments for adding a comment to a Jira issue
 */
exports.AddCommentToolArgs = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the Jira issue to add a comment to (e.g., "PROJ-123" or "10001").'),
    commentBody: zod_1.z
        .string()
        .min(1)
        .describe('The text content of the comment to add. Supports Markdown formatting including headings, lists, code blocks, tables, and other common markdown elements.'),
});
