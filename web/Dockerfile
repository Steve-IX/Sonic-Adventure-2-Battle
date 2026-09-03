FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY server.js .
COPY public/ ./public/

# Create directory for ROMs (user will provide at runtime)
RUN mkdir -p roms

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server with proper COOP/COEP headers
ENV NODE_ENV=production
CMD ["node", "server.js"]
