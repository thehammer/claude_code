import { z } from 'zod';
/**
 * Arguments for listing comments on a Jira issue
 */
export declare const ListCommentsToolArgs: z.ZodObject<{
    orderBy: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodNumber>;
    issueIdOrKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
    orderBy?: string | undefined;
    limit?: number | undefined;
    startAt?: number | undefined;
}, {
    issueIdOrKey: string;
    orderBy?: string | undefined;
    limit?: number | undefined;
    startAt?: number | undefined;
}>;
export type ListCommentsToolArgsType = z.infer<typeof ListCommentsToolArgs>;
/**
 * Arguments for adding a comment to a Jira issue
 */
export declare const AddCommentToolArgs: z.ZodObject<{
    issueIdOrKey: z.ZodString;
    commentBody: z.ZodString;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
    commentBody: string;
}, {
    issueIdOrKey: string;
    commentBody: string;
}>;
export type AddCommentToolArgsType = z.infer<typeof AddCommentToolArgs>;
