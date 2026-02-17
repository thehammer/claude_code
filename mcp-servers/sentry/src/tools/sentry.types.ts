import { z } from 'zod';

export const ListProjectsSchema = z.object({
  org: z.string()
    .optional()
    .describe('Organization slug (defaults to configured org)'),
});

export const ListIssuesSchema = z.object({
  org: z.string()
    .optional()
    .describe('Organization slug'),
  project: z.string()
    .min(1)
    .describe('Project slug (e.g., "portal_dev", "carebot")'),
  query: z.string()
    .optional()
    .default('is:unresolved')
    .describe('Sentry search query. Examples: "is:unresolved", "environment:production", "level:error"'),
});

export const ListProductionIssuesSchema = z.object({
  org: z.string()
    .optional()
    .describe('Organization slug'),
  project: z.string()
    .min(1)
    .describe('Project slug'),
});

export const GetIssueSchema = z.object({
  org: z.string()
    .optional()
    .describe('Organization slug'),
  issue_id: z.string()
    .min(1)
    .describe('Issue ID (numeric or short ID like "PORTAL-123")'),
});

export const GetIssueEventsSchema = z.object({
  issue_id: z.string()
    .min(1)
    .describe('Issue ID'),
  limit: z.number()
    .min(1).max(100)
    .optional()
    .default(10)
    .describe('Maximum number of events to return'),
});

export const SearchIssuesSchema = z.object({
  org: z.string()
    .optional()
    .describe('Organization slug'),
  query: z.string()
    .min(1)
    .describe('Search query for issues'),
});

// Type exports
export type ListProjectsInput = z.infer<typeof ListProjectsSchema>;
export type ListIssuesInput = z.infer<typeof ListIssuesSchema>;
export type ListProductionIssuesInput = z.infer<typeof ListProductionIssuesSchema>;
export type GetIssueInput = z.infer<typeof GetIssueSchema>;
export type GetIssueEventsInput = z.infer<typeof GetIssueEventsSchema>;
export type SearchIssuesInput = z.infer<typeof SearchIssuesSchema>;
