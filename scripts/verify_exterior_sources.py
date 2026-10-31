#!/usr/bin/env python3
"""Check the exterior's saved coordinate witnesses against the local DXF.

This checks transcription, not survey accuracy or a construction issue. The DWG
hash must match the audited source; INSUNITS=1 remains ISSUE-R06.
"""
import hashlib
import json
from pathlib import Path

from ezdxf import recover
from extract_dwg_revision import DRAWINGS, to_model

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'docs/exterior-23102026'


def main():
    manifest = json.loads((ROOT / 'docs/layout_design/dwg-2026-10-23/sheets.json').read_text())
    source = ROOT / manifest['source']['local_copy']
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    assert digest == manifest['source']['sha256']
    doc, audit = recover.readfile(str(ROOT / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf'))
    assert not audit.errors and not audit.fixes and doc.header.get('$INSUNITS') == 1
    drawings = {d['id']: d for d in DRAWINGS}
    count = 0
    worst_m = 0.0

    def near(actual, expected, tolerance=1e-8):
        nonlocal worst_m
        error = abs(actual - expected)
        worst_m = max(worst_m, error)
        assert error < tolerance, (actual, expected, error)

    towers = json.loads((BASE / 'tower-witnesses.json').read_text())
    assert towers['sourceSha256'] == digest
    for row in towers['features']:
        e = doc.entitydb[row['handle']]
        assert e.dxftype() == row['type']
        points = [e.dxf.start, e.dxf.end] if row['type'] == 'LINE' else [e.dxf.center]
        expected = row.get('pointsZY', [row.get('centreZY')])
        for p, q in zip(points, expected):
            for a, b in zip(to_model(drawings[row['drawing']], p.x, p.y), q):
                near(a / 1000, b)
        if 'radiusM' in row:
            near(e.dxf.radius / 1000, row['radiusM'])
        if 'anglesDegrees' in row:
            assert abs(e.dxf.start_angle - row['anglesDegrees'][0]) < 1e-8
            assert abs(e.dxf.end_angle - row['anglesDegrees'][1]) < 1e-8
        count += 1
    other = json.loads((BASE / 'tower-other-faces-witnesses.json').read_text())
    assert other['sourceDwgSha256'] == digest
    for row in other['features']:
        e = doc.entitydb[row['handle']]
        native = row['native']
        assert e.dxftype() == row['type'] and e.dxf.layer == native['layer']
        if row['type'] == 'LINE':
            points = [e.dxf.start, e.dxf.end]
            for p, q in zip(points, native['points']):
                for a, b in zip((p.x, p.y), q):
                    near(a / 1000, b / 1000)
        else:
            points = [e.dxf.center]
            for a, b in zip((e.dxf.center.x, e.dxf.center.y), native['center']):
                near(a / 1000, b / 1000)
            near(e.dxf.radius / 1000, native['radius'] / 1000)
            if row['type'] == 'ARC':
                assert abs(e.dxf.start_angle - native['angles'][0]) < 1e-8
                assert abs(e.dxf.end_angle - native['angles'][1]) < 1e-8
        if 'centreM' in row or 'pointsM' in row:
            d = drawings[row['drawing']]
            for p, q in zip(points, row.get('pointsM', [row.get('centreM')])):
                for a, b in zip(to_model(d, p.x, p.y), q):
                    near(a / 1000, b)
        count += 1
    front = json.loads((BASE / 'front-witnesses.json').read_text())
    assert front['source_sha256'] == digest
    for row in front['source_objects']:
        e = doc.entitydb[row['handle']]
        assert e.dxftype() == row['kind'] and e.dxf.layer == row['layer']
        points = [e.dxf.start, e.dxf.end] if row['kind'] == 'LINE' else [e.dxf.center]
        expected = row.get('points_mm', [[row.get('z_mm'), row.get('y_mm')]])
        for p, q in zip(points, expected):
            for a, b in zip(to_model(drawings['E01B'], p.x, p.y), q):
                near(a / 1000, b / 1000)
        if 'r_mm' in row:
            near(e.dxf.radius / 1000, row['r_mm'] / 1000)
        count += 1
    side = json.loads((BASE / 'side-witnesses.json').read_text())
    assert side['source_sha256'] == digest
    ox, oy = side['source_origin_cad']
    local = lambda p: [(p.x - ox) / 1000, (p.y - oy) / 1000]
    for row in side['arcs']:
        e = doc.entitydb[row['handle']]
        assert e.dxftype() == 'ARC'
        for a, b in zip(local(e.dxf.center), row['centre_m']):
            near(a, b)
        near(e.dxf.radius / 1000, row['radius_m'])
        for actual, expected in ((e.start_point, row['start_m']), (e.end_point, row['end_m'])):
            for a, b in zip(local(actual), expected):
                near(a, b)
        count += 1
    for handle, row in side['dimension_handles'].items():
        e = doc.entitydb[handle]
        near(e.get_measurement() / 1000, row['measurement'] / 1000)
        for p, q in zip((e.dxf.defpoint2, e.dxf.defpoint3), (row['a_m'], row['b_m'])):
            for a, b in zip(local(p), q):
                near(a, b)
        count += 1
    for profile in side['opening_profiles'].values():
        d = drawings[profile['drawing']]
        for row in profile['arcs']:
            e = doc.entitydb[row['handle']]
            for a, b in zip(to_model(d, e.dxf.center.x, e.dxf.center.y), row['c']):
                near(a / 1000, b / 1000)
            near(e.dxf.radius / 1000, row['r'] / 1000)
            count += 1
    print(json.dumps({'source_sha256': digest, 'verified_witness_records': count,
                      'largest_transcription_difference_m': worst_m,
                      'limits': 'Software transcription only; native CAD/designer, units and construction holds remain.'}, indent=2))


if __name__ == '__main__':
    main()
