#!/usr/bin/env python3
"""Readable, source-linked dimension summary PDF from register-data.json.

The workbook carries full measuring endpoints. This PDF is a navigation aid,
not an engineering schedule or a calibrated drawing. Requires PyMuPDF.
"""
import json
from pathlib import Path

import pymupdf as fitz
import matplotlib.font_manager as fm

ROOT=Path(__file__).resolve().parent.parent
DEST=ROOT/'exports/dwg-review-2026-10-26'
data=json.loads((DEST/'register-data.json').read_text())
doc=fitz.open()
font=fitz.Font(fontfile=fm.findfont('DejaVu Sans'))
W,H=1190.55,841.89


def text(page,x,y,value,size=10,color=(.12,.16,.20)):
    page.insert_font(fontname='ReviewFont',fontbuffer=font.buffer)
    page.insert_text((x,y),str(value),fontsize=size,fontname='ReviewFont',color=color)


def page(title):
    p=doc.new_page(width=W,height=H)
    text(p,32,35,'THẠCH BI | '+title,18)
    text(p,32,56,'Owner-selected design basis: DWG saved 2026-10-23 | review 2026-10-26 | source file 10',10)
    text(p,32,H-35,'Đang phát triển / In development - Không dùng để thi công / Not for construction',11,(.63,.18,.12))
    text(p,32,H-18,f'CAD witnesses, not site measurements. Units: mm / m. Full endpoints and source handles in 04_Key_Dimensions.xlsx.   |   {len(doc)}',9)
    return p


def lines(p,x,y,value,width,size=9,leading=13,maxlines=6):
    # Size by actual glyph width, avoiding clipped long IDs and accented words.
    words=str(value).split()
    wrapped=[]
    current=''
    for word in words:
        candidate=(current+' '+word).strip()
        if font.text_length(candidate,fontsize=size)>width and current:
            wrapped.append(current)
            current=word
        else:
            current=candidate
    if current:
        wrapped.append(current)
    assert len(wrapped)<=maxlines, (value,wrapped)
    for line in wrapped:
        text(p,x,y,line,size)
        y+=leading


intro=page('KEY DIMENSIONS AND DRAWING GUIDE')
for y,heading,body in [
    (110,'What this set contains','27 full drawing views; enlarged facade, tower, roof, column, platform, window, door and arch details; 79 selected dimension/level/position witnesses; 21 grid-centre coordinates.'),
    (195,'How to find a measurement','Use the ID and drawing in the following tables. DWGxxxx identifies a DIMENSION object; its CAD handle and two measuring endpoints are in the workbook. Fxx refers to facade.csv. LEVEL rows retain the printed level and marker comparison.'),
    (280,'Design basis and retained evidence','The owner selected this exact DWG as the project design standard on 26 October 2026. Its SHA-256 matches the existing revision: 2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae. Older PDF witnesses remain unchanged in the main dimension register.'),
    (365,'Unresolved conflicts inside the DWG','Plan overall extent 67063.6 mm versus longitudinal section 67149.4 mm; platform label +750 mm versus section +800 mm; roof drawn +12396.4 mm versus +12472 mm labels/longitudinal section; 6324/6325 mm cornice references. Do not average or silently select construction values.'),
    (465,'Coordinates and precision','Model metres: X starts at axis 1 toward the sanctuary; Y up from nave floor 0.000; Z centred between D/E, positive toward H/I. Local u/v drawings are NOT global XYZ. Plan facade records use Z/X. Values rounded from CAD are not survey tolerances.'),
    (565,'Limits and outstanding engineering','No roof plan is present. The file is a collection of 2D drawings; it contains no verified 3D perspectives or complete fabrication/connection schedule. Geometry/printed labels can conflict. LibreDWG conversion and font substitution require native-CAD plot comparison before construction use.'),
    (665,'Print and publication','PDF drawings contain vector paths and can be zoomed without pixelation. Sheets are fit-to-page, not calibrated print scales. The original drawings and these local exports remain under publication hold H1; no permission or construction hold is cleared by this review.')]:
    text(intro,35,y,heading,12)
    lines(intro,35,y+20,body,1100,10,15,5)

toc=[[1,'How to use this set',1]]
for start in range(0,len(data['keys']),9):
    p=page(f'KEY WITNESSES {start+1}-{min(start+9,len(data["keys"]))} OF {len(data["keys"])}')
    xs=[32,154,430,535,606,718]
    names=['Source ID','Part / measurement witness','Value (mm)','Value (m)','Drawing / basis','Meaning and unresolved limits']
    p.draw_rect(fitz.Rect(28,77,W-28,106),fill=(.15,.25,.33),color=None)
    for x,name in zip(xs,names):
        text(p,x,96,name,9,(1,1,1))
    for index,row in enumerate(data['keys'][start:start+9]):
        y=125+index*70
        ident,part,param,mm,m,drawing,source,basis,axes,*rest=row
        note=rest[-1]
        lines(p,xs[0],y,ident,116,8,11,3)
        lines(p,xs[1],y,part,248,10,13,3)
        text(p,xs[1],y+40,param,8,(.35,.40,.45))
        text(p,xs[2],y,f'{mm:,.1f}',10)
        text(p,xs[3],y,f'{m:,.4f}',10)
        lines(p,xs[4],y,drawing+' / '+basis,108,8,12,4)
        lines(p,xs[5],y,note,435,9,12,5)
        p.draw_line((32,y+55),(W-32,y+55),color=(.85,.88,.9),width=.5)
    toc.append([1,f'Key witnesses {start+1}-{min(start+9,len(data["keys"]))}',len(doc)])

p=page('GRID CENTRE POSITIONS')
text(p,35,90,'Verified against drawn CAD grid centrelines within 0.1 mm; this is a transcription check, not site accuracy.',11)
for n,row in enumerate(data['grid']):
    axis,name,mm,m,ids,cell,note=row
    y=124+n*28
    text(p,35,y,f'{axis} / {name}',11)
    text(p,180,y,f'{mm:,.0f} mm',11)
    text(p,330,y,f'{m:,.3f} m',11)
    text(p,480,y,cell+' | '+str(ids),10)
toc.append([1,'Grid centre positions',len(doc)])

p=page('DRAWING VIEW INDEX')
for n,d in enumerate(data['drawings']):
    y=92+n*24
    text(p,35,y,d['id'],10)
    text(p,110,y,'sheet '+str(d['dwg_sheet'] or '-'),10)
    text(p,220,y,d['title_en'],10)
    text(p,900,y,str(d['dimension_objects'])+' dimensions',10)
toc.append([1,'Drawing view index',len(doc)])
doc.set_toc(toc)
target=DEST/'03_Key_Dimensions_and_Guide.pdf'
doc.set_metadata({'title':'Thach Bi CAD key dimensions and drawing guide','subject':'Design development; not for construction'})
doc.save(target,garbage=4,deflate=True)
for i,p in enumerate(doc):
    assert 'Not for construction' in p.get_text()
    p.get_pixmap(matrix=fitz.Matrix(1.2,1.2),alpha=False).save(DEST/'_qa'/f'dimensions-{i+1:02d}.png')
print(f'Saved {target.relative_to(ROOT)}: {len(doc)} pages, {len(data["keys"])} key witnesses.')
