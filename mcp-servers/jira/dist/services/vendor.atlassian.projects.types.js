"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsResponseSchema = exports.ProjectDetailedSchema = exports.ProjectSchema = void 0;
/**
 * Types for Atlassian Jira Projects API
 */
const zod_1 = require("zod");
/**
 * Project style enum
 */
const ProjectStyleSchema = zod_1.z.enum(['classic', 'next-gen']);
/**
 * Project avatar URLs
 */
const ProjectAvatarUrlsSchema = zod_1.z.object({
    '16x16': zod_1.z.string().url(),
    '24x24': zod_1.z.string().url(),
    '32x32': zod_1.z.string().url(),
    '48x48': zod_1.z.string().url(),
});
/**
 * Project insight information
 */
const ProjectInsightSchema = zod_1.z.object({
    lastIssueUpdateTime: zod_1.z.string(),
    totalIssueCount: zod_1.z.number(),
});
/**
 * Project category
 */
const ProjectCategorySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    self: zod_1.z.string().url(),
});
/**
 * Project object returned from the API
 */
const ProjectSchema = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    name: zod_1.z.string(),
    self: zod_1.z.string().url(),
    simplified: zod_1.z.boolean(),
    style: ProjectStyleSchema,
    avatarUrls: ProjectAvatarUrlsSchema,
    insight: ProjectInsightSchema.optional(),
    projectCategory: ProjectCategorySchema.optional(),
});
exports.ProjectSchema = ProjectSchema;
/**
 * Project component
 */
const ProjectComponentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    lead: zod_1.z
        .object({
        id: zod_1.z.string(),
        displayName: zod_1.z.string(),
    })
        .optional(),
    assigneeType: zod_1.z.string().optional(),
    assignee: zod_1.z
        .object({
        id: zod_1.z.string(),
        displayName: zod_1.z.string(),
    })
        .optional(),
    self: zod_1.z.string().url(),
});
/**
 * Project version
 */
const ProjectVersionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    archived: zod_1.z.boolean(),
    released: zod_1.z.boolean(),
    releaseDate: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    self: zod_1.z.string().url(),
});
/**
 * Extended project object with optional fields
 */
const ProjectDetailedSchema = ProjectSchema.extend({
    description: zod_1.z.string().optional(),
    lead: zod_1.z
        .object({
        id: zod_1.z.string().optional(),
        displayName: zod_1.z.string(),
        active: zod_1.z.boolean(),
        self: zod_1.z.string().optional(),
        accountId: zod_1.z.string().optional(),
        avatarUrls: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    })
        .optional(),
    components: zod_1.z.array(ProjectComponentSchema),
    versions: zod_1.z.array(ProjectVersionSchema),
    properties: zod_1.z
        .object({
        results: zod_1.z.array(zod_1.z.any()).optional(),
        meta: zod_1.z.any().optional(),
        _links: zod_1.z.any().optional(),
    })
        .optional(),
});
exports.ProjectDetailedSchema = ProjectDetailedSchema;
/**
 * API response for listing projects
 */
const ProjectsResponseSchema = zod_1.z.object({
    isLast: zod_1.z.boolean(),
    maxResults: zod_1.z.number(),
    nextPage: zod_1.z.string().optional(),
    self: zod_1.z.string().url(),
    startAt: zod_1.z.number(),
    total: zod_1.z.number(),
    values: zod_1.z.array(ProjectSchema),
});
exports.ProjectsResponseSchema = ProjectsResponseSchema;
