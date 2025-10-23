import atlassianTransitionsService from '../services/vendor.atlassian.transitions.service.js';
import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import {
	GetTransitionsToolArgsType,
	TransitionIssueToolArgsType,
} from '../tools/atlassian.transitions.types.js';
import {
	formatTransitionsList,
	formatTransitionSuccess,
} from './atlassian.transitions.formatter.js';
import { ControllerResponse } from '../types/common.types.js';

const controllerLogger = Logger.forContext(
	'controllers/atlassian.transitions.controller.ts',
);
controllerLogger.debug('Jira transitions controller initialized');

/**
 * Get available transitions for a Jira issue.
 *
 * @param {GetTransitionsToolArgsType} options - Options including issueIdOrKey.
 * @returns {Promise<ControllerResponse>} Formatted list of transitions.
 */
async function getTransitions(
	options: GetTransitionsToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = controllerLogger.forMethod('getTransitions');
	methodLogger.debug('Getting Jira transitions...', options);

	try {
		const response = await atlassianTransitionsService.getTransitions({
			issueIdOrKey: options.issueIdOrKey,
		});

		const formattedContent = formatTransitionsList(
			response.transitions,
			options.issueIdOrKey,
		);

		return {
			content: formattedContent,
		};
	} catch (error) {
		throw handleControllerError(error, {
			entityType: 'Transitions',
			operation: 'fetching',
			source: 'controllers/atlassian.transitions.controller.ts@getTransitions',
			additionalInfo: options as unknown as Record<string, unknown>,
		});
	}
}

/**
 * Transition a Jira issue to a new status.
 *
 * @param {TransitionIssueToolArgsType} options - Options including issueIdOrKey, transitionId, and optional comment.
 * @returns {Promise<ControllerResponse>} Success message.
 */
async function transitionIssue(
	options: TransitionIssueToolArgsType,
): Promise<ControllerResponse> {
	const methodLogger = controllerLogger.forMethod('transitionIssue');
	methodLogger.debug('Transitioning Jira issue...', options);

	try {
		// First, get the transition details to know what we're transitioning to
		const transitionsResponse = await atlassianTransitionsService.getTransitions({
			issueIdOrKey: options.issueIdOrKey,
		});

		// Find the transition by ID or name
		const transition = transitionsResponse.transitions.find(
			(t) =>
				t.id === options.transitionId ||
				t.name.toLowerCase() === options.transitionId.toLowerCase(),
		);

		if (!transition) {
			throw new Error(
				`Transition "${options.transitionId}" not found for issue ${options.issueIdOrKey}`,
			);
		}

		// Perform the transition
		await atlassianTransitionsService.transitionIssue({
			issueIdOrKey: options.issueIdOrKey,
			transitionId: transition.id,
			comment: options.comment,
			fields: options.fields,
		});

		const formattedContent = formatTransitionSuccess(
			options.issueIdOrKey,
			transition.name,
			transition.to.name,
		);

		return {
			content: formattedContent,
		};
	} catch (error) {
		throw handleControllerError(error, {
			entityType: 'Issue',
			operation: 'transitioning',
			source: 'controllers/atlassian.transitions.controller.ts@transitionIssue',
			additionalInfo: options as unknown as Record<string, unknown>,
		});
	}
}

export default { getTransitions, transitionIssue };
