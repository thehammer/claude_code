# Dockerfile for Bitbucket MCP Server
# Built from aashari: github.com/aashari/mcp-server-atlassian-bitbucket
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
ENV PORT=3001
ENV NODE_ENV=production

# Expose the HTTP port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/ || exit 1

# Run the server in HTTP mode
CMD ["node", "dist/index.js"]
