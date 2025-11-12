"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_util_js_1 = require("../utils/logger.util.js");
const vendor_atlassian_issues_service_js_1 = __importDefault(require("../services/vendor.atlassian.issues.service.js"));
const atlassian_issues_create_formatter_js_1 = require("./atlassian.issues.create.formatter.js");
const adf_from_markdown_util_js_1 = require("../utils/adf-from-markdown.util.js");
// Create a contextualized logger for this file
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.issues.create.controller.ts');
// Log controller initialization
controllerLogger.debug('Jira issues create controller initialized');
/**
 * Get create metadata for a project and its issue types
 * @param args Arguments containing project identifier and optional filters
 * @returns Formatted create metadata response
 */
async function getCreateMeta(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.issues.create.controller.ts', 'getCreateMeta');
    methodLogger.debug(`Getting create metadata for project: ${args.projectKeyOrId}`, args);
    const response = await vendor_atlassian_issues_service_js_1.default.getCreateMeta(args.projectKeyOrId, args.issueTypeId, {
        ...(args.issuetypeNames && { issuetypeNames: args.issuetypeNames }),
    });
    methodLogger.debug('Retrieved create metadata successfully');
    return {
        content: (0, atlassian_issues_create_formatter_js_1.formatCreateMeta)(response, args.projectKeyOrId),
    };
}
/**
 * Create a new Jira issue
 * @param args Arguments containing issue creation data
 * @returns Formatted create issue response
 */
async function createIssue(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.issues.create.controller.ts', 'createIssue');
    methodLogger.debug('Creating new issue:', args);
    // Build the fields object for issue creation
    const fields = {
        project: {
            key: args.projectKeyOrId,
        },
        issuetype: {
            id: args.issueTypeId,
        },
        summary: args.summary,
    };
    // Add description as ADF if provided
    if (args.description) {
        fields.description = (0, adf_from_markdown_util_js_1.markdownToAdf)(args.description);
    }
    // Add optional fields
    if (args.priority) {
        // Try as ID first, then as name
        if (/^\d+$/.test(args.priority)) {
            fields.priority = { id: args.priority };
        }
        else {
            fields.priority = { name: args.priority };
        }
    }
    if (args.assignee) {
        // Assume account ID format
        fields.assignee = { accountId: args.assignee };
    }
    if (args.labels?.length) {
        fields.labels = args.labels;
    }
    if (args.components?.length) {
        fields.components = args.components.map((comp) => {
            // Try as ID first, then as name
            if (/^\d+$/.test(comp)) {
                return { id: comp };
            }
            else {
                return { name: comp };
            }
        });
    }
    if (args.fixVersions?.length) {
        fields.fixVersions = args.fixVersions.map((version) => {
            // Try as ID first, then as name
            if (/^\d+$/.test(version)) {
                return { id: version };
            }
            else {
                return { name: version };
            }
        });
    }
    // Add custom fields if provided
    if (args.customFields) {
        Object.assign(fields, args.customFields);
    }
    const createParams = {
        fields,
    };
    methodLogger.debug('Calling service to create issue with fields:', fields);
    const response = await vendor_atlassian_issues_service_js_1.default.createIssue(createParams);
    methodLogger.debug('Created issue successfully:', response);
    return {
        content: (0, atlassian_issues_create_formatter_js_1.formatCreateIssueResponse)(response),
    };
}
exports.default = {
    getCreateMeta,
    createIssue,
};
