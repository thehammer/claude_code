"use strict";
/**
 * Converts Atlassian Document Format (ADF) to Markdown
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.adfToMarkdown = adfToMarkdown;
const logger_util_js_1 = require("./logger.util.js");
const adf_node_processors_util_js_1 = require("./adf-node-processors.util.js");
const toMarkdownLogger = logger_util_js_1.Logger.forContext('utils/adf-to-markdown.util.ts');
/**
 * Convert Atlassian Document Format (ADF) to Markdown
 *
 * @param adf - The ADF content to convert (can be string or object)
 * @returns The converted Markdown content
 */
function adfToMarkdown(adf) {
    const methodLogger = toMarkdownLogger.forMethod('adfToMarkdown');
    try {
        // Handle empty or undefined input
        if (!adf) {
            return '';
        }
        // Parse ADF if it's a string
        let adfDoc;
        if (typeof adf === 'string') {
            try {
                adfDoc = JSON.parse(adf);
            }
            catch {
                return adf; // Return as-is if not valid JSON
            }
        }
        else if (typeof adf === 'object') {
            adfDoc = adf;
        }
        else {
            return String(adf);
        }
        // Check if it's a valid ADF document
        if (!adfDoc.content || !Array.isArray(adfDoc.content)) {
            return '';
        }
        // Process the document
        const markdown = (0, adf_node_processors_util_js_1.processAdfContent)(adfDoc.content);
        methodLogger.debug(`Converted ADF to Markdown, length: ${markdown.length}`);
        return markdown;
    }
    catch (error) {
        methodLogger.error('Error converting ADF to Markdown:', error);
        return '*Error converting description format*';
    }
}
