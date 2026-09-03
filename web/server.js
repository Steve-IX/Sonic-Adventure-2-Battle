const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Critical: COOP/COEP headers for SharedArrayBuffer (required for Dolphin WebAssembly threading)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
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

// ROM streaming endpoint (supports range requests for chunked loading)
app.get('/api/rom/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Security: only allow whitelisted ROM files
  if (!filename.match(/^sonic-adventure-2\.(iso|rvz)$/i)) {
    return res.status(403).json({ error: 'ROM not allowed' });
  }
  
  const romPath = path.join(__dirname, 'roms', filename);
  
  // Verify file exists
  if (!fs.existsSync(romPath)) {
    return res.status(404).json({ error: 'ROM not found' });
  }
  
  const stat = fs.statSync(romPath);
  const fileSize = stat.size;
  
  // Handle range requests for streaming large files
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/octet-stream',
      'Cross-Origin-Resource-Policy': 'same-origin'
    });
    
    fs.createReadStream(romPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Cross-Origin-Resource-Policy': 'same-origin'
    });
    fs.createReadStream(romPath).pipe(res);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sonic Adventure 2 Web Player] Server running on port ${PORT}`);
  console.log(`COOP/COEP headers enabled for WebAssembly`);
});
