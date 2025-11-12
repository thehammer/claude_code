import { z } from 'zod';
/**
 * Zod schema definition for the jira_get_transitions tool arguments.
 */
export declare const GetTransitionsToolArgs: z.ZodObject<{
    issueIdOrKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
}, {
    issueIdOrKey: string;
}>;
/**
 * Type inferred from the GetTransitionsToolArgs Zod schema.
 */
export type GetTransitionsToolArgsType = z.infer<typeof GetTransitionsToolArgs>;
/**
 * Zod schema definition for the jira_transition_issue tool arguments.
 */
export declare const TransitionIssueToolArgs: z.ZodObject<{
    issueIdOrKey: z.ZodString;
    transitionId: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    issueIdOrKey: string;
    transitionId: string;
    fields?: Record<string, unknown> | undefined;
    comment?: string | undefined;
}, {
    issueIdOrKey: string;
    transitionId: string;
    fields?: Record<string, unknown> | undefined;
    comment?: string | undefined;
}>;
/**
 * Type inferred from the TransitionIssueToolArgs Zod schema.
 */
export type TransitionIssueToolArgsType = z.infer<typeof TransitionIssueToolArgs>;
