"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtlassianCredentials = getAtlassianCredentials;
exports.fetchAtlassian = fetchAtlassian;
const logger_util_js_1 = require("./logger.util.js");
const config_util_js_1 = require("./config.util.js");
const error_util_js_1 = require("./error.util.js");
// Create a contextualized logger for this file
const transportLogger = logger_util_js_1.Logger.forContext('utils/transport.util.ts');
// Log transport utility initialization
transportLogger.debug('Transport utility initialized');
/**
 * Get Atlassian credentials from environment variables
 * @returns AtlassianCredentials object or null if credentials are missing
 */
function getAtlassianCredentials() {
    const methodLogger = logger_util_js_1.Logger.forContext('utils/transport.util.ts', 'getAtlassianCredentials');
    const siteName = config_util_js_1.config.get('ATLASSIAN_SITE_NAME');
    const userEmail = config_util_js_1.config.get('ATLASSIAN_USER_EMAIL');
    const apiToken = config_util_js_1.config.get('ATLASSIAN_API_TOKEN');
    if (!siteName || !userEmail || !apiToken) {
        methodLogger.warn('Missing Atlassian credentials. Please set ATLASSIAN_SITE_NAME, ATLASSIAN_USER_EMAIL, and ATLASSIAN_API_TOKEN environment variables.');
        return null;
    }
    methodLogger.debug('Using Atlassian credentials');
    return {
        siteName,
        userEmail,
        apiToken,
    };
}
/**
 * Fetch data from Atlassian API
 * @param credentials Atlassian API credentials
 * @param path API endpoint path (without base URL)
 * @param options Request options
 * @returns Response data
 */
async function fetchAtlassian(credentials, path, options = {}) {
    const methodLogger = logger_util_js_1.Logger.forContext('utils/transport.util.ts', 'fetchAtlassian');
    const { siteName, userEmail, apiToken } = credentials;
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // Construct the full URL
    const baseUrl = `https://${siteName}.atlassian.net`;
    const url = `${baseUrl}${normalizedPath}`;
    // Set up authentication and headers
    const headers = {
        Authorization: `Basic ${Buffer.from(`${userEmail}:${apiToken}`).toString('base64')}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
    };
    // Prepare request options
    const requestOptions = {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    };
    methodLogger.debug(`Calling Atlassian API: ${url}`);
    try {
        const response = await fetch(url, requestOptions);
        // Log the raw response status and headers
        methodLogger.debug(`Raw response received: ${response.status} ${response.statusText}`, {
            url,
            status: response.status,
            statusText: response.statusText,
            // Just log a simplified representation of headers
            headers: {
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            methodLogger.error(`API error: ${response.status} ${response.statusText}`, { errorText, url, method: options.method || 'GET' });
            // Try to parse the error response - handle Jira-specific error formats
            let errorMessage = `${response.status} ${response.statusText}`;
            let parsedError = null;
            try {
                if (errorText &&
                    (errorText.startsWith('{') || errorText.startsWith('['))) {
                    parsedError = JSON.parse(errorText);
                    // Process the parsed error object to build a comprehensive error message
                    const errorParts = [];
                    // Jira-specific error format: errorMessages array
                    if (parsedError.errorMessages &&
                        Array.isArray(parsedError.errorMessages) &&
                        parsedError.errorMessages.length > 0) {
                        // Format: {"errorMessages":["Issue does not exist or you do not have permission to see it."],"errors":{}}
                        errorParts.push(parsedError.errorMessages.join('; '));
                    }
                    // Jira-specific error format: errors object with field-specific errors
                    if (parsedError.errors &&
                        typeof parsedError.errors === 'object' &&
                        Object.keys(parsedError.errors).length > 0) {
                        // Format: { "errors": { "jql": "The JQL query is invalid." }, "errorMessages": [], "warningMessages": [] }
                        const fieldErrors = Object.entries(parsedError.errors)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('; ');
                        errorParts.push(fieldErrors);
                    }
                    // Generic Atlassian API error with a message field
                    if (parsedError.message) {
                        // Format: {"message":"Some error message"}
                        errorParts.push(parsedError.message);
                    }
                    // Other Atlassian API error formats (generic)
                    if (parsedError.errors &&
                        Array.isArray(parsedError.errors) &&
                        parsedError.errors.length > 0) {
                        // Format: {"errors":[{"status":400,"code":"INVALID_REQUEST_PARAMETER","title":"..."}]}
                        const atlassianError = parsedError.errors[0];
                        if (atlassianError.title) {
                            errorParts.push(atlassianError.title);
                        }
                        if (atlassianError.detail) {
                            errorParts.push(atlassianError.detail);
                        }
                    }
                    // Check for warnings that might give additional context
                    if (parsedError.warningMessages &&
                        Array.isArray(parsedError.warningMessages) &&
                        parsedError.warningMessages.length > 0) {
                        errorParts.push(`Warnings: ${parsedError.warningMessages.join('; ')}`);
                    }
                    // Combine all error parts into a single message
                    if (errorParts.length > 0) {
                        errorMessage = errorParts.join(' | ');
                    }
                }
            }
            catch (parseError) {
                methodLogger.debug(`Error parsing error response:`, parseError);
                // Fall back to using the raw error text
                if (errorText && errorText.trim()) {
                    errorMessage = errorText;
                }
            }
            // Classify HTTP errors based on status code
            if (response.status === 401) {
                throw (0, error_util_js_1.createAuthInvalidError)(`Authentication failed. Jira API: ${errorMessage}`, parsedError || errorText);
            }
            else if (response.status === 403) {
                throw (0, error_util_js_1.createAuthInvalidError)(`Insufficient permissions. Jira API: ${errorMessage}`, parsedError || errorText);
            }
            else if (response.status === 404) {
                throw (0, error_util_js_1.createNotFoundError)(`Resource not found. Jira API: ${errorMessage}`, parsedError || errorText);
            }
            else if (response.status === 429) {
                throw (0, error_util_js_1.createApiError)(`Rate limit exceeded. Jira API: ${errorMessage}`, 429, parsedError || errorText);
            }
            else if (response.status >= 500) {
                throw (0, error_util_js_1.createApiError)(`Jira server error. Detail: ${errorMessage}`, response.status, parsedError || errorText);
            }
            else {
                // For other API errors, create detailed error with context
                const requestPath = path.split('?')[0]; // Remove query parameters for cleaner logs
                let contextualInfo = '';
                // Add some contextual handling for common operations
                if (requestPath.includes('/search') &&
                    parsedError?.errors?.jql) {
                    contextualInfo = ' Check your JQL syntax for errors.';
                }
                else if (requestPath.includes('/issue/') &&
                    options.method === 'POST') {
                    contextualInfo =
                        ' Check issue fields for validation errors.';
                }
                throw (0, error_util_js_1.createApiError)(`Jira API request failed. Detail: ${errorMessage}${contextualInfo}`, response.status, parsedError || errorText);
            }
        }
        // Clone the response to log its content without consuming it
        const clonedResponse = response.clone();
        try {
            const responseJson = await clonedResponse.json();
            methodLogger.debug(`Response body:`, responseJson);
        }
        catch (error) {
            methodLogger.debug(`Non-JSON response received:`, { error });
        }
        // Handle 204 No Content responses
        if (response.status === 204) {
            return undefined;
        }
        return response.json();
    }
    catch (error) {
        methodLogger.error(`Request failed`, error);
        // If it's already an McpError, just rethrow it
        if (error instanceof error_util_js_1.McpError) {
            throw error;
        }
        // Handle network or parsing errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw (0, error_util_js_1.createApiError)(`Network error connecting to Jira API: ${error.message}`, 500, error);
        }
        else if (error instanceof SyntaxError) {
            throw (0, error_util_js_1.createApiError)(`Invalid response from Jira API (parsing error): ${error.message}`, 500, error);
        }
        throw (0, error_util_js_1.createUnexpectedError)(`Unexpected error while calling Jira API: ${error instanceof Error ? error.message : String(error)}`, error);
    }
}
