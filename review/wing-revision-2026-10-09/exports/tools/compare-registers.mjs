import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const [beforeFile, afterFile, output] = process.argv.slice(2);
const before = JSON.parse(await fs.readFile(beforeFile, 'utf8'));
const after = JSON.parse(await fs.readFile(afterFile, 'utf8'));
const equipmentInputs = ['Manufacturer', 'Product model', 'Approved specs', 'Datasheet / approval', 'Manual control ID', 'Control group', 'Proposed X (m)', 'Proposed Y (m)', 'Proposed Z (m)', 'Engineering notes'];
const lineInputs = ['Allowance (m)', 'Cable designation', 'Core count', 'Cross-section (mm2)', 'Containment specification', 'Manufacturer / product', 'Control / terminal reference', 'Approval reference', 'Engineering notes'];
function records(snapshot, sheet) {
  const key = sheet === 'Equipment' ? 'Equipment ID' : 'Route ID';
  const rows = [];
  for (const [category, book] of Object.entries(snapshot.categories)) for (const row of book.sheets[sheet].rows) rows.push({category, row});
  if (sheet !== 'Route Points') assert.equal(new Set(rows.map(r => r.row[key])).size, rows.length, 'Duplicate stable ID: ' + sheet);
  return rows;
}
let preservedCells = 0, nonemptyPreservedCells = 0;
const result = { before: beforeFile, after: afterFile, tables: {}, retiredEquipment: [], retiredRoutes: [], newEquipment: [] };
for (const [sheet, inputs] of [['Equipment', equipmentInputs], ['Electrical Lines', lineInputs]]) {
  const oldRows = records(before, sheet), newRows = records(after, sheet);
  const key = sheet === 'Equipment' ? 'Equipment ID' : 'Route ID';
  const oldById = new Map(oldRows.map(r => [r.row[key], r]));
  const newById = new Map(newRows.map(r => [r.row[key], r]));
  for (const {category, row} of oldRows) {
    const replacement = newById.get(row[key]);
    assert(replacement, 'Lost ID ' + row[key]);
    assert.equal(replacement.category, category, 'Changed category ownership for ' + row[key]);
    for (const field of inputs) {
      assert.deepEqual(replacement.row[field], row[field], row[key] + ': changed input ' + field);
      preservedCells++;
      if (row[field] !== null && row[field] !== '') nonemptyPreservedCells++;
    }
    if (replacement.row['Record state'] === 'Retired') {
      for (const field of Object.keys(row).filter(h => h !== 'Record state')) assert.deepEqual(replacement.row[field], row[field], row[key] + ': changed retired field ' + field);
      result[sheet === 'Equipment' ? 'retiredEquipment' : 'retiredRoutes'].push(row[key]);
    }
  }
  if (sheet === 'Equipment') result.newEquipment = newRows.filter(r => !oldById.has(r.row[key])).map(r => ({category:r.category,id:r.row[key],board:r.row.Board,circuit:r.row.Circuit,routes:r.row['Route IDs'],recordState:r.row['Record state']}));
  result.tables[sheet] = {before:oldRows.length,after:newRows.length,current:newRows.filter(r=>r.row['Record state']==='Current').length,retired:newRows.filter(r=>r.row['Record state']==='Retired').length};
}
const oldPoints = records(before, 'Route Points'), newPoints = records(after, 'Route Points');
const newPointByKey = new Map(newPoints.map(r => [r.row['Route ID'] + '#' + r.row.Vertex,r]));
let retiredVertices = 0;
for (const old of oldPoints) {
  const replacement = newPointByKey.get(old.row['Route ID'] + '#' + old.row.Vertex);
  if (replacement?.row['Record state'] === 'Retired') {
    assert.equal(replacement.category,old.category,'Retired point moved category');
    for (const field of ['Route ID','Vertex','X (m)','Y (m)','Z (m)','Segment length (m)']) assert.deepEqual(replacement.row[field],old.row[field],'Retired point changed: '+field);
    retiredVertices++;
  }
  if (old.row['Record state'] === 'Retired') assert.equal(replacement?.row['Record state'],'Retired','Lost earlier retired vertex');
}
const expectedRetired = ['L64','L66','L68','L70','F-WING-B-3','F-WING-B-4','F-WING-H-3','F-WING-H-4','S275','S277'];
assert.deepEqual([...result.retiredEquipment].sort(), expectedRetired.sort(), 'Unexpected retired equipment');
assert.equal(result.tables.Equipment.current,325);
assert.equal(result.tables['Electrical Lines'].current,333);
assert.equal(result.newEquipment.length,4);
for (const row of result.newEquipment) {
  assert.equal(row.category,'decoration');
  assert.equal(row.board,null);
  assert.equal(row.circuit,'DECOR');
  assert.equal(row.routes,null);
  assert.equal(row.recordState,'Current');
}
result.preservedInputCells=preservedCells;
result.nonemptyPreservedInputCells=nonemptyPreservedCells;
result.retiredVertices=retiredVertices;
result.status='Passed: every prior entered field, stable ID, category owner and retired record preserved.';
await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
