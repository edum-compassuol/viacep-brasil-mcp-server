FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies including dev dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./

# Disable prepare script which tries to run build again
RUN npm pkg delete scripts.prepare && \
    npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Set executable permissions for the entry point
RUN chmod +x ./build/index.js

# Expose MCP server via stdio
CMD ["node", "build/index.js"]
