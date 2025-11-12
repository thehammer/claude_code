"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraTransitionsResponseSchema = exports.JiraTransitionSchema = exports.JiraTransitionStatusSchema = void 0;
/**
 * Types for Atlassian Jira Transitions API
 */
const zod_1 = require("zod");
/**
 * Zod schema for JiraTransitionStatus
 */
const JiraTransitionStatusSchema = zod_1.z.object({
    self: zod_1.z.string().url(),
    description: zod_1.z.string().optional(),
    iconUrl: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    id: zod_1.z.string(),
    statusCategory: zod_1.z.object({
        self: zod_1.z.string().url(),
        id: zod_1.z.number(),
        key: zod_1.z.string(),
        colorName: zod_1.z.string(),
        name: zod_1.z.string(),
    }),
});
exports.JiraTransitionStatusSchema = JiraTransitionStatusSchema;
/**
 * Zod schema for JiraTransition
 */
const JiraTransitionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    to: JiraTransitionStatusSchema,
    hasScreen: zod_1.z.boolean().optional(),
    isGlobal: zod_1.z.boolean().optional(),
    isInitial: zod_1.z.boolean().optional(),
    isConditional: zod_1.z.boolean().optional(),
    fields: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.JiraTransitionSchema = JiraTransitionSchema;
/**
 * Zod schema for JiraTransitionsResponse
 */
const JiraTransitionsResponseSchema = zod_1.z.object({
    expand: zod_1.z.string().optional(),
    transitions: zod_1.z.array(JiraTransitionSchema),
});
exports.JiraTransitionsResponseSchema = JiraTransitionsResponseSchema;
