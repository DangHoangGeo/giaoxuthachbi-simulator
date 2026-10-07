/* Refresh usage-category Excel registers and their total report by stable ID.
 * Requires the Codex bundled @oai/artifact-tool runtime (no repo dependency).
 * Source columns refresh; engineering input columns and retired records survive.
 * --export-layout combines proposed XYZ into a draft simulator JSON.
 * --workbook retains the standalone combined-study mode.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { categories, partitionRegisters, summarizeRegisters, summaryMarkdown } from './usage_registers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.join(root, 'docs/electrical-grid');
const args = process.argv.slice(2);
function option(name, fallback) { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; }
const registerPath = path.resolve(option('--workbook', path.join(base, 'equipment-register.xlsx')));
const categoryMode = !args.includes('--workbook');
const categoryDir = path.resolve(option('--category-dir', path.join(base, 'categories')));
const layoutPath = path.resolve(option('--layout', path.join(base, 'equipment-layout.json')));
const systemsPath = path.resolve(option('--systems', path.join(base, 'electrical-systems.json')));
const previewDir = option('--preview-dir', null);
const modules = process.env.THACHBI_WORKSPACE_MODULES || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const resolveRuntime = createRequire(path.join(modules, '__thachbi_register__.cjs'));
const { FileBlob, SpreadsheetFile, Workbook } = await import(pathToFileURL(resolveRuntime.resolve('@oai/artifact-tool')).href);
const layoutBytes = await fs.readFile(layoutPath), systemsBytes = await fs.readFile(systemsPath);
const layout = JSON.parse(layoutBytes), systems = JSON.parse(systemsBytes);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const layoutHash = hash(layoutBytes), systemsHash = hash(systemsBytes);
const catalogContext = { window: {} };
vm.runInNewContext(await fs.readFile(path.join(root, 'Thach_Bi_Viewer/simulator/catalog.js'), 'utf8'), catalogContext);
const catalog = catalogContext.window.CHURCH_SIM_CATALOG.byId;

const equipmentHeaders = ['Equipment ID', 'Name', 'Category', 'Board', 'Circuit', 'X (m)', 'Y (m)', 'Z (m)', 'Mount', 'Visibility', 'Command state', 'Model envelope (mm)', 'Planning specs', 'Rated estimate (W)', 'Yaw (deg)', 'Tilt (deg)', 'Manufacturer', 'Product model', 'Approved specs', 'Datasheet / approval', 'Manual control ID', 'Control group', 'Proposed X (m)', 'Proposed Y (m)', 'Proposed Z (m)', 'Engineering notes', 'Record state', 'Route IDs', 'Model parameters'];
const equipmentManual = ['Manufacturer', 'Product model', 'Approved specs', 'Datasheet / approval', 'Manual control ID', 'Control group', 'Proposed X (m)', 'Proposed Y (m)', 'Proposed Z (m)', 'Engineering notes'];
const lineHeaders = ['Route ID', 'Name', 'Source ID', 'Destination IDs', 'Board', 'Circuit', 'Kind', 'Role', 'Route length (m)', 'Upstream length (m)', 'Full home run (m)', 'Length basis', 'Allowance (m)', 'Planned length (m)', 'Planning specification', 'Installation proposal', 'Cable designation', 'Core count', 'Cross-section (mm2)', 'Containment specification', 'Manufacturer / product', 'Control / terminal reference', 'Approval reference', 'Engineering notes', 'Record state', 'Trunk ID'];
const lineManual = ['Allowance (m)', 'Cable designation', 'Core count', 'Cross-section (mm2)', 'Containment specification', 'Manufacturer / product', 'Control / terminal reference', 'Approval reference', 'Engineering notes'];
const pointHeaders = ['Route ID', 'Vertex', 'X (m)', 'Y (m)', 'Z (m)', 'Segment length (m)', 'Record state'];
const tableRow = 6, firstRow = 7;
const col = n => { let s = ''; for (n++; n; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
const rowOf = (headers, object) => headers.map(h => object[h] ?? null);
const unique = (rows, label) => { const ids = rows.map(x => x.id); assert(ids.every(x => typeof x === 'string' && x), `${label}: missing ID`); assert.equal(new Set(ids).size, ids.length, `${label}: duplicate IDs`); };
unique(layout.items, 'Layout'); unique(systems.routes, 'Routes'); unique(systems.components, 'Electrical components');
const equipmentIds = new Set([...layout.items.map(x => x.id), ...Object.keys(systems.sources)]);
assert.equal(equipmentIds.size, layout.items.length + Object.keys(systems.sources).length, 'Equipment/enclosure IDs collide');
for (const component of systems.components) {
  const item = layout.items.find(x => x.id === component.id);
  assert(item, `Electrical component ${component.id} is missing from layout`);
  assert.equal(item.circuit, component.circuit, `${item.id}: circuit mismatch`);
  assert(item.pos.every((n, i) => Math.abs(n - component.position[i]) < 1e-7), `${item.id}: layout and electrical exports disagree`);
}
for (const r of systems.routes) {
  assert(equipmentIds.has(r.source), `Unknown route source ${r.source}`);
  assert(r.itemIds.every(id => equipmentIds.has(id)), `Unknown destination in ${r.id}`);
  assert(r.points.length >= 2 && r.points.every(p => p.length === 3 && p.every(Number.isFinite)), `Invalid route vertices: ${r.id}`);
  const geometric = r.points.slice(1).reduce((sum, p, i) => sum + Math.hypot(...p.map((n, k) => n - r.points[i][k])), 0);
  assert(Math.abs(geometric - r.length) < 1e-7, `Route length does not match vertices: ${r.id}`);
}

const priorBooks = [];
let previous = null, categoryManifest = null;
async function loadBook(file, required = false) {
  try {
    const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
    priorBooks.push({ file, wb }); return wb;
  } catch (e) { if (required || e.code !== 'ENOENT') throw e; return null; }
}
if (categoryMode) {
  try { categoryManifest = JSON.parse(await fs.readFile(path.join(categoryDir, 'manifest.json'), 'utf8')); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (categoryManifest) {
    assert.deepEqual(categoryManifest.categories.map(c => c.id), categories.map(c => c.id), 'Unexpected category manifest');
    for (const c of categories) await loadBook(path.join(categoryDir, c.id, 'register.xlsx'), true);
  } else {
    for (const c of categories) {
      let exists = true; try { await fs.access(path.join(categoryDir, c.id, 'register.xlsx')); } catch (e) { if (e.code === 'ENOENT') exists = false; else throw e; }
      assert(!exists, 'Category files exist without a complete manifest; reconcile before regenerating');
    }
    previous = await loadBook(registerPath);
  }
} else previous = await loadBook(registerPath);
function readRows(wb, sheetName, headers, repeatedId = false) {
  if (!wb) return [];
  const sh = wb.worksheets.getItem(sheetName), values = sh.getUsedRange().values;
  const savedHeaders = values[tableRow - 1];
  assert(savedHeaders && headers.every((h, i) => savedHeaders[i] === h), `Unexpected ${sheetName} columns; refusing to overwrite`);
  const rows = values.slice(tableRow).filter(r => r[0]).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? null])));
  const ids = rows.map(r => r[headers[0]]);
  if (!repeatedId) assert.equal(new Set(ids).size, ids.length, `${sheetName}: duplicate IDs in workbook`);
  return rows;
}
const oldEquipment = priorBooks.flatMap(({ wb }) => readRows(wb, 'Equipment', equipmentHeaders));
const oldLines = priorBooks.flatMap(({ wb }) => readRows(wb, 'Electrical Lines', lineHeaders));
const oldPoints = priorBooks.flatMap(({ wb }) => readRows(wb, 'Route Points', pointHeaders, true));
for (const [rows, key] of [[oldEquipment, 'Equipment ID'], [oldLines, 'Route ID']]) assert.equal(new Set(rows.map(r => r[key])).size, rows.length, `Duplicate ${key} across files`);

function positionDraft(rows, source) {
  const draft = structuredClone(source), byId = new Map(draft.items.map(x => [x.id, x]));
  let changes = 0;
  for (const row of rows) {
    const proposed = ['Proposed X (m)', 'Proposed Y (m)', 'Proposed Z (m)'].map(k => row[k]);
    if (proposed.every(v => v === null || v === '')) continue;
    assert.equal(row['Record state'], 'Current', `Cannot move retired equipment ${row['Equipment ID']}`);
    assert(proposed.every(v => typeof v === 'number' && Number.isFinite(v)), `Enter all three numeric proposed coordinates for ${row['Equipment ID']}`);
    const item = byId.get(row['Equipment ID']);
    assert(item, `${row['Equipment ID']} is an enclosure: its location must be coordinated in the model's board sources`);
    if (item.pos.some((v, i) => v !== proposed[i])) { item.pos = proposed; changes++; }
  }
  draft.savedAt = new Date().toISOString();
  return { draft, changes };
}
if (args.includes('--export-layout')) {
  assert(priorBooks.length, 'Create the registers first');
  for (const { wb } of priorBooks) assert.equal(wb.worksheets.getItem('Read me').getRange('B14').values[0][0], layoutHash, 'Workbook and layout snapshots differ; reconcile or refresh before exporting positions');
  const { draft, changes } = positionDraft(oldEquipment, layout);
  const output = path.resolve(option('--export-layout'));
  assert(output !== layoutPath, 'Export a separate draft; do not replace the source layout');
  await fs.writeFile(output, JSON.stringify(draft, null, 2) + '\n');
  console.log(JSON.stringify({ draft: output, changedPositions: changes, status: 'Import into viewer, check mounting/aim/routes and re-export matching snapshots before refreshing the register.' }));
  process.exit(0);
}

const components = new Map(systems.components.map(c => [c.id, c]));
const homeRunTrunkIds = new Set(systems.routes.filter(r => r.homeRun).map(r => r.trunkId));
function planningSpec(it, type, component) {
  const notes = [component?.specs || type.desc || type.name];
  if (type.fan) notes.push('Speed steps: ' + type.fan.speeds.map((s, i) => `${i + 1}: ${s.flow} m3/s, ${s.watts} W, ${s.dBA} dBA, ${s.rpm} rpm`).join('; '));
  if (type.speaker) notes.push(type.speaker.active ? 'Active speaker' : 'Passive speaker; audio rating is not mains demand');
  return notes.filter(Boolean).join('. ');
}
const equipmentFresh = layout.items.map(it => {
  const type = catalog[it.type]; assert(type, `Unknown catalogue type ${it.type}`);
  const c = components.get(it.id), board = c?.board || (it.circuit === 'DECOR' ? null : ['L6', 'L7', 'L9', 'F4'].includes(it.circuit) ? 'DB2' : 'DB1');
  return { 'Equipment ID': it.id, Name: it.name, Category: type.cat, Board: board, Circuit: it.circuit,
    'X (m)': it.pos[0], 'Y (m)': it.pos[1], 'Z (m)': it.pos[2], Mount: it.mount,
    Visibility: it.hidden ? 'Hidden alternative' : 'Shown', 'Command state': it.on ? 'On' : 'Off',
    'Model envelope (mm)': c?.modelSize.map(x => Math.round(x * 1000)).join(' × ') || 'See model parameters',
    'Planning specs': planningSpec(it, type, c), 'Rated estimate (W)': c?.wattsEstimate ?? null,
    'Yaw (deg)': it.yaw ?? 0, 'Tilt (deg)': it.tilt ?? 0, 'Record state': 'Current',
    'Route IDs': systems.routes.filter(r => ['drop', 'local'].includes(r.role) && r.itemIds.includes(it.id)).map(r => r.id).join('\n'),
    'Model parameters': JSON.stringify({ ...it.params, ...(it.lumens !== undefined ? { lumens: it.lumens } : {}), ...(it.dim !== undefined ? { dim: it.dim } : {}), ...(it.speed !== undefined ? { speed: it.speed } : {}), ...(it.level !== undefined ? { level: it.level } : {}), ...(it.delayMs !== undefined ? { delayMs: it.delayMs } : {}), ...(it.anchorY !== undefined ? { anchorY: it.anchorY } : {}), ...(it.note ? { note: it.note } : {}) })
  };
});
for (const [id, s] of Object.entries(systems.sources)) equipmentFresh.push({
  'Equipment ID': id, Name: s.label, Category: 'enclosure', Board: s.board, Circuit: null,
  'X (m)': s.pos[0], 'Y (m)': s.pos[1], 'Z (m)': s.pos[2], Mount: 'Model enclosure', Visibility: 'Shown',
  'Command state': 'n.a.', 'Model envelope (mm)': s.size.map(x => Math.round(x * 1000)).join(' × '),
  'Planning specs': `${s.where}. ${s.function || 'Procedural enclosure; internal arrangement and hardware pending.'}`,
  'Record state': 'Current', 'Engineering notes': null
});
const linesFresh = systems.routes.map(r => ({
  'Route ID': r.id, Name: r.name, 'Source ID': r.source, 'Destination IDs': r.itemIds.join('\n'), Board: r.board,
  Circuit: r.circuit, Kind: r.kind, Role: r.role, 'Route length (m)': r.length, 'Upstream length (m)': r.homeRun ? r.upstreamLength : null,
  'Length basis': r.homeRun ? 'Full home run' : homeRunTrunkIds.has(r.id) ? 'Shared bundle' : 'Route segment',
  'Planning specification': r.specification, 'Installation proposal': r.installation,
  'Record state': 'Current', 'Trunk ID': r.trunkId || null
}));
function mergeById(fresh, old, headers, inputs) {
  const key = headers[0], oldById = new Map(old.map(r => [r[key], r])), currentIds = new Set(fresh.map(r => r[key]));
  const merged = fresh.map(r => {
    const prior = oldById.get(r[key]);
    if (prior) for (const h of inputs) r[h] = prior[h] ?? null;
    return r;
  });
  for (const prior of old) if (!currentIds.has(prior[key])) merged.push({ ...prior, 'Record state': 'Retired' });
  return merged;
}
const equipment = mergeById(equipmentFresh, oldEquipment, equipmentHeaders, equipmentManual);
const lines = mergeById(linesFresh, oldLines, lineHeaders, lineManual);
const points = [];
for (const route of systems.routes) route.points.forEach((p, i) => points.push({ 'Route ID': route.id, Vertex: i + 1, 'X (m)': p[0], 'Y (m)': p[1], 'Z (m)': p[2], 'Record state': 'Current' }));
const currentRouteIds = new Set(systems.routes.map(r => r.id));
for (const row of oldPoints) if (!currentRouteIds.has(row['Route ID'])) points.push({ ...row, 'Record state': 'Retired' });

for (const [old, merged, headers, manual] of [[oldEquipment, equipment, equipmentHeaders, equipmentManual], [oldLines, lines, lineHeaders, lineManual]]) {
  const byId = new Map(merged.map(r => [r[headers[0]], r]));
  for (const prior of old) for (const h of manual) assert.deepEqual(byId.get(prior[headers[0]])[h] ?? null, prior[h] ?? null, `Lost input ${prior[headers[0]]}: ${h}`);
}
if (args.includes('--verify-workflow')) {
  const sample = { ...equipment[0], Manufacturer: 'QA retained input', 'Proposed X (m)': equipment[0]['X (m)'] + 0.1, 'Proposed Y (m)': equipment[0]['Y (m)'], 'Proposed Z (m)': equipment[0]['Z (m)'] };
  const merged = mergeById([{ ...equipmentFresh[0] }], [sample, { ...sample, 'Equipment ID': 'QA-RETIRED' }], equipmentHeaders, equipmentManual);
  assert.equal(merged[0].Manufacturer, 'QA retained input'); assert.equal(merged[1]['Record state'], 'Retired');
  const { draft, changes } = positionDraft([sample], layout);
  assert.equal(changes, 1); assert.equal(draft.items[0].pos[0], sample['Proposed X (m)']);
  assert.throws(() => positionDraft([{ ...sample, 'Proposed Z (m)': null }], layout), /all three/);
  assert.throws(() => positionDraft([{ ...sample, 'Record state': 'Retired' }], layout), /retired/);
  for (const id of homeRunTrunkIds) assert.equal(lines.find(r => r['Route ID'] === id)?.['Length basis'], 'Shared bundle');
  console.log('Workflow checks passed: retained keyed inputs, retired records, complete XYZ draft and invalid-proposal rejection.');
}

async function writeRegister({ equipment, lines, points, registerPath, name = 'All systems', usage = 'All simulator items and board enclosures.' }, previewDir) {
  const wb = Workbook.create();
  const readme = wb.worksheets.add('Read me');
  const eq = wb.worksheets.add('Equipment'), wire = wb.worksheets.add('Electrical Lines'), pts = wb.worksheets.add('Route Points');
  const dark = '#173D46', teal = '#116C75', amber = '#FFF2CC', gray = '#F1F5F5';
  function table(sheet, headers, objects, title, note, manual, tableName) {
    const end = firstRow + Math.max(1, objects.length) - 1, last = col(headers.length - 1);
    sheet.showGridLines = false;
    sheet.getRange(`A1:${last}${end}`).format.font = { name: 'Arial', size: 10, color: '#20383E' };
    sheet.getRange(`A1:${last}${end}`).format.rowHeight = 32;
    sheet.getRange(`A1:${last}${end}`).format.verticalAlignment = 'center';
    sheet.getRange(`A:${last}`).format.columnWidth = 18;
    sheet.getRange('A:A').format.columnWidth = sheet.name === 'Equipment' ? 17 : 45;
    sheet.getRange('B:B').format.columnWidth = sheet.name === 'Route Points' ? 10 : 50;
    sheet.getRange('A1').values = [[title]];
    sheet.getRange('A1').format.font = { name: 'Arial', size: 16, bold: true, color: dark };
    sheet.getRange('A2').values = [['Model fields refresh from matching layout exports. Amber columns are retained engineering inputs.']];
    sheet.getRange('A3').values = [[note]];
    sheet.getRange('A4').values = [['Filter by ID, board, circuit or status. Retired rows retain prior engineering inputs.']];
    sheet.getRange(`A${tableRow}:${last}${end}`).values = [headers, ...(objects.length ? objects.map(o => rowOf(headers, o)) : [headers.map(() => null)])];
    if (!objects.length) sheet.getRange('A4').values = [['No records in this category in the saved layout. The common table structure is retained.']];
    sheet.getRange(`A${tableRow}:${last}${tableRow}`).format = { fill: dark, font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' }, wrapText: true, rowHeight: 44, horizontalAlignment: 'center', verticalAlignment: 'center' };
    sheet.getRange(`A${firstRow}:${last}${end}`).format.wrapText = true;
    sheet.tables.add(`A${tableRow}:${last}${end}`, true, tableName);
    sheet.freezePanes.freezeRows(tableRow); sheet.freezePanes.freezeColumns(2);
    for (const h of manual) {
      const letter = col(headers.indexOf(h));
      sheet.getRange(`${letter}${firstRow}:${letter}${end}`).format.fill = amber;
    }
    for (let i = 0; i < headers.length; i++) if (/\(m\)|\(deg\)|\(W\)|mm2/.test(headers[i])) {
      sheet.getRange(`${col(i)}${firstRow}:${col(i)}${end}`).setNumberFormat('0.000');
      sheet.getRange(`${col(i)}${firstRow}:${col(i)}${end}`).format.horizontalAlignment = 'right';
    }
    const stateCol = col(headers.indexOf('Record state'));
    sheet.getRange(`${stateCol}${firstRow}:${stateCol}${end}`).conditionalFormats.add('containsText', { text: 'Retired', format: { fill: '#E4E7EB', font: { color: '#52616B' } } });
    return end;
  }
  const eqEnd = table(eq, equipmentHeaders, equipment, `${name}: equipment`, 'Current X/Y/Z use metres, Y up from nave datum. Use all three Proposed coordinates to prepare a layout revision.', equipmentManual, 'EquipmentRegister');
  const lineEnd = table(wire, lineHeaders, lines, 'Electrical line register', 'Lengths are geometric. Blank allowance means installed length is pending. Shared bundles are not extra home-run cable.', lineManual, 'ElectricalLineRegister');
  const pointsEnd = table(pts, pointHeaders, points, 'Route vertices in the shared layout', 'Each route uses these ordered X/Y/Z vertices in metres. Segment lengths are calculated from adjacent vertices.', [], 'RouteVertexRegister');
  eq.getRange(`A${firstRow}:AC${eqEnd}`).format.rowHeight = 96;
  for (const letter of ['M', 'S', 'Z', 'AC']) eq.getRange(`${letter}:${letter}`).format.columnWidth = 64;
  eq.getRange('AB:AB').format.columnWidth = 58;
  eq.getRange('T:T').format.columnWidth = 45;
  eq.getRange('L:L').format.columnWidth = 26;
  wire.getRange(`A${firstRow}:Z${lineEnd}`).format.rowHeight = 90;
  // A shared trunk can list several destinations. Keep every ID readable without
  // using a row per destination, which would duplicate its route length.
  for (let i = 0; i < lines.length; i++) {
    const count = String(lines[i]['Destination IDs'] || '').split('\n').length;
    if (count > 6) wire.getRange(`A${firstRow + i}:Z${firstRow + i}`).format.rowHeight = Math.min(409, count * 13 + 12);
  }
  for (const letter of ['D', 'O', 'P', 'T', 'X', 'Z']) wire.getRange(`${letter}:${letter}`).format.columnWidth = 58;
  wire.getRange('L:L').format.columnWidth = 23;
  pts.getRange('C:F').format.columnWidth = 18;
  for (const h of ['Proposed X (m)', 'Proposed Y (m)', 'Proposed Z (m)']) {
    const c = col(equipmentHeaders.indexOf(h));
    eq.getRange(`${c}${firstRow}:${c}${eqEnd}`).dataValidation = { rule: { type: 'decimal', operator: 'between', formula1: -1000, formula2: 1000 } };
  }
  for (const h of ['Allowance (m)', 'Core count', 'Cross-section (mm2)']) {
    const c = col(lineHeaders.indexOf(h));
    wire.getRange(`${c}${firstRow}:${c}${lineEnd}`).dataValidation = { rule: { type: 'decimal', operator: 'greaterThanOrEqual', formula1: 0 } };
  }
  // Independent geometry formulas: the first vertex has no incoming segment.
  const segmentFormulas = points.map((p, i) => {
    const r = firstRow + i;
    return [p.Vertex === 1 ? '=0' : `=SQRT((C${r}-C${r - 1})^2+(D${r}-D${r - 1})^2+(E${r}-E${r - 1})^2)`];
  });
  if (points.length) pts.getRange(`F${firstRow}:F${pointsEnd}`).formulas = segmentFormulas;
  if (lines.length) {
  wire.getRange(`I${firstRow}:I${lineEnd}`).formulas = lines.map((_, i) => [`=SUMIF('Route Points'!$A$${firstRow}:$A$${pointsEnd},A${firstRow + i},'Route Points'!$F$${firstRow}:$F$${pointsEnd})`]);
  wire.getRange(`K${firstRow}:K${lineEnd}`).formulas = lines.map((_, i) => { const r = firstRow + i; return [`=IF(L${r}="Full home run",I${r}+J${r},"")`]; });
  wire.getRange(`N${firstRow}:N${lineEnd}`).formulas = lines.map((_, i) => { const r = firstRow + i; return [`=IF(AND(ISNUMBER(M${r}),L${r}<>"Shared bundle"),IF(L${r}="Full home run",K${r},I${r})+M${r},"")`]; });
  }

  readme.showGridLines = false;
  readme.getRange('A1:B26').format.font = { name: 'Arial', size: 11, color: '#20383E' };
  readme.getRange('A:A').format.columnWidth = 28;
  readme.getRange('B:B').format.columnWidth = 105;
  readme.getRange('A1:B26').format.rowHeight = 34;
  readme.getRange('A1:B26').format.verticalAlignment = 'center';
  readme.getRange('A1:B26').format.wrapText = true;
  readme.getRange('A1').values = [[`${name}: equipment and electrical register`]];
  readme.getRange('A1').format = { font: { name: 'Arial', size: 16, bold: true, color: dark }, rowHeight: 38, wrapText: false };
  const info = [
    ['Purpose', 'Manage equipment specifications, locations, stable IDs, control mapping and electrical-line specifications against one shared layout.'],
    ['Baseline', `${name}. ${usage} Model snapshot: ${layout.savedAt}.`],
    ['Current equipment', null], ['Current routes', null], ['Retired equipment / routes', null],
    ['Coordinates', 'Metres: X toward sanctuary from axis 1; Y up from nave ±0.000; negative Z toward B, positive toward H.'],
    ['Amber columns', 'Editable engineering inputs. Approved products/specifications, control IDs, notes and cable allowances survive refresh by ID. Blank means pending.'],
    ['Model columns', 'Imported positions, IDs, planning specs and route vertices refresh from paired layout/systems exports. Use Proposed X/Y/Z for position revisions.'],
    ['Position changes', 'Enter all three Proposed coordinates; export a draft layout, import it in the viewer, check supports/aim/clearances, then export matching layout and systems JSON. Enclosures require a coordinated model-source change.'],
    ['Line lengths', 'Route length sums the ordered 3D segments. Full home-run length adds its upstream path once. Do not add shared bundles again; no procurement total is implied.'],
    ['Specifications', 'Catalogue values and procedural dimensions are planning proxies. Final cable type, core count, cross-section, containment and approvals remain blank until designed.'],
    ['Source layout SHA-256', layoutHash],
    ['Source systems SHA-256', systemsHash],
    ['Layout version', `${layout.designVersion}; sanctuary ${layout.settings.sanctuaryRevision}`],
    ['Layout source', path.relative(root, layoutPath)], ['Systems source', path.relative(root, systemsPath)],
    ['Viewer', 'Thach_Bi_Viewer/OPEN_CHURCH.html → Simulator → Wiring. Equipment IDs and route IDs match both the 2D and 3D views.'],
    ['Refresh', 'See docs/electrical-grid/register.md. Edit amber fields in the usage-category files. Refresh preserves their values by ID, retains retired records and updates the summary report.'],
    ['Known limits', 'Physical switching channels and cable specifications are pending. Current feedback, speech clarity and other design shortfalls remain open.'],
    ['Scope', `${usage} Shared board sources are cross-references to the distribution-controls register; they are not duplicated here. Architectural fabric stays in the drawing specifications.`],
    ['Release status', 'Design development; not issued for purchasing, installation or construction.']
  ];
  readme.getRange(`A3:B${info.length + 2}`).values = info;
  readme.getRange('A3:A23').format.fill = gray;
  readme.getRange('A3:A23').format.font.bold = true;
  readme.getRange('A10:B12').format.rowHeight = 64;
  readme.getRange('A8:B9').format.rowHeight = 48;
  readme.getRange('A14:B15').format.rowHeight = 44;
  readme.getRange('A4:B4').format.rowHeight = 64;
  readme.getRange('A19:B23').format.rowHeight = 64;
  readme.getRange('B5').formulas = [[`=COUNTIFS(Equipment!$AA$${firstRow}:$AA$${eqEnd},"Current")`]];
  readme.getRange('B6').formulas = [[`=COUNTIFS('Electrical Lines'!$Y$${firstRow}:$Y$${lineEnd},"Current")`]];
  readme.getRange('B7').formulas = [[`=COUNTIFS(Equipment!$AA$${firstRow}:$AA$${eqEnd},"Retired")+COUNTIFS('Electrical Lines'!$Y$${firstRow}:$Y$${lineEnd},"Retired")`]];

  wb.recalculate();
  const calculatedLengths = wire.getRange(`I${firstRow}:I${lineEnd}`).values;
  const routeById = new Map(systems.routes.map(r => [r.id, r]));
  for (let i = 0; i < lines.length; i++) if (lines[i]['Record state'] === 'Current') assert(Math.abs(calculatedLengths[i][0] - routeById.get(lines[i]['Route ID']).length) < 1e-7, `Excel route length mismatch: ${lines[i]['Route ID']}`);
  assert.equal(readme.getRange('B5').values[0][0], equipment.filter(r => r['Record state'] === 'Current').length);
  assert.equal(readme.getRange('B6').values[0][0], lines.filter(r => r['Record state'] === 'Current').length);
  const formulaErrors = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 20 }, summary: 'Register formula error scan', maxChars: 3000 });
  console.log(formulaErrors.ndjson);
  for (const sheet of [readme, eq, wire, pts]) for (const row of sheet.getUsedRange().values) for (const value of row) {
    assert(!(typeof value === 'string' && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!|SPILL!|CALC!)$/.test(value)), `Formula error in ${sheet.name}: ${value}`);
  }
  if (previewDir) {
    await fs.mkdir(previewDir, { recursive: true });
    const largestTrunk = firstRow + lines.reduce((best, r, i) => String(r['Destination IDs']).length > String(lines[best]['Destination IDs']).length ? i : best, 0);
    for (const [sheetName, range, name] of [['Read me', 'A1:B12', 'readme'], ['Equipment', 'A6:J11', 'equipment'], ['Equipment', 'L6:T10', 'equipment-specs'], ['Electrical Lines', 'A6:B11', 'line-identities'], ['Electrical Lines', 'H6:P11', 'line-lengths'], ['Electrical Lines', `A${largestTrunk}:D${largestTrunk}`, 'trunk-destinations'], ['Route Points', 'A6:G14', 'route-points']]) {
      const blob = await wb.render({ sheetName, range, scale: 1.2, format: 'png' });
      await fs.writeFile(path.join(previewDir, `${name}.png`), new Uint8Array(await blob.arrayBuffer()));
    }
  }
  await fs.mkdir(path.dirname(registerPath), { recursive: true });
  if (priorBooks.some(b => b.file === registerPath)) {
    const backup = path.join(os.tmpdir(), `thachbi-register-backup-${Date.now()}.xlsx`);
    await fs.copyFile(registerPath, backup);
    console.log(`Previous workbook backed up to ${backup}`);
  }
  const output = await SpreadsheetFile.exportXlsx(wb);
  const staging = `${registerPath}.tmp.xlsx`;
  await output.save(staging);
  await fs.rename(staging, registerPath);
  await fs.rm(`${staging}.inspect.ndjson`, { force: true });
  console.log(JSON.stringify({ workbook: registerPath, equipment: equipment.length, routes: lines.length, vertices: points.length }));
  return { sha256: hash(await fs.readFile(registerPath)), equipment: equipment.length, routes: lines.length, vertices: points.length };
}

if (!categoryMode) {
  await writeRegister({ equipment, lines, points, registerPath }, previewDir);
} else {
  const groups = partitionRegisters(equipment, lines, points);
  for (const file of ['physics.js', 'engine.js']) vm.runInNewContext(await fs.readFile(path.join(root, 'Thach_Bi_Viewer/simulator', file), 'utf8'), catalogContext);
  const sim = catalogContext.window.CHURCH_SIMULATOR;
  sim.state.items = structuredClone(layout.items); Object.assign(sim.state.settings, layout.settings);
  const summary = summarizeRegisters(groups, layout, systems, sim);
  const createdDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const manifest = { schema: 1, generatedAt: new Date().toISOString(), layoutHash, systemsHash, categories: [], totals: summary.total };
  for (const group of groups) {
    const registerPath = path.join(categoryDir, group.id, 'register.xlsx');
    const result = await writeRegister({ ...group, registerPath }, previewDir ? path.join(previewDir, group.id) : null);
    manifest.categories.push({ id: group.id, file: `${group.id}/register.xlsx`, ...result });
    const s = summary.rows.find(r => r.id === group.id);
    await fs.writeFile(path.join(categoryDir, group.id, 'README.md'), `# ${group.name}\n\n${group.usage}\n\n## Files and structure\n\n- [Excel register](register.xlsx): Read me, Equipment, Electrical Lines and Route Points, with the same columns/formulas as every other category.\n- [All category files](../README.md) and [total quantities, usage and quality](../../summary-report.md).\n\n## Current scope\n\n${s.equipment} equipment/enclosures, ${s.routes} routes, ${s.vertices} route vertices. ${s.hidden} hidden alternatives; ${s.connected} shown connected components. Circuits: ${s.circuits}.\n\n## Editing and coordination\n\nEdit the amber engineering fields here. Preserve stable IDs and follow the [refresh and position workflow](../../register.md). Each equipment/route belongs to one category; shared board sources are referenced by ID in the distribution-controls file. Retired records remain traceable.\n\n## Lengths and usage\n\nRoute lengths use 3D centreline geometry; full audio/microphone home runs include upstream distance. Do not add shared bundle lengths again. Usage estimates and missing engineering inputs are reported in the [summary](../../summary-report.md). Pending specifications require design review.\n`);
  }
  await fs.writeFile(path.join(categoryDir, 'README.md'), `# Registers by usage category\n\nEach editable workbook has the same four sheets: **Read me, Equipment, Electrical Lines, Route Points**. Equipment and route IDs are owned once; board source IDs can be referenced across files.\n\n| Category | Workbook | Scope |\n| --- | --- | --- |\n${categories.map(c => `| [${c.name}](${c.id}/README.md) | [Excel register](${c.id}/register.xlsx) | ${c.usage} |`).join('\n')}\n\n[Summary report](../summary-report.md) contains total quantities, service usage estimates, route-length bases and data/engineering completeness. [Register workflow](../register.md) explains refresh, retained inputs and position changes.\n`);
  await fs.writeFile(path.join(categoryDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await fs.writeFile(path.join(path.dirname(categoryDir), 'summary-report.md'), summaryMarkdown(summary, layout, { layout: layoutHash, systems: systemsHash }, createdDate));
  if (previous && !categoryManifest && categoryDir === path.join(base, 'categories')) {
    const archive = path.join(base, 'archive'); await fs.mkdir(archive, { recursive: true });
    const dest = path.join(archive, 'equipment-register-before-category-split.xlsx');
    await fs.copyFile(registerPath, dest, 1); // Never replace an existing migration archive.
    await fs.rm(registerPath);
    await fs.writeFile(path.join(archive, 'README.md'), '# Original combined register\n\nThe preserved workbook predates the usage-category split. It is historical and is not refreshed. Edit the [category registers](../categories/README.md).\n');
  }
  console.log(JSON.stringify({ categories: categories.length, report: path.join(path.dirname(categoryDir), 'summary-report.md'), totals: summary.total }));
}
