"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIssueResponseSchema = exports.CreateMetaResponseSchema = exports.CommentBodySchema = exports.IssueCommentSchema = exports.PageOfCommentsSchema = exports.DevInfoSummaryResponseSchema = exports.DevInfoResponseSchema = exports.IssuesResponseSchema = exports.IssueFieldsSchema = exports.IssueSchema = exports.IssueWorklogContainerSchema = exports.IssueWorklogSchema = void 0;
/**
 * Types for Atlassian Jira Issues API
 */
const zod_1 = require("zod");
/**
 * Issue status schema
 */
const IssueStatusSchema = zod_1.z.object({
    iconUrl: zod_1.z.string(),
    name: zod_1.z.string(),
});
/**
 * Issue link type schema
 */
const IssueLinkTypeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    inward: zod_1.z.string(),
    name: zod_1.z.string(),
    outward: zod_1.z.string(),
});
/**
 * Represents the minimal information about a linked issue provided within an IssueLink.
 */
const LinkedIssueInfoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    self: zod_1.z.string(),
    fields: zod_1.z
        .object({
        summary: zod_1.z.string().optional(),
        status: IssueStatusSchema,
    })
        .passthrough(), // Allow additional fields
});
/**
 * Issue link schema
 */
const IssueLinkSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: IssueLinkTypeSchema,
    inwardIssue: LinkedIssueInfoSchema.optional(),
    outwardIssue: LinkedIssueInfoSchema.optional(),
});
/**
 * Issue attachment schema
 */
const IssueAttachmentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    self: zod_1.z.string(),
    filename: zod_1.z.string(),
    author: zod_1.z.object({
        accountId: zod_1.z.string(),
        accountType: zod_1.z.string().optional(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
        avatarUrls: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    }),
    created: zod_1.z.string(),
    size: zod_1.z.number(),
    mimeType: zod_1.z.string(),
    content: zod_1.z.string(),
    thumbnail: zod_1.z.string().optional(),
});
/**
 * Issue comment schema
 */
const IssueCommentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    self: zod_1.z.string(),
    author: zod_1.z.object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
    }),
    body: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]), // ContentRepresentation
    created: zod_1.z.string(),
    updated: zod_1.z.string(),
    updateAuthor: zod_1.z.object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
    }),
    visibility: zod_1.z
        .object({
        identifier: zod_1.z.string(),
        type: zod_1.z.string(),
        value: zod_1.z.string(),
    })
        .optional(),
});
exports.IssueCommentSchema = IssueCommentSchema;
/**
 * Issue comment container schema - Jira API sometimes returns this as an object with nested arrays instead of a direct array
 */
const IssueCommentContainerSchema = zod_1.z
    .object({
    comments: zod_1.z.array(IssueCommentSchema).optional(),
    maxResults: zod_1.z.number().optional(),
    total: zod_1.z.number().optional(),
    startAt: zod_1.z.number().optional(),
})
    .passthrough();
/**
 * Comments pagination response schema - used when retrieving comments for an issue
 */
const PageOfCommentsSchema = zod_1.z.object({
    comments: zod_1.z.array(IssueCommentSchema),
    maxResults: zod_1.z.number(),
    total: zod_1.z.number(),
    startAt: zod_1.z.number(),
});
exports.PageOfCommentsSchema = PageOfCommentsSchema;
/**
 * Atlassian Document Format (ADF) document schema
 * Simplified version of the full ADF schema focusing on the minimal required structure
 */
const AdfDocumentSchema = zod_1.z.object({
    version: zod_1.z.number(),
    type: zod_1.z.literal('doc'),
    content: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        content: zod_1.z.array(zod_1.z.any()).optional(),
        text: zod_1.z.string().optional(),
        attrs: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    })),
});
/**
 * Comment body for creating/updating comments
 * Can be either ADF document object or a simple string (converted to ADF)
 */
const CommentBodySchema = zod_1.z.union([
    AdfDocumentSchema,
    zod_1.z.object({
        body: zod_1.z.union([zod_1.z.string(), AdfDocumentSchema]),
    }),
]);
exports.CommentBodySchema = CommentBodySchema;
/**
 * Issue worklog schema
 */
exports.IssueWorklogSchema = zod_1.z.object({
    id: zod_1.z.string(),
    self: zod_1.z.string(),
    author: zod_1.z.object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
    }),
    comment: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]), // ContentRepresentation
    created: zod_1.z.string(),
    updated: zod_1.z.string(),
    issueId: zod_1.z.string(),
    started: zod_1.z.string(),
    timeSpent: zod_1.z.string(),
    timeSpentSeconds: zod_1.z.number(),
    updateAuthor: zod_1.z.object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
    }),
    visibility: zod_1.z
        .object({
        identifier: zod_1.z.string(),
        type: zod_1.z.string(),
        value: zod_1.z.string(),
    })
        .optional(),
});
/**
 * Issue worklog container schema - Jira API sometimes returns this as an object with nested arrays instead of a direct array
 */
exports.IssueWorklogContainerSchema = zod_1.z
    .object({
    worklogs: zod_1.z.array(exports.IssueWorklogSchema).optional(),
    maxResults: zod_1.z.number().optional(),
    total: zod_1.z.number().optional(),
    startAt: zod_1.z.number().optional(),
})
    .passthrough();
/**
 * Issue time tracking schema
 */
const IssueTimeTrackingSchema = zod_1.z.object({
    originalEstimate: zod_1.z.string().optional(),
    originalEstimateSeconds: zod_1.z.number().optional(),
    remainingEstimate: zod_1.z.string().optional(),
    remainingEstimateSeconds: zod_1.z.number().optional(),
    timeSpent: zod_1.z.string().optional(),
    timeSpentSeconds: zod_1.z.number().optional(),
});
/**
 * Issue watcher schema
 */
const IssueWatcherSchema = zod_1.z.object({
    isWatching: zod_1.z.boolean(),
    self: zod_1.z.string(),
    watchCount: zod_1.z.number(),
});
/**
 * Issue fields schema
 */
const IssueFieldsSchema = zod_1.z
    .object({
    watcher: IssueWatcherSchema.optional(),
    attachment: zod_1.z.array(IssueAttachmentSchema).optional(),
    description: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]).optional(), // ContentRepresentation
    project: zod_1.z.object({
        id: zod_1.z.string(),
        key: zod_1.z.string(),
        name: zod_1.z.string(),
        self: zod_1.z.string(),
        avatarUrls: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
        simplified: zod_1.z.boolean(),
        insight: zod_1.z
            .object({
            lastIssueUpdateTime: zod_1.z.string(),
            totalIssueCount: zod_1.z.number(),
        })
            .optional(),
        projectCategory: zod_1.z
            .object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            self: zod_1.z.string(),
        })
            .optional(),
    }),
    // Accept either an array of comments or a comment container object
    comment: zod_1.z
        .union([zod_1.z.array(IssueCommentSchema), IssueCommentContainerSchema])
        .optional(),
    issuelinks: zod_1.z.array(IssueLinkSchema).optional(),
    // Accept either an array of worklogs or a worklog container object
    worklog: zod_1.z
        .union([zod_1.z.array(exports.IssueWorklogSchema), exports.IssueWorklogContainerSchema])
        .optional(),
    updated: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    timetracking: IssueTimeTrackingSchema.optional(),
    summary: zod_1.z.string().optional(),
    status: IssueStatusSchema.optional(),
    // Make assignee accept null values
    assignee: zod_1.z
        .object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
        avatarUrls: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    })
        .nullable(),
    priority: zod_1.z
        .object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        iconUrl: zod_1.z.string(),
        self: zod_1.z.string(),
    })
        .optional(),
    issuetype: zod_1.z
        .object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        iconUrl: zod_1.z.string(),
        self: zod_1.z.string(),
        subtask: zod_1.z.boolean(),
        avatarId: zod_1.z.number().optional(),
        hierarchyLevel: zod_1.z.number().optional(),
    })
        .optional(),
    creator: zod_1.z
        .object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
        avatarUrls: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    })
        .optional(),
    reporter: zod_1.z
        .object({
        accountId: zod_1.z.string(),
        active: zod_1.z.boolean(),
        displayName: zod_1.z.string(),
        self: zod_1.z.string(),
        avatarUrls: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    })
        .nullable(),
    created: zod_1.z.string().optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    components: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        self: zod_1.z.string(),
    }))
        .optional(),
    fixVersions: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        self: zod_1.z.string(),
        released: zod_1.z.boolean(),
        archived: zod_1.z.boolean(),
        releaseDate: zod_1.z.string().optional(),
    }))
        .optional(),
})
    .passthrough(); // Allow additional fields for custom fields
exports.IssueFieldsSchema = IssueFieldsSchema;
/**
 * Issue object returned from the API
 */
const IssueSchema = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    self: zod_1.z.string(),
    expand: zod_1.z.string().optional(),
    fields: IssueFieldsSchema,
});
exports.IssueSchema = IssueSchema;
/**
 * API response for searching issues (new enhanced JQL search endpoint)
 * The new /search/jql endpoint returns a different structure without total, maxResults, startAt
 */
const IssuesResponseSchema = zod_1.z.object({
    expand: zod_1.z.string().optional(),
    // Legacy fields for backward compatibility - marked as optional since new API doesn't return them
    startAt: zod_1.z.number().optional(),
    maxResults: zod_1.z.number().optional(),
    total: zod_1.z.number().optional(),
    // New API response structure
    issues: zod_1.z.array(IssueSchema),
    isLast: zod_1.z.boolean().optional(), // Indicates if this is the last page
    nextPageToken: zod_1.z.string().optional(), // Token for next page in new API
    warningMessages: zod_1.z.array(zod_1.z.string()).optional(),
    names: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    schema: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
exports.IssuesResponseSchema = IssuesResponseSchema;
/**
 * Development information for issues
 */
const DevInfoCommitSchema = zod_1.z.object({
    id: zod_1.z.string(),
    displayId: zod_1.z.string(),
    message: zod_1.z.string(),
    author: zod_1.z
        .object({
        name: zod_1.z.string(),
        avatar: zod_1.z.string().optional(),
    })
        .optional(),
    authorTimestamp: zod_1.z.string(),
    url: zod_1.z.string(),
    fileCount: zod_1.z.number(),
    merge: zod_1.z.boolean(),
    files: zod_1.z.array(zod_1.z.unknown()),
});
const DevInfoRepositorySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    avatar: zod_1.z.string(),
    url: zod_1.z.string(),
    commits: zod_1.z.array(DevInfoCommitSchema).optional(),
});
const DevInfoBranchSchema = zod_1.z.object({
    name: zod_1.z.string(),
    url: zod_1.z.string(),
    createPullRequestUrl: zod_1.z.string(),
    repository: zod_1.z
        .object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        avatar: zod_1.z.string(),
        url: zod_1.z.string(),
    })
        .optional(),
    lastCommit: DevInfoCommitSchema.optional(),
});
const DevInfoReviewerSchema = zod_1.z.object({
    name: zod_1.z.string(),
    avatar: zod_1.z.string().optional(),
    approved: zod_1.z.boolean(),
});
const DevInfoPullRequestSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    commentCount: zod_1.z.number(),
    source: zod_1.z
        .object({
        branch: zod_1.z.string(),
        url: zod_1.z.string(),
    })
        .optional(),
    destination: zod_1.z
        .object({
        branch: zod_1.z.string(),
        url: zod_1.z.string(),
    })
        .optional(),
    reviewers: zod_1.z.array(DevInfoReviewerSchema).optional(),
    status: zod_1.z.string(),
    url: zod_1.z.string(),
    lastUpdate: zod_1.z.string(),
    repositoryId: zod_1.z.string(),
    repositoryName: zod_1.z.string(),
    repositoryUrl: zod_1.z.string(),
    repositoryAvatarUrl: zod_1.z.string(),
    author: zod_1.z
        .object({
        name: zod_1.z.string(),
        avatar: zod_1.z.string().optional(),
    })
        .optional(),
});
const DevInfoInstanceSchema = zod_1.z.object({
    singleInstance: zod_1.z.boolean(),
    baseUrl: zod_1.z.string(),
    name: zod_1.z.string(),
    typeName: zod_1.z.string(),
    id: zod_1.z.string(),
    type: zod_1.z.string(),
});
const DevInfoDetailSchema = zod_1.z.object({
    repositories: zod_1.z.array(DevInfoRepositorySchema).optional(),
    branches: zod_1.z.array(DevInfoBranchSchema).optional(),
    pullRequests: zod_1.z.array(DevInfoPullRequestSchema).optional(),
    _instance: DevInfoInstanceSchema.optional(),
});
const DevInfoResponseSchema = zod_1.z.object({
    errors: zod_1.z.array(zod_1.z.string()),
    detail: zod_1.z.array(DevInfoDetailSchema),
});
exports.DevInfoResponseSchema = DevInfoResponseSchema;
const DevInfoSummaryRepositorySchema = zod_1.z.object({
    count: zod_1.z.number(),
    lastUpdated: zod_1.z.string().nullable(),
    dataType: zod_1.z.string(),
});
const DevInfoSummaryPullRequestSchema = zod_1.z.object({
    count: zod_1.z.number(),
    lastUpdated: zod_1.z.string().nullable(),
    stateCount: zod_1.z.number(),
    state: zod_1.z.string().nullable(),
    dataType: zod_1.z.string(),
    open: zod_1.z.boolean(),
});
const DevInfoSummaryBranchSchema = zod_1.z.object({
    count: zod_1.z.number(),
    lastUpdated: zod_1.z.string().nullable(),
    dataType: zod_1.z.string(),
});
const DevInfoSummaryDataSchema = zod_1.z.object({
    pullrequest: zod_1.z.object({
        overall: DevInfoSummaryPullRequestSchema,
        byInstanceType: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
            count: zod_1.z.number(),
            name: zod_1.z.string().nullable(),
        })),
    }),
    repository: zod_1.z.object({
        overall: DevInfoSummaryRepositorySchema,
        byInstanceType: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
            count: zod_1.z.number(),
            name: zod_1.z.string().nullable(),
        })),
    }),
    branch: zod_1.z.object({
        overall: DevInfoSummaryBranchSchema,
        byInstanceType: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
            count: zod_1.z.number(),
            name: zod_1.z.string().nullable(),
        })),
    }),
});
const DevInfoSummaryResponseSchema = zod_1.z.object({
    errors: zod_1.z.array(zod_1.z.string()),
    configErrors: zod_1.z.array(zod_1.z.string()),
    summary: DevInfoSummaryDataSchema,
});
exports.DevInfoSummaryResponseSchema = DevInfoSummaryResponseSchema;
/**
 * Field metadata for creating issues
 */
const CreateMetaFieldSchema = zod_1.z.object({
    required: zod_1.z.boolean(),
    name: zod_1.z.string(),
    key: zod_1.z.string().optional(),
    fieldId: zod_1.z.string().optional(),
    schema: zod_1.z.object({
        type: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        custom: zod_1.z.string().optional(),
        customId: zod_1.z.number().optional(),
        items: zod_1.z.string().optional(),
    }),
    hasDefaultValue: zod_1.z.boolean().optional(),
    operations: zod_1.z.array(zod_1.z.string()).optional(),
    allowedValues: zod_1.z.array(zod_1.z.unknown()).optional(),
    defaultValue: zod_1.z.unknown().optional(),
});
/**
 * Issue type metadata for creating issues
 */
const CreateMetaIssueTypeSchema = zod_1.z.object({
    self: zod_1.z.string(),
    id: zod_1.z.string(),
    description: zod_1.z.string(),
    iconUrl: zod_1.z.string(),
    name: zod_1.z.string(),
    subtask: zod_1.z.boolean(),
    hierarchyLevel: zod_1.z.number().optional(),
    fields: zod_1.z.record(zod_1.z.string(), CreateMetaFieldSchema),
});
/**
 * Create metadata response for a specific issue type
 */
const CreateMetaResponseSchema = zod_1.z.object({
    expand: zod_1.z.string().optional(),
    projects: zod_1.z
        .array(zod_1.z.object({
        self: zod_1.z.string(),
        id: zod_1.z.string(),
        key: zod_1.z.string(),
        name: zod_1.z.string(),
        issuetypes: zod_1.z.array(CreateMetaIssueTypeSchema),
    }))
        .optional(),
    // For single issue type endpoint
    self: zod_1.z.string().optional(),
    id: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    iconUrl: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    subtask: zod_1.z.boolean().optional(),
    hierarchyLevel: zod_1.z.number().optional(),
    fields: zod_1.z.record(zod_1.z.string(), CreateMetaFieldSchema).optional(),
});
exports.CreateMetaResponseSchema = CreateMetaResponseSchema;
/**
 * Response from creating an issue
 */
const CreateIssueResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    self: zod_1.z.string(),
    transition: zod_1.z
        .object({
        status: zod_1.z.number(),
        errorCollection: zod_1.z
            .object({
            errorMessages: zod_1.z.array(zod_1.z.string()),
            errors: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
        })
            .optional(),
    })
        .optional(),
});
exports.CreateIssueResponseSchema = CreateIssueResponseSchema;
