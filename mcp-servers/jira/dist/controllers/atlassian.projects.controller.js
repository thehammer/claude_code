"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_atlassian_projects_service_js_1 = __importDefault(require("../services/vendor.atlassian.projects.service.js"));
const logger_util_js_1 = require("../utils/logger.util.js");
const error_handler_util_js_1 = require("../utils/error-handler.util.js");
const error_util_js_1 = require("../utils/error.util.js");
const pagination_util_js_1 = require("../utils/pagination.util.js");
const atlassian_projects_formatter_js_1 = require("./atlassian.projects.formatter.js");
const formatter_util_js_1 = require("../utils/formatter.util.js");
const defaults_util_js_1 = require("../utils/defaults.util.js");
/**
 * Controller for managing Jira projects.
 * Provides functionality for listing projects and retrieving project details.
 */
// Create a contextualized logger for this file
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.projects.controller.ts');
// Log controller initialization
controllerLogger.debug('Jira projects controller initialized');
/**
 * Lists Jira projects with pagination and filtering options
 * @param options - Options for listing projects
 * @returns Formatted list of projects with pagination information
 */
async function list(options = {}) {
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.projects.controller.ts', 'list');
    methodLogger.debug('Listing Jira projects (raw options received):', options);
    try {
        // Create a defaults object with proper typing
        const defaults = {
            limit: defaults_util_js_1.DEFAULT_PAGE_SIZE,
            orderBy: 'lastIssueUpdatedTime',
            startAt: 0,
        };
        // Apply defaults
        const mergedOptions = (0, defaults_util_js_1.applyDefaults)(options, defaults);
        methodLogger.debug('Listing Jira projects (merged options after defaults):', mergedOptions);
        // Map controller options to service parameters
        const params = {
            ...(mergedOptions.name && { query: mergedOptions.name }),
            ...(mergedOptions.orderBy && { orderBy: mergedOptions.orderBy }),
            maxResults: mergedOptions.limit,
            startAt: mergedOptions.startAt,
        };
        methodLogger.debug('Using service params:', params);
        const projectsData = await vendor_atlassian_projects_service_js_1.default.list(params);
        // Log only the count of projects returned instead of the entire response
        methodLogger.debug(`Retrieved ${projectsData.values?.length || 0} projects`);
        // Extract pagination information using the utility
        const pagination = (0, pagination_util_js_1.extractPaginationInfo)(projectsData, pagination_util_js_1.PaginationType.OFFSET, 'Project');
        // Format the projects data for display using the formatter
        const formattedProjects = (0, atlassian_projects_formatter_js_1.formatProjectsList)(projectsData);
        // Combine formatted content with pagination information
        let finalContent = formattedProjects;
        if (pagination &&
            (pagination.hasMore || pagination.count !== undefined)) {
            const paginationString = (0, formatter_util_js_1.formatPagination)(pagination);
            finalContent += '\n\n' + paginationString;
        }
        return {
            content: finalContent,
        };
    }
    catch (error) {
        // Use throw instead of return
        throw (0, error_handler_util_js_1.handleControllerError)(error, {
            entityType: 'Projects',
            operation: 'listing',
            source: 'controllers/atlassian.projects.controller.ts@list',
            additionalInfo: { options },
        });
    }
}
/**
 * Gets details of a specific Jira project
 * @param identifier - The project identifier
 * @returns Formatted project details
 */
async function get(identifier) {
    const { projectKeyOrId } = identifier;
    const methodLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.projects.controller.ts', 'get');
    methodLogger.debug(`Getting Jira project with key/ID: ${projectKeyOrId}...`);
    // Validate project key/ID format
    if (!projectKeyOrId || projectKeyOrId === 'invalid') {
        throw (0, error_util_js_1.createApiError)('Invalid project key or ID', 400);
    }
    try {
        // Create defaults object for get operation
        const defaults = {
            includeComponents: defaults_util_js_1.PROJECT_DEFAULTS.INCLUDE_COMPONENTS,
            includeVersions: defaults_util_js_1.PROJECT_DEFAULTS.INCLUDE_VERSIONS,
        };
        // Always include all possible expansions for maximum detail
        const serviceParams = defaults;
        const projectData = await vendor_atlassian_projects_service_js_1.default.get(projectKeyOrId, serviceParams);
        // Log only key information instead of the entire response
        methodLogger.debug(`Retrieved project: ${projectData.name} (${projectData.id})`);
        // Format the project data for display using the formatter
        const formattedProject = (0, atlassian_projects_formatter_js_1.formatProjectDetails)(projectData);
        return {
            content: formattedProject,
        };
    }
    catch (error) {
        // Use throw instead of return
        throw (0, error_handler_util_js_1.handleControllerError)(error, {
            entityType: 'Project',
            entityId: identifier,
            operation: 'retrieving',
            source: 'controllers/atlassian.projects.controller.ts@get',
        });
    }
}
exports.default = { list, get };
