import { ProjectDetailed, ProjectsResponse } from '../services/vendor.atlassian.projects.types.js';
/**
 * Format a list of projects for display
 * @param projectsData - Raw projects data from the API
 * @returns Formatted string with projects information in markdown format
 */
export declare function formatProjectsList(projectsData: ProjectsResponse): string;
/**
 * Format detailed project information for display
 * @param projectData - Raw project data from the API
 * @returns Formatted string with project details in markdown format
 */
export declare function formatProjectDetails(projectData: ProjectDetailed): string;
