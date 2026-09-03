# Sonic Adventure 2 - GameCube Reverse Engineering - Quick Start Guide

This guide walks you through setting up the analysis environment and beginning static/runtime research.

## Prerequisites

Before starting, ensure you have:

- **Ghidra** (latest release): https://github.com/NationalSecurityAgency/ghidra/releases
- **Dolphin Emulator**: https://dolphin-emu.org/download/
- **Python 3.9+**: For ROM parsing and analysis scripts
- **Node.js 18+**: For web deployment (optional for research phase)
- **wit** utility (optional): For RVZ decompression: https://wit.wiimm.de/
- **Git**: For version control

## Step 1: Validate ROM

The ROM has already been validated with SHA-256 hash. Verify it:

```bash
cd GameCube/SonicAdventure2
python3 tools/inspect_gamecube.py "ROMS/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz"
```

Expected output shows:
- File size: 1.07 GB
- Format: RVZ (WBFS compressed)
- Status: OK

## Step 2: Extract ISO

The RVZ file is compressed. Extract it to a usable ISO:

### Option A: Using Dolphin (GUI)
1. Open Dolphin Emulator
2. Select Tools → ISO Tools
3. Select "Extract ISO"
4. Choose the RVZ file
5. Save as ISO

### Option B: Using `wit` (command-line)
```bash
# Install wit (Windows: download from https://wit.wiimm.de/)
wit extract ROMS/Sonic\ Adventure\ 2\ -\ Battle\ \(USA\)\ \(En,Ja,Fr,De,Es\).rvz -D extracted/
```

## Step 3: Parse GameCube Filesystem

Once extracted, examine the ISO structure:

```bash
# List ISO contents (requires parsed extraction)
# Typically finds files like:
# - sys/ (system files, boot loader)
# - files/ (game executable, assets)
```

Document findings in `REVERSE_ENGINEERING_REPORT.md`.

## Step 4: Create Ghidra Project

1. **Open Ghidra**
   ```bash
   ghidraRun.bat  # Windows
   ghidra.sh      # Linux/Mac
   ```

2. **Create new project**
   - File → New Project
   - Location: `GameCube/SonicAdventure2/analysis/`
   - Project Name: `sonic_adventure_2_ppc`

3. **Import executable**
   - Right-click project → Import File
   - Select main executable (`.dol` or `.elf`)
   - Processor: **PowerPC 750** (Gekko)
   - Format: **Mach-O** or **ELF** (as appropriate)

4. **Auto-analyze**
   - Right-click imported file → Analyze
   - Use default settings for first pass

## Step 5: Set Up Dolphin Debugger

1. **Enable GDB stub in Dolphin**
   - Dolphin Settings → Debug → CPU
   - Check "Enable GDB Stub"
   - Default port: 3333

2. **Connect Ghidra Debugger**
   - In Ghidra: Window → Debugger
   - Create GDB connection
   - Host: `localhost` Port: `3333`
   - Attach to running Dolphin process

3. **Run game in Dolphin**
   - File → Open ISO → Select Sonic Adventure 2 ISO
   - Click Start

4. **Trace execution**
   - Set breakpoints in Ghidra at suspected game logic
   - Step through code
   - Observe registers and memory

## Step 6: Static Analysis Checklist

Identify and document these key components:

- [ ] **Boot loader**: Entry point and initialization sequence
- [ ] **Main loop**: Game state machine and frame loop
- [ ] **Input handling**: Controller input processing
- [ ] **Physics system**: Movement, collision, gravity
- [ ] **Graphics**: Rendering pipeline and texture management
- [ ] **Audio**: Sound loading and playback
- [ ] **Asset loading**: How NARCs and game files are loaded
- [ ] **State management**: Menu, gameplay, cutscene transitions

## Step 7: Create ROM Modification (Optional)

Once you understand the structure:

1. Create a **patch script** (Python) that modifies specific bytes
2. **Document the patch**: offset, original bytes, new bytes, purpose
3. **Test with unmodified ROM first** to establish baseline behavior
4. **Apply patch and test** in Dolphin
5. **Validate patch** with runtime evidence and screenshots

Example patch structure:

```python
# tools/patch_sonic_adventure_2.py
ROM_OFFSET = 0x12AB00  # Example offset
ORIGINAL_BYTES = bytes([0x48, 0x00, 0x12, 0x34])
NEW_BYTES = bytes([0x60, 0x00, 0x00, 0x00])  # NOP
DESCRIPTION = "Disable specific game function for testing"
```

## Step 8: Deploy to Web (Advanced)

Once research is complete:

```bash
cd web
npm install
npm start
# Access at http://localhost:3000
```

Then deploy to Railway:
```bash
railway link  # Link to Railway project
railway up    # Deploy
```

## Key Files to Update

As you make discoveries, update these files:

- **REVERSE_ENGINEERING_REPORT.md**: Add findings, offsets, and validation evidence
- **research/*.md**: Create detailed notes on subsystems
- **tools/*.py**: Add analysis utilities as needed

## Validation Guidelines

Before claiming a finding is confirmed:

1. **Static evidence**: Show disassembly and code structure
2. **Runtime evidence**: Demonstrate with debugger trace
3. **Reproduction**: Document exact steps to reproduce
4. **Correlation**: Cross-reference with known game behavior

## Troubleshooting

### "RVZ format detected; requires decompression"
- Extract ISO using Dolphin GUI or `wit` utility

### Ghidra doesn't recognize executable
- Verify processor: PowerPC 750 (Gekko)
- Check file format: Mach-O or ELF
- Verify it's the main game executable, not a loader stub

### Dolphin debugger won't connect
- Ensure GDB stub is enabled in Dolphin
- Check port 3333 is not in use
- Restart Dolphin and Ghidra debugger

### Game doesn't run in unmodified Dolphin
- Verify ISO was extracted correctly
- Update Dolphin to latest version
- Check Dolphin compatibility reports

## References

- Reverse Engineering Report: [REVERSE_ENGINEERING_REPORT.md](REVERSE_ENGINEERING_REPORT.md)
- Project README: [README.md](README.md)
- Workspace Knowledge: [../../WORKSPACE_KNOWLEDGE.md](../../WORKSPACE_KNOWLEDGE.md)
- Ghidra Docs: https://ghidra-sre.org/
- Dolphin Docs: https://dolphin-emu.org/docs/
- PowerPC Reference: IBM POWER ISA

## Next Steps

1. Extract RVZ to ISO
2. Locate main executable in ISO
3. Create Ghidra project and import executable
4. Perform initial auto-analysis
5. Set up Dolphin GDB debugging
6. Begin static disassembly
7. Trace game initialization in debugger
8. Document findings
