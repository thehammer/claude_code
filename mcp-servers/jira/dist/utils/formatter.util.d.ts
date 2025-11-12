import { ResponsePagination } from '../types/common.types.js';
/**
 * Markdown formatting utilities
 */
/**
 * Standardized formatting utilities for consistent output across all CLI and Tool interfaces.
 * These functions should be used by all formatters to ensure consistent formatting.
 */
/**
 * Format a URL as a markdown link
 * @param url - URL to format
 * @param title - Link title
 * @returns Formatted markdown link
 */
export declare function formatUrl(url?: string, title?: string): string;
/**
 * Format a heading with consistent style
 * @param text - Heading text
 * @param level - Heading level (1-6)
 * @returns Formatted heading
 */
export declare function formatHeading(text: string, level?: number): string;
/**
 * Format a list of key-value pairs as a bullet list
 * @param items - Object with key-value pairs
 * @param keyFormatter - Optional function to format keys
 * @returns Formatted bullet list
 */
export declare function formatBulletList(items: Record<string, unknown>, keyFormatter?: (key: string) => string): string;
/**
 * Format a separator line
 * @returns Separator line
 */
export declare function formatSeparator(): string;
/**
 * Format a numbered list of items
 * @param items - Array of items to format
 * @param formatter - Function to format each item
 * @returns Formatted numbered list
 */
export declare function formatNumberedList<T>(items: T[], formatter: (item: T, index: number) => string): string;
/**
 * Format a date in a standardized way: YYYY-MM-DD HH:MM:SS UTC
 * @param dateInput - ISO date string, Date object, or timestamp number
 * @returns Formatted date string
 */
export declare function formatDate(dateInput?: string | Date | number): string;
/**
 * Format pagination information in a standardized way for CLI output.
 * Includes separator, item counts, availability message, next page instructions, and timestamp.
 * @param pagination - The ResponsePagination object containing pagination details.
 * @returns Formatted pagination footer string for CLI.
 */
export declare function formatPagination(pagination: ResponsePagination): string;
