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
declare const JiraTransitionStatusSchema: z.ZodObject<{
    self: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    id: z.ZodString;
    statusCategory: z.ZodObject<{
        self: z.ZodString;
        id: z.ZodNumber;
        key: z.ZodString;
        colorName: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        key: string;
        name: string;
        id: number;
        self: string;
        colorName: string;
    }, {
        key: string;
        name: string;
        id: number;
        self: string;
        colorName: string;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    self: string;
    statusCategory: {
        key: string;
        name: string;
        id: number;
        self: string;
        colorName: string;
    };
    description?: string | undefined;
    iconUrl?: string | undefined;
}, {
    name: string;
    id: string;
    self: string;
    statusCategory: {
        key: string;
        name: string;
        id: number;
        self: string;
        colorName: string;
    };
    description?: string | undefined;
    iconUrl?: string | undefined;
}>;
/**
 * Zod schema for JiraTransition
 */
declare const JiraTransitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    to: z.ZodObject<{
        self: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        iconUrl: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        id: z.ZodString;
        statusCategory: z.ZodObject<{
            self: z.ZodString;
            id: z.ZodNumber;
            key: z.ZodString;
            colorName: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            key: string;
            name: string;
            id: number;
            self: string;
            colorName: string;
        }, {
            key: string;
            name: string;
            id: number;
            self: string;
            colorName: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        statusCategory: {
            key: string;
            name: string;
            id: number;
            self: string;
            colorName: string;
        };
        description?: string | undefined;
        iconUrl?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        statusCategory: {
            key: string;
            name: string;
            id: number;
            self: string;
            colorName: string;
        };
        description?: string | undefined;
        iconUrl?: string | undefined;
    }>;
    hasScreen: z.ZodOptional<z.ZodBoolean>;
    isGlobal: z.ZodOptional<z.ZodBoolean>;
    isInitial: z.ZodOptional<z.ZodBoolean>;
    isConditional: z.ZodOptional<z.ZodBoolean>;
    fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    to: {
        name: string;
        id: string;
        self: string;
        statusCategory: {
            key: string;
            name: string;
            id: number;
            self: string;
            colorName: string;
        };
        description?: string | undefined;
        iconUrl?: string | undefined;
    };
    fields?: Record<string, unknown> | undefined;
    hasScreen?: boolean | undefined;
    isGlobal?: boolean | undefined;
    isInitial?: boolean | undefined;
    isConditional?: boolean | undefined;
}, {
    name: string;
    id: string;
    to: {
        name: string;
        id: string;
        self: string;
        statusCategory: {
            key: string;
            name: string;
            id: number;
            self: string;
            colorName: string;
        };
        description?: string | undefined;
        iconUrl?: string | undefined;
    };
    fields?: Record<string, unknown> | undefined;
    hasScreen?: boolean | undefined;
    isGlobal?: boolean | undefined;
    isInitial?: boolean | undefined;
    isConditional?: boolean | undefined;
}>;
/**
 * Zod schema for JiraTransitionsResponse
 */
declare const JiraTransitionsResponseSchema: z.ZodObject<{
    expand: z.ZodOptional<z.ZodString>;
    transitions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        to: z.ZodObject<{
            self: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            iconUrl: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            id: z.ZodString;
            statusCategory: z.ZodObject<{
                self: z.ZodString;
                id: z.ZodNumber;
                key: z.ZodString;
                colorName: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            }, {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            statusCategory: {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            };
            description?: string | undefined;
            iconUrl?: string | undefined;
        }, {
            name: string;
            id: string;
            self: string;
            statusCategory: {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            };
            description?: string | undefined;
            iconUrl?: string | undefined;
        }>;
        hasScreen: z.ZodOptional<z.ZodBoolean>;
        isGlobal: z.ZodOptional<z.ZodBoolean>;
        isInitial: z.ZodOptional<z.ZodBoolean>;
        isConditional: z.ZodOptional<z.ZodBoolean>;
        fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        to: {
            name: string;
            id: string;
            self: string;
            statusCategory: {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            };
            description?: string | undefined;
            iconUrl?: string | undefined;
        };
        fields?: Record<string, unknown> | undefined;
        hasScreen?: boolean | undefined;
        isGlobal?: boolean | undefined;
        isInitial?: boolean | undefined;
        isConditional?: boolean | undefined;
    }, {
        name: string;
        id: string;
        to: {
            name: string;
            id: string;
            self: string;
            statusCategory: {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            };
            description?: string | undefined;
            iconUrl?: string | undefined;
        };
        fields?: Record<string, unknown> | undefined;
        hasScreen?: boolean | undefined;
        isGlobal?: boolean | undefined;
        isInitial?: boolean | undefined;
        isConditional?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    transitions: {
        name: string;
        id: string;
        to: {
            name: string;
            id: string;
            self: string;
            statusCategory: {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            };
            description?: string | undefined;
            iconUrl?: string | undefined;
        };
        fields?: Record<string, unknown> | undefined;
        hasScreen?: boolean | undefined;
        isGlobal?: boolean | undefined;
        isInitial?: boolean | undefined;
        isConditional?: boolean | undefined;
    }[];
    expand?: string | undefined;
}, {
    transitions: {
        name: string;
        id: string;
        to: {
            name: string;
            id: string;
            self: string;
            statusCategory: {
                key: string;
                name: string;
                id: number;
                self: string;
                colorName: string;
            };
            description?: string | undefined;
            iconUrl?: string | undefined;
        };
        fields?: Record<string, unknown> | undefined;
        hasScreen?: boolean | undefined;
        isGlobal?: boolean | undefined;
        isInitial?: boolean | undefined;
        isConditional?: boolean | undefined;
    }[];
    expand?: string | undefined;
}>;
export { JiraTransitionStatusSchema, JiraTransitionSchema, JiraTransitionsResponseSchema, };
