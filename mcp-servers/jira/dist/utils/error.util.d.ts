/**
 * Error types for classification
 */
export declare enum ErrorType {
    AUTH_MISSING = "AUTH_MISSING",
    AUTH_INVALID = "AUTH_INVALID",
    API_ERROR = "API_ERROR",
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
/**
 * Custom error class with type classification
 */
export declare class McpError extends Error {
    type: ErrorType;
    statusCode?: number;
    originalError?: unknown;
    constructor(message: string, type: ErrorType, statusCode?: number, originalError?: unknown);
}
/**
 * Create an authentication missing error
 */
export declare function createAuthMissingError(message?: string, originalError?: unknown): McpError;
/**
 * Create an authentication invalid error
 */
export declare function createAuthInvalidError(message?: string, originalError?: unknown): McpError;
/**
 * Create an API error
 */
export declare function createApiError(message: string, statusCode?: number, originalError?: unknown): McpError;
/**
 * Create an unexpected error
 */
export declare function createUnexpectedError(message?: string, originalError?: unknown): McpError;
/**
 * Create a not found error
 */
export declare function createNotFoundError(message?: string, originalError?: unknown): McpError;
/**
 * Ensure an error is an McpError
 */
export declare function ensureMcpError(error: unknown): McpError;
/**
 * Get the deepest original error from an error chain
 * @param error The error to extract the original cause from
 * @returns The deepest original error or the error itself
 */
export declare function getDeepOriginalError(error: unknown): unknown;
/**
 * Format error for MCP tool response with vendor detail for AI.
 */
export declare function formatErrorForMcpTool(error: unknown): {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    metadata: {
        errorType: ErrorType;
        statusCode?: number;
        errorDetails?: unknown;
    };
};
/**
 * Format error for MCP resource response
 */
export declare function formatErrorForMcpResource(error: unknown, uri: string): {
    contents: Array<{
        uri: string;
        text: string;
        mimeType: string;
        description?: string;
    }>;
};
/**
 * Handle error in CLI context
 */
export declare function handleCliError(error: unknown): never;
