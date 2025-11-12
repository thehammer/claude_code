"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipValidation = void 0;
exports.validateResponse = validateResponse;
const zod_1 = require("zod");
const logger_util_js_1 = require("./logger.util.js");
const error_util_js_1 = require("./error.util.js");
// Create a contextualized logger for this file
const logger = logger_util_js_1.Logger.forContext('utils/validation.util.ts');
// Toggle for testing - skip validation in test environments
exports.skipValidation = process.env.NODE_ENV === 'test';
/**
 * Validates API response against a Zod schema
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @param context Context for error messages (e.g., "issue details", "issue list")
 * @param serviceIdentifier Optional service identifier for more specific logging
 * @returns The validated data
 * @throws {McpError} If validation fails
 */
function validateResponse(data, schema, context, serviceIdentifier) {
    const methodLogger = logger.forMethod('validateResponse');
    const logPrefix = serviceIdentifier ? `[${serviceIdentifier}] ` : '';
    // Skip validation in test environment if the flag is set
    if (exports.skipValidation) {
        methodLogger.debug(`${logPrefix}Skipping validation for ${context} in test environment`);
        return data;
    }
    try {
        methodLogger.debug(`${logPrefix}Validating response for ${context}`);
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            methodLogger.error(`${logPrefix}Response validation failed for ${context}:`, error.format());
            throw (0, error_util_js_1.createApiError)(`API response validation failed: Invalid Jira ${context} format`, 500, { zodErrors: error.format() });
        }
        // Re-throw if it's not a Zod error
        methodLogger.error(`${logPrefix}Non-Zod error during validation for ${context}:`, error);
        throw error;
    }
}
