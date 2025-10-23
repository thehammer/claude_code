# Dockerfile for Carefeed Jira MCP Server
# Built from Carefeed fork: github.com/Carefeed/mcp-server-atlassian-jira
# Includes custom workflow transition tools
# Runs in HTTP mode for remote connections

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy scripts for postinstall
COPY scripts ./scripts

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy built JavaScript files (assumes you've run npm run build)
COPY dist ./dist

# Make dist/index.js executable
RUN chmod +x dist/index.js

# Set environment variables (can be overridden by docker-compose)
ENV TRANSPORT_MODE=http
ENV PORT=3000
ENV NODE_ENV=production

# Expose the HTTP port
EXPOSE 3000

# Run the server in HTTP mode
CMD ["node", "dist/index.js"]
