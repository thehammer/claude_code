import { z } from 'zod';

/**
 * Zod schema definition for the jira_get_transitions tool arguments.
 */
export const GetTransitionsToolArgs = z.object({
	issueIdOrKey: z
		.string()
		.min(1)
		.describe(
			'The ID or key of the Jira issue to get transitions for (e.g., "PROJ-123" or "10001").',
		),
});

/**
 * Type inferred from the GetTransitionsToolArgs Zod schema.
 */
export type GetTransitionsToolArgsType = z.infer<
	typeof GetTransitionsToolArgs
>;

/**
 * Zod schema definition for the jira_transition_issue tool arguments.
 */
export const TransitionIssueToolArgs = z.object({
	issueIdOrKey: z
		.string()
		.min(1)
		.describe(
			'The ID or key of the Jira issue to transition (e.g., "PROJ-123" or "10001").',
		),
	transitionId: z
		.string()
		.min(1)
		.describe(
			'The ID or name of the transition to apply. Use jira_get_transitions to discover available transitions.',
		),
	comment: z
		.string()
		.optional()
		.describe(
			'Optional comment to add when transitioning the issue.',
		),
	fields: z
		.record(z.unknown())
		.optional()
		.describe(
			'Optional fields to update during the transition (if the transition has a screen).',
		),
});

/**
 * Type inferred from the TransitionIssueToolArgs Zod schema.
 */
export type TransitionIssueToolArgsType = z.infer<
	typeof TransitionIssueToolArgs
>;
