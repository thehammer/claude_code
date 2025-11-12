"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIssueToolArgsSchema = exports.GetCreateMetaToolArgsSchema = void 0;
/**
 * Types for Atlassian Issues creation MCP tools
 */
const zod_1 = require("zod");
/**
 * Arguments for getting create metadata
 */
exports.GetCreateMetaToolArgsSchema = zod_1.z.object({
    projectKeyOrId: zod_1.z
        .string()
        .describe('Project key (e.g., "TES") or ID to get creation metadata for'),
    issueTypeId: zod_1.z
        .string()
        .optional()
        .describe('Optional specific issue type ID to get detailed field metadata'),
    issuetypeNames: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Optional array of issue type names to filter'),
});
/**
 * Arguments for creating an issue
 */
exports.CreateIssueToolArgsSchema = zod_1.z.object({
    projectKeyOrId: zod_1.z
        .string()
        .describe('Project key (e.g., "TES") or ID where the issue will be created'),
    issueTypeId: zod_1.z
        .string()
        .describe('Issue type ID (get from create metadata)'),
    summary: zod_1.z.string().describe('Issue summary/title'),
    description: zod_1.z
        .string()
        .optional()
        .describe('Issue description in markdown format'),
    priority: zod_1.z.string().optional().describe('Priority name or ID'),
    assignee: zod_1.z.string().optional().describe('Assignee account ID or email'),
    labels: zod_1.z.array(zod_1.z.string()).optional().describe('Array of labels to apply'),
    components: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Array of component IDs or names'),
    fixVersions: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Array of fix version IDs or names'),
    customFields: zod_1.z
        .record(zod_1.z.string(), zod_1.z.unknown())
        .optional()
        .describe('Custom fields as key-value pairs (e.g., {"customfield_10001": "value"})'),
});
