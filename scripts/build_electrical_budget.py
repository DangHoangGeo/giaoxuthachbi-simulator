#!/usr/bin/env python3
"""Rebuild route load review, complete takeoff and Japanese comparison budget.

python3 scripts/build_electrical_budget.py [--output output/electrical-review]
Preserves model/registers and editable input files. Refuses stale snapshots.
"""
from __future__ import annotations
import argparse,csv,hashlib,json,math,subprocess,tempfile,unicodedata
from pathlib import Path
from collections import defaultdict
from xml.sax.saxutils import escape
from electrical_review import analyse,B2
from review_drawings_i18n import register_fonts,FONT_FILES,FONT_DIRECTORY
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3,landscape
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether

ROOT=Path(__file__).resolve().parents[1]
INK=colors.HexColor('#203c38'); RED=colors.HexColor('#953e2c'); GREY=colors.HexColor('#61716b')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads((ROOT/p).read_text())
def write_json(p,value):p.write_text(json.dumps(value,ensure_ascii=False,indent=2,allow_nan=False)+'\n')
def csv_write(p,rows):
    if not rows: return
    with p.open('w',newline='',encoding='utf-8-sig') as f:
        fields=list(dict.fromkeys(k for row in rows for k in row))
        writer=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');writer.writeheader()
        writer.writerows({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in r.items()} for r in rows)
def number(v,dp=2):return 'CHỜ XÁC NHẬN' if v is None else f'{v:,.{dp}f}'
def fact(value):
    return value.get('text','') if isinstance(value,dict) else ', '.join(map(str,value)) if isinstance(value,list) else str(value)

class Report:
    def __init__(self,path,title,revision):
        self.title,self.revision=title,revision; self.normal,self.bold=register_fonts('vi')
        self.styles={
          'title':ParagraphStyle('Title',fontName=self.bold,fontSize=23,leading=29,textColor=INK,spaceAfter=12),
          'head':ParagraphStyle('Head',fontName=self.bold,fontSize=13,leading=17,textColor=INK,spaceBefore=9,spaceAfter=7),
          'body':ParagraphStyle('Body',fontName=self.normal,fontSize=9,leading=13,textColor=INK,spaceAfter=7),
          'small':ParagraphStyle('Small',fontName=self.normal,fontSize=7.5,leading=10,textColor=INK),
          'th':ParagraphStyle('TH',fontName=self.bold,fontSize=8,leading=11,textColor=colors.white)}
        self.story=[]
        self.doc=SimpleDocTemplate(str(path),pagesize=landscape(A3),rightMargin=13*mm,leftMargin=13*mm,topMargin=18*mm,bottomMargin=17*mm,
          title=title,author='Thạch Bi - phát triển thiết kế',pageCompression=1,invariant=1)
    def p(self,text,style='body'):
        # Explicit display equivalent for source arrows absent from Noto Sans.
        # Machine CSV/JSON and technical meanings remain unchanged.
        value=unicodedata.normalize('NFC',str(text)).replace('\u2192','->')
        glyphs=pdfmetrics.getFont(self.styles[style].fontName).face.charToGlyph
        if any(ord(c) not in glyphs for c in value if not c.isspace()):raise ValueError('Font cannot print: '+repr(value))
        return Paragraph(escape(value).replace('\n','<br/>'),self.styles[style])
    def text(self,text,style='body'):self.story.append(self.p(text,style))
    def table(self,headers,rows,widths):
        if not rows:self.text('Chưa có dữ liệu.');return
        contents=[[self.p(x,'th') for x in headers]]+[[self.p(x,'small') for x in r] for r in rows]
        t=Table(contents,colWidths=[w*mm for w in widths],repeatRows=1,hAlign='LEFT')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),INK),('VALIGN',(0,0),(-1,-1),'TOP'),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f0f5f2')]),
          ('LINEBELOW',(0,0),(-1,0),.5,INK),('BOTTOMPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5)]))
        self.story+=[t,Spacer(1,5*mm)]
    def page(self):self.story.append(PageBreak())
    def finish(self):
        def footer(c,d):
            c.setFont(self.bold,8);c.setFillColor(RED);c.drawString(13*mm,286*mm,'PHÁT TRIỂN THIẾT KẾ - CHƯA PHÊ DUYỆT THI CÔNG / MUA HÀNG')
            c.setFont(self.normal,7);c.setFillColor(GREY);c.drawString(13*mm,8*mm,f'Mô hình {self.revision[:10]} | Nguồn và mã băm: manifest.json | Đơn vị theo từng cột')
            c.drawRightString(406*mm,8*mm,f'A3 - Trang {d.page}')
        self.doc.build(self.story,onFirstPage=footer,onLaterPages=footer)

def question_pages(doc,questions):
    doc.page();doc.text('Các câu hỏi cần xác nhận','title')
    doc.text('Giáo xứ xác nhận chưa có thông tin nguồn điện. Mọi câu hỏi dưới đây đang mở; câu trả lời phải kèm bằng chứng, người kiểm tra và bản cập nhật được duyệt. Danh sách này bổ sung các mục mở trong docs/engineering/issues.md và sổ kích thước gốc.')
    doc.table(['Mã / chuyên ngành','Câu hỏi cần trả lời','Người cung cấp / bằng chứng','Phần chưa thể chốt'],
      [[q['id']+' / '+q['discipline'],q['question_vi'],q['owner']+'\n'+q['evidence'],q['blocks']] for q in questions],[35,144,105,108])

def electrical_pdf(path,result,snapshot,questions):
    d=Report(path,'Phụ tải và kiểm tra cáp theo từng tuyến',snapshot['gitRevision']);s=result['summary']
    inputs=result['inputs'];reserve=inputs['planning_reserve_factor'];reserve_percent=100*(reserve-1)
    case_text='; '.join(f"{c['id']}: {c['voltage_v']:g} V/PF{c['power_factor']:g}/{c['temperature_c']:g}°C/{c['grouped_circuits']} mạch đi chung (hệ số nhiệt {c['temperature_factor']:g}, nhóm {c['grouping_factor']:g})" for c in inputs['comparison_cases'])
    d.text('Thạch Bi - phụ tải và cáp điện','title')
    d.text('Báo cáo tính có điều kiện theo mô hình. Chưa biết nguồn điện, sản phẩm, cách đi cáp, bảo vệ và dòng sự cố. Các cột cáp/CB so sánh không phải chỉ định để mua hoặc thi công.')
    d.table(['Phạm vi','Giá trị','Ý nghĩa'],[
      ['Thiết bị / tủ / tuyến',f"{s['equipment_items']} / {s['enclosures']} / {s['routes']}",f"{s['connected_items']} thiết bị nối tuyến; mỗi ID giữ nguyên"],
      ['Công suất vận hành mô hình',number(s['operating_model_w'])+' W','Cảnh nguồn '+str(snapshot['scene'])+'; có ước tính cấp ampli, không phải cực đại theo nhãn'],
      ['Cực đại phần điện lực đã mô hình',number(s['model_maximum_known_mains_proxy_w'])+' W','Tất cả đèn/quạt đang hiển thị, gồm thiết bị thường tắt; KHÔNG gồm cực đại đầu vào rack AV'],
      [f'Phần đã biết + dự phòng {reserve_percent:g}%',number(s['known_proxy_with_reserve_w'])+' W','Giả định so sánh do báo cáo đặt rõ; không phải hệ số quy chuẩn'],
      ['Cực đại hoàn chỉnh của nhà thờ','CHỜ XÁC NHẬN','Ampli/mixer/điều khiển/tải khác/nguồn trước DB-1 chưa xác nhận'],
      ['Chiều dài cáp theo mô hình',number(s['model_cable_centreline_m'])+' m','Cộng các đoạn điện lực và từng home run tín hiệu; không cộng lại bó tuyến'],
      ['Chiều dài hỏi giá',number(s['quote_cable_m'])+' m',f"{inputs['quote_length_allowance_percent']:g}% + {inputs['quote_termination_allowance_m_per_piece']:g} m mỗi đoạn/cáp mô hình; chưa đo thi công"],
      ['Tuyến được duyệt cáp','0 / '+str(s['routes']),'Mọi tuyến vẫn có câu hỏi chưa giải quyết']], [80,80,232])
    d.text('Cơ sở tính và giới hạn','head')
    for t in [
      f'Dòng một pha I = P / (U × PF). Dòng so sánh dùng {reserve:g} × công suất cực đại danh mục. Không dùng mức dim/cấp quạt thấp để giảm tiết diện. Chưa phân pha và không áp dụng hệ số đồng thời.',
      'Ib <= In <= Iz; Iz = dòng bảng × hệ số nhiệt × hệ số đi chung. Mọi nhánh cùng mạch dùng bảo vệ chung theo tổng mạch; tải nhánh nhỏ không cho phép bỏ kiểm tra CB phía trên. I2, khả năng cắt, phối hợp chọn lọc, PE và ngắn mạch vẫn chưa kiểm chứng.',
      'Bảng B2: cáp đồng PVC đa lõi, BA lõi mang tải, 30°C tham chiếu. Dùng làm so sánh bảo thủ cho giả định một pha; chưa xác nhận cách lắp đặt thực. '+case_text,
      'Sụt áp biên trên một pha ΔU <= 2 I (R + X) L; R = 23,7/S Ω/km, X = 0,08 Ω/km, L là chiều dài một chiều theo km. 23,7 là tham chiếu đồng nóng trong ví dụ XLPE của nguồn, dùng bảo thủ cho so sánh; không cho phép PVC làm việc ở nhiệt độ XLPE.',
      'Toàn phụ tải bó mạch được đặt trên mọi đoạn trục để tạo biên bảo thủ; đường nhánh dùng đúng upstreamLength. Nguồn tủ được cộng một lần trên đường đi. Phân bổ so sánh 1% feeder + 1% trục + 1% nhánh cho đèn; 1% + 2% + 2% cho quạt. Đây là phân bổ tham khảo, chưa phải tiêu chí Việt Nam được duyệt.',
      'Đường từ điểm cấp điện đến DB-1 chưa có: sụt áp toàn hệ thống luôn để trống. Đạt phép so sánh từ DB-1 không chứng minh toàn tuyến đạt. Sóng hài, khởi động và trở kháng thực có thể thay đổi kết quả.',
      'Loa thụ động dùng công suất âm thanh, không phải điện lưới. Nguồn AV-1 chưa thể chọn cáp từ các tỷ lệ ước tính ampli của simulator. Tín hiệu micro không phải tải điện lưới. Dòng âm thanh 100 V chỉ là tình huống tham khảo; chưa chọn tap/trở kháng.'
    ]:d.text(t)
    d.table(['Tiết diện mm²','Dòng tham chiếu B2 A'],[[number(a,1),number(b,0)] for a,b in B2.items()],[100,100])
    d.page();d.text('Bảng kiểm tra tất cả tuyến','title')
    d.text(f'S1/S2: dòng đã có {reserve_percent:g}% dự phòng và cáp đồng 3 lõi L/N/PE giả định. '+case_text+'. Giá trị tiết diện là điều kiện theo từng kịch bản. Dòng/tiết diện “-” là tín hiệu hoặc thiếu đầu vào. Cột chiều dài: đoạn điện lực; home run đầy đủ cho tín hiệu; bó tín hiệu không là khối lượng mua thêm. Mọi cáp chính thức vẫn CHỜ XÁC NHẬN.')
    rows=[]
    for r in result['routes']:
        cases=r['comparison_cases'];a=cases[0] if cases else {};b=cases[1] if len(cases)>1 else {}
        rows.append([r['route_id'],r['circuit']+' / '+r['kind'],number(r['model_cable_length_m']),number(r['quote_length_m']),'-' if r['catalogue_maximum_mains_proxy_w'] is None else number(r['catalogue_maximum_mains_proxy_w'],1),
          '-' if not a else number(a['planning_current_a'],2)+' A / '+number(a['comparison_area_mm2'],1)+' mm²',
          '-' if not b else number(b['planning_current_a'],2)+' A / '+number(b['comparison_area_mm2'],1)+' mm²',
          '-' if not b else number(b['path_vdrop_percent_from_db1'],2)+'% từ DB-1',
          'Bó tuyến: không mua thêm cáp' if r['length_basis'].startswith('Bundle') else 'Nguồn AV chưa có nhãn' if r['route_id']=='feeder:AV1' else 'CHỜ XÁC NHẬN'])
    d.table(['ID tuyến','Mạch / loại','Cáp mô hình m','Hỏi giá m','Cực đại proxy W','S1: dòng / cáp','S2: dòng / cáp','S2: sụt áp','Trạng thái'],rows,[72,35,25,25,30,49,49,42,65])
    question_pages(d,questions)
    d.page();d.text('Nguồn và cập nhật','title')
    for source in result['inputs']['reference_sources']:d.text(source['id']+' - '+source['url']+'\n'+source['location']+'\n'+source['limitation'])
    d.text('Chạy python3 scripts/build_electrical_budget.py sau khi cập nhật mô hình, xuất điện và làm mới sổ theo quy trình bảo toàn dữ liệu. route-load-schedule.csv giữ mọi ID, thiết bị phía sau, tọa độ đầu/cuối, phụ tải vận hành, phép so sánh và các mục chưa xác nhận. Không cộng các hàng nguồn/trục/nhánh để tính tổng năng lượng.');d.finish()

def takeoff(snapshot):
    comp={c['id']:c for c in snapshot['full']['components']};rows=[]
    for i in snapshot['items']:
        c=comp.get(i['id'],{})
        rows.append({'id':i['id'],'name':i['name'],'type':i['type'],'product':i['product'],'quantity':1,'scope':'Hidden alternative / excluded' if i['hidden'] else 'Shown model scope',
          'circuit':i['circuit'],'electrical_kind':i['electricalKind'],'position_xyz_m':i['position'],'model_envelope_m':c.get('modelSize'),
          'catalogue_description':i['catalogueDescription'],'specifications':c.get('specs'),'params':i['params'],'maximum_mains_proxy_w':i['maximumMainsProxyW'],
          'operating_model_w':i['operatingModelW'],'audio_rating_w':i['audioRatingW'],'manufacturer_nameplate_w':None,'selected_product':None,'approved_price_jpy':None})
    for id,source in snapshot['full']['sources'].items():rows.append({'id':id,'name':source['label'],'type':'enclosure:'+id,'product':source['label'],'quantity':1,'scope':'Shown enclosure proxy',
      'circuit':None,'electrical_kind':'distribution/control','position_xyz_m':source['pos'],'model_envelope_m':source['size'],'catalogue_description':source['where'],
      'specifications':'Visualization envelope; internal modules/channels/capacity unknown','params':{},'maximum_mains_proxy_w':None,'operating_model_w':None,'audio_rating_w':None,
      'manufacturer_nameplate_w':None,'selected_product':None,'approved_price_jpy':None})
    return rows

def make_budget(equipment,prices,assumptions):
    refs={r['reference_id']:r for r in prices.get('references',[])}; groups=defaultdict(list)
    for r in equipment:groups[(r['type'],r['scope'])].append(r)
    if len(refs)!=len(prices.get('references',[])):raise ValueError('Duplicate price reference')
    for type,id in assumptions['selected_price_reference_by_type'].items():
        if id not in refs or type not in refs[id]['matched_type_ids']:raise ValueError('Unknown or wrong-type price mapping: '+type)
    lines=[]
    for (type,scope),members in sorted(groups.items()):
        ref=refs.get(assumptions['selected_price_reference_by_type'].get(type)); q=len(members)
        unit=None if not ref or ref.get('price') is None or not ref.get('pack_quantity') or ref.get('currency')!='JPY' or ref.get('pack_unit')!='item' else ref['price']/ref['pack_quantity']
        # Comparison assembly costs only; component/alternative refs are never
        # silently substituted for a complete modeled luminaire or fan.
        voltage_ok=bool(ref and (ref.get('input_voltage_220_240_compatible') is True or all(m['electrical_kind'] in ('passive-audio','microphone-signal','non-electrical','distribution/control') for m in members)))
        valid=bool(ref and unit is not None and ref.get('pricing_scope') in ('complete_assembly','infrastructure') and voltage_ok)
        shown=not scope.startswith('Hidden')
        packs=math.ceil(q/ref['pack_quantity']) if valid else None
        reference_packs=math.ceil(q/ref['pack_quantity']) if unit is not None else None
        lines.append({'type':type,'scope':scope,'quantity':q,'equipment_ids':[m['id'] for m in members],
          'model_specs':sorted(set(m['specifications'] or m['catalogue_description'] or '' for m in members)),
          'reference_id':None if not ref else ref['reference_id'],'comparison_product':None if not ref else ref['product_title'],
          'unit_comparison_price_jpy':unit,'pack_quantity':None if not ref else ref.get('pack_quantity'),
          'comparison_packs':packs,'comparison_extension_jpy':None if packs is None else packs*ref['price'],
          'reference_only_extension_jpy':None if reference_packs is None else reference_packs*ref['price'],
          'included_in_comparison_subtotal':valid and shown,'price_status':'Unpriced / pending' if unit is None else 'Excluded: component, voltage mismatch or hidden alternative' if not valid or not shown else 'Market comparison only; engineering fit pending',
          'url':None if not ref else ref['url'],'compatibility_gaps':[] if not ref else ref.get('compatibility_gaps',[])})
    eligible=[l for l in lines if l['included_in_comparison_subtotal']]
    subtotal=sum(l['comparison_extension_jpy'] for l in eligible) if eligible else None
    return {'schema':1,'currency':'JPY','marketplace':'amazon.co.jp','lines':lines,
      'summary':{'shown_equipment_enclosures':sum(l['quantity'] for l in lines if not l['scope'].startswith('Hidden')),
        'hidden_alternatives':sum(l['quantity'] for l in lines if l['scope'].startswith('Hidden')),
        'priced_comparison_groups':sum(l['included_in_comparison_subtotal'] for l in lines),
        'unpriced_or_excluded_shown_groups':sum(not l['included_in_comparison_subtotal'] and not l['scope'].startswith('Hidden') for l in lines),
        'priced_comparison_subtotal_jpy':subtotal,'complete_equipment_budget_jpy':None,'complete_installed_project_budget_jpy':None,
        'scope_note':'Subtotal of explicitly chosen comparable complete assemblies only; does not represent a complete budget. All product fit remains unapproved.'},'assumptions':assumptions}

def budget_pdf(path,budget,result,snapshot,questions,prices,suppliers,shortlist,product_reviews,vi):
    d=Report(path,'Khối lượng và dự toán tham khảo thị trường Nhật',snapshot['gitRevision']);s=budget['summary']
    d.text('Thạch Bi - khối lượng và giá tham khảo Nhật','title')
    d.text('Amazon.co.jp, JPY. Giá quan sát được là giá so sánh thị trường, không phải báo giá giao đến Việt Nam hoặc danh sách đã chọn. Sản phẩm 100 V/thiếu điện áp, quang học, tiếng ồn hay dữ liệu hỗ trợ phải được xem xét trước khi mua.')
    d.table(['Chỉ tiêu','Giá trị','Giới hạn'],[
      ['Thiết bị/tủ đang hiển thị',str(s['shown_equipment_enclosures']),'Tọa độ và thông số từng ID trong equipment-budget.csv'],
      ['Phương án ẩn',str(s['hidden_alternatives']),'Loại khỏi khối lượng cơ sở; vẫn giữ ID'],
      ['Nhóm có giá so sánh được cộng',str(s['priced_comparison_groups']),'Chỉ tham chiếu được chọn rõ, đúng đơn vị gói'],
      ['Nhóm hiển thị chưa có giá / bị loại',str(s['unpriced_or_excluded_shown_groups']),'Không thay giá thiếu bằng 0'],
      ['Tổng phần đã có giá so sánh',number(s['priced_comparison_subtotal_jpy'],0)+' JPY','Tổng PHẦN CÓ GIÁ, không phải ngân sách toàn công trình'],
      ['Ngân sách thiết bị đầy đủ','CHỜ BÁO GIÁ','Các nhóm thiếu giá, lõi quang học và phần cứng chưa chọn'],
      ['Ngân sách hoàn chỉnh tại công trường','CHỜ BÁO GIÁ','Cáp/ống, nhập khẩu, vận chuyển, thuế, nhân công, neo, giàn giáo, thử nghiệm và dự phòng chưa chốt']], [95,65,232])
    d.text('Đơn vị và tránh tính trùng','head')
    d.text('Mỗi ID thuộc đúng một hàng thiết bị. Tủ chỉ tính vỏ mô hình, chưa bao gồm số CB/kênh/ampli chưa được thiết kế. Đèn chùm là một cụm; không cộng lại bóng đèn khi giá đã gồm bóng. Đèn chùm nhỏ có quang học đọc sách riêng chưa chọn, nên giá thân đèn không được coi là giá cả cụm. Chiều dài chuỗi đèn và số bóng trong params giữ riêng khỏi cáp cấp nguồn.')
    d.text('Danh sách nhà cung cấp để yêu cầu hồ sơ','head')
    d.text(shortlist['criteria_vi'])
    supplier_names={s['id']:s['name'] for s in suppliers['suppliers']}
    d.table(['Chuyên ngành / ưu tiên hỏi hồ sơ','Lý do lựa chọn sơ bộ','Giới hạn cần giải quyết'],
      [[r['discipline_vi']+'\n'+', '.join(supplier_names[i] for i in r['first_supplier_ids'])+'\nĐối chứng: '+', '.join(supplier_names[i] for i in r['comparison_supplier_ids']),r['reason_vi'],r['remaining_vi']] for r in shortlist['recommendations']],[90,142,160])
    d.text(shortlist['procurement_gate_vi'])
    d.page();d.text('Ma trận 12 ứng viên Nhật và kênh cung cấp','title')
    if suppliers.get('suppliers'):
        d.table(['Nhà cung cấp','Phạm vi / hồ sơ','Điều cần xác nhận'],[[r['name'],vi['suppliers'][r['id']]['product_classes_vi']+'\n'+vi['suppliers'][r['id']]['documentation_vi'],'\n'.join(vi['suppliers'][r['id']]['gaps_vi'])+'\n'+r['official_url']] for r in suppliers['suppliers']],[60,160,172])
    else:d.text('Đang xác minh nhà cung cấp; xem docs/budget/japan-suppliers.md khi đã có nguồn.')
    d.page();d.text('Khối lượng theo loại thiết bị','title')
    d.text('Mỗi loại giữ danh sách đầy đủ ID trong CSV. Thông số ghi dưới đây là danh mục/mô hình; chưa phải sản phẩm hãng được duyệt. Bộ phận hoặc sản phẩm lệch điện áp không được cộng vào tổng so sánh.')
    d.table(['Loại / phạm vi','SL / ID mẫu','Thông số mô hình','Tham chiếu thị trường / giá','Tiền tham chiếu JPY / điều chưa đạt'],
      [[l['type']+'\n'+l['scope'],str(l['quantity'])+'\n'+', '.join(l['equipment_ids'][:7])+(' ...' if len(l['equipment_ids'])>7 else ''), '\n'.join(l['model_specs']),
        (l['comparison_product'] or 'CHỜ BÁO GIÁ')+'\n'+number(l['unit_comparison_price_jpy'],0)+' JPY/đơn vị',number(l['reference_only_extension_jpy'],0)+'\n'+l['price_status']] for l in budget['lines']],[50,53,130,100,59])
    d.page();d.text('Cáp theo chiều dài mô hình và phương án so sánh','title')
    cable_groups=defaultdict(lambda:{'pieces':0,'model':0.,'quote':0.})
    for r in result['routes']:
        if r['model_cable_length_m']==0:continue
        key=('Tín hiệu '+r['kind']+' / CHƯA CHỌN') if r['kind'] in ('audio','mic') else ('Nguồn AV / CHƯA CHỌN') if r['comparison_budget_area_mm2'] is None else f"Điện lực giả định 3 lõi / {r['comparison_budget_area_mm2']:g} mm²"
        g=cable_groups[key];g['pieces']+=1;g['model']+=r['model_cable_length_m'];g['quote']+=r['quote_length_m']
    d.table(['Nhóm hỏi giá','Số đoạn/cáp','Theo mô hình m','Có allowance m','Đơn giá / phê duyệt'],[[k,str(g['pieces']),number(g['model']),number(g['quote']),'CHỜ BÁO GIÁ / CHỜ DUYỆT'] for k,g in sorted(cable_groups.items())],[137,45,60,60,90])
    db2=next((r for r in result['routes'] if r['route_id']=='feeder:DB2'),None)
    if db2:d.text('Tiết diện là giá trị lớn hơn giữa hai phép so sánh, không là lựa chọn được duyệt. Feeder DB-2 dài '+number(db2['model_segment_length_m'],3)+' m đi theo tuyến che giấu hiện tại có thể tạo yêu cầu cáp lớn trong phân bổ sụt áp 1%; phải xem xét lại tuyến, số pha và phân bổ sụt áp với kỹ sư. Không tự rút ngắn chiều dài hay đổi ngưỡng để giảm dự toán.')
    d.text('Ống/máng không tính bằng tổng mét cáp: nhiều mạch dùng chung hành lang. Cần chọn tiết diện cáp, đường kính thực, hệ số đầy, tách tín hiệu/điện lực và khoang bảo trì trước khi chốt khối lượng ống/máng.')
    d.text('Các chi phí đang thiếu','head')
    d.table(['Hạng mục','Dữ liệu cần có'],[['Thiết bị và phụ tùng','Mã hãng, cấu hình cụm, bộ nguồn, phụ tùng và bảo hành'],['Cáp và ống/máng','Cáp đã duyệt, mét thực, gói/cuộn, hộp/đầu nối và hệ số đầy'],['Đèn chùm/neo/giàn giáo','Sản phẩm thực, tải treo, chi tiết kết cấu và đường bảo trì'],['Nhân công Việt Nam','Khối lượng và đơn giá lắp đặt theo công việc'],['Nhập khẩu/vận chuyển/thuế','Báo giá giao Việt Nam, điều kiện bán hàng và nguồn thuế'],['Đo kiểm/commissioning/đào tạo','Kế hoạch nghiệm thu và đơn giá'],['Dự phòng/vòng đời','Mức dự phòng, lịch thay thế/bảo trì và trách nhiệm']], [85,307])
    d.page();d.text('Giá Amazon Nhật đã kiểm tra','title')
    for ref in prices.get('references',[]):
        block_start=len(d.story)
        display=vi['prices'][ref['reference_id']]
        d.text(ref['reference_id']+' - '+display['product_title_vi'],'head')
        d.text('Giá: '+number(ref.get('price'),0)+' '+str(ref.get('currency','JPY'))+' / '+str(ref.get('pack_quantity'))+' '+('cụm/mục' if ref.get('pack_unit')=='item' else 'm')+'; trạng thái '+display['price_status_vi']+'; điện áp '+display['voltage_vi'])
        d.text(ref['url']+'\n'+'\n'.join(display['gaps_vi']))
        for review in product_reviews['reviews']:
            if review['reference_id']==ref['reference_id']:
                d.text('Rà soát hãng / kỹ thuật: '+review['note_vi'])
                for source in review['sources']:d.text(source['url']+'\n'+source['location']+'; '+source['access'])
        d.story[block_start:]=[KeepTogether(d.story[block_start:])]
    question_pages(d,questions);d.finish()

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--output',default='output/electrical-review');ap.add_argument('--draft',action='store_true');args=ap.parse_args()
    price_path=ROOT/'docs/budget/amazon-price-references.json'; supplier_path=ROOT/'docs/budget/japan-suppliers.json'
    if not args.draft and (not price_path.exists() or not supplier_path.exists()):raise SystemExit('Finish price/supplier source research first (or use --draft for internal layout checks).')
    inputs=read('docs/electrical-grid/cable-design-inputs.json');questions=read('docs/engineering/questions-for-parish-and-designers.json')['questions'];assumptions=read('docs/budget/budget-assumptions.json')
    if len(inputs['comparison_cases'])!=2:raise ValueError('This PDF layout requires exactly two comparison cases; extend/review it before changing the number')
    prices=json.loads(price_path.read_text()) if price_path.exists() else {'references':[]};suppliers=json.loads(supplier_path.read_text()) if supplier_path.exists() else {}
    shortlist=read('docs/budget/supplier-shortlist.json');product_reviews=read('docs/budget/product-reference-review.json');vi=read('docs/budget/report-text-vi.json')
    if set(vi['sourceSha256'])!={'docs/budget/japan-suppliers.json','docs/budget/amazon-price-references.json'} or any(sha(ROOT/p)!=h for p,h in vi['sourceSha256'].items()):raise ValueError('Vietnamese market translation is stale; review against changed source facts')
    if set(vi['suppliers'])!={r['id'] for r in suppliers['suppliers']} or set(vi['prices'])!={r['reference_id'] for r in prices['references']}:raise ValueError('Supplier/price translation coverage differs from sources')
    for r in suppliers['suppliers']:
        if len(vi['suppliers'][r['id']]['gaps_vi'])!=len(r['compatibility_gaps']):raise ValueError('Missing supplier gap translation')
    for r in prices['references']:
        if len(vi['prices'][r['reference_id']]['gaps_vi'])!=len(r['compatibility_gaps']):raise ValueError('Missing price gap translation')
    for ref in prices.get('references',[]):
        if ref['marketplace']!='amazon.co.jp' or ref.get('currency')!='JPY':raise ValueError('Budget market must be Japan/JPY')
        if ref.get('price') is not None and (not math.isfinite(ref['price']) or ref['price']<0):raise ValueError('Invalid price')
        quantity=ref.get('pack_quantity')
        if quantity is not None and (not math.isfinite(quantity) or quantity<=0 or (ref['pack_unit']=='item' and quantity!=int(quantity))):raise ValueError('Invalid pack quantity')
    with tempfile.TemporaryDirectory() as td:
        fresh=Path(td)/'snapshot.json';subprocess.run(['node','scripts/export_electrical_loads.cjs',str(fresh)],cwd=ROOT,check=True);snapshot=json.loads(fresh.read_text())
    result=analyse(snapshot,inputs);equipment=takeoff(snapshot);budget=make_budget(equipment,prices,assumptions)
    destination=Path(args.output).resolve();destination.mkdir(parents=True,exist_ok=True)
    # Finish both reports before replacing any delivered file. Manifest last;
    # its checksums reject a mixed set after interruption during publication.
    with tempfile.TemporaryDirectory(prefix='.thachbi-review-',dir=destination) as td:
        out=Path(td)
        write_json(out/'load-snapshot.json',snapshot);write_json(out/'route-load-review.json',result);write_json(out/'budget-japan.json',budget)
        csv_write(out/'route-load-schedule.csv',result['routes']);csv_write(out/'equipment-budget.csv',equipment);csv_write(out/'budget-quantity-groups.csv',budget['lines']);csv_write(out/'open-questions.csv',questions)
        electrical_pdf(out/'thach-bi-cable-load-review-vi.pdf',result,snapshot,questions)
        budget_pdf(out/'thach-bi-budget-japan-vi.pdf',budget,result,snapshot,questions,prices,suppliers,shortlist,product_reviews,vi)
        sources=['scripts/export_electrical_loads.cjs','scripts/electrical_review.py','scripts/build_electrical_budget.py','scripts/review_drawings_i18n.py','docs/electrical-grid/cable-design-inputs.json','docs/engineering/questions-for-parish-and-designers.json','docs/budget/budget-assumptions.json','docs/budget/supplier-shortlist.json','docs/budget/product-reference-review.json','docs/budget/report-text-vi.json']
        sources += [p for p in ['docs/budget/amazon-price-references.json','docs/budget/japan-suppliers.json'] if (ROOT/p).exists()]
        files={p.name:sha(p) for p in sorted(out.iterdir())}
        write_json(out/'manifest.json',{'schema':1,'status':result['status'],'draft':args.draft,'gitRevision':snapshot['gitRevision'],'modelSourceSha256':snapshot['sourceSha256'],
          'sourceSha256':{p:sha(ROOT/p) for p in sources},'fontSha256':{str((FONT_DIRECTORY/p).relative_to(ROOT)):sha(FONT_DIRECTORY/p) for p in FONT_FILES},'outputSha256':files,
          'counts':result['summary'],'budgetSummary':budget['summary'],'open_questions':len(questions)})
        for name in [*files,'manifest.json']:(out/name).replace(destination/name)
    print(json.dumps({'output':str(destination),'counts':result['summary'],'budget':budget['summary']},ensure_ascii=False))

if __name__=='__main__':main()
