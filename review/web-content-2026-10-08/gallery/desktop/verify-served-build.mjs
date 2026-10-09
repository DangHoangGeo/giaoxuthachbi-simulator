import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const url = 'http://127.0.0.1:3130/en/design';
const expectedBuildId = '9MolEJEIEN4WJpmEQVAoD';
const outputPath = '/Users/danghoang/Desktop/giaoxuthachbi_work/review/web-content-2026-10-08/gallery/desktop/served-build-check.json';

const response = await fetch(url, { redirect: 'manual' });
const html = Buffer.from(await response.arrayBuffer());
const source = html.toString('utf8');
const sha256 = createHash('sha256').update(html).digest('hex');
// Next Flight embeds its build id as the `b` field, either raw JSON or in an escaped script string.
const expression = /\\*"b\\*"\s*:\s*\\*"([^"\\]+)\\*"/g;
const matches = [...source.matchAll(expression)].map(match => match[1]);
const uniqueValues = [...new Set(matches)];
const extractedBuildId = uniqueValues.length === 1 ? uniqueValues[0] : null;
const passed = response.status === 200 && extractedBuildId === expectedBuildId;

const result = {
  checkedAt: new Date().toISOString(),
  url,
  status: response.status,
  expectedBuildId,
  extractedBuildId,
  matchingFieldCount: matches.length,
  distinctBuildIdCount: uniqueValues.length,
  htmlBytes: html.length,
  htmlSha256: sha256,
  htmlDumpWritten: false,
  passed
};
await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ outputPath, status: result.status, extractedBuildId, htmlBytes: result.htmlBytes, htmlSha256: sha256, passed }));
if (!passed) process.exitCode = 1;
