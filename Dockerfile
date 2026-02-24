FROM node:20-alpine AS builder
RUN apk add --no-cache build-base python3 git
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps 2>&1 || npm install --legacy-peer-deps --no-save

FROM node:20-alpine
RUN apk add --no-cache ffmpeg curl git ca-certificates
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Setup cookies from environment variable if provided
RUN if [ -n "$YT_COOKIES" ]; then echo "$YT_COOKIES" > cookies.txt; fi

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs

CMD ["node", "launcher.js"]
