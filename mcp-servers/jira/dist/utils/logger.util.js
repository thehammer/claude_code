"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
/**
 * Format a timestamp for logging
 * @returns Formatted timestamp [HH:MM:SS]
 */
function getTimestamp() {
    const now = new Date();
    return `[${now.toISOString().split('T')[1].split('.')[0]}]`;
}
/**
 * Safely convert object to string with size limits
 * @param obj Object to stringify
 * @param maxLength Maximum length of the resulting string
 * @returns Safely stringified object
 */
function safeStringify(obj, maxLength = 1000) {
    try {
        const str = JSON.stringify(obj);
        if (str.length <= maxLength) {
            return str;
        }
        return `${str.substring(0, maxLength)}... (truncated, ${str.length} chars total)`;
    }
    catch {
        return '[Object cannot be stringified]';
    }
}
/**
 * Extract essential values from larger objects for logging
 * @param obj The object to extract values from
 * @param keys Keys to extract (if available)
 * @returns Object containing only the specified keys
 */
function extractEssentialValues(obj, keys) {
    const result = {};
    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    });
    return result;
}
/**
 * Format source path consistently using the standardized format:
 * [module/file.ts@function] or [module/file.ts]
 *
 * @param filePath File path (with or without src/ prefix)
 * @param functionName Optional function name
 * @returns Formatted source path according to standard pattern
 */
function formatSourcePath(filePath, functionName) {
    // Always strip 'src/' prefix for consistency
    const normalizedPath = filePath.replace(/^src\//, '');
    return functionName
        ? `[${normalizedPath}@${functionName}]`
        : `[${normalizedPath}]`;
}
/**
 * Check if debug logging is enabled for a specific module
 *
 * This function parses the DEBUG environment variable to determine if a specific
 * module should have debug logging enabled. The DEBUG variable can be:
 * - 'true' or '1': Enable all debug logging
 * - Comma-separated list of modules: Enable debug only for those modules
 * - Module patterns with wildcards: e.g., 'controllers/*' enables all controllers
 *
 * Examples:
 * - DEBUG=true
 * - DEBUG=controllers/*,services/aws.sso.auth.service.ts
 * - DEBUG=transport,utils/formatter*
 *
 * @param modulePath The module path to check against DEBUG patterns
 * @returns true if debug is enabled for this module, false otherwise
 */
function isDebugEnabledForModule(modulePath) {
    const debugEnv = process.env.DEBUG;
    if (!debugEnv) {
        return false;
    }
    // If debug is set to true or 1, enable all debug logging
    if (debugEnv === 'true' || debugEnv === '1') {
        return true;
    }
    // Parse comma-separated debug patterns
    const debugPatterns = debugEnv.split(',').map((p) => p.trim());
    // Check if the module matches any pattern
    return debugPatterns.some((pattern) => {
        // Convert glob-like patterns to regex
        // * matches anything within a path segment
        // ** matches across path segments
        const regexPattern = pattern
            .replace(/\*/g, '.*') // Convert * to regex .*
            .replace(/\?/g, '.'); // Convert ? to regex .
        const regex = new RegExp(`^${regexPattern}$`);
        return (regex.test(modulePath) ||
            // Check for pattern matches without the 'src/' prefix
            regex.test(modulePath.replace(/^src\//, '')));
    });
}
// Generate a unique session ID for this process
const SESSION_ID = crypto.randomUUID();
// Get the package name from environment variables or default to 'mcp-server'
const getPkgName = () => {
    try {
        // Try to get it from package.json first if available
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.name) {
                // Extract the last part of the name if it's scoped
                const match = packageJson.name.match(/(@[\w-]+\/)?(.+)/);
                return match ? match[2] : packageJson.name;
            }
        }
    }
    catch {
        // Silently fail and use default
    }
    // Fallback to environment variable or default
    return process.env.PACKAGE_NAME || 'mcp-server';
};
// MCP logs directory setup
const HOME_DIR = os.homedir();
const MCP_DATA_DIR = path.join(HOME_DIR, '.mcp', 'data');
const CLI_NAME = getPkgName();
// Ensure the MCP data directory exists
if (!fs.existsSync(MCP_DATA_DIR)) {
    fs.mkdirSync(MCP_DATA_DIR, { recursive: true });
}
// Create the log file path with session ID
const LOG_FILENAME = `${CLI_NAME}.${SESSION_ID}.log`;
const LOG_FILEPATH = path.join(MCP_DATA_DIR, LOG_FILENAME);
// Write initial log header
fs.writeFileSync(LOG_FILEPATH, `# ${CLI_NAME} Log Session\n` +
    `Session ID: ${SESSION_ID}\n` +
    `Started: ${new Date().toISOString()}\n` +
    `Process ID: ${process.pid}\n` +
    `Working Directory: ${process.cwd()}\n` +
    `Command: ${process.argv.join(' ')}\n\n` +
    `## Log Entries\n\n`, 'utf8');
// Logger singleton to track initialization
let isLoggerInitialized = false;
/**
 * Logger class for consistent logging across the application.
 *
 * RECOMMENDED USAGE:
 *
 * 1. Create a file-level logger using the static forContext method:
 *    ```
 *    const logger = Logger.forContext('controllers/myController.ts');
 *    ```
 *
 * 2. For method-specific logging, create a method logger:
 *    ```
 *    const methodLogger = Logger.forContext('controllers/myController.ts', 'myMethod');
 *    ```
 *
 * 3. Avoid using raw string prefixes in log messages. Instead, use contextualized loggers.
 *
 * 4. For debugging objects, use the debugResponse method to log only essential properties.
 *
 * 5. Set DEBUG environment variable to control which modules show debug logs:
 *    - DEBUG=true (enable all debug logs)
 *    - DEBUG=controllers/*,services/* (enable for specific module groups)
 *    - DEBUG=transport,utils/formatter* (enable specific modules, supports wildcards)
 */
class Logger {
    constructor(context, modulePath = '') {
        this.context = context;
        this.modulePath = modulePath;
        // Log initialization message only once
        if (!isLoggerInitialized) {
            this.info(`Logger initialized with session ID: ${Logger.sessionId}`);
            this.info(`Logs will be saved to: ${Logger.logFilePath}`);
            isLoggerInitialized = true;
        }
    }
    /**
     * Create a contextualized logger for a specific file or component.
     * This is the preferred method for creating loggers.
     *
     * @param filePath The file path (e.g., 'controllers/aws.sso.auth.controller.ts')
     * @param functionName Optional function name for more specific context
     * @returns A new Logger instance with the specified context
     *
     * @example
     * // File-level logger
     * const logger = Logger.forContext('controllers/myController.ts');
     *
     * // Method-level logger
     * const methodLogger = Logger.forContext('controllers/myController.ts', 'myMethod');
     */
    static forContext(filePath, functionName) {
        return new Logger(formatSourcePath(filePath, functionName), filePath);
    }
    /**
     * Create a method level logger from a context logger
     * @param method Method name
     * @returns A new logger with the method context
     */
    forMethod(method) {
        return Logger.forContext(this.modulePath, method);
    }
    _formatMessage(message) {
        return this.context ? `${this.context} ${message}` : message;
    }
    _formatArgs(args) {
        // If the first argument is an object and not an Error, safely stringify it
        if (args.length > 0 &&
            typeof args[0] === 'object' &&
            args[0] !== null &&
            !(args[0] instanceof Error)) {
            args[0] = safeStringify(args[0]);
        }
        return args;
    }
    _log(level, message, ...args) {
        // Skip debug messages if not enabled for this module
        if (level === 'debug' && !isDebugEnabledForModule(this.modulePath)) {
            return;
        }
        const timestamp = getTimestamp();
        const prefix = `${timestamp} [${level.toUpperCase()}]`;
        let logMessage = `${prefix} ${this._formatMessage(message)}`;
        const formattedArgs = this._formatArgs(args);
        if (formattedArgs.length > 0) {
            // Handle errors specifically
            if (formattedArgs[0] instanceof Error) {
                const error = formattedArgs[0];
                logMessage += ` Error: ${error.message}`;
                if (error.stack) {
                    logMessage += `\n${error.stack}`;
                }
                // If there are more args, add them after the error
                if (formattedArgs.length > 1) {
                    logMessage += ` ${formattedArgs
                        .slice(1)
                        .map((arg) => typeof arg === 'string' ? arg : safeStringify(arg))
                        .join(' ')}`;
                }
            }
            else {
                logMessage += ` ${formattedArgs
                    .map((arg) => typeof arg === 'string' ? arg : safeStringify(arg))
                    .join(' ')}`;
            }
        }
        // Write to log file
        try {
            fs.appendFileSync(Logger.logFilePath, `${logMessage}\n`, 'utf8');
        }
        catch (err) {
            // If we can't write to the log file, log the error to console
            console.error(`Failed to write to log file: ${err}`);
        }
        if (process.env.NODE_ENV === 'test') {
            console[level](logMessage);
        }
        else {
            console.error(logMessage);
        }
    }
    info(message, ...args) {
        this._log('info', message, ...args);
    }
    warn(message, ...args) {
        this._log('warn', message, ...args);
    }
    error(message, ...args) {
        this._log('error', message, ...args);
    }
    debug(message, ...args) {
        this._log('debug', message, ...args);
    }
    /**
     * Log essential information about an API response
     * @param message Log message
     * @param response API response object
     * @param essentialKeys Keys to extract from the response
     */
    debugResponse(message, response, essentialKeys) {
        const essentialInfo = extractEssentialValues(response, essentialKeys);
        this.debug(message, essentialInfo);
    }
    /**
     * Get the current session ID
     * @returns The UUID for the current logging session
     */
    static getSessionId() {
        return Logger.sessionId;
    }
    /**
     * Get the current log file path
     * @returns The path to the current log file
     */
    static getLogFilePath() {
        return Logger.logFilePath;
    }
}
exports.Logger = Logger;
Logger.sessionId = SESSION_ID;
Logger.logFilePath = LOG_FILEPATH;
