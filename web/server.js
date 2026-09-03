const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const SERVICE_VERSION = process.env.SERVICE_VERSION || '0.2.0';
const ROM_FILENAME = 'Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz';
const ROM_PATH_CANDIDATES = process.env.ROM_PATH ? [process.env.ROM_PATH] : [
  path.resolve(__dirname, '..', 'ROMS', ROM_FILENAME),
  path.resolve(__dirname, 'ROMS', ROM_FILENAME),
  path.resolve(process.cwd(), 'ROMS', ROM_FILENAME),
  path.resolve(process.cwd(), '..', 'ROMS', ROM_FILENAME),
  path.resolve('/app', 'ROMS', ROM_FILENAME)
];

// Critical: COOP/COEP headers for SharedArrayBuffer (required for Dolphin WebAssembly threading)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.options(['/api/rom', '/api/rom/metadata', '/api/core/capabilities'], (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.status(204).end();
});

// Serve static assets with proper CORP header
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.wasm') || path.endsWith('.js') || path.endsWith('.html')) {
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    }
  }
}));

// Browsers request this automatically even when no custom icon is configured.
app.get('/favicon.ico', (req, res) => res.status(204).end());

function resolveRomPath() {
  for (const candidate of ROM_PATH_CANDIDATES) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      // Try the next configured location.
    }
  }
  return null;
}

function romError(res) {
  return res.status(404).json({ available: false, error: 'Authorized RVZ image not found on this deployment.' });
}

function parseRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value || '');
  if (!match || (!match[1] && !match[2])) return null;
  let start = match[1] ? Number.parseInt(match[1], 10) : Math.max(size - Number.parseInt(match[2], 10), 0);
  let end = match[2] ? Number.parseInt(match[2], 10) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || start > end) return null;
  end = Math.min(end, size - 1);
  return { start, end };
}

function sendRom(req, res) {
  const romPath = resolveRomPath();
  if (!romPath) return romError(res);
  const stat = fs.statSync(romPath);
  const etag = `W/"${stat.size}-${stat.mtimeMs}"`;
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  const range = req.headers.range ? parseRange(req.headers.range, stat.size) : null;
  if (req.headers.range && !range) return res.status(416).set('Content-Range', `bytes */${stat.size}`).end();
  const start = range?.start || 0;
  const end = range?.end ?? stat.size - 1;
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': `inline; filename="${ROM_FILENAME}"`,
    'Content-Length': end - start + 1,
    'Content-Type': 'application/octet-stream',
    ETag: etag
  };
  if (range) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
  res.status(range ? 206 : 200).set(headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(romPath, range ? { start, end } : undefined).pipe(res);
}

app.get('/api/rom/metadata', (req, res) => {
  const romPath = resolveRomPath();
  if (!romPath) return romError(res);
  const stat = fs.statSync(romPath);
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(romPath);
  stream.on('data', (chunk) => hash.update(chunk));
  stream.on('error', () => res.status(500).json({ available: false, error: 'Unable to read RVZ metadata.' }));
  stream.on('end', () => res.json({ available: true, filename: ROM_FILENAME, bytes: stat.size, modifiedAt: stat.mtime.toISOString(), sha256: hash.digest('hex') }));
});

app.get(['/api/rom', '/api/load-game', '/api/rom/:filename'], (req, res) => {
  if (req.params.filename && req.params.filename !== ROM_FILENAME) return res.status(403).json({ error: 'ROM not allowed' });
  sendRom(req, res);
});
app.head(['/api/rom', '/api/load-game', '/api/rom/:filename'], (req, res) => sendRom(req, res));

app.get(['/health', '/healthz'], (req, res) => res.json({ ok: true, service: 'sonic-adventure-2-web', version: SERVICE_VERSION, uptimeSeconds: Math.floor(process.uptime()), timestamp: new Date().toISOString() }));
app.get('/api/core/capabilities', (req, res) => res.json({ core: 'dolphin-wasm', status: 'unavailable', assets: '/emulator/manifest.json', romFormat: 'rvz', saveState: false, telemetry: false }));

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(port = PORT) {
  return app.listen(port, '0.0.0.0', () => {
  console.log(`[Sonic Adventure 2 Web Player] Server running on port ${port}`);
  console.log(`COOP/COEP headers enabled for WebAssembly`);
  });
}

if (require.main === module) startServer();

module.exports = { app, parseRange, resolveRomPath, ROM_FILENAME, startServer };
