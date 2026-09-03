FROM node:18-alpine

WORKDIR /app

COPY web/package*.json ./web/
RUN cd web && npm install --omit=dev

COPY web/server.js ./web/
COPY web/public/ ./web/public/

RUN mkdir -p /app/ROMS

WORKDIR /app/web

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (response) => { if (response.statusCode !== 200) process.exit(1) })"

ENV NODE_ENV=production
CMD ["node", "server.js"]