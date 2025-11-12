/**
 * Get options for a custom field
 * @param fieldId Custom field ID (numeric part only, e.g., "10275")
 * @param startAt Starting index for pagination
 * @param maxResults Maximum results to return
 * @returns Formatted custom field options response
 */
declare function getCustomFieldOptions(fieldId: string, startAt?: number, maxResults?: number): Promise<{
    content: string;
}>;
declare const _default: {
    getCustomFieldOptions: typeof getCustomFieldOptions;
};
export default _default;
