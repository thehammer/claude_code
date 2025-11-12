import { ControllerResponse } from '../types/common.types.js';
import { ListWorklogsToolArgsType, AddWorklogToolArgsType, UpdateWorklogToolArgsType, DeleteWorklogToolArgsType } from '../tools/atlassian.worklogs.types.js';
/**
 * List worklogs for a Jira issue
 * @param options Options for listing worklogs
 * @returns Promise with formatted worklog list
 */
declare function listWorklogs(options: ListWorklogsToolArgsType): Promise<ControllerResponse>;
/**
 * Add a worklog to a Jira issue
 * @param options Options for adding worklog
 * @returns Promise with confirmation message
 */
declare function addWorklog(options: AddWorklogToolArgsType): Promise<ControllerResponse>;
/**
 * Update an existing worklog
 * @param options Options for updating worklog
 * @returns Promise with confirmation message
 */
declare function updateWorklog(options: UpdateWorklogToolArgsType): Promise<ControllerResponse>;
/**
 * Delete a worklog from a Jira issue
 * @param options Options for deleting worklog
 * @returns Promise with confirmation message
 */
declare function deleteWorklog(options: DeleteWorklogToolArgsType): Promise<ControllerResponse>;
declare const _default: {
    listWorklogs: typeof listWorklogs;
    addWorklog: typeof addWorklog;
    updateWorklog: typeof updateWorklog;
    deleteWorklog: typeof deleteWorklog;
};
export default _default;
