"use strict";
/**
 * Default values for pagination across the application.
 * These values should be used consistently throughout the codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_DEFAULTS = exports.DEFAULT_PAGE_SIZE = void 0;
exports.applyDefaults = applyDefaults;
/**
 * Default page size for all list operations.
 * This value determines how many items are returned in a single page by default.
 */
exports.DEFAULT_PAGE_SIZE = 25;
/**
 * Default values for project operations
 */
exports.PROJECT_DEFAULTS = {
    /**
     * Whether to include project components by default
     */
    INCLUDE_COMPONENTS: true,
    /**
     * Whether to include project versions by default
     */
    INCLUDE_VERSIONS: true,
};
const logger_util_js_1 = require("./logger.util.js");
const logger = logger_util_js_1.Logger.forContext('utils/defaults.util.ts');
/**
 * Apply default values to options object.
 * This utility ensures that default values are consistently applied.
 *
 * @param options Options object that may have some values undefined
 * @param defaults Default values to apply when options values are undefined
 * @returns Options object with default values applied
 *
 * @example
 * const options = applyDefaults({ limit: 10 }, { limit: DEFAULT_PAGE_SIZE, includeDetails: true });
 * // Result: { limit: 10, includeDetails: true }
 */
function applyDefaults(options, defaults) {
    const methodLogger = logger.forMethod('applyDefaults');
    // Log input
    methodLogger.debug('Options:', options);
    methodLogger.debug('Defaults:', defaults);
    // Filter out undefined values from the provided options
    const definedOptions = Object.fromEntries(Object.entries(options).filter(([_, value]) => value !== undefined));
    methodLogger.debug('Defined options:', definedOptions);
    // Merge defaults and defined options
    const result = {
        ...defaults,
        ...definedOptions,
    };
    // Log final result
    methodLogger.debug('Result:', result);
    return result;
}
