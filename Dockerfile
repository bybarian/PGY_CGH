# Use official Node.js light image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage Docker layer caching)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source files
COPY . .

# Build Vite client assets and compile esbuild server entry
RUN npm run build

# --- Production Environment ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY package*.json ./
# Install only production dependencies (excluding devDependencies)
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

COPY --from=builder /app/dist ./dist
# Also copy static assets directory if it's placed in public or assets
COPY --from=builder /app/public ./public

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
