import { z } from 'zod';
/**
 * Schema for listing worklogs for an issue
 */
export declare const ListWorklogsToolArgsSchema: z.ZodObject<{
    issueIdOrKey: z.ZodString;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    startAt: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    expand: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    startAt: number;
    issueIdOrKey: string;
    expand?: string[] | undefined;
}, {
    issueIdOrKey: string;
    limit?: number | undefined;
    startAt?: number | undefined;
    expand?: string[] | undefined;
}>;
export type ListWorklogsToolArgsType = z.infer<typeof ListWorklogsToolArgsSchema>;
/**
 * Schema for adding a worklog to an issue
 */
export declare const AddWorklogToolArgsSchema: z.ZodObject<{
    issueIdOrKey: z.ZodString;
    timeSpent: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    started: z.ZodString;
    adjustEstimate: z.ZodOptional<z.ZodEnum<["new", "leave", "manual", "auto"]>>;
    newEstimate: z.ZodOptional<z.ZodString>;
    reduceBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
    started: string;
    timeSpent: string;
    comment?: string | undefined;
    adjustEstimate?: "new" | "leave" | "manual" | "auto" | undefined;
    newEstimate?: string | undefined;
    reduceBy?: string | undefined;
}, {
    issueIdOrKey: string;
    started: string;
    timeSpent: string;
    comment?: string | undefined;
    adjustEstimate?: "new" | "leave" | "manual" | "auto" | undefined;
    newEstimate?: string | undefined;
    reduceBy?: string | undefined;
}>;
export type AddWorklogToolArgsType = z.infer<typeof AddWorklogToolArgsSchema>;
/**
 * Schema for updating an existing worklog
 */
export declare const UpdateWorklogToolArgsSchema: z.ZodObject<{
    issueIdOrKey: z.ZodString;
    worklogId: z.ZodString;
    timeSpent: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
    started: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
    worklogId: string;
    comment?: string | undefined;
    started?: string | undefined;
    timeSpent?: string | undefined;
}, {
    issueIdOrKey: string;
    worklogId: string;
    comment?: string | undefined;
    started?: string | undefined;
    timeSpent?: string | undefined;
}>;
export type UpdateWorklogToolArgsType = z.infer<typeof UpdateWorklogToolArgsSchema>;
/**
 * Schema for deleting a worklog
 */
export declare const DeleteWorklogToolArgsSchema: z.ZodObject<{
    issueIdOrKey: z.ZodString;
    worklogId: z.ZodString;
    adjustEstimate: z.ZodOptional<z.ZodEnum<["new", "leave", "manual", "auto"]>>;
    newEstimate: z.ZodOptional<z.ZodString>;
    increaseBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
    worklogId: string;
    adjustEstimate?: "new" | "leave" | "manual" | "auto" | undefined;
    newEstimate?: string | undefined;
    increaseBy?: string | undefined;
}, {
    issueIdOrKey: string;
    worklogId: string;
    adjustEstimate?: "new" | "leave" | "manual" | "auto" | undefined;
    newEstimate?: string | undefined;
    increaseBy?: string | undefined;
}>;
export type DeleteWorklogToolArgsType = z.infer<typeof DeleteWorklogToolArgsSchema>;
