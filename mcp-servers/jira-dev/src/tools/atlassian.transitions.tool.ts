import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	GetTransitionsToolArgs,
	type GetTransitionsToolArgsType,
	TransitionIssueToolArgs,
	type TransitionIssueToolArgsType,
} from './atlassian.transitions.types.js';
import atlassianTransitionsController from '../controllers/atlassian.transitions.controller.js';

const toolLogger = Logger.forContext('tools/atlassian.transitions.tool.ts');
toolLogger.debug('Jira transitions tool module initialized');

/**
 * Handler for jira_get_transitions tool.
 * Gets available workflow transitions for a Jira issue.
 *
 * @param {GetTransitionsToolArgsType} args - Tool arguments with issueIdOrKey
 * @returns {Promise<object>} MCP response object with formatted Markdown
 */
async function handleGetTransitions(args: Record<string, unknown>) {
	const methodLogger = toolLogger.forMethod('handleGetTransitions');
	methodLogger.debug('Getting Jira transitions with arguments:', args);

	try {
		const result = await atlassianTransitionsController.getTransitions(
			args as GetTransitionsToolArgsType,
		);

		methodLogger.debug('Successfully retrieved transitions');

		return {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error('Failed to get transitions', error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Handler for jira_transition_issue tool.
 * Transitions a Jira issue to a new status.
 *
 * @param {TransitionIssueToolArgsType} args - Tool arguments with issueIdOrKey, transitionId, and optional comment
 * @returns {Promise<object>} MCP response object with success message
 */
async function handleTransitionIssue(args: Record<string, unknown>) {
	const methodLogger = toolLogger.forMethod('handleTransitionIssue');
	methodLogger.debug('Transitioning Jira issue with arguments:', args);

	try {
		const result = await atlassianTransitionsController.transitionIssue(
			args as TransitionIssueToolArgsType,
		);

		methodLogger.debug('Successfully transitioned issue');

		return {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error('Failed to transition issue', error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register the Jira transitions tools with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance
 */
function registerTools(server: McpServer) {
	const methodLogger = toolLogger.forMethod('registerTools');
	methodLogger.debug('Registering Jira transitions tools...');

	server.tool(
		'jira_get_transitions',
		`Get available workflow transitions for a Jira issue.
Returns all possible status transitions that can be applied to the specified issue based on the current workflow state.
Use this to discover which transitions are available before calling jira_transition_issue.
Returns a formatted Markdown list of transitions including ID, name, target status, and additional metadata.
Requires Jira credentials to be configured.`,
		GetTransitionsToolArgs.shape,
		handleGetTransitions,
	);

	server.tool(
		'jira_transition_issue',
		`Transition a Jira issue to a new status.
Moves an issue through its workflow by applying a specific transition (e.g., "In Progress", "Done", "Closed").
You can specify the transition by ID or name. Use jira_get_transitions to discover available transitions first.
Optionally add a comment to document the transition.
Returns a confirmation message with the new status.
Requires Jira credentials to be configured.`,
		TransitionIssueToolArgs.shape,
		handleTransitionIssue,
	);

	methodLogger.debug('Successfully registered Jira transitions tools');
}

export default { registerTools };
