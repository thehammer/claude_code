"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_util_js_1 = require("./error.util.js");
describe('Error Utility', () => {
    describe('McpError', () => {
        it('should create an error with the correct properties', () => {
            const error = new error_util_js_1.McpError('Test error', error_util_js_1.ErrorType.API_ERROR, 404);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.message).toBe('Test error');
            expect(error.type).toBe(error_util_js_1.ErrorType.API_ERROR);
            expect(error.statusCode).toBe(404);
            expect(error.name).toBe('McpError');
        });
    });
    describe('Error Factory Functions', () => {
        it('should create auth missing error', () => {
            const error = (0, error_util_js_1.createAuthMissingError)();
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.type).toBe(error_util_js_1.ErrorType.AUTH_MISSING);
            expect(error.message).toBe('Authentication credentials are missing');
        });
        it('should create auth invalid error', () => {
            const error = (0, error_util_js_1.createAuthInvalidError)('Invalid token');
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.type).toBe(error_util_js_1.ErrorType.AUTH_INVALID);
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Invalid token');
        });
        it('should create API error', () => {
            const originalError = new Error('Original error');
            const error = (0, error_util_js_1.createApiError)('API failed', 500, originalError);
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.type).toBe(error_util_js_1.ErrorType.API_ERROR);
            expect(error.statusCode).toBe(500);
            expect(error.message).toBe('API failed');
            expect(error.originalError).toBe(originalError);
        });
        it('should create unexpected error', () => {
            const error = (0, error_util_js_1.createUnexpectedError)();
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.type).toBe(error_util_js_1.ErrorType.UNEXPECTED_ERROR);
            expect(error.message).toBe('An unexpected error occurred');
        });
    });
    describe('ensureMcpError', () => {
        it('should return the same error if it is already an McpError', () => {
            const originalError = (0, error_util_js_1.createApiError)('Original error');
            const error = (0, error_util_js_1.ensureMcpError)(originalError);
            expect(error).toBe(originalError);
        });
        it('should wrap a standard Error', () => {
            const originalError = new Error('Standard error');
            const error = (0, error_util_js_1.ensureMcpError)(originalError);
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.type).toBe(error_util_js_1.ErrorType.UNEXPECTED_ERROR);
            expect(error.message).toBe('Standard error');
            expect(error.originalError).toBe(originalError);
        });
        it('should handle non-Error objects', () => {
            const error = (0, error_util_js_1.ensureMcpError)('String error');
            expect(error).toBeInstanceOf(error_util_js_1.McpError);
            expect(error.type).toBe(error_util_js_1.ErrorType.UNEXPECTED_ERROR);
            expect(error.message).toBe('String error');
        });
    });
    describe('formatErrorForMcpTool', () => {
        it('should format an error for MCP tool response', () => {
            const error = (0, error_util_js_1.createApiError)('API error');
            const response = (0, error_util_js_1.formatErrorForMcpTool)(error);
            expect(response).toHaveProperty('content');
            expect(response.content).toHaveLength(1);
            expect(response.content[0]).toHaveProperty('type', 'text');
            expect(response.content[0]).toHaveProperty('text', 'Error: API error');
        });
    });
    describe('formatErrorForMcpResource', () => {
        it('should format an error for MCP resource response', () => {
            const error = (0, error_util_js_1.createApiError)('API error');
            const response = (0, error_util_js_1.formatErrorForMcpResource)(error, 'test://uri');
            expect(response).toHaveProperty('contents');
            expect(response.contents).toHaveLength(1);
            expect(response.contents[0]).toHaveProperty('uri', 'test://uri');
            expect(response.contents[0]).toHaveProperty('text', 'Error: API error');
            expect(response.contents[0]).toHaveProperty('mimeType', 'text/plain');
            expect(response.contents[0]).toHaveProperty('description', 'Error: API_ERROR');
        });
    });
});
