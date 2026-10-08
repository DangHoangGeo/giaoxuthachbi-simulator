#!/usr/bin/env python3
"""Rebuild A3 review drawings from the actual default church model.

Usage: python3 scripts/build_review_drawings.py [--output output/pdf]
Requires Node.js and reportlab. No equipment, register or browser data is edited.
Fails before publication when model/JSON/register geometry disagrees.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import tempfile
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A3, landscape
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
except ImportError:
    raise SystemExit('Install the drawing dependency: python3 -m pip install -r scripts/requirements-drawings.txt')

INK = colors.HexColor('#203c38')
GREY = colors.HexColor('#64736f')
PALE = colors.HexColor('#e7eeeb')
RED = colors.HexColor('#953e2c')
W, H = landscape(A3)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def clean(value):
    # Standard PDF fonts and printable ASCII. The source JSON retains native labels.
    s = str(value).replace('→', ' > ').replace('·', ' / ').replace('×', ' x ')
    s = s.replace('−', '-').replace('–', '-').replace('—', '-').replace('′', "'").replace('đ', 'd').replace('Đ', 'D')
    return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()


def validate(data):
    if data.get('schema') != 1 or data.get('full', {}).get('units') != 'metres':
        raise ValueError('Unsupported snapshot schema or units')
    if not data.get('sourceFiles') or any(sha(ROOT / p) != digest for p, digest in data['sourceFiles'].items()):
        raise ValueError('Model source hashes do not match this snapshot; export again.')
    if data.get('registerSystemsHash') != sha(ROOT / 'docs/electrical-grid/electrical-systems.json'):
        raise ValueError('Snapshot systems hash is stale; export again.')
    saved = json.loads((ROOT / 'docs/electrical-grid/electrical-systems.json').read_text())
    if data['full'] != saved:
        raise ValueError('Fresh default model differs from electrical-systems.json. Refresh and review electrical exports and category registers first; see docs/electrical-grid/print-drawings.md.')
    manifest = json.loads((ROOT / 'docs/electrical-grid/categories/manifest.json').read_text())
    if manifest['systemsHash'] != sha(ROOT / 'docs/electrical-grid/electrical-systems.json') or manifest['layoutHash'] != sha(ROOT / 'docs/electrical-grid/equipment-layout.json'):
        raise ValueError('Category register manifest is stale. Refresh registers with the preservation workflow before printing.')
    for category in manifest['categories']:
        if sha(ROOT / 'docs/electrical-grid/categories' / category['file']) != category['sha256']:
            raise ValueError('Category workbook changed since register refresh: '+category['file'])
    full = data['full']
    routes = {r['id']: r for r in full['routes']}
    assert len(routes) == len(full['routes']), 'Duplicate route IDs'
    equipment = {c['id']: c for c in full['components'] if not c['hiddenAlternative']}
    assert len(equipment) == sum(not c['hiddenAlternative'] for c in full['components']), 'Duplicate equipment IDs'
    connected = set()
    for r in routes.values():
        assert r['source'] in full['sources'], 'Unknown source'
        assert len(r['points']) >= 2, 'Route needs two vertices'
        assert all(len(p) == 3 and all(math.isfinite(v) for v in p) for p in r['points']), 'Invalid coordinate'
        length = sum(math.dist(a, b) for a, b in zip(r['points'], r['points'][1:]))
        assert abs(length - r['length']) < 1e-6, f"Route length mismatch: {r['id']}"
        assert set(r['itemIds']) <= set(equipment), 'Unknown installed endpoint'
        connected.update(r['itemIds'])
    assert connected == set(equipment), 'Unconnected installed equipment'
    assert set().union(*(set(s['itemIds']) for s in data['sheets'])) == set(equipment), 'Incomplete drawing scopes'
    assert set().union(*(set(s['routeIds']) for s in data['sheets'])) == set(routes), 'Incomplete route scopes'
    return equipment, routes


class Drawings:
    def __init__(self, path, data):
        self.c = canvas.Canvas(str(path), pagesize=(W, H), pageCompression=1, invariant=1)
        self.c.setTitle('Thach Bi Church - Electrical review drawings')
        self.c.setAuthor('Thach Bi Church design-development model')
        self.data = data
        self.page = 0
        self.index = []
        self.route_ref = {r['id']: f'R{i+1:03}' for i, r in enumerate(data['full']['routes'])}
        self.equipment, self.routes = validate(data)
        points = [p for r in self.routes.values() for p in r['points']]
        points += [c['position'] for c in self.equipment.values()]
        self.bounds = [(min(p[d] for p in points)-1, max(p[d] for p in points)+1) for d in range(3)]
        # Include the entire grid, even when all equipment lies in a small region.
        self.bounds[0] = (min(-1, self.bounds[0][0]), max(54, self.bounds[0][1]))
        self.bounds[2] = (min(-14, self.bounds[2][0]), max(14, self.bounds[2][1]))
        self.plan_scale = self.scale_for(280, 147, (0, 2), 200)
        self.section_scale = self.scale_for(155, 64, (0, 1), 500)

    def text(self, x, y, s, size=8, color=INK, bold=False):
        self.c.setFillColor(color)
        self.c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
        self.c.drawString(x*mm, y*mm, clean(s))

    def wrap(self, x, y, s, width=90, size=8, leading=4):
        words = clean(s).split()
        lines, line = [], ''
        for word in words:
            trial = (line+' '+word).strip()
            if pdfmetrics.stringWidth(trial, 'Helvetica', size) > width*mm and line:
                lines.append(line); line = word
            else:
                line = trial
        if line: lines.append(line)
        for line in lines:
            self.text(x, y, line, size)
            y -= leading
        return y

    def start(self, code, title, subtitle):
        self.page += 1
        self.index.append({'page': self.page, 'sheet': code, 'title': title})
        self.c.bookmarkPage(code)
        self.c.addOutlineEntry(clean(code+' '+title), code, level=0)
        self.text(12, 283, 'THACH BI CHURCH', 11, bold=True)
        self.text(12, 272, title, 17, bold=True)
        self.text(12, 263, subtitle, 8, GREY)
        self.text(314, 283, code, 13, bold=True)
        self.text(314, 274, 'DESIGN DEVELOPMENT', 10, RED, True)
        self.text(314, 268, 'NOT FOR CONSTRUCTION', 9, RED, True)
        self.c.setStrokeColor(INK); self.c.setLineWidth(.6)
        self.c.line(12*mm, 257*mm, 408*mm, 257*mm)
        self.text(12, 12, f"Source commit {self.data['gitRevision'][:10]} + file hashes in manifest | Routing {self.data['full']['routingRevision']}", 7, GREY)
        self.text(12, 7, 'MODEL TRANSCRIPTION / DERIVED. Metres; displayed decimals are not survey accuracy. Review before installation.', 7, GREY)
        self.text(352, 12, f'A3 / sheet {self.page:02}', 8, bold=True)
        self.text(352, 7, 'Print 100% / no fit-to-page', 7, GREY)

    def end(self):
        self.c.showPage()

    def scale_for(self, width, height, axes, minimum):
        need = max((self.bounds[axes[0]][1]-self.bounds[axes[0]][0])*1000/width,
                   (self.bounds[axes[1]][1]-self.bounds[axes[1]][0])*1000/height, minimum)
        return next((n for n in [100, 125, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000] if n >= need), math.ceil(need/500)*500)

    def projection(self, x, y, axes, scale):
        return lambda p: ((x+(p[axes[0]]-self.bounds[axes[0]][0])*1000/scale)*mm,
                          (y+(p[axes[1]]-self.bounds[axes[1]][0])*1000/scale)*mm)

    def route_style(self, r):
        self.c.setStrokeColor(colors.HexColor(r['color']))
        self.c.setLineWidth(.9 if r['role']=='feeder' else .5)
        self.c.setDash([3, 2] if r['kind']=='audio' else [1, 2] if r['kind']=='mic' else [])

    def symbol(self, p, source=False):
        x, y = p
        self.c.setDash([]); self.c.setLineWidth(.65); self.c.setStrokeColor(INK); self.c.setFillColor(colors.white)
        if source: self.c.rect(x-1.2*mm, y-1.2*mm, 2.4*mm, 2.4*mm, fill=1)
        else: self.c.circle(x, y, .85*mm, fill=1)

    def plot(self, sheet, x, y, axes, scale, labels=False):
        project = self.projection(x, y, axes, scale)
        self.c.saveState()
        self.c.setStrokeColor(PALE); self.c.setLineWidth(.35); self.c.setDash([1, 2])
        for label, value in self.data['grid']['longitudinal'].items():
            a, b = [value, self.bounds[1][0], self.bounds[2][0]], [value, self.bounds[1][1], self.bounds[2][1]]
            self.c.line(*project(a), *project(b))
            if labels: self.text(project(a)[0]/mm-1, y-3, label, 6, GREY)
        if axes == (0, 2):
            for label, value in self.data['grid']['transverse'].items():
                a, b = [self.bounds[0][0], 0, value], [self.bounds[0][1], 0, value]
                self.c.line(*project(a), *project(b))
                if labels: self.text(x-4, project(a)[1]/mm-1, label, 6, GREY)
        else:
            for value in range(0, math.ceil(self.bounds[1][1]), 5):
                self.c.line(*project([self.bounds[0][0], value, 0]), *project([self.bounds[0][1], value, 0]))
                self.text(x-7, project([0, value, 0])[1]/mm, str(value), 6, GREY)
        for r in sheet['routes']:
            self.route_style(r)
            path=self.c.beginPath(); path.moveTo(*project(r['points'][0]))
            for p in r['points'][1:]: path.lineTo(*project(p))
            self.c.drawPath(path)
        self.c.setDash([])
        occupied=[]
        def label_at(p, label):
            px, py = p
            width = pdfmetrics.stringWidth(clean(label), 'Helvetica', 6.5)+2
            for dx,dy in [(3,3),(3,-9),(-width-3,3),(-width-3,-9),(3,11),(3,-17),(-width-3,11),(-width-3,-17)]+[(3,19+i*8) for i in range(12)]:
                box=(px+dx,py+dy-1,px+dx+width,py+dy+7)
                if not any(box[0]<b[2]+1 and box[2]>b[0]-1 and box[1]<b[3]+1 and box[3]>b[1]-1 for b in occupied): break
            occupied.append(box)
            self.c.setStrokeColor(GREY); self.c.setLineWidth(.25)
            self.c.line(px,py,box[0],box[1]+3)
            self.c.setFillColor(colors.white); self.c.rect(box[0],box[1],box[2]-box[0],8,fill=1,stroke=0)
            self.text(box[0]/mm,(box[1]+1)/mm,label,6.5)
        for component in sheet['components']:
            p=project(component['position']); self.symbol(p)
            if labels: label_at(p, component['id'])
        if labels:
            for r in sheet['routes']:
                if r['role'] in ['feeder','trunk']:
                    label_at(project(r['points'][len(r['points'])//2]), self.route_ref[r['id']])
        for sid, source in sheet['sources'].items():
            p=project(source['pos']); self.symbol(p, True)
            if labels: label_at(p, sid)
        self.c.restoreState()

    def scale_bar(self, x, y, scale, length=10):
        self.c.setStrokeColor(INK); self.c.setLineWidth(.8); self.c.setDash([])
        width=length*1000/scale
        self.c.line(x*mm, y*mm, (x+width)*mm,y*mm)
        for v in [0,length/2,length]:
            xx=x+v*1000/scale
            self.c.line(xx*mm,(y-1)*mm,xx*mm,(y+1)*mm)
            self.text(xx-1,y-4,f'{v:g}',7)
        self.text(x+width+4,y-1,'m',7)

    def cover(self):
        self.start('E-000','Electrical routes / printable review set','Default model export - circuit plans, heights, equipment coordinates and route index')
        self.text(15, 244, 'Read the plan, then trace the same ID in 3D', 14, bold=True)
        n=len(self.equipment); r=len(self.routes)
        self.wrap(15,232,f'{n} connected installed-study equipment / {r} unique routes / {len(self.data["sheets"])} drawing scopes. Hidden alternatives and non-electrical furniture are excluded. Shared feeders and trunks repeat as context on circuit sheets; quantities are owned once in the route index.',180,10,5)
        yy=201
        for title,body in [
            ('Print and measure','Use A3 landscape at 100%, with no fit-to-page. The line below must measure 100 mm. Plans and height projections have separate stated scales. Never scale from a resized copy.'),
            ('Coordinate basis','X: axis 1 toward sanctuary. Y: height above nave finished floor. Z: centre between D/E; negative toward B, positive toward H. Grid is a model transcription, not a measured floor plan or installation set-out.'),
            ('Route reading','Solid: power/feed. Dashed: loudspeaker audio. Dotted: microphone. Circle: equipment. Square: enclosure. Projection crossings are not junctions. Overlapping vertical paths require the route-vertex CSV and 3D review.'),
            ('Length basis','Route length = sum of 3D segment lengths. No spare, termination or installation allowances. Audio home run = branch plus its own upstream path; do not add shared bundle lengths again. This is not a conductor/cable take-off.'),
            ('Stop before physical work','Cable sizes, protection, supply/earthing/fault level, product data, supports, containment and fire stopping, control channels, life-safety functions and commissioning approval are pending. Do not drill timber or close concealed works from these sheets.')]:
            self.text(15,yy,title,10,bold=True); yy=self.wrap(15,yy-6,body,180,9,4.5)-8
        self.c.setStrokeColor(INK);self.c.line(15*mm,31*mm,115*mm,31*mm)
        self.c.line(15*mm,29*mm,15*mm,33*mm);self.c.line(115*mm,29*mm,115*mm,33*mm)
        self.text(15,25,'100 mm print calibration',8)
        self.text(220,244,'Sheet index / circuit lookup',12,bold=True)
        yy=233
        for i,s in enumerate(self.data['sheets']):
            label=s['label']
            self.text(220,yy,f'E-{i+1:03}   {label}',8)
            yy-=6
        self.wrap(220,yy-6,'After circuit sheets: equipment naming schedule, unique route index and the same nine-stage 3D coordination sequence. PDF bookmarks jump to each sheet.',178,9,4.5)
        self.wrap(220,yy-29,'Engineering baseline: feedback and wing speech clarity remain below targets; some seats miss the lighting brief. Fan performance, concealment, emergency design and installation access remain unverified. See docs/engineering/baseline.md and issues.md.',178,9,4.5)
        self.wrap(220,yy-56,'Companion files: drawing-index.json, model-snapshot.json, route-vertices.csv, equipment-coordinates.csv and manifest.json. Hashes bind this print set to its source files. Saved browser layouts are a different configuration.',178,9,4.5)
        self.end()

    def sheet(self, sheet, number):
        chunks=[sheet['components'][i:i+32] for i in range(0,len(sheet['components']),32)] or [[]]
        for part, components in enumerate(chunks):
            code=f'E-{number:03}'+(f'-{part+1}' if len(chunks)>1 else '')
            self.start(code,sheet['label'],f"Top plan 1:{self.plan_scale} / longitudinal height projection 1:{self.section_scale} at A3 / metres")
            self.text(17,248,'PLAN / X-Z / +X toward sanctuary >',9,bold=True)
            self.plot(sheet,18,105,(0,2),self.plan_scale,True)
            self.scale_bar(20,98,self.plan_scale)
            self.text(17,88,'HEIGHT PROJECTION / X-Y / all Z superimposed',8,bold=True)
            self.plot(sheet,22,24,(0,1),self.section_scale)
            self.scale_bar(22,21,self.section_scale)
            self.wrap(182,74,'PLAN CONTEXT: model grid only. Building outlines, support capacity and openings are not certified here. Lines crossing in projection do not establish a connection.',108,8,4)
            self.wrap(182,49,'Trace: equipment ID > branch in route index > shared trunk > feeder. Select that ID in Simulator / Wiring for vertices, height and related controls. Final terminals and control channels: pending.',108,8,4)
            self.text(310,248,'COORDINATES / X, Y, Z (m)',9,bold=True)
            y=239
            self.text(310,y,'ID',7,bold=True);self.text(330,y,'X',7,bold=True);self.text(349,y,'Y',7,bold=True);self.text(368,y,'Z',7,bold=True);self.text(389,y,'Branch',7,bold=True)
            for comp in components:
                y-=4.5
                self.text(310,y,comp['id'],7,bold=True)
                for x,v in zip([330,349,368],comp['position']):self.text(x,y,f'{v:.3f}',7)
                refs=[self.route_ref[r['id']] for r in sheet['routes'] if r['role'] in ['drop','local'] and comp['id'] in r['itemIds']]
                self.text(389,y,'/'.join(refs),6.5)
            y-=9
            self.text(310,y,'Related enclosures',8,bold=True)
            for sid,source in sheet['sources'].items():
                y-=5
                self.text(310,y,sid,7,bold=True)
                for x,v in zip([330,349,368],source['pos']):self.text(x,y,f'{v:.3f}',7)
            y-=10
            y=self.wrap(310,y,f"{len(sheet['components'])} equipment / {len(sheet['routes'])} routes including upstream context. Coordinates describe model reference points, not anchor or terminal locations.",92,8,4)
            self.wrap(310,y-6,'POWER / SIGNAL: solid / dashed / dotted. Circle: equipment. Square: enclosure. At overlaps, use the coordinate table and the CSV vertices, not a ruler.',92,8,4)
            self.end()

    def table_pages(self, code, title, columns, widths, rows, note, per_page=39):
        for i in range(0,len(rows),per_page):
            part=i//per_page+1
            self.start(f'{code}-{part:02}',title,note)
            x=14; y=247
            for col,w in zip(columns,widths):self.text(x,y,col,8,bold=True);x+=w
            for row in rows[i:i+per_page]:
                y-=5.5; x=14
                for val,w in zip(row,widths):
                    t=clean(val)
                    size=7
                    while pdfmetrics.stringWidth(t,'Helvetica',size)>(w-2)*mm and size>5.5:size-=.25
                    if pdfmetrics.stringWidth(t,'Helvetica',size)>(w-2)*mm:
                        raise ValueError(f'Table cell too wide: {val!r}; expand or wrap before printing')
                    self.text(x,y,t,size);x+=w
                self.c.setStrokeColor(PALE);self.c.setLineWidth(.3);self.c.line(14*mm,(y-1.8)*mm,406*mm,(y-1.8)*mm)
            self.end()

    def schedules(self):
        rows=[]
        for c in self.equipment.values():
            rows.append([c['id'],c['circuit'],c['board'],c['product'],c['name']])
        self.table_pages('EQ','Equipment naming schedule',['ID','Circuit','Board','Provisional category','Model equipment name'],[16,16,16,125,221],rows,'Installed-study items only / product ratings, dimensions and selected manufacturers remain pending')
        rows=[]
        for r in self.routes.values():
            dest=(','.join(r['itemIds']) if r['role'] in ['drop','local'] else 'Shared context')
            rows.append([self.route_ref[r['id']],r['id'],r['source'],r['circuit'],dest,f"{r['length']:.2f}",f"{r['length']+r.get('upstreamLength',0):.2f}" if r.get('homeRun') else '-'])
        self.table_pages('RI','Unique route index',['Ref','Stable route ID','From','Circuit/zone','Equipment / context','Drawn m','Audio home run m'],[17,115,20,36,125,29,52],rows,'Geometric centreline lengths only / no cable sizing or installation allowance / each route owned once')

    def sequence(self):
        for page in range(3):
            self.start(f'SQ-{page+1:02}','3D installation planning sequence','Same stage text as the local viewer / proposed coordination order / no work or approval recorded')
            y=243
            for step in self.data['steps'][page*3:page*3+3]:
                self.text(16,y,step['title'],13,bold=True)
                self.text(16,y-9,f"3D layer: {step['system']} / {step['mode']}",9,GREY)
                self.wrap(16,y-19,step['task'],175,10,5)
                self.text(215,y,'HOLD / responsible specialist release required',9,RED,True)
                self.wrap(215,y-9,step['hold'],181,10,5)
                y-=73
            self.end()

    def build(self):
        self.cover()
        for i,sheet in enumerate(self.data['sheets']):self.sheet(sheet,i+1)
        self.schedules();self.sequence();self.c.save()


def generate(output):
    output.mkdir(parents=True, exist_ok=True)
    # Validate in a temporary staging folder, preserving the previous delivered set on failure.
    with tempfile.TemporaryDirectory(prefix='thachbi-print-') as temp:
        stage=Path(temp)
        snapshot=stage/'model-snapshot.json'
        subprocess.run(['node',str(ROOT/'scripts/export_print_model.cjs'),str(snapshot)],cwd=ROOT,check=True)
        data=json.loads(snapshot.read_text())
        validate(data)
        pdf=stage/'thach-bi-electrical-review-A3.pdf'
        book=Drawings(pdf,data);book.build()
        (stage/'drawing-index.json').write_text(json.dumps(book.index,indent=2)+'\n')
        with (stage/'route-vertices.csv').open('w',newline='') as f:
            writer=csv.writer(f, lineterminator="\n");writer.writerow(['Route ID','Vertex (1-based)','X m','Y m','Z m'])
            for r in data['full']['routes']:
                for n,p in enumerate(r['points']):writer.writerow([r['id'],n+1,*p])
        with (stage/'equipment-coordinates.csv').open('w',newline='') as f:
            writer=csv.writer(f, lineterminator="\n");writer.writerow(['ID','Circuit','Board','X m','Y m','Z m','Provisional product category'])
            for c in book.equipment.values():writer.writerow([c['id'],c['circuit'],c['board'],*c['position'],c['product']])
        manifest={'schema':1,'status':'Design development - not for construction','basis':data['basis'],'gitRevision':data['gitRevision'],'sourceFiles':{**data['sourceFiles'],**{p:sha(ROOT/p) for p in ['scripts/build_review_drawings.py','scripts/export_print_model.cjs']}},'systemsHash':data['registerSystemsHash'],'counts':{'equipment':len(book.equipment),'routes':len(book.routes),'vertices':sum(len(r['points']) for r in book.routes.values()),'pages':book.page},'scales':{'plan':book.plan_scale,'height':book.section_scale},'files':{p.name:sha(p) for p in sorted(stage.iterdir())}}
        (stage/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        for p in stage.iterdir():
            # Replace only this builder's named outputs; keep unrelated user files.
            target=output/p.name
            pending=output/(p.name+'.tmp');pending.write_bytes(p.read_bytes());os.replace(pending,target)
    print(f'Created {book.page} A3 pages: {output / pdf.name}')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=ROOT/'output/pdf',help='Output directory (default: output/pdf)')
    args=parser.parse_args()
    generate(args.output.resolve())


if __name__=='__main__':main()
