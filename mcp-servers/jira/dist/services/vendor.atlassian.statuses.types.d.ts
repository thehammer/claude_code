/**
 * Types for Atlassian Jira Statuses API
 */
import { z } from 'zod';
/**
 * Represents the status category information returned by Jira API.
 */
export interface JiraStatusCategory {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string;
}
/**
 * Represents the detailed status information returned by Jira API.
 * This is the common structure returned by both /status and nested within /project/.../statuses.
 */
export interface JiraStatusDetail {
    self: string;
    description?: string;
    iconUrl?: string;
    name: string;
    id: string;
    statusCategory: JiraStatusCategory;
}
/**
 * Represents the response structure from the project-specific status endpoint
 * GET /rest/api/3/project/{projectIdOrKey}/statuses
 * It returns statuses grouped by issue type.
 */
export interface JiraProjectStatusByIssueType {
    self?: string;
    id: string;
    name: string;
    statuses: JiraStatusDetail[];
}
export type JiraProjectStatusesResponse = JiraProjectStatusByIssueType[];
/**
 * Represents the response structure from the global status endpoint
 * GET /rest/api/3/status
 */
export type JiraGlobalStatusesResponse = JiraStatusDetail[];
/**
 * Parameters for the status service functions.
 */
export interface ListStatusesParams {
    projectKeyOrId?: string;
}
/**
 * Zod schema for JiraStatusCategory
 */
declare const JiraStatusCategorySchema: z.ZodObject<{
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
/**
 * Zod schema for JiraStatusDetail
 */
declare const JiraStatusDetailSchema: z.ZodObject<{
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
 * Zod schema for JiraProjectStatusByIssueType
 */
declare const JiraProjectStatusByIssueTypeSchema: z.ZodObject<{
    self: z.ZodOptional<z.ZodString>;
    id: z.ZodString;
    name: z.ZodString;
    statuses: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    statuses: {
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
    }[];
    self?: string | undefined;
}, {
    name: string;
    id: string;
    statuses: {
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
    }[];
    self?: string | undefined;
}>;
/**
 * Zod schema for JiraProjectStatusesResponse
 */
declare const JiraProjectStatusesResponseSchema: z.ZodArray<z.ZodObject<{
    self: z.ZodOptional<z.ZodString>;
    id: z.ZodString;
    name: z.ZodString;
    statuses: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    statuses: {
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
    }[];
    self?: string | undefined;
}, {
    name: string;
    id: string;
    statuses: {
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
    }[];
    self?: string | undefined;
}>, "many">;
/**
 * Zod schema for JiraGlobalStatusesResponse
 */
declare const JiraGlobalStatusesResponseSchema: z.ZodArray<z.ZodObject<{
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
}>, "many">;
export { JiraStatusCategorySchema, JiraStatusDetailSchema, JiraProjectStatusByIssueTypeSchema, JiraProjectStatusesResponseSchema, JiraGlobalStatusesResponseSchema, };
