"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atlassian_search_controller_js_1 = __importDefault(require("./atlassian.search.controller.js"));
const transport_util_js_1 = require("../utils/transport.util.js");
const config_util_js_1 = require("../utils/config.util.js");
const error_util_js_1 = require("../utils/error.util.js");
describe('Atlassian Search Controller', () => {
    // Load configuration and check for credentials before all tests
    beforeAll(() => {
        config_util_js_1.config.load(); // Ensure config is loaded
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            console.warn('Skipping Atlassian Search Controller tests: No credentials available');
        }
    });
    // Helper function to skip tests when credentials are missing
    const skipIfNoCredentials = () => !(0, transport_util_js_1.getAtlassianCredentials)();
    describe('search', () => {
        it('should return a formatted search result in Markdown for a valid JQL query', async () => {
            if (skipIfNoCredentials())
                return;
            const result = await atlassian_search_controller_js_1.default.search({
                jql: 'created >= -30d',
                limit: 5,
            });
            // Verify ControllerResponse structure
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Verify Markdown content
            expect(result.content).toMatch(/^# Jira Search Results/m); // Has header
            expect(result.content).toContain('JQL Query:'); // Shows query
            expect(result.content).toContain('created >= -30d'); // Shows the actual query
            // Content should include pagination information
            if (result.content.includes('More results are available')) {
                expect(result.content).toContain('Use --start-at');
            }
        }, 30000);
        it('should handle pagination (limit/cursor) correctly', async () => {
            if (skipIfNoCredentials())
                return;
            // First page
            const result1 = await atlassian_search_controller_js_1.default.search({
                jql: 'created >= -90d',
                limit: 2,
            });
            // Check if the first page has pagination information
            if (result1.content.includes('More results are available')) {
                // Extract startAt from the content
                const startAtMatch = result1.content.match(/Use --start-at (\d+) to view more/);
                if (startAtMatch && startAtMatch[1]) {
                    const nextStartAt = parseInt(startAtMatch[1], 10);
                    // Fetch second page
                    const result2 = await atlassian_search_controller_js_1.default.search({
                        jql: 'created >= -90d',
                        limit: 2,
                        startAt: nextStartAt,
                    });
                    // Content should include both search and pagination info
                    expect(result2.content).toMatch(/^# Jira Search Results/m);
                    expect(result2.content).toContain('JQL Query:');
                }
            }
            else {
                console.warn('Skipping cursor test: Only one page of search results found.');
            }
        }, 30000);
        it('should handle empty results gracefully', async () => {
            if (skipIfNoCredentials())
                return;
            // Use a specific JQL that's unlikely to match any issues
            const uniqueQuery = `summary ~ "NONEXISTENT_TEST_ISSUE_${Date.now()}"`;
            const result = await atlassian_search_controller_js_1.default.search({
                jql: uniqueQuery,
            });
            // Verify ControllerResponse structure
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Should show the search query even for empty results
            expect(result.content).toMatch(/^# Jira Search Results/m);
            expect(result.content).toContain('JQL Query:');
            expect(result.content).toContain(uniqueQuery);
            // Check for appropriate message for no results
            expect(result.content).toContain('No issues found');
            // Should include timestamp
            expect(result.content).toContain('Information retrieved at:');
        }, 30000);
        it('should handle error for invalid JQL', async () => {
            if (skipIfNoCredentials())
                return;
            // Use invalid JQL syntax
            try {
                await atlassian_search_controller_js_1.default.search({
                    jql: 'invalid operator === something',
                });
                fail('Expected an error for invalid JQL');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // The error might have a generic error message, so we'll just check that it's a McpError
                expect(error.statusCode).toBe(400);
            }
        }, 30000);
        it('should perform search with empty JQL (returns all accessible issues)', async () => {
            if (skipIfNoCredentials())
                return;
            const result = await atlassian_search_controller_js_1.default.search({
                limit: 3,
            });
            // Verify ControllerResponse structure
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Should show the search results header
            expect(result.content).toMatch(/^# Jira Search Results/m);
            // Should include JQL and possibly pagination information
            expect(result.content).toContain('JQL Query:');
            expect(result.content).toContain('ORDER BY updated DESC'); // Default ordering
        }, 30000);
        it('should support complex JQL with multiple conditions', async () => {
            if (skipIfNoCredentials())
                return;
            try {
                const result = await atlassian_search_controller_js_1.default.search({
                    jql: 'created >= -60d AND type != Epic ORDER BY created DESC',
                    limit: 3,
                });
                // Verify ControllerResponse structure
                expect(result).toHaveProperty('content');
                expect(typeof result.content).toBe('string');
                // Should show the search results header and query
                expect(result.content).toMatch(/^# Jira Search Results/m);
                expect(result.content).toContain('JQL Query:');
                expect(result.content).toContain('created >= -60d AND type != Epic ORDER BY created DESC');
            }
            catch (error) {
                // Some Jira servers might not support all JQL functions, so we'll accept either
                // successful results or a properly formed error
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
            }
        }, 30000);
    });
});
