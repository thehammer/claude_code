"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraGlobalStatusesResponseSchema = exports.JiraProjectStatusesResponseSchema = exports.JiraProjectStatusByIssueTypeSchema = exports.JiraStatusDetailSchema = exports.JiraStatusCategorySchema = void 0;
/**
 * Types for Atlassian Jira Statuses API
 */
const zod_1 = require("zod");
/**
 * Zod schema for JiraStatusCategory
 */
const JiraStatusCategorySchema = zod_1.z.object({
    self: zod_1.z.string().url(),
    id: zod_1.z.number(),
    key: zod_1.z.string(),
    colorName: zod_1.z.string(),
    name: zod_1.z.string(),
});
exports.JiraStatusCategorySchema = JiraStatusCategorySchema;
/**
 * Zod schema for JiraStatusDetail
 */
const JiraStatusDetailSchema = zod_1.z.object({
    self: zod_1.z.string().url(),
    description: zod_1.z.string().optional(),
    iconUrl: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    id: zod_1.z.string(), // Status IDs are strings (numeric but represented as string)
    statusCategory: JiraStatusCategorySchema,
});
exports.JiraStatusDetailSchema = JiraStatusDetailSchema;
/**
 * Zod schema for JiraProjectStatusByIssueType
 */
const JiraProjectStatusByIssueTypeSchema = zod_1.z.object({
    self: zod_1.z.string().url().optional(),
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    statuses: zod_1.z.array(JiraStatusDetailSchema),
});
exports.JiraProjectStatusByIssueTypeSchema = JiraProjectStatusByIssueTypeSchema;
/**
 * Zod schema for JiraProjectStatusesResponse
 */
const JiraProjectStatusesResponseSchema = zod_1.z.array(JiraProjectStatusByIssueTypeSchema);
exports.JiraProjectStatusesResponseSchema = JiraProjectStatusesResponseSchema;
/**
 * Zod schema for JiraGlobalStatusesResponse
 */
const JiraGlobalStatusesResponseSchema = zod_1.z.array(JiraStatusDetailSchema);
exports.JiraGlobalStatusesResponseSchema = JiraGlobalStatusesResponseSchema;
