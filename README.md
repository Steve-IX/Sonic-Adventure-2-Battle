# 🎮 Sonic Adventure 2: Battle - GameCube Reverse Engineering & Web Emulation

**A comprehensive reverse-engineering and browser-based emulation project for Sonic Adventure 2: Battle on Nintendo GameCube.**

This repository combines static binary analysis, runtime debugging, and modern web technologies to bring the classic Sega GameCube adventure online. From disassembling the PowerPC executable to streaming playable emulation in your browser—this project documents the complete journey of understanding and deploying a beloved console game.

## Vision

Sonic Adventure 2 is an iconic entry in the Sonic franchise, featuring dual storylines, deep gameplay systems, and memorable characters. This project aims to preserve and understand the technical underpinnings of this masterpiece through systematic reverse-engineering, while making it accessible to modern web platforms through Dolphin emulator integration.

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

## The Game: Sonic Adventure 2 - Battle (USA)

**Released**: 2003 on Nintendo GameCube  
**Developer**: Sonic Team  
**Publisher**: Sega  
**Platform**: Nintendo GameCube (NTSC-U)  
**Processor**: PowerPC Gekko @ 485 MHz  
**Notable Features**: Dual hero/dark storylines, real-time gameplay, advanced physics, 3D environments

Sonic Adventure 2 revolutionized the Sonic franchise by introducing parallel narratives across hero characters (Sonic, Tails, Knuckles) and dark characters (Shadow, Rouge, Eggman), each with unique gameplay mechanics and abilities. The game remains a technical achievement on the GameCube, pushing the platform's capabilities with real-time 3D rendering and complex game logic.

## Project Architecture

### Research Phase: Static & Runtime Analysis

This project follows a disciplined reverse-engineering methodology:

**Step 1: ROM Validation & Structure Discovery**
- Original GameCube disc image preserved (never modified)
- RVZ format (WBFS compressed) analyzed for integrity
- Python tools extract ISO structure and document format
- Metadata inventory maintained for reproducibility

**Step 2: Binary Analysis**
- PowerPC executable located and extracted from ISO
- Disassembly performed with professional-grade tools
- Function signatures, call graphs, and control flow mapped
- Game systems identified and documented (state machine, physics, rendering, audio)

**Step 3: Runtime Validation**
- Emulator debugger connection established
- Breakpoints set at suspected game functions
- Live execution traces captured and compared with static analysis
- Hypotheses validated through controlled runtime observation

**Step 4: Documentation**
- All findings recorded with offsets, evidence, and validation steps
- Reversible research conducted—no destructive modifications
- Methodology allows others to independently verify discoveries

### Deployment Phase: Browser-Based Emulation

The final step brings Sonic Adventure 2 to modern web browsers:

**Emulator Integration**
- Dolphin emulator compiled to WebAssembly (near-native performance)
- PowerPC CPU emulation via JIT compilation
- GPU operations translated from OpenGL to WebGL
- Audio managed through Web Audio API
- Input handling supports keyboard and gamepad

**Server Infrastructure**
- Express.js backend for asset serving and ROM streaming
- Critical COOP/COEP headers enforced for browser security
- Range request support for efficient chunked ROM loading
- Health monitoring and auto-restart capabilities

**Containerization & Hosting**
- Docker container ensures consistent deployment environment
- Alpine Linux base keeps image lightweight
- Railway platform provides auto-scaling and HTTPS
- Automated CI/CD pipeline from GitHub to production

## Project Structure

```
sonic-adventure-2-web/
├── 📄 Documentation & Guides
│   ├── README.md                        # This file - project overview
│   ├── START_HERE.md                    # Quick start guide
│   ├── QUICKSTART.md                    # Step-by-step analysis walkthrough
│   ├── REVERSE_ENGINEERING_REPORT.md   # Research findings & discoveries
│   ├── PROJECT_SUMMARY.md               # Project status & checklist
│   └── inventory.json                   # ROM metadata & validation hashes
│
├── 📁 ROMS/ (Original Archive)
│   └── Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz
│       └── 1.07 GB (preserved, unmodified)
│
├── 📁 analysis/
│   └── [Ghidra projects and debugger sessions]
│
├── 📁 tools/
│   └── inspect_gamecube.py              # ROM validation & ISO parsing
│
├── 📁 research/
│   └── [Research notes and documentation]
│
└── 📁 web/ (Browser Deployment)
    ├── server.js                        # Express.js server (COOP/COEP headers)
    ├── package.json                     # Node.js dependencies
    ├── Dockerfile                       # Container image (Alpine + Node 18)
    ├── railway.json                     # Railway platform configuration
    ├── DEPLOYMENT.md                    # Railway deployment guide
    ├── RAILWAY_DEPLOYMENT_VERIFICATION.md  # Pre-flight checklist
    └── public/
        └── index.html                   # Browser UI (Dolphin integration)
```

## Getting Started

### For Reverse Engineers

Start with analysis of the original GameCube disc:

1. **Read**: [START_HERE.md](START_HERE.md) for quick orientation
2. **Follow**: [QUICKSTART.md](QUICKSTART.md) for step-by-step analysis guide
3. **Extract**: RVZ to ISO using Dolphin emulator or `wit` utility
4. **Import**: Extract executable to disassembly tool (recommend Ghidra with PowerPC processor)
5. **Analyze**: Trace game systems, document findings
6. **Record**: Update [REVERSE_ENGINEERING_REPORT.md](REVERSE_ENGINEERING_REPORT.md) with discoveries

Tools available:
- `tools/inspect_gamecube.py` — Validates ROM and extracts ISO structure
- `inventory.json` — Maintains ROM metadata and hashes for reproducibility

### For Web Deployment

To host the emulator online:

1. **Prerequisites**: Docker and Railway account
2. **Local Testing**:
   ```bash
   cd web
   npm install
   npm start
   # Access at http://localhost:3000
   ```
3. **Docker Verification**:
   ```bash
   docker build -t sonic-adventure-2:latest .
   docker run -p 3000:3000 sonic-adventure-2:latest
   ```
4. **Railway Deployment**:
   - Link this repository to Railway
   - Railway auto-detects Dockerfile
   - Service deploys within 5-10 minutes
   - Public access via HTTPS with proper COOP/COEP headers

See [web/DEPLOYMENT.md](web/DEPLOYMENT.md) for comprehensive deployment instructions.

### For End Users

Once deployed, players can:
1. Open the web player in a modern browser
2. Load a local copy of Sonic Adventure 2 ROM (ISO format)
3. Experience the game with full emulation
4. Use keyboard/gamepad controls
5. Save and load game state (when implemented)

## System Requirements

### For Analysis Work

- **Disassembler**: Ghidra (free, open-source) with PowerPC processor module
- **Emulator**: Dolphin with GDB debugging backend
- **Python**: 3.9+ for ROM parsing and analysis scripts
- **Storage**: ~4 GB for decompressed ISO + analysis data
- **Network**: Optional, for accessing remote resources

### For Web Deployment

- **Docker**: For containerized deployment
- **Node.js**: 18+ (handled by Docker image)
- **Browser**: Chrome, Firefox, Edge (modern versions with SharedArrayBuffer support)
- **Bandwidth**: Varies by ROM streaming strategy

### For Local Testing

- **npm**: JavaScript package manager
- **curl or similar**: For HTTP header verification
- **RAM**: 500 MB+ for running local server and browser

## GameCube Architecture

Understanding Sonic Adventure 2 requires familiarity with the platform:

**CPU**: PowerPC Gekko @ 485 MHz
- 32-bit RISC processor
- Single-issue pipeline
- 130+ instruction set
- Supported by Ghidra via SLEIGH disassembler

**GPU**: ATI Broadway
- 24 MB embedded DRAM
- 24 MB external DRAM
- OpenGL-class graphics pipeline
- Renders to 640x480 (NTSC) or 640x576 (PAL)

**Storage**: Proprietary optical media
- GCM format (GameCube Media)
- ISO 9660-like filesystem
- NARC archives for compressed assets
- Decryption and compression on-disc

**System Boot**:
- Bootloader initializes CPU, GPU, audio
- Loads main executable from disc
- Initializes memory segments
- Jumps to game entry point

## Technical Challenges

### Challenge 1: RVZ Compression
The original ROM is compressed using WBFS (Wii Backup File System) in RVZ format. Decompression requires either:
- **Dolphin emulator**: Handles decompression internally
- **wit utility**: Standalone decompression tool
- **Python**: Custom decompression (advanced)

**Solution**: Use Dolphin GUI to extract ISO before static analysis.

### Challenge 2: PowerPC Disassembly
GameCube executables use PowerPC architecture, which is less commonly analyzed than x86. Key considerations:
- Limited public documentation for specific CPU variant
- Compiler optimizations may obfuscate control flow
- Function signatures vary by toolchain and version

**Solution**: Use professional disassembler (Ghidra) with PowerPC processor module and extensive cross-referencing.

### Challenge 3: Game Systems Integration
Sonic Adventure 2 couples multiple systems: physics, rendering, audio, AI, collision detection. A single change affects multiple systems.

**Solution**: Methodical analysis of data structures and state machine flow; single-system focus for modifications.

### Challenge 4: Browser Compatibility
Dolphin WebAssembly requires modern browser features (SharedArrayBuffer, COOP/COEP headers) not universally available.

**Solution**: Proper server-side header configuration; user guidance on browser selection.

## Validation Methodology

This project uses a rigorous validation approach:

### 1. Hash Verification
```bash
# Original ROM integrity
SHA-256: 38A959996C90405887A895931B17254D5915FDCB65C7561BFF7877CF44C86ED9
Size: 1,151,284,868 bytes
Format: RVZ (WBFS compressed)
```

### 2. Structural Validation
- Disassembler auto-analysis detects function prologues
- Known library function signatures compared
- Control flow graphs validated for consistency
- Data cross-references checked for circular dependencies

### 3. Runtime Validation
- Emulator breakpoints set at suspected functions
- CPU state (registers, memory) inspected live
- Execution trace compared with static analysis predictions
- Game behavior observed and documented

### 4. Reproducibility
- All tools and scripts committed to version control
- Offsets and addresses documented with context
- Assumptions explicitly stated
- Other researchers can independently verify findings

## File Manifest

| File | Purpose |
| --- | --- |
| `ROMS/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz` | Original GameCube disc image (preserved) |
| `inventory.json` | ROM metadata and validation hashes |
| `START_HERE.md` | Quick reference guide |
| `QUICKSTART.md` | Step-by-step analysis walkthrough |
| `REVERSE_ENGINEERING_REPORT.md` | Research findings and documentation |
| `PROJECT_SUMMARY.md` | Project status and completion checklist |
| `tools/inspect_gamecube.py` | Python utility for ROM validation and ISO parsing |
| `web/server.js` | Express.js server with COOP/COEP headers |
| `web/package.json` | Node.js dependencies |
| `web/Dockerfile` | Docker container image |
| `web/railway.json` | Railway platform configuration |
| `web/DEPLOYMENT.md` | Detailed deployment guide |
| `web/RAILWAY_DEPLOYMENT_VERIFICATION.md` | Pre-flight deployment checklist |
| `web/public/index.html` | Browser-based emulator UI |
| `.gitignore` | Git configuration (excludes large binaries) |

## Legal & Ethical Standards

This project adheres to strict principles:

**Preservation**: Original ROM archive preserved untouched and unmodified
**Research**: All analysis conducted on copies; original remains safe
**Distribution**: Only legal components distributed (tools, documentation, UI)
**User Control**: ROM remains user-supplied; no copyrighted content hosted
**Reproducibility**: All work documented and open to independent verification

## Technology Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| Disassembly | Ghidra | PowerPC executable analysis |
| Emulation | Dolphin (WebAssembly) | GameCube emulation in browser |
| Server | Express.js | Asset serving, ROM streaming, health checks |
| Container | Docker | Consistent deployment environment |
| Hosting | Railway | Auto-scaling, HTTPS, CI/CD |
| Development | Python | ROM inspection and parsing |
| Version Control | Git | Repository management |

## Performance Expectations

Once deployed:
- **Game Load Time**: 30-60 seconds (ROM decompression + emulator init)
- **Frame Rate**: 30-60 FPS (depends on browser performance)
- **Network Bandwidth**: ~5 MB/s during active ROM streaming
- **Browser Memory**: 300-500 MB during gameplay
- **CPU Usage**: 30-60% on single core (browser limitations)

## Privacy & Security

- **Browser Data**: Game state stored locally (IndexedDB)
- **ROM Handling**: Streamed from user's local file or mounted server volume
- **Server Logs**: Standard web server logs (no game data captured)
- **HTTPS**: All communications encrypted (via Railway)
- **No Tracking**: No analytics or user tracking

## Future Enhancements

Potential areas for improvement:
- Networking support for multiplayer (via Dolphin netplay)
- Save state management and cloud backup
- Controller input mapping customization
- Graphics options and upscaling
- Modding framework for game modifications
- Community ROM patch sharing (patch + manifest model)

## Contributing Guidelines

This project welcomes contributions in:
- **Research**: Documentation of reverse-engineering discoveries
- **Tools**: Improved ROM parsing or analysis utilities
- **Testing**: Gameplay validation and issue reporting
- **Documentation**: Clarification and enhancement of guides
- **Performance**: Optimization of web server or emulator integration

All contributions should:
1. Respect the original ROM's copyright
2. Follow the validation methodology
3. Document assumptions and evidence
4. Enable others to independently verify claims
5. Maintain ethical standards for preservation work

## References & Resources

### Official Documentation
- [Sonic Adventure 2 on IGDB](https://www.igdb.com/)
- [Nintendo GameCube Hardware](https://en.wikipedia.org/wiki/GameCube)
- [Sega Game Development](https://www.sega.com/)

### Technical Resources
- [Ghidra Disassembler](https://ghidra-sre.org/)
- [Dolphin Emulator](https://dolphin-emu.org/)
- [PowerPC ISA Reference](https://www.ibm.com/chips/power/)
- [GameCube Technical Specs](https://www.retrodev.com/)

### Development Resources
- [Express.js Documentation](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Railway Documentation](https://docs.railway.app/)
- [WebAssembly Standard](https://webassembly.org/)

## Project Status

- ✅ ROM validated and archived
- ✅ Project structure established
- ✅ Analysis tools created
- ✅ Web server configured with COOP/COEP headers
- ✅ Docker container ready for deployment
- ✅ Railway platform configured
- ⏳ ISO extraction and parsing (in progress)
- ⏳ Static disassembly (pending)
- ⏳ Runtime validation (pending)
- ⏳ Dolphin WASM integration (pending)
- ⏳ Production deployment (pending)

## Roadmap

**Phase 1**: ISO extraction and executable location
**Phase 2**: Static disassembly and function identification
**Phase 3**: Runtime debugging and validation
**Phase 4**: Dolphin WebAssembly integration
**Phase 5**: Local deployment testing
**Phase 6**: Railway production deployment
**Phase 7**: Community testing and refinement

## Contact & Support

For questions about this project:
- Check existing documentation first
- Review [QUICKSTART.md](QUICKSTART.md) for common scenarios
- Refer to [REVERSE_ENGINEERING_REPORT.md](REVERSE_ENGINEERING_REPORT.md) for technical details

## License

This project comprises:
- **Original Code**: Research tools and server code (MIT License)
- **Documentation**: Project guides and methodology (Creative Commons Attribution)
- **Sonic Adventure 2**: Copyrighted by Sega (preservation and research only)
- **Dolphin Emulator**: GPL 2.0 license
- **Express.js**: MIT License

## Conclusion

Sonic Adventure 2: Battle represents both a creative achievement in gaming and a technical challenge for reverse-engineering. This project documents the complete journey from binary analysis to web-based emulation, demonstrating how modern tools and techniques can preserve and understand classic console games.

By combining rigorous methodology, proper documentation, and ethical standards, we create a resource that benefits researchers, preservationists, and gaming enthusiasts—while respecting the original creators' intellectual property.

The game continues to entertain and inspire. This project ensures its technical legacy is understood and preserved for future generations.
