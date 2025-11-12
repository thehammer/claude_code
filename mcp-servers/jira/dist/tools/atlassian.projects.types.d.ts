import { z } from 'zod';
/**
 * Arguments for listing Jira projects
 * Includes optional filters with defaults applied in the controller
 */
declare const ListProjectsToolArgs: z.ZodObject<{
    /**
     * Field to sort the projects by
     */
    orderBy: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodNumber>;
    /**
     * Filter by project name or key
     */
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
    startAt?: number | undefined;
}, {
    name?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
    startAt?: number | undefined;
}>;
type ListProjectsToolArgsType = z.infer<typeof ListProjectsToolArgs>;
/**
 * Arguments for getting a specific Jira project
 */
declare const GetProjectToolArgs: z.ZodObject<{
    /**
     * Project key or numeric ID
     */
    projectKeyOrId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectKeyOrId: string;
}, {
    projectKeyOrId: string;
}>;
type GetProjectToolArgsType = z.infer<typeof GetProjectToolArgs>;
export { ListProjectsToolArgs, type ListProjectsToolArgsType, GetProjectToolArgs, type GetProjectToolArgsType, };
