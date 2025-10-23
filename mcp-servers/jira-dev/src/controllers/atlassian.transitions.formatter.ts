import { JiraTransition } from '../services/vendor.atlassian.transitions.types.js';

/**
 * Format a list of transitions into Markdown.
 *
 * @param {JiraTransition[]} transitions - Array of transition objects.
 * @param {string} issueKey - The issue key for context.
 * @returns {string} Formatted Markdown string.
 */
export function formatTransitionsList(
	transitions: JiraTransition[],
	issueKey: string,
): string {
	if (!transitions || transitions.length === 0) {
		return `# Transitions for ${issueKey}\n\nNo transitions available for this issue.`;
	}

	let markdown = `# Available Transitions for ${issueKey}\n\n`;
	markdown += `Found ${transitions.length} available transition${transitions.length === 1 ? '' : 's'}.\n\n`;

	transitions.forEach((transition) => {
		markdown += `## ${transition.name}\n`;
		markdown += `- **ID**: ${transition.id}\n`;
		markdown += `- **To Status**: ${transition.to.name}\n`;
		markdown += `- **Status Category**: ${transition.to.statusCategory.name}\n`;

		if (transition.hasScreen !== undefined) {
			markdown += `- **Has Screen**: ${transition.hasScreen ? 'Yes' : 'No'}\n`;
		}

		if (transition.isGlobal !== undefined) {
			markdown += `- **Global**: ${transition.isGlobal ? 'Yes' : 'No'}\n`;
		}

		if (transition.isConditional !== undefined) {
			markdown += `- **Conditional**: ${transition.isConditional ? 'Yes' : 'No'}\n`;
		}

		if (transition.fields && Object.keys(transition.fields).length > 0) {
			markdown += `- **Required Fields**: ${Object.keys(transition.fields).length} field(s)\n`;
		}

		markdown += '\n---\n\n';
	});

	markdown += `*To transition this issue, use the transition ID with \`jira_transition_issue\`.*\n`;
	markdown += `*Example: \`jira_transition_issue("${issueKey}", "<transition_id>")\`*\n`;

	return markdown.trim();
}

/**
 * Format a successful transition result into Markdown.
 *
 * @param {string} issueKey - The issue key that was transitioned.
 * @param {string} transitionName - The name of the transition applied.
 * @param {string} newStatus - The new status of the issue.
 * @returns {string} Formatted Markdown string.
 */
export function formatTransitionSuccess(
	issueKey: string,
	transitionName: string,
	newStatus: string,
): string {
	let markdown = `# Issue Transitioned Successfully\n\n`;
	markdown += `**Issue**: ${issueKey}\n`;
	markdown += `**Transition**: ${transitionName}\n`;
	markdown += `**New Status**: ${newStatus}\n\n`;
	markdown += `---\n\n`;
	markdown += `*The issue has been successfully moved to "${newStatus}".*\n`;

	return markdown.trim();
}
