#!/usr/bin/env python3
"""Check the sanctuary-end (E03) decoration data against the local source DXF.

1. Every traced row in Thach_Bi_Viewer/detail-rear-profile.js is re-read from its DXF handle
   (E03: u = (x - 1587256.3)/1000 = model Z on the H side, v = (y + 518026.8)/1000, handedness +1).
2. Every drawn pier row in roofline.js spec.rear (cg, de) lies on E03 horizontals: each row's lower
   and upper level is a LINE across that pier, and its half-width is reached by a LINE at one of them.

Coordinates are a software transcription, not a construction tolerance. The DWG and DXF stay local
under publication hold H1; only the permitted outlines are committed.
"""
import hashlib
import json
import subprocess
from pathlib import Path
from ezdxf import recover

root = Path(__file__).resolve().parent.parent
source = root / 'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
doc, audit = recover.readfile(root / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf')
assert not audit.errors and not audit.fixes
U = lambda x: (x - 1587256.3) / 1000
V = lambda y: (y + 518026.8) / 1000

text = (root / 'Thach_Bi_Viewer/detail-rear-profile.js').read_text()
profile = json.loads(text.split('window.CHURCH_DETAIL_PROFILE_REAR = ', 1)[1].strip().removesuffix(';'))
def expected(e):
    t = e.dxftype()
    if t == 'ARC':
        return ['A', U(e.dxf.center.x), V(e.dxf.center.y), e.dxf.radius / 1000, e.dxf.start_angle, (e.dxf.end_angle - e.dxf.start_angle) % 360, 1]
    if t == 'CIRCLE':
        return ['A', U(e.dxf.center.x), V(e.dxf.center.y), e.dxf.radius / 1000, 0, 360, 1]
    return ['L', U(e.dxf.start.x), V(e.dxf.start.y), U(e.dxf.end.x), V(e.dxf.end.y)]
worst, counts = 0.0, {}
for name, rows in profile.items():
    seen = set()
    for row in rows:
        assert row[0] not in seen, (name, row[0]); seen.add(row[0])
        exp = expected(doc.entitydb[row[0]])
        assert row[1] == exp[0], (name, row[0])
        for a, b in zip(row[2:], exp[1:]):
            worst = max(worst, abs(a - b)); assert abs(a - b) < 1e-6, (name, row[0], a, b)
    counts[name] = len(rows)

spec = json.loads(subprocess.run(['node', '-e', "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.CHURCH_ROOFLINE.spec.rear))",
                                  str(root / 'Thach_Bi_Viewer/roofline.js')], check=True, capture_output=True, text=True).stdout)
lines, others = [], []
for e in doc.modelspace().query('LINE'):
    if abs(e.dxf.start.y - e.dxf.end.y) < 1e-6:
        lines.append((V(e.dxf.start.y), U(e.dxf.start.x), U(e.dxf.end.x)))
    else:  # verticals bound the dies and plaques; the gablet rakes start at the die foot
        others.append(((U(e.dxf.start.x), V(e.dxf.start.y)), (U(e.dxf.end.x), V(e.dxf.end.y))))
checked, worst_row = 0, 0.0
for key in ('cg', 'de'):
    P = spec[key]; c = sum(P['u']) / 2
    for v0, v1, h, kind in P['rows']:
        at = lambda v: [l for l in lines if abs(l[0] - v) < 1.5e-4 and min(l[1], l[2]) <= c + .05 and max(l[1], l[2]) >= c - .05]
        for v in (v0, v1):
            # gablet apexes and panel ends are line endpoints rather than horizontals
            near = [l[0] for l in at(v)] or [p[1] for a, b in others for p in (a, b) if kind in 'GP' and abs(p[1] - v) < 1.5e-4 and abs(p[0] - c) < .6]
            assert near, (key, 'no E03 line at', v)
            worst_row = max(worst_row, min(abs(l - v) for l in near))
        checked += 1
        if kind == 'B':  # bell core behind the traced capital: levels drawn, width DERIVED (as drawnPier)
            continue
        reach = [max(abs(l[1] - c), abs(l[2] - c)) for v in (v0, v1) for l in at(v)]
        if kind in 'WPG':
            reach += [abs(p[0] - c) for a, b in others for p in (a, b) if v0 - 1.5e-4 <= p[1] <= v1 + 1.5e-4 and abs(p[0] - c) < .6]
        if kind == 'C':  # cyma between two drawn widths: the model band takes their mean
            reach = [(a + b) / 2 for a in reach for b in reach]
        assert min(abs(r - h) for r in reach) < 2e-3, (key, v0, v1, h, sorted(set(round(r, 4) for r in reach)))
print(json.dumps({'status': 'passed', 'source': 'E03 sanctuary-end elevation', 'traced_rows': counts,
                  'largest_coordinate_or_angle_difference': worst, 'drawn_pier_rows': checked,
                  'largest_pier_level_difference_m': worst_row,
                  'limits': 'DXF transcription only; mm interpretation, relief depth and engineering remain held.'}))
