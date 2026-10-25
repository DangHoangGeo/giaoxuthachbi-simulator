#!/usr/bin/env python3
"""Local, vector CAD review PDFs; never publishes the designers' drawings.

Uses the verified inventory/coordinate transforms in extract_dwg_revision.py.
Requires its Python dependencies plus PyMuPDF. PDF page sizes are fit-to-page,
not calibrated plotting scales. Original DIMENSION graphics stay unchanged.
"""
import argparse
import csv
import hashlib
import json
from pathlib import Path

from extract_dwg_revision import DRAWINGS, OUT, ROOT, convert, to_model

DEST = ROOT / 'exports/dwg-review-2026-10-26'


def rows(name):
    with (OUT / name).open(encoding='utf-8', newline='') as stream:
        return list(csv.DictReader(stream))


def prepare_register(dest):
    """Curate important witnesses, without replacing older PDF measurements."""
    import openpyxl
    selection = json.loads((OUT / 'key-dimension-selection.json').read_text())
    dims, facade = {r['id']: r for r in rows('dimensions.csv')}, {r['id']: r for r in rows('facade.csv')}
    headers = ['ID', 'Part / witness', 'Parameter', 'Value (mm)', 'Value (m)', 'Drawing', 'Source',
               'Basis', 'Axes', 'a1 (mm)', 'a2 (mm)', 'b1 (mm)', 'b2 (mm)', 'Limits / interpretation']
    keys = []
    for ident, part, parameter, note in selection['dimensions']:
        r = dims[ident]
        value = float(r['measured_mm'])
        keys.append([ident, part, parameter, value, round(value/1000, 4), r['drawing'], 'DIMENSION handle '+r['handle'],
                     'DRAWING SHOWN', r['axes'], *[float(r[k]) for k in ('a1', 'a2', 'b1', 'b2')], note])
    for ident in selection['facade']:
        r = facade[ident]
        value = float(r['value_mm'])
        plan = r['drawing'] in ('PT10', 'PT15')
        parameter = 'Radius' if r['kind'] == 'arc' else 'X position' if plan else 'Y level'
        note = '; '.join(v for v in (r['model_m'], r['note']) if v)
        if ident == 'F15':
            note = r['model_m']+'; pedestal top +10.391 m; statue placement is CONCEPT'
        if r['kind'] == 'arc':
            note += f"; arc centre ({r['p1']}, {r['p2']}) mm, radius {r['p3']} mm"
        # The facade register has a separate, explicitly mapped coordinate system.
        keys.append([ident, r['element'], parameter, value, round(value/1000, 4), r['drawing'],
                     'facade.csv '+ident+' (geometry checked within 1.5 mm)', 'DERIVED / TRACED',
                     'Z/X' if plan else 'Z/Y', None, None, None, None, note])
    for drawing, value, part in [('E01B', -2080, 'Courtyard datum'), ('E01B', 0, 'Nave floor datum'),
                                  ('E01B', 8390, 'Tower lower-stage level'), ('E01B', 15840, 'Tower upper-stage level'),
                                  ('E01B', 23140, 'Tower intermediate level'), ('E01B', 29090, 'Tower cap base level'),
                                  ('E01B', 36920, 'Tower cross top above nave floor'),
                                  ('EW', 6324, 'Wing cornice label'), ('EW', 9830, 'Wing roof reference label'),
                                  ('EW', 15187, 'Wing cross-top label')]:
        r = next(r for r in rows('levels.csv') if r['drawing']==drawing and float(r['printed_mm'])==value)
        note = f"Label {r['label']}; marker {r['marker_mm']} mm; {r['check']}."
        if value == 6324:
            note += ' Section 6325 mm differs by 1 mm; RFI-S02.'
        if value == 9830:
            note += ' Exact roof surface remains to be confirmed, ISSUE-C02.'
        keys.append([f'LEVEL-{drawing}-{value}', part, 'Y level', value, value/1000, drawing,
                     f"levels.csv {drawing}: {r['label']}", 'DRAWING SHOWN', 'Y', None, None, None, None, note])
    with (OUT / 'key-dimensions.csv').open('w', encoding='utf-8', newline='') as stream:
        writer = csv.writer(stream, lineterminator='\n')
        writer.writerow(headers)
        writer.writerows(keys)
    book = openpyxl.load_workbook(ROOT/'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx', data_only=True)
    grid = []
    for rowno, r in enumerate(book['Model grid'].values, 1):
        if r[0] in ('X', 'Z') and r[1] and __import__('re').fullmatch(r"[0-9A-I]+[′']?", str(r[1])):
            grid.append([r[0], str(r[1]), r[3], r[4], r[5], f'Model grid!D{rowno}',
                         'DWG grid-check.csv agrees within 0.1 mm; grid centreline, not finished face.'])
    original = openpyxl.load_workbook(ROOT/'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx')
    patches = [
        ['Open items', 'F30', 'USER CONFIRMED - project design basis; construction issue remains ENGINEERING HOLD'],
        ['Open items', 'G30', 'Owner direction, 26 October 2026: use the DWG saved 23 October 2026 as the project design standard. '
         'Retain older PDF evidence and unresolved internal conflicts. Responsible designer to issue coordinated construction drawings.'],
        ['Open items', 'I30', 'Owner instruction in project chat, 2026-10-26; same DWG SHA-256 as source file 10 (sheets.json).'],
        ['Open items', 'C31', original['Open items']['C31'].value.replace('which the current model follows',
            'which the model followed before the DWG facade adoption on 24 October 2026')],
        ['DWG sheets', 'A4', 'Owner confirmed 26 October 2026: DWG saved 23 October 2026 governs project design. '
         'Current filename: MẶT BẰNG NHÀ THỜ GIÁO XỨ THẠCH BI.dwg; byte-identical to source file 10. '
         '726 dimension objects; 79 level labels. Older PDF witnesses and all unresolved engineering conflicts are retained. Not for construction.'],
    ]
    payload = {'status': selection['status'], 'headers': headers, 'keys': keys, 'grid': grid,
               'drawings': json.loads((OUT/'sheets.json').read_text())['drawings'], 'patches': patches}
    (dest/'register-data.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n')
    print(f'Prepared {len(keys)} key witnesses and {len(grid)} grid positions', flush=True)


def audit(doc):
    """Check the actual file, converted geometry and existing workbook witnesses."""
    import openpyxl
    source = json.loads((OUT / 'sheets.json').read_text())['source']
    source_path = ROOT / source['local_copy']
    assert hashlib.sha256(source_path.read_bytes()).hexdigest() == source['sha256']
    copies = list(OUT.glob('*.dwg'))
    assert copies and all(hashlib.sha256(p.read_bytes()).hexdigest() == source['sha256'] for p in copies)
    dims = rows('dimensions.csv')
    for row in dims:
        entity = doc.entitydb[row['handle']]
        assert entity.dxftype() == 'DIMENSION'
        assert abs(entity.get_measurement() - float(row['measured_mm'])) <= 0.051, row['id']
        drawing = next(d for d in DRAWINGS if d['id'] == row['drawing'])
        a = to_model(drawing, entity.dxf.defpoint2.x, entity.dxf.defpoint2.y)
        b = to_model(drawing, entity.dxf.defpoint3.x, entity.dxf.defpoint3.y)
        assert all(abs(v - float(row[k])) <= .051 for v, k in zip((*a, *b), ('a1', 'a2', 'b1', 'b2'))), row['id']
    book = openpyxl.load_workbook(ROOT / 'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx', data_only=True)
    saved = {r[0]: r for r in list(book['DWG dimensions'].values)[7:] if r[0]}
    assert len(saved) == len(dims) == 726
    for row in dims:
        old = saved[row['id']]
        assert old[1] == row['drawing'] and old[13] == row['handle']
        assert abs(old[4] - float(row['measured_mm'])) < .001
        assert all(abs(old[i] - float(row[k])) < .001 for i, k in enumerate(('a1', 'a2', 'b1', 'b2'), 7))
    for filename, sheet, count in [('levels.csv', 'DWG levels', 79), ('grid-check.csv', 'DWG grid check', 137)]:
        data = rows(filename)
        assert len(data) == count
        assert len([r for r in list(book[sheet].values)[7:] if r[0]]) == count
    return {'source_sha256': source['sha256'], 'dimension_objects_checked': len(dims),
            'workbook_dimensions_match': True, 'levels': 79, 'grid_checks': 137,
            'drawing_views': len(DRAWINGS), 'units': 'mm inferred from dimensions; INSUNITS unset',
            'status': 'DRAWING SHOWN / DERIVED; not survey data; not for construction'}


# Normalized crops (left, bottom, right, top) inside each inventoried frame.
# Each crop retains its parent ID and exact model-space boundary in export-manifest.json.
ZOOMS = {
    'P05': [('tower-entrance', (0, .14, .43, .88)), ('nave-bays', (.30, .14, .73, .90)),
            ('sanctuary-and-rooms', (.61, .14, 1, .90))],
    'P14': [('tower-end', (0, .14, .43, .90)), ('sanctuary-end', (.57, .14, 1, .90))],
    'E01B': [('central-facade', (.26, .12, .75, .73)), ('tower-crown', (.08, .60, .42, .99)),
             ('entrance-and-bases', (.10, .08, .92, .40))],
    'E01A': [('central-section', (.26, .12, .75, .74))],
    'E02': [('entrance-tower', (0, .05, .43, .99)), ('side-bays', (.31, .12, .81, .46)),
            ('sanctuary-end', (.63, .10, 1, .54))],
    'E03': [('gable-and-cross', (.13, .37, .91, .98)), ('doors-and-steps', (.10, .10, .94, .56))],
    'EW': [('outside', (.02, .10, .53, .99)), ('inside', (.48, .10, 1, .99))],
    'ET': [('lower-tower', (0, 0, 1, .56)), ('upper-tower', (0, .45, 1, 1))],
    'S24': [('roof-and-joints', (.10, .47, .94, 1)), ('columns-and-base', (.12, .09, .94, .62))],
    'S25': [('roof-and-joints', (.10, .47, .94, 1)), ('platform-and-columns', (.12, .09, .94, .62))],
    'S45': [('tower-end-section', (0, .10, .43, 1)), ('nave-roof', (.29, .15, .74, .50)),
            ('sanctuary-section', (.61, .10, 1, .51))],
    'E26': [('outside', (0, 0, .54, 1)), ('inside', (.48, 0, 1, 1))],
    'E31': [('outside', (0, 0, .54, 1)), ('inside', (.48, 0, 1, 1))],
    'D29': [('window-head', (0, .35, 1, 1)), ('window-sill', (0, .05, 1, .65))],
    'D34': [('door-head', (0, .35, 1, 1)), ('door-base', (0, .05, 1, .65))],
    'D46': [('steel-arch-apex', (.15, .54, .92, 1)), ('steel-bearings', (.12, .10, .94, .61))],
    'D47': [('concrete-arch-apex', (.12, .54, .94, 1)), ('concrete-bearings', (.12, .10, .94, .61))],
}


def render(doc, dest, only=None):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from ezdxf import bbox
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.config import BackgroundPolicy, ColorPolicy, Configuration
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    plt.rcParams['pdf.fonttype'] = 42
    plt.rcParams['font.family'] = 'DejaVu Sans'
    msp = doc.modelspace()
    cache = bbox.Cache()
    boxes = []
    for entity in msp:
        bounds = bbox.extents([entity], fast=True, cache=cache)
        if bounds.has_data:
            boxes.append((entity, bounds.extmin.x, bounds.extmin.y, bounds.extmax.x, bounds.extmax.y))
    print(f'Indexed {len(boxes)} entity bounds', flush=True)
    config = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK,
                           min_lineweight=.08)
    for drawing in DRAWINGS:
        if only and drawing['id'] not in only:
            continue
        target = dest / '_raw' / f"{drawing['id']}.pdf"
        if target.exists():
            continue
        x0, y0, x1, y1 = drawing['frame']
        # Set the axes rectangle to exactly the inventoried frame: zoom mapping is then exact.
        width, height = x1 - x0, y1 - y0
        fig = plt.figure(figsize=(16.54 * width / max(width, height), 16.54 * height / max(width, height)))
        ax = fig.add_axes([0, 0, 1, 1])
        entities = [e for e, a, b, c, d in boxes if c >= x0 and a <= x1 and d >= y0 and b <= y1]
        Frontend(RenderContext(doc), MatplotlibBackend(ax), config=config).draw_entities(entities)
        ax.set_xlim(x0, x1)
        ax.set_ylim(y0, y1)
        ax.set_aspect('equal')
        ax.axis('off')
        fig.savefig(target, format='pdf', facecolor='white', metadata={'Title': drawing['en'], 'Author': ''})
        plt.close(fig)
        print('Vector drawing', drawing['id'], len(entities), flush=True)


def package(dest, report):
    import pymupdf as fitz
    import matplotlib.font_manager as fm
    from PIL import Image, ImageDraw
    fontfile = fm.findfont('DejaVu Sans')
    font = fitz.Font(fontfile=fontfile)
    fontname = 'ReviewFont'
    manifest = []
    full, detail = fitz.open(), fitz.open()

    def text(page, pos, value, size=11, color=(.12, .16, .20)):
        page.insert_font(fontname=fontname, fontbuffer=font.buffer)
        page.insert_text(pos, value, fontsize=size, fontname=fontname, color=color)

    def view(drawing, crop, suffix):
        raw = fitz.open(dest / '_raw' / f"{drawing['id']}.pdf")
        rect = raw[0].rect
        a, b, c, d = crop
        clip = fitz.Rect(rect.width * a, rect.height * (1 - d), rect.width * c, rect.height * (1 - b))
        landscape = clip.width >= clip.height
        # A2 for whole drawings; A3 enlarged crops. All retain vector paths.
        short, long = ((1190.55, 1683.78) if suffix == 'full' else (841.89, 1190.55))
        w, h = (long, short) if landscape else (short, long)
        result = fitz.open()
        page = result.new_page(width=w, height=h)
        title = f"{drawing['id']} | {drawing['en']}"
        text(page, (28, 27), title, 13)
        text(page, (28, 44), f"DWG sheet {drawing['sheet'] or 'unnumbered'} | {suffix} | axes {'/'.join({'plan': ('X','Z'), 'transverse': ('Z','Y'), 'longitudinal': ('X','Y'), 'local': ('u','v')}[drawing['view']])} | source saved 2026-10-23", 10)
        page.show_pdf_page(fitz.Rect(24, 58, w-24, h-67), raw, 0, clip=clip)
        text(page, (28, h-43), 'Đang phát triển / In development - Không dùng để thi công / Not for construction', 11, (.63, .18, .12))
        text(page, (28, h-26), 'Vector review export | fit to page, NOT a calibrated print scale | use stated dimensions; verify original CAD', 9)
        relative = Path('views' if suffix == 'full' else 'details') / f"{drawing['id']}_{suffix}.pdf"
        result.set_metadata({'title': title + ' - ' + suffix, 'subject': 'Design development; not for construction'})
        result.save(dest / relative, garbage=4, deflate=True)
        target = full if suffix == 'full' else detail
        target.insert_pdf(result)
        x0, y0, x1, y1 = drawing['frame']
        manifest.append({'id': drawing['id'], 'view': suffix, 'file': str(relative),
                         'crop_dwg_mm': [round(x0 + a*(x1-x0), 1), round(y0 + b*(y1-y0), 1),
                                         round(x0 + c*(x1-x0), 1), round(y0 + d*(y1-y0), 1)],
                         'vector': True, 'scale': 'fit to page; not calibrated'})
        result.close()
        raw.close()

    def cover(book, title, lines):
        page = book.new_page(width=841.89, height=1190.55, pno=0)
        text(page, (42, 56), 'THẠCH BI CHURCH | CAD REVIEW', 22)
        text(page, (42, 87), title, 16)
        text(page, (42, 116), 'Owner-selected design basis: DWG saved 23 October 2026. Review issued 26 October 2026.', 11)
        text(page, (42, 140), 'Đang phát triển / In development - Không dùng để thi công / Not for construction', 12, (.63, .18, .12))
        y = 180
        for line in lines:
            text(page, (42, y), line, 11)
            y += 25
        text(page, (42, 1100), 'Converted with LibreDWG / ezdxf. CAD font/line-style substitution may differ from native AutoCAD.', 10)
        text(page, (42, 1120), 'Designer drawings remain under publication hold H1. This local export does not change permission.', 10)
        text(page, (42, 1140), 'Units inferred as millimetres. Unresolved internal drawing conflicts remain on engineering hold.', 10)

    for drawing in DRAWINGS:
        view(drawing, (0, 0, 1, 1), 'full')
        for suffix, crop in ZOOMS.get(drawing['id'], []):
            view(drawing, crop, suffix)
    cover(full, 'All 27 drawing views - vector PDF, A2 sheets', [f"{n+2:02d}   {d['id']:6s}   {d['en']}" for n, d in enumerate(DRAWINGS)])
    cover(detail, f"Enlarged details - {len(detail)} vector views, A3 sheets", [
        'Crops show enlarged drawing evidence; crop boundaries are recorded in export-manifest.json.',
        'Full drawing context and original dimensions are in 01_All_Drawing_Views.pdf.',
        'P05 / P14: entrance, nave and sanctuary plans',
        'E01A / E01B: central facade, tower crown and entrance bases',
        'E02 / E03 / EW / ET: side, gable, wing and single-tower elevations',
        'S24 / S25 / S45: roofs, joints, column bases and sanctuary platform',
        'E26 / E31 / D29 / D34: window and doorway elevations and details',
        'D46 / D47: steel and concrete arch apex and bearing details',
        '750 / 800 mm platform, 76 mm ridge discrepancy and plan/section extents remain unresolved.',
        'Do not scale a printed page to establish an unknown size or hidden connection.',
    ])
    for book, filename, subset in [(full, '01_All_Drawing_Views.pdf', [m for m in manifest if m['view']=='full']),
                                    (detail, '02_Enlarged_Details.pdf', [m for m in manifest if m['view']!='full'])]:
        book.set_toc([[1, f"{m['id']} - {m['view']}", n+2] for n, m in enumerate(subset)])
        book.set_metadata({'title': filename[:-4].replace('_', ' '), 'subject': 'Not for construction; local review'})
        book.save(dest / filename, garbage=4, deflate=True)
        assert all(not p.get_images() for p in book), 'Unexpected raster content in vector PDF'
        report[filename] = {'pages': len(book), 'raster_images': 0, 'bookmarks': len(subset)}
        # Review every page in contact sheets; selected pages also receive 150 dpi previews.
        for start in range(0, len(book), 12):
            canvas = Image.new('RGB', (1800, 1600), 'white')
            pen = ImageDraw.Draw(canvas)
            for i in range(start, min(start+12, len(book))):
                pix = book[i].get_pixmap(matrix=fitz.Matrix(.38, .38), alpha=False)
                im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
                im.thumbnail((440, 485))
                x, y = ((i-start)%4)*450, ((i-start)//4)*530
                canvas.paste(im, (x, y+24))
                pen.text((x+8, y+4), f'{filename} p{i+1}', fill='black')
            canvas.save(dest / '_qa' / f'{filename[:-4]}_{start+1:02d}.png')
    (dest / 'export-manifest.json').write_text(json.dumps({'audit': report, 'views': manifest}, indent=2)+'\n')
    print(json.dumps(report, indent=2), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audit-only', action='store_true')
    parser.add_argument('--package-only', action='store_true')
    parser.add_argument('--only', nargs='+')
    args = parser.parse_args()
    for folder in ['_raw', '_qa', 'views', 'details']:
        (DEST / folder).mkdir(parents=True, exist_ok=True)
    if args.package_only:
        report = json.loads((DEST / 'source-audit.json').read_text())
    else:
        doc = convert()
        report = audit(doc)
        (DEST / 'source-audit.json').write_text(json.dumps(report, indent=2)+'\n')
        print(json.dumps(report), flush=True)
        if args.audit_only:
            return
        prepare_register(DEST)
        render(doc, DEST, args.only)
    if not args.only:
        package(DEST, report)


if __name__ == '__main__':
    main()
