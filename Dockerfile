# 1. Base image: Use a lightweight Node.js version
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install packages
FROM base AS deps
WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# 3. Builder Stage: Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project (Change this to 'npm run build' for standard React/Vue)
RUN npm run build

# 4. Runner Stage: The final image that runs the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a system user for security (so we don't run as root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application from the 'builder' stage
# Note: For strict React (Vite/CRA), you typically serve static files with Nginx here.
# For Next.js, we copy the .next folder.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Start the application
CMD ["node", "server.js"]