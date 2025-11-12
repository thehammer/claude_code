import { DevInfoSummaryResponse, DevInfoResponse } from './vendor.atlassian.issues.types.js';
/**
 * Get development information summary for an issue
 * @param issueId The issue ID
 * @returns Development information summary
 */
declare function getSummary(issueId: string): Promise<DevInfoSummaryResponse>;
/**
 * Get detailed commit information for an issue
 * @param issueId The issue ID
 * @returns Commit information details
 */
declare function getCommits(issueId: string): Promise<DevInfoResponse>;
/**
 * Get branch information for an issue
 * @param issueId The issue ID
 * @returns Branch information details
 */
declare function getBranches(issueId: string): Promise<DevInfoResponse>;
/**
 * Get pull request information for an issue
 * @param issueId The issue ID
 * @returns Pull request information details
 */
declare function getPullRequests(issueId: string): Promise<DevInfoResponse>;
/**
 * Get all development information for an issue (summary, commits, branches, pull requests)
 * @param issueId The issue ID
 * @returns Complete development information
 */
declare function getAllDevInfo(issueId: string): Promise<{
    summary: DevInfoSummaryResponse;
    commits: DevInfoResponse;
    branches: DevInfoResponse;
    pullRequests: DevInfoResponse;
}>;
declare const _default: {
    getSummary: typeof getSummary;
    getCommits: typeof getCommits;
    getBranches: typeof getBranches;
    getPullRequests: typeof getPullRequests;
    getAllDevInfo: typeof getAllDevInfo;
};
export default _default;
