import { z } from 'zod';
/**
 * Zod schema definition for the jira_ls_statuses tool arguments.
 */
export declare const ListStatusesToolArgs: z.ZodObject<{
    projectKeyOrId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectKeyOrId?: string | undefined;
}, {
    projectKeyOrId?: string | undefined;
}>;
/**
 * Type inferred from the ListStatusesToolArgs Zod schema.
 */
export type ListStatusesToolArgsType = z.infer<typeof ListStatusesToolArgs>;
