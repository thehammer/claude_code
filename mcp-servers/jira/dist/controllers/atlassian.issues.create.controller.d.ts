import { GetCreateMetaToolArgsType, CreateIssueToolArgsType } from '../tools/atlassian.issues.create.types.js';
/**
 * Get create metadata for a project and its issue types
 * @param args Arguments containing project identifier and optional filters
 * @returns Formatted create metadata response
 */
declare function getCreateMeta(args: GetCreateMetaToolArgsType): Promise<{
    content: string;
}>;
/**
 * Create a new Jira issue
 * @param args Arguments containing issue creation data
 * @returns Formatted create issue response
 */
declare function createIssue(args: CreateIssueToolArgsType): Promise<{
    content: string;
}>;
declare const _default: {
    getCreateMeta: typeof getCreateMeta;
    createIssue: typeof createIssue;
};
export default _default;
