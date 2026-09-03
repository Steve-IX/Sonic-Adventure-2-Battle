# Dolphin WebAssembly Core Contract

## Current State

This repository does not contain a Dolphin WebAssembly core. The browser correctly keeps Play disabled until a compatible core is installed under `web/public/emulator/` and the manifest is changed from `unavailable` to `ready`.

A native Dolphin release is not automatically a browser-compatible WebAssembly runtime. A real browser build must provide the JavaScript/WASM adapter used by the page and must be legally redistributable under its upstream license and notices.

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
