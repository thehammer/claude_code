"use strict";
/**
 * Helper functions for processing different ADF node types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAdfContent = processAdfContent;
exports.processMention = processMention;
exports.processAdfNode = processAdfNode;
exports.processParagraph = processParagraph;
exports.processHeading = processHeading;
exports.processBulletList = processBulletList;
exports.processOrderedList = processOrderedList;
exports.processListItem = processListItem;
exports.processCodeBlock = processCodeBlock;
exports.processBlockquote = processBlockquote;
exports.processMediaGroup = processMediaGroup;
exports.processMedia = processMedia;
exports.processTable = processTable;
exports.processText = processText;
exports.processInlineCard = processInlineCard;
exports.processEmoji = processEmoji;
exports.processDate = processDate;
exports.processStatus = processStatus;
/**
 * Process ADF content nodes
 */
function processAdfContent(content) {
    if (!content || !Array.isArray(content)) {
        return '';
    }
    return content.map((node) => processAdfNode(node)).join('\n\n');
}
/**
 * Process mention node
 */
function processMention(node) {
    if (!node.attrs) {
        return '';
    }
    const text = node.attrs.text || node.attrs.displayName || '';
    if (!text) {
        return '';
    }
    // Format as @username to preserve the mention format
    // Remove any existing @ symbol to avoid double @@ in the output
    const cleanText = typeof text === 'string' && text.startsWith('@')
        ? text.substring(1)
        : text;
    return `@${cleanText}`;
}
/**
 * Process a single ADF node
 */
function processAdfNode(node) {
    if (!node || !node.type) {
        return '';
    }
    switch (node.type) {
        case 'paragraph':
            return processParagraph(node);
        case 'heading':
            return processHeading(node);
        case 'bulletList':
            return processBulletList(node);
        case 'orderedList':
            return processOrderedList(node);
        case 'listItem':
            return processListItem(node);
        case 'codeBlock':
            return processCodeBlock(node);
        case 'blockquote':
            return processBlockquote(node);
        case 'rule':
            return '---';
        case 'mediaGroup':
            return processMediaGroup(node);
        case 'media':
            return processMedia(node);
        case 'table':
            return processTable(node);
        case 'text':
            return processText(node);
        case 'mention':
            return processMention(node);
        case 'inlineCard':
            return processInlineCard(node);
        case 'emoji':
            return processEmoji(node);
        case 'date':
            return processDate(node);
        case 'status':
            return processStatus(node);
        default:
            // For unknown node types, try to process content if available
            if (node.content) {
                return processAdfContent(node.content);
            }
            return '';
    }
}
/**
 * Process paragraph node
 */
function processParagraph(node) {
    if (!node.content) {
        return '';
    }
    // Process each child node and join them with proper spacing
    return node.content
        .map((childNode, index) => {
        // Add a space between text nodes if needed
        const needsSpace = index > 0 &&
            childNode.type === 'text' &&
            node.content[index - 1].type === 'text' &&
            !childNode.text?.startsWith(' ') &&
            !node.content[index - 1].text?.endsWith(' ');
        return (needsSpace ? ' ' : '') + processAdfNode(childNode);
    })
        .join('');
}
/**
 * Process heading node
 */
function processHeading(node) {
    if (!node.content || !node.attrs) {
        return '';
    }
    const level = typeof node.attrs.level === 'number' ? node.attrs.level : 1;
    const headingMarker = '#'.repeat(level);
    const content = node.content
        .map((childNode) => processAdfNode(childNode))
        .join('');
    return `${headingMarker} ${content}`;
}
/**
 * Process bullet list node
 */
function processBulletList(node) {
    if (!node.content) {
        return '';
    }
    return node.content.map((item) => processAdfNode(item)).join('\n');
}
/**
 * Process ordered list node
 */
function processOrderedList(node) {
    if (!node.content) {
        return '';
    }
    return node.content
        .map((item, index) => {
        const processedItem = processAdfNode(item);
        // Replace the first "- " with "1. ", "2. ", etc.
        return processedItem.replace(/^- /, `${index + 1}. `);
    })
        .join('\n');
}
/**
 * Process list item node
 */
function processListItem(node) {
    if (!node.content) {
        return '';
    }
    const content = node.content
        .map((childNode) => {
        const processed = processAdfNode(childNode);
        // For nested lists, add indentation
        if (childNode.type === 'bulletList' ||
            childNode.type === 'orderedList') {
            return processed
                .split('\n')
                .map((line) => `  ${line}`)
                .join('\n');
        }
        return processed;
    })
        .join('\n');
    return `- ${content}`;
}
/**
 * Process code block node
 */
function processCodeBlock(node) {
    if (!node.content) {
        return '```\n```';
    }
    const language = node.attrs?.language || '';
    const code = node.content
        .map((childNode) => processAdfNode(childNode))
        .join('');
    return `\`\`\`${language}\n${code}\n\`\`\``;
}
/**
 * Process blockquote node
 */
function processBlockquote(node) {
    if (!node.content) {
        return '';
    }
    const content = node.content
        .map((childNode) => processAdfNode(childNode))
        .join('\n\n');
    // Add > to each line
    return content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
}
/**
 * Process media group node
 */
function processMediaGroup(node) {
    if (!node.content) {
        return '';
    }
    return node.content
        .map((mediaNode) => {
        if (mediaNode.type === 'media' && mediaNode.attrs) {
            const { id, type } = mediaNode.attrs;
            if (type === 'file') {
                return `[Attachment: ${id}]`;
            }
            else if (type === 'link') {
                return `[External Link]`;
            }
        }
        return '';
    })
        .filter(Boolean)
        .join('\n');
}
/**
 * Process media node
 */
function processMedia(node) {
    if (!node.attrs) {
        return '';
    }
    // Handle file attachments
    if (node.attrs.type === 'file') {
        const id = node.attrs.id || '';
        const altText = node.attrs.alt ? node.attrs.alt : `Attachment: ${id}`;
        return `![${altText}](attachment:${id})`;
    }
    // Handle external media (e.g., YouTube embeds)
    if (node.attrs.type === 'external' && node.attrs.url) {
        return `[External Media](${node.attrs.url})`;
    }
    return '';
}
/**
 * Process table node
 */
function processTable(node) {
    if (!node.content) {
        return '';
    }
    const rows = [];
    // Process table rows
    node.content.forEach((row) => {
        if (row.type === 'tableRow' && row.content) {
            const cells = [];
            row.content.forEach((cell) => {
                if ((cell.type === 'tableCell' ||
                    cell.type === 'tableHeader') &&
                    cell.content) {
                    const cellContent = cell.content
                        .map((cellNode) => processAdfNode(cellNode))
                        .join('');
                    cells.push(cellContent.trim());
                }
            });
            if (cells.length > 0) {
                rows.push(cells);
            }
        }
    });
    if (rows.length === 0) {
        return '';
    }
    // Create markdown table
    const columnCount = Math.max(...rows.map((row) => row.length));
    // Ensure all rows have the same number of columns
    const normalizedRows = rows.map((row) => {
        while (row.length < columnCount) {
            row.push('');
        }
        return row;
    });
    // Create header row
    const headerRow = normalizedRows[0].map((cell) => cell || '');
    // Create separator row
    const separatorRow = headerRow.map(() => '---');
    // Create content rows
    const contentRows = normalizedRows.slice(1);
    // Build the table
    const tableRows = [
        headerRow.join(' | '),
        separatorRow.join(' | '),
        ...contentRows.map((row) => row.join(' | ')),
    ];
    return tableRows.join('\n');
}
/**
 * Process text node
 */
function processText(node) {
    if (!node.text) {
        return '';
    }
    let text = node.text;
    // Apply marks if available
    if (node.marks && node.marks.length > 0) {
        // Sort marks to ensure consistent application (process links last)
        const sortedMarks = [...node.marks].sort((a, b) => {
            if (a.type === 'link')
                return 1;
            if (b.type === 'link')
                return -1;
            return 0;
        });
        // Apply non-link marks first
        sortedMarks.forEach((mark) => {
            switch (mark.type) {
                case 'strong':
                    text = `**${text}**`;
                    break;
                case 'em':
                    text = `*${text}*`;
                    break;
                case 'code':
                    text = `\`${text}\``;
                    break;
                case 'strike':
                    text = `~~${text}~~`;
                    break;
                case 'underline':
                    // Markdown doesn't support underline, use emphasis instead
                    text = `_${text}_`;
                    break;
                case 'textColor':
                    // Ignore in Markdown (no equivalent)
                    break;
                case 'superscript':
                    // Some flavors of Markdown support ^superscript^
                    text = `^${text}^`;
                    break;
                case 'subscript':
                    // Some flavors of Markdown support ~subscript~
                    // but this conflicts with strikethrough
                    text = `~${text}~`;
                    break;
                case 'link':
                    if (mark.attrs && mark.attrs.href) {
                        text = `[${text}](${mark.attrs.href})`;
                    }
                    break;
            }
        });
    }
    return text;
}
/**
 * Process inline card node (references to Jira issues, Confluence pages, etc.)
 */
function processInlineCard(node) {
    if (!node.attrs) {
        return '[Link]';
    }
    const url = node.attrs.url || '';
    // Extract the name/ID from the URL if possible
    const match = url.match(/\/([^/]+)$/);
    const name = match ? match[1] : 'Link';
    return `[${name}](${url})`;
}
/**
 * Process emoji node
 */
function processEmoji(node) {
    if (!node.attrs) {
        return '';
    }
    // Return shortName if available, otherwise fallback
    return (node.attrs.shortName || node.attrs.id || '📝');
}
/**
 * Process date node
 */
function processDate(node) {
    if (!node.attrs) {
        return '';
    }
    return node.attrs.timestamp || '';
}
/**
 * Process status node
 */
function processStatus(node) {
    if (!node.attrs) {
        return '';
    }
    // Format as Markdown (emoji + text)
    const text = node.attrs.text || '';
    const color = node.attrs.color || '';
    // Map common status colors to emojis
    const colorEmoji = {
        green: '✅',
        yellow: '⚠️',
        red: '❌',
        blue: 'ℹ️',
        purple: '💜',
        default: '🔄',
    };
    const emoji = colorEmoji[color.toLowerCase()] || colorEmoji.default;
    return `${emoji} ${text}`;
}
