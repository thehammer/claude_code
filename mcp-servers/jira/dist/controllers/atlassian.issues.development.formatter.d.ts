/**
 * Formatter for Jira development information
 */
import { DevInfoSummaryResponse, DevInfoResponse } from './atlassian.issues.types.formatter.js';
/**
 * Format development information for display
 * @param devInfoSummary - Development information summary
 * @param devInfoCommits - Development information commits
 * @param devInfoBranches - Development information branches
 * @param devInfoPullRequests - Development information pull requests
 * @returns Formatted string with development information in markdown format
 */
export declare function formatDevelopmentInfo(devInfoSummary: DevInfoSummaryResponse | null, devInfoCommits: DevInfoResponse | null, devInfoBranches: DevInfoResponse | null, devInfoPullRequests: DevInfoResponse | null): string;
