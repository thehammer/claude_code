"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTransitionsList = formatTransitionsList;
exports.formatTransitionSuccess = formatTransitionSuccess;
/**
 * Format a list of transitions into a Markdown string.
 *
 * @param {JiraTransition[]} transitions - Array of transition objects.
 * @param {string} issueIdOrKey - The issue key or ID.
 * @returns {string} Formatted Markdown string.
 */
function formatTransitionsList(transitions, issueIdOrKey) {
    if (!transitions || transitions.length === 0) {
        return `No transitions available for ${issueIdOrKey}.`;
    }
    const parts = [];
    // Header
    parts.push(`# Available Transitions for ${issueIdOrKey}`);
    parts.push('');
    parts.push(`Found ${transitions.length} available transition${transitions.length === 1 ? '' : 's'}.`);
    parts.push('');
    // List each transition
    for (const transition of transitions) {
        parts.push(`## ${transition.name}`);
        parts.push(`- **ID**: ${transition.id}`);
        parts.push(`- **To Status**: ${transition.to.name}`);
        parts.push(`- **Status Category**: ${transition.to.statusCategory.name}`);
        if (transition.hasScreen !== undefined) {
            parts.push(`- **Has Screen**: ${transition.hasScreen ? 'Yes' : 'No'}`);
        }
        if (transition.isGlobal !== undefined) {
            parts.push(`- **Global**: ${transition.isGlobal ? 'Yes' : 'No'}`);
        }
        if (transition.isConditional !== undefined) {
            parts.push(`- **Conditional**: ${transition.isConditional ? 'Yes' : 'No'}`);
        }
        parts.push('');
        parts.push('---');
        parts.push('');
    }
    // Footer with usage instructions
    parts.push('*To transition this issue, use the transition ID with `jira_transition_issue`.*');
    parts.push('*Example: `jira_transition_issue("' + issueIdOrKey + '", "<transition_id>")`*');
    return parts.join('\n');
}
/**
 * Format a successful transition response into a Markdown string.
 *
 * @param {string} issueIdOrKey - The issue key or ID.
 * @param {string} transitionName - The name of the transition applied.
 * @param {string} newStatus - The new status name.
 * @returns {string} Formatted Markdown string.
 */
function formatTransitionSuccess(issueIdOrKey, transitionName, newStatus) {
    const parts = [];
    parts.push('# Issue Transitioned Successfully');
    parts.push('');
    parts.push(`**Issue**: ${issueIdOrKey}`);
    parts.push(`**Transition**: ${transitionName}`);
    parts.push(`**New Status**: ${newStatus}`);
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push(`*The issue has been successfully moved to "${newStatus}".*`);
    return parts.join('\n');
}
