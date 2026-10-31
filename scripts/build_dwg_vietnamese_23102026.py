#!/usr/bin/env python3
"""Vietnamese vector drawing volumes and individual pages, version 23102026.

Preserves existing CAD vector paths without rasterizing or redrawing them.
Requires the source audit and its corrected dimension register. Nothing is uploaded.
"""
import hashlib
import csv
import json
import zipfile
import unicodedata
from pathlib import Path

import matplotlib.font_manager as fm
import pymupdf as fitz
from PIL import Image, ImageDraw

from export_dwg_review import DRAWINGS, ZOOMS, ROOT, OUT

OLD=ROOT/'exports/dwg-review-2026-10-26'
DEST=ROOT/'exports/23102026_vector'
SPEC=json.loads((OUT/'pdf-vietnamese-23102026.json').read_text())
DATA=json.loads((OLD/'register-data.json').read_text())
KEYS={r[0]:r for r in DATA['keys']}
DRAW={d['id']:d for d in DRAWINGS}
W,H=1190.55,841.89
FONT=fitz.Font(fontfile=fm.findfont('DejaVu Sans'))
BOLD=fitz.Font(fontfile=fm.findfont(fm.FontProperties(family='DejaVu Sans',weight='bold')))
INK=(.12,.17,.21)
BLUE=(.18,.29,.37)

CROPS_VI={
    'toan_bo':'Toàn bộ bản vẽ', 'tower-entrance':'Khu tháp và lối vào', 'nave-bays':'Các gian lòng nhà',
    'sanctuary-and-rooms':'Cung thánh và phòng bên', 'sanctuary-end':'Phía cung thánh',
    'central-facade':'Phần giữa hai tháp', 'entrance-and-bases':'Cửa vào và chân trụ',
    'tower-crown':'Chỏm tháp và thánh giá', 'roof-and-joints':'Mái và các điểm tiếp giáp',
    'columns-and-base':'Cột và chân cột', 'platform-and-columns':'Nền cung thánh và chân cột',
    'nave-roof':'Mái dọc lòng nhà', 'sanctuary-section':'Mặt cắt phía cung thánh',
    'outside':'Mặt đứng phía ngoài', 'inside':'Mặt đứng phía trong',
    'window-head':'Đầu vòm cửa sổ', 'window-sill':'Bậu và chân cửa sổ',
    'door-head':'Đầu vòm cửa đi', 'door-base':'Chân cửa đi',
    'steel-arch-apex':'Đỉnh khung vòm thép', 'steel-bearings':'Chân và gối khung thép',
    'concrete-arch-apex':'Đỉnh khung vòm bê tông', 'concrete-bearings':'Chân và gối khung bê tông',
}
TITLE_VI={
    'P05':'Mặt bằng tầng trệt', 'P14':'Mặt bằng thân nhà +6,324 m và đầu tháp +8,390 m',
    'PT08':'Mặt bằng tháp +8,390 m', 'PT10':'Mặt bằng đầu nhà phía tháp +10,128 m',
    'PT15':'Mặt bằng đầu nhà phía tháp +15,840 m', 'PT15A':'Mặt bằng một tháp +15,840 m',
    'PT23':'Mặt bằng một tháp +23,140 m', 'PT29':'Mặt bằng một tháp +29,090 m',
    'P28':'Mặt bằng một gian cửa sổ', 'P33':'Mặt bằng một gian cửa đi, trục 4-5',
    'E01A':'Mặt đứng hai tháp, có phần cắt qua mái lòng nhà', 'E01B':'Mặt đứng đầy đủ phía hai tháp',
    'E02':'Mặt đứng bên nhà thờ', 'E03':'Mặt đứng đầu nhà phía đối diện hai tháp',
    'EW':'Mặt đứng đầu cánh ngang, ngoài và trong', 'ET':'Mặt đứng một tháp',
    'E26':'Mặt đứng gian cửa sổ, ngoài và trong', 'E31':'Mặt đứng gian cửa đi, ngoài và trong',
    'S24':'Mặt cắt ngang lòng nhà', 'S25':'Mặt cắt ngang cung thánh', 'S45':'Mặt cắt dọc A-A',
    'S27':'Mặt cắt A-A cửa sổ', 'S32':'Mặt cắt A-A cửa đi',
    'D29':'Chi tiết cửa sổ không cánh', 'D34':'Chi tiết cửa đi không cánh',
    'D46':'Khung vòm thép cánh ngang, trục C và G', 'D47':'Khung vòm bê tông cốt thép cánh ngang, trục C và G',
}

# Prefer measurements of the part visible in the crop, rather than repeating
# the first dimensions of its parent drawing. Other-source witnesses are named.
VIEW_KEYS={
    ('E01B','central-facade'):['F22','F06','F17','F08'],
    ('E01B','entrance-and-bases'):['DWG0228','DWG0226','DWG0195','DWG0212'],
    ('E01B','tower-crown'):['LEVEL-E01B-36920','LEVEL-E01B-29090','LEVEL-E01B-23140','DWG0222'],
    ('S24','roof-and-joints'):['DWG0342','DWG0311'],
    ('S24','columns-and-base'):['DWG0312','DWG0338','DWG0339','DWG0311'],
    ('S25','platform-and-columns'):['DWG0378','DWG0380','DWG0357','DWG0373'],
    ('S45','nave-roof'):['DWG0004','DWG0342','DWG0385'],
    ('S45','sanctuary-section'):['DWG0378','DWG0373','DWG0003'],
    ('P05','sanctuary-and-rooms'):['DWG0378','DWG0373','DWG0357','DWG0003'],
    ('ET','toan_bo'):['LEVEL-E01B-36920','LEVEL-E01B-29090','LEVEL-E01B-23140','DWG0222'],
    ('PT08','toan_bo'):['LEVEL-E01B-8390'],
    ('PT15A','toan_bo'):['LEVEL-E01B-15840'],
    ('PT23','toan_bo'):['LEVEL-E01B-23140'],
    ('PT29','toan_bo'):['LEVEL-E01B-29090'],
    ('D46','steel-arch-apex'):['DWG0682','DWG0686'],
    ('D46','steel-bearings'):['DWG0686','DWG0691'],
    ('D47','concrete-arch-apex'):['DWG0712','DWG0715'],
    ('D47','concrete-bearings'):['DWG0715','DWG0717'],
}


def num(value,places=1):
    value=round(float(value),places)
    s=f'{abs(value):,.{places}f}'.replace(',',' ').replace('.',',')
    if s.endswith(','+'0'*places):
        s=s[:-(places+1)]
    return ('-' if value<0 else '')+s


def label_values(row):
    if row[2] in ('Y level','X position'):
        return ('+' if row[4]>0 else '±' if row[4]==0 else '')+f'{row[4]:.3f}'.replace('.',',')+' m',num(row[3])+' mm'
    return num(row[3])+' mm',num(row[4],4)+' m'


def put(page,x,y,text,size=11,bold=False,color=INK):
    font,name=(BOLD,'VB') if bold else (FONT,'VN')
    page.insert_font(fontname=name,fontbuffer=font.buffer)
    page.insert_text((x,y),str(text),fontname=name,fontsize=size,color=color)


def wrap(text,width,size=11,bold=False):
    font=BOLD if bold else FONT
    result=[]
    for paragraph in str(text).split('\n'):
        current=''
        for word in paragraph.split():
            candidate=(current+' '+word).strip()
            if current and font.text_length(candidate,fontsize=size)>width:
                result.append(current)
                current=word
            else:
                current=candidate
        result.append(current)
    return result


def paragraph(page,x,y,text,width,size=11,leading=16,bold=False,max_y=760):
    for line in wrap(text,width,size,bold):
        assert y<=max_y, ('Text overflow',text,y)
        put(page,x,y,line,size,bold)
        y+=leading
    return y


def new_page(doc,title,subtitle=''):
    page=doc.new_page(width=W,height=H)
    assert BOLD.text_length(title,fontsize=17)<W-290,title
    put(page,28,32,title,17,True)
    put(page,W-227,32,'Phiên bản 23102026',12,True)
    if subtitle:
        put(page,28,52,subtitle,9)
    page.draw_line((28,65),(W-28,65),color=(.72,.78,.80),width=.6)
    put(page,28,H-22,'Đơn vị mm chờ người thiết kế xác nhận (INSUNITS=1). Không dùng để thi công; không đo tỷ lệ PDF.',9)
    put(page,975,H-22,'Về tổng quan',9)
    page.insert_link({'kind':fitz.LINK_GOTOR,'from':fitz.Rect(970,H-35,1070,H-13),
                      'file':'00_Tong_quan_23102026.pdf','page':0})
    put(page,W-102,H-22,f'Trang {len(doc)}',9)
    return page


def measurement_pages(doc,group):
    keys=group['so_do']
    for start in range(0,len(keys),10):
        page=new_page(doc,group['ten'].upper(),'Nhà thờ Giáo xứ Thạch Bi | Kích thước chính và mốc đối chiếu')
        y=paragraph(page,30,94,group['mo_ta'],W-65,12,18,max_y=145)
        put(page,30,151,'Nguồn: CAD lưu 23/10/2026. mm suy từ chuỗi kích thước và nhãn m; INSUNITS=1 (inch, đơn vị chèn), cần người thiết kế xác nhận.',9)
        page.draw_rect(fitz.Rect(28,169,W-28,195),color=None,fill=BLUE)
        for x,title in [(36,'Mã đo / bản vẽ'),(184,'Bộ phận hoặc mốc đo'),(528,'Số đo'),(677,'Cách hiểu và chỗ cần đối chiếu')]:
            put(page,x,187,title,10,True,(1,1,1))
        for i,ident in enumerate(keys[start:start+10]):
            row=KEYS[ident]
            label,note=SPEC['kich_thuoc'][ident]
            y=219+i*55
            if i%2==0:
                page.draw_rect(fitz.Rect(28,y-14,W-28,y+41),color=None,fill=(.965,.975,.98))
            assert len(wrap(note,W-710,10))<=3, ('Dimension note too dense',ident)
            paragraph(page,36,y,ident,140,8,11,max_y=y+30)
            put(page,36,y+38,'Bản vẽ '+row[5],8)
            paragraph(page,184,y,label,325,11,15,True,max_y=y+45)
            main,second=label_values(row)
            put(page,528,y,main,12,True)
            put(page,528,y+20,second,9)
            paragraph(page,677,y,note,W-710,10,14,max_y=y+44)
        put(page,28,797,f'Kích thước {start+1}-{min(start+10,len(keys))}/{len(keys)} | Mã DWG: đối tượng kích thước; mã F: nét vẽ làm tròn. Chưa phải số đo hiện trường.',9)


def grid_page(doc):
    page=new_page(doc,'VỊ TRÍ LƯỚI TRỤC','X từ trục 1 về cung thánh; Z từ giữa D-E, dương về H/I; đơn vị m')
    for axis,x in [('X',40),('Z',620)]:
        put(page,x,108,'TRỤC DỌC X' if axis=='X' else 'TRỤC NGANG Z',15,True)
        for j,row in enumerate(r for r in DATA['grid'] if r[0]==axis):
            put(page,x,149+j*42,'Trục '+row[1],12,True)
            put(page,x+130,149+j*42,('+' if row[3]>0 else '')+f'{row[3]:.3f}'.replace('.',',')+' m',12)
            put(page,x+306,149+j*42,num(row[2],0)+' mm',11)
    paragraph(page,40,740,'Đây là tọa độ tim trục, không phải mép tường hoặc mặt hoàn thiện. Đối chiếu lưới CAD và bảng tính khớp đến độ làm tròn 0,1 mm; độ chính xác hiện trường chưa được xác nhận.',1100,10,16,max_y=782)


def guide_page(doc):
    page=new_page(doc,'CHỌN TẬP THEO BỘ PHẬN NHÀ THỜ','Mỗi tập đều có bảng kích thước chính và ghi chú ngay bên cạnh hình')
    y=104
    tower=json.loads((OUT/'tower-details-23102026.json').read_text())
    for group in SPEC['nhom'][1:]+[{'ma':'11','ten':tower['ten'],'tep':tower['tep']}]:
        put(page,36,y,group['ma']+'  '+group['ten'],13,True)
        put(page,540,y,group['tep'],10)
        page.insert_link({'kind':fitz.LINK_GOTOR,'from':fitz.Rect(30,y-17,W-30,y+7),
                          'file':group['tep'],'page':0})
        y+=39
    for title,body in [
        ('Cách đọc số đo','Cao độ Y tính từ sàn lòng nhà ±0,000 m. X là vị trí dọc nhà, Z là vị trí ngang nhà; u/v là tọa độ riêng của chi tiết. DWG khai báo INSUNITS=1 (inch, đơn vị chèn), còn mm/m trong bộ này suy từ chuỗi kích thước và nhãn cao độ; cần người thiết kế xác nhận, không tự đổi tỷ lệ.'),
        ('Các chỗ cần đối chiếu','Mặt bằng dài 67 063,6 mm; mặt cắt dọc dài 67 149,4 mm theo các mốc khác nhau. Nền cung thánh ghi 750 mm trên mặt bằng và 800 mm trên mặt cắt. Đỉnh mái vẽ +12,3964 m nhưng có nhãn +12,472 m. Phào 6 324/6 325 mm còn khác nhau.'),
        ('Chất lượng và giới hạn','Nét bản vẽ giữ nguyên dạng vector, phóng lớn vẫn sắc; không chuyển hình sang ảnh hữu hạn điểm ảnh. Có bản theo nhóm và bản từng trang trong thư mục tung_trang. Số đo hình học và số ghi làm tròn được giữ riêng. Xem tập 10 để đọc kết quả kiểm tra dữ liệu và các chỗ chưa được phép coi là xác nhận thi công.')]:
        y+=14
        put(page,36,y,title,12,True)
        y=paragraph(page,36,y+22,body,1110,11,16,max_y=780)


SOURCE_DOCS={}


def vector_doc(drawing_id):
    raw_path=OLD/'_raw'/f'{drawing_id}.pdf'
    optimized=DEST/'_vector_raw'/f'{drawing_id}.pdf'
    verification=DEST/'_vector_raw/verification.json'
    if optimized.exists() and verification.exists():
        checks=json.loads(verification.read_text())
        check=checks[drawing_id]
        assert check['algorithm_version']>=2, 'Rebuild optimized PDFs with integer PDF line-join operators'
        assert check['source_sha256']==hashlib.sha256(raw_path.read_bytes()).hexdigest()
        assert check['output_sha256']==hashlib.sha256(optimized.read_bytes()).hexdigest()
        raw_path=optimized
    if drawing_id not in SOURCE_DOCS:
        SOURCE_DOCS[drawing_id]=fitz.open(raw_path)
    return SOURCE_DOCS[drawing_id]


def vector_source(drawing_id,crop_name):
    normalized=(0,0,1,1) if crop_name=='toan_bo' else dict(ZOOMS[drawing_id])[crop_name]
    raw=vector_doc(drawing_id)
    r=raw[0].rect
    a,b,c,d=normalized
    clip=fitz.Rect(r.width*a,r.height*(1-d),r.width*c,r.height*(1-b))
    return raw,clip,normalized


def drawing_page(doc,group,ident,crop_name):
    drawing=DRAW[ident]
    title=TITLE_VI[ident]
    page=new_page(doc,title.upper(),f"Bản vẽ {ident} | Tờ CAD {drawing['sheet'] or 'không đánh số'} | {CROPS_VI[crop_name]}")
    source,clip,crop=vector_source(ident,crop_name)
    page.show_pdf_page(fitz.Rect(28,80,853,792),source,0,clip=clip)
    page.draw_line((874,82),(874,790),color=(.72,.78,.8),width=.6)
    put(page,894,99,'KÍCH THƯỚC CHÍNH',12,True)
    match=[k for k in VIEW_KEYS.get((ident,crop_name),[]) if k in group['so_do']]
    if not match:
        match=[k for k in group['so_do'] if KEYS[k][5]==ident]
    fallback=not match or any(KEYS[k][5]!=ident for k in match)
    match=(match or group['so_do'])[:4]
    if fallback:
        paragraph(page,894,120,'Tham chiếu cùng bộ phận; xem mã bản vẽ của từng số đo.',260,9,13,max_y=150)
    y=166 if fallback else 128
    for k in match:
        row=KEYS[k]
        label,note=SPEC['kich_thuoc'][k]
        main,_=label_values(row)
        y=paragraph(page,894,y,label,260,10,14,True,max_y=735)
        put(page,894,y+4,main,14,True)
        y+=26
        y=paragraph(page,894,y,note,260,9,13,max_y=735)
        put(page,894,y+2,k+' / '+row[5],8)
        y+=26
    paragraph(page,894,756,'Số ghi được giữ nguyên. Các chỗ khác nhau giữa bản vẽ phải được xác nhận trước khi thi công.',260,9,12,max_y=790)
    x0,y0,x1,y1=drawing['frame']
    a,b,c,d=crop
    return {'ban_ve':ident,'loai':CROPS_VI[crop_name],'ma_ghi_chu':match,'dang_net':'vector, giữ nguyên đường nét PDF nguồn',
            'khung_cat_cad_mm':[round(x0+a*(x1-x0),1),round(y0+b*(y1-y0),1),round(x0+c*(x1-x0),1),round(y0+d*(y1-y0),1)]}


def contact_sheets(path):
    with fitz.open(path) as doc:
        for start in range(0,len(doc),12):
            canvas=Image.new('RGB',(1800,1500),'white')
            pen=ImageDraw.Draw(canvas)
            for i in range(start,min(start+12,len(doc))):
                pix=doc[i].get_pixmap(matrix=fitz.Matrix(.35,.35),alpha=False)
                im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
                im.thumbnail((595,340))
                x=((i-start)%3)*600
                y=((i-start)//3)*375
                canvas.paste(im,(x,y+24))
                pen.text((x+8,y+4),f'{path.stem} - {i+1}',fill='black')
            canvas.save(DEST/'_qa'/f'{path.stem}_{start+1:02d}.jpg',quality=88)


def audit_volume():
    report=json.loads((ROOT/'review/dwg-vietnamese-23102026/kiem-tra-so-lieu.json').read_text())
    before=json.loads((ROOT/'review/dwg-vietnamese-23102026/kiem-tra-truoc-khi-sua.json').read_text())
    assert report['so_khong_khop']==0 and not report['doi_chieu_chu_so_goc']
    doc=fitz.open()
    page=new_page(doc,'KIỂM TRA DỮ LIỆU TỪ DWG GỐC','Kết quả kiểm tra trích xuất; không thay thế xác nhận hồ sơ thi công')
    y=paragraph(page,32,96,'Nguồn DWG: '+report['sha256_dwg'],1120,10,16,max_y=125)
    put(page,32,146,'VIỆC PHẢI XÁC NHẬN: ĐƠN VỊ HÌNH HỌC',14,True,(.61,.19,.12))
    y=paragraph(page,32,174,'DWG gốc và DXF mới đều có INSUNITS=1: inch cho việc chèn tự động. Các chuỗi 4 500/7 200 và nhãn cao độ theo m phù hợp cách hiểu hình học mm đang dùng. Không tự đổi tỷ lệ theo 25,4. Người thiết kế phải xác nhận đơn vị, tỷ lệ chèn và cách ghi kích thước trong DWG trước khi dùng để bố trí ngoài công trường. Vấn đề đã được ghi thành ISSUE-R06 trong bảng tính.',1120,12,18,max_y=270)
    y+=28
    checks=[
        f"{report['so_doi_chieu']}/726 số đo hình học: khớp giữa DWG gốc, DXF chuyển mới, phép tính từ hai đầu đo và Excel.",
        f"Đã sửa {report['so_o_so_in_da_sua']} ô số ghi: lấy chữ số lưu trong khối kích thước CAD; giữ nguyên số đo hình học có phần thập phân.",
        '137 bản ghi đường trục: đối chiếu đầu đường LINE từ DWG và DXF, kiểm tra tọa độ theo từng khung bản vẽ.',
        '79 nhãn cao độ: đọc lại trực tiếp; 58 đỉnh ký hiệu được đo từ đỉnh hình học, không dùng hệ số theo chiều cao chữ.',
        'Hai nhãn +12,472 m ở S24/S25 nằm trên ký hiệu có cao độ khoảng +12,3964 m; chênh khoảng 75,6 mm vẫn cần xác nhận.',
        '729 đối tượng kích thước trong không gian mô hình: 726 thuộc 27 bản vẽ, ba đối tượng nằm ngoài các khung đã đăng ký.',
        'Không có khối INSERT trong không gian mô hình; các đối tượng kích thước còn lại của toàn tệp nằm trong định nghĩa khối không được chèn.',
        'Sai khác tính toán lớn nhất khoảng 0,000000001 đơn vị CAD. Đây là kiểm tra số học phần mềm, không phải độ chính xác đo đạc thực tế.'
    ]
    for line in checks:
        y=paragraph(page,42,y,'• '+line,1095,11,17,max_y=710)+12
    paragraph(page,32,748,'Hai nhánh đọc cùng dùng LibreDWG, chưa phải hai phần mềm CAD độc lập. Bộ chuyển đổi có cảnh báo về bảng sắp xếp, bản xem trước, vật liệu và liên kết kích thước; vẫn cần so bản vẽ trong AutoCAD/ODA và người thiết kế xác nhận.',1120,10,15,max_y=795)
    page=new_page(doc,'23 Ô SỐ GHI ĐÃ ĐƯỢC SỬA','Số đo hình học giữ nguyên; cột số ghi được sửa theo chữ số lưu trong khối kích thước CAD')
    for x,title in [(32,'Mã đo'),(172,'Bản vẽ'),(300,'Số đo hình học'),(540,'Số ghi cũ'),(725,'Chữ số trong CAD')]:
        put(page,x,103,title,11,True)
    for i,r in enumerate(before['doi_chieu_chu_so_goc']):
        y=134+i*26
        for x,value in [(32,r['id']),(172,r['drawing']),(300,num(r['measured'])+' mm'),(540,r['old_printed_mm']),(725,' / '.join(r['stored_text']))]:
            put(page,x,y,value,11)
    paragraph(page,32,771,'Lỗi cũ do làm tròn trực tiếp số thực nhị phân gần x,5. Số ghi CAD và số đo hình học là hai dữ kiện khác nhau; không thay đầu đo hoặc tăng/giảm tọa độ để làm chúng bằng nhau.',1120,10,15,max_y=796)
    page=new_page(doc,'NHỮNG MỐC CẦN NGƯỜI THIẾT KẾ XÁC NHẬN','Giữ nguyên các nguồn khác nhau, không lấy trung bình hoặc tự chọn giá trị thi công')
    items=[
        ('Đơn vị và tỷ lệ','INSUNITS=1 là đơn vị chèn inch; mm/m của mô hình đang suy từ chuỗi kích thước và nhãn m. Xác nhận trực tiếp trong phần mềm CAD gốc; không tự đổi hệ số 25,4.'),
        ('Nền cung thánh','Mặt bằng còn ghi +0,750 m; mặt cắt ghi +0,800 m. Mô hình dùng +0,800 m theo chủ đầu tư. Đây chưa phải xác nhận cao độ thi công.'),
        ('Đỉnh mái lòng nhà','S24/S25: đỉnh ký hiệu đo được khoảng +12,3964 m, nhãn ghi +12,472 m. Mặt cắt dọc lại vẽ +12,472 m. Chưa xác nhận đây là hai mặt cấu tạo khác nhau hay lỗi bản vẽ.'),
        ('Phào và chiều dài tổng','Phào 6 324/6 325 mm; chiều dài 67 063,6/67 149,4 mm theo các mốc khác nhau. Không gộp các mốc đầu/cuối hoặc mép cấu tạo.'),
        ('Bản vẽ thi công được kiểm tra','Kiến trúc sư/kỹ sư mở đúng DWG theo dấu kiểm nguồn, đối chiếu các số đo và ký hiệu trong AutoCAD/ODA, kiểm tra hiện trường, giải quyết các chỗ chưa thống nhất và phát hành hồ sơ phối hợp trước thi công.')
    ]
    y=111
    for title,body in items:
        put(page,32,y,title,13,True)
        y=paragraph(page,32,y+24,body,1110,12,18,max_y=700)+26
    url='https://help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Core/files/GUID-A58A87BB-482B-4042-A00A-EEF55A2B4FD8.htm'
    put(page,32,746,'Giải nghĩa INSUNITS: tài liệu chính thức Autodesk, mã 0: chưa xác định; 1: inch; 4: mm.',10)
    paragraph(page,32,767,url,1120,8,12,max_y=795)
    page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(30,750,1150,789),'uri':url})
    doc.set_toc([[1,'Kết quả kiểm tra',1],[1,'Các ô số ghi được sửa',2],[1,'Các mốc cần xác nhận',3]])
    doc.set_metadata({'title':'Kiểm tra dữ liệu DWG gốc - Phiên bản 23102026','author':''})
    doc.xref_set_key(doc.pdf_catalog(),'Lang','(vi-VN)')
    doc.subset_fonts()
    target=DEST/'10_Kiem_tra_du_lieu_DWG_23102026.pdf'
    doc.save(target,garbage=4,deflate=True,use_objstms=1)
    doc.close()
    contact_sheets(target)
    return {'tep':target.name,'ten':'Kiểm tra dữ liệu DWG gốc','so_trang':3,'dung_luong_byte':target.stat().st_size,
            'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'ma_kich_thuoc':[],'hinh':[]}


def page_filename(ident,crop_name):
    text=CROPS_VI[crop_name].lower().replace('đ','d')
    text=''.join(c for c in unicodedata.normalize('NFD',text) if not unicodedata.combining(c))
    text=''.join(c if c.isalnum() else '_' for c in text).strip('_')
    return f'{ident}_{text}_23102026.pdf'


def build():
    (DEST/'_qa').mkdir(parents=True,exist_ok=True)
    (DEST/'tung_trang').mkdir(exist_ok=True)
    source=json.loads((OUT/'sheets.json').read_text())['source']
    assert hashlib.sha256((ROOT/source['local_copy']).read_bytes()).hexdigest()==source['sha256']
    audit=json.loads((ROOT/'review/dwg-vietnamese-23102026/kiem-tra-so-lieu.json').read_text())
    assert audit['sha256_dwg']==source['sha256'] and audit['so_doi_chieu']==726
    assert audit['so_khong_khop']==0 and not audit['doi_chieu_chu_so_goc']
    assert not audit['model_handle_thieu'] and not audit['model_handle_them']
    for name,digest in audit['dau_vao_sha256'].items():
        assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest, ('Audit is stale',name)
    with (OUT/'key-dimensions.csv').open(encoding='utf-8',newline='') as stream:
        for row in csv.DictReader(stream):
            key=KEYS[row['ID']]
            assert key[3]==float(row['Value (mm)']) and key[4]==float(row['Value (m)'])
            assert key[5]==row['Drawing'] and key[6]==row['Source']
    assert set(KEYS)==set(SPEC['kich_thuoc']), 'Vietnamese witness translation missing or extra'
    assert set(KEYS)=={k for g in SPEC['nhom'] for k in g['so_do']},'A key witness is not covered'
    covered={v[0] for g in SPEC['nhom'][1:] for v in g['ban_ve']}
    assert covered==set(DRAW), 'A full drawing category is missing'
    result={'phien_ban':'23102026','ma_nguon_sha256':source['sha256'],'so_ma_kich_thuoc':len(KEYS),'so_ban_ve':len(DRAW),'tep':[],'tung_trang':[]}
    single_seen=set()
    for group in SPEC['nhom']:
        doc=fitz.open()
        measurement_pages(doc,group)
        if group['ma']=='00':
            guide_page(doc)
        if group.get('luoi_truc'):
            grid_page(doc)
        toc=[[1,'Kích thước chính',1]]
        views=[]
        for ident,crop_name in group['ban_ve']:
            views.append(drawing_page(doc,group,ident,crop_name))
            views[-1]['trang']=len(doc)
            toc.append([1,TITLE_VI[ident]+' - '+CROPS_VI[crop_name],len(doc)])
        doc.set_toc(toc)
        doc.set_metadata({'title':group['ten']+' - Phiên bản 23102026','subject':'Nhà thờ Giáo xứ Thạch Bi - Bản đọc theo bộ phận','author':''})
        doc.xref_set_key(doc.pdf_catalog(),'Lang','(vi-VN)')
        doc.subset_fonts()
        target=DEST/group['tep']
        doc.save(target,garbage=4,deflate=True,use_objstms=1)
        pages=len(doc)
        doc.close()
        with fitz.open(target) as checked:
            for page in checked:
                text=page.get_text()
                assert 'Phiên bản 23102026' in text
                assert 'Đang phát triển' not in text and 'In development' not in text
                assert 'Not for construction' not in text
                assert not page.get_images(),'Unexpected raster image in the vector edition'
            all_text='\n'.join(p.get_text() for p in checked)
            for ident in group['so_do']:
                assert ident in all_text
                assert SPEC['kich_thuoc'][ident][0] in all_text.replace('\n',' ')
        entry={'tep':group['tep'],'ten':group['ten'],'so_trang':pages,'dung_luong_byte':target.stat().st_size,
               'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'ma_kich_thuoc':group['so_do'],'hinh':views}
        result['tep'].append(entry)
        if group['ma']!='00':
            with fitz.open(target) as parent:
                for (ident,crop_name),view in zip(group['ban_ve'],views):
                    key=(ident,crop_name)
                    if key in single_seen:
                        continue
                    single_seen.add(key)
                    single=fitz.open()
                    single.insert_pdf(parent,from_page=view['trang']-1,to_page=view['trang']-1)
                    for link in single[0].get_links():
                        if link.get('file'):
                            link['file']='../'+link['file']; single[0].update_link(link)
                    single.set_toc([[1,TITLE_VI[ident]+' - '+CROPS_VI[crop_name],1]])
                    single.set_metadata({'title':TITLE_VI[ident]+' - '+CROPS_VI[crop_name]+' - Phiên bản 23102026','author':''})
                    single.xref_set_key(single.pdf_catalog(),'Lang','(vi-VN)')
                    single.subset_fonts()
                    one=DEST/'tung_trang'/page_filename(ident,crop_name)
                    single.save(one,garbage=4,deflate=True,use_objstms=1)
                    assert not single[0].get_images()
                    result['tung_trang'].append({'tep':str(one.relative_to(DEST)),'tap_goc':group['tep'],
                        'trang_goc':view['trang'],'dung_luong_byte':one.stat().st_size,'hinh':view})
                    single.close()
        contact_sheets(target)
        print(f"{group['tep']}: {pages} trang, {target.stat().st_size/1e6:.2f} MB",flush=True)
    result['tep'].append(audit_volume())
    from build_dwg_tower_details_23102026 import tower_volume
    tower_volume(result)
    write_package(result)
    for source_doc in SOURCE_DOCS.values():
        source_doc.close()


def write_package(result):
    """Write the guide text, QA record and both ZIPs from the volume list."""
    (DEST/'_qa/kiem-tra.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    instructions=['NHÀ THỜ GIÁO XỨ THẠCH BI - PHIÊN BẢN 23102026','',
        'Bắt đầu bằng tập 00. Các tập 01-09 được chia theo bộ phận nhà thờ. Tập 10 ghi kết quả kiểm tra dữ liệu.',
        'Tập 11 phóng lớn các chi tiết trang trí nhỏ của hai tháp chuông.',
        'Mỗi tập có bảng kích thước chính và ghi chú cạnh hình. Giữ nguyên mã đo để đối chiếu nguồn.',
        'Bản vẽ giữ nguyên nét vector; phóng lớn vẫn sắc. Ghi chú tiếng Việt vẫn là văn bản.',
        f"Có {len(result['tung_trang'])} PDF từng trang trong thư mục tung_trang, ngoài các tập theo nhóm.",
        'Đơn vị mm suy từ bản vẽ; INSUNITS=1 (inch, đơn vị chèn). Người thiết kế phải xác nhận trước thi công.',
        'Không đo tỷ lệ trên trang PDF. Các số đo còn mâu thuẫn vẫn được ghi rõ. Không dùng để thi công.',
        'Bản vẽ của đơn vị thiết kế; quyền công bố chưa được giải quyết. Bộ này chỉ xuất cục bộ.','']
    instructions += [f"{e['tep']} | {e['so_trang']} trang | {e['dung_luong_byte']/1e6:.2f} MB" for e in result['tep']]
    (DEST/'HUONG_DAN_23102026.txt').write_text('\n'.join(instructions)+'\n')
    zip_path=DEST/'Nha_tho_Thach_Bi_23102026.zip'
    with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
        for e in result['tep']:
            archive.write(DEST/e['tep'],e['tep'])
        archive.write(DEST/'HUONG_DAN_23102026.txt','HUONG_DAN_23102026.txt')
    with zipfile.ZipFile(zip_path) as archive:
        assert archive.testzip() is None
    print(f'Trọn bộ: {zip_path.stat().st_size/1e6:.2f} MB',flush=True)
    singles_zip=DEST/'Tung_trang_23102026.zip'
    with zipfile.ZipFile(singles_zip,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
        for entry in result['tung_trang']:
            archive.write(DEST/entry['tep'],entry['tep'])
        archive.write(DEST/'HUONG_DAN_23102026.txt','HUONG_DAN_23102026.txt')
        archive.write(DEST/'00_Tong_quan_23102026.pdf','00_Tong_quan_23102026.pdf')
    with zipfile.ZipFile(singles_zip) as archive:
        assert archive.testzip() is None
    print(f"Từng trang: {len(result['tung_trang'])} tệp, {singles_zip.stat().st_size/1e6:.2f} MB",flush=True)


if __name__=='__main__':
    build()
