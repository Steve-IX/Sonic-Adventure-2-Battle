const fs = require('node:fs');
const path = require('node:path');

const sourceRoot = path.resolve(__dirname, '..', '..', 'toolchain', 'dolphin-source');
const required = ['CMakeLists.txt', 'Source', 'Externals'];
const missing = required.filter((entry) => !fs.existsSync(path.join(sourceRoot, entry)));

if (missing.length) {
  console.error(`Dolphin source snapshot is missing: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Dolphin source snapshot found at ${sourceRoot}.`);
  console.log('No browser target is assumed; inspect and port explicitly before marking the emulator ready.');
}