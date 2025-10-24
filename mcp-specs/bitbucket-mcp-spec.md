# Bitbucket MCP Server Specification

**Status:** Design Phase
**Created:** 2025-10-24
**Target Implementation:** Week 3 (per Reclassification Plan)

---

## Overview

The Bitbucket MCP server provides programmatic access to Bitbucket Cloud API for pull request and pipeline management. This server replaces 9 bash helper functions with 7 robust MCP tools.

**Primary Use Cases:**
- Create and manage pull requests
- List and filter PRs across repositories
- Access pipeline status and step details
- Integrate with Carefeed development workflow

---

## Design Decisions

### 1. Authentication Strategy

**Decision:** Use Bitbucket Access Tokens (App Passwords supported for backward compatibility)

**Configuration:**
```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": ["/path/to/bitbucket-mcp/index.js"],
      "env": {
        "BITBUCKET_WORKSPACE": "Bitbucketpassword1",
        "BITBUCKET_USERNAME": "hammer.miller",
        "BITBUCKET_ACCESS_TOKEN": "ATBB...",
        "BITBUCKET_APP_PASSWORD": "..."  // Fallback for legacy
      }
    }
  }
}
```

**Credentials Priority:**
1. `BITBUCKET_ACCESS_TOKEN` (preferred, newer)
2. `BITBUCKET_APP_PASSWORD` (legacy, still supported)

**Why:**
- Access Tokens are newer, more secure, and have granular permissions
- App Passwords still widely used, need backward compatibility
- Environment variables keep secrets out of code

---

### 2. Repository Context Detection

**Decision:** Auto-detect repo from git remote, allow explicit override

**Auto-Detection Logic:**
```javascript
function detectRepository() {
  // 1. Try to get from git remote
  const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
  const repoMatch = remoteUrl.match(/\/([^/]+?)(\.git)?$/);
  if (repoMatch) {
    return repoMatch[1];  // e.g., "portal_dev"
  }

  // 2. Fall back to explicit parameter (required if auto-detect fails)
  return null;
}
```

**Tool Parameter:**
```typescript
interface BaseBitbucketParams {
  repository?: string;  // Optional: auto-detect if not provided
  workspace?: string;   // Optional: use BITBUCKET_WORKSPACE if not provided
}
```

**Why:**
- Most operations are in current repo (auto-detect reduces friction)
- Cross-repo operations need explicit repo name
- Fails gracefully when not in git directory

---

### 3. Pagination Handling

**Decision:** Auto-fetch all pages by default, expose pagination for power users

**Default Behavior (Auto-Pagination):**
```typescript
async function listPullRequests(params: ListPRParams): Promise<PR[]> {
  let allPRs: PR[] = [];
  let nextUrl: string | null = initialUrl;

  while (nextUrl) {
    const response = await fetch(nextUrl, {headers: authHeaders});
    const data = await response.json();

    allPRs = allPRs.concat(data.values);
    nextUrl = data.next || null;  // Bitbucket provides 'next' URL
  }

  return allPRs;  // All pages combined
}
```

**Power User Mode (Manual Pagination):**
```typescript
interface ListPRParams {
  repository: string;
  state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  limit?: number;      // Items per page (max 50)
  paginate?: boolean;  // Default: true (auto-fetch all)
  cursor?: string;     // For manual pagination
}
```

**Why:**
- Auto-pagination is convenient for typical use (getting all open PRs)
- Manual pagination needed for very large repos (100+ PRs)
- Bitbucket max page size is 50 (API limitation)

---

### 4. Error Handling Strategy

**Decision:** Rich error objects with context and recovery suggestions

**Error Response Format:**
```typescript
interface BitbucketError {
  code: string;                    // 'PR_NOT_FOUND', 'AUTH_FAILED', etc.
  message: string;                 // Human-readable error
  httpStatus: number;              // 404, 401, 403, etc.
  details?: any;                   // Original API response
  suggestions?: string[];          // Recovery suggestions
}
```

**Example Error Responses:**

**404 - PR Not Found:**
```json
{
  "code": "PR_NOT_FOUND",
  "message": "Pull request #9999 not found in repository 'portal_dev'",
  "httpStatus": 404,
  "suggestions": [
    "Verify PR number is correct",
    "Check if PR was closed/merged",
    "Use list_pull_requests to find available PRs"
  ]
}
```

**401 - Authentication Failed:**
```json
{
  "code": "AUTH_FAILED",
  "message": "Bitbucket authentication failed",
  "httpStatus": 401,
  "suggestions": [
    "Check BITBUCKET_ACCESS_TOKEN is set correctly",
    "Verify token hasn't expired",
    "Generate new access token at: https://bitbucket.org/account/settings/app-passwords/"
  ]
}
```

**403 - Permission Denied:**
```json
{
  "code": "PERMISSION_DENIED",
  "message": "Insufficient permissions to access repository 'portal_dev'",
  "httpStatus": 403,
  "suggestions": [
    "Verify you have access to this repository",
    "Check workspace name is correct: BITBUCKET_WORKSPACE",
    "Ensure access token has 'repository:read' permission"
  ]
}
```

**Why:**
- Clear errors speed up debugging
- Actionable suggestions help users self-recover
- Error codes enable programmatic error handling

---

### 5. Data Transformation

**Decision:** Return simplified, Claude-friendly format (not raw Bitbucket API)

**Bitbucket API Response (Complex):**
```json
{
  "id": 4067,
  "title": "CORE-3982: Handle null facility names",
  "state": "OPEN",
  "author": {
    "display_name": "Hammer Miller",
    "uuid": "{abc-123}",
    "account_id": "123456",
    "links": {...}
  },
  "source": {
    "branch": {
      "name": "feature/CORE-3982-null-safety"
    },
    "repository": {...},
    "commit": {...}
  },
  "destination": {...},
  "created_on": "2025-10-24T14:35:42.123456+00:00",
  "updated_on": "2025-10-24T15:20:10.654321+00:00",
  "links": {
    "html": {"href": "https://..."},
    "comments": {"href": "https://..."},
    "commits": {"href": "https://..."}
  },
  "participants": [{...}, {...}],
  "reviewers": [{...}, {...}]
}
```

**MCP Response (Simplified):**
```json
{
  "id": 4067,
  "title": "CORE-3982: Handle null facility names",
  "state": "OPEN",
  "author": "Hammer Miller",
  "sourceBranch": "feature/CORE-3982-null-safety",
  "targetBranch": "master",
  "url": "https://bitbucket.org/Bitbucketpassword1/portal_dev/pull-requests/4067",
  "created": "2025-10-24T14:35:42Z",
  "updated": "2025-10-24T15:20:10Z",
  "commentCount": 3,
  "approvals": 2,
  "reviewers": ["tech.lead@carefeed.com", "teammate@carefeed.com"]
}
```

**Why:**
- Cleaner data is easier for Claude to work with
- Removes nested complexity
- Focuses on actionable information
- Timestamps simplified to ISO 8601

---

## MCP Tools Specification

### Tool 1: `list_pull_requests`

**Purpose:** List pull requests with filtering and pagination

**Parameters:**
```typescript
interface ListPullRequestsParams {
  repository?: string;              // Auto-detect if not provided
  workspace?: string;               // Use env BITBUCKET_WORKSPACE if not provided
  state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED' | 'ALL';  // Default: ALL
  limit?: number;                   // Items per page, max 50, default 50
  paginate?: boolean;               // Auto-fetch all pages, default true
  cursor?: string;                  // For manual pagination
  author?: string;                  // Filter by PR author username
  sourceBranch?: string;            // Filter by source branch name
}
```

**Returns:**
```typescript
interface ListPullRequestsResponse {
  pullRequests: PullRequest[];      // Array of simplified PR objects
  totalCount: number;               // Total number of PRs (all pages)
  nextCursor?: string;              // For manual pagination
}

interface PullRequest {
  id: number;
  title: string;
  state: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  url: string;
  created: string;                  // ISO 8601
  updated: string;
  commentCount: number;
  approvals: number;
  reviewers: string[];
}
```

**Example Usage:**
```typescript
// Get all open PRs for current repo
const openPRs = await listPullRequests({state: 'OPEN'});

// Get PRs for specific repo
const prs = await listPullRequests({
  repository: 'portal_dev',
  state: 'OPEN',
  author: 'hammer.miller'
});

// Manual pagination for large result sets
const firstPage = await listPullRequests({
  paginate: false,
  limit: 50
});
const secondPage = await listPullRequests({
  paginate: false,
  cursor: firstPage.nextCursor
});
```

---

### Tool 2: `get_pull_request`

**Purpose:** Get detailed information about a specific PR

**Parameters:**
```typescript
interface GetPullRequestParams {
  repository?: string;              // Auto-detect if not provided
  workspace?: string;
  prId: number;                     // PR number (required)
}
```

**Returns:**
```typescript
interface PullRequestDetails extends PullRequest {
  description: string;              // PR description/body
  commits: {
    hash: string;
    message: string;
    author: string;
    date: string;
  }[];
  comments: {
    id: number;
    author: string;
    content: string;
    created: string;
  }[];
  buildStatus?: {                   // Pipeline status if available
    state: string;
    pipelineId: number;
    url: string;
  };
}
```

**Example Usage:**
```typescript
const prDetails = await getPullRequest({prId: 4067});
console.log(prDetails.description);
console.log(`${prDetails.commits.length} commits`);
console.log(`${prDetails.comments.length} comments`);
```

---

### Tool 3: `create_pull_request`

**Purpose:** Create a new pull request

**Parameters:**
```typescript
interface CreatePullRequestParams {
  repository?: string;              // Auto-detect if not provided
  workspace?: string;
  sourceBranch: string;             // Required
  targetBranch: string;             // Required (e.g., "master")
  title: string;                    // Required
  description?: string;             // Optional PR body
  closeSourceBranch?: boolean;      // Delete branch after merge, default false
  reviewers?: string[];             // Array of usernames or emails
}
```

**Returns:**
```typescript
interface CreatePullRequestResponse {
  pullRequest: PullRequestDetails;  // Full PR object
  success: true;
}
```

**Example Usage:**
```typescript
const newPR = await createPullRequest({
  sourceBranch: 'feature/CORE-3982-null-safety',
  targetBranch: 'master',
  title: 'CORE-3982: Handle null facility names',
  description: '## Summary\nFixed null handling...',
  reviewers: ['tech.lead@carefeed.com']
});
console.log(`Created PR #${newPR.pullRequest.id}: ${newPR.pullRequest.url}`);
```

---

### Tool 4: `update_pull_request`

**Purpose:** Update PR title, description, or reviewers

**Parameters:**
```typescript
interface UpdatePullRequestParams {
  repository?: string;
  workspace?: string;
  prId: number;                     // Required
  title?: string;                   // Update title
  description?: string;             // Update description
  reviewers?: string[];             // Replace reviewers
}
```

**Returns:**
```typescript
interface UpdatePullRequestResponse {
  pullRequest: PullRequestDetails;
  success: true;
}
```

**Example Usage:**
```typescript
await updatePullRequest({
  prId: 4067,
  title: 'CORE-3982: [UPDATED] Handle null facility names',
  description: '## Summary\nRevised approach...'
});
```

---

### Tool 5: `merge_pull_request`

**Purpose:** Merge an approved pull request

**Parameters:**
```typescript
interface MergePullRequestParams {
  repository?: string;
  workspace?: string;
  prId: number;                     // Required
  closeSourceBranch?: boolean;      // Delete branch after merge, default false
  mergeStrategy?: 'merge_commit' | 'squash' | 'fast_forward';  // Default: merge_commit
  message?: string;                 // Merge commit message
}
```

**Returns:**
```typescript
interface MergePullRequestResponse {
  success: true;
  mergeCommit: {
    hash: string;
    message: string;
  };
}
```

**Example Usage:**
```typescript
const result = await mergePullRequest({
  prId: 4067,
  closeSourceBranch: true,
  mergeStrategy: 'squash',
  message: 'CORE-3982: Handle null facility names'
});
console.log(`Merged as ${result.mergeCommit.hash}`);
```

---

### Tool 6: `get_pipeline`

**Purpose:** Get pipeline execution details

**Parameters:**
```typescript
interface GetPipelineParams {
  repository?: string;
  workspace?: string;
  pipelineId: number;               // Required: pipeline build number
}
```

**Returns:**
```typescript
interface PipelineDetails {
  buildNumber: number;
  state: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  result: 'SUCCESSFUL' | 'FAILED' | 'ERROR' | 'STOPPED';
  branch: string;
  commit: {
    hash: string;
    message: string;
  };
  created: string;
  completed?: string;
  duration?: number;                // Seconds
  steps: PipelineStep[];
}

interface PipelineStep {
  uuid: string;
  name: string;
  state: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  result?: 'SUCCESSFUL' | 'FAILED' | 'ERROR' | 'STOPPED';
  duration?: number;
  url: string;                      // Browser URL to view logs
}
```

**Example Usage:**
```typescript
const pipeline = await getPipeline({pipelineId: 13906});
console.log(`Pipeline ${pipeline.buildNumber}: ${pipeline.result}`);

const failedSteps = pipeline.steps.filter(s => s.result === 'FAILED');
failedSteps.forEach(step => {
  console.log(`Failed: ${step.name} - View logs: ${step.url}`);
});
```

---

### Tool 7: `list_pipelines`

**Purpose:** List recent pipelines for a repository or branch

**Parameters:**
```typescript
interface ListPipelinesParams {
  repository?: string;
  workspace?: string;
  branch?: string;                  // Filter by branch name
  state?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  result?: 'SUCCESSFUL' | 'FAILED' | 'ERROR' | 'STOPPED';
  limit?: number;                   // Default 50, max 50
  paginate?: boolean;               // Default true
}
```

**Returns:**
```typescript
interface ListPipelinesResponse {
  pipelines: PipelineDetails[];
  totalCount: number;
  nextCursor?: string;
}
```

**Example Usage:**
```typescript
// Get all failed pipelines for current branch
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const failedPipelines = await listPipelines({
  branch,
  result: 'FAILED'
});

console.log(`${failedPipelines.totalCount} failed pipelines on ${branch}`);
```

---

## Implementation Details

### Technology Stack

**Option A: Node.js (Recommended)**
```
Runtime: Node.js 18+
Language: TypeScript
HTTP Client: node-fetch or axios
MCP SDK: @modelcontextprotocol/sdk
```

**Pros:**
- Official MCP SDK support
- Great TypeScript tooling
- Easy JSON manipulation
- npm ecosystem

**Option B: Python**
```
Runtime: Python 3.10+
Language: Python
HTTP Client: httpx or requests
MCP SDK: mcp-sdk-python
```

**Pros:**
- Simpler for Bitbucket API
- Good error handling
- Easier async/await

**Decision:** Use **Node.js/TypeScript** for consistency with Jira MCP and better MCP SDK support.

---

### Project Structure

```
bitbucket-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/                # Tool implementations
│   │   ├── listPullRequests.ts
│   │   ├── getPullRequest.ts
│   │   ├── createPullRequest.ts
│   │   ├── updatePullRequest.ts
│   │   ├── mergePullRequest.ts
│   │   ├── getPipeline.ts
│   │   └── listPipelines.ts
│   ├── api/                  # Bitbucket API client
│   │   ├── client.ts         # HTTP client with auth
│   │   ├── pullrequests.ts   # PR endpoints
│   │   └── pipelines.ts      # Pipeline endpoints
│   ├── types/                # TypeScript interfaces
│   │   ├── pullrequest.ts
│   │   ├── pipeline.ts
│   │   └── errors.ts
│   └── utils/                # Helper functions
│       ├── transform.ts      # API response transformation
│       ├── pagination.ts     # Auto-pagination logic
│       └── detection.ts      # Repo/workspace detection
├── tests/
│   ├── tools/                # Tool tests
│   └── api/                  # API client tests
├── package.json
├── tsconfig.json
└── README.md
```

---

### Authentication Implementation

```typescript
// src/api/client.ts
import fetch from 'node-fetch';

interface BitbucketConfig {
  workspace: string;
  username: string;
  accessToken?: string;
  appPassword?: string;
}

class BitbucketClient {
  private config: BitbucketConfig;
  private baseUrl = 'https://api.bitbucket.org/2.0';

  constructor() {
    this.config = {
      workspace: process.env.BITBUCKET_WORKSPACE!,
      username: process.env.BITBUCKET_USERNAME!,
      accessToken: process.env.BITBUCKET_ACCESS_TOKEN,
      appPassword: process.env.BITBUCKET_APP_PASSWORD
    };

    if (!this.config.workspace || !this.config.username) {
      throw new Error('BITBUCKET_WORKSPACE and BITBUCKET_USERNAME required');
    }

    if (!this.config.accessToken && !this.config.appPassword) {
      throw new Error('Either BITBUCKET_ACCESS_TOKEN or BITBUCKET_APP_PASSWORD required');
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.config.accessToken || this.config.appPassword;
    const auth = Buffer.from(`${this.config.username}:${token}`).toString('base64');

    return {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  private async handleError(response: Response): Promise<BitbucketError> {
    const data = await response.json().catch(() => ({}));

    return {
      code: this.getErrorCode(response.status),
      message: data.error?.message || response.statusText,
      httpStatus: response.status,
      details: data,
      suggestions: this.getErrorSuggestions(response.status)
    };
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 401: return 'AUTH_FAILED';
      case 403: return 'PERMISSION_DENIED';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 429: return 'RATE_LIMITED';
      default: return 'API_ERROR';
    }
  }

  private getErrorSuggestions(status: number): string[] {
    switch (status) {
      case 401:
        return [
          'Check BITBUCKET_ACCESS_TOKEN is set correctly',
          'Verify token hasn\'t expired',
          'Generate new token at https://bitbucket.org/account/settings/app-passwords/'
        ];
      case 403:
        return [
          'Verify you have access to this repository',
          'Check workspace name is correct',
          'Ensure token has required permissions'
        ];
      case 404:
        return [
          'Verify resource ID is correct',
          'Check if resource still exists',
          'Confirm workspace and repository names'
        ];
      case 429:
        return [
          'Wait before retrying (rate limit exceeded)',
          'Consider reducing request frequency'
        ];
      default:
        return ['Check Bitbucket API status: https://status.bitbucket.org/'];
    }
  }
}
```

---

### Auto-Pagination Implementation

```typescript
// src/utils/pagination.ts
interface PagedResponse<T> {
  values: T[];
  next?: string;
  size: number;
  page?: number;
  pagelen?: number;
}

export async function autoPaginate<T>(
  client: BitbucketClient,
  initialUrl: string,
  limit: number = 50
): Promise<T[]> {
  let allItems: T[] = [];
  let nextUrl: string | null = initialUrl;
  let requestsMade = 0;
  const maxRequests = 100;  // Safety limit

  while (nextUrl && requestsMade < maxRequests) {
    const response = await client.request<PagedResponse<T>>(nextUrl);

    allItems = allItems.concat(response.values);
    nextUrl = response.next || null;
    requestsMade++;

    // Warn if approaching limit
    if (requestsMade === maxRequests && nextUrl) {
      console.warn(`Reached max pagination requests (${maxRequests}). Results may be incomplete.`);
    }
  }

  return allItems;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/tools/listPullRequests.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { listPullRequests } from '../../src/tools/listPullRequests';

describe('listPullRequests', () => {
  it('should list all open PRs for current repo', async () => {
    const prs = await listPullRequests({state: 'OPEN'});

    expect(prs.pullRequests).toBeInstanceOf(Array);
    expect(prs.totalCount).toBeGreaterThanOrEqual(0);
    prs.pullRequests.forEach(pr => {
      expect(pr.id).toBeTypeOf('number');
      expect(pr.title).toBeTypeOf('string');
      expect(pr.state).toBe('OPEN');
    });
  });

  it('should handle pagination correctly', async () => {
    const firstPage = await listPullRequests({
      paginate: false,
      limit: 10
    });

    expect(firstPage.pullRequests).toHaveLength(10);
    expect(firstPage.nextCursor).toBeTruthy();

    const secondPage = await listPullRequests({
      paginate: false,
      cursor: firstPage.nextCursor
    });

    expect(secondPage.pullRequests[0].id).not.toBe(firstPage.pullRequests[0].id);
  });

  it('should handle errors gracefully', async () => {
    await expect(
      listPullRequests({repository: 'nonexistent-repo'})
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      httpStatus: 404
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/pr-workflow.test.ts
describe('PR Creation Workflow', () => {
  it('should create, update, and merge a PR', async () => {
    // 1. Create PR
    const newPR = await createPullRequest({
      sourceBranch: 'test-branch',
      targetBranch: 'master',
      title: 'Test PR',
      description: 'Test description'
    });

    expect(newPR.pullRequest.id).toBeTruthy();
    const prId = newPR.pullRequest.id;

    // 2. Update PR
    await updatePullRequest({
      prId,
      title: 'Updated Test PR'
    });

    const updated = await getPullRequest({prId});
    expect(updated.title).toBe('Updated Test PR');

    // 3. Merge PR
    const merged = await mergePullRequest({prId});
    expect(merged.success).toBe(true);

    // 4. Verify merged
    const final = await getPullRequest({prId});
    expect(final.state).toBe('MERGED');
  });
});
```

---

## Deployment and Configuration

### Claude Code Integration

**Configuration in Claude Code settings:**
```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": ["/Users/hammer/.claude/mcp-servers/bitbucket-mcp/dist/index.js"],
      "env": {
        "BITBUCKET_WORKSPACE": "Bitbucketpassword1",
        "BITBUCKET_USERNAME": "hammer.miller",
        "BITBUCKET_ACCESS_TOKEN": "${BITBUCKET_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Credentials Management:**
Store tokens in existing `~/.claude/credentials/.env`:
```bash
# Bitbucket API (use one of these)
BITBUCKET_ACCESS_TOKEN=ATBB...  # Preferred
BITBUCKET_APP_PASSWORD=...      # Legacy
BITBUCKET_USERNAME=hammer.miller
BITBUCKET_WORKSPACE=Bitbucketpassword1
```

---

## Migration from Bash Helpers

### Deprecated Functions

These 9 bash functions will be replaced by MCP tools:

| **Bash Function** | **MCP Tool** | **Notes** |
|------------------|-------------|-----------|
| `bitbucket_list_prs` | `list_pull_requests` | Enhanced with better filtering |
| `bitbucket_create_pr` | `create_pull_request` | Simplified parameters |
| `bitbucket_update_pr` | `update_pull_request` | Same functionality |
| `bitbucket_get_pr` | `get_pull_request` | Enhanced with more details |
| `bitbucket_get_pr_comments` | `get_pull_request` (includes comments) | Merged into get |
| `bitbucket_get_pipeline` | `get_pipeline` | Enhanced with steps |
| `bitbucket_get_step_url` | `get_pipeline` (includes step URLs) | Merged into get |
| `bitbucket_get_pipeline_logs` | N/A | API limitation (browser only) |
| ~~`bitbucket_is_configured`~~ | Keep as helper | Simple credential check |

### Retained Helper

**Only this helper remains:**
```bash
# ~/.claude/lib/services/_bash/bitbucket.sh
bitbucket_is_configured() {
  # Quick check for credentials
  local bitbucket_token="${BITBUCKET_ACCESS_TOKEN:-$BITBUCKET_APP_PASSWORD}"
  [[ -n "$bitbucket_token" ]] && [[ -n "$BITBUCKET_USERNAME" ]]
}
```

**Why keep it:**
- Fast credential check (no API call)
- Used by other scripts/recipes
- Simple bash test

---

## Future Enhancements

### Phase 2 (After Initial Release)

1. **Approve/Decline PR:**
   - `approve_pull_request`
   - `decline_pull_request`
   - Add reviewer comments

2. **PR Comments:**
   - `add_pr_comment`
   - `list_pr_comments`
   - `resolve_comment`

3. **Branch Operations:**
   - `list_branches`
   - `create_branch`
   - `delete_branch`

4. **Commit Information:**
   - `list_commits`
   - `get_commit`
   - `compare_commits`

### Phase 3 (Advanced)

1. **Pipeline Triggers:**
   - `trigger_pipeline`
   - `stop_pipeline`

2. **Webhooks:**
   - Real-time PR status updates
   - Pipeline completion notifications

3. **Log Access:**
   - Browser automation to fetch step logs
   - Parse and extract error messages

---

## Success Metrics

**After Implementation:**
- ✅ 9 bash functions → 7 MCP tools
- ✅ Recipe workflows fully supported
- ✅ Better error handling and recovery
- ✅ Auto-pagination for large datasets
- ✅ Type-safe parameters and responses
- ✅ Consistent with Jira MCP patterns

**Performance:**
- MCP tools should match or beat bash helpers (~500ms per operation)
- Auto-pagination should handle 100+ PRs efficiently
- Error responses should be clear and actionable

---

## Related Documents

- [Reclassification Plan](../RECLASSIFICATION_PLAN.md) - Overall migration strategy
- [Recipe: Create Carefeed PR](../recipes/bitbucket/create-carefeed-pr.md) - Primary workflow
- [Recipe: Debug Pipeline Failure](../recipes/bitbucket/debug-pipeline-failure.md) - Debugging workflow
- [Bitbucket API v2 Docs](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/) - Official API reference

---

**Next Steps:**
1. ✅ Spec complete - ready for implementation
2. Set up Node.js/TypeScript project
3. Implement core tools (list, get, create)
4. Add tests
5. Integrate with Claude Code
6. Test with recipes

**Status:** Ready for Implementation
**Estimated Time:** 2-3 hours for core functionality, 1 hour for testing
