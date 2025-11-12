/**
 * Types for Atlassian Jira Projects API
 */
import { z } from 'zod';
/**
 * Project object returned from the API
 */
declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    key: z.ZodString;
    name: z.ZodString;
    self: z.ZodString;
    simplified: z.ZodBoolean;
    style: z.ZodEnum<["classic", "next-gen"]>;
    avatarUrls: z.ZodObject<{
        '16x16': z.ZodString;
        '24x24': z.ZodString;
        '32x32': z.ZodString;
        '48x48': z.ZodString;
    }, "strip", z.ZodTypeAny, {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    }, {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    }>;
    insight: z.ZodOptional<z.ZodObject<{
        lastIssueUpdateTime: z.ZodString;
        totalIssueCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    }, {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    }>>;
    projectCategory: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    name: string;
    id: string;
    self: string;
    simplified: boolean;
    style: "classic" | "next-gen";
    avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    };
    insight?: {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    } | undefined;
    projectCategory?: {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    } | undefined;
}, {
    key: string;
    name: string;
    id: string;
    self: string;
    simplified: boolean;
    style: "classic" | "next-gen";
    avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    };
    insight?: {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    } | undefined;
    projectCategory?: {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    } | undefined;
}>;
export type Project = z.infer<typeof ProjectSchema>;
/**
 * Extended project object with optional fields
 */
declare const ProjectDetailedSchema: z.ZodObject<{
    id: z.ZodString;
    key: z.ZodString;
    name: z.ZodString;
    self: z.ZodString;
    simplified: z.ZodBoolean;
    style: z.ZodEnum<["classic", "next-gen"]>;
    avatarUrls: z.ZodObject<{
        '16x16': z.ZodString;
        '24x24': z.ZodString;
        '32x32': z.ZodString;
        '48x48': z.ZodString;
    }, "strip", z.ZodTypeAny, {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    }, {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    }>;
    insight: z.ZodOptional<z.ZodObject<{
        lastIssueUpdateTime: z.ZodString;
        totalIssueCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    }, {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    }>>;
    projectCategory: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    }>>;
} & {
    description: z.ZodOptional<z.ZodString>;
    lead: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        displayName: z.ZodString;
        active: z.ZodBoolean;
        self: z.ZodOptional<z.ZodString>;
        accountId: z.ZodOptional<z.ZodString>;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        displayName: string;
        active: boolean;
        id?: string | undefined;
        self?: string | undefined;
        avatarUrls?: Record<string, string> | undefined;
        accountId?: string | undefined;
    }, {
        displayName: string;
        active: boolean;
        id?: string | undefined;
        self?: string | undefined;
        avatarUrls?: Record<string, string> | undefined;
        accountId?: string | undefined;
    }>>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        lead: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            displayName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            displayName: string;
        }, {
            id: string;
            displayName: string;
        }>>;
        assigneeType: z.ZodOptional<z.ZodString>;
        assignee: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            displayName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            displayName: string;
        }, {
            id: string;
            displayName: string;
        }>>;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
        lead?: {
            id: string;
            displayName: string;
        } | undefined;
        assigneeType?: string | undefined;
        assignee?: {
            id: string;
            displayName: string;
        } | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
        lead?: {
            id: string;
            displayName: string;
        } | undefined;
        assigneeType?: string | undefined;
        assignee?: {
            id: string;
            displayName: string;
        } | undefined;
    }>, "many">;
    versions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        archived: z.ZodBoolean;
        released: z.ZodBoolean;
        releaseDate: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        description?: string | undefined;
        releaseDate?: string | undefined;
        startDate?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        description?: string | undefined;
        releaseDate?: string | undefined;
        startDate?: string | undefined;
    }>, "many">;
    properties: z.ZodOptional<z.ZodObject<{
        results: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        meta: z.ZodOptional<z.ZodAny>;
        _links: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        results?: any[] | undefined;
        meta?: any;
        _links?: any;
    }, {
        results?: any[] | undefined;
        meta?: any;
        _links?: any;
    }>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    name: string;
    id: string;
    self: string;
    simplified: boolean;
    style: "classic" | "next-gen";
    avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    };
    components: {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
        lead?: {
            id: string;
            displayName: string;
        } | undefined;
        assigneeType?: string | undefined;
        assignee?: {
            id: string;
            displayName: string;
        } | undefined;
    }[];
    versions: {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        description?: string | undefined;
        releaseDate?: string | undefined;
        startDate?: string | undefined;
    }[];
    description?: string | undefined;
    insight?: {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    } | undefined;
    projectCategory?: {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    } | undefined;
    lead?: {
        displayName: string;
        active: boolean;
        id?: string | undefined;
        self?: string | undefined;
        avatarUrls?: Record<string, string> | undefined;
        accountId?: string | undefined;
    } | undefined;
    properties?: {
        results?: any[] | undefined;
        meta?: any;
        _links?: any;
    } | undefined;
}, {
    key: string;
    name: string;
    id: string;
    self: string;
    simplified: boolean;
    style: "classic" | "next-gen";
    avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    };
    components: {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
        lead?: {
            id: string;
            displayName: string;
        } | undefined;
        assigneeType?: string | undefined;
        assignee?: {
            id: string;
            displayName: string;
        } | undefined;
    }[];
    versions: {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        description?: string | undefined;
        releaseDate?: string | undefined;
        startDate?: string | undefined;
    }[];
    description?: string | undefined;
    insight?: {
        lastIssueUpdateTime: string;
        totalIssueCount: number;
    } | undefined;
    projectCategory?: {
        name: string;
        id: string;
        self: string;
        description?: string | undefined;
    } | undefined;
    lead?: {
        displayName: string;
        active: boolean;
        id?: string | undefined;
        self?: string | undefined;
        avatarUrls?: Record<string, string> | undefined;
        accountId?: string | undefined;
    } | undefined;
    properties?: {
        results?: any[] | undefined;
        meta?: any;
        _links?: any;
    } | undefined;
}>;
export type ProjectDetailed = z.infer<typeof ProjectDetailedSchema>;
/**
 * Parameters for listing projects
 */
export interface ListProjectsParams {
    ids?: string[];
    keys?: string[];
    query?: string;
    typeKey?: string;
    categoryId?: string;
    action?: string;
    expand?: string[];
    status?: string[];
    orderBy?: string;
    startAt?: number;
    maxResults?: number;
}
/**
 * Parameters for getting a project by ID or key
 */
export interface GetProjectByIdParams {
    expand?: string[];
    includeComponents?: boolean;
    includeVersions?: boolean;
    includeProperties?: boolean;
}
/**
 * API response for listing projects
 */
declare const ProjectsResponseSchema: z.ZodObject<{
    isLast: z.ZodBoolean;
    maxResults: z.ZodNumber;
    nextPage: z.ZodOptional<z.ZodString>;
    self: z.ZodString;
    startAt: z.ZodNumber;
    total: z.ZodNumber;
    values: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        key: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        simplified: z.ZodBoolean;
        style: z.ZodEnum<["classic", "next-gen"]>;
        avatarUrls: z.ZodObject<{
            '16x16': z.ZodString;
            '24x24': z.ZodString;
            '32x32': z.ZodString;
            '48x48': z.ZodString;
        }, "strip", z.ZodTypeAny, {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        }, {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        }>;
        insight: z.ZodOptional<z.ZodObject<{
            lastIssueUpdateTime: z.ZodString;
            totalIssueCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lastIssueUpdateTime: string;
            totalIssueCount: number;
        }, {
            lastIssueUpdateTime: string;
            totalIssueCount: number;
        }>>;
        projectCategory: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            description?: string | undefined;
        }, {
            name: string;
            id: string;
            self: string;
            description?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        name: string;
        id: string;
        self: string;
        simplified: boolean;
        style: "classic" | "next-gen";
        avatarUrls: {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        };
        insight?: {
            lastIssueUpdateTime: string;
            totalIssueCount: number;
        } | undefined;
        projectCategory?: {
            name: string;
            id: string;
            self: string;
            description?: string | undefined;
        } | undefined;
    }, {
        key: string;
        name: string;
        id: string;
        self: string;
        simplified: boolean;
        style: "classic" | "next-gen";
        avatarUrls: {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        };
        insight?: {
            lastIssueUpdateTime: string;
            totalIssueCount: number;
        } | undefined;
        projectCategory?: {
            name: string;
            id: string;
            self: string;
            description?: string | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    total: number;
    values: {
        key: string;
        name: string;
        id: string;
        self: string;
        simplified: boolean;
        style: "classic" | "next-gen";
        avatarUrls: {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        };
        insight?: {
            lastIssueUpdateTime: string;
            totalIssueCount: number;
        } | undefined;
        projectCategory?: {
            name: string;
            id: string;
            self: string;
            description?: string | undefined;
        } | undefined;
    }[];
    startAt: number;
    self: string;
    isLast: boolean;
    maxResults: number;
    nextPage?: string | undefined;
}, {
    total: number;
    values: {
        key: string;
        name: string;
        id: string;
        self: string;
        simplified: boolean;
        style: "classic" | "next-gen";
        avatarUrls: {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        };
        insight?: {
            lastIssueUpdateTime: string;
            totalIssueCount: number;
        } | undefined;
        projectCategory?: {
            name: string;
            id: string;
            self: string;
            description?: string | undefined;
        } | undefined;
    }[];
    startAt: number;
    self: string;
    isLast: boolean;
    maxResults: number;
    nextPage?: string | undefined;
}>;
export type ProjectsResponse = z.infer<typeof ProjectsResponseSchema>;
export { ProjectSchema, ProjectDetailedSchema, ProjectsResponseSchema };
