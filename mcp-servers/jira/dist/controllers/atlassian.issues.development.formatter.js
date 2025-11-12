"use strict";
/**
 * Formatter for Jira development information
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDevelopmentInfo = formatDevelopmentInfo;
const formatter_util_js_1 = require("../utils/formatter.util.js");
/**
 * Format development information for display
 * @param devInfoSummary - Development information summary
 * @param devInfoCommits - Development information commits
 * @param devInfoBranches - Development information branches
 * @param devInfoPullRequests - Development information pull requests
 * @returns Formatted string with development information in markdown format
 */
function formatDevelopmentInfo(devInfoSummary, devInfoCommits, devInfoBranches, devInfoPullRequests) {
    const lines = [];
    // Check if there's any development info available
    if (!devInfoSummary ||
        !devInfoSummary.summary ||
        (!devInfoSummary.summary.repository?.overall?.count &&
            !devInfoSummary.summary.branch?.overall?.count &&
            !devInfoSummary.summary.pullrequest?.overall?.count)) {
        return ''; // No development info, return empty string
    }
    lines.push('');
    lines.push((0, formatter_util_js_1.formatHeading)('Development Information', 2));
    // Development Summary
    if (devInfoSummary.summary) {
        const summary = devInfoSummary.summary;
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Development Summary', 3));
        const summaryProps = {};
        if (summary.repository?.overall?.count) {
            const lastUpdated = summary.repository.overall.lastUpdated;
            const formattedDateStr = lastUpdated !== undefined && lastUpdated !== null
                ? (0, formatter_util_js_1.formatDate)(new Date(lastUpdated))
                : 'Unknown';
            summaryProps['Repositories'] =
                `${summary.repository.overall.count} (Last updated: ${formattedDateStr})`;
        }
        if (summary.branch?.overall?.count) {
            const lastUpdated = summary.branch.overall.lastUpdated;
            const formattedDateStr = lastUpdated !== undefined && lastUpdated !== null
                ? (0, formatter_util_js_1.formatDate)(new Date(lastUpdated))
                : 'Unknown';
            summaryProps['Branches'] =
                `${summary.branch.overall.count} (Last updated: ${formattedDateStr})`;
        }
        if (summary.pullrequest?.overall?.count) {
            const lastUpdated = summary.pullrequest.overall.lastUpdated;
            const formattedDateStr = lastUpdated !== undefined && lastUpdated !== null
                ? (0, formatter_util_js_1.formatDate)(new Date(lastUpdated))
                : 'Unknown';
            summaryProps['Pull Requests'] =
                `${summary.pullrequest.overall.count} (Last updated: ${formattedDateStr}, Status: ${summary.pullrequest.overall.state || 'Unknown'})`;
        }
        lines.push((0, formatter_util_js_1.formatBulletList)(summaryProps));
    }
    // Commits
    if (devInfoCommits?.detail && devInfoCommits.detail.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Commits', 3));
        devInfoCommits.detail.forEach((detail) => {
            if (detail.repositories && detail.repositories.length > 0) {
                detail.repositories.forEach((repo) => {
                    lines.push(`**Repository**: ${repo.name}`);
                    if (repo.commits && repo.commits.length > 0) {
                        lines.push('');
                        repo.commits.forEach((commit, index) => {
                            lines.push(`${index + 1}. **${commit.displayId}** - ${commit.message.split('\n')[0]}`);
                            lines.push(`   Author: ${commit.author?.name || 'Unknown'}, Date: ${(0, formatter_util_js_1.formatDate)(commit.authorTimestamp)}`);
                            if (commit.url) {
                                lines.push(`   ${(0, formatter_util_js_1.formatUrl)(commit.url, 'View Commit')}`);
                            }
                            if (index < repo.commits.length - 1) {
                                lines.push('');
                            }
                        });
                    }
                    else {
                        lines.push('   No commits found');
                    }
                });
            }
        });
    }
    // Branches
    if (devInfoBranches?.detail && devInfoBranches.detail.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Branches', 3));
        devInfoBranches.detail.forEach((detail) => {
            if (detail.branches && detail.branches.length > 0) {
                detail.branches.forEach((branch) => {
                    lines.push(`**Branch**: ${branch.name}`);
                    lines.push(`**Repository**: ${branch.repository?.name || 'Unknown'}`);
                    if (branch.lastCommit) {
                        lines.push(`**Last Commit**: ${branch.lastCommit.displayId} - ${branch.lastCommit.message.split('\n')[0]}`);
                        lines.push(`**Author**: ${branch.lastCommit.author?.name || 'Unknown'}, **Date**: ${(0, formatter_util_js_1.formatDate)(branch.lastCommit.authorTimestamp)}`);
                    }
                    if (branch.url) {
                        lines.push(`${(0, formatter_util_js_1.formatUrl)(branch.url, 'View Branch')}`);
                    }
                    lines.push('');
                });
            }
            else {
                lines.push('No branches found');
            }
        });
    }
    // Pull Requests
    if (devInfoPullRequests?.detail && devInfoPullRequests.detail.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Pull Requests', 3));
        devInfoPullRequests.detail.forEach((detail) => {
            if (detail.pullRequests && detail.pullRequests.length > 0) {
                detail.pullRequests.forEach((pr) => {
                    lines.push(`**${pr.name}** (${pr.status})`);
                    lines.push(`**Repository**: ${pr.repositoryName}`);
                    lines.push(`**Author**: ${pr.author?.name || 'Unknown'}`);
                    if (pr.source?.branch && pr.destination?.branch) {
                        lines.push(`**Source**: ${pr.source.branch} → **Destination**: ${pr.destination.branch}`);
                    }
                    if (pr.reviewers && pr.reviewers.length > 0) {
                        const approved = pr.reviewers
                            .filter((r) => r.approved)
                            .map((r) => r.name)
                            .join(', ');
                        const notApproved = pr.reviewers
                            .filter((r) => !r.approved)
                            .map((r) => r.name)
                            .join(', ');
                        if (approved) {
                            lines.push(`**Approved by**: ${approved}`);
                        }
                        if (notApproved) {
                            lines.push(`**Awaiting approval from**: ${notApproved}`);
                        }
                    }
                    lines.push(`**Last Updated**: ${(0, formatter_util_js_1.formatDate)(pr.lastUpdate)}`);
                    if (pr.url) {
                        lines.push(`${(0, formatter_util_js_1.formatUrl)(pr.url, 'View Pull Request')}`);
                    }
                    lines.push('');
                });
            }
            else {
                lines.push('No pull requests found');
            }
        });
    }
    return lines.join('\n');
}
