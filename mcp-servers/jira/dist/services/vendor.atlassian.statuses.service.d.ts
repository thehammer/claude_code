import { JiraGlobalStatusesResponse, JiraProjectStatusesResponse, ListStatusesParams } from './vendor.atlassian.statuses.types.js';
/**
 * List available Jira statuses.
 *
 * If projectKeyOrId is provided, fetches statuses relevant to that specific project's workflows.
 * Otherwise, fetches all statuses available in the Jira instance.
 *
 * @param {ListStatusesParams} params - Parameters including optional projectKeyOrId.
 * @returns {Promise<JiraGlobalStatusesResponse | JiraProjectStatusesResponse>} Raw API response.
 * @throws {Error} If credentials are missing or API request fails.
 */
declare function listStatuses(params?: ListStatusesParams): Promise<JiraGlobalStatusesResponse | JiraProjectStatusesResponse>;
declare const _default: {
    listStatuses: typeof listStatuses;
};
export default _default;
