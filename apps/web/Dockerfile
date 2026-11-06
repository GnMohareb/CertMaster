# Multi-stage production Dockerfile for CertMaster Web Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations and package manifests
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy full web application source
COPY . .

# Build production bundle (client assets -> dist/ and typescript validation)
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm install -g tsx

# Copy compiled frontend assets and backend server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Expose HTTP port
EXPOSE 3000

# Start Express server with tsx runtime
CMD ["tsx", "server.ts"]
