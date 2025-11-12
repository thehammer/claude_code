import { ProjectDetailed, ProjectsResponse, ListProjectsParams, GetProjectByIdParams } from './vendor.atlassian.projects.types.js';
/**
 * @namespace VendorAtlassianProjectsService
 * @description Service for interacting with Jira Projects API.
 * Provides methods for listing projects and retrieving project details.
 * All methods require valid Atlassian credentials configured in the environment.
 */
/**
 * List Jira projects with optional filtering and pagination
 *
 * Retrieves a list of projects from Jira with support for various filters
 * and pagination options. Projects can be filtered by IDs, keys, query, etc.
 *
 * @async
 * @memberof VendorAtlassianProjectsService
 * @param {ListProjectsParams} [params={}] - Optional parameters for customizing the request
 * @param {string[]} [params.ids] - Filter by project IDs
 * @param {string[]} [params.keys] - Filter by project keys
 * @param {string} [params.query] - Filter by project name or key
 * @param {string} [params.typeKey] - Filter by project type
 * @param {string} [params.categoryId] - Filter by project category ID
 * @param {string} [params.action] - Filter by user action
 * @param {string[]} [params.expand] - Fields to expand in the response
 * @param {string[]} [params.status] - Filter by project status
 * @param {string} [params.orderBy] - Sort order for results
 * @param {number} [params.startAt] - Pagination start index
 * @param {number} [params.maxResults] - Maximum number of results to return
 * @returns {Promise<ProjectsResponse>} Promise containing the projects response with results and pagination info
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // List projects with pagination
 * const response = await list({
 *   maxResults: 10,
 *   orderBy: 'key'
 * });
 */
declare function list(params?: ListProjectsParams): Promise<ProjectsResponse>;
/**
 * Get detailed information about a specific Jira project
 *
 * Retrieves comprehensive details about a single project, including metadata,
 * description, and optional components like versions, components, and properties.
 *
 * @async
 * @memberof VendorAtlassianProjectsService
 * @param {string} idOrKey - The ID or key of the project to retrieve
 * @param {GetProjectByIdParams} [params={}] - Optional parameters for customizing the response
 * @param {string[]} [params.expand] - Fields to expand in the response
 * @param {boolean} [params.includeComponents] - Include project components
 * @param {boolean} [params.includeVersions] - Include project versions
 * @param {boolean} [params.includeProperties] - Include project properties
 * @returns {Promise<ProjectDetailed>} Promise containing the detailed project information
 * @throws {Error} If Atlassian credentials are missing or API request fails
 * @example
 * // Get project details with components and versions
 * const project = await get('ABC', {
 *   includeComponents: true,
 *   includeVersions: true
 * });
 */
declare function get(idOrKey: string, params?: GetProjectByIdParams): Promise<ProjectDetailed>;
declare const _default: {
    list: typeof list;
    get: typeof get;
};
export default _default;
