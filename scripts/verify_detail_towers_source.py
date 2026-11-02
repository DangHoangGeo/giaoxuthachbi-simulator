#!/usr/bin/env python3
"""Check the traced tower decoration outlines (detail-towers-profile.js) against the local source DXF.

Every row must reproduce its DXF entity (by handle) exactly in the key's drawing mapping and origin.
The repeats the viewer derives from one traced outline (the mirrored outer pier, the E02 side faces,
the repeated rose and window heads) are checked here against the other drawn copies, with the
largest deviation reported. Coordinates are a software transcription, not a construction tolerance.
The DWG and DXF stay local under publication hold H1; only these outlines are committed.
"""
import hashlib
import json
import math
from pathlib import Path
from ezdxf import recover

root = Path(__file__).resolve().parent.parent
src = root / 'docs/layout_design/dwg-2026-10-23/source'
assert hashlib.sha256((src / 'thach-bi-church-2026-10-23.dwg').read_bytes()).hexdigest() == '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
text = (root / 'Thach_Bi_Viewer/detail-towers-profile.js').read_text()
profile = json.loads(text.split('window.CHURCH_DETAIL_PROFILE_TOWERS = ', 1)[1].strip().removesuffix(';'))
doc, audit = recover.readfile(src / 'converted.dxf')
assert not audit.errors and not audit.fixes

# Drawing mappings (u, v in model metres) and handedness.
DRAWINGS = {
    'E01B': (lambda x: (1666600.3 - x) / 1000, lambda y: (y + 515946.8) / 1000, -1),  # u = model Z
    'E02': (lambda x: (x - 1404501.3) / 1000, lambda y: (y + 518026.8) / 1000, 1),    # u = model X
}
C = 10.153  # tower centre |Z| in the model; E02 face centre X 2.45
# key: (drawing, u origin, v origin, [(copy drawing, copy u origin, copy v origin, mirror[, limit m])]).
# Rows store u - u origin and v - v origin. Each copy is a drawn repeat that the viewer renders from the
# same rows; its linework must lie within the limit (default 30 mm) of every traced point.
CAPITAL_COPIES = [('E01B', C, 0, -1), ('E02', 2.45, 0, 1), ('E02', 2.45, 0, -1)]
KEYS = {
    'pierCapital1': ('E01B', C, 0, CAPITAL_COPIES),
    'pierCapital2': ('E01B', C, 0, CAPITAL_COPIES),
    'pierCapital3': ('E01B', C, 0, CAPITAL_COPIES),
    'pierCapital4': ('E01B', C, 0, CAPITAL_COPIES),
}


def expected(e, drawing, uc, vc):
    U0, V0, hand = DRAWINGS[drawing]
    U, V = (lambda x: U0(x)), (lambda y: V0(y) - vc)
    t = e.dxftype()
    if t == 'ARC':
        return ['A', U(e.dxf.center.x) - uc, V(e.dxf.center.y), e.dxf.radius / 1000,
                e.dxf.start_angle, (e.dxf.end_angle - e.dxf.start_angle) % 360, hand]
    if t == 'CIRCLE':
        return ['A', U(e.dxf.center.x) - uc, V(e.dxf.center.y), e.dxf.radius / 1000, 0, 360, hand]
    return ['L', U(e.dxf.start.x) - uc, V(e.dxf.start.y), U(e.dxf.end.x) - uc, V(e.dxf.end.y)]


def points(rows, mirror=1):
    out = []
    for r in rows:
        if r[1] == 'L':
            out += [(mirror * r[2], r[3]), (mirror * r[4], r[5])]
        else:
            u, v, rad, a, s, hand = r[2:8]
            for k in (0, 1, 2):
                ang = math.radians(a + s * k / 2)
                out.append((mirror * (u + hand * rad * math.cos(ang)), v + rad * math.sin(ang)))
    return out


def drawing_points(drawing, uc, vc, box):
    """End and mid points of every LINE/ARC/CIRCLE of a drawing inside a (u, v) box, from (uc, vc)."""
    U, V0, hand = DRAWINGS[drawing]
    V = lambda y: V0(y) - vc
    u0, u1, v0, v1 = box
    out = []
    for e in ENTITIES:
        if e.dxftype() == 'LINE':
            pts = [(U(e.dxf.start.x) - uc, V(e.dxf.start.y)), (U(e.dxf.end.x) - uc, V(e.dxf.end.y))]
        else:
            cu, cv, r = U(e.dxf.center.x) - uc, V(e.dxf.center.y), e.dxf.radius / 1000
            a0 = e.dxf.start_angle if e.dxftype() == 'ARC' else 0
            sp = (e.dxf.end_angle - e.dxf.start_angle) % 360 if e.dxftype() == 'ARC' else 360
            pts = [(cu + hand * r * math.cos(math.radians(a0 + sp * k / 2)), cv + r * math.sin(math.radians(a0 + sp * k / 2))) for k in (0, 1, 2)]
        out += [p for p in pts if u0 - .05 <= p[0] <= u1 + .05 and v0 - .05 <= p[1] <= v1 + .05]
    return out


ENTITIES = list(doc.modelspace().query('LINE ARC CIRCLE'))
worst, counts, copies = 0.0, {}, {}
assert set(profile) == set(KEYS), (sorted(profile), sorted(KEYS))
for name, (drawing, uc, vc, reps) in KEYS.items():
    rows = profile[name]
    assert rows, name
    for row in rows:
        exp = expected(doc.entitydb[row[0]], drawing, uc, vc)
        assert row[1] == exp[0], (name, row[0])
        for a, b in zip(row[2:], exp[1:]):
            worst = max(worst, abs(a - b))
            assert abs(a - b) < 1e-6, (name, row[0], a, b)
    counts[name] = len(rows)
    # Each repeat the viewer derives from this outline must lie on drawn linework of that copy.
    for rep in reps:
        rdrawing, ruc, rvc, mirror = rep[:4]
        limit = rep[4] if len(rep) > 4 else .03
        P = points(rows, mirror)
        us, vs = [p[0] for p in P], [p[1] for p in P]
        D = drawing_points(rdrawing, ruc, rvc, (min(us), max(us), min(vs), max(vs)))
        far = max(min(math.dist(p, q) for q in D) for p in P)
        assert far < limit, (name, rep, far)
        copies[f'{name} -> {rdrawing} {ruc:.3f}/{rvc:.3f}{" mirrored" if mirror < 0 else ""}'] = round(far, 5)
print(json.dumps({'status': 'passed', 'source': 'E01B/E02 tower decoration outlines', 'rows': counts,
                  'largest_coordinate_or_angle_difference': worst, 'repeat_copies_largest_point_gap_m': copies,
                  'limits': 'DXF transcription only; mm interpretation (ISSUE-R06), relief and engineering remain held.'}, indent=1))
