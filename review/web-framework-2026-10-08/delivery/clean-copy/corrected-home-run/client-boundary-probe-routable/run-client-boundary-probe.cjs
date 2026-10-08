#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const clone = '/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web = path.join(clone, 'web');
const out = '/private/tmp/thachbi-web01-clean-evidence/corrected-home-run/client-boundary-probe-routable';
const runtimeBin = '/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
if (!process.env.HOME) throw new Error('HOME absent; refusing to replace/synthesize');
const env = { PATH: `${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`, HOME: process.env.HOME, TMPDIR: '/private/tmp/thachbi-web01-clean-rerun-env/tmp', CI: '1', NEXT_TELEMETRY_DISABLED: '1' };
const relDir = 'web/src/app/[locale]/boundary-canary';
const relFile = `${relDir}/page.tsx`;
const dir = path.join(web, 'src/app/[locale]/boundary-canary');
const page = path.join(dir, 'page.tsx');
const source = `'use client';\nimport { readProtectedResource } from "@/lib/server/protected-content";\n\nexport default function Probe() {\n  return <button type="button" onClick={() => void readProtectedResource(null)}>Boundary test</button>;\n}\n`;
const bytes = Buffer.from(source, 'utf8');
const logPath = path.join(out, 'logs/build-client-server-boundary-routable.log');
const resultPath = path.join(out, 'client-boundary-probe-routable.json');
if (fs.existsSync(resultPath) || fs.existsSync(logPath)) throw new Error('Refusing to overwrite probe evidence');
if (fs.existsSync(dir) || fs.existsSync(page)) throw new Error('Canary page path already exists; refusing to overwrite');
let child = null;
let inserted = false;
let removed = false;
let afterExists = null;
let restoreError = null;
try {
  fs.mkdirSync(dir, { recursive: false });
  fs.writeFileSync(page, bytes, { flag: 'wx' });
  inserted = true;
  child = spawnSync('npm', ['run', 'build'], { cwd: web, env, encoding: 'utf8', timeout: 300000, maxBuffer: 48 * 1024 * 1024 });
} finally {
  try {
    if (fs.existsSync(page)) { fs.unlinkSync(page); removed = true; }
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    afterExists = fs.existsSync(page) || fs.existsSync(dir);
  } catch (error) { restoreError = { name: error.name, message: error.message }; }
}
const output = `${child?.stdout || ''}${child?.stderr || ''}`;
fs.writeFileSync(logPath, `Command: NEXT_TELEMETRY_DISABLED=1 npm run build\nWorking directory: ${web}\nExit code: ${child?.status}\nSignal: ${child?.signal || 'null'}\nTemporary page: ${relFile}\n\n${output}`, { flag: 'wx' });
const logBytes = fs.readFileSync(logPath);
const serverOnlyDiagnostic = output.includes('server-only');
const clientBoundaryDiagnostic = /client component|client boundary|marked with ["']use client["']|use client/i.test(output);
const protectedModuleDiagnostic = output.includes('protected-content');
const data = {
  schemaVersion: 1,
  test: 'routable temporary use-client page imports server-only protected-resource reader and references it in an event handler; production build must reject the boundary',
  changedPaths: [{ path: relFile, before: 'absent', inserted, insertedBytes: bytes.length, insertedSha256: crypto.createHash('sha256').update(bytes).digest('hex'), removed, afterExists }],
  build: {
    command: 'NEXT_TELEMETRY_DISABLED=1 npm run build', exitCode: child?.status ?? null,
    signal: child?.signal || null, spawnError: child?.error?.message || null,
    log: 'logs/build-client-server-boundary-routable.log', logBytes: logBytes.length,
    logSha256: crypto.createHash('sha256').update(logBytes).digest('hex'),
    containsServerOnlyDiagnostic: serverOnlyDiagnostic,
    containsClientBoundaryDiagnostic: clientBoundaryDiagnostic,
    containsProtectedModuleDiagnostic: protectedModuleDiagnostic
  },
  restoreError,
  assertions: {
    buildFails: child?.status !== 0 && child?.status !== null,
    serverOnlyImportRejected: serverOnlyDiagnostic,
    clientBoundaryNamed: clientBoundaryDiagnostic,
    protectedModuleNamed: protectedModuleDiagnostic,
    onlyTemporaryPageRemoved: inserted && removed && afterExists === false
  }
};
fs.writeFileSync(resultPath, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ resultPath, assertions: data.assertions, build: data.build }, null, 2) + '\n');
if (restoreError || Object.values(data.assertions).some((value) => value !== true)) process.exitCode = 1;
