import { z } from 'zod';
/**
 * Arguments for listing Jira issues
 * Includes optional filters with defaults applied in the controller
 */
declare const ListIssuesToolArgs: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodNumber>;
    /**
     * Standardized JQL parameter for filtering
     */
    jql: z.ZodOptional<z.ZodString>;
    /**
     * Project key or ID to filter issues by
     */
    projectKeyOrId: z.ZodOptional<z.ZodString>;
    /**
     * Status names to filter issues by
     */
    statuses: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /**
     * Sorting order for issues
     */
    orderBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orderBy?: string | undefined;
    limit?: number | undefined;
    startAt?: number | undefined;
    projectKeyOrId?: string | undefined;
    jql?: string | undefined;
    statuses?: string[] | undefined;
}, {
    orderBy?: string | undefined;
    limit?: number | undefined;
    startAt?: number | undefined;
    projectKeyOrId?: string | undefined;
    jql?: string | undefined;
    statuses?: string[] | undefined;
}>;
type ListIssuesToolArgsType = z.infer<typeof ListIssuesToolArgs>;
/**
 * Arguments for getting a specific Jira issue
 */
declare const GetIssueToolArgs: z.ZodObject<{
    /**
     * Standardized issue identifier parameter
     */
    issueIdOrKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
}, {
    issueIdOrKey: string;
}>;
type GetIssueToolArgsType = z.infer<typeof GetIssueToolArgs>;
export { ListIssuesToolArgs, type ListIssuesToolArgsType, GetIssueToolArgs, type GetIssueToolArgsType, };
