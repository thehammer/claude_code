"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atlassian_transitions_controller_js_1 = __importDefault(require("./atlassian.transitions.controller.js"));
const atlassian_issues_controller_js_1 = __importDefault(require("./atlassian.issues.controller.js"));
const config_util_js_1 = require("../utils/config.util.js");
const transport_util_js_1 = require("../utils/transport.util.js");
const error_util_js_1 = require("../utils/error.util.js");
describe('Atlassian Transitions Controller', () => {
    // Load configuration and check for credentials before running tests
    beforeAll(() => {
        // Load configuration
        config_util_js_1.config.load();
        // Check if Atlassian credentials are available
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            console.warn('Atlassian credentials are required for these tests.');
        }
    });
    // Helper function to skip tests when credentials are missing
    const skipIfNoCredentials = () => !(0, transport_util_js_1.getAtlassianCredentials)();
    // Helper to get a valid issue key for testing
    async function getFirstIssueKey() {
        if (skipIfNoCredentials())
            return null;
        try {
            const listResult = await atlassian_issues_controller_js_1.default.list({
                limit: 1,
            });
            // Extract an issue key from the content using regex
            const match = listResult.content.match(/\b([A-Z]+-\d+)\b/);
            return match ? match[1] : null;
        }
        catch (error) {
            console.warn('Error getting issue key for tests:', error);
            return null;
        }
    }
    describe('getTransitions', () => {
        it('should retrieve available transitions for an issue', async () => {
            if (skipIfNoCredentials())
                return;
            // Get a valid issue key first
            const issueKey = await getFirstIssueKey();
            if (!issueKey) {
                console.warn('Skipping transitions test: No issue key found');
                return;
            }
            // Call the controller
            const result = await atlassian_transitions_controller_js_1.default.getTransitions({
                issueIdOrKey: issueKey,
            });
            // Check the structure and types
            expect(result).toBeDefined();
            expect(result).toHaveProperty('content');
            expect(typeof result.content).toBe('string');
            // Should contain transition information
            expect(result.content).toContain('Available Transitions for');
            expect(result.content).toMatch(/Found \d+ available transition/);
            // Should have instructions
            expect(result.content).toContain('jira_transition_issue');
        }, 30000);
        it('should handle error for invalid issue key', async () => {
            if (skipIfNoCredentials())
                return;
            try {
                await atlassian_transitions_controller_js_1.default.getTransitions({
                    issueIdOrKey: 'INVALID-KEY-99999',
                });
                fail('Expected an error for invalid issue key');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Error should indicate issue not found
                const errorMessage = error.message;
                expect(errorMessage).toContain('not found');
            }
        }, 30000);
    });
    describe('transitionIssue', () => {
        it('should handle error for invalid issue key', async () => {
            if (skipIfNoCredentials())
                return;
            try {
                await atlassian_transitions_controller_js_1.default.transitionIssue({
                    issueIdOrKey: 'INVALID-KEY-99999',
                    transitionId: '1',
                });
                fail('Expected an error for invalid issue key');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
            }
        }, 30000);
        it('should handle error for invalid transition ID', async () => {
            if (skipIfNoCredentials())
                return;
            // Get a valid issue key
            const issueKey = await getFirstIssueKey();
            if (!issueKey) {
                console.warn('Skipping transition test: No issue key found');
                return;
            }
            try {
                await atlassian_transitions_controller_js_1.default.transitionIssue({
                    issueIdOrKey: issueKey,
                    transitionId: 'INVALID_TRANSITION_999',
                });
                fail('Expected an error for invalid transition');
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                const errorMessage = error.message;
                expect(errorMessage).toContain('not found');
            }
        }, 30000);
    });
});
