import { z } from 'zod';
export declare const skipValidation: boolean;
/**
 * Validates API response against a Zod schema
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @param context Context for error messages (e.g., "issue details", "issue list")
 * @param serviceIdentifier Optional service identifier for more specific logging
 * @returns The validated data
 * @throws {McpError} If validation fails
 */
export declare function validateResponse<T>(data: unknown, schema: z.ZodType<T>, context: string, serviceIdentifier?: string): T;
