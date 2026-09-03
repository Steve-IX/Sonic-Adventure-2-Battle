FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application
COPY server.js .
COPY public/ ./public/

# Create the mount point for the authorized ROM at runtime.
RUN mkdir -p /app/ROMS

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server with proper COOP/COEP headers
ENV NODE_ENV=production
CMD ["node", "server.js"]
