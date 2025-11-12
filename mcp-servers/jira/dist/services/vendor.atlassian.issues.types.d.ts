/**
 * Types for Atlassian Jira Issues API
 */
import { z } from 'zod';
/**
 * Issue comment schema
 */
declare const IssueCommentSchema: z.ZodObject<{
    id: z.ZodString;
    self: z.ZodString;
    author: z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }>;
    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
    created: z.ZodString;
    updated: z.ZodString;
    updateAuthor: z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }>;
    visibility: z.ZodOptional<z.ZodObject<{
        identifier: z.ZodString;
        type: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
        identifier: string;
    }, {
        value: string;
        type: string;
        identifier: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    self: string;
    author: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    created: string;
    updated: string;
    updateAuthor: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    body?: any;
    visibility?: {
        value: string;
        type: string;
        identifier: string;
    } | undefined;
}, {
    id: string;
    self: string;
    author: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    created: string;
    updated: string;
    updateAuthor: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    body?: any;
    visibility?: {
        value: string;
        type: string;
        identifier: string;
    } | undefined;
}>;
/**
 * Comments pagination response schema - used when retrieving comments for an issue
 */
declare const PageOfCommentsSchema: z.ZodObject<{
    comments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }>, "many">;
    maxResults: z.ZodNumber;
    total: z.ZodNumber;
    startAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    startAt: number;
    maxResults: number;
    comments: {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }[];
}, {
    total: number;
    startAt: number;
    maxResults: number;
    comments: {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }[];
}>;
export type PageOfComments = z.infer<typeof PageOfCommentsSchema>;
/**
 * Atlassian Document Format (ADF) document schema
 * Simplified version of the full ADF schema focusing on the minimal required structure
 */
declare const AdfDocumentSchema: z.ZodObject<{
    version: z.ZodNumber;
    type: z.ZodLiteral<"doc">;
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        content: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        text: z.ZodOptional<z.ZodString>;
        attrs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }, {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "doc";
    content: {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }[];
    version: number;
}, {
    type: "doc";
    content: {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }[];
    version: number;
}>;
export type AdfDocument = z.infer<typeof AdfDocumentSchema>;
/**
 * Comment body for creating/updating comments
 * Can be either ADF document object or a simple string (converted to ADF)
 */
declare const CommentBodySchema: z.ZodUnion<[z.ZodObject<{
    version: z.ZodNumber;
    type: z.ZodLiteral<"doc">;
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        content: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        text: z.ZodOptional<z.ZodString>;
        attrs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }, {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "doc";
    content: {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }[];
    version: number;
}, {
    type: "doc";
    content: {
        type: string;
        text?: string | undefined;
        content?: any[] | undefined;
        attrs?: Record<string, any> | undefined;
    }[];
    version: number;
}>, z.ZodObject<{
    body: z.ZodUnion<[z.ZodString, z.ZodObject<{
        version: z.ZodNumber;
        type: z.ZodLiteral<"doc">;
        content: z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            content: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            text: z.ZodOptional<z.ZodString>;
            attrs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            text?: string | undefined;
            content?: any[] | undefined;
            attrs?: Record<string, any> | undefined;
        }, {
            type: string;
            text?: string | undefined;
            content?: any[] | undefined;
            attrs?: Record<string, any> | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "doc";
        content: {
            type: string;
            text?: string | undefined;
            content?: any[] | undefined;
            attrs?: Record<string, any> | undefined;
        }[];
        version: number;
    }, {
        type: "doc";
        content: {
            type: string;
            text?: string | undefined;
            content?: any[] | undefined;
            attrs?: Record<string, any> | undefined;
        }[];
        version: number;
    }>]>;
}, "strip", z.ZodTypeAny, {
    body: string | {
        type: "doc";
        content: {
            type: string;
            text?: string | undefined;
            content?: any[] | undefined;
            attrs?: Record<string, any> | undefined;
        }[];
        version: number;
    };
}, {
    body: string | {
        type: "doc";
        content: {
            type: string;
            text?: string | undefined;
            content?: any[] | undefined;
            attrs?: Record<string, any> | undefined;
        }[];
        version: number;
    };
}>]>;
export type CommentBody = z.infer<typeof CommentBodySchema>;
/**
 * Parameters for listing comments
 */
export interface ListCommentsParams {
    startAt?: number;
    maxResults?: number;
    orderBy?: string;
    expand?: string[];
}
/**
 * Parameters for adding a comment
 */
export interface AddCommentParams {
    body: CommentBody;
    visibility?: {
        type: string;
        value: string;
    };
    expand?: string[];
}
/**
 * Issue worklog schema
 */
export declare const IssueWorklogSchema: z.ZodObject<{
    id: z.ZodString;
    self: z.ZodString;
    author: z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }>;
    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
    created: z.ZodString;
    updated: z.ZodString;
    issueId: z.ZodString;
    started: z.ZodString;
    timeSpent: z.ZodString;
    timeSpentSeconds: z.ZodNumber;
    updateAuthor: z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    }>;
    visibility: z.ZodOptional<z.ZodObject<{
        identifier: z.ZodString;
        type: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
        identifier: string;
    }, {
        value: string;
        type: string;
        identifier: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    self: string;
    author: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    created: string;
    updated: string;
    updateAuthor: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    issueId: string;
    started: string;
    timeSpent: string;
    timeSpentSeconds: number;
    visibility?: {
        value: string;
        type: string;
        identifier: string;
    } | undefined;
    comment?: any;
}, {
    id: string;
    self: string;
    author: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    created: string;
    updated: string;
    updateAuthor: {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
    };
    issueId: string;
    started: string;
    timeSpent: string;
    timeSpentSeconds: number;
    visibility?: {
        value: string;
        type: string;
        identifier: string;
    } | undefined;
    comment?: any;
}>;
/**
 * Issue worklog container schema - Jira API sometimes returns this as an object with nested arrays instead of a direct array
 */
export declare const IssueWorklogContainerSchema: z.ZodObject<{
    worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        issueId: z.ZodString;
        started: z.ZodString;
        timeSpent: z.ZodString;
        timeSpentSeconds: z.ZodNumber;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }>, "many">>;
    maxResults: z.ZodOptional<z.ZodNumber>;
    total: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodNumber>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        issueId: z.ZodString;
        started: z.ZodString;
        timeSpent: z.ZodString;
        timeSpentSeconds: z.ZodNumber;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }>, "many">>;
    maxResults: z.ZodOptional<z.ZodNumber>;
    total: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        issueId: z.ZodString;
        started: z.ZodString;
        timeSpent: z.ZodString;
        timeSpentSeconds: z.ZodNumber;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }>, "many">>;
    maxResults: z.ZodOptional<z.ZodNumber>;
    total: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">>;
export type IssueWorklog = z.infer<typeof IssueWorklogSchema>;
export type IssueWorklogContainer = z.infer<typeof IssueWorklogContainerSchema>;
/**
 * Issue fields schema
 */
declare const IssueFieldsSchema: z.ZodObject<{
    watcher: z.ZodOptional<z.ZodObject<{
        isWatching: z.ZodBoolean;
        self: z.ZodString;
        watchCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        self: string;
        isWatching: boolean;
        watchCount: number;
    }, {
        self: string;
        isWatching: boolean;
        watchCount: number;
    }>>;
    attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        filename: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            accountType: z.ZodOptional<z.ZodString>;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        }>;
        created: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
        content: z.ZodString;
        thumbnail: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        content: string;
        filename: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        };
        created: string;
        size: number;
        mimeType: string;
        thumbnail?: string | undefined;
    }, {
        id: string;
        self: string;
        content: string;
        filename: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        };
        created: string;
        size: number;
        mimeType: string;
        thumbnail?: string | undefined;
    }>, "many">>;
    description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
    project: z.ZodObject<{
        id: z.ZodString;
        key: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
        simplified: z.ZodBoolean;
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
        avatarUrls: Record<string, string>;
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
        avatarUrls: Record<string, string>;
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
    comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }>, "many">, z.ZodObject<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodObject<{
            id: z.ZodString;
            inward: z.ZodString;
            name: z.ZodString;
            outward: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            inward: string;
            outward: string;
        }, {
            name: string;
            id: string;
            inward: string;
            outward: string;
        }>;
        inwardIssue: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            self: z.ZodString;
            fields: z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }>>;
        outwardIssue: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            self: z.ZodString;
            fields: z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: {
            name: string;
            id: string;
            inward: string;
            outward: string;
        };
        id: string;
        inwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
        outwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
    }, {
        type: {
            name: string;
            id: string;
            inward: string;
            outward: string;
        };
        id: string;
        inwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
        outwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
    }>, "many">>;
    worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        issueId: z.ZodString;
        started: z.ZodString;
        timeSpent: z.ZodString;
        timeSpentSeconds: z.ZodNumber;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }>, "many">, z.ZodObject<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    timetracking: z.ZodOptional<z.ZodObject<{
        originalEstimate: z.ZodOptional<z.ZodString>;
        originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
        remainingEstimate: z.ZodOptional<z.ZodString>;
        remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
        timeSpent: z.ZodOptional<z.ZodString>;
        timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeSpent?: string | undefined;
        timeSpentSeconds?: number | undefined;
        originalEstimate?: string | undefined;
        originalEstimateSeconds?: number | undefined;
        remainingEstimate?: string | undefined;
        remainingEstimateSeconds?: number | undefined;
    }, {
        timeSpent?: string | undefined;
        timeSpentSeconds?: number | undefined;
        originalEstimate?: string | undefined;
        originalEstimateSeconds?: number | undefined;
        remainingEstimate?: string | undefined;
        remainingEstimateSeconds?: number | undefined;
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodObject<{
        iconUrl: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        iconUrl: string;
    }, {
        name: string;
        iconUrl: string;
    }>>;
    assignee: z.ZodNullable<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    priority: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        iconUrl: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        iconUrl: string;
    }, {
        name: string;
        id: string;
        self: string;
        iconUrl: string;
    }>>;
    issuetype: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        iconUrl: z.ZodString;
        self: z.ZodString;
        subtask: z.ZodBoolean;
        avatarId: z.ZodOptional<z.ZodNumber>;
        hierarchyLevel: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        self: string;
        iconUrl: string;
        subtask: boolean;
        avatarId?: number | undefined;
        hierarchyLevel?: number | undefined;
    }, {
        name: string;
        id: string;
        description: string;
        self: string;
        iconUrl: string;
        subtask: boolean;
        avatarId?: number | undefined;
        hierarchyLevel?: number | undefined;
    }>>;
    creator: z.ZodOptional<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    reporter: z.ZodNullable<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    created: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    components: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
    }, {
        name: string;
        id: string;
        self: string;
    }>, "many">>;
    fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        released: z.ZodBoolean;
        archived: z.ZodBoolean;
        releaseDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        releaseDate?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        releaseDate?: string | undefined;
    }>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    watcher: z.ZodOptional<z.ZodObject<{
        isWatching: z.ZodBoolean;
        self: z.ZodString;
        watchCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        self: string;
        isWatching: boolean;
        watchCount: number;
    }, {
        self: string;
        isWatching: boolean;
        watchCount: number;
    }>>;
    attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        filename: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            accountType: z.ZodOptional<z.ZodString>;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        }>;
        created: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
        content: z.ZodString;
        thumbnail: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        content: string;
        filename: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        };
        created: string;
        size: number;
        mimeType: string;
        thumbnail?: string | undefined;
    }, {
        id: string;
        self: string;
        content: string;
        filename: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        };
        created: string;
        size: number;
        mimeType: string;
        thumbnail?: string | undefined;
    }>, "many">>;
    description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
    project: z.ZodObject<{
        id: z.ZodString;
        key: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
        simplified: z.ZodBoolean;
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
        avatarUrls: Record<string, string>;
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
        avatarUrls: Record<string, string>;
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
    comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }>, "many">, z.ZodObject<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodObject<{
            id: z.ZodString;
            inward: z.ZodString;
            name: z.ZodString;
            outward: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            inward: string;
            outward: string;
        }, {
            name: string;
            id: string;
            inward: string;
            outward: string;
        }>;
        inwardIssue: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            self: z.ZodString;
            fields: z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }>>;
        outwardIssue: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            self: z.ZodString;
            fields: z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: {
            name: string;
            id: string;
            inward: string;
            outward: string;
        };
        id: string;
        inwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
        outwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
    }, {
        type: {
            name: string;
            id: string;
            inward: string;
            outward: string;
        };
        id: string;
        inwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
        outwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
    }>, "many">>;
    worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        issueId: z.ZodString;
        started: z.ZodString;
        timeSpent: z.ZodString;
        timeSpentSeconds: z.ZodNumber;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }>, "many">, z.ZodObject<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    timetracking: z.ZodOptional<z.ZodObject<{
        originalEstimate: z.ZodOptional<z.ZodString>;
        originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
        remainingEstimate: z.ZodOptional<z.ZodString>;
        remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
        timeSpent: z.ZodOptional<z.ZodString>;
        timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeSpent?: string | undefined;
        timeSpentSeconds?: number | undefined;
        originalEstimate?: string | undefined;
        originalEstimateSeconds?: number | undefined;
        remainingEstimate?: string | undefined;
        remainingEstimateSeconds?: number | undefined;
    }, {
        timeSpent?: string | undefined;
        timeSpentSeconds?: number | undefined;
        originalEstimate?: string | undefined;
        originalEstimateSeconds?: number | undefined;
        remainingEstimate?: string | undefined;
        remainingEstimateSeconds?: number | undefined;
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodObject<{
        iconUrl: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        iconUrl: string;
    }, {
        name: string;
        iconUrl: string;
    }>>;
    assignee: z.ZodNullable<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    priority: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        iconUrl: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        iconUrl: string;
    }, {
        name: string;
        id: string;
        self: string;
        iconUrl: string;
    }>>;
    issuetype: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        iconUrl: z.ZodString;
        self: z.ZodString;
        subtask: z.ZodBoolean;
        avatarId: z.ZodOptional<z.ZodNumber>;
        hierarchyLevel: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        self: string;
        iconUrl: string;
        subtask: boolean;
        avatarId?: number | undefined;
        hierarchyLevel?: number | undefined;
    }, {
        name: string;
        id: string;
        description: string;
        self: string;
        iconUrl: string;
        subtask: boolean;
        avatarId?: number | undefined;
        hierarchyLevel?: number | undefined;
    }>>;
    creator: z.ZodOptional<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    reporter: z.ZodNullable<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    created: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    components: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
    }, {
        name: string;
        id: string;
        self: string;
    }>, "many">>;
    fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        released: z.ZodBoolean;
        archived: z.ZodBoolean;
        releaseDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        releaseDate?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        releaseDate?: string | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    watcher: z.ZodOptional<z.ZodObject<{
        isWatching: z.ZodBoolean;
        self: z.ZodString;
        watchCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        self: string;
        isWatching: boolean;
        watchCount: number;
    }, {
        self: string;
        isWatching: boolean;
        watchCount: number;
    }>>;
    attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        filename: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            accountType: z.ZodOptional<z.ZodString>;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        }>;
        created: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
        content: z.ZodString;
        thumbnail: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        content: string;
        filename: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        };
        created: string;
        size: number;
        mimeType: string;
        thumbnail?: string | undefined;
    }, {
        id: string;
        self: string;
        content: string;
        filename: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
            accountType?: string | undefined;
        };
        created: string;
        size: number;
        mimeType: string;
        thumbnail?: string | undefined;
    }>, "many">>;
    description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
    project: z.ZodObject<{
        id: z.ZodString;
        key: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
        simplified: z.ZodBoolean;
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
        avatarUrls: Record<string, string>;
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
        avatarUrls: Record<string, string>;
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
    comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        body?: any;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
    }>, "many">, z.ZodObject<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodObject<{
            id: z.ZodString;
            inward: z.ZodString;
            name: z.ZodString;
            outward: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            inward: string;
            outward: string;
        }, {
            name: string;
            id: string;
            inward: string;
            outward: string;
        }>;
        inwardIssue: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            self: z.ZodString;
            fields: z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }>>;
        outwardIssue: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            self: z.ZodString;
            fields: z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                summary: z.ZodOptional<z.ZodString>;
                status: z.ZodObject<{
                    iconUrl: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    iconUrl: string;
                }, {
                    name: string;
                    iconUrl: string;
                }>;
            }, z.ZodTypeAny, "passthrough">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }, {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: {
            name: string;
            id: string;
            inward: string;
            outward: string;
        };
        id: string;
        inwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
        outwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
    }, {
        type: {
            name: string;
            id: string;
            inward: string;
            outward: string;
        };
        id: string;
        inwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
        outwardIssue?: {
            key: string;
            id: string;
            self: string;
            fields: {
                status: {
                    name: string;
                    iconUrl: string;
                };
                summary?: string | undefined;
            } & {
                [k: string]: unknown;
            };
        } | undefined;
    }>, "many">>;
    worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        self: z.ZodString;
        author: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        created: z.ZodString;
        updated: z.ZodString;
        issueId: z.ZodString;
        started: z.ZodString;
        timeSpent: z.ZodString;
        timeSpentSeconds: z.ZodNumber;
        updateAuthor: z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        }>;
        visibility: z.ZodOptional<z.ZodObject<{
            identifier: z.ZodString;
            type: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            identifier: string;
        }, {
            value: string;
            type: string;
            identifier: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }, {
        id: string;
        self: string;
        author: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        created: string;
        updated: string;
        updateAuthor: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
        };
        issueId: string;
        started: string;
        timeSpent: string;
        timeSpentSeconds: number;
        visibility?: {
            value: string;
            type: string;
            identifier: string;
        } | undefined;
        comment?: any;
    }>, "many">, z.ZodObject<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">>;
        maxResults: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        startAt: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    timetracking: z.ZodOptional<z.ZodObject<{
        originalEstimate: z.ZodOptional<z.ZodString>;
        originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
        remainingEstimate: z.ZodOptional<z.ZodString>;
        remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
        timeSpent: z.ZodOptional<z.ZodString>;
        timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeSpent?: string | undefined;
        timeSpentSeconds?: number | undefined;
        originalEstimate?: string | undefined;
        originalEstimateSeconds?: number | undefined;
        remainingEstimate?: string | undefined;
        remainingEstimateSeconds?: number | undefined;
    }, {
        timeSpent?: string | undefined;
        timeSpentSeconds?: number | undefined;
        originalEstimate?: string | undefined;
        originalEstimateSeconds?: number | undefined;
        remainingEstimate?: string | undefined;
        remainingEstimateSeconds?: number | undefined;
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodObject<{
        iconUrl: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        iconUrl: string;
    }, {
        name: string;
        iconUrl: string;
    }>>;
    assignee: z.ZodNullable<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    priority: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        iconUrl: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        iconUrl: string;
    }, {
        name: string;
        id: string;
        self: string;
        iconUrl: string;
    }>>;
    issuetype: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        iconUrl: z.ZodString;
        self: z.ZodString;
        subtask: z.ZodBoolean;
        avatarId: z.ZodOptional<z.ZodNumber>;
        hierarchyLevel: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        self: string;
        iconUrl: string;
        subtask: boolean;
        avatarId?: number | undefined;
        hierarchyLevel?: number | undefined;
    }, {
        name: string;
        id: string;
        description: string;
        self: string;
        iconUrl: string;
        subtask: boolean;
        avatarId?: number | undefined;
        hierarchyLevel?: number | undefined;
    }>>;
    creator: z.ZodOptional<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    reporter: z.ZodNullable<z.ZodObject<{
        accountId: z.ZodString;
        active: z.ZodBoolean;
        displayName: z.ZodString;
        self: z.ZodString;
        avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }, {
        self: string;
        displayName: string;
        active: boolean;
        accountId: string;
        avatarUrls?: Record<string, string> | undefined;
    }>>;
    created: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    components: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
    }, {
        name: string;
        id: string;
        self: string;
    }>, "many">>;
    fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        self: z.ZodString;
        released: z.ZodBoolean;
        archived: z.ZodBoolean;
        releaseDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        releaseDate?: string | undefined;
    }, {
        name: string;
        id: string;
        self: string;
        archived: boolean;
        released: boolean;
        releaseDate?: string | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
/**
 * Issue object returned from the API
 */
declare const IssueSchema: z.ZodObject<{
    id: z.ZodString;
    key: z.ZodString;
    self: z.ZodString;
    expand: z.ZodOptional<z.ZodString>;
    fields: z.ZodObject<{
        watcher: z.ZodOptional<z.ZodObject<{
            isWatching: z.ZodBoolean;
            self: z.ZodString;
            watchCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            self: string;
            isWatching: boolean;
            watchCount: number;
        }, {
            self: string;
            isWatching: boolean;
            watchCount: number;
        }>>;
        attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            filename: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                accountType: z.ZodOptional<z.ZodString>;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            }>;
            created: z.ZodString;
            size: z.ZodNumber;
            mimeType: z.ZodString;
            content: z.ZodString;
            thumbnail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }, {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }>, "many">>;
        description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
        project: z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
            simplified: z.ZodBoolean;
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
            avatarUrls: Record<string, string>;
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
            avatarUrls: Record<string, string>;
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
        comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">, z.ZodObject<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>]>>;
        issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodObject<{
                id: z.ZodString;
                inward: z.ZodString;
                name: z.ZodString;
                outward: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                inward: string;
                outward: string;
            }, {
                name: string;
                id: string;
                inward: string;
                outward: string;
            }>;
            inwardIssue: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                self: z.ZodString;
                fields: z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }>>;
            outwardIssue: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                self: z.ZodString;
                fields: z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }, {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }>, "many">>;
        worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">, z.ZodObject<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>]>>;
        updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        timetracking: z.ZodOptional<z.ZodObject<{
            originalEstimate: z.ZodOptional<z.ZodString>;
            originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
            remainingEstimate: z.ZodOptional<z.ZodString>;
            remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
            timeSpent: z.ZodOptional<z.ZodString>;
            timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        }, {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        }>>;
        summary: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodObject<{
            iconUrl: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            iconUrl: string;
        }, {
            name: string;
            iconUrl: string;
        }>>;
        assignee: z.ZodNullable<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        priority: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            iconUrl: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        }, {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        }>>;
        issuetype: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            iconUrl: z.ZodString;
            self: z.ZodString;
            subtask: z.ZodBoolean;
            avatarId: z.ZodOptional<z.ZodNumber>;
            hierarchyLevel: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        }, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        }>>;
        creator: z.ZodOptional<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        reporter: z.ZodNullable<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        created: z.ZodOptional<z.ZodString>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
        }, {
            name: string;
            id: string;
            self: string;
        }>, "many">>;
        fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
            released: z.ZodBoolean;
            archived: z.ZodBoolean;
            releaseDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }, {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        watcher: z.ZodOptional<z.ZodObject<{
            isWatching: z.ZodBoolean;
            self: z.ZodString;
            watchCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            self: string;
            isWatching: boolean;
            watchCount: number;
        }, {
            self: string;
            isWatching: boolean;
            watchCount: number;
        }>>;
        attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            filename: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                accountType: z.ZodOptional<z.ZodString>;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            }>;
            created: z.ZodString;
            size: z.ZodNumber;
            mimeType: z.ZodString;
            content: z.ZodString;
            thumbnail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }, {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }>, "many">>;
        description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
        project: z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
            simplified: z.ZodBoolean;
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
            avatarUrls: Record<string, string>;
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
            avatarUrls: Record<string, string>;
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
        comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">, z.ZodObject<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>]>>;
        issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodObject<{
                id: z.ZodString;
                inward: z.ZodString;
                name: z.ZodString;
                outward: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                inward: string;
                outward: string;
            }, {
                name: string;
                id: string;
                inward: string;
                outward: string;
            }>;
            inwardIssue: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                self: z.ZodString;
                fields: z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }>>;
            outwardIssue: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                self: z.ZodString;
                fields: z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }, {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }>, "many">>;
        worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">, z.ZodObject<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>]>>;
        updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        timetracking: z.ZodOptional<z.ZodObject<{
            originalEstimate: z.ZodOptional<z.ZodString>;
            originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
            remainingEstimate: z.ZodOptional<z.ZodString>;
            remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
            timeSpent: z.ZodOptional<z.ZodString>;
            timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        }, {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        }>>;
        summary: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodObject<{
            iconUrl: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            iconUrl: string;
        }, {
            name: string;
            iconUrl: string;
        }>>;
        assignee: z.ZodNullable<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        priority: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            iconUrl: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        }, {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        }>>;
        issuetype: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            iconUrl: z.ZodString;
            self: z.ZodString;
            subtask: z.ZodBoolean;
            avatarId: z.ZodOptional<z.ZodNumber>;
            hierarchyLevel: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        }, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        }>>;
        creator: z.ZodOptional<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        reporter: z.ZodNullable<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        created: z.ZodOptional<z.ZodString>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
        }, {
            name: string;
            id: string;
            self: string;
        }>, "many">>;
        fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
            released: z.ZodBoolean;
            archived: z.ZodBoolean;
            releaseDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }, {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        watcher: z.ZodOptional<z.ZodObject<{
            isWatching: z.ZodBoolean;
            self: z.ZodString;
            watchCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            self: string;
            isWatching: boolean;
            watchCount: number;
        }, {
            self: string;
            isWatching: boolean;
            watchCount: number;
        }>>;
        attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            filename: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                accountType: z.ZodOptional<z.ZodString>;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            }>;
            created: z.ZodString;
            size: z.ZodNumber;
            mimeType: z.ZodString;
            content: z.ZodString;
            thumbnail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }, {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }>, "many">>;
        description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
        project: z.ZodObject<{
            id: z.ZodString;
            key: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
            simplified: z.ZodBoolean;
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
            avatarUrls: Record<string, string>;
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
            avatarUrls: Record<string, string>;
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
        comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }>, "many">, z.ZodObject<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>]>>;
        issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodObject<{
                id: z.ZodString;
                inward: z.ZodString;
                name: z.ZodString;
                outward: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                inward: string;
                outward: string;
            }, {
                name: string;
                id: string;
                inward: string;
                outward: string;
            }>;
            inwardIssue: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                self: z.ZodString;
                fields: z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }>>;
            outwardIssue: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                self: z.ZodString;
                fields: z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    summary: z.ZodOptional<z.ZodString>;
                    status: z.ZodObject<{
                        iconUrl: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        iconUrl: string;
                    }, {
                        name: string;
                        iconUrl: string;
                    }>;
                }, z.ZodTypeAny, "passthrough">>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }, {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }, {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }>, "many">>;
        worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            self: z.ZodString;
            author: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
            created: z.ZodString;
            updated: z.ZodString;
            issueId: z.ZodString;
            started: z.ZodString;
            timeSpent: z.ZodString;
            timeSpentSeconds: z.ZodNumber;
            updateAuthor: z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            }>;
            visibility: z.ZodOptional<z.ZodObject<{
                identifier: z.ZodString;
                type: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                identifier: string;
            }, {
                value: string;
                type: string;
                identifier: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }, {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }>, "many">, z.ZodObject<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough">>]>>;
        updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        timetracking: z.ZodOptional<z.ZodObject<{
            originalEstimate: z.ZodOptional<z.ZodString>;
            originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
            remainingEstimate: z.ZodOptional<z.ZodString>;
            remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
            timeSpent: z.ZodOptional<z.ZodString>;
            timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        }, {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        }>>;
        summary: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodObject<{
            iconUrl: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            iconUrl: string;
        }, {
            name: string;
            iconUrl: string;
        }>>;
        assignee: z.ZodNullable<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        priority: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            iconUrl: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        }, {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        }>>;
        issuetype: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            iconUrl: z.ZodString;
            self: z.ZodString;
            subtask: z.ZodBoolean;
            avatarId: z.ZodOptional<z.ZodNumber>;
            hierarchyLevel: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        }, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        }>>;
        creator: z.ZodOptional<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        reporter: z.ZodNullable<z.ZodObject<{
            accountId: z.ZodString;
            active: z.ZodBoolean;
            displayName: z.ZodString;
            self: z.ZodString;
            avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }, {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        }>>;
        created: z.ZodOptional<z.ZodString>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
        }, {
            name: string;
            id: string;
            self: string;
        }>, "many">>;
        fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            self: z.ZodString;
            released: z.ZodBoolean;
            archived: z.ZodBoolean;
            releaseDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }, {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    key: string;
    id: string;
    self: string;
    fields: {
        assignee: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        } | null;
        project: {
            key: string;
            name: string;
            id: string;
            self: string;
            simplified: boolean;
            avatarUrls: Record<string, string>;
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
        };
        reporter: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        } | null;
        status?: {
            name: string;
            iconUrl: string;
        } | undefined;
        priority?: {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        } | undefined;
        description?: any;
        components?: {
            name: string;
            id: string;
            self: string;
        }[] | undefined;
        summary?: string | undefined;
        created?: string | undefined;
        updated?: string | number | undefined;
        comment?: {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }[] | z.objectOutputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        watcher?: {
            self: string;
            isWatching: boolean;
            watchCount: number;
        } | undefined;
        attachment?: {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }[] | undefined;
        issuelinks?: {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }[] | undefined;
        worklog?: {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }[] | z.objectOutputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        timetracking?: {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        } | undefined;
        issuetype?: {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        } | undefined;
        creator?: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        } | undefined;
        labels?: string[] | undefined;
        fixVersions?: {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
    expand?: string | undefined;
}, {
    key: string;
    id: string;
    self: string;
    fields: {
        assignee: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        } | null;
        project: {
            key: string;
            name: string;
            id: string;
            self: string;
            simplified: boolean;
            avatarUrls: Record<string, string>;
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
        };
        reporter: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        } | null;
        status?: {
            name: string;
            iconUrl: string;
        } | undefined;
        priority?: {
            name: string;
            id: string;
            self: string;
            iconUrl: string;
        } | undefined;
        description?: any;
        components?: {
            name: string;
            id: string;
            self: string;
        }[] | undefined;
        summary?: string | undefined;
        created?: string | undefined;
        updated?: string | number | undefined;
        comment?: {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            body?: any;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
        }[] | z.objectInputType<{
            comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        watcher?: {
            self: string;
            isWatching: boolean;
            watchCount: number;
        } | undefined;
        attachment?: {
            id: string;
            self: string;
            content: string;
            filename: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
                accountType?: string | undefined;
            };
            created: string;
            size: number;
            mimeType: string;
            thumbnail?: string | undefined;
        }[] | undefined;
        issuelinks?: {
            type: {
                name: string;
                id: string;
                inward: string;
                outward: string;
            };
            id: string;
            inwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
            outwardIssue?: {
                key: string;
                id: string;
                self: string;
                fields: {
                    status: {
                        name: string;
                        iconUrl: string;
                    };
                    summary?: string | undefined;
                } & {
                    [k: string]: unknown;
                };
            } | undefined;
        }[] | undefined;
        worklog?: {
            id: string;
            self: string;
            author: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            created: string;
            updated: string;
            updateAuthor: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
            };
            issueId: string;
            started: string;
            timeSpent: string;
            timeSpentSeconds: number;
            visibility?: {
                value: string;
                type: string;
                identifier: string;
            } | undefined;
            comment?: any;
        }[] | z.objectInputType<{
            worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">>;
            maxResults: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
            startAt: z.ZodOptional<z.ZodNumber>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        timetracking?: {
            timeSpent?: string | undefined;
            timeSpentSeconds?: number | undefined;
            originalEstimate?: string | undefined;
            originalEstimateSeconds?: number | undefined;
            remainingEstimate?: string | undefined;
            remainingEstimateSeconds?: number | undefined;
        } | undefined;
        issuetype?: {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            subtask: boolean;
            avatarId?: number | undefined;
            hierarchyLevel?: number | undefined;
        } | undefined;
        creator?: {
            self: string;
            displayName: string;
            active: boolean;
            accountId: string;
            avatarUrls?: Record<string, string> | undefined;
        } | undefined;
        labels?: string[] | undefined;
        fixVersions?: {
            name: string;
            id: string;
            self: string;
            archived: boolean;
            released: boolean;
            releaseDate?: string | undefined;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
    expand?: string | undefined;
}>;
export type Issue = z.infer<typeof IssueSchema>;
/**
 * Parameters for searching issues
 */
export interface SearchIssuesParams {
    jql?: string;
    startAt?: number;
    maxResults?: number;
    fields?: string[];
    expand?: string[];
    validateQuery?: boolean;
    properties?: string[];
    fieldsByKeys?: boolean;
    nextPageToken?: string;
    reconcileIssues?: boolean;
}
/**
 * Parameters for getting an issue by ID or key
 */
export interface GetIssueByIdParams {
    fields?: string[];
    expand?: string[];
    properties?: string[];
    fieldsByKeys?: boolean;
    updateHistory?: boolean;
}
/**
 * API response for searching issues (new enhanced JQL search endpoint)
 * The new /search/jql endpoint returns a different structure without total, maxResults, startAt
 */
declare const IssuesResponseSchema: z.ZodObject<{
    expand: z.ZodOptional<z.ZodString>;
    startAt: z.ZodOptional<z.ZodNumber>;
    maxResults: z.ZodOptional<z.ZodNumber>;
    total: z.ZodOptional<z.ZodNumber>;
    issues: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        key: z.ZodString;
        self: z.ZodString;
        expand: z.ZodOptional<z.ZodString>;
        fields: z.ZodObject<{
            watcher: z.ZodOptional<z.ZodObject<{
                isWatching: z.ZodBoolean;
                self: z.ZodString;
                watchCount: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                self: string;
                isWatching: boolean;
                watchCount: number;
            }, {
                self: string;
                isWatching: boolean;
                watchCount: number;
            }>>;
            attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                filename: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    accountType: z.ZodOptional<z.ZodString>;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                    avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                }>;
                created: z.ZodString;
                size: z.ZodNumber;
                mimeType: z.ZodString;
                content: z.ZodString;
                thumbnail: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }, {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }>, "many">>;
            description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
            project: z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
                simplified: z.ZodBoolean;
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
                avatarUrls: Record<string, string>;
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
                avatarUrls: Record<string, string>;
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
            comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">, z.ZodObject<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">>]>>;
            issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodObject<{
                    id: z.ZodString;
                    inward: z.ZodString;
                    name: z.ZodString;
                    outward: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                }, {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                }>;
                inwardIssue: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    key: z.ZodString;
                    self: z.ZodString;
                    fields: z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">>;
                }, "strip", z.ZodTypeAny, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }>>;
                outwardIssue: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    key: z.ZodString;
                    self: z.ZodString;
                    fields: z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">>;
                }, "strip", z.ZodTypeAny, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }, {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }>, "many">>;
            worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">, z.ZodObject<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">>]>>;
            updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            timetracking: z.ZodOptional<z.ZodObject<{
                originalEstimate: z.ZodOptional<z.ZodString>;
                originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
                remainingEstimate: z.ZodOptional<z.ZodString>;
                remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
                timeSpent: z.ZodOptional<z.ZodString>;
                timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            }, {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            }>>;
            summary: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodObject<{
                iconUrl: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                iconUrl: string;
            }, {
                name: string;
                iconUrl: string;
            }>>;
            assignee: z.ZodNullable<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            priority: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                iconUrl: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            }, {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            }>>;
            issuetype: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                iconUrl: z.ZodString;
                self: z.ZodString;
                subtask: z.ZodBoolean;
                avatarId: z.ZodOptional<z.ZodNumber>;
                hierarchyLevel: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            }, {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            }>>;
            creator: z.ZodOptional<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            reporter: z.ZodNullable<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            created: z.ZodOptional<z.ZodString>;
            labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
            }, {
                name: string;
                id: string;
                self: string;
            }>, "many">>;
            fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
                released: z.ZodBoolean;
                archived: z.ZodBoolean;
                releaseDate: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }, {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }>, "many">>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            watcher: z.ZodOptional<z.ZodObject<{
                isWatching: z.ZodBoolean;
                self: z.ZodString;
                watchCount: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                self: string;
                isWatching: boolean;
                watchCount: number;
            }, {
                self: string;
                isWatching: boolean;
                watchCount: number;
            }>>;
            attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                filename: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    accountType: z.ZodOptional<z.ZodString>;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                    avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                }>;
                created: z.ZodString;
                size: z.ZodNumber;
                mimeType: z.ZodString;
                content: z.ZodString;
                thumbnail: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }, {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }>, "many">>;
            description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
            project: z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
                simplified: z.ZodBoolean;
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
                avatarUrls: Record<string, string>;
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
                avatarUrls: Record<string, string>;
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
            comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">, z.ZodObject<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">>]>>;
            issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodObject<{
                    id: z.ZodString;
                    inward: z.ZodString;
                    name: z.ZodString;
                    outward: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                }, {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                }>;
                inwardIssue: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    key: z.ZodString;
                    self: z.ZodString;
                    fields: z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">>;
                }, "strip", z.ZodTypeAny, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }>>;
                outwardIssue: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    key: z.ZodString;
                    self: z.ZodString;
                    fields: z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">>;
                }, "strip", z.ZodTypeAny, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }, {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }>, "many">>;
            worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">, z.ZodObject<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">>]>>;
            updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            timetracking: z.ZodOptional<z.ZodObject<{
                originalEstimate: z.ZodOptional<z.ZodString>;
                originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
                remainingEstimate: z.ZodOptional<z.ZodString>;
                remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
                timeSpent: z.ZodOptional<z.ZodString>;
                timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            }, {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            }>>;
            summary: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodObject<{
                iconUrl: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                iconUrl: string;
            }, {
                name: string;
                iconUrl: string;
            }>>;
            assignee: z.ZodNullable<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            priority: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                iconUrl: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            }, {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            }>>;
            issuetype: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                iconUrl: z.ZodString;
                self: z.ZodString;
                subtask: z.ZodBoolean;
                avatarId: z.ZodOptional<z.ZodNumber>;
                hierarchyLevel: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            }, {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            }>>;
            creator: z.ZodOptional<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            reporter: z.ZodNullable<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            created: z.ZodOptional<z.ZodString>;
            labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
            }, {
                name: string;
                id: string;
                self: string;
            }>, "many">>;
            fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
                released: z.ZodBoolean;
                archived: z.ZodBoolean;
                releaseDate: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }, {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }>, "many">>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            watcher: z.ZodOptional<z.ZodObject<{
                isWatching: z.ZodBoolean;
                self: z.ZodString;
                watchCount: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                self: string;
                isWatching: boolean;
                watchCount: number;
            }, {
                self: string;
                isWatching: boolean;
                watchCount: number;
            }>>;
            attachment: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                filename: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    accountType: z.ZodOptional<z.ZodString>;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                    avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                }>;
                created: z.ZodString;
                size: z.ZodNumber;
                mimeType: z.ZodString;
                content: z.ZodString;
                thumbnail: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }, {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }>, "many">>;
            description: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodAny]>>;
            project: z.ZodObject<{
                id: z.ZodString;
                key: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodRecord<z.ZodString, z.ZodString>;
                simplified: z.ZodBoolean;
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
                avatarUrls: Record<string, string>;
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
                avatarUrls: Record<string, string>;
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
            comment: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }>, "many">, z.ZodObject<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">>]>>;
            issuelinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodObject<{
                    id: z.ZodString;
                    inward: z.ZodString;
                    name: z.ZodString;
                    outward: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                }, {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                }>;
                inwardIssue: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    key: z.ZodString;
                    self: z.ZodString;
                    fields: z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">>;
                }, "strip", z.ZodTypeAny, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }>>;
                outwardIssue: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    key: z.ZodString;
                    self: z.ZodString;
                    fields: z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                        summary: z.ZodOptional<z.ZodString>;
                        status: z.ZodObject<{
                            iconUrl: z.ZodString;
                            name: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            iconUrl: string;
                        }, {
                            name: string;
                            iconUrl: string;
                        }>;
                    }, z.ZodTypeAny, "passthrough">>;
                }, "strip", z.ZodTypeAny, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }, {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }, {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }>, "many">>;
            worklog: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                self: z.ZodString;
                author: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                created: z.ZodString;
                updated: z.ZodString;
                issueId: z.ZodString;
                started: z.ZodString;
                timeSpent: z.ZodString;
                timeSpentSeconds: z.ZodNumber;
                updateAuthor: z.ZodObject<{
                    accountId: z.ZodString;
                    active: z.ZodBoolean;
                    displayName: z.ZodString;
                    self: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }, {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                }>;
                visibility: z.ZodOptional<z.ZodObject<{
                    identifier: z.ZodString;
                    type: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    type: string;
                    identifier: string;
                }, {
                    value: string;
                    type: string;
                    identifier: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }, {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }>, "many">, z.ZodObject<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough">>]>>;
            updated: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            timetracking: z.ZodOptional<z.ZodObject<{
                originalEstimate: z.ZodOptional<z.ZodString>;
                originalEstimateSeconds: z.ZodOptional<z.ZodNumber>;
                remainingEstimate: z.ZodOptional<z.ZodString>;
                remainingEstimateSeconds: z.ZodOptional<z.ZodNumber>;
                timeSpent: z.ZodOptional<z.ZodString>;
                timeSpentSeconds: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            }, {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            }>>;
            summary: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodObject<{
                iconUrl: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                iconUrl: string;
            }, {
                name: string;
                iconUrl: string;
            }>>;
            assignee: z.ZodNullable<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            priority: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                iconUrl: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            }, {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            }>>;
            issuetype: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                iconUrl: z.ZodString;
                self: z.ZodString;
                subtask: z.ZodBoolean;
                avatarId: z.ZodOptional<z.ZodNumber>;
                hierarchyLevel: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            }, {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            }>>;
            creator: z.ZodOptional<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            reporter: z.ZodNullable<z.ZodObject<{
                accountId: z.ZodString;
                active: z.ZodBoolean;
                displayName: z.ZodString;
                self: z.ZodString;
                avatarUrls: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }, {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            }>>;
            created: z.ZodOptional<z.ZodString>;
            labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
            }, {
                name: string;
                id: string;
                self: string;
            }>, "many">>;
            fixVersions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                self: z.ZodString;
                released: z.ZodBoolean;
                archived: z.ZodBoolean;
                releaseDate: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }, {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }>, "many">>;
        }, z.ZodTypeAny, "passthrough">>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        id: string;
        self: string;
        fields: {
            assignee: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            project: {
                key: string;
                name: string;
                id: string;
                self: string;
                simplified: boolean;
                avatarUrls: Record<string, string>;
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
            };
            reporter: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            status?: {
                name: string;
                iconUrl: string;
            } | undefined;
            priority?: {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            } | undefined;
            description?: any;
            components?: {
                name: string;
                id: string;
                self: string;
            }[] | undefined;
            summary?: string | undefined;
            created?: string | undefined;
            updated?: string | number | undefined;
            comment?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }[] | z.objectOutputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            watcher?: {
                self: string;
                isWatching: boolean;
                watchCount: number;
            } | undefined;
            attachment?: {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }[] | undefined;
            issuelinks?: {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }[] | undefined;
            worklog?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }[] | z.objectOutputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            timetracking?: {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            } | undefined;
            issuetype?: {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            } | undefined;
            creator?: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | undefined;
            labels?: string[] | undefined;
            fixVersions?: {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }[] | undefined;
        } & {
            [k: string]: unknown;
        };
        expand?: string | undefined;
    }, {
        key: string;
        id: string;
        self: string;
        fields: {
            assignee: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            project: {
                key: string;
                name: string;
                id: string;
                self: string;
                simplified: boolean;
                avatarUrls: Record<string, string>;
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
            };
            reporter: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            status?: {
                name: string;
                iconUrl: string;
            } | undefined;
            priority?: {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            } | undefined;
            description?: any;
            components?: {
                name: string;
                id: string;
                self: string;
            }[] | undefined;
            summary?: string | undefined;
            created?: string | undefined;
            updated?: string | number | undefined;
            comment?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }[] | z.objectInputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            watcher?: {
                self: string;
                isWatching: boolean;
                watchCount: number;
            } | undefined;
            attachment?: {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }[] | undefined;
            issuelinks?: {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }[] | undefined;
            worklog?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }[] | z.objectInputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            timetracking?: {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            } | undefined;
            issuetype?: {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            } | undefined;
            creator?: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | undefined;
            labels?: string[] | undefined;
            fixVersions?: {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }[] | undefined;
        } & {
            [k: string]: unknown;
        };
        expand?: string | undefined;
    }>, "many">;
    isLast: z.ZodOptional<z.ZodBoolean>;
    nextPageToken: z.ZodOptional<z.ZodString>;
    warningMessages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    names: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    issues: {
        key: string;
        id: string;
        self: string;
        fields: {
            assignee: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            project: {
                key: string;
                name: string;
                id: string;
                self: string;
                simplified: boolean;
                avatarUrls: Record<string, string>;
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
            };
            reporter: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            status?: {
                name: string;
                iconUrl: string;
            } | undefined;
            priority?: {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            } | undefined;
            description?: any;
            components?: {
                name: string;
                id: string;
                self: string;
            }[] | undefined;
            summary?: string | undefined;
            created?: string | undefined;
            updated?: string | number | undefined;
            comment?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }[] | z.objectOutputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            watcher?: {
                self: string;
                isWatching: boolean;
                watchCount: number;
            } | undefined;
            attachment?: {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }[] | undefined;
            issuelinks?: {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }[] | undefined;
            worklog?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }[] | z.objectOutputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            timetracking?: {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            } | undefined;
            issuetype?: {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            } | undefined;
            creator?: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | undefined;
            labels?: string[] | undefined;
            fixVersions?: {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }[] | undefined;
        } & {
            [k: string]: unknown;
        };
        expand?: string | undefined;
    }[];
    total?: number | undefined;
    startAt?: number | undefined;
    isLast?: boolean | undefined;
    maxResults?: number | undefined;
    expand?: string | undefined;
    nextPageToken?: string | undefined;
    warningMessages?: string[] | undefined;
    names?: Record<string, string> | undefined;
    schema?: Record<string, unknown> | undefined;
}, {
    issues: {
        key: string;
        id: string;
        self: string;
        fields: {
            assignee: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            project: {
                key: string;
                name: string;
                id: string;
                self: string;
                simplified: boolean;
                avatarUrls: Record<string, string>;
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
            };
            reporter: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | null;
            status?: {
                name: string;
                iconUrl: string;
            } | undefined;
            priority?: {
                name: string;
                id: string;
                self: string;
                iconUrl: string;
            } | undefined;
            description?: any;
            components?: {
                name: string;
                id: string;
                self: string;
            }[] | undefined;
            summary?: string | undefined;
            created?: string | undefined;
            updated?: string | number | undefined;
            comment?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                body?: any;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
            }[] | z.objectInputType<{
                comments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    body: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    body?: any;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            watcher?: {
                self: string;
                isWatching: boolean;
                watchCount: number;
            } | undefined;
            attachment?: {
                id: string;
                self: string;
                content: string;
                filename: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                    avatarUrls?: Record<string, string> | undefined;
                    accountType?: string | undefined;
                };
                created: string;
                size: number;
                mimeType: string;
                thumbnail?: string | undefined;
            }[] | undefined;
            issuelinks?: {
                type: {
                    name: string;
                    id: string;
                    inward: string;
                    outward: string;
                };
                id: string;
                inwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
                outwardIssue?: {
                    key: string;
                    id: string;
                    self: string;
                    fields: {
                        status: {
                            name: string;
                            iconUrl: string;
                        };
                        summary?: string | undefined;
                    } & {
                        [k: string]: unknown;
                    };
                } | undefined;
            }[] | undefined;
            worklog?: {
                id: string;
                self: string;
                author: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                created: string;
                updated: string;
                updateAuthor: {
                    self: string;
                    displayName: string;
                    active: boolean;
                    accountId: string;
                };
                issueId: string;
                started: string;
                timeSpent: string;
                timeSpentSeconds: number;
                visibility?: {
                    value: string;
                    type: string;
                    identifier: string;
                } | undefined;
                comment?: any;
            }[] | z.objectInputType<{
                worklogs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    self: z.ZodString;
                    author: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    comment: z.ZodUnion<[z.ZodString, z.ZodAny]>;
                    created: z.ZodString;
                    updated: z.ZodString;
                    issueId: z.ZodString;
                    started: z.ZodString;
                    timeSpent: z.ZodString;
                    timeSpentSeconds: z.ZodNumber;
                    updateAuthor: z.ZodObject<{
                        accountId: z.ZodString;
                        active: z.ZodBoolean;
                        displayName: z.ZodString;
                        self: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }, {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    }>;
                    visibility: z.ZodOptional<z.ZodObject<{
                        identifier: z.ZodString;
                        type: z.ZodString;
                        value: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        value: string;
                        type: string;
                        identifier: string;
                    }, {
                        value: string;
                        type: string;
                        identifier: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }, {
                    id: string;
                    self: string;
                    author: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    created: string;
                    updated: string;
                    updateAuthor: {
                        self: string;
                        displayName: string;
                        active: boolean;
                        accountId: string;
                    };
                    issueId: string;
                    started: string;
                    timeSpent: string;
                    timeSpentSeconds: number;
                    visibility?: {
                        value: string;
                        type: string;
                        identifier: string;
                    } | undefined;
                    comment?: any;
                }>, "many">>;
                maxResults: z.ZodOptional<z.ZodNumber>;
                total: z.ZodOptional<z.ZodNumber>;
                startAt: z.ZodOptional<z.ZodNumber>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            timetracking?: {
                timeSpent?: string | undefined;
                timeSpentSeconds?: number | undefined;
                originalEstimate?: string | undefined;
                originalEstimateSeconds?: number | undefined;
                remainingEstimate?: string | undefined;
                remainingEstimateSeconds?: number | undefined;
            } | undefined;
            issuetype?: {
                name: string;
                id: string;
                description: string;
                self: string;
                iconUrl: string;
                subtask: boolean;
                avatarId?: number | undefined;
                hierarchyLevel?: number | undefined;
            } | undefined;
            creator?: {
                self: string;
                displayName: string;
                active: boolean;
                accountId: string;
                avatarUrls?: Record<string, string> | undefined;
            } | undefined;
            labels?: string[] | undefined;
            fixVersions?: {
                name: string;
                id: string;
                self: string;
                archived: boolean;
                released: boolean;
                releaseDate?: string | undefined;
            }[] | undefined;
        } & {
            [k: string]: unknown;
        };
        expand?: string | undefined;
    }[];
    total?: number | undefined;
    startAt?: number | undefined;
    isLast?: boolean | undefined;
    maxResults?: number | undefined;
    expand?: string | undefined;
    nextPageToken?: string | undefined;
    warningMessages?: string[] | undefined;
    names?: Record<string, string> | undefined;
    schema?: Record<string, unknown> | undefined;
}>;
export type IssuesResponse = z.infer<typeof IssuesResponseSchema>;
declare const DevInfoResponseSchema: z.ZodObject<{
    errors: z.ZodArray<z.ZodString, "many">;
    detail: z.ZodArray<z.ZodObject<{
        repositories: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            avatar: z.ZodString;
            url: z.ZodString;
            commits: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                displayId: z.ZodString;
                message: z.ZodString;
                author: z.ZodOptional<z.ZodObject<{
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    avatar?: string | undefined;
                }, {
                    name: string;
                    avatar?: string | undefined;
                }>>;
                authorTimestamp: z.ZodString;
                url: z.ZodString;
                fileCount: z.ZodNumber;
                merge: z.ZodBoolean;
                files: z.ZodArray<z.ZodUnknown, "many">;
            }, "strip", z.ZodTypeAny, {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }, {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
            id: string;
            avatar: string;
            commits?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }, {
            url: string;
            name: string;
            id: string;
            avatar: string;
            commits?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }>, "many">>;
        branches: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            createPullRequestUrl: z.ZodString;
            repository: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                avatar: z.ZodString;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                name: string;
                id: string;
                avatar: string;
            }, {
                url: string;
                name: string;
                id: string;
                avatar: string;
            }>>;
            lastCommit: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                displayId: z.ZodString;
                message: z.ZodString;
                author: z.ZodOptional<z.ZodObject<{
                    name: z.ZodString;
                    avatar: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    avatar?: string | undefined;
                }, {
                    name: string;
                    avatar?: string | undefined;
                }>>;
                authorTimestamp: z.ZodString;
                url: z.ZodString;
                fileCount: z.ZodNumber;
                merge: z.ZodBoolean;
                files: z.ZodArray<z.ZodUnknown, "many">;
            }, "strip", z.ZodTypeAny, {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }, {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
            createPullRequestUrl: string;
            repository?: {
                url: string;
                name: string;
                id: string;
                avatar: string;
            } | undefined;
            lastCommit?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            } | undefined;
        }, {
            url: string;
            name: string;
            createPullRequestUrl: string;
            repository?: {
                url: string;
                name: string;
                id: string;
                avatar: string;
            } | undefined;
            lastCommit?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            } | undefined;
        }>, "many">>;
        pullRequests: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            commentCount: z.ZodNumber;
            source: z.ZodOptional<z.ZodObject<{
                branch: z.ZodString;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                branch: string;
            }, {
                url: string;
                branch: string;
            }>>;
            destination: z.ZodOptional<z.ZodObject<{
                branch: z.ZodString;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                branch: string;
            }, {
                url: string;
                branch: string;
            }>>;
            reviewers: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
                approved: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }, {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }>, "many">>;
            status: z.ZodString;
            url: z.ZodString;
            lastUpdate: z.ZodString;
            repositoryId: z.ZodString;
            repositoryName: z.ZodString;
            repositoryUrl: z.ZodString;
            repositoryAvatarUrl: z.ZodString;
            author: z.ZodOptional<z.ZodObject<{
                name: z.ZodString;
                avatar: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                avatar?: string | undefined;
            }, {
                name: string;
                avatar?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
            status: string;
            id: string;
            commentCount: number;
            lastUpdate: string;
            repositoryId: string;
            repositoryName: string;
            repositoryUrl: string;
            repositoryAvatarUrl: string;
            source?: {
                url: string;
                branch: string;
            } | undefined;
            author?: {
                name: string;
                avatar?: string | undefined;
            } | undefined;
            destination?: {
                url: string;
                branch: string;
            } | undefined;
            reviewers?: {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }[] | undefined;
        }, {
            url: string;
            name: string;
            status: string;
            id: string;
            commentCount: number;
            lastUpdate: string;
            repositoryId: string;
            repositoryName: string;
            repositoryUrl: string;
            repositoryAvatarUrl: string;
            source?: {
                url: string;
                branch: string;
            } | undefined;
            author?: {
                name: string;
                avatar?: string | undefined;
            } | undefined;
            destination?: {
                url: string;
                branch: string;
            } | undefined;
            reviewers?: {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }[] | undefined;
        }>, "many">>;
        _instance: z.ZodOptional<z.ZodObject<{
            singleInstance: z.ZodBoolean;
            baseUrl: z.ZodString;
            name: z.ZodString;
            typeName: z.ZodString;
            id: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: string;
            id: string;
            typeName: string;
            singleInstance: boolean;
            baseUrl: string;
        }, {
            name: string;
            type: string;
            id: string;
            typeName: string;
            singleInstance: boolean;
            baseUrl: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        repositories?: {
            url: string;
            name: string;
            id: string;
            avatar: string;
            commits?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }[] | undefined;
        branches?: {
            url: string;
            name: string;
            createPullRequestUrl: string;
            repository?: {
                url: string;
                name: string;
                id: string;
                avatar: string;
            } | undefined;
            lastCommit?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
        pullRequests?: {
            url: string;
            name: string;
            status: string;
            id: string;
            commentCount: number;
            lastUpdate: string;
            repositoryId: string;
            repositoryName: string;
            repositoryUrl: string;
            repositoryAvatarUrl: string;
            source?: {
                url: string;
                branch: string;
            } | undefined;
            author?: {
                name: string;
                avatar?: string | undefined;
            } | undefined;
            destination?: {
                url: string;
                branch: string;
            } | undefined;
            reviewers?: {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }[] | undefined;
        }[] | undefined;
        _instance?: {
            name: string;
            type: string;
            id: string;
            typeName: string;
            singleInstance: boolean;
            baseUrl: string;
        } | undefined;
    }, {
        repositories?: {
            url: string;
            name: string;
            id: string;
            avatar: string;
            commits?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }[] | undefined;
        branches?: {
            url: string;
            name: string;
            createPullRequestUrl: string;
            repository?: {
                url: string;
                name: string;
                id: string;
                avatar: string;
            } | undefined;
            lastCommit?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
        pullRequests?: {
            url: string;
            name: string;
            status: string;
            id: string;
            commentCount: number;
            lastUpdate: string;
            repositoryId: string;
            repositoryName: string;
            repositoryUrl: string;
            repositoryAvatarUrl: string;
            source?: {
                url: string;
                branch: string;
            } | undefined;
            author?: {
                name: string;
                avatar?: string | undefined;
            } | undefined;
            destination?: {
                url: string;
                branch: string;
            } | undefined;
            reviewers?: {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }[] | undefined;
        }[] | undefined;
        _instance?: {
            name: string;
            type: string;
            id: string;
            typeName: string;
            singleInstance: boolean;
            baseUrl: string;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    errors: string[];
    detail: {
        repositories?: {
            url: string;
            name: string;
            id: string;
            avatar: string;
            commits?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }[] | undefined;
        branches?: {
            url: string;
            name: string;
            createPullRequestUrl: string;
            repository?: {
                url: string;
                name: string;
                id: string;
                avatar: string;
            } | undefined;
            lastCommit?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
        pullRequests?: {
            url: string;
            name: string;
            status: string;
            id: string;
            commentCount: number;
            lastUpdate: string;
            repositoryId: string;
            repositoryName: string;
            repositoryUrl: string;
            repositoryAvatarUrl: string;
            source?: {
                url: string;
                branch: string;
            } | undefined;
            author?: {
                name: string;
                avatar?: string | undefined;
            } | undefined;
            destination?: {
                url: string;
                branch: string;
            } | undefined;
            reviewers?: {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }[] | undefined;
        }[] | undefined;
        _instance?: {
            name: string;
            type: string;
            id: string;
            typeName: string;
            singleInstance: boolean;
            baseUrl: string;
        } | undefined;
    }[];
}, {
    errors: string[];
    detail: {
        repositories?: {
            url: string;
            name: string;
            id: string;
            avatar: string;
            commits?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            }[] | undefined;
        }[] | undefined;
        branches?: {
            url: string;
            name: string;
            createPullRequestUrl: string;
            repository?: {
                url: string;
                name: string;
                id: string;
                avatar: string;
            } | undefined;
            lastCommit?: {
                url: string;
                message: string;
                id: string;
                displayId: string;
                authorTimestamp: string;
                fileCount: number;
                merge: boolean;
                files: unknown[];
                author?: {
                    name: string;
                    avatar?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
        pullRequests?: {
            url: string;
            name: string;
            status: string;
            id: string;
            commentCount: number;
            lastUpdate: string;
            repositoryId: string;
            repositoryName: string;
            repositoryUrl: string;
            repositoryAvatarUrl: string;
            source?: {
                url: string;
                branch: string;
            } | undefined;
            author?: {
                name: string;
                avatar?: string | undefined;
            } | undefined;
            destination?: {
                url: string;
                branch: string;
            } | undefined;
            reviewers?: {
                name: string;
                approved: boolean;
                avatar?: string | undefined;
            }[] | undefined;
        }[] | undefined;
        _instance?: {
            name: string;
            type: string;
            id: string;
            typeName: string;
            singleInstance: boolean;
            baseUrl: string;
        } | undefined;
    }[];
}>;
export type DevInfoResponse = z.infer<typeof DevInfoResponseSchema>;
declare const DevInfoSummaryResponseSchema: z.ZodObject<{
    errors: z.ZodArray<z.ZodString, "many">;
    configErrors: z.ZodArray<z.ZodString, "many">;
    summary: z.ZodObject<{
        pullrequest: z.ZodObject<{
            overall: z.ZodObject<{
                count: z.ZodNumber;
                lastUpdated: z.ZodNullable<z.ZodString>;
                stateCount: z.ZodNumber;
                state: z.ZodNullable<z.ZodString>;
                dataType: z.ZodString;
                open: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            }, {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            }>;
            byInstanceType: z.ZodRecord<z.ZodString, z.ZodObject<{
                count: z.ZodNumber;
                name: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                count: number;
                name: string | null;
            }, {
                count: number;
                name: string | null;
            }>>;
        }, "strip", z.ZodTypeAny, {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        }, {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        }>;
        repository: z.ZodObject<{
            overall: z.ZodObject<{
                count: z.ZodNumber;
                lastUpdated: z.ZodNullable<z.ZodString>;
                dataType: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            }, {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            }>;
            byInstanceType: z.ZodRecord<z.ZodString, z.ZodObject<{
                count: z.ZodNumber;
                name: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                count: number;
                name: string | null;
            }, {
                count: number;
                name: string | null;
            }>>;
        }, "strip", z.ZodTypeAny, {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        }, {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        }>;
        branch: z.ZodObject<{
            overall: z.ZodObject<{
                count: z.ZodNumber;
                lastUpdated: z.ZodNullable<z.ZodString>;
                dataType: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            }, {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            }>;
            byInstanceType: z.ZodRecord<z.ZodString, z.ZodObject<{
                count: z.ZodNumber;
                name: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                count: number;
                name: string | null;
            }, {
                count: number;
                name: string | null;
            }>>;
        }, "strip", z.ZodTypeAny, {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        }, {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        }>;
    }, "strip", z.ZodTypeAny, {
        repository: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        branch: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        pullrequest: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
    }, {
        repository: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        branch: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        pullrequest: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    summary: {
        repository: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        branch: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        pullrequest: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
    };
    errors: string[];
    configErrors: string[];
}, {
    summary: {
        repository: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        branch: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
        pullrequest: {
            overall: {
                count: number;
                lastUpdated: string | null;
                dataType: string;
                stateCount: number;
                state: string | null;
                open: boolean;
            };
            byInstanceType: Record<string, {
                count: number;
                name: string | null;
            }>;
        };
    };
    errors: string[];
    configErrors: string[];
}>;
export type DevInfoSummaryResponse = z.infer<typeof DevInfoSummaryResponseSchema>;
/**
 * Field metadata for creating issues
 */
declare const CreateMetaFieldSchema: z.ZodObject<{
    required: z.ZodBoolean;
    name: z.ZodString;
    key: z.ZodOptional<z.ZodString>;
    fieldId: z.ZodOptional<z.ZodString>;
    schema: z.ZodObject<{
        type: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        custom: z.ZodOptional<z.ZodString>;
        customId: z.ZodOptional<z.ZodNumber>;
        items: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        custom?: string | undefined;
        system?: string | undefined;
        customId?: number | undefined;
        items?: string | undefined;
    }, {
        type: string;
        custom?: string | undefined;
        system?: string | undefined;
        customId?: number | undefined;
        items?: string | undefined;
    }>;
    hasDefaultValue: z.ZodOptional<z.ZodBoolean>;
    operations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    allowedValues: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    defaultValue: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    name: string;
    required: boolean;
    schema: {
        type: string;
        custom?: string | undefined;
        system?: string | undefined;
        customId?: number | undefined;
        items?: string | undefined;
    };
    key?: string | undefined;
    fieldId?: string | undefined;
    hasDefaultValue?: boolean | undefined;
    operations?: string[] | undefined;
    allowedValues?: unknown[] | undefined;
    defaultValue?: unknown;
}, {
    name: string;
    required: boolean;
    schema: {
        type: string;
        custom?: string | undefined;
        system?: string | undefined;
        customId?: number | undefined;
        items?: string | undefined;
    };
    key?: string | undefined;
    fieldId?: string | undefined;
    hasDefaultValue?: boolean | undefined;
    operations?: string[] | undefined;
    allowedValues?: unknown[] | undefined;
    defaultValue?: unknown;
}>;
export type CreateMetaField = z.infer<typeof CreateMetaFieldSchema>;
/**
 * Issue type metadata for creating issues
 */
declare const CreateMetaIssueTypeSchema: z.ZodObject<{
    self: z.ZodString;
    id: z.ZodString;
    description: z.ZodString;
    iconUrl: z.ZodString;
    name: z.ZodString;
    subtask: z.ZodBoolean;
    hierarchyLevel: z.ZodOptional<z.ZodNumber>;
    fields: z.ZodRecord<z.ZodString, z.ZodObject<{
        required: z.ZodBoolean;
        name: z.ZodString;
        key: z.ZodOptional<z.ZodString>;
        fieldId: z.ZodOptional<z.ZodString>;
        schema: z.ZodObject<{
            type: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            custom: z.ZodOptional<z.ZodString>;
            customId: z.ZodOptional<z.ZodNumber>;
            items: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        }, {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        }>;
        hasDefaultValue: z.ZodOptional<z.ZodBoolean>;
        operations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allowedValues: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
        defaultValue: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    description: string;
    self: string;
    iconUrl: string;
    fields: Record<string, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }>;
    subtask: boolean;
    hierarchyLevel?: number | undefined;
}, {
    name: string;
    id: string;
    description: string;
    self: string;
    iconUrl: string;
    fields: Record<string, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }>;
    subtask: boolean;
    hierarchyLevel?: number | undefined;
}>;
export type CreateMetaIssueType = z.infer<typeof CreateMetaIssueTypeSchema>;
/**
 * Create metadata response for a specific issue type
 */
declare const CreateMetaResponseSchema: z.ZodObject<{
    expand: z.ZodOptional<z.ZodString>;
    projects: z.ZodOptional<z.ZodArray<z.ZodObject<{
        self: z.ZodString;
        id: z.ZodString;
        key: z.ZodString;
        name: z.ZodString;
        issuetypes: z.ZodArray<z.ZodObject<{
            self: z.ZodString;
            id: z.ZodString;
            description: z.ZodString;
            iconUrl: z.ZodString;
            name: z.ZodString;
            subtask: z.ZodBoolean;
            hierarchyLevel: z.ZodOptional<z.ZodNumber>;
            fields: z.ZodRecord<z.ZodString, z.ZodObject<{
                required: z.ZodBoolean;
                name: z.ZodString;
                key: z.ZodOptional<z.ZodString>;
                fieldId: z.ZodOptional<z.ZodString>;
                schema: z.ZodObject<{
                    type: z.ZodString;
                    system: z.ZodOptional<z.ZodString>;
                    custom: z.ZodOptional<z.ZodString>;
                    customId: z.ZodOptional<z.ZodNumber>;
                    items: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                }, {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                }>;
                hasDefaultValue: z.ZodOptional<z.ZodBoolean>;
                operations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                allowedValues: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
                defaultValue: z.ZodOptional<z.ZodUnknown>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            fields: Record<string, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>;
            subtask: boolean;
            hierarchyLevel?: number | undefined;
        }, {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            fields: Record<string, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>;
            subtask: boolean;
            hierarchyLevel?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        key: string;
        name: string;
        id: string;
        self: string;
        issuetypes: {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            fields: Record<string, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>;
            subtask: boolean;
            hierarchyLevel?: number | undefined;
        }[];
    }, {
        key: string;
        name: string;
        id: string;
        self: string;
        issuetypes: {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            fields: Record<string, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>;
            subtask: boolean;
            hierarchyLevel?: number | undefined;
        }[];
    }>, "many">>;
    self: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    subtask: z.ZodOptional<z.ZodBoolean>;
    hierarchyLevel: z.ZodOptional<z.ZodNumber>;
    fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        required: z.ZodBoolean;
        name: z.ZodString;
        key: z.ZodOptional<z.ZodString>;
        fieldId: z.ZodOptional<z.ZodString>;
        schema: z.ZodObject<{
            type: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            custom: z.ZodOptional<z.ZodString>;
            customId: z.ZodOptional<z.ZodNumber>;
            items: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        }, {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        }>;
        hasDefaultValue: z.ZodOptional<z.ZodBoolean>;
        operations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allowedValues: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
        defaultValue: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    id?: string | undefined;
    description?: string | undefined;
    self?: string | undefined;
    expand?: string | undefined;
    iconUrl?: string | undefined;
    fields?: Record<string, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }> | undefined;
    subtask?: boolean | undefined;
    hierarchyLevel?: number | undefined;
    projects?: {
        key: string;
        name: string;
        id: string;
        self: string;
        issuetypes: {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            fields: Record<string, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>;
            subtask: boolean;
            hierarchyLevel?: number | undefined;
        }[];
    }[] | undefined;
}, {
    name?: string | undefined;
    id?: string | undefined;
    description?: string | undefined;
    self?: string | undefined;
    expand?: string | undefined;
    iconUrl?: string | undefined;
    fields?: Record<string, {
        name: string;
        required: boolean;
        schema: {
            type: string;
            custom?: string | undefined;
            system?: string | undefined;
            customId?: number | undefined;
            items?: string | undefined;
        };
        key?: string | undefined;
        fieldId?: string | undefined;
        hasDefaultValue?: boolean | undefined;
        operations?: string[] | undefined;
        allowedValues?: unknown[] | undefined;
        defaultValue?: unknown;
    }> | undefined;
    subtask?: boolean | undefined;
    hierarchyLevel?: number | undefined;
    projects?: {
        key: string;
        name: string;
        id: string;
        self: string;
        issuetypes: {
            name: string;
            id: string;
            description: string;
            self: string;
            iconUrl: string;
            fields: Record<string, {
                name: string;
                required: boolean;
                schema: {
                    type: string;
                    custom?: string | undefined;
                    system?: string | undefined;
                    customId?: number | undefined;
                    items?: string | undefined;
                };
                key?: string | undefined;
                fieldId?: string | undefined;
                hasDefaultValue?: boolean | undefined;
                operations?: string[] | undefined;
                allowedValues?: unknown[] | undefined;
                defaultValue?: unknown;
            }>;
            subtask: boolean;
            hierarchyLevel?: number | undefined;
        }[];
    }[] | undefined;
}>;
export type CreateMetaResponse = z.infer<typeof CreateMetaResponseSchema>;
/**
 * Parameters for getting create metadata
 */
export interface GetCreateMetaParams {
    projectKeys?: string[];
    projectIds?: string[];
    issuetypeIds?: string[];
    issuetypeNames?: string[];
    expand?: string[];
}
/**
 * Issue creation data
 */
export interface CreateIssueData {
    fields: Record<string, unknown>;
    update?: Record<string, unknown[]>;
    historyMetadata?: Record<string, unknown>;
    properties?: Array<{
        key: string;
        value: unknown;
    }>;
}
/**
 * Parameters for creating an issue
 */
export interface CreateIssueParams extends CreateIssueData {
    updateHistory?: boolean;
}
/**
 * Response from creating an issue
 */
declare const CreateIssueResponseSchema: z.ZodObject<{
    id: z.ZodString;
    key: z.ZodString;
    self: z.ZodString;
    transition: z.ZodOptional<z.ZodObject<{
        status: z.ZodNumber;
        errorCollection: z.ZodOptional<z.ZodObject<{
            errorMessages: z.ZodArray<z.ZodString, "many">;
            errors: z.ZodRecord<z.ZodString, z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            errors: Record<string, string>;
            errorMessages: string[];
        }, {
            errors: Record<string, string>;
            errorMessages: string[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        status: number;
        errorCollection?: {
            errors: Record<string, string>;
            errorMessages: string[];
        } | undefined;
    }, {
        status: number;
        errorCollection?: {
            errors: Record<string, string>;
            errorMessages: string[];
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    id: string;
    self: string;
    transition?: {
        status: number;
        errorCollection?: {
            errors: Record<string, string>;
            errorMessages: string[];
        } | undefined;
    } | undefined;
}, {
    key: string;
    id: string;
    self: string;
    transition?: {
        status: number;
        errorCollection?: {
            errors: Record<string, string>;
            errorMessages: string[];
        } | undefined;
    } | undefined;
}>;
export type CreateIssueResponse = z.infer<typeof CreateIssueResponseSchema>;
export { IssueSchema, IssueFieldsSchema, IssuesResponseSchema, DevInfoResponseSchema, DevInfoSummaryResponseSchema, PageOfCommentsSchema, IssueCommentSchema, CommentBodySchema, CreateMetaResponseSchema, CreateIssueResponseSchema, };
