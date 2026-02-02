# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for build-time environment variables
ARG DATABASE_URL
ARG PUBLIC_TURNSTILE_SITE_KEY
ARG JWT_SECRET
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG INITIAL_ADMIN_EMAIL
ARG PREDICTION_API_URL

# Create .env file from build arguments
RUN echo "DATABASE_URL=${DATABASE_URL}" > .env && \
    echo "PUBLIC_TURNSTILE_SITE_KEY=${PUBLIC_TURNSTILE_SITE_KEY}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env && \
    echo "RESEND_API_KEY=${RESEND_API_KEY}" >> .env && \
    echo "EMAIL_FROM=${EMAIL_FROM}" >> .env && \
    echo "INITIAL_ADMIN_EMAIL=${INITIAL_ADMIN_EMAIL}" >> .env && \
    echo "PREDICTION_API_URL=${PREDICTION_API_URL}" >> .env

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]
