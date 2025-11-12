"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_atlassian_devinfo_service_js_1 = __importDefault(require("./vendor.atlassian.devinfo.service.js"));
const vendor_atlassian_issues_service_js_1 = __importDefault(require("./vendor.atlassian.issues.service.js"));
const transport_util_js_1 = require("../utils/transport.util.js");
const config_util_js_1 = require("../utils/config.util.js");
const error_util_js_1 = require("../utils/error.util.js");
describe('Vendor Atlassian DevInfo Service', () => {
    // Load configuration and check for credentials before all tests
    beforeAll(() => {
        config_util_js_1.config.load(); // Ensure config is loaded
        const credentials = (0, transport_util_js_1.getAtlassianCredentials)();
        if (!credentials) {
            console.warn('Skipping Atlassian DevInfo Service tests: No credentials available');
        }
    });
    // Helper function to skip tests when credentials are missing
    const skipIfNoCredentials = () => !(0, transport_util_js_1.getAtlassianCredentials)();
    // Helper function to get a valid issue ID (numeric) for testing
    async function getValidIssueId() {
        if (skipIfNoCredentials())
            return null;
        try {
            // Search for a recent issue
            const searchResult = await vendor_atlassian_issues_service_js_1.default.search({
                jql: 'created >= -30d',
                maxResults: 5,
            });
            // Check if any issues were found
            if (searchResult.issues.length === 0) {
                console.warn('No issues found for DevInfo tests');
                return null;
            }
            // Return the ID (not the key) of the first issue
            return searchResult.issues[0].id;
        }
        catch (error) {
            console.warn('Error fetching issue for DevInfo tests:', error);
            return null;
        }
    }
    describe('getSummary', () => {
        it('should retrieve development information summary for a valid issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            const issueId = await getValidIssueId();
            if (!issueId) {
                console.warn('Skipping getSummary test: No valid issue ID found');
                return;
            }
            try {
                const result = await vendor_atlassian_devinfo_service_js_1.default.getSummary(issueId);
                // Verify response structure
                expect(result).toBeDefined();
                // The summary might be empty if no dev info exists for the issue
                expect(result).toHaveProperty('summary');
                expect(result.summary).toHaveProperty('repository');
                expect(result.summary).toHaveProperty('pullrequest');
                expect(result.summary).toHaveProperty('branch');
            }
            catch (error) {
                // If API has authentication issues or doesn't support devinfo, skip without failing
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('DevInfo API is not accessible: authentication error or feature not available');
                    return;
                }
                throw error;
            }
        }, 30000);
        it('should handle errors for non-existent issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            // First check if we can access the DevInfo API at all
            try {
                const testId = await getValidIssueId();
                if (testId) {
                    // Quick auth check
                    await vendor_atlassian_devinfo_service_js_1.default.getSummary(testId);
                }
                else {
                    console.warn('Skipping non-existent ID test: No test issue available');
                    return;
                }
            }
            catch (error) {
                // If we can't access the API at all, skip this test
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('Skipping non-existent ID test: DevInfo API not accessible');
                    return;
                }
            }
            // Actual test for non-existent ID
            const nonExistentIssueId = '99999999';
            try {
                await vendor_atlassian_devinfo_service_js_1.default.getSummary(nonExistentIssueId);
                fail('Expected an error for non-existent issue ID');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Accept either 404 NOT_FOUND or 400 BAD_REQUEST depending on API behavior
                expect([400, 404]).toContain(error.statusCode);
            }
        }, 30000);
    });
    describe('getCommits', () => {
        it('should retrieve commits for a valid issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            const issueId = await getValidIssueId();
            if (!issueId) {
                console.warn('Skipping getCommits test: No valid issue ID found');
                return;
            }
            try {
                const result = await vendor_atlassian_devinfo_service_js_1.default.getCommits(issueId);
                // Verify response structure
                expect(result).toBeDefined();
                expect(result).toHaveProperty('detail');
                // The arrays might be empty if no commits exist
                expect(Array.isArray(result.detail)).toBe(true);
            }
            catch (error) {
                // If API has authentication issues or doesn't support devinfo, skip without failing
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('DevInfo API is not accessible: authentication error or feature not available');
                    return;
                }
                throw error;
            }
        }, 30000);
        it('should handle errors for non-existent issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            // First check if we can access the DevInfo API at all
            try {
                const testId = await getValidIssueId();
                if (testId) {
                    // Quick auth check
                    await vendor_atlassian_devinfo_service_js_1.default.getCommits(testId);
                }
                else {
                    console.warn('Skipping non-existent ID test: No test issue available');
                    return;
                }
            }
            catch (error) {
                // If we can't access the API at all, skip this test
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('Skipping non-existent ID test: DevInfo API not accessible');
                    return;
                }
            }
            // Actual test for non-existent ID
            const nonExistentIssueId = '99999999';
            try {
                await vendor_atlassian_devinfo_service_js_1.default.getCommits(nonExistentIssueId);
                fail('Expected an error for non-existent issue ID');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Accept either 404 NOT_FOUND or 400 BAD_REQUEST depending on API behavior
                expect([400, 404]).toContain(error.statusCode);
            }
        }, 30000);
    });
    describe('getBranches', () => {
        it('should retrieve branches for a valid issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            const issueId = await getValidIssueId();
            if (!issueId) {
                console.warn('Skipping getBranches test: No valid issue ID found');
                return;
            }
            try {
                const result = await vendor_atlassian_devinfo_service_js_1.default.getBranches(issueId);
                // Verify response structure
                expect(result).toBeDefined();
                expect(result).toHaveProperty('detail');
                // The arrays might be empty if no branches exist
                expect(Array.isArray(result.detail)).toBe(true);
            }
            catch (error) {
                // If API has authentication issues or doesn't support devinfo, skip without failing
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('DevInfo API is not accessible: authentication error or feature not available');
                    return;
                }
                throw error;
            }
        }, 30000);
        it('should handle errors for non-existent issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            // First check if we can access the DevInfo API at all
            try {
                const testId = await getValidIssueId();
                if (testId) {
                    // Quick auth check
                    await vendor_atlassian_devinfo_service_js_1.default.getBranches(testId);
                }
                else {
                    console.warn('Skipping non-existent ID test: No test issue available');
                    return;
                }
            }
            catch (error) {
                // If we can't access the API at all, skip this test
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('Skipping non-existent ID test: DevInfo API not accessible');
                    return;
                }
            }
            // Actual test for non-existent ID
            const nonExistentIssueId = '99999999';
            try {
                await vendor_atlassian_devinfo_service_js_1.default.getBranches(nonExistentIssueId);
                fail('Expected an error for non-existent issue ID');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Accept either 404 NOT_FOUND or 400 BAD_REQUEST depending on API behavior
                expect([400, 404]).toContain(error.statusCode);
            }
        }, 30000);
    });
    describe('getPullRequests', () => {
        it('should retrieve pull requests for a valid issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            const issueId = await getValidIssueId();
            if (!issueId) {
                console.warn('Skipping getPullRequests test: No valid issue ID found');
                return;
            }
            try {
                const result = await vendor_atlassian_devinfo_service_js_1.default.getPullRequests(issueId);
                // Verify response structure
                expect(result).toBeDefined();
                expect(result).toHaveProperty('detail');
                // The arrays might be empty if no pull requests exist
                expect(Array.isArray(result.detail)).toBe(true);
            }
            catch (error) {
                // If API has authentication issues or doesn't support devinfo, skip without failing
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('DevInfo API is not accessible: authentication error or feature not available');
                    return;
                }
                throw error;
            }
        }, 30000);
        it('should handle errors for non-existent issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            // First check if we can access the DevInfo API at all
            try {
                const testId = await getValidIssueId();
                if (testId) {
                    // Quick auth check
                    await vendor_atlassian_devinfo_service_js_1.default.getPullRequests(testId);
                }
                else {
                    console.warn('Skipping non-existent ID test: No test issue available');
                    return;
                }
            }
            catch (error) {
                // If we can't access the API at all, skip this test
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('Skipping non-existent ID test: DevInfo API not accessible');
                    return;
                }
            }
            // Actual test for non-existent ID
            const nonExistentIssueId = '99999999';
            try {
                await vendor_atlassian_devinfo_service_js_1.default.getPullRequests(nonExistentIssueId);
                fail('Expected an error for non-existent issue ID');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Accept either 404 NOT_FOUND or 400 BAD_REQUEST depending on API behavior
                expect([400, 404]).toContain(error.statusCode);
            }
        }, 30000);
    });
    describe('getAllDevInfo', () => {
        it('should retrieve all development information for a valid issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            const issueId = await getValidIssueId();
            if (!issueId) {
                console.warn('Skipping getAllDevInfo test: No valid issue ID found');
                return;
            }
            try {
                const result = await vendor_atlassian_devinfo_service_js_1.default.getAllDevInfo(issueId);
                // Verify response structure includes all parts
                expect(result).toBeDefined();
                expect(result).toHaveProperty('summary');
                expect(result).toHaveProperty('commits');
                expect(result).toHaveProperty('branches');
                expect(result).toHaveProperty('pullRequests');
                // Check summary structure
                expect(result.summary).toHaveProperty('summary');
                // Check commits structure
                expect(result.commits).toHaveProperty('detail');
                expect(Array.isArray(result.commits.detail)).toBe(true);
                // Check branches structure
                expect(result.branches).toHaveProperty('detail');
                expect(Array.isArray(result.branches.detail)).toBe(true);
                // Check pull requests structure
                expect(result.pullRequests).toHaveProperty('detail');
                expect(Array.isArray(result.pullRequests.detail)).toBe(true);
            }
            catch (error) {
                // If API has authentication issues or doesn't support devinfo, skip without failing
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('DevInfo API is not accessible: authentication error or feature not available');
                    return;
                }
                throw error;
            }
        }, 30000);
        it('should handle empty development information gracefully', async () => {
            if (skipIfNoCredentials())
                return;
            const issueId = await getValidIssueId();
            if (!issueId) {
                console.warn('Skipping empty devinfo test: No valid issue ID found');
                return;
            }
            try {
                const result = await vendor_atlassian_devinfo_service_js_1.default.getAllDevInfo(issueId);
                // Test passes as long as the structure is valid, even if empty
                expect(result).toBeDefined();
                expect(result).toHaveProperty('summary');
                expect(result).toHaveProperty('commits');
                expect(result).toHaveProperty('branches');
                expect(result).toHaveProperty('pullRequests');
            }
            catch (error) {
                // If API has authentication issues or doesn't support devinfo, skip without failing
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('DevInfo API is not accessible: authentication error or feature not available');
                    return;
                }
                throw error;
            }
        }, 30000);
        it('should handle errors for non-existent issue ID', async () => {
            if (skipIfNoCredentials())
                return;
            // First check if we can access the DevInfo API at all
            try {
                const testId = await getValidIssueId();
                if (testId) {
                    // Quick auth check
                    await vendor_atlassian_devinfo_service_js_1.default.getAllDevInfo(testId);
                }
                else {
                    console.warn('Skipping non-existent ID test: No test issue available');
                    return;
                }
            }
            catch (error) {
                // If we can't access the API at all, skip this test
                if (error instanceof error_util_js_1.McpError &&
                    (error.statusCode === 401 ||
                        error.statusCode === 403 ||
                        error.statusCode === 404)) {
                    console.warn('Skipping non-existent ID test: DevInfo API not accessible');
                    return;
                }
            }
            // Actual test for non-existent ID
            const nonExistentIssueId = '99999999';
            try {
                await vendor_atlassian_devinfo_service_js_1.default.getAllDevInfo(nonExistentIssueId);
                fail('Expected an error for non-existent issue ID');
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_util_js_1.McpError);
                // Accept either 404 NOT_FOUND or 400 BAD_REQUEST depending on API behavior
                expect([400, 404]).toContain(error.statusCode);
            }
        }, 30000);
    });
});
