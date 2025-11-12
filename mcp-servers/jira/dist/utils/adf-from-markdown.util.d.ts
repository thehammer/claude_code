/**
 * Converts Markdown to Atlassian Document Format (ADF)
 */
import { AdfDocument } from './adf-types.util.js';
/**
 * Convert Markdown text to an Atlassian Document Format (ADF) document
 * Supports a wide range of Markdown formatting:
 * - Headings (# text) converted to proper ADF heading nodes with levels 1-6
 * - Bold (**text**)
 * - Italic (*text*)
 * - Code (`text`)
 * - Strikethrough (~~text~~)
 * - Links ([text](url))
 * - Unordered lists (- item or * item)
 * - Ordered lists (1. item)
 * - Blockquotes (> text)
 * - Code blocks (```language\ncode\n```)
 * - Horizontal rules (---, ***, ___)
 * - Tables (| Column | Column |)
 *
 * @param markdown - Markdown text to convert to ADF
 * @returns ADF document object
 */
export declare function markdownToAdf(markdown: string): AdfDocument;
