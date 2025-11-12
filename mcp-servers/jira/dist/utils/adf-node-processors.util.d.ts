/**
 * Helper functions for processing different ADF node types
 */
import { AdfNode } from './adf-types.util.js';
/**
 * Process ADF content nodes
 */
export declare function processAdfContent(content: AdfNode[]): string;
/**
 * Process mention node
 */
export declare function processMention(node: AdfNode): string;
/**
 * Process a single ADF node
 */
export declare function processAdfNode(node: AdfNode): string;
/**
 * Process paragraph node
 */
export declare function processParagraph(node: AdfNode): string;
/**
 * Process heading node
 */
export declare function processHeading(node: AdfNode): string;
/**
 * Process bullet list node
 */
export declare function processBulletList(node: AdfNode): string;
/**
 * Process ordered list node
 */
export declare function processOrderedList(node: AdfNode): string;
/**
 * Process list item node
 */
export declare function processListItem(node: AdfNode): string;
/**
 * Process code block node
 */
export declare function processCodeBlock(node: AdfNode): string;
/**
 * Process blockquote node
 */
export declare function processBlockquote(node: AdfNode): string;
/**
 * Process media group node
 */
export declare function processMediaGroup(node: AdfNode): string;
/**
 * Process media node
 */
export declare function processMedia(node: AdfNode): string;
/**
 * Process table node
 */
export declare function processTable(node: AdfNode): string;
/**
 * Process text node
 */
export declare function processText(node: AdfNode): string;
/**
 * Process inline card node (references to Jira issues, Confluence pages, etc.)
 */
export declare function processInlineCard(node: AdfNode): string;
/**
 * Process emoji node
 */
export declare function processEmoji(node: AdfNode): string;
/**
 * Process date node
 */
export declare function processDate(node: AdfNode): string;
/**
 * Process status node
 */
export declare function processStatus(node: AdfNode): string;
