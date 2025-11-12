/**
 * Utility for testing CLI commands with real execution
 */
export declare class CliTestUtil {
    /**
     * Executes a CLI command and returns the result
     *
     * @param args - CLI arguments to pass to the command
     * @param options - Test options
     * @returns Promise with stdout, stderr, and exit code
     */
    static runCommand(args: string[], options?: {
        timeoutMs?: number;
        env?: Record<string, string>;
    }): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
    /**
     * Validates that stdout contains expected strings/patterns
     */
    static validateOutputContains(output: string, expectedPatterns: (string | RegExp)[]): void;
    /**
     * Validates Markdown output format
     */
    static validateMarkdownOutput(output: string): void;
}
