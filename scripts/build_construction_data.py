#!/usr/bin/env python3
"""Build Thach_Bi_Viewer/construction-data.js for the viewer's site view.

Reads the dimension workbook (standard library only, cached cell values) and
docs/construction/phases.json, and writes one script the offline viewer can
load from file://. Nothing in the workbook is changed or reinterpreted: rows
are copied with their IDs, basis, sheet and notes.

  python3 scripts/build_construction_data.py          # write
  python3 scripts/build_construction_data.py --check  # fail if stale
"""
import hashlib
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / 'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx'
PHASES = ROOT / 'docs/construction/phases.json'
OUT = ROOT / 'Thach_Bi_Viewer/construction-data.js'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
RELNS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def sheets(path):
    with zipfile.ZipFile(path) as z:
        # Writers that store every string inline (openpyxl, for one) omit the shared-strings part.
        shared = [''.join(t.text or '' for t in si.iter(NS + 't'))
                  for si in ET.fromstring(z.read('xl/sharedStrings.xml')).iter(NS + 'si')
                  ] if 'xl/sharedStrings.xml' in z.namelist() else []
        book = ET.fromstring(z.read('xl/workbook.xml'))
        rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        targets = {r.get('Id'): r.get('Target') for r in rels}
        out = {}
        for sheet in book.iter(NS + 'sheet'):
            target = targets[sheet.get(RELNS + 'id')].lstrip('/')
            target = target if target.startswith('xl/') else 'xl/' + target
            rows = []
            for row in ET.fromstring(z.read(target)).iter(NS + 'row'):
                cells = {}
                for c in row.iter(NS + 'c'):
                    col = re.match(r'[A-Z]+', c.get('r')).group()
                    kind, value = c.get('t'), c.find(NS + 'v')
                    if kind == 'inlineStr':
                        cells[col] = ''.join(t.text or '' for t in c.iter(NS + 't'))
                    elif value is not None and value.text is not None:
                        cells[col] = shared[int(value.text)] if kind == 's' else value.text
                rows.append((int(row.get('r')), cells))
            out[sheet.get('name')] = rows
        return out


def number(text):
    if text in (None, ''):
        return None
    try:
        value = float(text)
    except ValueError:
        return None
    return int(value) if value.is_integer() else round(value, 6)


def text(value):
    return (value or '').strip()


def build():
    book = sheets(WORKBOOK)
    record = re.compile(r'^[A-Z]+\d+$')
    dimensions = []
    for row, c in book['Dimensions']:
        if not record.match(c.get('A', '')):
            continue
        dimensions.append({
            'id': c['A'], 'cell': f'Dimensions!A{row}', 'part': text(c.get('B')),
            'parameter': text(c.get('C')), 'axes': text(c.get('D')),
            'source': text(c.get('E')), 'unit': text(c.get('F')),
            'mm': number(c.get('G')), 'm': number(c.get('H')),
            'basis': text(c.get('I')), 'sheet': text(c.get('J')),
            'locator': text(c.get('K')), 'label': text(c.get('L')), 'notes': text(c.get('M')),
        })
    issue = re.compile(r'^(ISSUE|RFI|EI)-?[A-Z0-9]+')
    issues = []
    for row, c in book['Open items']:
        if not issue.match(c.get('A', '')):
            continue
        issues.append({
            'id': c['A'], 'cell': f'Open items!A{row}', 'issue': text(c.get('B')),
            'evidence': text(c.get('C')), 'sourceIds': text(c.get('D')),
            'differenceMm': number(c.get('E')), 'status': text(c.get('F')),
            'required': text(c.get('G')), 'confirmedMm': number(c.get('H')),
            'newReference': text(c.get('I')),
        })
    grid = []
    for row, c in book['Model grid']:
        if c.get('A') not in ('X', 'Y', 'Z'):
            continue
        grid.append({'axis3d': c['A'], 'name': text(c.get('B')), 'stepMm': number(c.get('C')),
                     'mm': number(c.get('D')), 'm': number(c.get('E')), 'sourceIds': text(c.get('F')),
                     'basis': text(c.get('G')), 'notes': text(c.get('H')), 'cell': f'Model grid!A{row}'})
    drawings = []
    for row, c in book['Sources']:
        if not re.match(r'^\d+$', c.get('A', '')):
            continue
        drawings.append({'file': c['A'], 'sheet': text(c.get('B')), 'drawing': text(c.get('C')),
                         'filename': text(c.get('D'))})
    phases = json.loads(PHASES.read_text(encoding='utf-8'))
    known = {i['id'] for i in issues} | set(phases['engineering'])
    for phase in phases['phases']:
        missing = [g for g in phase['gates'] if g not in known]
        if missing:
            raise SystemExit(f"{phase['id']} names unknown gates {missing}")
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()[:16]
    data = {
        'generatedBy': 'scripts/build_construction_data.py',
        'inputs': {'workbook': {'path': str(WORKBOOK.relative_to(ROOT)), 'sha256_16': digest(WORKBOOK)},
                   'phases': {'path': str(PHASES.relative_to(ROOT)), 'sha256_16': digest(PHASES)}},
        'status': 'Transcribed drawing dimensions and a proposed phase sequence. Not survey data, not an approved programme, not for construction.',
        'phases': phases, 'dimensions': dimensions, 'issues': issues, 'grid': grid, 'drawings': drawings,
    }
    body = json.dumps(data, ensure_ascii=False, indent=0, separators=(',', ':'))
    return ('/* Generated by scripts/build_construction_data.py from the dimension workbook and\n'
            ' * docs/construction/phases.json. Do not edit by hand. Not for construction. */\n'
            f'window.CHURCH_CONSTRUCTION_DATA = {body};\n')


def main():
    content = build()
    if '--check' in sys.argv:
        current = OUT.read_text(encoding='utf-8') if OUT.exists() else ''
        if current != content:
            raise SystemExit(f'{OUT.relative_to(ROOT)} is stale: run python3 scripts/build_construction_data.py')
        print(f'{OUT.relative_to(ROOT)} is current')
        return
    OUT.write_text(content, encoding='utf-8')
    data = json.loads(content.split('= ', 1)[1].rstrip(';\n'))
    print(f"wrote {OUT.relative_to(ROOT)}: {len(data['dimensions'])} dimensions, {len(data['issues'])} open items, "
          f"{len(data['grid'])} grid/level rows, {len(data['phases']['phases'])} phases, {len(content)//1024} KB")


if __name__ == '__main__':
    main()
