# Sonic Adventure 2 - Battle (USA) - Reverse Engineering Report

## Project Overview

**Game**: Sonic Adventure 2 - Battle (USA)  
**Platform**: Nintendo GameCube  
**Processor**: PowerPC (Gekko 750 CL @ 485 MHz)  
**Region**: USA (NTSC)  
**Format**: RVZ (WBFS compressed ISO)  
**ROM Hash (SHA-256)**: `38A959996C90405887A895931B17254D5915FDCB65C7561BFF7877CF44C86ED9`  
**Original File Size**: 1.07 GB  
**Date Started**: 2026-09-03

## Research Goals

1. **Static Analysis**: Map PowerPC executable structure, identify main game logic, and asset references
2. **Runtime Analysis**: Use Dolphin emulator with Ghidra debugging to trace game initialization and gameplay loops
3. **Web Deployment**: Package for browser-based playback via Dolphin WebAssembly
4. **Validation**: Corroborate structural findings with runtime evidence

## GameCube Architecture Reference

| Component | Details |
| --- | --- |
| **CPU** | PowerPC Gekko @ 485 MHz |
| **GPU** | ATI Broadway |
| **RAM** | 24 MB embedded DRAM + 24 MB external RAM |
| **Media** | Proprietary optical disc (GCM format) |
| **Filesystem** | Proprietary ISO 9660 variant |

## ROM Analysis Workflow

### Phase 1: Structure Discovery

- [ ] Extract RVZ to ISO using `wit` or Dolphin
- [ ] Parse ISO filesystem and identify game executable (typically `.dol` or `.elf`)
- [ ] Document NARC/archive structure for assets, sounds, scripts
- [ ] Identify boot loader and initialization path
- [ ] Map memory layout and segment sizes

### Phase 2: Static Disassembly

- [ ] Import executable into Ghidra with PowerPC processor module
- [ ] Auto-analyze with Ghidra's decompiler
- [ ] Identify function prologues and control flow
- [ ] Document call graphs and data references
- [ ] Cross-reference with known Sonic Adventure 2 gameplay mechanics

### Phase 3: Runtime Validation

- [ ] Set up Dolphin with GDB debugging backend
- [ ] Connect Ghidra debugger to Dolphin emulator
- [ ] Trace game initialization sequence
- [ ] Instrument key functions and observe runtime behavior
- [ ] Validate static analysis hypotheses with live execution

### Phase 4: Web Deployment

- [ ] Build Dolphin WebAssembly core (emscripten)
- [ ] Create browser-based ROM player interface
- [ ] Implement ROM streaming from local/hosted repository
- [ ] Configure COOP/COEP headers for SharedArrayBuffer
- [ ] Deploy to Railway with persistent Node service

## Findings

### Executable Structure

**Status**: Pending ROM extraction and ISO parsing

### Asset Archives

**Status**: Pending filesystem enumeration

### Key Gameplay Systems

**Status**: Pending disassembly and runtime tracing

## Validation Checklist

- [ ] ROM file integrity confirmed (hash match)
- [ ] ISO extraction successful
- [ ] Executable located and imported to Ghidra
- [ ] PowerPC disassembly validated with known function signatures
- [ ] Dolphin emulation confirmed (unmodified game playable)
- [ ] Debugger connection established
- [ ] Runtime trace captured
- [ ] Web build deployed to staging
- [ ] Browser playback functional

## Legal and Operational Boundaries

- **Original ROM preserved**: Located at `ROMS/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz` — do not modify
- **Research only**: Analysis for educational reverse-engineering; no modifications distributed without authorization
- **Web deployment**: Public deployment mirrors only legal assets (UI, docs); ROM remains user-supplied local file
- **Validation standard**: No claim confirmed without runtime evidence + structural verification

## References

- **Ghidra**: NSA reverse-engineering framework with PowerPC support
- **Dolphin Emulator**: Open-source GameCube/Wii emulator with GDB debugging and WebAssembly builds
- **WORKSPACE_KNOWLEDGE.md**: Workspace-wide reverse-engineering principles and deployment patterns
- **Street Fighter III Project**: Reference for CPS-3 arcade analysis and FBNeo web hosting
- **Pokémon Black Project**: Reference for NDS ROM packaging and web player infrastructure

## Next Steps

1. Extract RVZ to ISO
2. Parse filesystem and locate executable
3. Import to Ghidra and begin static analysis
4. Set up Dolphin debugging infrastructure
5. Begin runtime tracing
