#!/usr/bin/env python3
"""Vietnamese enlarged vector details of the bell-tower ornament, version 23102026.

Crops the same optimized CAD vector pages as the 23102026 volumes; nothing is
redrawn or rasterized. Crop boxes and witness references live in
docs/layout_design/dwg-2026-10-23/tower-details-23102026.json. Values beside
each crop are traced CAD coordinates or DWG labels, never scaled from a PDF.

Run alone to add volume 11 to an existing build, or let
build_dwg_vietnamese_23102026.py call tower_volume() during a full rebuild.
"""
import csv
import hashlib
import json
import unicodedata

import pymupdf as fitz

import build_dwg_vietnamese_23102026 as vi

ROOT, OUT, DEST = vi.ROOT, vi.OUT, vi.DEST
SPEC = json.loads((OUT/'tower-details-23102026.json').read_text())
WITNESS_DIR = ROOT/'docs/exterior-23102026'
LEVEL_FIELDS = {'tam_y', 'y_dau', 'y_cuoi', 'y'}
RED = (.62, .16, .12)


def rows(name):
    with (OUT/name).open(encoding='utf-8', newline='') as stream:
        return list(csv.DictReader(stream))


LEVELS = rows('levels.csv')
DIMS = {r['id']: r for r in rows('dimensions.csv')}
WITNESSES = {}


def witness(ref):
    """Return (object, handle) for 'file.json#feature-id' or 'file.json#dotted.path'."""
    filename, path = ref.split('#')
    if filename not in WITNESSES:
        WITNESSES[filename] = json.loads((WITNESS_DIR/filename).read_text())
    data = WITNESSES[filename]
    assert data.get('sourceSha256', data.get('sourceDwgSha256')) == vi.json.loads(
        (OUT/'sheets.json').read_text())['source']['sha256'], ('Witness file from another DWG', filename)
    feature = next((f for f in data.get('features', []) if f.get('id') == path), None)
    if feature is None:
        feature = data
        for part in path.split('.'):
            feature = feature[int(part)] if isinstance(feature, list) else feature[part]
    return feature, (feature.get('handle') if isinstance(feature, dict) else None)


def geometry(feature):
    """(centre, points) in (horizontal, Y) metres; E01B uses ZY keys, E02/ET use M keys."""
    if not isinstance(feature, dict):
        return None, None
    return feature.get('centreZY') or feature.get('centreM'), feature.get('pointsZY') or feature.get('pointsM')


def resolve(item):
    """Value, display strings, source text and model-space check point for one note."""
    if 'cao_do' in item:
        drawing, mm = item['cao_do']
        row = next(r for r in LEVELS if r['drawing'] == drawing and float(r['printed_mm']) == mm)
        y = mm/1000
        return ('+' if y > 0 else '±')+f'{y:.3f}'.replace('.', ',')+' m', 'Nhãn '+row['label'].strip(), \
            f"Nhãn cao độ {drawing}; đỉnh ký hiệu "+(vi.num(row['marker_mm'])+' mm' if row['marker_mm'] else 'không đo'), ('Y', y)
    if 'kich_thuoc' in item:
        row = DIMS[item['kich_thuoc']]
        return vi.num(row['measured_mm'])+' mm', 'Số ghi '+row['printed_mm'], \
            f"Kích thước ghi {row['id']}, handle {row['handle']}", None
    feature, handle = witness(item['ref'])
    field = item['truong']
    centre, points = geometry(feature)
    if centre or points:
        value, _ = value_of(item['ref'], field)
        point = centre or points[-1 if field == 'y_cuoi' else 0]
        check = ('ZY', point, feature.get('radiusM', 0))
    else:
        value = feature[field]
        check = ('Y', value) if (field in LEVEL_FIELDS or field.endswith('Y')) and item.get('don_vi') != 'mm' else None
        field = 'y' if check else field
    source = 'ĐỌC TRÊN CAD'+(f', handle {handle}' if handle else '')+' | '+item['ref'].split('#')[0]
    unit = item.get('don_vi')
    if unit == 'ô':
        return f'{value} ô', 'đếm trên E01B/E02', source, None
    if unit == 'mm' or field == 'ban_kinh' or field.endswith('M'):
        prefix = 'R ' if field in ('ban_kinh', 'archRadiusM') else ''
        return prefix+vi.num(value*1000)+' mm', vi.num(value, 4)+' m', source, check
    if field == 'tam_z':
        return 'Z +'+f'{value:.3f}'.replace('.', ',')+' m', vi.num(value*1000)+' mm', source, check
    return ('+' if value > 0 else '')+f'{value:.3f}'.replace('.', ',')+' m', vi.num(value*1000)+' mm', source, check


def inside(detail, check):
    """The quoted witness must be visible in its crop; plans carry no model box."""
    box = detail.get('khung_mo_hinh_m')
    if not check or not box:
        return True
    tol = .05
    if check[0] == 'Y':
        return box['Y_m'][0]-tol <= check[1] <= box['Y_m'][1]+tol
    (h, y), r = check[1], check[2]
    h0, h1 = box.get('Z_m') or box.get('X_m') or box.get('u_m')
    y0, y1 = box['Y_m']
    # A circle or arc is visible if its bounding square overlaps the crop.
    return h+r >= h0-tol and h-r <= h1+tol and y+r >= y0-tol and y-r <= y1+tol


def clip_for(drawing_id, box):
    doc = vi.vector_doc(drawing_id)
    x0, y0, x1, y1 = vi.DRAW[drawing_id]['frame']
    r = doc[0].rect
    a, b, c, d = box
    return doc, fitz.Rect(r.width*(a-x0)/(x1-x0), r.height*(1-(d-y0)/(y1-y0)),
                          r.width*(c-x0)/(x1-x0), r.height*(1-(b-y0)/(y1-y0)))


def fitted(target, clip):
    """Rectangle actually used by show_pdf_page (aspect kept, centred)."""
    scale = min(target.width/clip.width, target.height/clip.height)
    w, h = clip.width*scale, clip.height*scale
    left, top = target.x0+(target.width-w)/2, target.y0+(target.height-h)/2
    return fitz.Rect(left, top, left+w, top+h), scale


def intro_page(doc):
    page = vi.new_page(doc, SPEC['ten'].upper(), 'Nhà thờ Giáo xứ Thạch Bi | Tập 11 | Phóng lớn từ nét vector CAD')
    y = vi.paragraph(page, 30, 96, SPEC['mo_ta'], W-65, 12, 18, max_y=170)
    y = vi.paragraph(page, 30, y+8, SPEC['nguon_so_lieu'], W-65, 11, 16, max_y=230)
    page.draw_rect(fitz.Rect(28, y+6, W-28, y+30), color=None, fill=vi.BLUE)
    for x, title in [(36, 'Mã'), (90, 'Chi tiết'), (720, 'Bản vẽ'), (800, 'Trang')]:
        vi.put(page, x, y+23, title, 10, True, (1, 1, 1))
    y += 52
    links = []
    for n, detail in enumerate(SPEC['chi_tiet']):
        vi.put(page, 36, y, detail['id'], 11, True)
        vi.put(page, 90, y, detail['ten'], 11)
        vi.put(page, 720, y, detail['ban_ve'], 11)
        vi.put(page, 800, y, str(n+3), 11)
        links.append(fitz.Rect(30, y-13, 860, y+4))
        y += 21
    assert y < 790
    gy = y-21*len(SPEC['chi_tiet'])
    vi.put(page, 890, gy, 'CÁCH DÙNG CHO NGƯỜI THI CÔNG', 11, True, vi.BLUE)
    gy += 18
    for line in SPEC['huong_dan_nguoi_lam']:
        gy = vi.paragraph(page, 890, gy, line, 270, 8.5, 11.5, max_y=790)+6
    return links


W, H = vi.W, vi.H


def key_page(doc):
    """Mark every elevation crop on the tower, so each enlargement can be located."""
    page = vi.new_page(doc, 'VỊ TRÍ CÁC CHI TIẾT TRÊN THÁP', 'Mặt trước E01B (tháp phía H), mặt bên E02 và hình cắt ET; khung đỏ là phạm vi từng trang phóng lớn')
    views = [('E01B', 7.25, 13.05, 0.0, 37.3, fitz.Rect(60, 78, 330, 795)),
             ('E02', -0.45, 5.35, 0.0, 37.3, fitz.Rect(360, 78, 610, 795)),
             ('ET', 0, 8.867, -1.0, 38.92, fitz.Rect(650, 78, 850, 795))]
    for drawing, h0, h1, y0, y1, target in views:
        if drawing == 'E01B':
            box = [1666600.3-h1*1000, y0*1000-515946.8, 1666600.3-h0*1000, y1*1000-515946.8]
        elif drawing == 'E02':
            box = [h0*1000+1404501.3, y0*1000-518026.8, h1*1000+1404501.3, y1*1000-518026.8]
        else:
            box = vi.DRAW['ET']['frame']
        source, clip = clip_for(drawing, box)
        area, scale = fitted(target, clip)
        page.show_pdf_page(target, source, 0, clip=clip)
        vi.put(page, area.x0, 790, {'E01B': 'E01B mặt trước', 'E02': 'E02 mặt bên', 'ET': 'ET hình cắt'}[drawing], 9, True)
        used = []
        for detail in SPEC['chi_tiet']:
            if detail['ban_ve'] != drawing:
                continue
            a, b, c, d = detail['khung_cat_cad_mm']
            sx, sy = clip.width/(box[2]-box[0]), clip.height/(box[3]-box[1])
            rect = fitz.Rect(area.x0+(a-box[0])*sx*scale, area.y0+(box[3]-d)*sy*scale,
                             area.x0+(c-box[0])*sx*scale, area.y0+(box[3]-b)*sy*scale)
            page.draw_rect(rect, color=RED, width=.9)
            # Labels sit in a column left of the drawing, nudged down when two crops start together.
            label_y = rect.y0+9
            while any(abs(label_y-u) < 11 for u in used):
                label_y += 11
            used.append(label_y)
            x = area.x0-30 if drawing == 'E01B' else min(area.x1+4, 852)
            vi.put(page, x, label_y, detail['id'], 8, True, RED)
            if abs(label_y-rect.y0-9) > 1:
                page.draw_line((x+22, label_y-3), (rect.x0, rect.y0+6), color=RED, width=.4)
    vi.paragraph(page, 890, 100, 'Các chi tiết mặt trước lấy tháp phía H trên E01B. Tháp phía B là bản sao gần đối xứng (sai dư khoảng 0,1 mm), '
                 'riêng tầng trên cùng và hoa hồng chỏm lệch ngang khoảng 11,5 mm theo nguồn.\n\n'
                 'Mặt bên E02 (T14, T17-T20) nhìn từ hông nhà thờ. Các tầng trên trùng cao độ và bán kính chính với mặt trước; tầng trệt khác: có cửa sổ giữa và chân cung vòm kín cao hơn 200,5 mm.\n\n'
                 'Hình ET (T21-T23) không có tiêu đề; phào vẽ dạng tiết diện và ô cửa không có hoa văn ngoài, nên nhiều khả năng là hình cắt nhìn vào mặt trong tường tháp. Hướng cắt chưa ghi, hoa hồng tầng hai thấp hơn E01B/E02 90 mm: chỉ dùng để hiểu cấu tạo bên trong, chờ kiến trúc sư xác nhận ENG-040.\n\n'
                 'Hai trang mặt bằng T15 và T16 lấy góc PT15A và PT29.',
                 260, 10, 14, max_y=600)


def value_of(ref, field):
    """One numeric reading from a witness: feature fields or a dotted path."""
    feature, handle = witness(ref)
    centre, points = geometry(feature)
    if centre or points:
        return {'tam_y': lambda: centre[1], 'tam_z': lambda: centre[0],
                'ban_kinh': lambda: feature['radiusM'], 'y_dau': lambda: points[0][1],
                'y_cuoi': lambda: points[-1][1], 'z_dau': lambda: points[0][0]}[field](), handle
    return (feature if field is None else feature[field]), handle


def derive(item, detail):
    """Site-usable numbers computed from the traced readings; always labelled SUY RA."""
    kind = item['suy_ra']
    handles = []

    def get(ref, field):
        value, handle = value_of(ref, field)
        if handle:
            handles.append(handle)
        return value
    if kind == 'dinh_vom':
        value, level = get(item['ref'], 'tam_y')+get(item['ref'], 'ban_kinh'), True
    elif kind == 'rong_vom':
        value, level = 2*get(item['ref'], 'ban_kinh'), False
    elif kind == 'cach_tim':
        value, level = abs(get(item['ref'], 'tam_z')-detail['tim_thap_z']), False
    elif kind == 'tren_san':
        value, level = get(item['ref'], item['truong'])-item['san'], False
    elif kind == 'hieu_z':
        value, level = abs(get(item['refs'][0], 'z_dau')-get(item['refs'][1], 'z_dau')), False
    elif kind == 'hieu_y':
        value, level = item['a']-get(item['ref'], 'y_dau'), False
    elif kind == 'hieu_so':
        value, level = item['a']-item['b'], False
    elif kind == 'hieu_path':
        value, level = get(item['a'], None)-get(item['b'], None), False
    else:
        value, level = get(item['a'], item['fa'])-get(item['b'], item['fb']), False
    assert value > 0, ('Derived value must be positive', detail['id'], item)
    main = ('+'+f'{value:.3f}'.replace('.', ',')+' m') if level else vi.num(value*1000)+' mm'
    source = 'SUY RA'+(' từ handle '+', '.join(dict.fromkeys(handles)) if handles else ' từ tệp chứng cứ')
    return main, source


def heading(page, y, text):
    vi.put(page, 830, y, text, 10, True, vi.BLUE)
    return y+15


def detail_page(doc, detail):
    drawing = vi.DRAW[detail['ban_ve']]
    title = {'ET': 'Hình ET không tiêu đề (sổ bản vẽ ghi: mặt đứng một tháp)'}.get(detail['ban_ve'], vi.TITLE_VI[detail['ban_ve']])
    page = vi.new_page(doc, (detail['id']+'  '+detail['ten']).upper(),
                       f"Bản vẽ {detail['ban_ve']} | Tờ CAD {drawing['sheet'] or 'không đánh số'} | {title} | Phóng lớn")
    source, clip = clip_for(detail['ban_ve'], detail['khung_cat_cad_mm'])
    target = fitz.Rect(28, 80, 800, 792)
    page.show_pdf_page(target, source, 0, clip=clip)
    area, scale = fitted(target, clip)
    page.draw_line((815, 82), (815, 790), color=(.72, .78, .8), width=.6)
    x, width = 830, W-28-830
    y = heading(page, 92, 'ĐÂY LÀ GÌ')
    y = vi.paragraph(page, x, y, detail['la_gi'], width, 9, 12, max_y=760)+5
    y = heading(page, y, 'LẶP LẠI Ở ĐÂU')
    y = vi.paragraph(page, x, y, detail['so_luong'], width, 9, 12, max_y=760)+5
    derived = []
    if detail.get('suy_ra'):
        y = heading(page, y, 'SỐ DÙNG KHI ĐỐI CHIẾU (SUY RA)')
        for item in detail['suy_ra']:
            main, src = derive(item, detail)
            derived.append({'nhan': item['nhan'], 'gia_tri': main, 'nguon': src})
            vi.put(page, x, y, main, 11, True)
            y = vi.paragraph(page, x+92, y, item['nhan'], width-92, 8.5, 11, max_y=760)
            y = vi.paragraph(page, x+92, y-1, src, width-92, 6.5, 8, max_y=764)+3
        y += 3
    y = heading(page, y, 'MỐC ĐỌC TRÊN BẢN VẼ')
    resolved = []
    for item in detail['so_do']:
        main, second, src, check = resolve(item)
        assert inside(detail, check), ('Witness outside its crop', detail['id'], item)
        resolved.append({'nhan': item['nhan'], 'gia_tri': main, 'phu': second, 'nguon': src})
        vi.put(page, x, y, main, 9.5, True)
        y = vi.paragraph(page, x+92, y, item['nhan'], width-92, 8.5, 11, max_y=760)
        y = vi.paragraph(page, x+92, y-1, src, width-92, 6.5, 8, max_y=764)+2
    y = heading(page, y+4, 'CẦN HỎI TRƯỚC KHI LÀM')
    for question in detail['hoi']:
        y = vi.paragraph(page, x, y, '• '+question, width, 8.5, 11, max_y=772)+1
    vi.paragraph(page, x, max(y+4, 778), 'Không đo trên giấy in. Chưa phải bản vẽ chế tạo; cần kiến trúc sư xác nhận.', width, 7.5, 9, max_y=790)
    return {'id': detail['id'], 'ban_ve': detail['ban_ve'], 'ten': detail['ten'], 'trang': len(doc),
            'khung_cat_cad_mm': detail['khung_cat_cad_mm'], 'ty_le_phong_so_voi_trang_goc': round(scale, 2),
            'dang_net': 'vector, giữ nguyên đường nét PDF nguồn', 'so_do': resolved, 'suy_ra': derived}


def single_name(detail):
    text = detail['ten'].lower().replace('đ', 'd')
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c))
    text = '_'.join(''.join(c if c.isalnum() else ' ' for c in text).split()[:6])
    return f"{detail['ban_ve']}_{detail['id']}_{text}_23102026.pdf"


def tower_volume(result):
    """Build volume 11 and its single pages; append entries to the 23102026 result."""
    assert {d['id'] for d in SPEC['chi_tiet']} == {f'T{n:02d}' for n in range(1, len(SPEC['chi_tiet'])+1)}
    for detail in SPEC['chi_tiet']:
        x0, y0, x1, y1 = vi.DRAW[detail['ban_ve']]['frame']
        a, b, c, d = detail['khung_cat_cad_mm']
        assert x0 <= a < c <= x1 and y0 <= b < d <= y1, ('Crop outside its drawing frame', detail['id'])
    (DEST/'tung_trang').mkdir(parents=True, exist_ok=True)
    (DEST/'_qa').mkdir(exist_ok=True)
    doc = fitz.open()
    links = intro_page(doc)
    key_page(doc)
    views = [detail_page(doc, d) for d in SPEC['chi_tiet']]
    # Internal links can only point at pages that already exist.
    for n, rect in enumerate(links):
        doc[0].insert_link({'kind': fitz.LINK_GOTO, 'from': rect, 'page': n+2})
    doc.set_toc([[1, 'Danh mục chi tiết', 1], [1, 'Vị trí trên tháp', 2]] +
                [[1, v['id']+' '+v['ten'], v['trang']] for v in views])
    doc.set_metadata({'title': SPEC['ten']+' - Phiên bản 23102026', 'subject': 'Nhà thờ Giáo xứ Thạch Bi - Chi tiết tháp chuông', 'author': ''})
    doc.xref_set_key(doc.pdf_catalog(), 'Lang', '(vi-VN)')
    doc.subset_fonts()
    target = DEST/SPEC['tep']
    doc.save(target, garbage=4, deflate=True, use_objstms=1)
    doc.close()
    with fitz.open(target) as checked:
        assert len(checked) == len(views)+2
        for page in checked:
            text = page.get_text()
            assert 'Phiên bản 23102026' in text and 'Không dùng để thi công' in text
            assert 'Đang phát triển' not in text and 'Not for construction' not in text
            assert not page.get_images(), 'Unexpected raster image in the vector edition'
        for view in views:
            text = checked[view['trang']-1].get_text()
            assert view['id'] in text and all(s['gia_tri'] in text for s in view['so_do']+view['suy_ra']), view['id']
    result['tep'] = [e for e in result['tep'] if e['tep'] != SPEC['tep']]
    result['tung_trang'] = [e for e in result['tung_trang'] if e.get('tap_goc') != SPEC['tep']]
    result['tep'].append({'tep': target.name, 'ten': SPEC['ten'], 'so_trang': len(views)+2,
                          'dung_luong_byte': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                          'ma_kich_thuoc': [], 'hinh': views})
    with fitz.open(target) as parent:
        for detail, view in zip(SPEC['chi_tiet'], views):
            single = fitz.open()
            single.insert_pdf(parent, from_page=view['trang']-1, to_page=view['trang']-1)
            for link in single[0].get_links():
                if link.get('file'):
                    link['file'] = '../'+link['file']
                    single[0].update_link(link)
            single.set_toc([[1, view['id']+' '+view['ten'], 1]])
            single.set_metadata({'title': view['id']+' '+view['ten']+' - Phiên bản 23102026', 'author': ''})
            single.xref_set_key(single.pdf_catalog(), 'Lang', '(vi-VN)')
            single.subset_fonts()
            one = DEST/'tung_trang'/single_name(detail)
            single.save(one, garbage=4, deflate=True, use_objstms=1)
            assert not single[0].get_images()
            single.close()
            result['tung_trang'].append({'tep': str(one.relative_to(DEST)), 'tap_goc': SPEC['tep'], 'trang_goc': view['trang'],
                                         'dung_luong_byte': one.stat().st_size, 'hinh': view})
    vi.contact_sheets(target)
    print(f"{SPEC['tep']}: {len(views)+2} trang, {target.stat().st_size/1e6:.2f} MB", flush=True)
    return result


if __name__ == '__main__':
    record = DEST/'_qa/kiem-tra.json'
    assert record.exists(), 'Run build_dwg_vietnamese_23102026.py once first'
    current = json.loads(record.read_text())
    tower_volume(current)
    vi.write_package(current)
