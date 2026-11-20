#!/usr/bin/env python3
"""Check the permitted T12 profile data against the local source DXF.

Coordinates are a software transcription, not a construction tolerance. The DWG,
DXF and designer approval for all other details remain subject to publication hold H1.
"""
import hashlib
import json
from pathlib import Path
from ezdxf import recover

root = Path(__file__).resolve().parent.parent
source = root / 'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
text = (root / 'Thach_Bi_Viewer/tower-spandrel-profile.js').read_text()
profile = json.loads(text.split('window.CHURCH_TOWER_SPANDREL_PROFILE = ', 1)[1].strip().removesuffix(';'))
doc, audit = recover.readfile(root / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf')
assert not audit.errors and not audit.fixes and doc.header.get('$INSUNITS') == 1
max_diff = 0.0
for name, first, last, side in [('outer', 0xC44A60, 0xC44AAA, 1), ('inner', 0xC44AAB, 0xC44AF5, -1)]:
    rows = profile[name]
    assert len(rows) == last - first + 1 == 75
    def u(x): return side * ((1666600.3 - x) / 1000 - 10.153)
    def v(y): return (y + 515946.8) / 1000
    for row, handle in zip(rows, range(first, last + 1)):
        e = doc.entitydb[format(handle, 'X')]
        assert row[0] == e.dxf.handle and e.dxf.layer == '01'
        if row[1] == 'A':
            assert e.dxftype() == 'ARC'
            expected = [u(e.dxf.center.x), v(e.dxf.center.y), e.dxf.radius / 1000,
                        e.dxf.start_angle, (e.dxf.end_angle - e.dxf.start_angle) % 360, -side]
        else:
            assert row[1] == 'L' and e.dxftype() == 'LINE'
            expected = [u(e.dxf.start.x), v(e.dxf.start.y), u(e.dxf.end.x), v(e.dxf.end.y)]
        assert len(row[2:]) == len(expected)
        for actual, value in zip(row[2:], expected):
            diff = abs(actual - value)
            max_diff = max(max_diff, diff)
            assert diff < 1e-8, (row[0], actual, value)
print(json.dumps({'status': 'passed', 'source': 'E01B T12', 'entities': 150,
                  'largest_coordinate_or_angle_rounding': max_diff,
                  'limits': 'DXF transcription only; mm interpretation, relief and engineering remain held.'}))
