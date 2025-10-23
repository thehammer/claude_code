# Dockerfile for aashari's Jira MCP Server
# Runs in HTTP mode for remote connections

FROM node:20-alpine

# Install the MCP server globally
RUN npm install -g @aashari/mcp-server-atlassian-jira

# Set environment variables (can be overridden by docker-compose)
ENV TRANSPORT_MODE=http
ENV PORT=3000

# Expose the HTTP port
EXPOSE 3000

# Run the server in HTTP mode
CMD ["npx", "@aashari/mcp-server-atlassian-jira"]
