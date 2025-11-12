/**
 * Types for Atlassian Issues creation MCP tools
 */
import { z } from 'zod';
/**
 * Arguments for getting create metadata
 */
export declare const GetCreateMetaToolArgsSchema: z.ZodObject<{
    projectKeyOrId: z.ZodString;
    issueTypeId: z.ZodOptional<z.ZodString>;
    issuetypeNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    projectKeyOrId: string;
    issuetypeNames?: string[] | undefined;
    issueTypeId?: string | undefined;
}, {
    projectKeyOrId: string;
    issuetypeNames?: string[] | undefined;
    issueTypeId?: string | undefined;
}>;
export type GetCreateMetaToolArgs = z.infer<typeof GetCreateMetaToolArgsSchema>;
export type GetCreateMetaToolArgsType = GetCreateMetaToolArgs;
/**
 * Arguments for creating an issue
 */
export declare const CreateIssueToolArgsSchema: z.ZodObject<{
    projectKeyOrId: z.ZodString;
    issueTypeId: z.ZodString;
    summary: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodString>;
    assignee: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    components: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    fixVersions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    projectKeyOrId: string;
    summary: string;
    issueTypeId: string;
    priority?: string | undefined;
    description?: string | undefined;
    assignee?: string | undefined;
    components?: string[] | undefined;
    labels?: string[] | undefined;
    fixVersions?: string[] | undefined;
    customFields?: Record<string, unknown> | undefined;
}, {
    projectKeyOrId: string;
    summary: string;
    issueTypeId: string;
    priority?: string | undefined;
    description?: string | undefined;
    assignee?: string | undefined;
    components?: string[] | undefined;
    labels?: string[] | undefined;
    fixVersions?: string[] | undefined;
    customFields?: Record<string, unknown> | undefined;
}>;
export type CreateIssueToolArgs = z.infer<typeof CreateIssueToolArgsSchema>;
export type CreateIssueToolArgsType = CreateIssueToolArgs;
