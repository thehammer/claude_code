/**
 * Interface for Atlassian API credentials
 */
export interface AtlassianCredentials {
    siteName: string;
    userEmail: string;
    apiToken: string;
}
/**
 * Interface for HTTP request options
 */
export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
}
/**
 * Get Atlassian credentials from environment variables
 * @returns AtlassianCredentials object or null if credentials are missing
 */
export declare function getAtlassianCredentials(): AtlassianCredentials | null;
/**
 * Fetch data from Atlassian API
 * @param credentials Atlassian API credentials
 * @param path API endpoint path (without base URL)
 * @param options Request options
 * @returns Response data
 */
export declare function fetchAtlassian<T>(credentials: AtlassianCredentials, path: string, options?: RequestOptions): Promise<T>;
