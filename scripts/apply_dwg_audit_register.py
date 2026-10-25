#!/usr/bin/env python3
"""Apply artifact-authored audit values while preserving unrelated XLSX parts.

Only 23 displayed values, unit captions and the new held unit issue are changed.
Original measured coordinates, formulas, caches and every other value survive.
"""
import hashlib
import json
import re
import shutil
import zipfile
from copy import copy
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

from build_construction_data import ROOT,NS,RELNS,sheets

DEST=ROOT/'exports/23102026/_audit'
DATA=json.loads((ROOT/'review/dwg-vietnamese-23102026/register-edits.json').read_text())


def sheet_paths(archive):
    rels={r.get('Id'):r.get('Target').lstrip('/') for r in ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))}
    result={s.get('name'):rels[s.get(RELNS+'id')] for s in ET.fromstring(archive.read('xl/workbook.xml')).iter(NS+'sheet')}
    return {k:v if v.startswith('xl/') else 'xl/'+v for k,v in result.items()}


def cell_value(xml,cell,value):
    match=re.search(rf'<((?:\w+:)?)c\b([^>]*\br="{cell}"[^>]*?)(?:\s*/>|>.*?</(?:\w+:)?c>)',xml,re.S)
    assert match,cell
    prefix=match.group(1)
    attrs=re.sub(r'\s+t="[^"]*"','',match.group(2))
    if value is None:
        replacement=f'<{prefix}c{attrs}/>'
    elif isinstance(value,(int,float)):
        replacement=f'<{prefix}c{attrs}><{prefix}v>{value}</{prefix}v></{prefix}c>'
    else:
        replacement=f'<{prefix}c{attrs} t="inlineStr"><{prefix}is><{prefix}t xml:space="preserve">{escape(value)}</{prefix}t></{prefix}is></{prefix}c>'
    return xml[:match.start()]+replacement+xml[match.end():]


def main():
    reports=[]
    pending=[]
    for name in ('master','key'):
        path=ROOT/DATA['files'][name]
        assert hashlib.sha256(path.read_bytes()).hexdigest()==DATA['hashes'][name], 'Workbook changed during audit; reconcile before applying'
        authored={k:dict(v) for k,v in sheets(DEST/(name+'-authored.xlsx')).items()}
        edits=DATA[name+'_edits']
        for sheet,cell,value in edits:
            row=int(re.search(r'\d+',cell).group()); col=re.match('[A-Z]+',cell).group()
            assert authored[sheet][row][col]==str(value), (sheet,cell,'artifact value differs')
        before=sheets(path)
        with zipfile.ZipFile(path) as src:
            paths=sheet_paths(src)
            changes={}
            for sheet,cell,value in edits:
                part=paths[sheet]
                text=changes.get(part,src.read(part).decode())
                changes[part]=cell_value(text,cell,value)
            if name=='master':
                for col,value in zip('ABCDEFGHI',DATA['new_issue']):
                    assert authored['Open items'][35].get(col)==(None if value is None else str(value))
                part=paths['Open items']
                text=src.read(part).decode()
                assert not re.search(r'<row\b[^>]*r="35"',text)
                row=re.search(r'<row\b[^>]*r="34"[^>]*>.*?</row>',text,re.S).group()
                row=re.sub(r'r="([A-I]?)34"',lambda m:'r="'+m.group(1)+'35"',row)
                row=re.sub(r'ht="[^"]*"','ht="140"',row,count=1)
                for col,value in zip('ABCDEFGHI',DATA['new_issue']):
                    row=cell_value(row,col+'35',value)
                text=text.replace('</sheetData>',row+'</sheetData>')
                text=text.replace('ref="A1:I34"','ref="A1:I35"').replace('sqref="F8:F34"','sqref="F8:F35"')
                changes[part]=text
                found=False
                for partname in src.namelist():
                    if partname.startswith('xl/tables/') and partname.endswith('.xml'):
                        xml=src.read(partname).decode()
                        if 'name="OpenDimensions"' in xml:
                            assert 'ref="A7:I34"' in xml
                            changes[partname]=xml.replace('ref="A7:I34"','ref="A7:I35"')
                            found=True
                assert found
            candidate=DEST/(name+'-preserved.xlsx')
            with zipfile.ZipFile(candidate,'w',zipfile.ZIP_DEFLATED) as target:
                for info in src.infolist():
                    target.writestr(copy(info),changes[info.filename].encode() if info.filename in changes else src.read(info.filename))
            with zipfile.ZipFile(candidate) as target:
                assert set(target.namelist())==set(src.namelist())
                assert all(target.read(n)==src.read(n) for n in src.namelist() if n not in changes)
        after=sheets(candidate)
        allowed={(s,c):str(v) for s,c,v in edits}
        for sheet,rows in before.items():
            check=dict(after[sheet])
            for row,cols in rows:
                for col,value in cols.items():
                    assert check[row][col]==allowed.get((sheet,f'{col}{row}'),value),(sheet,col,row)
        pending.append((candidate,path))
        reports.append({'workbook':str(path.relative_to(ROOT)),'changed_cells':[s+'!'+c for s,c,_ in edits],
                        'new_issue':'ISSUE-R06' if name=='master' else None,
                        'unchanged_zip_parts_identical':True,'unrelated_cell_values_preserved':True})
    for candidate,path in pending:
        shutil.copy2(candidate,path)
    (DEST/'register-preservation.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(reports,ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
