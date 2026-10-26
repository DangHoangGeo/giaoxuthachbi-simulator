#!/usr/bin/env python3
"""Verify exterior roofline witnesses directly against the local CAD conversion.

This reads source geometry only. LibreDWG/ezdxf checks do not replace native-CAD,
designer or survey confirmation, especially ISSUE-R06's unit conflict.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

from ezdxf import recover

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / 'docs/exterior-23102026/roofline-witnesses.json'


def extremum_y(entity):
    if entity.dxftype() == 'CIRCLE':
        return entity.dxf.center.y + entity.dxf.radius
    a, b = entity.dxf.start_angle, entity.dxf.end_angle
    if b <= a:
        b += 360
    angles = [a, b] + [x for x in range(0, 721, 90) if a <= x <= b]
    return max(entity.dxf.center.y + entity.dxf.radius * math.sin(math.radians(x)) for x in angles)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify', action='store_true', help='Check saved source witnesses without modifying them')
    args = parser.parse_args()
    saved = json.loads(SPEC.read_text())
    manifest = json.loads((ROOT / 'docs/layout_design/dwg-2026-10-23/sheets.json').read_text())
    source = ROOT / manifest['source']['local_copy']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == saved['source_sha256']
    drawings = {d['id']: d for d in manifest['drawings']}
    doc, audit = recover.readfile(str(ROOT / 'docs/layout_design/dwg-2026-10-23/source/converted.dxf'))
    assert not audit.errors and not audit.fixes
    assert doc.header.get('$INSUNITS') == 1
    wing_centre = doc.entitydb['DAB82A'].dxf.center.x
    max_error = 0
    for row in saved['witnesses']:
        e = doc.entitydb[row['id']]
        assert e.dxftype() == row['entity'] and e.dxf.layer == row['layer']
        if e.dxftype() == 'LINE':
            points = [list(e.dxf.start)[:2], list(e.dxf.end)[:2]]
        else:
            assert e.dxftype() in ('ARC', 'CIRCLE')
            points = [list(e.dxf.center)[:2]]
            assert abs(e.dxf.radius - row['radius']) < 1e-7
            if e.dxftype() == 'ARC':
                for field in ('start_angle', 'end_angle'):
                    assert abs(e.dxf.get(field) - row[field]) < 1e-9
        assert len(points) == len(row['cad_xy'])
        error = max(abs(a - b) for p, q in zip(points, row['cad_xy']) for a, b in zip(p, q))
        max_error = max(max_error, error)
        assert error < 1e-6, (row['id'], error)
        d = drawings[row['drawing']]['origin']
        for point, expected in zip(points, row['elevation_m']):
            if row['drawing'] == 'EW':
                actual = [(point[0] - wing_centre) / 1000, (point[1] - d['floor']) / 1000]
            elif row['drawing'] in ('P05', 'P14'):
                actual = [(point[0] - d['ox']) / 1000, (point[1] - d['oy']) / 1000]
            else:
                actual = [(point[0] - d['ox']) / 1000, (point[1] - d['floor']) / 1000]
            assert max(abs(a - b) for a, b in zip(actual, expected)) < 1e-8, (row['id'], actual, expected)
    floor = drawings['E03']['origin']['floor']
    levels = {name: (extremum_y(doc.entitydb[h]) - floor) / 1000 for name, h in {
        'rear_cross_top': 'D90109', 'wing_cross_top': 'DAB3A8',
        'rear_DE_pinnacle_top': 'D908C1', 'rear_CG_pinnacle_top': 'D90AC6',
        'rear_corner_pinnacle_top': 'D90684', 'wing_outer_pinnacle_top': 'DAC5F5',
        'wing_inner_pinnacle_top': 'DAB7D7', 'porch_pinnacle_top': 'D9B1A6',
    }.items()}
    result = {'verified_source_entities': len(saved['witnesses']), 'largest_native_coordinate_difference_cad_unit': max_error,
              'native_extrema_m': levels,
              'limits': 'Coordinate transcription check; inferred mm/m, schematic depth and construction holds remain.'}
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
