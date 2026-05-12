# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Create a minimal .env with placeholder values for build
# The actual values will be provided at runtime via environment variables
RUN echo "DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder" > .env && \
    echo "PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA" >> .env && \
    echo "JWT_SECRET=placeholder-jwt-secret" >> .env && \
    echo "RESEND_API_KEY=placeholder-resend-key" >> .env && \
    echo "EMAIL_FROM=noreply@mytilusdata.cl" >> .env && \
    echo "INITIAL_ADMIN_EMAIL=admin@mytilusdata.cl" >> .env && \
    echo "PREDICTION_API_URL=http://localhost:8000" >> .env && \
    echo "PREDICTION_API_KEY=dev-api-key-placeholder" >> .env

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
