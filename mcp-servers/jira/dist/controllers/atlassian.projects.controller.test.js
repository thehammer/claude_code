"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atlassian_projects_controller_js_1 = __importDefault(require("./atlassian.projects.controller.js"));
const transport_util_js_1 = require("../utils/transport.util.js");
const config_util_js_1 = require("../utils/config.util.js");
const error_util_js_1 = require("../utils/error.util.js"); // Import McpError
const formatter_util_js_1 = require("../utils/formatter.util.js"); // Add imports
describe('Atlassian Projects Controller', () => {
    // Load configuration and check for credentials before all tests
    beforeAll(() => {
        config_util_js_1.config.load(); // Ensure config is loaded
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            console.warn('Skipping Atlassian Projects Controller tests: No credentials available');
        }
    });
    // Helper function to skip tests when credentials are missing
    const skipIfNoCredentials = () => !(0, transport_util_js_1.getAtlassianCredentials)();
    describe('list', () => {
        it('should return a formatted list of projects in Markdown', async () => {
            if (skipIfNoCredentials())
                return;
            const result = await atlassian_projects_controller_js_1.default.list();
            // Verify structure and type
            expect(result).toBeDefined();
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Check that content does NOT contain pagination string anymore
            expect(result.content).toContain('Showing');
            expect(result.content).toContain('total items');
            // Basic Markdown content checks - check for expected formatting from live data
            if (result.content !==
                'No Jira projects found matching your criteria.') {
                expect(result.content).toMatch(/^# Jira Projects/m); // Check for main heading
                expect(result.content).toContain('**Key**:'); // Check for key elements
                expect(result.content).toMatch(/^## \d+\. .+$/m); // Check for project heading format instead
            }
        }, 30000);
        it('should handle pagination options (limit/cursor)', async () => {
            if (skipIfNoCredentials())
                return;
            // Fetch first page
            const result1 = await atlassian_projects_controller_js_1.default.list({
                limit: 1,
            });
            // Check if content contains pagination information
            if (result1.content.includes('More results are available')) {
                // Get the next startAt value from the content
                const startAtMatch = result1.content.match(/Use --start-at (\d+) to view more/);
                if (startAtMatch && startAtMatch[1]) {
                    const nextStartAt = parseInt(startAtMatch[1], 10);
                    // Fetch second page
                    const result2 = await atlassian_projects_controller_js_1.default.list({
                        limit: 1,
                        startAt: nextStartAt,
                    });
                    // If both results have content, they should be different
                    if (result1.content !==
                        'No Jira projects found matching your criteria.' &&
                        result2.content !==
                            'No Jira projects found matching your criteria.') {
                        expect(result1.content).not.toEqual(result2.content);
                    }
                }
            }
            else {
                console.warn('Skipping controller cursor test: Only one page of projects found.');
            }
        }, 30000);
        it('should handle filtering (name) and sorting (orderBy)', async () => {
            if (skipIfNoCredentials())
                return;
            // Find a project name to filter by
            const listResult = await atlassian_projects_controller_js_1.default.list({
                limit: 1,
            });
            if (listResult.content ===
                'No Jira projects found matching your criteria.') {
                console.warn('Skipping controller filter/sort test: No projects found.');
                return;
            }
            const nameMatch = listResult.content.match(/\*\*Name\*\*:\s+(.+)/);
            if (!nameMatch || !nameMatch[1]) {
                console.warn('Skipping controller filter/sort test: Could not extract project name.');
                return;
            }
            const projectNameQuery = nameMatch[1].substring(0, 3); // Use first few chars
            const result = await atlassian_projects_controller_js_1.default.list({
                name: projectNameQuery,
                orderBy: 'key', // Sort by key
                limit: 5,
            });
            // Check if the content is well-formed
            if (result.content !==
                'No Jira projects found matching your criteria.') {
                expect(result.content).toMatch(/^# Jira Projects/m);
                // Content should contain pagination information
                expect(result.content).toContain('Information retrieved at:');
            }
        }, 30000);
        it('should handle empty result scenario gracefully', async () => {
            if (skipIfNoCredentials())
                return;
            // Use a name that is very unlikely to match any projects
            const uniqueName = `NONEXISTENT_PROJECT_${Date.now()}`;
            const result = await atlassian_projects_controller_js_1.default.list({
                name: uniqueName,
            });
            // Verify the ControllerResponse structure
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Check specific empty result message including the standard footer
            expect(result.content).toContain('No Jira projects found matching your criteria');
            expect(result.content).toContain((0, formatter_util_js_1.formatSeparator)());
            expect(result.content).toContain('Information retrieved at:');
            // Check that content does NOT contain pagination string
            expect(result.content).toContain('Showing');
            expect(result.content).toContain('total items');
        }, 30000);
        it('should handle various filtering combinations', async () => {
            if (skipIfNoCredentials())
                return;
            // Find a project to use for filtering
            const listResult = await atlassian_projects_controller_js_1.default.list({
                limit: 1,
            });
            if (listResult.content ===
                'No Jira projects found matching your criteria.') {
                console.warn('Skipping controller combined filters test: No projects found.');
                return;
            }
            // Extract a project key from the content
            const keyMatch = listResult.content.match(/\*\*Key\*\*:\s+([^\s\n]+)/);
            if (!keyMatch || !keyMatch[1]) {
                console.warn('Skipping controller combined filters test: Could not extract project key.');
                return;
            }
            const projectKey = keyMatch[1];
            // Test filtering by exact key (should return exactly one project)
            const result = await atlassian_projects_controller_js_1.default.list({
                name: projectKey, // Use the key as the name filter
                orderBy: 'key',
                limit: 10,
            });
            // Verify response (might find 0 or 1 projects due to exact matching)
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // If we found exactly the project we filtered for, its key should be in the content
            if (result.content.includes(projectKey)) {
                expect(result.content).toContain(`**Key**: ${projectKey}`);
            }
        }, 30000);
        it('should return an empty list when no projects match', async () => {
            // Skip if no creds
            if (skipIfNoCredentials())
                return;
            // Use a name guaranteed not to match
            const uniqueName = `NONEXISTENT_${Date.now()}`;
            const result = await atlassian_projects_controller_js_1.default.list({
                name: uniqueName,
                limit: 10,
            });
            // Check actual empty message and formatting
            expect(result.content).toContain('No Jira projects found matching your criteria');
            expect(result.content).toContain((0, formatter_util_js_1.formatSeparator)());
            expect(result.content).toContain('Information retrieved at:');
            // Check that content does NOT contain pagination string anymore
            expect(result.content).toContain('Showing');
            expect(result.content).toContain('total items');
        }, 30000);
    });
    describe('get', () => {
        // Helper to get a valid key/ID for testing 'get'
        async function getFirstProjectKeyOrIdForController() {
            if (skipIfNoCredentials())
                return null;
            try {
                const listResult = await atlassian_projects_controller_js_1.default.list({
                    limit: 1,
                });
                if (listResult.content ===
                    'No Jira projects found matching your criteria.')
                    return null;
                // Extract key or ID from Markdown content
                const keyMatch = listResult.content.match(/\*\*Key\*\*:\s+([^\s\n]+)/);
                const idMatch = listResult.content.match(/\*\*ID\*\*:\s+([^\s\n]+)/);
                return keyMatch ? keyMatch[1] : idMatch ? idMatch[1] : null;
            }
            catch (error) {
                console.warn("Could not fetch project list for controller 'get' test setup:", error);
                return null;
            }
        }
        it('should return formatted details for a valid project key/ID in Markdown', async () => {
            const projectKeyOrId = await getFirstProjectKeyOrIdForController();
            if (!projectKeyOrId) {
                console.warn('Skipping controller get test: No project key/ID found.');
                return;
            }
            const result = await atlassian_projects_controller_js_1.default.get({
                projectKeyOrId,
            });
            // Verify the ControllerResponse structure
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Verify Markdown content
            expect(result.content).toMatch(/^# Project:/m); // Main heading for project details
            expect(result.content).toContain('## Basic Information');
            // Check if either key or ID is present, depending on what was used
            expect(result.content).toMatch(new RegExp(`\\*\\*(Key|ID)\\*\\*:\\s+${projectKeyOrId}`));
            expect(result.content).toContain('## Components'); // Included by default
            expect(result.content).toContain('## Versions'); // Included by default
            expect(result.content).toContain('## Links');
        }, 30000);
        it('should throw McpError for an invalid project key/ID', async () => {
            if (skipIfNoCredentials())
                return;
            const invalidKeyOrId = 'THIS-PROJECT-DOES-NOT-EXIST-999';
            // Expect the controller call to reject with an McpError
            await expect(atlassian_projects_controller_js_1.default.get({
                projectKeyOrId: invalidKeyOrId,
            })).rejects.toThrow(error_util_js_1.McpError);
            // Optionally check the status code and message via the error handler's behavior
            try {
                await atlassian_projects_controller_js_1.default.get({
                    projectKeyOrId: invalidKeyOrId,
                });
            }
            catch (e) {
                expect(e).toBeInstanceOf(error_util_js_1.McpError);
                expect(e.statusCode).toBe(404); // Expecting Not Found
                expect(e.message).toContain('not found');
            }
        }, 30000);
        it('should throw McpError for an invalid project key/ID format', async () => {
            if (skipIfNoCredentials())
                return;
            // Use a key with invalid characters
            const invalidFormat = 'invalid!key@format#$%';
            try {
                await atlassian_projects_controller_js_1.default.get({
                    projectKeyOrId: invalidFormat,
                });
                fail('Expected an error for invalid project key format');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Status code should be 404 (Not Found) or 400 (Bad Request)
                expect([404, 400]).toContain(error.statusCode);
            }
        }, 30000);
        it('should throw McpError for an empty project key/ID', async () => {
            if (skipIfNoCredentials())
                return;
            try {
                await atlassian_projects_controller_js_1.default.get({
                    projectKeyOrId: '',
                });
                fail('Expected an error for empty project key/ID');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Status code might vary by API implementation
                expect([400, 404, 405]).toContain(error.statusCode);
            }
        }, 30000);
    });
});
