/* Author narrowly scoped audit corrections with the bundled Artifact Tool. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dest=path.join(root,'exports/23102026/_audit');
const data=JSON.parse(await fs.readFile(path.join(root,'review/dwg-vietnamese-23102026/register-edits.json'),'utf8'));
const modules=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require=createRequire(path.join(modules,'__dwg_audit__.cjs'));
const {FileBlob,SpreadsheetFile}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
for(const name of ['master','key']){
  const input=path.resolve(root,data.files[name]);
  if(crypto.createHash('sha256').update(await fs.readFile(input)).digest('hex')!==data.hashes[name])
    throw new Error('Workbook changed or audit already applied; reconcile before authoring.');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(input));
  if(name==='master'){
    const before=await wb.render({sheetName:'DWG dimensions',range:'D256:F260',scale:2,format:'png'});
    await fs.writeFile(path.join(dest,'display-before.png'),new Uint8Array(await before.arrayBuffer()));
  }
  for(const [sheet,cell,value] of data[name+'_edits'])wb.worksheets.getItem(sheet).getRange(cell).values=[[value]];
  if(name==='master'){
    const sheet=wb.worksheets.getItem('Open items');
    sheet.tables.items.find(t=>t.name==='OpenDimensions').rows.add(null,[data.new_issue]);
    sheet.getRange('A35:I35').format.rowHeight=140;
  }
  wb.recalculate();
  if(name==='master'){
    for(const [sheetName,range,file]of [['DWG dimensions','D256:F260','display-after.png'],['Open items','A35:G35','unit-hold.png']]){
      const png=await wb.render({sheetName,range,scale:1.4,format:'png'});
      await fs.writeFile(path.join(dest,file),new Uint8Array(await png.arrayBuffer()));
    }
  }
  await(await SpreadsheetFile.exportXlsx(wb)).save(path.join(dest,name+'-authored.xlsx'));
}
console.log('Authored 23 CAD-label corrections, unit cautions and ISSUE-R06.');
