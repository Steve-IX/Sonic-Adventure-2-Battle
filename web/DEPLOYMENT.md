# Sonic Adventure 2 - Railway Web Deployment Guide

This guide covers deploying the Sonic Adventure 2 web player to Railway.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Web Browser (Client)                       │
│  - HTML5 Canvas                                             │
│  - Keyboard/Gamepad Input                                   │
│  - Dolphin.js (WASM)                                        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS + COOP/COEP Headers
┌────────────────▼────────────────────────────────────────────┐
│            Railway Hosted Node.js Service                   │
│  - Express.js Server                                        │
│  - COOP/COEP Headers (SharedArrayBuffer support)            │
│  - ROM Streaming (Range Requests)                           │
│  - Static Asset Serving                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Storage / ROM Sources                          │
│  - Local ROM directory (Docker volume mount)                │
│  - Or: Remote URL streaming                                 │
│  - Or: IndexedDB client-side caching                        │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Railway Account**: https://railway.app/
2. **GitHub Repository**: Push this project to GitHub
3. **Dolphin WebAssembly Build**: A pinned, distributable build installed in `web/public/emulator/`; the current repository intentionally has the manifest but not the core binaries
4. **Node.js 18+**: For local testing
5. **Docker**: For local container testing

## Local Development & Testing

### 1. Install Dependencies

```bash
cd GameCube/SonicAdventure2/web
npm install
```

### 2. Set Up ROM Directory

```bash
# Create ROM directory in web/
mkdir -p ../ROMS

# Place ISO file (or RVZ) - will be extracted by Dolphin on first load
cp "/path/to/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz" ../ROMS/
```

### 3. Run Development Server

```bash
npm start
# Server runs on http://localhost:3000
# COOP/COEP headers automatically set
```

### 4. Test in Browser

```bash
# Open http://localhost:3000 in a modern browser
# The page checks /api/rom/metadata and enables Play only when the image and core are ready.
# Test keyboard controls
```

### 5. Build Docker Image Locally

```bash
cd GameCube/SonicAdventure2/web

# Build image
docker build -t sonic-adventure-2:latest .

# Run container
docker run -p 3000:3000 \
   -v $(pwd)/../ROMS:/app/ROMS \
  sonic-adventure-2:latest

# Test at http://localhost:3000
```

## Railway Deployment

### Step 1: Push Project to GitHub

```bash
cd /path/to/ghidra/GameCube/SonicAdventure2

# Initialize git (if needed)
git init

# Add files
git add .
git commit -m "Initial Sonic Adventure 2 GameCube web deployment"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/sonic-adventure-2-web.git
git branch -M main
git push -u origin main
```

### Step 2: Create Railway Project

1. **Log in to Railway**: https://railway.app/
2. **New Project** → **Deploy from GitHub**
3. **Select Repository**: Choose `sonic-adventure-2-web`
4. **Auto-detect**: Railway should detect Dockerfile
5. **Configure**:
   - Name: `sonic-adventure-2-web`
   - Environment: `production`

### Step 3: Set Environment Variables

In Railway Dashboard:

1. **Variables Tab**
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Railway sets automatically)

### Step 4: Configure Volumes

If hosting the ROM on Railway:

1. **Storage Tab** → **Add Storage**
2. **Mount Path**: `/app/ROMS`
3. **Size**: At least 2GB for the RVZ image and runtime headroom
4. Set `ROM_PATH` to `/app/ROMS/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz`

### Step 5: Configure Domain

1. **Settings Tab** → **Domain**
2. Railway provides auto-generated domain: `sonic-adventure-2-web.up.railway.app`
3. **(Optional)** Add custom domain via CNAME

### Step 6: Deploy

1. **Deployments Tab** → **Deploy**
2. Railway builds Docker image and starts container
3. Monitor logs for startup messages
4. Once healthy, service is live

## Critical Headers Validation

Verify COOP/COEP headers are properly set:

```bash
# Check response headers
curl -I https://sonic-adventure-2-web.up.railway.app/

# Expected headers:
# Cross-Origin-Opener-Policy: same-origin
# Cross-Origin-Embedder-Policy: require-corp
# Cross-Origin-Resource-Policy: same-origin
```

If headers are missing, Dolphin WASM threading will fail.

## ROM Handling Strategies

### Strategy 1: Authorized mounted RVZ

- Mount the authorized RVZ through `ROM_PATH` or `/app/ROMS`.
- The browser requests `/api/rom/metadata` on load.
- The browser fetches `/api/rom` after Play is clicked.
- The image must not be committed or publicly redistributed without rights.

The frontend checks `/api/rom/metadata` on load and fetches `/api/rom` only after Play is enabled. No file picker is required.

### Strategy 2: Server-Side Streaming

- Server stores ROM (mounted volume)
- Browser requests chunks via `/api/rom`
- `server.js` handles range requests

**Implementation**:
```javascript
fetch('/api/rom', {
  headers: { 'Range': 'bytes=0-1048575' }
}).then(response => response.arrayBuffer())
  .then(data => dolphin.loadROMChunk(data));
```

### Strategy 3: IndexedDB Client-Side Caching

- First load: download ROM, store in IndexedDB
- Subsequent loads: load from IndexedDB (fast)
- Requires 3.5+ GB available storage

**Implementation**:
```javascript
// Cache ISO to IndexedDB on first load
const db = await openDB('sonic-adventure-2');
await db.put('roms', { id: 'sa2', data: isoBuffer });

// Load from cache
const cached = await db.get('roms', 'sa2');
if (cached) dolphin.loadROM(cached.data);
```

## Monitoring & Logs

### View Deployment Logs

```bash
# Via Railway CLI
railway logs

# Or use Railway Dashboard → Deployments → Logs
```

### Check Health Status

```bash
curl https://sonic-adventure-2-web.up.railway.app/health
# Expected: { "status": "ok", "timestamp": "..." }
```

### Monitor Performance

- Check CPU/memory in Railway Dashboard
- Typical idle: <100MB memory, <5% CPU
- During gameplay: 200-500MB memory, 30-60% CPU

## Troubleshooting

### COOP/COEP Headers Missing

**Symptom**: "Cannot use SharedArrayBuffer" error in browser

**Fix**:
1. Verify `server.js` middleware is in place
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)

### ROM Upload Fails

**Symptom**: "File too large" or timeout

**Possible causes**:
- Browser file size limit
- Railway timeout (30s)
- Insufficient memory

**Fix**:
- Use smaller ISO if possible
- Implement chunked upload in `public/index.html`
- Increase Railway timeout or use streaming

### Dolphin WASM Fails to Load

**Symptom**: Black canvas, no error message

**Possible causes**:
- WASM not served with correct MIME type
- Missing CORS headers
- Outdated browser

**Fix**:
1. Verify `dolphin.wasm` MIME type is `application/wasm`
2. Update Node.js `express` middleware
3. Test in latest Chrome/Firefox

### Railway Deployment Fails

**Check logs**:
```bash
railway logs --timestamp
```

Common issues:
- Node.js version mismatch: Update `package.json` engines
- Missing dependencies: Run `npm install` and commit `package-lock.json`
- Dockerfile syntax error: Validate with `docker build`

## Scaling & Optimization

### For Higher Traffic

1. **Enable Railway Auto-scaling**
   - Settings → Deployment → Replicas: 2-3

2. **Use CDN for Static Assets**
   - Cloudflare CDN in front of Railway
   - Cache `index.html`, `dolphin.js`, `dolphin.wasm`

3. **Client-Side Caching**
   - Set `Cache-Control` headers for WASM/JS
   - Use ServiceWorker for offline support

### Performance Tuning

1. **Reduce ROM Load Time**
   - Use RVZ compression (stored, streamed)
   - Implement IndexedDB caching
   - Parallel chunk loading

2. **Optimize Emulator**
   - Use Dolphin JIT (default enabled in WebAssembly)
   - Reduce graphics resolution if needed
   - Enable audio downsampling

## Deployment Checklist

- [ ] GitHub repository created and updated
- [ ] Dockerfile builds successfully locally
- [ ] Docker image runs locally with correct headers
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] Domain assigned (auto or custom)
- [ ] Deployment pipeline triggered
- [ ] Health check endpoint responding
- [ ] COOP/COEP headers verified
- [ ] ROM loading tested
- [ ] Keyboard input working
- [ ] Audio/video playback smooth
- [ ] No console errors in browser

## Maintenance

### After Deployment

1. Monitor logs for errors
2. Check health endpoint daily
3. Test gameplay occasionally
4. Update Node.js/dependencies monthly
5. Document any issues in GitHub issues

### Rollback

If deployment fails:

```bash
railway rollback  # Reverts to previous deployment
```

## References

- Railway Docs: https://docs.railway.app/
- Express.js CORS: https://expressjs.com/
- Dolphin WebAssembly: https://dolphin-emu.org/
- WASM COOP/COEP: https://web.dev/coop-coep/
- HTTP Range Requests: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range

## Support

For deployment issues:
1. Check Railway status: https://status.railway.app/
2. Review deployment logs via Railway CLI
3. Verify COOP/COEP headers with curl
4. Test Dolphin WASM locally in browser console
