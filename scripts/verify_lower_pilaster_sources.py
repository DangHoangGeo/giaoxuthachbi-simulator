#!/usr/bin/env python3
"""Check saved lower-pilaster line witnesses against the local CAD conversion.

Coordinate transcription only: the CAD unit conflict and construction holds remain.
"""
import hashlib
import json
from pathlib import Path

from ezdxf import recover

ROOT = Path(__file__).resolve().parent.parent
saved = json.loads((ROOT / 'docs/exterior-23102026/lower-pilaster-witnesses.json').read_text())
manifest = json.loads((ROOT / 'docs/layout_design/dwg-2026-10-23/sheets.json').read_text())
source = ROOT / manifest['source']['local_copy']
assert hashlib.sha256(source.read_bytes()).hexdigest() == saved['source_sha256']
doc, audit = recover.readfile(str(ROOT / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf'))
assert not audit.errors and not audit.fixes and doc.header.get('$INSUNITS') == 1
wing_origin = doc.entitydb['DAB82A'].dxf.center.x
worst = 0.0
for row in saved['witnesses']:
    e = doc.entitydb[row['handle']]
    assert e.dxftype() == row['entity'] == 'LINE' and e.dxf.layer == row['layer']
    points = [list(e.dxf.start)[:2], list(e.dxf.end)[:2]]
    error = max(abs(a-b) for p,q in zip(points,row['cad_xy']) for a,b in zip(p,q))
    worst = max(worst,error)
    assert error < 1e-6, row['handle']
    origin = wing_origin if row['drawing'] == 'EW' else 1587256.3
    for point, expected in zip(points, row['elevation_m']):
        actual = [(point[0]-origin)/1000, (point[1]+518026.8)/1000]
        assert max(abs(a-b) for a,b in zip(actual,expected)) < 1e-8, row['handle']
print(json.dumps({'verifiedLines':len(saved['witnesses']), 'maxSourceDifferenceCadUnits':worst,
                  'limits':'Transcription only; inferred mm/m, profile depth and construction holds remain.'}))
