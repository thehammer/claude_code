"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListStatusesToolArgs = void 0;
const zod_1 = require("zod");
/**
 * Zod schema definition for the jira_ls_statuses tool arguments.
 */
exports.ListStatusesToolArgs = zod_1.z.object({
    projectKeyOrId: zod_1.z
        .string()
        .optional()
        .describe('Optional project key or ID (e.g. "PROJ" or "10001") to filter statuses relevant to that project workflows.'),
    // Pagination args can be added here if needed
});
