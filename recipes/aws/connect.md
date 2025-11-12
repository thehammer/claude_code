# AWS ECS Container Connection Recipe

Connect to AWS ECS containers with automatic profile management and tmux integration.

## Usage

**Parameters:**
1. **Environment**: `prod` or `staging` (required)
2. **Session Type**: `console`, `shell`, or `tinker` (default: console)
3. **Container Type**: `portal`, `scheduler`, or `queue` (default: portal)

**Examples:**
- "Open a prod console"
- "I want a staging tinker"
- "Connect to prod scheduler shell"
- "Open staging queue console"

## Environment Configuration

**Production:**
- Profile: `production-developers`
- Account: Production AWS account
- Cluster: `carefeed-ecs-cluster`

**Staging:**
- Profile: `staging-developers`
- Account: Staging AWS account
- Cluster: `carefeed-ecs-cluster`

## Container Service Mapping

| Container Type | Service Name Pattern |
|----------------|---------------------|
| portal (default) | `production-portal_dev-service` or `staging-portal_dev-service` |
| scheduler | `production-scheduler-service` or `staging-scheduler-service` |
| queue | `production-queues-service` or `staging-queues-service` |

## Connection Process

### 1. Parse User Request

Extract environment, session type, and container type from the user's request.

### 2. Check AWS SSO Profile Status

Check if the appropriate AWS profile is active:

```bash
aws sts get-caller-identity --profile {PROFILE} 2>&1
```

If the command fails or returns an error about expired credentials:
- Run: `aws sso login --profile {PROFILE}`
- Wait for completion before proceeding

### 3. Find Running Task

Get the task ARN for the target service:

```bash
TASK_ARN=$(aws ecs list-tasks \
  --cluster carefeed-ecs-cluster \
  --service-name {SERVICE_NAME} \
  --desired-status RUNNING \
  --profile {PROFILE} \
  --query 'taskArns[0]' \
  --output text)
```

### 4. Get Container Name from Task

Fetch the actual container name from the task (excluding sidecars):

```bash
CONTAINER_NAME=$(aws ecs describe-tasks \
  --cluster carefeed-ecs-cluster \
  --tasks "$TASK_ARN" \
  --profile {PROFILE} \
  --query 'tasks[0].containers[*].name' \
  --output text | tr '\t' '\n' | grep -v datadog | grep -v log_router)
```

**Container Naming Pattern:**
- Portal: `production-portal_dev` or `staging-portal_dev`
- Scheduler: `production-scheduler` or `staging-scheduler`
- Queue: `production-queues` or `staging-queues`

All tasks include sidecar containers (`datadog-agent`, `log_router`) that should be filtered out.

### 5. Prepare Connection Command

Build the connection command based on session type:

**For console/shell:**
```bash
aws ecs execute-command \
  --cluster carefeed-ecs-cluster \
  --task {TASK_ARN} \
  --container {CONTAINER_NAME} \
  --interactive \
  --command "/bin/bash" \
  --profile {PROFILE}
```

**For tinker:**
```bash
aws ecs execute-command \
  --cluster carefeed-ecs-cluster \
  --task {TASK_ARN} \
  --container {CONTAINER_NAME} \
  --interactive \
  --command "/bin/bash -c 'cd /var/www/html && php artisan tinker'" \
  --profile {PROFILE}
```

### 6. Handle Tmux Pane

Check if running in tmux and manage panes:

```bash
# Check if in tmux
if [ -n "$TMUX" ]; then
  # Check if there's already another pane
  PANE_COUNT=$(tmux list-panes | wc -l)

  if [ "$PANE_COUNT" -eq 1 ]; then
    # Create a new pane below
    tmux split-window -v
    sleep 1
    # Send command to the new pane
    tmux send-keys -t bottom "{CONNECTION_COMMAND}" C-m
  else
    # Use existing pane (assume it's below)
    tmux send-keys -t bottom "{CONNECTION_COMMAND}" C-m
  fi
else
  # Not in tmux, just run directly
  {CONNECTION_COMMAND}
fi
```

## Container Name Discovery

Container names must be dynamically discovered from the ECS task, as they don't follow a simple pattern:

| Service | Actual Container Name |
|---------|----------------------|
| production-portal_dev-service | production-portal_dev |
| staging-portal_dev-service | staging-portal_dev |
| production-scheduler-service | production-scheduler |
| staging-scheduler-service | staging-scheduler |
| production-queues-service | production-queues |
| staging-queues-service | staging-queues |

**Important:** Each task also includes sidecar containers (`datadog-agent`, `log_router`) that must be filtered out when selecting the target container.

## Error Handling

**If profile login fails:**
- Display error message
- Provide command to run manually: `aws sso login --profile {PROFILE}`

**If no running task found:**
- Display error: "No running tasks found for service {SERVICE_NAME}"
- Suggest checking AWS console

**If execute-command fails:**
- Check if ECS Exec is enabled on the service
- Verify IAM permissions
- Provide troubleshooting link

## Implementation Notes

1. **Always check profile status first** - Don't assume it's active
2. **Handle async profile login** - `aws sso login` opens browser and waits
3. **Pane management** - Use `tmux list-panes` to detect existing panes
4. **Clean output** - Show status messages clearly
5. **Error recovery** - Provide actionable next steps on failure

## Example Implementation Flow

```bash
# User says: "Open a prod console"

# Step 1: Parse
ENV="prod"
PROFILE="production-developers"
SESSION_TYPE="console"
CONTAINER_TYPE="portal"
SERVICE_NAME="production-portal_dev-service"

# Step 2: Check profile
aws sts get-caller-identity --profile production-developers 2>&1

# If failed: aws sso login --profile production-developers

# Step 3: Find task
TASK_ARN=$(aws ecs list-tasks --cluster carefeed-ecs-cluster \
  --service-name production-portal_dev-service --desired-status RUNNING \
  --profile production-developers --query 'taskArns[0]' --output text)

# Step 4: Get container name (filter out sidecars)
CONTAINER_NAME=$(aws ecs describe-tasks --cluster carefeed-ecs-cluster \
  --tasks "$TASK_ARN" --profile production-developers \
  --query 'tasks[0].containers[*].name' --output text | \
  tr '\t' '\n' | grep -v datadog | grep -v log_router)
# Result: "production-portal_dev"

# Step 5: Build command
CMD="aws ecs execute-command --cluster carefeed-ecs-cluster \
  --task $TASK_ARN --container $CONTAINER_NAME --interactive \
  --command \"/bin/bash\" --profile production-developers"

# Step 6: Execute in tmux pane
if [ $(tmux list-panes | wc -l) -eq 1 ]; then
  tmux split-window -v
  sleep 1
fi
tmux send-keys -t 1 "$CMD" C-m
```

## Security Notes

- Profile credentials are managed by AWS SSO
- Never store credentials in this recipe
- Commands are executed in your current shell context
- Task ARNs are fetched dynamically (no hardcoding)
