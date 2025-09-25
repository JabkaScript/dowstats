# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install system deps needed by Nuxt/Nitro on Alpine
RUN apk add --no-cache libc6-compat

# Install dependencies (use lockfile if available)
COPY package.json package-lock.json* ./
RUN set -eux; \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build for production (SSR)
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy the Nitro output only (self-contained server)
COPY --from=builder /app/.output ./.output

# Run as non-root for security
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]