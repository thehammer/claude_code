import { Command } from 'commander';
/**
 * Register Jira Issues CLI commands with the Commander program
 * @param program - The Commander program instance to register commands with
 * @throws Error if command registration fails
 */
declare function register(program: Command): void;
declare const _default: {
    register: typeof register;
};
export default _default;
