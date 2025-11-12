/**
 * Types of pagination mechanisms used by different Atlassian APIs
 */
export declare enum PaginationType {
    /**
     * Offset-based pagination (startAt, maxResults, total)
     * Used by Jira APIs
     */
    OFFSET = "offset",
    /**
     * Cursor-based pagination (cursor in URL)
     * Used by Confluence APIs
     */
    CURSOR = "cursor",
    /**
     * Page-based pagination (page parameter in URL)
     * Used by Bitbucket APIs
     */
    PAGE = "page"
}
/**
 * Structure for offset-based pagination data
 */
export interface OffsetPaginationData {
    startAt?: number;
    maxResults?: number;
    total?: number;
    nextPage?: string;
    values?: unknown[];
}
/**
 * Structure for cursor-based pagination data (Confluence)
 */
export interface CursorPaginationData {
    _links: {
        next?: string;
    };
    results?: unknown[];
}
/**
 * Structure for page-based pagination data (Bitbucket)
 */
export interface PagePaginationData {
    next?: string;
    values?: unknown[];
}
/**
 * Response pagination information
 */
export interface ResponsePagination {
    /** The next cursor value (if applicable) */
    nextCursor?: string;
    /** Whether there are more results available */
    hasMore: boolean;
    /** Count of items in the current batch */
    count?: number;
    /** Total count of items (if applicable) */
    total?: number;
}
/**
 * Extract pagination information from an API response
 * @param data API response data
 * @param type Pagination type (offset, cursor, or page)
 * @param source Optional source identifier for logging
 * @returns Response pagination information
 */
export declare function extractPaginationInfo<T extends Record<string, unknown>>(data: T, type: PaginationType, source?: string): ResponsePagination;
