#!/usr/bin/env python3
"""Extract the church CAD revision received on 24 October 2026 (DWG last saved 23 October 2026).

The DWG and everything rendered from it are the designers' drawings under publication hold H1,
so they stay in the git-ignored folders `source/` and `images/` of OUT. This script writes the
committed, derived data next to them:

  sheets.json      drawing inventory, model-coordinate mapping and PDF counterparts
  dimensions.csv   DIMENSION objects within the 27 registered frames, measuring points in model axes
  levels.csv       printed level labels; follow-up audit resolves actual marker vertices separately
  grid-check.csv   drawn grid centrelines against the register's Model grid
  facade.csv       (hand-entered) the central facade the model follows; `facade` checks every
                   traced row against the drawing's lines, arcs and dimensions

Only DIMENSION objects and level labels are read as numbers; every other text in the drawings is a
title, axis label or material note. The DWG carries fewer dimensions than the PDF set: a value printed
on a PDF but absent here is simply not dimensioned in this file.

Requires LibreDWG's `dwg2dxf` (Homebrew `libredwg`) and the packages in
scripts/requirements-dwg.txt.

  python3 scripts/extract_dwg_revision.py extract            # data only
  python3 scripts/extract_dwg_revision.py extract --render   # data and sheet images
  python3 scripts/extract_dwg_revision.py facade             # check facade.csv against the DWG
  python3 scripts/extract_dwg_revision.py workbook           # add DWG sheets to the register
"""
import argparse
import csv
import hashlib
import json
import re
import shutil
import subprocess
import sys
import zipfile
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs/layout_design/dwg-2026-10-23'
DWG = OUT / 'source/thach-bi-church-2026-10-23.dwg'
DXF = OUT / 'source/converted.dxf'
WORKBOOK = ROOT / 'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx'
ORIGINAL_NAME = 'MẶT BẰNG NHÀ THỜ GIÁO XỨ THẠCH BI.dwg A.dwg'
CURRENT_NAME = 'MẶT BẰNG NHÀ THỜ GIÁO XỨ THẠCH BI.dwg'
PROJECT_BASIS = 'USER CONFIRMED 2026-10-26: this DWG governs project design; internal conflicts and construction engineering holds remain open.'
SOURCE_FILE = '10'  # Sources row added for this DWG

# Drawing inventory. Model-space units are interpreted as millimetres from chains/level labels;
# INSUNITS=1 is a separate, unresolved insertion-unit setting (ISSUE-R06).
# view: plan (X, Z), transverse (Z, Y), longitudinal (X, Y) or local (u, v from frame corner).
# Origins come from the drawn centrelines: axis 1, the D/E midpoint, and the ±0.000 marker apex.
# zsign is -1 where the drawing is seen from the twin-tower end (H on the left).
# pdf: register Sources file with the same subject, or None when the PDF set has no counterpart.
DRAWINGS = [
    dict(id='P05', sheet='5', cat='01-plans', vi='MẶT BẰNG +00 NHÀ THỜ GIÁO XỨ THẠCH BI',
         en='Ground-floor plan +0.00', frame=(1413824, -627178, 1490875, -574990),
         view='plan', ox=1431380.0, oy=-600741.4, pdf='4'),
    dict(id='P14', sheet='14', cat='01-plans', vi='MẶT BẰNG +6,324m THÂN VÀ +8,390m CUỐI - CÂY THÁP NHÀ THỜ',
         en='Plan at +6.324 m (body) and +8.390 m (tower end)', frame=(1498532, -627136, 1575584, -574947),
         view='plan', ox=1516088.4, oy=-600698.6, pdf=None),
    dict(id='PT08', sheet=None, cat='01-plans', vi='MẶT BẰNG KIẾN TRÚC +8,390M ĐỐT MỘT CÂY THÁP',
         en='Tower plan at +8.390 m (first tower stage)', frame=(1581791, -595187, 1616942, -574941),
         view='local', pdf=None),
    dict(id='PT10', sheet=None, cat='01-plans', vi='MẶT BẰNG KIẾN TRÚC CUỐI NHÀ THỜ +10,128M',
         en='Tower-end plan at +10.128 m', frame=(1581789, -619079, 1616940, -598834),
         view='local', pdf=None),
    dict(id='PT15', sheet=None, cat='01-plans', vi='MẶT BẰNG KIẾN TRÚC CUỐI NHÀ THỜ +15,840M',
         en='Tower-end plan at +15.840 m', frame=(1622859, -595238, 1658010, -574993),
         view='local', pdf=None),
    dict(id='PT15A', sheet=None, cat='01-plans', vi='MẶT BẰNG +15,84M NHÀ THỜ GX THẠCH BI',
         en='Single-tower plan at +15.84 m', frame=(1623080, -615632, 1635310, -605348),
         view='local', pdf=None),
    dict(id='PT23', sheet=None, cat='01-plans', vi='MẶT BẰNG +23,14M NHÀ THỜ GX THẠCH BI',
         en='Single-tower plan at +23.14 m', frame=(1637025, -615632, 1649256, -605348),
         view='local', pdf=None),
    dict(id='PT29', sheet=None, cat='01-plans', vi='MẶT BẰNG +29,09M NHÀ THỜ GX THẠCH BI',
         en='Single-tower plan at +29.09 m', frame=(1650591, -615642, 1662822, -605358),
         view='local', pdf=None),
    dict(id='P28', sheet='28', cat='01-plans', vi='MẶT BẰNG MỘT GIAN CỬA SỔ',
         en='Plan of one window bay', frame=(1496865, -543712, 1506475, -536227), view='local', pdf='8'),
    dict(id='P33', sheet='33', cat='01-plans', vi='(không có tiêu đề) Mặt bằng một gian trục 4–5, cửa đi',
         en='Plan of one doorway bay, axes 4–5 (no title)', frame=(1496810, -556896, 1506420, -549412),
         view='local', pdf='9'),
    dict(id='E01A', sheet='1', cat='02-elevations', vi='MẶT ĐỨNG CUỐI NHÀ THỜ GIÁO XỨ THẠCH BI (bản A, cắt qua mái thân)',
         en='Twin-tower end elevation, variant A (cut through the nave roof)', frame=(1606865, -523572, 1644976, -476956),
         view='transverse', ox=1626591.7, floor=-515946.8, zsign=-1, pdf='1'),
    dict(id='E01B', sheet='1', cat='02-elevations', vi='MẶT ĐỨNG CUỐI NHÀ THỜ GIÁO XỨ THẠCH BI (bản B, mặt đứng đầy đủ)',
         en='Twin-tower end elevation, variant B (full elevation)', frame=(1646874, -523572, 1684984, -476956),
         view='transverse', ox=1666600.3, floor=-515946.8, zsign=-1, pdf='1'),
    dict(id='E02', sheet=None, cat='02-elevations', vi='(không có tiêu đề) Mặt đứng bên nhà thờ',
         en='Side elevation (no title)', frame=(1386905, -528109, 1461784, -478625),
         view='longitudinal', ox=1404501.3, floor=-518026.8, pdf='2'),
    dict(id='E03', sheet='3', cat='02-elevations', vi='MẶT ĐỨNG ĐẦU NHÀ THỜ GX THẠCH BI',
         en='Gabled-end elevation', frame=(1571038, -524212, 1602192, -499265),
         view='transverse', ox=1587256.3, floor=-518026.8, zsign=1, pdf='3'),
    dict(id='EW', sheet=None, cat='02-elevations', vi='MẶT ĐỨNG ĐẦU BÊN NGOÀI / BÊN TRONG CÁNH T G NHÀ THỜ GX TB',
         en='Side-wing end elevations, outside and inside', frame=(1535493, -523213, 1564083, -501588),
         view='local', floor=-518026.8, pdf=None),
    dict(id='ET', sheet=None, cat='02-elevations', vi='(không khung, không tiêu đề) Mặt đứng một tháp',
         en='Single tower elevation (no frame or title)', frame=(1696316, -519027, 1705183, -480107),
         view='local', floor=-518026.8, pdf=None),
    dict(id='E26', sheet='26', cat='02-elevations', vi='MẶT ĐỨNG TƯỜNG THÂN BÊN NGOÀI / BÊN TRONG MỘT GIAN CỬA SỔ',
         en='Window-bay wall elevations, outside and inside', frame=(1465861, -543172, 1479533, -532264),
         view='local', pdf='8'),
    dict(id='E31', sheet='31', cat='02-elevations', vi='MẶT ĐỨNG TƯỜNG THÂN BÊN NGOÀI / BÊN TRONG MỘT GIAN CỬA ĐI',
         en='Doorway-bay wall elevations, outside and inside', frame=(1465788, -556829, 1479461, -545921),
         view='local', pdf='9'),
    dict(id='S24', sheet='24', cat='03-sections', vi='MẶT ĐỨNG MỘT VÌ THÂN NHÀ THỜ GX THẠCH BI',
         en='Nave transverse section', frame=(1462926, -524212, 1494080, -499265),
         view='transverse', ox=1479434.7, floor=-518026.8, zsign=1, pdf='6'),
    dict(id='S25', sheet='25', cat='03-sections', vi='MẶT ĐỨNG MỘT VÌ GIAN CUNG THÁNH NHÀ THỜ GX THẠCH BI',
         en='Sanctuary transverse section', frame=(1496854, -524212, 1528008, -499265),
         view='transverse', ox=1513362.7, floor=-518026.8, zsign=1, pdf='7'),
    dict(id='S45', sheet='45', cat='03-sections', vi='MẶT CẮT A-A NHÀ THỜ GIÁO XỨ THẠCH BI',
         en='Longitudinal section A-A', frame=(1716767, -526060, 1791645, -476577),
         view='longitudinal', ox=1734363.0, floor=-515946.8, pdf=None),
    dict(id='S27', sheet='27', cat='03-sections', vi='CẮT A-A CỬA SỔ', en='Window-bay section A-A',
         frame=(1480631, -542323, 1490905, -532406), view='local', pdf='8'),
    dict(id='S32', sheet='32', cat='03-sections', vi='CẮT A-A CỬA ĐI', en='Doorway-bay section A-A',
         frame=(1480649, -555980, 1490924, -546063), view='local', pdf='9'),
    dict(id='D29', sheet='29', cat='04-details', vi='CHI TIẾT CỬA SỔ KHÔNG CÁNH HAI BÊN',
         en='Window detail without leaves, both sides (no frame)', frame=(1507300, -545400, 1516300, -535600),
         view='local', pdf='8'),
    dict(id='D34', sheet='34', cat='04-details', vi='CHI TIẾT CỬA ĐI KHÔNG CÁNH HAI BÊN',
         en='Doorway detail without leaves, both sides (no frame)', frame=(1507600, -557300, 1516300, -547000),
         view='local', pdf='9'),
    dict(id='D46', sheet='46', cat='04-details', vi='CHI TIẾT MẶT ĐỨNG KHUNG SẮT VÌ CUỐN HAI BÊN CÁNH TG TRỤC C-C, G-G',
         en='Steel arch-frame elevation, side wings on axes C and G', frame=(1519649, -545286, 1533292, -533004),
         view='local', pdf=None),
    dict(id='D47', sheet='47', cat='04-details', vi='CHI TIẾT MẶT VÌ CUỐN BT CT HAI BÊN CÁNH TG TRỤC C-C, G-G',
         en='Reinforced-concrete arch frame, side wings on axes C and G', frame=(1534596, -545286, 1548239, -533004),
         view='local', pdf=None),
]
AXES = {'plan': ('X', 'Z'), 'transverse': ('Z', 'Y'), 'longitudinal': ('X', 'Y'), 'local': ('u', 'v')}
LEVEL = re.compile(r'([+\-])\s*(\d+)(?:,(\d+))?\s*M?$', re.I)
# Level-marker apex lies 0.4837 × text height below the marker's top line (all marker sizes here).
APEX = 0.48367


def mm(v):
    return float(Decimal(str(v)).quantize(Decimal('0.1'), ROUND_HALF_UP)) + 0.0  # no negative zero


def printed(v):
    return int(Decimal(str(v)).quantize(Decimal('1'), ROUND_HALF_UP))


def stored_dimension_number(doc, entity):
    """Read the actual cached CAD label, rather than rounding a binary float.

At a nominal x.5 the DWG geometry may be x.49999998 while its stored text is
x+1. Geometry and displayed text are separate evidence and must stay separate.
"""
    block = entity.dxf.get('geometry')
    texts = []
    if block and block in doc.blocks:
        for text in doc.blocks[block].query('TEXT MTEXT'):
            texts.append(text.plain_text() if text.dxftype() == 'MTEXT' else text.dxf.text)
    if len(texts) != 1 or not re.fullmatch(r'[+\-]?\d+(?:[.,]\d+)?', texts[0].strip()):
        raise ValueError(f'Unresolved stored dimension text {entity.dxf.handle}: {texts!r}')
    value = Decimal(texts[0].strip().replace(',', '.'))
    return int(value) if value == value.to_integral_value() else float(value)


def to_model(d, x, y):
    """DWG point → the drawing's two model axes (mm), or local axes from the frame corner."""
    if d['view'] == 'plan':
        return x - d['ox'], y - d['oy']
    if d['view'] == 'transverse':
        return d['zsign'] * (x - d['ox']), y - d['floor']
    if d['view'] == 'longitudinal':
        return x - d['ox'], y - d['floor']
    return x - d['frame'][0], y - d.get('floor', d['frame'][1])


def drawing_at(x, y):
    hits = [d for d in DRAWINGS if d['frame'][0] <= x <= d['frame'][2] and d['frame'][1] <= y <= d['frame'][3]]
    return min(hits, key=lambda d: (d['frame'][2] - d['frame'][0]) * (d['frame'][3] - d['frame'][1])) if hits else None


def register():
    """Cached workbook values: register dimensions by source file, and the model grid."""
    import openpyxl
    wb = openpyxl.load_workbook(WORKBOOK, data_only=True)
    dims = defaultdict(list)
    for r in wb['Dimensions'].iter_rows(min_row=8, values_only=True):
        if not r[0] or not re.match(r'^[A-Z]+\d+$', r[0]) or r[6] in (None, ''):
            continue
        f = re.search(r'File (\d+)', r[9] or '')
        if f:
            dims[f.group(1)].append((r[0], float(r[6])))
    grid = [(r[0], str(r[1]), float(r[3])) for r in wb['Model grid'].iter_rows(min_row=8, values_only=True)
            if r[0] in ('X', 'Z') and isinstance(r[3], (int, float)) and re.fullmatch(r"[0-9A-I]+[′']?", str(r[1]))]
    return dims, grid


def convert():
    if not DWG.exists():
        raise SystemExit(f'missing {DWG.relative_to(ROOT)}: copy the received DWG there first')
    if not DXF.exists() or DXF.stat().st_mtime < DWG.stat().st_mtime:
        if not shutil.which('dwg2dxf'):
            raise SystemExit('dwg2dxf not found: install LibreDWG (brew install libredwg)')
        subprocess.run(['dwg2dxf', '-y', '-o', str(DXF), str(DWG)], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    from ezdxf import recover
    doc, auditor = recover.readfile(str(DXF))
    return doc


def extract(render):
    doc = convert()
    msp = doc.modelspace()
    reg_dims, reg_grid = register()
    header = doc.header
    counts = defaultdict(int)

    # Dimensions
    rows = []
    for e in msp.query('DIMENSION'):
        t = e.dxf.text_midpoint
        d = drawing_at(t.x, t.y) or drawing_at(e.dxf.defpoint2.x, e.dxf.defpoint2.y)
        if not d:
            continue  # three stray objects far outside every drawing
        a, b = e.dxf.defpoint2, e.dxf.defpoint3
        m = e.get_measurement()
        a1, a2 = to_model(d, a.x, a.y)
        b1, b2 = to_model(d, b.x, b.y)
        ang = round(float(e.dxf.get('angle', 0) or 0)) % 180
        kind = 'aligned' if e.dimtype == 1 else ('horizontal' if ang == 0 else 'vertical' if ang == 90 else f'rotated {ang}°')
        override = (e.dxf.get('text', '') or '').strip()
        p = stored_dimension_number(doc, e)
        cand = [i for i, v in reg_dims.get(d['pdf'], []) if abs(v - p) <= 1] if d['pdf'] else []
        rows.append(dict(drawing=d['id'], handle=e.dxf.handle, kind=kind, measured_mm=mm(m), printed_mm=p,
                         text_override=override if override not in ('', '<>') else '',
                         axes='/'.join(AXES[d['view']]), a1=mm(a1), a2=mm(a2), b1=mm(b1), b2=mm(b2),
                         register_file=d['pdf'] or '', register_same_value=' '.join(cand[:12]) +
                         (f' (+{len(cand) - 12})' if len(cand) > 12 else '')))
    order = {d['id']: i for i, d in enumerate(DRAWINGS)}
    rows.sort(key=lambda r: (order[r['drawing']], r['kind'], r['a2'] if r['kind'] == 'horizontal' else r['a1'], r['a1'], r['a2']))
    for n, r in enumerate(rows, 1):
        r['id'] = f'DWG{n:04d}'
        counts[r['drawing']] += 1

    # Levels: labels checked against the apex of the marker below them
    hlines = sorted(((min(s.x, t.x), max(s.x, t.x), s.y) for s, t in
                     ((l.dxf.start, l.dxf.end) for l in msp.query('LINE'))
                     if abs(s.y - t.y) < 0.5 and 150 < abs(s.x - t.x) < 1000), key=lambda h: h[2])
    labels = []
    for e in msp.query('MTEXT'):
        txt = ' '.join(e.plain_text().split())
        m = LEVEL.search(txt)
        x, y, h = e.dxf.insert.x, e.dxf.insert.y, e.dxf.char_height
        d = drawing_at(x, y)
        if not m or not d:
            continue
        value = (-1 if m.group(1) == '-' else 1) * float(f"{m.group(2)}.{m.group(3) or '0'}")
        marker = None
        if d['view'] != 'plan':
            below = [l for l in hlines if y - 4 * h <= l[2] <= y and l[0] <= x + 2 * h and l[1] >= x + 0.5 * h]
            if below:
                marker = max(below, key=lambda l: l[2])[2] - APEX * h
        labels.append(dict(drawing=d['id'], text=txt, printed_m=value, x=x, h=h, marker=marker))
    zero = {(l['drawing'], l['h']): l['marker'] for l in labels if l['printed_m'] == 0 and l['marker'] is not None}
    levels = []
    for l in sorted(labels, key=lambda l: (order[l['drawing']], l['x'] // 5000, -l['printed_m'])):
        d = next(x for x in DRAWINGS if x['id'] == l['drawing'])
        geom = None
        basis = 'plan label (no marker geometry)'
        if l['marker'] is not None and (l['drawing'], l['h']) in zero:
            geom, basis = l['marker'] - zero[(l['drawing'], l['h'])], 'marker apex − ±0.000 marker apex (same symbol)'
        elif l['marker'] is not None and 'floor' in d:
            geom, basis = l['marker'] - d['floor'], 'marker apex − drawing floor line'
        delta = None if geom is None else mm(geom - l['printed_m'] * 1000)
        levels.append(dict(drawing=l['drawing'], label=l['text'], printed_mm=round(l['printed_m'] * 1000),
                           marker_mm='' if geom is None else mm(geom), delta_mm='' if delta is None else delta,
                           check='' if delta is None else ('matches' if abs(delta) <= 1 else 'DIFFERS'), basis=basis))

    # Grid centrelines (layer "duong tim") against the register's Model grid
    lines = [(l.dxf.start, l.dxf.end) for l in msp.query('LINE[layer=="duong tim"]')]
    grid_rows = []
    for d in DRAWINGS:
        if d['view'] == 'local':
            continue
        x0, y0, x1, y1 = d['frame']
        found = {'X': set(), 'Z': set()}
        for s, t in lines:
            if not (x0 <= s.x <= x1 and y0 <= s.y <= y1) or ((s.x - t.x) ** 2 + (s.y - t.y) ** 2) ** 0.5 < 3000:
                continue
            if abs(s.x - t.x) < 1:
                u, _ = to_model(d, s.x, s.y)
                found['Z' if d['view'] == 'transverse' else 'X'].add(mm(u))
            elif abs(s.y - t.y) < 1 and d['view'] == 'plan':
                found['Z'].add(mm(to_model(d, s.x, s.y)[1]))
        for axis3d, name, ref in reg_grid:
            if not found[axis3d]:
                continue
            near = min(found[axis3d], key=lambda v: abs(v - ref))
            if abs(near - ref) <= 5:
                grid_rows.append(dict(drawing=d['id'], axis=axis3d, grid=name, register_mm=ref, dwg_mm=near,
                                      delta_mm=mm(near - ref)))
        used = {r['dwg_mm'] for r in grid_rows if r['drawing'] == d['id']}
        for axis3d in ('X', 'Z'):
            for v in sorted(found[axis3d] - used):
                grid_rows.append(dict(drawing=d['id'], axis=axis3d, grid='(extra centreline)', register_mm='',
                                      dwg_mm=v, delta_mm=''))

    write_csv(OUT / 'dimensions.csv', rows, ['id', 'drawing', 'handle', 'kind', 'measured_mm', 'printed_mm', 'text_override',
                                              'axes', 'a1', 'a2', 'b1', 'b2', 'register_file', 'register_same_value'])
    write_csv(OUT / 'levels.csv', levels, ['drawing', 'label', 'printed_mm', 'marker_mm', 'delta_mm', 'check', 'basis'])
    write_csv(OUT / 'grid-check.csv', grid_rows, ['drawing', 'axis', 'grid', 'register_mm', 'dwg_mm', 'delta_mm'])

    images = render_all(doc) if render else {}
    manifest = dict(
        status='Derived from the church CAD file received 24 October 2026. Not survey data, not for construction. '
               'The DWG and sheet images are under publication hold H1 and are not committed.',
        source=dict(original_name=ORIGINAL_NAME, local_copy=str(DWG.relative_to(ROOT)),
                    sha256=hashlib.sha256(DWG.read_bytes()).hexdigest(), format='AutoCAD 2007 DWG (AC1021)',
                    created='2011-10-27', last_saved='2026-10-23',
                    units='Geometry interpreted as mm from dimension chains and metre level labels; '
                          'DWG/DXF INSUNITS=1 (inches for insertion). Designer confirmation required; no automatic rescaling.',
                    insunits=int(header.get('$INSUNITS', 0)),
                    received='2026-10-24', current_filename=CURRENT_NAME, project_design_basis=PROJECT_BASIS),
        tools=dict(converter='LibreDWG dwg2dxf 0.14', reader='ezdxf ' + __import__('ezdxf').__version__),
        conventions='Model axes follow the register: X from axis 1 toward the sanctuary, Y up from nave floor ±0.000, '
                    'Z from the D/E midpoint, positive toward H/I. Local drawings use u/v from the frame corner '
                    '(v from the floor line where one is given).',
        drawings=[dict(id=d['id'], dwg_sheet=d['sheet'], category=d['cat'], title_vi=d['vi'], title_en=d['en'],
                       frame_dwg_mm=d['frame'], view=d['view'], axes=AXES[d['view']],
                       origin={k: d[k] for k in ('ox', 'oy', 'floor', 'zsign') if k in d},
                       register_pdf_file=d['pdf'], dimension_objects=counts[d['id']],
                       image=images.get(d['id'], image_path(d))) for d in DRAWINGS],
        not_in_dwg=['Roof plan (register File 5, printed sheet 11)', 'Site plan geometry (only its 23-item legend text is present)'],
    )
    (OUT / 'sheets.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(rows)} dimensions, {len(levels)} level labels, {len(grid_rows)} grid rows, '
          f'{len(DRAWINGS)} drawings' + (f', {len(images)} images' if render else ''))


def write_csv(path, rows, fields):
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fields, lineterminator='\n')
        w.writeheader()
        w.writerows(rows)


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:60]


def image_path(d):
    return f"images/{d['cat']}/{d['id']}_{slug(d['en'])}.png"


def render_all(doc):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from ezdxf import bbox
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.config import BackgroundPolicy, ColorPolicy, Configuration
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    msp = doc.modelspace()
    boxes = {}
    for e in msp:
        try:
            b = bbox.extents([e], fast=True)
        except Exception:
            continue
        if b.has_data:
            boxes[id(e)] = (b.extmin.x, b.extmin.y, b.extmax.x, b.extmax.y)
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK, min_lineweight=0.1)

    def draw(frame, path, px_long):
        x0, y0, x1, y1 = frame
        pad = 0.02 * max(x1 - x0, y1 - y0)
        x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
        w, h = (px_long, px_long * (y1 - y0) / (x1 - x0)) if x1 - x0 >= y1 - y0 else (px_long * (x1 - x0) / (y1 - y0), px_long)
        fig = plt.figure(figsize=(w / 100, h / 100), dpi=100)
        ax = fig.add_axes([0, 0, 1, 1])
        keep = lambda e: (b := boxes.get(id(e))) is not None and b[2] >= x0 and b[0] <= x1 and b[3] >= y0 and b[1] <= y1
        Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(msp, finalize=False, filter_func=keep)
        ax.set_xlim(x0, x1)
        ax.set_ylim(y0, y1)
        ax.set_aspect('equal')
        ax.axis('off')
        path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(path, dpi=100, facecolor='white')
        plt.close(fig)

    out = {}
    for d in DRAWINGS:
        rel = image_path(d)
        long_side = max(d['frame'][2] - d['frame'][0], d['frame'][3] - d['frame'][1])
        draw(d['frame'], OUT / rel, int(min(8000, max(3000, long_side / 9))))
        out[d['id']] = rel
        print('rendered', rel, flush=True)
    draw((1375548, -667731, 1808461, -437929), OUT / 'images/00-overview_all-drawings.png', 8000)
    return out


# ---------------------------------------------------------------------------------------------
# Workbook: add DWG sheets and rows without touching existing entries or their cached values.

FINDINGS = [
    # (reference, finding, DWG value, register/PDF value, difference mm, implication)
    ('Model grid', 'Every grid axis drawn in the DWG plans, sections and elevations falls within 0.1 mm of the register.',
     'see DWG grid check', 'Model grid', 0, 'Grid unchanged; no model move needed.'),
    ('E003–E007', 'Tower levels +8.390, +15.840, +23.140, +29.090, +36.920 m match their markers; overall 39,000 mm courtyard to cross top.',
     '+8.390 … +36.920 m', 'same', 0, 'Tower heights unchanged.'),
    ('EI02', 'Central facade chain is drawn 620.6 + 5958.8 + 620.6 = 7200.0 mm; the printed 621 / 5959 / 621 are rounded.',
     '620.6 / 5958.8 / 620.6', '621 / 5959 / 621', 0, 'Evidence that the 1 mm closure is display rounding. Status left for the owner.'),
    ('RFI-S01, ISSUE-R05', 'Main ridge line drawn at +12.396 m in sections 24/25 and in the side elevation (45 m line); '
     'the longitudinal section draws its ridge at +12.472 m. Section labels “+12,472M” sit on markers at +12.396.',
     '+12.396 m (sections, side elevation) / +12.472 m (section A-A)', '+12.472 m label; 14,476 overall', 76,
     'The 14,476 overall equals 2,080 + 12,396. The 76 mm may be a ridge cap; unconfirmed.'),
    ('RFI-S02', 'Section 24/25 dimension and marker give +6.325 m; elevations and wing ends give +6.324 m.',
     '6,325.0 (sections) / 6,324 (elevations)', '6,325 / 6,324', 1, 'The 1 mm difference is in the CAD file itself.'),
    ('RFI-S03', 'Sanctuary section side reference measures 2,950.5 mm and displays as 2951.', '2,950.5', '2,950 / 2,951', 0.5,
     'Rounding; but the opening chain beside it changed between revisions (ISSUE-R03).'),
    ('ISSUE-C01', 'Plan overall runs −13,218.6 → 53,845.0 (67,063.6); longitudinal section runs −13,194.3 → 53,955.1 (67,149.4), '
     'with 939.1 beyond axis 12 against 829 on the plan.', '67,063.6 / 67,149.4', '67,064 / 67,149', 85.8,
     'Plan and section/elevation disagree inside the CAD file; not a PDF reading error.'),
    ('ISSUE-C02', 'Side-wing end elevations label +6.324, +9.830 and +15.187 m; markers match. The inside elevation draws the wing ridge just below +9.830.',
     '+9.830 m; cross top +15.187 m', 'no wing ridge in PDFs', None, 'New evidence for the side-wing ridge; confirm which surface +9.830 marks.'),
    ('ISSUE-C03', 'Section width 22,388 is drawn symmetric about the D/E midpoint (±11,194.0), so the 780 mm offset applies on both sides.',
     '±11,194.0', '780 assumed both sides', 0, 'Assumption supported by CAD geometry.'),
    ('ISSUE-C05', 'Gabled-end elevation: 10,414 + 160 + 669.1 each side = 22,486.2; sections 22,388. The ground plan has no 22,489 dimension object.',
     '22,486.2 / 22,388', '22,489 / 22,486 / 22,388', None, 'Distinct witnesses remain distinct.'),
    ('ISSUE-P05', 'Sanctuary section 25 shows a 1,900 mm wide stepped element centred on the axis (Z −949 to +951) rising to the +800 platform.',
     '1,900 at Y +800', '1,900 × 870 unlabeled', None, 'Supports reading the rectangle as the central steps, not an altar table.'),
    ('ISSUE-R02', 'Central facade between the towers is a different design from PDF sheet 1.', 'DWG sheet 1 (A and B)', 'PDF sheet 1',
     None, 'Owner direction 24 Oct 2026: the model follows the DWG above +8.45 m (facade.csv, docs/facade-model.md). '
     'ISSUE-R02 stays open for the church.'),
    ('ISSUE-R03', 'Sanctuary section heights differ from PDF sheet 5.', '160/2544/466/4392; 6231; 8525; 3171',
     '150/2554/396/4462; 6301; 8452; 2951', 70, 'See ISSUE-R03.'),
    ('ISSUE-R04', 'Sanctuary platform dimensioned 800 mm in section 25; DWG plan and PDFs show +0.75 m.', '800', '750', 50, 'See ISSUE-R04.'),
    ('ISSUE-P01, EI01', 'No roof plan in the DWG; the tower-cap chain is not available as dimension objects.', '—', '—', None,
     'These items need the roof plan and the tower-cap dimensions from the designer.'),
]

NEW_ISSUES = [
    ('ISSUE-R01', 'Bộ bản vẽ hiện hành / Which drawing revision governs',
     'The CAD file received 24 Oct 2026 (AutoCAD 2007 DWG, created 2011, last saved 23 Oct 2026) numbers its sheets 1–47 and '
     'adds a longitudinal section, a +6.324/+8.390 m plan, tower plans, side-wing end elevations, arch-frame details and a '
     'tower elevation. Its grid and tower levels agree with the PDFs, but its central facade, sanctuary section and plan '
     'dimensioning differ. It has no roof plan.',
     'Source file 10; Files 1–9', None, 'Chưa xác nhận / Open',
     'Nhà thờ/kiến trúc sư xác nhận bộ nào hiện hành và các PDF in từ thời điểm nào của file. / Church and designer to confirm '
     'which set is current and when the PDFs were plotted from this file.'),
    ('ISSUE-R02', 'Mặt giữa hai tháp / Central facade between the towers',
     'DWG sheet 1 (variant A cut through the nave roof, variant B full elevation) shows one pedimented arched niche with a '
     'cross, flanked by crested parapets with fleur-de-lis cresting, two smaller arched niches and a triple-arched window '
     'under a rose above the main door. PDF sheet 1 shows a taller screen of three pinnacled gables, which the current '
     'model follows. Tower geometry and the central 7,200 mm bay are the same.',
     'File 1; source file 10 sheet 1', None, 'Chưa xác nhận / Open',
     'Xác nhận mặt giữa sẽ xây và cung cấp cao độ các tầng trang trí. / Confirm which central facade is to be built and '
     'provide its heights.'),
    ('ISSUE-R03', 'Chiều cao mặt cắt cung thánh / Sanctuary section heights',
     'DWG sheet 25 against PDF sheet 5: side-aisle opening chain 160 / 2,544 / 466 / 4,392 against 150 / 2,554 / 396 / 4,462 '
     '(both 7,562); inner heights 6,231 and 8,525 against 6,301 and 8,452; right-side opening reference 3,171 (3,170.5) '
     'against 2,951.',
     'S074, S075, S076; source file 10 sheet 25', 70, 'Chưa xác nhận / Open',
     'Xác nhận bản mặt cắt cung thánh hiện hành. / Confirm the current sanctuary section.'),
    ('ISSUE-R04', 'Cao độ bục cung thánh / Sanctuary platform level',
     'DWG section 25 dimensions the sanctuary platform 800 mm above the nave floor, with column bases 200 mm above it. '
     'The DWG ground plan still labels +0.75 m, as do the PDF plan and section.',
     'P049; source file 10 sheets 5 and 25', 50, 'Chưa xác nhận / Open',
     'Xác nhận +0,75 hay +0,80 m. / Confirm +0.75 m or +0.80 m.'),
    ('ISSUE-R05', 'Nóc mái vẽ và ghi khác nhau / Drawn and labelled ridge differ',
     'The main ridge line is drawn at +12.396 m in DWG sections 24/25 and the side elevation, while every label reads '
     '+12.472 m and section A-A draws its ridge at +12.472 m. The 14,476 overall on the sections equals 2,080 + 12,396. '
     'Explains RFI-S01; the 76 mm may be a ridge cap.',
     'E049, S001, S006; source file 10 sheets 24, 25, 45', 76, 'Chưa xác nhận / Open',
     'Xác nhận +12,472 là đỉnh ngói nóc hay đỉnh vì kèo. / Confirm whether +12.472 m is the ridge-cap top or the roof apex.'),
    ('ISSUE-R06', 'Đơn vị hình học và đơn vị chèn trong DWG',
     'DWG gốc và DXF mới đều có INSUNITS=1 (inch, đơn vị chèn). Chuỗi trục 4500/7200 và các nhãn cao độ theo m phù hợp '
     'cách hiểu hình học mm của mô hình; đây là diễn giải từ bản vẽ, chưa phải xác nhận đơn vị của người thiết kế. '
     'Không tự nhân hoặc chia tọa độ theo 25,4.',
     'Tệp CAD nguồn 10; 726 đối tượng kích thước; 137 mốc trục', None, 'Chưa xác nhận / ENGINEERING HOLD',
     'Người thiết kế mở DWG trong AutoCAD/ODA, xác nhận đơn vị hình học, tỷ lệ chèn, đơn vị ghi kích thước và phát hành hồ sơ thi công thống nhất.'),
]


# Model levels the owner adopted from the DWG (24 Oct 2026). The Model grid sheet records what
# the model uses; the PDF values stay in Dimensions, and the open item stays open for the church.
ADOPTED_LEVELS = [
    ('Sanctuary/altar platform', 800, 'P049 (PDF 750); DWG0378',
     'CAD sections 25 and 45 draw the dais at +0.800 (800 mm dimension, platform lines). The PDF set and the '
     'CAD ground-plan label give +0.750 (P049, ISSUE-R04). The model uses +0.800 by owner direction.'),
    ('Upper rear side room', 160, 'P050 (PDF 150); DWG0373',
     'CAD section 25 dimensions the side floor 160 mm. The PDF set and the CAD ground-plan labels give +0.150. '
     'The model uses +0.160 by owner direction.'),
    ('Lower rear side room', 160, 'P052 (PDF 150); DWG0373',
     'CAD section 25 dimensions the side floor 160 mm. The PDF set and the CAD ground-plan labels give +0.150. '
     'The model uses +0.160 by owner direction.'),
]
ADOPTED_BASIS = 'Owner direction 24 Oct 2026 · CAD file 23 Oct 2026'


def workbook():
    import openpyxl
    from copy import copy
    from openpyxl.worksheet.table import Table, TableStyleInfo

    manifest = json.loads((OUT / 'sheets.json').read_text(encoding='utf-8'))
    read = lambda name: list(csv.DictReader((OUT / name).open(encoding='utf-8')))
    dims, levels, grid, facade = read('dimensions.csv'), read('levels.csv'), read('grid-check.csv'), read('facade.csv')
    wb = openpyxl.load_workbook(WORKBOOK)
    tpl = wb['Dimensions']
    style = {k: tpl[c] for k, c in (('title', 'A2'), ('sub', 'A4'), ('head', 'A7'), ('text', 'B8'), ('num', 'G8'))}

    def put(ws, row, col, value, kind):
        c = ws.cell(row, col, value)
        s = style[kind]
        c.font, c.fill, c.border, c.alignment = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment)
        c.number_format = '#,##0.0' if kind == 'num' and isinstance(value, float) and not value.is_integer() else (
            '#,##0' if kind == 'num' else s.number_format)

    def sheet(name, table, title, subtitle, columns, records):
        if name in wb.sheetnames:
            del wb[name]
        ws = wb.create_sheet(name)
        ws.sheet_properties.tabColor = tpl.sheet_properties.tabColor
        ws.sheet_view.showGridLines = False
        for r in range(1, 5):
            ws.row_dimensions[r].height = 25
        put(ws, 2, 1, title, 'title')
        put(ws, 4, 1, subtitle, 'sub')
        for i, (head, width, _) in enumerate(columns, 1):
            put(ws, 7, i, head, 'head')
            ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = width
        for r, rec in enumerate(records, 8):
            for i, (_, _, kind) in enumerate(columns, 1):
                v = rec[i - 1]
                if kind == 'num' and isinstance(v, str):
                    v = float(v) if v.strip() else None
                    v = int(v) if v is not None and v.is_integer() and abs(v) >= 1 else v
                put(ws, r, i, v, kind if v is not None else 'text')
        end = 7 + max(1, len(records))
        ref = f"A7:{openpyxl.utils.get_column_letter(len(columns))}{end}"
        t = Table(displayName=table, ref=ref)
        t.tableStyleInfo = TableStyleInfo(name='TableStyleLight1', showRowStripes=True)
        ws.add_table(t)
        ws.freeze_panes = 'C8'
        return ws

    by_id = {d['id']: d for d in manifest['drawings']}
    src = manifest['source']
    note = ('Phiên bản 23102026. 726 kích thước thuộc 27 bản vẽ. Đơn vị mm suy từ chuỗi kích thước và nhãn m; '
            'INSUNITS gốc = 1 (inch, đơn vị chèn). Cần người thiết kế xác nhận đơn vị. '
            'Số ghi lấy trực tiếp từ chữ số lưu trong CAD. Không dùng để thi công.')
    sheet('DWG sheets', 'DwgSheets', 'BẢN VẼ CAD 23/10/2026 / CAD DRAWINGS 2026-10-23', note,
          [('Mã / ID', 12, 'text'), ('Tờ DWG / DWG sheet', 14, 'text'), ('Nhóm / Category', 16, 'text'),
           ('Tiêu đề / Title (VI)', 60, 'text'), ('Title (EN)', 52, 'text'), ('Trục mô hình / Model axes', 18, 'text'),
           ('PDF tương ứng / Register file', 18, 'text'), ('Số kích thước / Dimension objects', 18, 'num'),
           ('Ảnh (không commit) / Image (not committed)', 70, 'text')],
          [(d['id'], d['dwg_sheet'] or '—', d['category'][3:], d['title_vi'], d['title_en'], '/'.join(d['axes']),
            d['register_pdf_file'] or '—', d['dimension_objects'], d['image']) for d in manifest['drawings']])
    sheet('DWG dimensions', 'DwgDimensions', 'KÍCH THƯỚC TRONG FILE CAD / CAD DIMENSION OBJECTS',
          'a/b là hai điểm đo theo trục mô hình của từng bản vẽ (mm). / a and b are the two measuring points in each '
          "drawing's model axes (mm). Same-value register IDs are candidates by value only, not confirmed witnesses.",
          [('Mã / ID', 11, 'text'), ('Bản vẽ / Drawing', 11, 'text'), ('Tờ DWG / Sheet', 10, 'text'),
           ('Loại / Kind', 13, 'text'), ('Đo được (mm) / Measured', 16, 'num'), ('Số in (mm) / Displayed', 15, 'num'),
           ('Trục / Axes', 9, 'text'), ('a1', 12, 'num'), ('a2', 12, 'num'), ('b1', 12, 'num'), ('b2', 12, 'num'),
           ('PDF file', 9, 'text'), ('Mã cùng trị số / Same-value register IDs', 48, 'text'), ('Handle', 10, 'text')],
          [(r['id'], r['drawing'], by_id[r['drawing']]['dwg_sheet'] or '—', r['kind'], r['measured_mm'], r['printed_mm'],
            r['axes'], r['a1'], r['a2'], r['b1'], r['b2'], r['register_file'] or '—', r['register_same_value'],
            r['handle']) for r in dims])
    sheet('DWG levels', 'DwgLevels', 'CAO ĐỘ TRONG FILE CAD / CAD LEVEL LABELS',
          'So nhãn cao độ với đỉnh ký hiệu cao độ vẽ bên dưới. / Each printed level against the apex of its drawn marker.',
          [('Bản vẽ / Drawing', 12, 'text'), ('Nhãn / Label', 30, 'text'), ('Ghi (mm) / Printed', 14, 'num'),
           ('Theo ký hiệu (mm) / Marker', 18, 'num'), ('Chênh (mm) / Δ', 12, 'num'), ('Kiểm tra / Check', 12, 'text'),
           ('Cơ sở / Basis', 50, 'text')],
          [(r['drawing'], r['label'], r['printed_mm'], r['marker_mm'], r['delta_mm'], r['check'], r['basis']) for r in levels])
    sheet('DWG grid check', 'DwgGridCheck', 'KIỂM TRA LƯỚI TRỤC / GRID CHECK',
          'Đường tim vẽ trong DWG so với Model grid. / Drawn centrelines (layer “duong tim”) against the Model grid.',
          [('Bản vẽ / Drawing', 12, 'text'), ('Trục 3D / Axis', 10, 'text'), ('Trục / Grid', 20, 'text'),
           ('Register (mm)', 14, 'num'), ('DWG (mm)', 14, 'num'), ('Chênh (mm) / Δ', 12, 'num')],
          [(r['drawing'], r['axis'], r['grid'], r['register_mm'], r['dwg_mm'], r['delta_mm']) for r in grid])
    sheet('DWG findings', 'DwgFindings', 'ĐỐI CHIẾU PDF VÀ DWG / PDF AGAINST DWG',
          'Bằng chứng mới cho các mục mở; trạng thái các mục cũ không đổi. / New evidence for open items; existing '
          'statuses are unchanged until the owner decides.',
          [('Tham chiếu / Reference', 20, 'text'), ('Phát hiện / Finding', 80, 'text'), ('DWG', 34, 'text'),
           ('Sổ đăng ký / Register or PDF', 30, 'text'), ('Chênh (mm) / Δ', 12, 'num'), ('Hệ quả / Implication', 60, 'text')],
          [(a, b, c, d, '' if e is None else float(e), f) for a, b, c, d, e, f in FINDINGS])

    sheet('DWG facade', 'DwgFacade', 'MẶT GIỮA HAI THÁP THEO FILE CAD / CENTRAL FACADE FROM THE CAD FILE',
          'Mô hình theo file CAD từ +8,45 m (chủ đầu tư, 24/10/2026). p1–p4: đường, cung hoặc kích thước được kiểm '
          'bằng `extract_dwg_revision.py facade`. / The model follows the CAD file above +8.45 m (owner, 2026-10-24). '
          'p1–p4 give the line, arc or dimension checked by `extract_dwg_revision.py facade`; elevation u = Z, v = Y; '
          'plans u = Z, v = X (mm).',
          [('Mã / ID', 8, 'text'), ('Bộ phận / Element', 46, 'text'), ('Bản vẽ / Drawing', 11, 'text'),
           ('Loại / Kind', 8, 'text'), ('p1', 11, 'num'), ('p2', 11, 'num'), ('p3', 11, 'num'), ('p4', 11, 'num'),
           ('Giá trị (mm) / Value', 14, 'num'), ('Mô hình / Model (m)', 30, 'text'), ('Cơ sở / Basis', 22, 'text'),
           ('Ghi chú / Note', 70, 'text')],
          [(r['id'], r['element'], r['drawing'], r['kind'], r['p1'], r['p2'], r['p3'], r['p4'], r['value_mm'],
            r['model_m'], r['basis'], r['note']) for r in facade])

    # Sources: add the DWG as file 10 once, keeping a blank row before the conventions block.
    ws = wb['Sources']
    table = ws.tables['DrawingSources']
    last = int(re.search(r'(\d+)$', table.ref).group(1))
    if not any(str(ws.cell(r, 1).value) == SOURCE_FILE for r in range(8, last + 1)):
        ws.move_range(f'A{last + 1}:E{ws.max_row}', rows=1)
        for col, value in enumerate((int(SOURCE_FILE), '1, 3, 5, 14, 24–34, 45–47',
                                     'Bộ bản vẽ CAD (DWG), lưu 23/10/2026\nCAD drawing set (DWG), saved 2026-10-23',
                                     ORIGINAL_NAME, '—'), 1):
            c, s = ws.cell(last + 1, col, value), ws.cell(last, col)
            c.font, c.fill, c.border, c.alignment, c.number_format = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment), s.number_format
        ws.row_dimensions[last + 1].height = ws.row_dimensions[last].height
        table.ref = f'A7:E{last + 1}'

    # Open items: append the revision items once, after the last row, with the last row's styles.
    ws = wb['Open items']
    table = ws.tables['OpenDimensions']
    last = int(re.search(r'(\d+)$', table.ref).group(1))
    have = {ws.cell(r, 1).value for r in range(8, last + 1)}
    for issue in NEW_ISSUES:
        if issue[0] in have:
            continue
        last += 1
        for col, value in enumerate(issue + (None, None), 1):
            c, s = ws.cell(last, col, value), ws.cell(last - 1, col)
            c.font, c.fill, c.border, c.alignment, c.number_format = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment), s.number_format
        ws.row_dimensions[last].height = ws.row_dimensions[last - 1].height
    table.ref = f'A7:I{last}'
    from openpyxl.formatting.formatting import ConditionalFormattingList
    formats = ConditionalFormattingList()  # ranges are dictionary keys, so rebuild rather than edit
    for cf in ws.conditional_formatting:
        for rule in cf.rules:
            formats.add(f'F8:F{last}' if str(cf.sqref).startswith('F8:F') else str(cf.sqref), rule)
    ws.conditional_formatting = formats

    # Model grid: levels adopted from the DWG replace the formula that copied the PDF value.
    ws = wb['Model grid']
    replaced = set()
    for name, value, source_ids, note in ADOPTED_LEVELS:
        row = next(r for r in range(8, ws.max_row + 1) if ws.cell(r, 1).value == 'Y' and ws.cell(r, 2).value == name)
        if ws.cell(row, 7).value == ADOPTED_BASIS:
            continue
        ws.cell(row, 4).value, ws.cell(row, 5).value = value, value / 1000
        ws.cell(row, 6).value, ws.cell(row, 7).value, ws.cell(row, 8).value = source_ids, ADOPTED_BASIS, note
        replaced |= {('Model grid', f'D{row}'), ('Model grid', f'E{row}')}

    tmp = WORKBOOK.with_suffix('.tmp.xlsx')
    wb.save(tmp)
    restore_cached_values(WORKBOOK, tmp, replaced)
    tmp.replace(WORKBOOK)
    print(f'updated {WORKBOOK.relative_to(ROOT)}: {len(dims)} DWG dimensions, {len(levels)} levels, '
          f'{len(grid)} grid rows, {len(facade)} facade rows, {len(FINDINGS)} findings, {len(NEW_ISSUES)} revision items')


def restore_cached_values(original, rewritten, replaced=frozenset()):
    """openpyxl drops formula results and re-serialises some numbers (8.39 → 8.390000000000001).

    Copy each formula cell's cached value back from the original, and put back the original text of
    every plain number that is unchanged apart from that last-digit noise.
    """
    def parts(z):
        ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
              'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
        import xml.etree.ElementTree as ET
        book = ET.fromstring(z.read('xl/workbook.xml'))
        rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        target = {r.get('Id'): r.get('Target') for r in rels}
        out = {}
        for s in book.iter('{%s}sheet' % ns['m']):
            t = target[s.get('{%s}id' % ns['r'])].lstrip('/')
            out[s.get('name')] = t if t.startswith('xl/') else 'xl/' + t
        return out

    cell = re.compile(r'<(?:x:)?c r="([A-Z]+\d+)"([^>]*?)(?:/>|>(.*?)</(?:x:)?c>)', re.S)
    with zipfile.ZipFile(original) as z:
        cached, numbers = {}, {}
        for name, path in parts(z).items():
            xml = z.read(path).decode('utf-8')
            for ref, attrs, body in cell.findall(xml):
                v = re.search(r'<(?:x:)?v>(.*?)</(?:x:)?v>', body or '')
                t = re.search(r'\bt="(\w+)"', attrs)
                if body and re.search(r'<(?:x:)?f[ >]', body):
                    cached[(name, ref)] = (v.group(1) if v else None, t.group(1) if t else None)
                elif v and (not t or t.group(1) == 'n'):
                    numbers[(name, ref)] = v.group(1)
    with zipfile.ZipFile(rewritten) as z:
        items = [(i, z.read(i.filename)) for i in z.infolist()]
        sheet_paths = {p: n for n, p in parts(z).items()}
    restored = renumbered = 0
    with zipfile.ZipFile(rewritten, 'w', zipfile.ZIP_DEFLATED) as z:
        for info, data in items:
            name = sheet_paths.get(info.filename)
            if name:
                def fix(m):
                    nonlocal restored, renumbered
                    ref, attrs, body = m.group(1), m.group(2), m.group(3)
                    if body and '<f>' not in body and (name, ref) in numbers:
                        v = re.search(r'<v>(.*?)</v>', body)
                        old = numbers[(name, ref)]
                        try:
                            same = v and v.group(1) != old and abs(float(v.group(1)) - float(old)) <= 1e-9 * max(1, abs(float(old)))
                        except ValueError:
                            same = False
                        if same:
                            renumbered += 1
                            return m.group(0).replace(f'<v>{v.group(1)}</v>', f'<v>{old}</v>')
                        return m.group(0)
                    if not body or '<f>' not in body or (name, ref) not in cached:
                        return m.group(0)
                    value, kind = cached[(name, ref)]
                    body = re.sub(r'<v>.*?</v>|<v\s*/>', '', body, flags=re.S)
                    attrs = re.sub(r'\s+t="\w+"', '', attrs) + (f' t="{kind}"' if kind else '')
                    if value is not None:
                        body += f'<v>{value}</v>'
                    restored += 1
                    return f'<c r="{ref}"{attrs}>{body}</c>'
                data = cell.sub(fix, data.decode('utf-8')).encode('utf-8')
            z.writestr(info, data)
    missing = len(set(cached) - set(replaced)) - restored
    if missing:
        raise SystemExit(f'{missing} formula cells lost their cached values; workbook not replaced')
    print(f'restored cached values for {restored} formula cells and the original text of {renumbered} numbers')


# Tower-end plans are drawn without a model origin; their axis 1 (X 0) and the D/E midpoint
# (Z 0) are read from the drawn centrelines (layer “duong tim”). Z grows toward H, which is
# drawn to the left, as in the elevations.
PLAN_AXES = {'PT10': (-609567.5, 1599381.7), 'PT15': (-585726.6, 1640451.6)}


def facade_check():
    """Check every traced row of facade.csv against the geometry of its drawing, within 1.5 mm."""
    from ezdxf import bbox, path as dxfpath
    doc = convert()
    rows = list(csv.DictReader((OUT / 'facade.csv').open(encoding='utf-8')))
    frames = {d['id']: d for d in DRAWINGS if d['id'] in {r['drawing'] for r in rows}}
    def uv(name, x, y):
        if name in PLAN_AXES:
            axis1, mid = PLAN_AXES[name]
            return mid - x, y - axis1
        return to_model(frames[name], x, y)
    shapes = defaultdict(list)  # drawing → [(kind, data)]
    def take(e):
        t = e.dxftype()
        if t not in ('LINE', 'ARC', 'CIRCLE', 'LWPOLYLINE', 'POLYLINE'):
            return
        try:
            pts = list(dxfpath.make_path(e).flattening(5))
        except Exception:
            return
        name = next((n for n, d in frames.items() if pts and d['frame'][0] <= pts[0].x <= d['frame'][2]
                     and d['frame'][1] <= pts[0].y <= d['frame'][3]), None)
        if not name:
            return
        if t == 'ARC':
            c = e.dxf.center
            shapes[name].append(('arc', (*uv(name, c.x, c.y), e.dxf.radius)))
        shapes[name].append(('poly', [uv(name, p.x, p.y) for p in pts]))
    lo = (min(d['frame'][0] for d in frames.values()), min(d['frame'][1] for d in frames.values()))
    hi = (max(d['frame'][2] for d in frames.values()), max(d['frame'][3] for d in frames.values()))
    for e in doc.modelspace():
        try:
            b = bbox.extents([e], fast=True)
        except Exception:
            continue
        if not b.has_data or b.extmax.x < lo[0] or b.extmin.x > hi[0] or b.extmax.y < lo[1] or b.extmin.y > hi[1]:
            continue
        for v in (e.virtual_entities() if e.dxftype() == 'INSERT' else [e]):
            take(v)
    dims = {(r['drawing'], float(r['measured_mm'])) for r in csv.DictReader((OUT / 'dimensions.csv').open(encoding='utf-8'))}
    tol, failed = 1.5, []
    for r in rows:
        if r['basis'] != 'TRACED':
            continue
        name, kind = r['drawing'], r['kind']
        p = [float(r[k]) if r[k] else None for k in ('p1', 'p2', 'p3', 'p4')]
        segs = [(a, b) for k, pts in shapes[name] if k == 'poly' for a, b in zip(pts, pts[1:])]
        if kind == 'arc':
            ok = any(k == 'arc' and abs(d[0] - p[0]) <= tol and abs(d[1] - p[1]) <= tol and abs(d[2] - p[2]) <= tol for k, d in shapes[name])
        elif kind == 'h':
            ok = any(abs(a[1] - p[0]) <= tol and abs(b[1] - p[0]) <= tol and min(a[0], b[0]) <= min(p[1], p[2]) + tol
                     and max(a[0], b[0]) >= max(p[1], p[2]) - tol for a, b in segs)
        elif kind == 'v':
            ok = any(abs(a[0] - p[0]) <= tol and abs(b[0] - p[0]) <= tol and min(a[1], b[1]) <= min(p[1], p[2]) + tol
                     and max(a[1], b[1]) >= max(p[1], p[2]) - tol for a, b in segs)
        elif kind == 'seg':
            ok = any(all(abs(m - n) <= tol for m, n in zip((*a, *b), q)) for a, b in segs for q in (p, (p[2], p[3], p[0], p[1])))
        elif kind == 'ymax':
            top = max(pt[1] for k, pts in shapes[name] if k == 'poly' and all(p[0] <= q[0] <= p[1] for q in pts) for pt in pts)
            ok = abs(top - float(r['value_mm'])) <= tol
        elif kind == 'dim':
            ok = (name, p[0]) in dims
        else:
            ok = False
        print(f"{r['id']:4} {'ok ' if ok else 'MISSING'} {r['element']}")
        if not ok:
            failed.append(r['id'])
    if failed:
        raise SystemExit(f'not found in the drawing: {failed}')
    print(f'facade.csv: {sum(r["basis"] == "TRACED" for r in rows)} traced rows found in the DWG')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('command', choices=('extract', 'facade', 'workbook'))
    ap.add_argument('--render', action='store_true', help='also render every drawing to images/ (not committed)')
    a = ap.parse_args()
    extract(a.render) if a.command == 'extract' else facade_check() if a.command == 'facade' else workbook()


if __name__ == '__main__':
    sys.exit(main())
