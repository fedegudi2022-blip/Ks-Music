FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache \
    alpine-sdk \
    python3

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies (including optional native modules)
RUN npm ci

# Final stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    wget \
    git \
    python3 \
    py3-pip \
    ca-certificates

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose port for health checks
EXPOSE 3000

# Run the bot
CMD ["node", "launcher.js"]
