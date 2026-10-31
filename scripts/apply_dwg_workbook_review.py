#!/usr/bin/env python3
"""Apply ONLY artifact-authored text cells, preserving all other XLSX bytes.

No openpyxl authoring. Existing formulas, caches, styles, tables, annotations,
print settings and every other ZIP part survive unchanged. Back up before edit.
"""
import json
from copy import copy
import re
import shutil
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

from build_construction_data import ROOT, WORKBOOK, NS, RELNS, sheets

DEST = ROOT/'exports/dwg-review-2026-10-26'
data = json.loads((DEST/'register-data.json').read_text())
authored = DEST/'_qa/authored-register.xlsx'
values = {name: dict(rows) for name, rows in sheets(authored).items()}
changes = {}
for name, cell, value in data['patches']:
    row, col = int(re.search(r'\d+',cell).group()), re.match(r'[A-Z]+',cell).group()
    assert values[name][row][col] == value, (name,cell,'artifact export mismatch')
    changes.setdefault(name,{})[cell]=value

backup=DEST/'_qa/dimension-register-before.xlsx'
if not backup.exists():
    shutil.copy2(WORKBOOK,backup)
previous_candidate=DEST/'_qa/dimension-register-preserved.xlsx'
assert WORKBOOK.read_bytes()==backup.read_bytes() or (previous_candidate.exists() and WORKBOOK.read_bytes()==previous_candidate.read_bytes()), \
    'Workbook changed since the review snapshot; reconcile before applying. Nothing overwritten.'
before = sheets(backup)
with zipfile.ZipFile(backup) as src:
    rels={r.get('Id'):r.get('Target').lstrip('/') for r in ET.fromstring(src.read('xl/_rels/workbook.xml.rels'))}
    paths={s.get('name'):rels[s.get(RELNS+'id')] for s in ET.fromstring(src.read('xl/workbook.xml')).iter(NS+'sheet')}
    paths={name:p if p.startswith('xl/') else 'xl/'+p for name,p in paths.items()}
    replace={}
    for name,cells in changes.items():
        text=src.read(paths[name]).decode()
        for cell,value in cells.items():
            pattern=rf'<c\b([^>]*\br="{cell}"[^>]*?)(?:\s*/>|>.*?</c>)'
            match=re.search(pattern,text,re.S)
            assert match, (name,cell)
            attrs=re.sub(r'\s+t="[^"]*"','',match.group(1))
            new=f'<c{attrs} t="inlineStr"><is><t xml:space="preserve">{escape(value)}</t></is></c>'
            text=text[:match.start()]+new+text[match.end():]
        if name=='Open items':
            authored_xml=None
            with zipfile.ZipFile(authored) as edited:
                # Row heights are the only layout changes, to fit the changed wrapped text.
                for sheetname, sheetpath in paths.items():
                    if sheetname==name:
                        # Artifact exports may use different sheet paths, so resolve by workbook name.
                        erels={r.get('Id'):r.get('Target').lstrip('/') for r in ET.fromstring(edited.read('xl/_rels/workbook.xml.rels'))}
                        esheet=next(s for s in ET.fromstring(edited.read('xl/workbook.xml')).iter(NS+'sheet') if s.get('name')==name)
                        target=erels[esheet.get(RELNS+'id')]
                        authored_xml=ET.fromstring(edited.read(target if target.startswith('xl/') else 'xl/'+target))
            for row in (30,31):
                erow=next(r for r in authored_xml.iter(NS+'row') if r.get('r')==str(row))
                assert float(erow.get('ht'))==120
                pattern=rf'<row\b([^>]*\br="{row}"[^>]*)(>)'
                match=re.search(pattern,text)
                assert match, ('missing row after cell replacement',row)
                attrs=re.sub(r'\s+(ht|customHeight)="[^"]*"','',match.group(1))
                text=text[:match.start()]+f'<row{attrs} ht="120" customHeight="1">'+text[match.end():]
        replace[paths[name]]=text.encode()
    candidate=DEST/'_qa/dimension-register-preserved.xlsx'
    with zipfile.ZipFile(candidate,'w',compression=zipfile.ZIP_DEFLATED) as dst:
        for info in src.infolist():
            dst.writestr(copy(info),replace.get(info.filename,src.read(info.filename)))
    with zipfile.ZipFile(candidate) as dst:
        assert set(src.namelist())==set(dst.namelist())
        assert all(src.read(n)==dst.read(n) for n in src.namelist() if n not in replace)
after=sheets(candidate)
for name,oldrows in before.items():
    newrows=dict(after[name])
    for row,old in oldrows:
        new=newrows[row]
        added={re.match(r'[A-Z]+',cell).group() for cell in changes.get(name,{})
               if int(re.search(r'\d+',cell).group())==row}
        assert set(new)==set(old)|added, (name,row,'unexpected cell added or removed')
        for col,value in old.items():
            assert new[col]==changes.get(name,{}).get(f'{col}{row}',value), (name,col,row)
shutil.copy2(candidate,WORKBOOK)
report={'changed_cells':[f'{s}!{c}' for s,c,_ in data['patches']],
        'row_heights_points':{'Open items!30':120,'Open items!31':120},
        'all_other_cell_values_preserved':True,'other_zip_parts_byte_identical':True,
        'original_backup':'exports/dwg-review-2026-10-26/_qa/dimension-register-before.xlsx'}
(DEST/'_qa/workbook-preservation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
