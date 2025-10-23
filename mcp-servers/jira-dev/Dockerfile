# Dockerfile for Carefeed-customized Jira MCP Server
# Built from local development directory with transitions tools added
# Runs in HTTP mode for remote connections

FROM node:20-alpine

WORKDIR /app

# Copy package files and scripts
COPY package*.json ./

# Install dependencies (skip scripts since we're copying pre-built dist)
RUN npm ci --only=production --ignore-scripts

# Copy built JavaScript files and scripts
COPY dist ./dist
COPY scripts ./scripts

# Set environment variables (can be overridden by docker-compose)
ENV TRANSPORT_MODE=http
ENV PORT=3000
ENV NODE_ENV=production

# Expose the HTTP port
EXPOSE 3000

# Run the server in HTTP mode
CMD ["node", "dist/index.js"]
