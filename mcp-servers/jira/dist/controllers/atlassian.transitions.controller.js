"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_atlassian_transitions_service_js_1 = __importDefault(require("../services/vendor.atlassian.transitions.service.js"));
const logger_util_js_1 = require("../utils/logger.util.js");
const error_handler_util_js_1 = require("../utils/error-handler.util.js");
const atlassian_transitions_formatter_js_1 = require("./atlassian.transitions.formatter.js");
const controllerLogger = logger_util_js_1.Logger.forContext('controllers/atlassian.transitions.controller.ts');
controllerLogger.debug('Jira transitions controller initialized');
/**
 * Get available transitions for a Jira issue.
 *
 * @param {GetTransitionsToolArgsType} options - Options including issueIdOrKey.
 * @returns {Promise<ControllerResponse>} Formatted list of transitions.
 */
async function getTransitions(options) {
    const methodLogger = controllerLogger.forMethod('getTransitions');
    methodLogger.debug('Getting Jira transitions...', options);
    try {
        const response = await vendor_atlassian_transitions_service_js_1.default.getTransitions({
            issueIdOrKey: options.issueIdOrKey,
        });
        const formattedContent = (0, atlassian_transitions_formatter_js_1.formatTransitionsList)(response.transitions, options.issueIdOrKey);
        return {
            content: formattedContent,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, {
            entityType: 'Transitions',
            operation: 'fetching',
            source: 'controllers/atlassian.transitions.controller.ts@getTransitions',
            additionalInfo: options,
        });
    }
}
/**
 * Transition a Jira issue to a new status.
 *
 * @param {TransitionIssueToolArgsType} options - Options including issueIdOrKey, transitionId, and optional comment.
 * @returns {Promise<ControllerResponse>} Success message.
 */
async function transitionIssue(options) {
    const methodLogger = controllerLogger.forMethod('transitionIssue');
    methodLogger.debug('Transitioning Jira issue...', options);
    try {
        // First, get the transition details to know what we're transitioning to
        const transitionsResponse = await vendor_atlassian_transitions_service_js_1.default.getTransitions({
            issueIdOrKey: options.issueIdOrKey,
        });
        // Find the transition by ID or name
        const transition = transitionsResponse.transitions.find((t) => t.id === options.transitionId ||
            t.name.toLowerCase() === options.transitionId.toLowerCase());
        if (!transition) {
            throw new Error(`Transition "${options.transitionId}" not found for issue ${options.issueIdOrKey}`);
        }
        // Perform the transition
        await vendor_atlassian_transitions_service_js_1.default.transitionIssue({
            issueIdOrKey: options.issueIdOrKey,
            transitionId: transition.id,
            comment: options.comment,
            fields: options.fields,
        });
        const formattedContent = (0, atlassian_transitions_formatter_js_1.formatTransitionSuccess)(options.issueIdOrKey, transition.name, transition.to.name);
        return {
            content: formattedContent,
        };
    }
    catch (error) {
        throw (0, error_handler_util_js_1.handleControllerError)(error, {
            entityType: 'Issue',
            operation: 'transitioning',
            source: 'controllers/atlassian.transitions.controller.ts@transitionIssue',
            additionalInfo: options,
        });
    }
}
exports.default = { getTransitions, transitionIssue };
