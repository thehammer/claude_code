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
declare class Logger {
    private context?;
    private modulePath;
    private static sessionId;
    private static logFilePath;
    constructor(context?: string, modulePath?: string);
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
    static forContext(filePath: string, functionName?: string): Logger;
    /**
     * Create a method level logger from a context logger
     * @param method Method name
     * @returns A new logger with the method context
     */
    forMethod(method: string): Logger;
    private _formatMessage;
    private _formatArgs;
    _log(level: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    /**
     * Log essential information about an API response
     * @param message Log message
     * @param response API response object
     * @param essentialKeys Keys to extract from the response
     */
    debugResponse(message: string, response: Record<string, unknown>, essentialKeys: string[]): void;
    /**
     * Get the current session ID
     * @returns The UUID for the current logging session
     */
    static getSessionId(): string;
    /**
     * Get the current log file path
     * @returns The path to the current log file
     */
    static getLogFilePath(): string;
}
export { Logger };
