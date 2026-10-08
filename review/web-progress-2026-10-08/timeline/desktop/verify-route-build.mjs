import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:3130';
const out = '/private/tmp/thachbi-web03-desktop/route-build-check.json';
const diskBuildId = (await readFile('/Users/danghoang/Desktop/giaoxuthachbi_work/web/.next/BUILD_ID', 'utf8')).trim();
const response = await fetch(base + '/en/progress', { redirect: 'manual' });
const body = Buffer.from(await response.arrayBuffer());
const html = body.toString('utf8');
const expression = /\\*"b\\*"\s*:\s*\\*"([^"\\]+)\\*"/g;
const matches = [...html.matchAll(expression)].map(match => match[1]);
const distinct = [...new Set(matches)];
const servedBuildId = distinct.length === 1 ? distinct[0] : null;
const missingResponse = await fetch(base + '/en/progress/missing', { redirect: 'manual' });
const missingBody = Buffer.from(await missingResponse.arrayBuffer());
const result = {
  checkedAt: new Date().toISOString(),
  progress: { url: base + '/en/progress', status: response.status, diskBuildId, servedBuildId, rscBuildIdFieldMatches: matches.length, htmlBytes: body.length, htmlSha256: createHash('sha256').update(body).digest('hex'), htmlDumpWritten: false, buildIdMatchesDisk: servedBuildId === diskBuildId },
  missingEvent: { url: base + '/en/progress/missing', status: missingResponse.status, htmlBytes: missingBody.length, expected404: missingResponse.status === 404 },
  passed: response.status === 200 && servedBuildId === diskBuildId && missingResponse.status === 404
};
await writeFile(out, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ out, progressStatus: result.progress.status, diskBuildId, servedBuildId, missingStatus: result.missingEvent.status, passed: result.passed }));
if (!result.passed) process.exitCode = 1;
