import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger';
import { config } from '../utils/config';
import * as sentry from '../services/sentry.service';
import {
  ListProjectsSchema,
  ListIssuesSchema,
  ListProductionIssuesSchema,
  GetIssueSchema,
  GetIssueEventsSchema,
  SearchIssuesSchema,
} from './sentry.types';

const logger = Logger.forContext('sentry-tools');

// Use type assertion to work around deep type instantiation issues
// between zod and MCP SDK types
function getRegisterTool(server: McpServer) {
  return (server as any).tool.bind(server);
}

export function registerTools(server: McpServer): void {
  const registerTool = getRegisterTool(server);
  // Test connection
  registerTool(
    'sentry_whoami',
    'Test Sentry API connection and show authenticated user',
    {},
    async () => {
      try {
        const result = await sentry.whoami();
        return {
          content: [{
            type: 'text',
            text: `Connected to Sentry as ${result.user}`,
          }],
        };
      } catch (error) {
        logger.error('sentry_whoami failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // List projects
  registerTool(
    'sentry_list_projects',
    'List all Sentry projects in an organization',
    ListProjectsSchema.shape,
    async (params) => {
      try {
        const input = ListProjectsSchema.parse(params);
        const org = input.org || config.sentryOrg;
        const projects = await sentry.listProjects(org);

        if (projects.length === 0) {
          return {
            content: [{ type: 'text', text: `No projects found in organization ${org}` }],
          };
        }

        const formatted = projects.map(p =>
          `${p.name} (${p.slug}) - Platform: ${p.platform || 'N/A'}`
        ).join('\n');

        return {
          content: [{
            type: 'text',
            text: `Found ${projects.length} projects in ${org}:\n\n${formatted}`,
          }],
        };
      } catch (error) {
        logger.error('sentry_list_projects failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // List issues
  registerTool(
    'sentry_list_issues',
    'List issues in a Sentry project. Query examples: "is:unresolved", "level:error", "environment:production"',
    ListIssuesSchema.shape,
    async (params) => {
      try {
        const input = ListIssuesSchema.parse(params);
        const org = input.org || config.sentryOrg;
        const issues = await sentry.listIssues(org, input.project, input.query);

        if (issues.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No issues found for query: ${input.query} in ${org}/${input.project}`,
            }],
          };
        }

        const formatted = issues.map(sentry.formatIssue).join('\n\n');
        return {
          content: [{
            type: 'text',
            text: `Found ${issues.length} issues:\n\n${formatted}`,
          }],
        };
      } catch (error) {
        logger.error('sentry_list_issues failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // List production issues
  registerTool(
    'sentry_production_issues',
    'List unresolved issues from production environment',
    ListProductionIssuesSchema.shape,
    async (params) => {
      try {
        const input = ListProductionIssuesSchema.parse(params);
        const org = input.org || config.sentryOrg;
        const issues = await sentry.listProductionIssues(org, input.project);

        if (issues.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No unresolved production issues in ${org}/${input.project}`,
            }],
          };
        }

        const formatted = issues.map(sentry.formatIssue).join('\n\n');
        return {
          content: [{
            type: 'text',
            text: `Found ${issues.length} production issues:\n\n${formatted}`,
          }],
        };
      } catch (error) {
        logger.error('sentry_production_issues failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // Get issue details
  registerTool(
    'sentry_get_issue',
    'Get detailed information about a specific Sentry issue',
    GetIssueSchema.shape,
    async (params) => {
      try {
        const input = GetIssueSchema.parse(params);
        const org = input.org || config.sentryOrg;
        const issue = await sentry.getIssue(org, input.issue_id);

        return {
          content: [{
            type: 'text',
            text: sentry.formatIssue(issue),
          }],
        };
      } catch (error) {
        logger.error('sentry_get_issue failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // Get issue events
  registerTool(
    'sentry_get_events',
    'Get recent events/occurrences for a Sentry issue',
    GetIssueEventsSchema.shape,
    async (params) => {
      try {
        const input = GetIssueEventsSchema.parse(params);
        const events = await sentry.getIssueEvents(input.issue_id, input.limit);

        if (events.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No events found for issue ${input.issue_id}`,
            }],
          };
        }

        const formatted = events.map(sentry.formatEvent).join('\n\n');
        return {
          content: [{
            type: 'text',
            text: `Found ${events.length} events:\n\n${formatted}`,
          }],
        };
      } catch (error) {
        logger.error('sentry_get_events failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // Search issues
  registerTool(
    'sentry_search',
    'Search for issues across an organization',
    SearchIssuesSchema.shape,
    async (params) => {
      try {
        const input = SearchIssuesSchema.parse(params);
        const org = input.org || config.sentryOrg;
        const issues = await sentry.searchIssues(org, input.query);

        if (issues.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No issues found matching: ${input.query}`,
            }],
          };
        }

        const formatted = issues.map(sentry.formatIssue).join('\n\n');
        return {
          content: [{
            type: 'text',
            text: `Found ${issues.length} issues:\n\n${formatted}`,
          }],
        };
      } catch (error) {
        logger.error('sentry_search failed', error);
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  logger.info('Sentry tools registered');
}

export default { registerTools };
