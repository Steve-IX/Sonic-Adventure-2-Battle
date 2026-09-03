# Sonic Adventure 2 - GameCube Reverse Engineering & Web Deployment

This project contains a complete research-to-deployment pipeline for Sonic Adventure 2 - Battle on Nintendo GameCube, following the proven patterns from the Pokémon Black and Street Fighter III projects.

## Project Structure

```
GameCube/SonicAdventure2/
├── ROMS/                          # Original ROM archive (preserved, unmodified)
│   └── Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz
├── inventory.json                 # ROM metadata and validation hashes
├── REVERSE_ENGINEERING_REPORT.md  # Detailed research findings and methodology
├── analysis/                       # Ghidra projects and debugger sessions
├── tools/                          # Python scripts for ROM inspection and analysis
│   └── inspect_gamecube.py        # RVZ/ISO parsing and structure discovery
├── research/                       # Documentation, notes, and discoveries
└── web/                            # Browser-based emulator deployment
    ├── server.js                  # Express.js with COOP/COEP headers
    ├── package.json               # Node dependencies
    ├── Dockerfile                 # Container for Railway deployment
    ├── railway.json               # Railway platform configuration
    └── public/
        └── index.html             # Dolphin emulator UI
```

## Phase 1: ROM Analysis (Current)

### Validation & Inventory

The ROM has been validated and cataloged:

- **File**: `Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz`
- **SHA-256**: `38A959996C90405887A895931B17254D5915FDCB65C7561BFF7877CF44C86ED9`
- **Size**: 1.07 GB (RVZ compressed format)
- **Status**: Preserved and ready for analysis

Run the inspection tool to generate detailed metadata:

```bash
cd GameCube/SonicAdventure2
python3 tools/inspect_gamecube.py "ROMS/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz"
```

### Static Disassembly Workflow

1. **Extract ISO**: Use `wit` or Dolphin to decompress RVZ → ISO
2. **Parse Filesystem**: Identify executable, NARC archives, and asset structure
3. **Import to Ghidra**: Load PowerPC executable with Ghidra's processor module
4. **Analyze**: Auto-decompile, identify functions, cross-reference data
5. **Document**: Record findings in `REVERSE_ENGINEERING_REPORT.md`

### Runtime Validation

1. **Set Up Dolphin Debugger**: Install Dolphin emulator with GDB backend
2. **Connect Ghidra Debugger**: Bridge Ghidra's debugger to Dolphin via GDB
3. **Trace Execution**: Instrument key functions and observe runtime behavior
4. **Validate**: Corroborate static analysis with live execution evidence

## Phase 2: Web Deployment

### Browser Emulator Setup

The web deployment uses a containerized Dolphin WebAssembly build with proper COOP/COEP headers for SharedArrayBuffer support.

**Key Infrastructure:**

- **Server**: Express.js with COOP/COEP headers for browser threading
- **ROM Streaming**: Range request support for chunked loading
- **UI**: React-based player with keyboard/controller input
- **Container**: Docker image for Railway platform
- **Deployment**: Railway persistent Node service

### Local Development

1. **Install dependencies**:
   ```bash
   cd web
   npm install
   ```

2. **Create roms directory and place ISO**:
   ```bash
   mkdir -p web/roms
   cp /path/to/sonic-adventure-2.iso web/roms/
   ```

3. **Start server**:
   ```bash
   npm start
   ```

4. **Access at**: `http://localhost:3000`

### Railway Deployment

1. **Link Railway project** to this repository
2. **Deploy**: Railway will auto-detect Dockerfile and deploy
3. **Environment variables**: Set `PORT=3000` (Railway handles this by default)
4. **ROM handling**: Mount ROM volume or stream from URL endpoint

### Critical Headers

The `server.js` enforces these headers for WebAssembly threading:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

These are **required** for SharedArrayBuffer and multi-threaded WASM.

## Emulator Integration: Dolphin WebAssembly

Dolphin emulator is built to WebAssembly via Emscripten. The build includes:

- PowerPC CPU emulation (JIT compiled)
- GPU backend (OpenGL → WebGL)
- Audio system (Web Audio API)
- Input handling (keyboard/gamepad)

### Building Dolphin WebAssembly

If needed to rebuild:

```bash
# Clone Dolphin source
git clone https://github.com/dolphin-emu/dolphin.git

# Build for WebAssembly (emscripten required)
cd dolphin
mkdir build && cd build
emconfigure cmake -DENABLE_HEADLESS=ON ..
make -j$(nproc)
```

Pre-built Dolphin WebAssembly modules are included in `web/public/dolphin/`.

## Validation Checklist

- [x] ROM validated and archived
- [x] Inventory metadata created
- [ ] RVZ extracted to ISO
- [ ] GameCube filesystem parsed
- [ ] Executable located and documented
- [ ] Ghidra project created with PowerPC processor
- [ ] Static disassembly performed
- [ ] Dolphin emulator tested (unmodified game)
- [ ] Debugger connection validated
- [ ] Web UI implemented
- [ ] Server COOP/COEP headers tested
- [ ] Docker image built and tested locally
- [ ] Deployed to Railway staging
- [ ] Browser playback validated

## Legal & Operational Boundaries

### What is preserved and protected

- ✅ Original RVZ dump (never modified, never distributed)
- ✅ Research documentation and analysis
- ✅ Tools, scripts, and validation code
- ✅ Web UI and emulator infrastructure

### What is NOT distributed

- ❌ Full ROM or derived ISO (user must provide)
- ❌ Proprietary game assets
- ❌ Copyrighted content

### Public deployment rules

- **User-supplied ROM**: Web player accepts ROM from user's local file system
- **Legal distribution only**: Only serve legal assets (UI, docs, open-source emulator)
- **Manifest + patch model**: For authorized modifications, distribute patch + manifest, never full ROM

## References

- [Ghidra Documentation](https://github.com/NationalSecurityAgency/ghidra)
- [Dolphin Emulator](https://dolphin-emu.org/)
- [GameCube Architecture](https://en.wikipedia.org/wiki/GameCube)
- [WORKSPACE_KNOWLEDGE.md](../../WORKSPACE_KNOWLEDGE.md) — Workspace reverse-engineering principles
- [Pokémon Black Project](../../Pokemon/) — Reference for NDS ROM research and web hosting
- [Street Fighter III Project](../../StreetFighter/) — Reference for arcade ROM analysis and FBNeo web deployment

## Next Steps

1. Extract RVZ to ISO using Dolphin or `wit` tool
2. Analyze GameCube filesystem and locate executable
3. Import executable to Ghidra with PowerPC processor
4. Begin static disassembly and function identification
5. Set up Dolphin debugger for runtime tracing
6. Integrate Dolphin WebAssembly core into web UI
7. Test local deployment
8. Deploy to Railway

## Contributing

Research findings, static analysis discoveries, and runtime traces should be documented in `REVERSE_ENGINEERING_REPORT.md`.

Follow the workspace principles:
- Preserve originals, work from copies
- Make one scoped change, validate with runtime evidence
- Keep all modifications reproducible
- Document assumptions, offsets, and validation evidence
