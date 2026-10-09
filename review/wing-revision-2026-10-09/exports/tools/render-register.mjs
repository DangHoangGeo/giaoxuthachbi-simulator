import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const file = process.argv[2], outputDir = process.argv[3];
if (!file || !outputDir) throw new Error('Pass existing workbook and PNG output directory.');
const before = await fs.readFile(file);
const book = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
const ids = (process.argv[4] || 'S275,S276,S277,S278').split(',');
const equipment = book.worksheets.getItem('Equipment').getUsedRange().values;
const lines = book.worksheets.getItem('Electrical Lines').getUsedRange().values;
const equipmentRows = equipment.map((row, i) => ({ row, excelRow: i + 1 })).filter(r => ids.includes(r.row[0]));
const lineRows = lines.map((row, i) => ({ row, excelRow: i + 1 })).filter(r => ids.some(id => String(r.row[3] || '').split('\n').includes(id)));
console.log(JSON.stringify({ workbook: file, equipment: equipmentRows.map(r => ({row: r.excelRow, id: r.row[0], type: r.row[12], coordinates: r.row.slice(5,8), recordState: r.row[26]})), lines: lineRows.map(r => ({row:r.excelRow, id:r.row[0], destinations:r.row[3], routeLength:r.row[8], fullHomeRun:r.row[10], recordState:r.row[24]})) }, null, 2));
const ranges = [['Read me','A1:B12','readme'], ['Equipment','A6:J6','equipment-headers'], ['Equipment','L6:P6','equipment-spec-headers'], ['Equipment','Q6:V6','equipment-input-headers'], ['Equipment','W6:Z6','equipment-draft-note-headers'], ['Equipment','AA6:AC6','equipment-status-headers'], ['Electrical Lines','A6:D6','line-endpoint-headers'], ['Electrical Lines','H6:P6','line-length-headers'], ['Electrical Lines','Q6:V6','line-input-headers'], ['Electrical Lines','W6:Z6','line-status-headers']];
for (const r of equipmentRows) {
  ranges.push(['Equipment',`A${r.excelRow}:J${r.excelRow}`,`equipment-${r.row[0]}-position`]);
  ranges.push(['Equipment',`L${r.excelRow}:P${r.excelRow}`,`equipment-${r.row[0]}-spec`]);
  ranges.push(['Equipment',`Q${r.excelRow}:V${r.excelRow}`,`equipment-${r.row[0]}-inputs`]);
  ranges.push(['Equipment',`W${r.excelRow}:Z${r.excelRow}`,`equipment-${r.row[0]}-draft-notes`]);
  ranges.push(['Equipment',`AA${r.excelRow}:AC${r.excelRow}`,`equipment-${r.row[0]}-status-parameters`]);
}
for (const r of lineRows) {
  ranges.push(['Electrical Lines',`A${r.excelRow}:D${r.excelRow}`,`line-${r.excelRow}-endpoints`]);
  ranges.push(['Electrical Lines',`H${r.excelRow}:P${r.excelRow}`,`line-${r.excelRow}-lengths-spec`]);
  ranges.push(['Electrical Lines',`Q${r.excelRow}:V${r.excelRow}`,`line-${r.excelRow}-inputs`]);
  ranges.push(['Electrical Lines',`W${r.excelRow}:Z${r.excelRow}`,`line-${r.excelRow}-status`]);
}
await fs.mkdir(outputDir,{recursive:true});
for (const [sheetName,range,name] of ranges) {
  const blob = await book.render({sheetName,range,scale:1.2,format:'png'});
  await fs.writeFile(path.join(outputDir,name+'.png'), new Uint8Array(await blob.arrayBuffer()));
}
const after = await fs.readFile(file);
if (!before.equals(after)) throw new Error('Read-only renderer changed workbook bytes.');
console.log('Rendered '+ranges.length+' PNG ranges; workbook byte-for-byte unchanged.');
