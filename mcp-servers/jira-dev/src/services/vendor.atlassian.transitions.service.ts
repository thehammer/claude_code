import { Logger } from '../utils/logger.util.js';
import {
	fetchAtlassian,
	getAtlassianCredentials,
} from '../utils/transport.util.js';
import {
	JiraTransitionsResponse,
	JiraTransitionsResponseSchema,
	GetTransitionsParams,
	TransitionIssueParams,
} from './vendor.atlassian.transitions.types.js';
import { createAuthMissingError, McpError } from '../utils/error.util.js';
import { validateResponse } from '../utils/validation.util.js';

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext(
	'services/vendor.atlassian.transitions.service.ts',
);

const API_PATH = '/rest/api/3';

/**
 * Get available transitions for a Jira issue.
 *
 * @param {GetTransitionsParams} params - Parameters including issueIdOrKey.
 * @returns {Promise<JiraTransitionsResponse>} Raw API response with available transitions.
 * @throws {Error} If credentials are missing or API request fails.
 */
async function getTransitions(
	params: GetTransitionsParams,
): Promise<JiraTransitionsResponse> {
	const methodLogger = serviceLogger.forMethod('getTransitions');
	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError('Get transitions');
	}

	const { issueIdOrKey } = params;
	methodLogger.debug(`Fetching transitions for issue: ${issueIdOrKey}`);

	const path = `${API_PATH}/issue/${encodeURIComponent(issueIdOrKey)}/transitions`;

	try {
		const rawData = await fetchAtlassian(credentials, path);
		return validateResponse(
			rawData,
			JiraTransitionsResponseSchema,
			`transitions for ${issueIdOrKey}`,
			'transitions.service',
		);
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian or validation
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(
			`Unexpected error fetching transitions for issue ${issueIdOrKey}:`,
			error,
		);
		throw error;
	}
}

/**
 * Transition a Jira issue to a new status.
 *
 * @param {TransitionIssueParams} params - Parameters including issueIdOrKey, transitionId, optional comment and fields.
 * @returns {Promise<void>} Resolves when transition is successful.
 * @throws {Error} If credentials are missing or API request fails.
 */
async function transitionIssue(
	params: TransitionIssueParams,
): Promise<void> {
	const methodLogger = serviceLogger.forMethod('transitionIssue');
	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw createAuthMissingError('Transition issue');
	}

	const { issueIdOrKey, transitionId, comment, fields } = params;
	methodLogger.debug(
		`Transitioning issue ${issueIdOrKey} with transition ID: ${transitionId}`,
	);

	const path = `${API_PATH}/issue/${encodeURIComponent(issueIdOrKey)}/transitions`;

	// Build request body
	const body: {
		transition: { id: string };
		update?: { comment?: Array<{ add: { body: unknown } }> };
		fields?: Record<string, unknown>;
	} = {
		transition: { id: transitionId },
	};

	// Add comment if provided
	if (comment) {
		body.update = {
			comment: [
				{
					add: {
						body: {
							type: 'doc',
							version: 1,
							content: [
								{
									type: 'paragraph',
									content: [
										{
											type: 'text',
											text: comment,
										},
									],
								},
							],
						},
					},
				},
			],
		};
	}

	// Add fields if provided
	if (fields) {
		body.fields = fields;
	}

	try {
		await fetchAtlassian(credentials, path, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		methodLogger.debug(
			`Successfully transitioned issue ${issueIdOrKey}`,
		);
	} catch (error) {
		// McpError is already properly structured from fetchAtlassian
		if (error instanceof McpError) {
			throw error;
		}

		// Unexpected errors need to be wrapped
		methodLogger.error(
			`Unexpected error transitioning issue ${issueIdOrKey}:`,
			error,
		);
		throw error;
	}
}

export default { getTransitions, transitionIssue };
