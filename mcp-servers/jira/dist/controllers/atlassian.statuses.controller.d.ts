import { ListStatusesToolArgsType } from '../tools/atlassian.statuses.types.js';
import { ControllerResponse } from '../types/common.types.js';
/**
 * List Jira statuses, optionally filtering by project.
 *
 * Handles fetching statuses either globally or for a specific project,
 * processing the potentially different API responses, and formatting the result.
 *
 * @param {ListStatusesToolArgsType} options - Options including optional projectKeyOrId.
 * @returns {Promise<ControllerResponse>} Formatted list of statuses.
 */
declare function listStatuses(options?: ListStatusesToolArgsType): Promise<ControllerResponse>;
declare const _default: {
    listStatuses: typeof listStatuses;
};
export default _default;
