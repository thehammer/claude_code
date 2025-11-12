/**
 * Configuration loader that handles multiple sources with priority:
 * 1. Direct ENV pass (process.env)
 * 2. .env file in project root
 * 3. Global config file at $HOME/.mcp/configs.json
 */
declare class ConfigLoader {
    private packageName;
    private configLoaded;
    /**
     * Create a new ConfigLoader instance
     * @param packageName The package name to use for global config lookup
     */
    constructor(packageName: string);
    /**
     * Load configuration from all sources with proper priority
     */
    load(): void;
    /**
     * Load configuration from .env file in project root
     */
    private loadFromEnvFile;
    /**
     * Load configuration from global config file at $HOME/.mcp/configs.json
     */
    private loadFromGlobalConfig;
    /**
     * Get a configuration value
     * @param key The configuration key
     * @param defaultValue The default value if the key is not found
     * @returns The configuration value or the default value
     */
    get(key: string, defaultValue?: string): string | undefined;
    /**
     * Get a boolean configuration value
     * @param key The configuration key
     * @param defaultValue The default value if the key is not found
     * @returns The boolean configuration value or the default value
     */
    getBoolean(key: string, defaultValue?: boolean): boolean;
}
export declare const config: ConfigLoader;
export {};
