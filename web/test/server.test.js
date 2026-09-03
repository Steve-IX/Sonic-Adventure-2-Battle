const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sa2-web-'));
const fixtureRom = path.join(fixtureDir, 'Sonic Adventure 2 - Battle (USA) (En,Ja,Fr,De,Es).rvz');
fs.writeFileSync(fixtureRom, Buffer.from('rvz-fixture-data'));
process.env.ROM_PATH = fixtureRom;

const { app } = require('../server');
let server;
let port;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  port = server.address().port;
});
test.after(() => { server.close(); fs.rmSync(fixtureDir, { recursive: true, force: true }); });

function request(requestPath, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: requestPath, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('health endpoint responds', async () => {
  const response = await request('/healthz');
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).ok, true);
});

test('ROM metadata reports the configured RVZ', async () => {
  const response = await request('/api/rom/metadata');
  const metadata = JSON.parse(response.body);
  assert.equal(response.status, 200);
  assert.equal(metadata.available, true);
  assert.equal(metadata.filename, path.basename(fixtureRom));
  assert.match(metadata.sha256, /^[a-f0-9]{64}$/);
});

test('ROM GET, HEAD, and range requests work', async () => {
  const get = await request('/api/rom');
  const head = await request('/api/rom', 'HEAD');
  const range = await request('/api/rom', 'GET', { Range: 'bytes=0-2' });
  assert.equal(get.status, 200);
  assert.equal(head.status, 200);
  assert.equal(range.status, 206);
  assert.equal(range.body.toString(), 'rvz');
  assert.equal(range.headers['content-range'], `bytes 0-2/${fs.statSync(fixtureRom).size}`);
  assert.equal(get.headers['accept-ranges'], 'bytes');
});

test('invalid ranges return 416', async () => {
  const response = await request('/api/rom', 'GET', { Range: 'bytes=999999-' });
  assert.equal(response.status, 416);
});

test('core manifest and capabilities report the missing emulator honestly', async () => {
  const manifest = await request('/emulator/manifest.json');
  const capabilities = await request('/api/core/capabilities');
  assert.equal(manifest.status, 200);
  assert.equal(JSON.parse(manifest.body).status, 'unavailable');
  assert.equal(JSON.parse(capabilities.body).status, 'unavailable');
});

test('path traversal cannot expose server files', async () => {
  const response = await request('/..%2Fserver.js');
  assert.notEqual(response.status, 200);
  assert.doesNotMatch(response.body.toString(), /const express/);
});

test('API OPTIONS exposes only the required CORS contract', async () => {
  const response = await request('/api/rom', 'OPTIONS');
  assert.equal(response.status, 204);
  assert.match(response.headers['access-control-allow-methods'], /GET/);
  assert.equal(response.headers['access-control-allow-origin'], undefined);
});

test('missing-ROM behavior is a clear 404', async () => {
  fs.renameSync(fixtureRom, `${fixtureRom}.missing`);
  try {
    const response = await request('/api/rom/metadata');
    assert.equal(response.status, 404);
    assert.equal(JSON.parse(response.body).available, false);
  } finally {
    fs.renameSync(`${fixtureRom}.missing`, fixtureRom);
  }
});