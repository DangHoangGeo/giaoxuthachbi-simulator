/* Local CAD key-witness workbook and narrow text updates authored with the bundled runtime.
 * Pass the export directory as argv[2]. Existing book is exported to a temporary candidate;
 * apply_dwg_workbook_review.py preserves the original ZIP except explicitly authorized cells.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.resolve(process.argv[2] || path.join(root, 'exports/dwg-review-2026-10-26'));
const modules = process.env.THACHBI_WORKSPACE_MODULES || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const runtime = createRequire(path.join(modules, '__dwg_review__.cjs'));
const { Workbook, SpreadsheetFile, FileBlob } = await import(pathToFileURL(runtime.resolve('@oai/artifact-tool')).href);
const data = JSON.parse(await fs.readFile(path.join(dest, 'register-data.json'), 'utf8'));
const original = path.join(root, 'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx');
const existing = await SpreadsheetFile.importXlsx(await FileBlob.load(original));
const preview = async (book, sheetName, range, filename) => {
  const image = await book.render({ sheetName, range, scale: 1.4, format: 'png' });
  await fs.writeFile(path.join(dest, '_qa', filename), new Uint8Array(await image.arrayBuffer()));
};
await preview(existing, 'Open items', 'F30:I30', 'register-before.png');
for (const [sheet, cell, text] of data.patches) existing.worksheets.getItem(sheet).getRange(cell).values = [[text]];
existing.worksheets.getItem('Open items').getRange('A30:I31').format.rowHeight=120;
existing.recalculate();
await preview(existing, 'Open items', 'F30:I30', 'register-after.png');
const inspected = await existing.inspect({ kind: 'table', range: "'Open items'!F30:I30", include: 'values', tableMaxRows: 1, tableMaxCols: 4 });
await fs.writeFile(path.join(dest, '_qa', 'register-inspect.ndjson'), inspected.ndjson);
await (await SpreadsheetFile.exportXlsx(existing)).save(path.join(dest, '_qa', 'authored-register.xlsx'));

const book = Workbook.create();
function table(name, headers, values, widths, note) {
  const sheet = book.worksheets.add(name);
  const lastCol = n => { let s=''; for (n++;n;n=Math.floor((n-1)/26)) s=String.fromCharCode(65+(n-1)%26)+s; return s; };
  const last = lastCol(headers.length-1), end=6+values.length;
  sheet.showGridLines=false;
  sheet.getRange(`A1:${last}${end}`).format.font={ name: 'Arial', size: 10, color: '#192735' };
  sheet.getRange('A2').values=[[name+' | THẠCH BI']];
  sheet.getRange('A2').format.font={ size:14, bold:true };
  sheet.getRange('A4').values=[[note]];
  sheet.getRange('A4').format.font={ italic:true, size:10 };
  sheet.getRange('A5').values=[['In development / Đang phát triển - Not for construction / Không dùng để thi công']];
  sheet.getRange('A5').format.font={ color:'#9C3D25', bold:true };
  sheet.getRange(`A6:${last}6`).values=[headers];
  sheet.getRange(`A7:${last}${end}`).values=values;
  sheet.getRange(`A6:${last}6`).format={ fill:'#263F53', font:{bold:true,color:'#FFFFFF'}, rowHeight:36,
    wrapText:true, horizontalAlignment:'center', verticalAlignment:'center' };
  sheet.getRange(`A7:${last}${end}`).format.rowHeight=48;
  sheet.getRange(`A7:${last}${end}`).format.verticalAlignment='center';
  sheet.getRange(`A7:${last}${end}`).format.wrapText=true;
  widths.forEach((width,i)=>sheet.getRange(`${lastCol(i)}1:${lastCol(i)}${end}`).format.columnWidth=width);
  sheet.tables.add(`A6:${last}${end}`, true, name.replaceAll(' ','')+'Table').style='TableStyleLight1';
  sheet.freezePanes.freezeRows(6);
  sheet.freezePanes.freezeColumns(name==='Key dimensions'?3:2);
  sheet.tabColor=name==='Key dimensions'?'#263F53':'#7893A3';
  return sheet;
}
const source='Source: DWG saved 2026-10-23, source file 10; SHA-256 in sheets.json. Millimetres inferred; owner-selected project basis 2026-10-26.';
const keys=table('Key dimensions',data.headers,data.keys,[24,54,18,17,16,12,59,23,12,16,16,16,16,110], source);
keys.getRange(`D7:D${6+data.keys.length}`).setNumberFormat('#,##0.0');
keys.getRange(`E7:E${6+data.keys.length}`).setNumberFormat('#,##0.0000');
keys.getRange(`J7:M${6+data.keys.length}`).setNumberFormat('#,##0.0');
keys.getRange(`D7:E${6+data.keys.length}`).format.horizontalAlignment='right';
keys.getRange(`J7:M${6+data.keys.length}`).format.horizontalAlignment='right';
keys.getRange(`B7:B${6+data.keys.length}`).format.font={bold:true};
keys.getRange(`F7:F${6+data.keys.length}`).format.horizontalAlignment='center';
const grid=table('Grid positions',['Axis','Grid','Coordinate (mm)','Coordinate (m)','Source IDs','Register cell','Meaning / limits'],data.grid,[12,14,22,22,28,28,100],source);
grid.getRange(`C7:D${6+data.grid.length}`).setNumberFormat('#,##0.000');
grid.getRange(`E7:E${6+data.grid.length}`).format.horizontalAlignment='center';
const drawings=table('Drawing index',['ID','DWG sheet','Drawing / view','Axes','Dimension objects','Full PDF','Zoom views'],
  data.drawings.map(d=>[d.id,d.dwg_sheet||'unnumbered',d.title_en,d.axes.join('/'),d.dimension_objects,
    `views/${d.id}_full.pdf`,'See 02_Enlarged_Details.pdf and export-manifest.json']),[14,16,67,14,22,42,88],source);
drawings.getRange(`F7:F${6+data.drawings.length}`).format.horizontalAlignment='center';
book.recalculate();
for (const [sheet,range,filename] of [['Key dimensions','A1:I17','key-dimensions.png'],['Grid positions','A1:G17','grid-positions.png'],['Drawing index','A1:G17','drawing-index.png']]) {
  await preview(book,sheet,range,filename);
}
await preview(book,'Key dimensions','J6:N16','key-endpoints-and-limits.png');
const errors=await book.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!',options:{useRegex:true,maxResults:30},summary:'CAD register errors'});
console.log(errors.ndjson);
await (await SpreadsheetFile.exportXlsx(book)).save(path.join(dest,'04_Key_Dimensions.xlsx'));
await fs.copyFile(path.join(dest,'04_Key_Dimensions.xlsx'),path.join(root,'docs/layout_design/dwg-2026-10-23/Thach_Bi_Key_Dimensions.xlsx'));
console.log(`Authored ${data.keys.length} key witnesses; ${data.grid.length} grid positions; ${data.drawings.length} drawing views.`);
