#!/usr/bin/env python3
"""Check the E02 side-elevation outlines in detail-sides-profile.js against the local source DXF.

Coordinates are a software transcription, not a construction tolerance. The DWG and DXF stay
local under publication hold H1; only these outlines are committed. Owning record:
docs/exterior-23102026/sides.md (section 3/11/2026, "Trang trí hiên").
"""
import hashlib
import json
import math
from pathlib import Path
from ezdxf import recover

root = Path(__file__).resolve().parent.parent
source = root / 'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg'
assert hashlib.sha256(source.read_bytes()).hexdigest() == '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
text = (root / 'Thach_Bi_Viewer/detail-sides-profile.js').read_text()
profile = json.loads(text.split('window.CHURCH_DETAIL_PROFILE_SIDES = ', 1)[1].strip().removesuffix(';'))
doc, audit = recover.readfile(root / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf')
assert not audit.errors and not audit.fixes
U = lambda x: (x - 1404501.3) / 1000  # E02, model X
V = lambda y: (y + 518026.8) / 1000  # E02 floor datum, world Y
def expected(e, uc):
    if e.dxftype() == 'ARC':
        return ['A', U(e.dxf.center.x) - uc, V(e.dxf.center.y), e.dxf.radius / 1000, e.dxf.start_angle, (e.dxf.end_angle - e.dxf.start_angle) % 360, 1]
    if e.dxftype() == 'CIRCLE':
        return ['A', U(e.dxf.center.x) - uc, V(e.dxf.center.y), e.dxf.radius / 1000, 0, 360, 1]
    return ['L', U(e.dxf.start.x) - uc, V(e.dxf.start.y), U(e.dxf.end.x) - uc, V(e.dxf.end.y)]
ORIGIN = {'sideLeaf': 18.975, 'sideRoundel': 21.225, 'sideWindowCapital': 20.974, 'parapetBaluster': 19.6, 'parapetBalusterRing': 19.6}
assert set(profile) == set(ORIGIN), sorted(profile)
worst, counts = 0.0, {}
for name, uc in ORIGIN.items():
    seen = set()
    for row in profile[name]:
        assert row[0] not in seen, (name, row[0]); seen.add(row[0])
        exp = expected(doc.entitydb[row[0]], uc)
        assert row[1] == exp[0], (name, row[0])
        for a, b in zip(row[2:], exp[1:]):
            worst = max(worst, abs(a - b)); assert abs(a - b) < 1e-6, (name, row[0], a, b)
    counts[name] = len(profile[name])
assert counts == {'sideLeaf': 75, 'sideRoundel': 204, 'sideWindowCapital': 61, 'parapetBaluster': 32, 'parapetBalusterRing': 1}, counts
# The baluster outline is one closed chain in stored order (joints as drawn, within 2 mm).
def ends(r):
    u, v, rad, a, s, h = r[2:]
    p = lambda t: (u + h * rad * math.cos(math.radians(t)), v + rad * math.sin(math.radians(t)))
    return p(a), p(a + s)
chain, gap = profile['parapetBaluster'], 0.0
cur = None
for i, r in enumerate(chain):
    a, b = ends(r)
    if cur is None:
        n = ends(chain[1]); cur = b if min(math.dist(b, n[0]), math.dist(b, n[1])) < min(math.dist(a, n[0]), math.dist(a, n[1])) else a
        continue
    d0, d1 = math.dist(cur, a), math.dist(cur, b)
    gap = max(gap, min(d0, d1)); cur = b if d0 <= d1 else a
first = ends(chain[0]); gap = max(gap, min(math.dist(cur, first[0]), math.dist(cur, first[1])))
assert gap < 2e-3, gap
# Right-hand leaf beside the axis-5 pier (X 19.42-20.40) is the mirror of sideLeaf.
right = [expected(e, 18.975) for e in doc.modelspace().query('ARC LINE')
         if e.dxf.handle >= 'D9A146' and len(e.dxf.handle) == 6 and e.dxf.handle <= 'D9A190']
def mirror(r):
    if r[1] == 'A': return ['A', -r[2], r[3], r[4], (180 - r[5] - r[6]) % 360, r[6]]
    return ['L', -r[2], r[3], -r[4], r[5]]
def dist(m, e):
    if m[0] != e[0]: return 9
    if m[0] == 'A': return max(abs(m[1] - e[1]), abs(m[2] - e[2]), abs(m[3] - e[3]), abs((m[4] - e[4] + 180) % 360 - 180) / 100, abs(m[5] - e[5]) / 100)
    return min(max(abs(m[1] - e[1]), abs(m[2] - e[2]), abs(m[3] - e[3]), abs(m[4] - e[4])), max(abs(m[1] - e[3]), abs(m[2] - e[4]), abs(m[3] - e[1]), abs(m[4] - e[2])))
mirror_worst = max(min(dist(mirror(r), e) for e in right) for r in profile['sideLeaf'])
assert mirror_worst < 2e-4, mirror_worst
print(json.dumps({'status': 'passed', 'source': 'E02 side elevation: corner leaf, roundel, window capital, parapet baluster', 'entities': counts,
                  'largest_coordinate_or_angle_difference': worst, 'baluster_chain_largest_joint_gap_m': round(gap, 6),
                  'right_leaf_mirror_largest_difference': round(mirror_worst, 6),
                  'limits': 'DXF transcription only; mm interpretation, relief depth and engineering remain held.'}))
