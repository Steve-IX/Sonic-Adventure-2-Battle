const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'public', 'emulator');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const missing = Object.entries(manifest.assets).filter(([asset]) => !fs.existsSync(path.join(root, asset)));

if (missing.length) {
  console.error(`Dolphin WebAssembly core unavailable: ${missing.map(([asset]) => asset).join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${Object.keys(manifest.assets).length} Dolphin emulator assets.`);
}