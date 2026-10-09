import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const root = process.argv[2], output = process.argv[3];
const categoryRoot = path.join(root, 'docs/electrical-grid/categories');
const categories = JSON.parse(await fs.readFile(path.join(categoryRoot, 'manifest.json'), 'utf8')).categories.map(c => c.id);
const snapshot = { capturedAt: new Date().toISOString(), categories: {} };
for (const category of categories) {
  const file = path.join(categoryRoot, category, 'register.xlsx');
  const bytes = await fs.readFile(file);
  const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
  const sheets = {};
  for (const name of ['Equipment', 'Electrical Lines', 'Route Points']) {
    const values = wb.worksheets.getItem(name).getUsedRange().values;
    const headers = values[5];
    sheets[name] = { headers, rows: values.slice(6).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? null]))) };
  }
  snapshot.categories[category] = { file, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), sheets };
  if (!bytes.equals(await fs.readFile(file))) throw new Error('Snapshot changed workbook: ' + category);
}
await fs.writeFile(output, JSON.stringify(snapshot, null, 2) + '\n');
console.log(JSON.stringify({snapshot: output, categories, equipment: Object.values(snapshot.categories).reduce((n,c)=>n+c.sheets.Equipment.rows.length,0), lines:Object.values(snapshot.categories).reduce((n,c)=>n+c.sheets['Electrical Lines'].rows.length,0), status:'All source workbooks byte-for-byte unchanged.'}));
