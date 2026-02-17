import { config } from '../utils/config';
import { Logger } from '../utils/logger';

const logger = Logger.forContext('sentry-service');

interface SentryProject {
  id: string;
  slug: string;
  name: string;
  platform: string;
  dateCreated: string;
}

interface SentryIssue {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
  metadata: {
    type?: string;
    value?: string;
    filename?: string;
    function?: string;
  };
}

interface SentryEvent {
  eventID: string;
  dateCreated: string;
  message: string;
  title: string;
  location: string;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags: Array<{ key: string; value: string }>;
  entries?: Array<{
    type: string;
    data: unknown;
  }>;
}

async function sentryRequest<T>(endpoint: string): Promise<T> {
  if (!config.isConfigured) {
    throw new Error('Sentry credentials not configured');
  }

  const url = `${config.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.sentryApiToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sentry API error (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function whoami(): Promise<{ user: string }> {
  const response = await sentryRequest<{ user: { email: string } }>('/');
  return { user: response.user?.email || 'unknown' };
}

export async function listOrganizations(): Promise<Array<{ slug: string; name: string }>> {
  return sentryRequest<Array<{ slug: string; name: string }>>('/organizations/');
}

export async function listProjects(org: string = config.sentryOrg): Promise<SentryProject[]> {
  return sentryRequest<SentryProject[]>(`/organizations/${org}/projects/`);
}

export async function listIssues(
  org: string,
  project: string,
  query: string = 'is:unresolved'
): Promise<SentryIssue[]> {
  const encodedQuery = encodeURIComponent(query);
  return sentryRequest<SentryIssue[]>(
    `/projects/${org}/${project}/issues/?query=${encodedQuery}`
  );
}

export async function listProductionIssues(
  org: string,
  project: string
): Promise<SentryIssue[]> {
  return listIssues(org, project, 'environment:production is:unresolved');
}

export async function getIssue(
  org: string,
  issueId: string
): Promise<SentryIssue> {
  return sentryRequest<SentryIssue>(`/organizations/${org}/issues/${issueId}/`);
}

export async function getIssueEvents(
  issueId: string,
  limit: number = 10
): Promise<SentryEvent[]> {
  const events = await sentryRequest<SentryEvent[]>(`/issues/${issueId}/events/`);
  return events.slice(0, limit);
}

export async function searchIssues(
  org: string,
  searchTerm: string
): Promise<SentryIssue[]> {
  const encodedQuery = encodeURIComponent(searchTerm);
  return sentryRequest<SentryIssue[]>(
    `/organizations/${org}/issues/?query=${encodedQuery}`
  );
}

export function formatIssue(issue: SentryIssue): string {
  const lines = [
    `[${issue.level.toUpperCase()}] ${issue.shortId}: ${issue.title}`,
    `  Culprit: ${issue.culprit}`,
    `  Status: ${issue.status} | Count: ${issue.count} | Users: ${issue.userCount}`,
    `  First: ${issue.firstSeen} | Last: ${issue.lastSeen}`,
    `  Link: ${issue.permalink}`,
  ];
  return lines.join('\n');
}

export function formatEvent(event: SentryEvent): string {
  const lines = [
    `Event: ${event.eventID}`,
    `  Time: ${event.dateCreated}`,
    `  Message: ${event.message || event.title}`,
    `  Location: ${event.location || 'N/A'}`,
  ];

  if (event.user) {
    lines.push(`  User: ${event.user.email || event.user.username || event.user.id || 'anonymous'}`);
  }

  if (event.tags?.length) {
    const tags = event.tags.slice(0, 5).map(t => `${t.key}=${t.value}`).join(', ');
    lines.push(`  Tags: ${tags}`);
  }

  return lines.join('\n');
}
