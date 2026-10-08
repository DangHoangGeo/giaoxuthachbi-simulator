#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const clone = '/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web = path.join(clone, 'web');
const out = '/private/tmp/thachbi-web01-clean-evidence/corrected-home-run/pointer-probe';
const runtimeBin = '/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
if (!process.env.HOME) throw new Error('HOME absent; refusing to replace/synthesize');
const env = { PATH: `${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`, HOME: process.env.HOME, TMPDIR: '/private/tmp/thachbi-web01-clean-rerun-env/tmp', CI: '1', NEXT_TELEMETRY_DISABLED: '1' };
const pointer = path.join(web, 'content/current.json');
const original = fs.readFileSync(pointer);
const originalSha = crypto.createHash('sha256').update(original).digest('hex');
const input = JSON.parse(original.toString('utf8'));
input.syntheticPrivateCanary = 'synthetic-private-canary';
const mutated = Buffer.from(`${JSON.stringify(input, null, 2)}\n`, 'utf8');
const logPath = path.join(out, 'logs/build-malformed-pointer.log');
const resultPath = path.join(out, 'pointer-probe.json');
if (fs.existsSync(resultPath) || fs.existsSync(logPath)) throw new Error('Refusing to overwrite probe evidence');
let child = null;
let restored = false;
let restoreError = null;
try {
  fs.writeFileSync(pointer, mutated);
  child = spawnSync('npm', ['run', 'build'], { cwd: web, env, encoding: 'utf8', timeout: 300000, maxBuffer: 48 * 1024 * 1024 });
} finally {
  try {
    fs.writeFileSync(pointer, original);
    restored = fs.readFileSync(pointer).equals(original);
  } catch (error) {
    restoreError = { name: error.name, message: error.message };
  }
}
const output = `${child?.stdout || ''}${child?.stderr || ''}`;
fs.writeFileSync(logPath, `Command: NEXT_TELEMETRY_DISABLED=1 npm run build\nWorking directory: ${web}\nExit code: ${child?.status ?? 'null'}\nSignal: ${child?.signal || 'null'}\n\n${output}`, { flag: 'wx' });
const logBytes = fs.readFileSync(logPath);
const data = {
  schemaVersion: 1,
  test: 'malformed unpublished pointer with extra synthetic private field must fail generically without leaking canary field/value',
  changedPath: {
    path: 'web/content/current.json', before: 'original committed bytes', mutated: true,
    originalBytes: original.length, originalSha256: originalSha,
    mutatedBytes: mutated.length, mutatedSha256: crypto.createHash('sha256').update(mutated).digest('hex'),
    restoredByteForByte: restored, restoredBytes: fs.statSync(pointer).size,
    restoredSha256: crypto.createHash('sha256').update(fs.readFileSync(pointer)).digest('hex')
  },
  build: {
    command: 'NEXT_TELEMETRY_DISABLED=1 npm run build', exitCode: child?.status ?? null,
    signal: child?.signal || null, spawnError: child?.error?.message || null,
    log: 'logs/build-malformed-pointer.log', logBytes: logBytes.length,
    logSha256: crypto.createHash('sha256').update(logBytes).digest('hex'),
    containsGenericUnavailable: output.includes('Public content unavailable'),
    leakedCanaryField: output.includes('syntheticPrivateCanary'),
    leakedCanaryValue: output.includes('synthetic-private-canary')
  },
  restoreError,
  assertions: {
    buildFails: child?.status !== 0 && child?.status !== null,
    genericUnavailableObserved: output.includes('Public content unavailable'),
    canaryFieldNotLeaked: !output.includes('syntheticPrivateCanary'),
    canaryValueNotLeaked: !output.includes('synthetic-private-canary'),
    pointerRestoredByteForByte: restored && crypto.createHash('sha256').update(fs.readFileSync(pointer)).digest('hex') === originalSha
  }
};
fs.writeFileSync(resultPath, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ resultPath, assertions: data.assertions, build: data.build }, null, 2) + '\n');
if (restoreError || Object.values(data.assertions).some((value) => value !== true)) process.exitCode = 1;
