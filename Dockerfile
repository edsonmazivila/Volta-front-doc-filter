# syntax=docker/dockerfile:1

# =============================================================================
# Volta HR Production Dockerfile
# Multi-stage build following 2025 industry best practices
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image with common dependencies
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

# Install libc6-compat for Alpine compatibility with native Node.js modules
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Install dependencies
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies with clean install for reproducible builds
# Using --omit=dev is handled in the builder stage to ensure devDependencies
# are available for the build process
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 3: Build the application
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Lingui translations BEFORE building
# This ensures all i18n messages are compiled to .ts files
RUN npm run i18n:compile

# Build the application
# Note: Turbopack is used for faster builds
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production runtime
# -----------------------------------------------------------------------------
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security (following principle of least privilege)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets (if they exist)
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy standalone build output
# The standalone output includes only the necessary files for production
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Set hostname to listen on all interfaces (required for Docker networking)
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application using the standalone server
CMD ["node", "server.js"]

