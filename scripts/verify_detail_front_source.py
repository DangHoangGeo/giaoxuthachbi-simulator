#!/usr/bin/env python3
"""Check the central-front traced outlines (detail-front-profile.js) against the local source DXF.

E01B front elevation: u = (1666600.3 - x_CAD) / 1000 less each key's origin, v = (y_CAD + 515946.8) / 1000,
arc handedness -1. Coordinates are a software transcription, not a construction tolerance. The DWG and
DXF stay local under publication hold H1 (docs/layout_design/dwg-2026-10-23/source/, ignored by git).
Set DWG_SOURCE_DIR to read them from another checkout.
"""
import hashlib
import json
import os
from pathlib import Path
from ezdxf import recover

root = Path(__file__).resolve().parent.parent
source_dir = Path(os.environ.get('DWG_SOURCE_DIR', root / 'docs/layout_design/dwg-2026-10-23/source'))
dwg = source_dir / 'thach-bi-church-2026-10-23.dwg'
assert hashlib.sha256(dwg.read_bytes()).hexdigest() == '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
text = (root / 'Thach_Bi_Viewer/detail-front-profile.js').read_text()
profile = json.loads(text.split('window.CHURCH_DETAIL_PROFILE_FRONT = ', 1)[1].strip().removesuffix(';'))
doc, audit = recover.readfile(source_dir / 'converted.dxf')
assert not audit.errors and not audit.fixes
Z = lambda x: (1666600.3 - x) / 1000
Y = lambda y: (y + 515946.8) / 1000
# Key -> (origin Z, allowed entity types, expected row count, world-level box the outline must stay inside)
KEYS = {
    'rose': (0.0, {'ARC', 'CIRCLE', 'LINE'}, 200, (13.30, 14.12)),
    'bayCapital': (2.979, {'ARC'}, 194, (15.033, 15.34)),
    'groundCapital': (2.979, {'ARC'}, 161, (8.774, 9.08)),
    'pedestalRosette': (2.979, {'ARC', 'CIRCLE'}, 25, (0.60, 0.84)),
    'crossRosette': (0.0, {'ARC', 'CIRCLE'}, 43, (21.65, 21.95)),
    'crestRib': (4.40455, {'ARC'}, 12, (16.38, 17.0)),  # cresting ribs about the narrow post at Z 4.405
}
def expected(e, zc):
    t = e.dxftype()
    if t == 'ARC':
        return ['A', Z(e.dxf.center.x) - zc, Y(e.dxf.center.y), e.dxf.radius / 1000,
                e.dxf.start_angle, (e.dxf.end_angle - e.dxf.start_angle) % 360, -1]
    if t == 'CIRCLE':
        return ['A', Z(e.dxf.center.x) - zc, Y(e.dxf.center.y), e.dxf.radius / 1000, 0, 360, -1]
    return ['L', Z(e.dxf.start.x) - zc, Y(e.dxf.start.y), Z(e.dxf.end.x) - zc, Y(e.dxf.end.y)]
assert set(profile) == set(KEYS), sorted(profile)
worst, counts = 0.0, {}
for name, (zc, types, n, (v0, v1)) in KEYS.items():
    rows = profile[name]
    assert len(rows) == n, (name, len(rows))
    assert len({r[0] for r in rows}) == n, (name, 'duplicate handle')
    for row in rows:
        e = doc.entitydb[row[0]]
        assert e.dxftype() in types, (name, row[0], e.dxftype())
        exp = expected(e, zc)
        assert row[1] == exp[0], (name, row[0])
        for a, b in zip(row[2:], exp[1:]):
            worst = max(worst, abs(a - b)); assert abs(a - b) < 1e-6, (name, row[0], a, b)
        assert v0 - 1e-6 <= row[3] <= v1 + 1e-6 or row[1] == 'A', (name, row[0])
    counts[name] = n
print(json.dumps({'status': 'passed', 'source': 'E01B central front: rose tracery, central pier capitals, pedestal and cross rosettes',
                  'entities': counts, 'largest_coordinate_or_angle_difference': worst,
                  'limits': 'DXF transcription only; relief depth, finish and engineering remain held.'}))
