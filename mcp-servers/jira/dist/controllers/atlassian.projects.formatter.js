"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProjectsList = formatProjectsList;
exports.formatProjectDetails = formatProjectDetails;
const formatter_util_js_1 = require("../utils/formatter.util.js");
/**
 * Format a list of projects for display
 * @param projectsData - Raw projects data from the API
 * @returns Formatted string with projects information in markdown format
 */
function formatProjectsList(projectsData) {
    if (!projectsData.values || projectsData.values.length === 0) {
        return ('No Jira projects found matching your criteria.' +
            '\n\n' +
            (0, formatter_util_js_1.formatSeparator)() +
            '\n' +
            `*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    }
    const lines = [(0, formatter_util_js_1.formatHeading)('Jira Projects', 1), ''];
    // Use a standard list format instead of map
    let listContent = '';
    projectsData.values.forEach((project, index) => {
        // Safely cast project to include expanded fields
        const expandedProject = project;
        // Build URL from project data
        const projectUrl = project.self.replace('/rest/api/3/project/', '/browse/');
        listContent +=
            (0, formatter_util_js_1.formatHeading)(`${index + 1}. ${project.name}`, 2) + '\n\n';
        // Basic properties
        const properties = {
            ID: project.id,
            Key: project.key,
            Type: expandedProject.projectTypeKey ||
                project.projectCategory?.name ||
                'Not specified',
            Style: project.style || 'Not specified',
            Self: (0, formatter_util_js_1.formatUrl)(projectUrl, 'Open in Jira'),
        };
        // Lead information if available
        if (expandedProject.lead) {
            properties['Lead'] = expandedProject.lead.displayName;
        }
        // Format as bullet list
        listContent += (0, formatter_util_js_1.formatBulletList)(properties, (key) => key) + '\n\n';
        // Separator is now handled within the loop
        if (index < projectsData.values.length - 1) {
            listContent += (0, formatter_util_js_1.formatSeparator)() + '\n\n';
        }
        // Avatar if available
        if (project.avatarUrls && project.avatarUrls['48x48']) {
            listContent += `![${project.name} Avatar](${project.avatarUrls['48x48']})\n\n`;
        }
    });
    lines.push(listContent);
    // Add standard footer with timestamp
    lines.push('\n\n' + (0, formatter_util_js_1.formatSeparator)());
    lines.push(`*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    return lines.join('\n');
}
/**
 * Format detailed project information for display
 * @param projectData - Raw project data from the API
 * @returns Formatted string with project details in markdown format
 */
function formatProjectDetails(projectData) {
    // Prepare URL
    const projectUrl = projectData.self.replace('/rest/api/3/project/', '/browse/');
    const lines = [
        (0, formatter_util_js_1.formatHeading)(`Project: ${projectData.name}`, 1),
        '',
        `> A ${projectData.style || 'standard'} project with key \`${projectData.key}\`.`,
        '',
        (0, formatter_util_js_1.formatHeading)('Basic Information', 2),
    ];
    // Format basic information as a bullet list
    const basicProperties = {
        ID: projectData.id,
        Key: projectData.key,
        Style: projectData.style || 'Not specified',
        Simplified: projectData.simplified ? 'Yes' : 'No',
    };
    lines.push((0, formatter_util_js_1.formatBulletList)(basicProperties, (key) => key));
    // Description
    if (projectData.description) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Description', 2));
        lines.push(projectData.description);
    }
    // Lead information
    if (projectData.lead) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Project Lead', 2));
        const leadProperties = {
            Name: projectData.lead.displayName,
            Active: projectData.lead.active ? 'Yes' : 'No',
        };
        lines.push((0, formatter_util_js_1.formatBulletList)(leadProperties, (key) => key));
    }
    // Components
    if (projectData.components && projectData.components.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Components', 2));
        projectData.components.forEach((component) => {
            lines.push((0, formatter_util_js_1.formatHeading)(`${component.name}`, 3));
            if (component.description) {
                lines.push(component.description);
                lines.push('');
            }
            const componentProperties = {
                Lead: component.lead?.displayName,
            };
            lines.push((0, formatter_util_js_1.formatBulletList)(componentProperties, (key) => key));
        });
    }
    else {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Components', 2));
        lines.push('No components defined for this project.');
    }
    // Versions
    if (projectData.versions && projectData.versions.length > 0) {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Versions', 2));
        projectData.versions.forEach((version) => {
            lines.push((0, formatter_util_js_1.formatHeading)(`${version.name}`, 3));
            if (version.description) {
                lines.push(version.description);
                lines.push('');
            }
            const versionProperties = {
                Released: version.released ? 'Yes' : 'No',
                Archived: version.archived ? 'Yes' : 'No',
                'Release Date': version.releaseDate
                    ? (0, formatter_util_js_1.formatDate)(version.releaseDate)
                    : 'N/A',
                'Start Date': version.startDate
                    ? (0, formatter_util_js_1.formatDate)(version.startDate)
                    : 'N/A',
            };
            lines.push((0, formatter_util_js_1.formatBulletList)(versionProperties, (key) => key));
        });
    }
    else {
        lines.push('');
        lines.push((0, formatter_util_js_1.formatHeading)('Versions', 2));
        lines.push('No versions defined for this project.');
    }
    // Links section
    lines.push('');
    lines.push((0, formatter_util_js_1.formatHeading)('Links', 2));
    const links = [];
    links.push(`- ${(0, formatter_util_js_1.formatUrl)(projectUrl, 'Open in Jira')}`);
    links.push(`- ${(0, formatter_util_js_1.formatUrl)(`${projectUrl}/issues`, 'View Issues')}`);
    links.push(`- ${(0, formatter_util_js_1.formatUrl)(`${projectUrl}/board`, 'View Board')}`);
    lines.push(links.join('\n'));
    // Add standard footer with timestamp
    lines.push('\n\n' + (0, formatter_util_js_1.formatSeparator)());
    lines.push(`*Information retrieved at: ${(0, formatter_util_js_1.formatDate)(new Date())}*`);
    // Optionally keep the direct link
    if (projectUrl) {
        lines.push(`*View this project in Jira: ${projectUrl}*`);
    }
    return lines.join('\n');
}
