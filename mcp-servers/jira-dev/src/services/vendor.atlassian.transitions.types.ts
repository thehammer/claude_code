/**
 * Types for Atlassian Jira Transitions API
 */
import { z } from 'zod';

/**
 * Represents a status detail within a transition.
 */
export interface JiraTransitionStatus {
	self: string;
	description?: string;
	iconUrl?: string;
	name: string;
	id: string;
	statusCategory: {
		self: string;
		id: number;
		key: string;
		colorName: string;
		name: string;
	};
}

/**
 * Represents a single transition available for an issue.
 */
export interface JiraTransition {
	id: string;
	name: string;
	to: JiraTransitionStatus;
	hasScreen?: boolean;
	isGlobal?: boolean;
	isInitial?: boolean;
	isConditional?: boolean;
	fields?: Record<string, unknown>;
}

/**
 * Response from GET /rest/api/3/issue/{issueIdOrKey}/transitions
 */
export interface JiraTransitionsResponse {
	expand?: string;
	transitions: JiraTransition[];
}

/**
 * Parameters for getting transitions.
 */
export interface GetTransitionsParams {
	issueIdOrKey: string;
}

/**
 * Parameters for transitioning an issue.
 */
export interface TransitionIssueParams {
	issueIdOrKey: string;
	transitionId: string;
	comment?: string;
	fields?: Record<string, unknown>;
}

/**
 * Zod schema for JiraTransitionStatus
 */
const JiraTransitionStatusSchema = z.object({
	self: z.string().url(),
	description: z.string().optional(),
	iconUrl: z.string().optional(),
	name: z.string(),
	id: z.string(),
	statusCategory: z.object({
		self: z.string().url(),
		id: z.number(),
		key: z.string(),
		colorName: z.string(),
		name: z.string(),
	}),
});

/**
 * Zod schema for JiraTransition
 */
const JiraTransitionSchema = z.object({
	id: z.string(),
	name: z.string(),
	to: JiraTransitionStatusSchema,
	hasScreen: z.boolean().optional(),
	isGlobal: z.boolean().optional(),
	isInitial: z.boolean().optional(),
	isConditional: z.boolean().optional(),
	fields: z.record(z.unknown()).optional(),
});

/**
 * Zod schema for JiraTransitionsResponse
 */
const JiraTransitionsResponseSchema = z.object({
	expand: z.string().optional(),
	transitions: z.array(JiraTransitionSchema),
});

// Export schemas
export {
	JiraTransitionStatusSchema,
	JiraTransitionSchema,
	JiraTransitionsResponseSchema,
};
