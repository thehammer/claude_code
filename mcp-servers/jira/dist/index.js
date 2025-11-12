#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const logger_util_js_1 = require("./utils/logger.util.js");
const config_util_js_1 = require("./utils/config.util.js");
const constants_util_js_1 = require("./utils/constants.util.js");
const index_js_1 = require("./cli/index.js");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Import Jira-specific tools
const atlassian_projects_tool_js_1 = __importDefault(require("./tools/atlassian.projects.tool.js"));
const atlassian_issues_tool_js_1 = __importDefault(require("./tools/atlassian.issues.tool.js"));
const atlassian_issues_create_tool_js_1 = __importDefault(require("./tools/atlassian.issues.create.tool.js"));
const atlassian_statuses_tool_js_1 = __importDefault(require("./tools/atlassian.statuses.tool.js"));
const atlassian_comments_tool_js_1 = __importDefault(require("./tools/atlassian.comments.tool.js"));
const atlassian_worklogs_tool_js_1 = __importDefault(require("./tools/atlassian.worklogs.tool.js"));
const atlassian_transitions_tool_js_1 = __importDefault(require("./tools/atlassian.transitions.tool.js"));
// Create a contextualized logger for this file
const indexLogger = logger_util_js_1.Logger.forContext('index.ts');
// Log initialization at debug level
indexLogger.debug('Jira MCP server module loaded');
let serverInstance = null;
let transportInstance = null;
/**
 * Start the MCP server with the specified transport mode
 *
 * @param mode The transport mode to use (stdio or sse)
 * @returns Promise that resolves to the server instance when started successfully
 */
async function startServer(mode = 'stdio') {
    // Create method-level logger with more specific context
    const serverLogger = logger_util_js_1.Logger.forContext('index.ts', 'startServer');
    // Load configuration
    serverLogger.info('Starting MCP server initialization...');
    config_util_js_1.config.load();
    serverLogger.info('Configuration loaded successfully');
    // Enable debug logging if DEBUG is set to true
    if (config_util_js_1.config.getBoolean('DEBUG')) {
        serverLogger.debug('Debug mode enabled');
    }
    // Log debug configuration settings at debug level
    serverLogger.debug(`DEBUG environment variable: ${process.env.DEBUG}`);
    serverLogger.debug(`ATLASSIAN_API_TOKEN exists: ${Boolean(process.env.ATLASSIAN_API_TOKEN)}`);
    serverLogger.debug(`Config DEBUG value: ${config_util_js_1.config.get('DEBUG')}`);
    serverLogger.info(`Initializing Jira MCP server v${constants_util_js_1.VERSION}`);
    serverInstance = new mcp_js_1.McpServer({
        name: constants_util_js_1.PACKAGE_NAME,
        version: constants_util_js_1.VERSION,
    });
    // Register tools
    serverLogger.info('Registering MCP tools...');
    atlassian_projects_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Projects tools');
    atlassian_issues_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Issues tools');
    atlassian_issues_create_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Issues Create tools');
    atlassian_statuses_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Statuses tools');
    atlassian_comments_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Comments tools');
    atlassian_worklogs_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Worklogs tools');
    atlassian_transitions_tool_js_1.default.registerTools(serverInstance);
    serverLogger.debug('Registered Transitions tools');
    serverLogger.info('All tools registered successfully');
    if (mode === 'stdio') {
        serverLogger.info('Using STDIO transport for MCP communication');
        transportInstance = new stdio_js_1.StdioServerTransport();
        try {
            await serverInstance.connect(transportInstance);
            serverLogger.info('MCP server started successfully on STDIO transport');
            setupGracefulShutdown();
            return serverInstance;
        }
        catch (err) {
            serverLogger.error('Failed to start server on STDIO transport', err);
            process.exit(1);
        }
    }
    else {
        // HTTP Transport with Express
        serverLogger.info('Using Streamable HTTP transport for MCP communication');
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        const mcpEndpoint = '/mcp';
        serverLogger.debug(`MCP endpoint: ${mcpEndpoint}`);
        // Create transport instance
        const transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });
        // Connect server to transport
        await serverInstance.connect(transport);
        transportInstance = transport;
        // Handle all MCP requests
        app.all(mcpEndpoint, (req, res) => {
            transport
                .handleRequest(req, res, req.body)
                .catch((err) => {
                serverLogger.error('Error in transport.handleRequest', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Internal Server Error',
                    });
                }
            });
        });
        // Health check endpoint
        app.get('/', (_req, res) => {
            res.send(`Jira MCP Server v${constants_util_js_1.VERSION} is running`);
        });
        // Start HTTP server
        const PORT = Number(process.env.PORT ?? 3000);
        await new Promise((resolve) => {
            app.listen(PORT, () => {
                serverLogger.info(`HTTP transport listening on http://localhost:${PORT}${mcpEndpoint}`);
                resolve();
            });
        });
        setupGracefulShutdown();
        return serverInstance;
    }
}
/**
 * Main entry point - this will run when executed directly
 * Determines whether to run in CLI or server mode based on command-line arguments
 */
async function main() {
    const mainLogger = logger_util_js_1.Logger.forContext('index.ts', 'main');
    // Load configuration
    config_util_js_1.config.load();
    // CLI mode - if any arguments are provided
    if (process.argv.length > 2) {
        mainLogger.info(`Starting ${constants_util_js_1.PACKAGE_NAME} v${constants_util_js_1.VERSION} in CLI mode`);
        await (0, index_js_1.runCli)(process.argv.slice(2));
        mainLogger.info('CLI execution completed successfully');
        return;
    }
    // Server mode - determine transport
    const transportMode = (process.env.TRANSPORT_MODE || 'stdio').toLowerCase();
    let mode;
    if (transportMode === 'stdio') {
        mode = 'stdio';
    }
    else if (transportMode === 'http') {
        mode = 'http';
    }
    else {
        mainLogger.warn(`Unknown TRANSPORT_MODE "${transportMode}", defaulting to stdio`);
        mode = 'stdio';
    }
    mainLogger.info(`Starting server with ${mode.toUpperCase()} transport`);
    await startServer(mode);
    mainLogger.info('Server is now running');
}
/**
 * Set up graceful shutdown handlers for the server
 */
function setupGracefulShutdown() {
    const shutdownLogger = logger_util_js_1.Logger.forContext('index.ts', 'shutdown');
    const shutdown = async () => {
        try {
            shutdownLogger.info('Shutting down gracefully...');
            if (transportInstance &&
                'close' in transportInstance &&
                typeof transportInstance.close === 'function') {
                await transportInstance.close();
            }
            if (serverInstance && typeof serverInstance.close === 'function') {
                await serverInstance.close();
            }
            process.exit(0);
        }
        catch (err) {
            shutdownLogger.error('Error during shutdown', err);
            process.exit(1);
        }
    };
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, shutdown);
    });
}
// If this file is being executed directly (not imported), run the main function
if (require.main === module) {
    main().catch((err) => {
        indexLogger.error('Unhandled error in main process', err);
        process.exit(1);
    });
}
