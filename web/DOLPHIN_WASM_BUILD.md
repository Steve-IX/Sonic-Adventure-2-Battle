# Dolphin WebAssembly Core Contract

## Current State

This repository does not contain a Dolphin WebAssembly core. The browser correctly keeps Play disabled until a compatible core is installed under `web/public/emulator/` and the manifest is changed from `unavailable` to `ready`.

A native Dolphin release is not automatically a browser-compatible WebAssembly runtime. A real browser build must provide the JavaScript/WASM adapter used by the page and must be legally redistributable under its upstream license and notices. The official `dolphin-emu/dolphin` source currently has no supported Emscripten/browser target or published browser artifact.

### Port progress

- Emscripten 6.0.9 is installed in the local ignored toolchain and successfully compiles a minimal WASM module.
- The pinned Dolphin source reaches its platform guard, then rejects the 32-bit Emscripten target because the generic JIT-less path is explicitly unsupported on Windows.
- The next source change must introduce a dedicated Emscripten platform target instead of forcing Dolphin's desktop Windows or generic configuration.
- Local port experiments have advanced the complete-submodule Emscripten configure past Threads/CURL and into bundled compression compilation; these edits remain in the ignored `toolchain/dolphin-source/` checkout until they form a complete, reviewable port.

## Required Files

```text
web/public/emulator/
  manifest.json
  dolphin.js
  dolphin.wasm
  dolphin.worker.js
```

The adapter must expose this browser contract:

```javascript
window.DolphinWasm = {
  loadROM(file, canvas): Promise<void>,
  pause(): void,
  reset(): void,
  input(event): void
};
```

The implementation must accept the authorized RVZ image or explicitly document a deterministic RVZ-to-ISO/WBFS conversion step. The original RVZ must remain unchanged.

## Installation Gate

Before enabling the core, update `manifest.json` with:

- upstream repository and commit or release identifier;
- build toolchain and build flags;
- license and notices location;
- SHA-256 for every asset;
- supported browser and threading requirements;
- `status: "ready"`.

Then run:

```powershell
npm run verify-assets
npm run check
npm test
```

The verifier must pass before deployment. The frontend will still reject the core if `dolphin.js` does not create `window.DolphinWasm`.

Do not satisfy this gate by renaming a native Dolphin executable, downloading an unproven binary, or changing the manifest to `ready` while the adapter is absent. A custom port requires Dolphin source changes, Emscripten, browser graphics/input/audio integration, RVZ support, and controlled runtime validation. This is a core-engineering project, not a file installation step.

As of 2026-09-03, the official repository is `https://github.com/dolphin-emu/dolphin`; the inspected source snapshot is commit `ca8c6ee45e419296226e4da8c2b2adaaf54e0299`. Its source tree does not publish `dolphin.js`, `dolphin.wasm`, or `dolphin.worker.js`, and it has no Emscripten/browser target. The current unavailability is therefore verified, not a missing-download oversight.

The source snapshot is kept in the ignored local path `toolchain/dolphin-source/` for porting work. No source or generated build output is copied into the public web bundle until a browser target exists and passes the acceptance tests below.

## Acceptance Tests

1. The core loads same-origin under COOP/COEP headers.
2. `SharedArrayBuffer` is available when threaded mode is required.
3. `loadROM()` accepts the authorized RVZ or the documented converted image.
4. The canvas receives frames without a blank or error-only state.
5. Keyboard and gamepad events reach the adapter.
6. Pause and reset complete without reloading the page.
7. Browser console has no missing worker/WASM requests.
8. The core manifest hashes match the deployed bytes.
9. The browser can load the RVZ through `/api/rom` using range-capable streaming.
10. A controlled local run reaches a visible title screen before enabling public Play.

## Deployment

Mount the authorized dump in Railway at `/app/ROMS` and set:

```text
ROM_PATH=/app/ROMS/Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz
```

Do not commit the dump to GitHub or copy it into the Docker image. The root Dockerfile creates `/app/ROMS` as a volume mount point but intentionally does not copy ROM bytes.

## Why This Is a Separate Gate

Serving a 1.07 GB RVZ and emulating a GameCube title are independent capabilities. The server and UI can be production-ready while the emulator remains unavailable. Enabling the button before the adapter, RVZ handling, and runtime validation exist would create a misleading deployment and obscure the actual failure.
