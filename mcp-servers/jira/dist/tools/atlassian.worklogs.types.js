"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWorklogToolArgsSchema = exports.UpdateWorklogToolArgsSchema = exports.AddWorklogToolArgsSchema = exports.ListWorklogsToolArgsSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for listing worklogs for an issue
 */
exports.ListWorklogsToolArgsSchema = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the issue (e.g., "PROJ-123" or "10001")'),
    limit: zod_1.z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(25)
        .describe('Maximum number of worklogs to return (1-100)'),
    startAt: zod_1.z
        .number()
        .int()
        .min(0)
        .optional()
        .default(0)
        .describe('The index of the first worklog to return (0-based)'),
    expand: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Use expand to include additional information in the response'),
});
/**
 * Schema for adding a worklog to an issue
 */
exports.AddWorklogToolArgsSchema = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the issue (e.g., "PROJ-123" or "10001")'),
    timeSpent: zod_1.z
        .string()
        .min(1)
        .describe('Time spent working in Jira duration format (e.g., "2h 30m", "1d", "45m")'),
    comment: zod_1.z
        .string()
        .optional()
        .describe('Worklog comment/description in Markdown format'),
    started: zod_1.z
        .string()
        .describe('When the work was started in ISO 8601 format (e.g., "2024-01-22T10:00:00.000+0000")'),
    adjustEstimate: zod_1.z
        .enum(['new', 'leave', 'manual', 'auto'])
        .optional()
        .describe("How to adjust the remaining estimate: new (set new estimate), leave (don't change), manual (reduce by amount), auto (reduce by time spent)"),
    newEstimate: zod_1.z
        .string()
        .optional()
        .describe('The new estimate when adjustEstimate is "new" (e.g., "3d 4h")'),
    reduceBy: zod_1.z
        .string()
        .optional()
        .describe('Amount to reduce remaining estimate when adjustEstimate is "manual" (e.g., "2h")'),
});
/**
 * Schema for updating an existing worklog
 */
exports.UpdateWorklogToolArgsSchema = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the issue (e.g., "PROJ-123" or "10001")'),
    worklogId: zod_1.z.string().min(1).describe('The ID of the worklog to update'),
    timeSpent: zod_1.z
        .string()
        .optional()
        .describe('New time spent value in Jira duration format (e.g., "3h 15m")'),
    comment: zod_1.z
        .string()
        .optional()
        .describe('New worklog comment/description in Markdown format'),
    started: zod_1.z
        .string()
        .optional()
        .describe('New start time in ISO 8601 format (e.g., "2024-01-22T10:00:00.000+0000")'),
});
/**
 * Schema for deleting a worklog
 */
exports.DeleteWorklogToolArgsSchema = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the issue (e.g., "PROJ-123" or "10001")'),
    worklogId: zod_1.z.string().min(1).describe('The ID of the worklog to delete'),
    adjustEstimate: zod_1.z
        .enum(['new', 'leave', 'manual', 'auto'])
        .optional()
        .describe("How to adjust the remaining estimate: new (set new estimate), leave (don't change), manual (increase by amount), auto (increase by time that was logged)"),
    newEstimate: zod_1.z
        .string()
        .optional()
        .describe('The new estimate when adjustEstimate is "new" (e.g., "5d")'),
    increaseBy: zod_1.z
        .string()
        .optional()
        .describe('Amount to increase remaining estimate when adjustEstimate is "manual" (e.g., "3h")'),
});
