/**
 * Utility functions for formatting Jira issue data
 */
/**
 * Get emoji for issue status
 * Maps common Jira statuses to appropriate emoji for visual cues
 *
 * @param status - Status name from Jira
 * @returns Emoji representing the status
 */
export declare function getStatusEmoji(status: string | undefined): string;
/**
 * Get emoji for issue priority
 * Maps common Jira priority levels to appropriate emoji for visual cues
 *
 * @param priority - Priority name from Jira
 * @returns Emoji representing the priority
 */
export declare function getPriorityEmoji(priority: string | undefined): string;
/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export declare function formatFileSize(bytes: number): string;
