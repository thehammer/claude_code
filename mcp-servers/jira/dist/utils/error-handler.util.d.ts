/**
 * Standard error codes for consistent handling
 */
export declare enum ErrorCode {
    NOT_FOUND = "NOT_FOUND",
    INVALID_CURSOR = "INVALID_CURSOR",
    ACCESS_DENIED = "ACCESS_DENIED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
    JIRA_JQL_ERROR = "JIRA_JQL_ERROR",
    JIRA_FIELD_VALIDATION_ERROR = "JIRA_FIELD_VALIDATION_ERROR",
    JIRA_RESOURCE_LOCKED = "JIRA_RESOURCE_LOCKED"
}
/**
 * Context information for error handling
 */
export interface ErrorContext {
    /**
     * Source of the error (e.g., file path and function)
     */
    source?: string;
    /**
     * Type of entity being processed (e.g., 'Project', 'Issue')
     */
    entityType?: string;
    /**
     * Identifier of the entity being processed
     */
    entityId?: string | Record<string, string>;
    /**
     * Operation being performed (e.g., 'listing', 'creating')
     */
    operation?: string;
    /**
     * Additional information for debugging
     */
    additionalInfo?: Record<string, unknown>;
}
/**
 * Helper function to create a consistent error context object
 * @param entityType Type of entity being processed
 * @param operation Operation being performed
 * @param source Source of the error (typically file path and function)
 * @param entityId Optional identifier of the entity
 * @param additionalInfo Optional additional information for debugging
 * @returns A formatted ErrorContext object
 */
export declare function buildErrorContext(entityType: string, operation: string, source: string, entityId?: string | Record<string, string>, additionalInfo?: Record<string, unknown>): ErrorContext;
/**
 * Detect specific error types from raw errors
 * @param error The error to analyze
 * @param context Context information for better error detection
 * @returns Object containing the error code and status code
 */
export declare function detectErrorType(error: unknown, context?: ErrorContext): {
    code: ErrorCode;
    statusCode: number;
};
/**
 * Create user-friendly error messages based on error type and context
 * @param code The error code
 * @param context Context information for better error messages
 * @param originalMessage The original error message
 * @returns User-friendly error message
 */
export declare function createUserFriendlyErrorMessage(code: ErrorCode, context?: ErrorContext, originalMessage?: string): string;
/**
 * Handle controller errors consistently
 * @param error The error to handle
 * @param context Context information for better error messages
 * @returns Never returns, always throws an error
 */
export declare function handleControllerError(error: unknown, context?: ErrorContext): never;
