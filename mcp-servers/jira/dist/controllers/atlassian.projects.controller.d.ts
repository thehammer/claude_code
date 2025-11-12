import { ControllerResponse } from '../types/common.types.js';
import { GetProjectToolArgsType, ListProjectsToolArgsType } from '../tools/atlassian.projects.types.js';
/**
 * Lists Jira projects with pagination and filtering options
 * @param options - Options for listing projects
 * @returns Formatted list of projects with pagination information
 */
declare function list(options?: ListProjectsToolArgsType): Promise<ControllerResponse>;
/**
 * Gets details of a specific Jira project
 * @param identifier - The project identifier
 * @returns Formatted project details
 */
declare function get(identifier: GetProjectToolArgsType): Promise<ControllerResponse>;
declare const _default: {
    list: typeof list;
    get: typeof get;
};
export default _default;
