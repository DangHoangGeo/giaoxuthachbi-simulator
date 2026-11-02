#!/usr/bin/env python3
"""Check the permitted E01B niche-crest and pier-capital profile data against the local source DXF.

Coordinates are a software transcription, not a construction tolerance. The DWG and
DXF stay local under publication hold H1; only these permitted outlines are committed.
"""
import hashlib
import json
from pathlib import Path
from ezdxf import recover

root = Path(__file__).resolve().parent.parent
source = root / 'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
text = (root / 'Thach_Bi_Viewer/facade-crest-profile.js').read_text()
profile = json.loads(text.split('window.CHURCH_FACADE_CREST_PROFILE = ', 1)[1].strip().removesuffix(';'))
doc, audit = recover.readfile(root / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf')
assert not audit.errors and not audit.fixes
Z = lambda x: (1666600.3 - x) / 1000  # E01B, seen from the tower end
Y = lambda y: (y + 515946.8) / 1000
def expected(e, zc):
    if e.dxftype() == 'ARC':
        return ['A', Z(e.dxf.center.x) - zc, Y(e.dxf.center.y), e.dxf.radius / 1000,
                e.dxf.start_angle, (e.dxf.end_angle - e.dxf.start_angle) % 360, -1]
    return ['L', Z(e.dxf.start.x) - zc, Y(e.dxf.start.y), Z(e.dxf.end.x) - zc, Y(e.dxf.end.y)]
worst, counts, worst_b = 0.0, {}, 0.0
# H side crest at Z 5.35; the B crest (C48EEA onward) is the same outline translated to Z -5.35.
# pierCapital: the B aedicule pier capital about Z -1.662.
for name, zc, offset in [('side', 5.35, 0), ('side', -5.35, 0xC48EEA - 0xC48E1C), ('central', 0.0, 0), ('pierCapital', -1.662, 0)]:
    for row in profile[name]:
        e = doc.entitydb[format(int(row[0], 16) + offset, 'X')]
        exp = expected(e, zc)
        assert row[1] == exp[0], (row[0], e.dxftype())
        for a, b in zip(row[2:], exp[1:]):
            if offset:  # the B copy is drawn about 0.1 mm off an exact translation
                worst_b = max(worst_b, abs(a - b)); assert abs(a - b) < 5e-4, (name, zc, row[0], a, b)
            else:
                worst = max(worst, abs(a - b)); assert abs(a - b) < 1e-6, (name, zc, row[0], a, b)
        counts[f'{name}@{zc}'] = counts.get(f'{name}@{zc}', 0) + 1
print(json.dumps({'status': 'passed', 'source': 'E01B niche crests and aedicule pier capital', 'entities': counts,
                  'largest_coordinate_or_angle_difference': worst, 'largest_B_copy_difference': worst_b,
                  'limits': 'DXF transcription only; mm interpretation, relief and engineering remain held.'}))
