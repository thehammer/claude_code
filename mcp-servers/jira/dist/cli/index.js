"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
const commander_1 = require("commander");
const logger_util_js_1 = require("../utils/logger.util.js");
const constants_util_js_1 = require("../utils/constants.util.js");
const atlassian_projects_cli_js_1 = __importDefault(require("./atlassian.projects.cli.js"));
const atlassian_issues_cli_js_1 = __importDefault(require("./atlassian.issues.cli.js"));
const atlassian_statuses_cli_js_1 = __importDefault(require("./atlassian.statuses.cli.js"));
const atlassian_comments_cli_js_1 = __importDefault(require("./atlassian.comments.cli.js"));
const atlassian_worklogs_cli_js_1 = __importDefault(require("./atlassian.worklogs.cli.js"));
// Package description
const DESCRIPTION = 'A Model Context Protocol (MCP) server for Atlassian Jira integration';
// Create a contextualized logger for this file
const cliLogger = logger_util_js_1.Logger.forContext('cli/index.ts');
// Log CLI module initialization
cliLogger.debug('Jira CLI module initialized');
async function runCli(args) {
    const methodLogger = logger_util_js_1.Logger.forContext('cli/index.ts', 'runCli');
    methodLogger.debug('Running CLI with arguments', args);
    const program = new commander_1.Command();
    program.name(constants_util_js_1.CLI_NAME).description(DESCRIPTION).version(constants_util_js_1.VERSION);
    // Register CLI commands
    atlassian_projects_cli_js_1.default.register(program);
    cliLogger.debug('Projects commands registered');
    atlassian_issues_cli_js_1.default.register(program);
    cliLogger.debug('Issues commands registered');
    atlassian_statuses_cli_js_1.default.register(program);
    cliLogger.debug('Statuses commands registered');
    atlassian_comments_cli_js_1.default.register(program);
    cliLogger.debug('Comments commands registered');
    atlassian_worklogs_cli_js_1.default.register(program);
    cliLogger.debug('Worklogs commands registered');
    // Handle unknown commands
    program.on('command:*', (operands) => {
        methodLogger.error(`Unknown command: ${operands[0]}`);
        console.log('');
        program.help();
        process.exit(1);
    });
    // Parse arguments; default to help if no command provided
    await program.parseAsync(args.length ? args : ['--help'], { from: 'user' });
    methodLogger.debug('CLI command execution completed');
}
