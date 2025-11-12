"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionIssueToolArgs = exports.GetTransitionsToolArgs = void 0;
const zod_1 = require("zod");
/**
 * Zod schema definition for the jira_get_transitions tool arguments.
 */
exports.GetTransitionsToolArgs = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the Jira issue to get transitions for (e.g., "PROJ-123" or "10001").'),
});
/**
 * Zod schema definition for the jira_transition_issue tool arguments.
 */
exports.TransitionIssueToolArgs = zod_1.z.object({
    issueIdOrKey: zod_1.z
        .string()
        .min(1)
        .describe('The ID or key of the Jira issue to transition (e.g., "PROJ-123" or "10001").'),
    transitionId: zod_1.z
        .string()
        .min(1)
        .describe('The ID or name of the transition to apply. Use jira_get_transitions to discover available transitions.'),
    comment: zod_1.z
        .string()
        .optional()
        .describe('Optional comment to add when transitioning the issue.'),
    fields: zod_1.z
        .record(zod_1.z.unknown())
        .optional()
        .describe('Optional fields to update during the transition (if the transition has a screen).'),
});
