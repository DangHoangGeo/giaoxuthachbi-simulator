#!/usr/bin/env python3
"""Rebuild A3 review drawings from the actual default church model.

Usage: python3 scripts/build_review_drawings.py [--language en|vi] [--output folder]
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
from review_drawings_i18n import (
    FONT_FILES, equipment_name, pdf_name, printable, product, register_fonts, text,
)

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
CUT = colors.HexColor('#9aa6a2')
W, H = landscape(A3)
RISER = .25  # metres of vertical travel that count as a riser/drop on plan


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def clean(value, language='en'):
    return printable(value, language)


def setout(value, axes):
    """Nearest grid axis and signed offset in metres, e.g. 5+1.20 or D-0.35. A midpoint uses the lower axis."""
    label, base = min(axes.items(), key=lambda kv: (round(abs(value-kv[1]), 6), kv[1]))
    offset = round(value-base, 2)
    return f"{label}{'-' if offset < 0 else '+'}{abs(offset):.2f}"


def height(value):
    return f"h{'-' if round(value, 2) < 0 else '+'}{abs(value):.2f}"


def setout_chain(points, grid):
    """Every route vertex as grid set-out; a vertical step repeats only its new height."""
    tokens, previous = [], None
    for p in points:
        if previous and math.dist((p[0], p[2]), (previous[0], previous[2])) < .005:
            tokens.append(height(p[1]))
        else:
            tokens.append(f"{setout(p[0], grid['longitudinal'])}/{setout(p[2], grid['transverse'])} {height(p[1])}")
        previous = p
    return tokens


def risers(points):
    """Plan position and height range of each vertical run in a route."""
    return [(a[0], a[2], min(a[1], b[1]), max(a[1], b[1])) for a, b in zip(points, points[1:])
            if abs(a[1]-b[1]) >= RISER and math.dist((a[0], a[2]), (b[0], b[2])) < .01]


def tower_zones(spec):
    """Front-face arch envelopes from the traced CAD tower spec, as (|Z| min, |Z| max, Y min, Y max)."""
    zones = [('ground arch', spec['centre']-max(spec['arch']['rings']), spec['centre']+max(spec['arch']['rings']),
              0.0, spec['arch']['spring']+max(spec['arch']['rings']))]
    for stage in spec['upperFront']:
        r = max(stage['great']['rings'])
        zones.append((f"stage {stage['stage']} arch", stage['centre']-r, stage['centre']+r, stage['sill'], stage['great']['y']+r))
    return zones


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
    sections = data.get('sections') or {}
    for key in ('plan', 'towerFront'):
        segments = sections.get(key, {}).get('segments') or []
        assert len(segments) > 100, f'Missing building section: {key}'
        assert all(len(s) == 2 and all(len(p) == 2 and all(math.isfinite(v) for v in p) for p in s) for s in segments), f'Invalid section segment: {key}'
    assert data.get('towers') and data['towers'].get('upperFront'), 'Missing tower decoration spec'
    return equipment, routes


class Drawings:
    def __init__(self, path, data, language='en'):
        self.language = language
        self.font, self.bold_font = register_fonts(language)
        self.c = canvas.Canvas(str(path), pagesize=(W, H), pageCompression=1, invariant=1)
        self.c.setTitle(self.t('Thach Bi Church - Electrical review drawings'))
        self.c.setAuthor(self.t('Thach Bi Church design-development model'))
        if language == 'vi':self.c.setSubject('language=vi')
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
        self.grid = data['grid']
        # Installation notes are repeated per route in the model; print each once and cite its code.
        self.install_ref = {text: f'I{i+1:02}' for i, text in enumerate(sorted({r['installation'] for r in self.routes.values()}))}
        self.forms = set()

    def t(self, value, **fields):
        return text(value, self.language, **fields)

    def clean(self, value):
        value = clean(value, self.language)
        if self.language == 'vi':
            for name in (self.font, self.bold_font):
                glyphs = pdfmetrics.getFont(name).face.charToGlyph
                missing = sorted({c for c in value if not glyphs.get(ord(c))})
                if missing:
                    raise ValueError(f'Vietnamese font {name} has no glyphs for {missing!r}')
        return value

    def text(self, x, y, s, size=8, color=INK, bold=False):
        self.c.setFillColor(color)
        self.c.setFont(self.bold_font if bold else self.font, size)
        self.c.drawString(x*mm, y*mm, self.clean(s))

    def wrap(self, x, y, s, width=90, size=8, leading=4):
        words = self.clean(s).split()
        lines, line = [], ''
        for word in words:
            trial = (line+' '+word).strip()
            if pdfmetrics.stringWidth(trial, self.font, size) > width*mm and line:
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
        self.c.addOutlineEntry(self.clean(code+' '+title), code, level=0)
        self.text(12, 283, self.t('THACH BI CHURCH'), 11, bold=True)
        self.text(12, 272, title, 17, bold=True)
        self.text(12, 263, subtitle, 8, GREY)
        self.text(314, 283, code, 13, bold=True)
        self.text(314, 274, self.t('DESIGN DEVELOPMENT'), 10, RED, True)
        self.text(314, 268, self.t('NOT FOR CONSTRUCTION'), 9, RED, True)
        self.c.setStrokeColor(INK); self.c.setLineWidth(.6)
        self.c.line(12*mm, 257*mm, 408*mm, 257*mm)
        self.text(12, 12, self.t('Source commit {commit} + file hashes in manifest | Routing {routing}', commit=self.data['gitRevision'][:10], routing=self.data['full']['routingRevision']), 7, GREY)
        self.text(12, 7, self.t('MODEL TRANSCRIPTION / DERIVED. Metres; displayed decimals are not survey accuracy. Review before installation.'), 7, GREY)
        self.text(352, 12, self.t('A3 / sheet {page:02}', page=self.page), 8, bold=True)
        self.text(352, 7, self.t('Print 100% / no fit-to-page'), 7, GREY)

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

    def building(self, key, segments, project):
        """Model section drawn once as a PDF form and reused on every sheet at the same scale."""
        if key not in self.forms:
            self.c.beginForm(key)
            self.c.setStrokeColor(CUT); self.c.setLineWidth(.3); self.c.setDash([])
            for a, b in segments:
                self.c.line(*project(a), *project(b))
            self.c.endForm()
            self.forms.add(key)
        self.c.doForm(key)

    def riser_mark(self, p, color):
        x, y = p
        path = self.c.beginPath(); path.moveTo(x, y+1.1*mm); path.lineTo(x-.95*mm, y-.6*mm); path.lineTo(x+.95*mm, y-.6*mm); path.close()
        self.c.setDash([]); self.c.setLineWidth(.4); self.c.setStrokeColor(INK); self.c.setFillColor(colors.HexColor(color))
        self.c.drawPath(path, fill=1, stroke=1)

    def plot(self, sheet, x, y, axes, scale, labels=False):
        project = self.projection(x, y, axes, scale)
        self.c.saveState()
        if axes == (0, 2):
            self.building(f'plan-cut-{x}-{y}-{scale}', self.data['sections']['plan']['segments'], lambda p: project([p[0], 0, p[1]]))
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
        if axes == (0, 2):
            marks = {}
            for r in sheet['routes']:
                for rx, rz, _, _ in risers(r['points']):
                    marks.setdefault((round(rx, 2), round(rz, 2)), r['color'])
            for (rx, rz), color in sorted(marks.items()):
                self.riser_mark(project([rx, 0, rz]), color)
        occupied=[]
        def label_at(p, label):
            px, py = p
            width = pdfmetrics.stringWidth(self.clean(label), self.font, 6.5)+2
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
        self.start('E-000',self.t('Electrical routes / printable review set'),self.t('Default model export - circuit plans, heights, equipment coordinates and route index'))
        self.text(15, 244, self.t('Read the plan, then trace the same ID in 3D'), 14, bold=True)
        n=len(self.equipment); r=len(self.routes)
        self.wrap(15,232,self.t('{equipment} connected installed-study equipment / {routes} unique routes / {scopes} drawing scopes. Hidden alternatives and non-electrical furniture are excluded. Shared feeders and trunks repeat as context on circuit sheets; quantities are owned once in the route index.', equipment=n, routes=r, scopes=len(self.data['sheets'])),180,10,5)
        yy=201
        for title,body in [
            ('Print and measure','Use A3 landscape at 100%, with no fit-to-page. The line below must measure 100 mm. Plans and height projections have separate stated scales. Never scale from a resized copy.'),
            ('Coordinate basis','X: axis 1 toward sanctuary. Y: height above nave finished floor. Z: centre between D/E; negative toward B, positive toward H. Grid is a model transcription, not a measured floor plan or installation set-out.'),
            ('Setting out from the grid','Each equipment point and route vertex is also given from its nearest grid axis: 5+1.20/D-0.35 h+2.40 = 1.20 m past axis 5 toward the sanctuary, 0.35 m from axis D toward B, 2.40 m above nave floor +0.000. On the dais (+0.80) or side floors (+0.16), subtract the local floor level. Check the axes on site first.'),
            ('Route reading','Solid: power/feed. Dashed: loudspeaker audio. Dotted: microphone. Circle: equipment. Square: enclosure. Projection crossings are not junctions. Overlapping vertical paths require the route-vertex CSV and 3D review.'),
            ('Length basis','Route length = sum of 3D segment lengths. No spare, termination or installation allowances. Audio home run = branch plus its own upstream path; do not add shared bundle lengths again. This is not a conductor/cable take-off.'),
            ('Stop before physical work','Cable sizes, protection, supply/earthing/fault level, product data, supports, containment and fire stopping, control channels, life-safety functions and commissioning approval are pending. Do not drill timber or close concealed works from these sheets.')]:
            self.text(15,yy,self.t(title),10,bold=True); yy=self.wrap(15,yy-6,self.t(body),180,9,4.5)-8
        self.c.setStrokeColor(INK);self.c.line(15*mm,31*mm,115*mm,31*mm)
        self.c.line(15*mm,29*mm,15*mm,33*mm);self.c.line(115*mm,29*mm,115*mm,33*mm)
        self.text(15,25,self.t('100 mm print calibration'),8)
        self.text(220,244,self.t('Sheet index / circuit lookup'),12,bold=True)
        yy=233
        for i,s in enumerate(self.data['sheets']):
            label=self.t(s['label'])
            self.text(220,yy,f'E-{i+1:03}   {label}',8)
            yy-=5
        yy=self.wrap(220,yy-4,self.t('After circuit sheets: TW-01 tower fronts with riser clearances, equipment naming schedule (EQ), unique route index (RI), installation note key (IM), route set-out schedule (RS) and the same nine-stage 3D coordination sequence (SQ). PDF bookmarks jump to each sheet.'),178,8.5,4.2)
        yy=self.wrap(220,yy-3,self.t('Engineering baseline: feedback and wing speech clarity remain below targets; some seats miss the lighting brief. Fan performance, concealment, emergency design and installation access remain unverified. See docs/engineering/baseline.md and issues.md.'),178,8.5,4.2)
        self.wrap(220,yy-3,self.t('Companion files: drawing-index.json, model-snapshot.json, route-vertices.csv, equipment-coordinates.csv and manifest.json. Hashes bind this print set to its source files. Saved browser layouts are a different configuration.'),178,8.5,4.2)
        self.end()

    def sheet(self, sheet, number):
        chunks=[sheet['components'][i:i+32] for i in range(0,len(sheet['components']),32)] or [[]]
        for part, components in enumerate(chunks):
            code=f'E-{number:03}'+(f'-{part+1}' if len(chunks)>1 else '')
            self.start(code,self.t(sheet['label']),self.t('Top plan 1:{plan} / longitudinal height projection 1:{height} at A3 / metres', plan=self.plan_scale, height=self.section_scale))
            self.text(17,248,self.t('PLAN / X-Z / +X toward sanctuary >'),9,bold=True)
            self.plot(sheet,18,105,(0,2),self.plan_scale,True)
            self.scale_bar(20,98,self.plan_scale)
            self.text(21,88,self.t('HEIGHT PROJECTION / X-Y / all Z superimposed'),8,bold=True)
            self.plot(sheet,22,24,(0,1),self.section_scale)
            self.scale_bar(22,21,self.section_scale)
            yy=self.wrap(182,86,self.t('PLAN CONTEXT: grey lines are a cut through the model walls, piers and columns at +1.00 m, for orientation. They are not a measured survey; support capacity and openings are not certified here. Lines crossing in projection do not establish a connection.'),108,7.5,3.7)
            yy=self.wrap(182,yy-2.5,self.t('Triangle: vertical run (riser or drop) in a wall, pier or column. Its heights are in the route set-out sheets (RS).'),108,7.5,3.7)
            yy=self.wrap(182,yy-2.5,self.t('Trace: equipment ID > branch in route index > shared trunk > feeder. Select that ID in Simulator / Wiring for vertices, height and related controls. Final terminals and control channels: pending.'),108,7.5,3.7)
            codes=sorted({self.install_ref[r['installation']] for r in sheet['routes']})
            self.wrap(182,yy-2.5,self.t('Installation notes on this sheet: {codes} (key on sheet IM-01).', codes=', '.join(codes)),108,7.5,3.7)
            self.text(310,248,self.t('COORDINATES / X, Y, Z (m)'),9,bold=True)
            y=239
            items=[c['id'] for c in components]+list(sheet['sources'])
            idw=max([pdfmetrics.stringWidth(self.clean(i),self.bold_font,6.5) for i in items]+[30])/mm+2
            cols=[310,310+idw,322+idw,334+idw,347+idw]
            branch=min(408-13,cols[4]+30)
            heads=[self.t('ID'),'X','Y','Z',self.t('Grid set-out')]
            for x,head in zip(cols,heads):self.text(x,y,head,6.5,bold=True)
            self.text(branch,y,self.t('Branch'),6.5,bold=True)
            def row(y,ident,pos):
                self.text(cols[0],y,ident,6.5,bold=True)
                for x,v in zip(cols[1:4],pos):self.text(x,y,f'{v:.3f}',6.5)
                self.fit(cols[4],y,f"{setout(pos[0],self.grid['longitudinal'])}/{setout(pos[2],self.grid['transverse'])}",branch-cols[4]-1,6.5)
            for comp in components:
                y-=4.5
                row(y,comp['id'],comp['position'])
                refs=[self.route_ref[r['id']] for r in sheet['routes'] if r['role'] in ['drop','local'] and comp['id'] in r['itemIds']]
                self.fit(branch,y,'/'.join(refs),408-branch,6.5)
            y-=9
            self.text(310,y,self.t('Related enclosures'),8,bold=True)
            for sid,source in sheet['sources'].items():
                y-=5
                row(y,sid,source['pos'])
            y-=10
            y=self.wrap(310,y,self.t('{equipment} equipment / {routes} routes including upstream context. Coordinates describe model reference points, not anchor or terminal locations.', equipment=len(sheet['components']), routes=len(sheet['routes'])),92,7.5,3.7)
            y=self.wrap(310,y-2.5,self.t('Grid set-out: nearest axis and offset in metres. 5+1.20 = 1.20 m past axis 5 toward the sanctuary; D-0.35 = 0.35 m from axis D toward B. Height h is above nave floor +0.000.'),92,7.5,3.7)
            self.wrap(310,y-2.5,self.t('POWER / SIGNAL: solid / dashed / dotted. Circle: equipment. Square: enclosure. At overlaps, use the coordinate table and the CSV vertices, not a ruler.'),92,7.5,3.7)
            self.end()

    def fit(self, x, y, s, width, size):
        """Single-line cell: shrink to the 5.5 pt floor, never overflow into the next column."""
        s=self.clean(s)
        while pdfmetrics.stringWidth(s,self.font,size)>width*mm and size>5.5:size-=.25
        if pdfmetrics.stringWidth(s,self.font,size)>width*mm:
            raise ValueError(f'Cell too wide: {s!r}; widen the column before printing')
        self.text(x,y,s,size)

    def table_pages(self, code, title, columns, widths, rows, note, per_page=39):
        for i in range(0,len(rows),per_page):
            part=i//per_page+1
            self.start(f'{code}-{part:02}',title,note)
            x=14; y=247
            for col,w in zip(columns,widths):self.text(x,y,col,8,bold=True);x+=w
            for row in rows[i:i+per_page]:
                y-=5.5; x=14
                for val,w in zip(row,widths):
                    t=self.clean(val)
                    size=7
                    while pdfmetrics.stringWidth(t,self.font,size)>(w-2)*mm and size>5.5:size-=.25
                    if pdfmetrics.stringWidth(t,self.font,size)>(w-2)*mm:
                        raise ValueError(f'Table cell too wide: {val!r}; expand or wrap before printing')
                    self.text(x,y,t,size);x+=w
                self.c.setStrokeColor(PALE);self.c.setLineWidth(.3);self.c.line(14*mm,(y-1.8)*mm,406*mm,(y-1.8)*mm)
            self.end()

    def schedules(self):
        rows=[]
        for c in self.equipment.values():
            rows.append([c['id'],c['circuit'],c['board'],product(c['product'],self.language),equipment_name(c['name'],self.language)])
        self.table_pages('EQ',self.t('Equipment naming schedule'),[self.t(s) for s in ['ID','Circuit','Board','Provisional category','Model equipment name']],[34,16,16,118,210],rows,self.t('Installed-study items only / product ratings, dimensions and selected manufacturers remain pending'))
        rows=[]
        for r in self.routes.values():
            dest=(','.join(r['itemIds']) if r['role'] in ['drop','local'] else self.t('Shared context'))
            rows.append([self.route_ref[r['id']],r['id'],r['source'],r['circuit'],dest,f"{r['length']:.2f}",f"{r['length']+r.get('upstreamLength',0):.2f}" if r.get('homeRun') else '-'])
        self.table_pages('RI',self.t('Unique route index'),[self.t(s) for s in ['Ref','Stable route ID','From','Circuit/zone','Equipment / context','Drawn m','Audio home run m']],[17,115,20,36,125,29,52],rows,self.t('Geometric centreline lengths only / no cable sizing or installation allowance / each route owned once'))

    def tower_sheet(self):
        """Tower fronts at the conduit plane with the tower routes projected on Z-Y."""
        spec=self.data['towers']; cut=self.data['sections']['towerFront']
        scale=150; y0,y1=-0.6,30.4; half=3.6
        tower_routes=[r for r in self.routes.values() if any(p[0]<5.3 and abs(p[2])>6.3 for p in r['points'])]
        tower_items=[c for c in self.equipment.values() if c['position'][0]<5.3 and abs(c['position'][2])>6.3]
        sources={k:s for k,s in self.data['full']['sources'].items() if s['pos'][0]<5.3 and abs(s['pos'][2])>6.3}
        self.start('TW-01',self.t('Tower fronts / conduit risers and decoration clearances'),self.t('Front cut at X = +{plane} m (conduit plane) 1:{scale} at A3 / tower routes projected on Z-Y / metres', plane=f"{cut['plane']:.2f}", scale=scale))
        self.c.saveState()
        for n,(side,sign) in enumerate([('B',-1),('H',1)]):
            px=22+n*62
            zc=sign*spec['centre']; zmin=zc-half
            project=lambda p,px=px,zmin=zmin:((px+(p[0]-zmin)*1000/scale)*mm,(30+(p[1]-y0)*1000/scale)*mm)
            self.text(px,248,self.t('Tower {side} / seen from the courtyard', side=side),8,bold=True)
            p=self.c.beginPath(); p.rect(px*mm,30*mm,2*half*1000/scale*mm,(y1-y0)*1000/scale*mm); self.c.clipPath(p,stroke=0)
            self.building(f'tower-{side}',[s for s in cut['segments'] if abs(s[0][0]-zc)<half+1],project)
            self.c.setStrokeColor(PALE); self.c.setLineWidth(.35); self.c.setDash([1,2])
            for level in [0]+self.grid['levels']['tower']:
                self.c.line(*project([zmin,level]),*project([zmin+2*half,level]))
            for r in tower_routes:
                self.route_style(r)
                for a,b in zip(r['points'],r['points'][1:]):
                    if max(a[0],b[0])<5.3 and min(abs(a[2]),abs(b[2]))>6.3 and a[2]*sign>0:
                        self.c.line(*project([a[2],a[1]]),*project([b[2],b[1]]))
            self.c.setDash([])
            marks=[(c['id'],c['position'],False) for c in tower_items]+[(k,s['pos'],True) for k,s in sources.items()]
            marks=[(k,project([p[2],p[1]]),box) for k,p,box in marks if p[2]*sign>0]
            for _,p,box in marks:self.symbol(p,box)
            self.c.restoreState(); self.c.saveState()
            occupied=[]
            for k,p,_ in sorted(marks,key=lambda m:(-m[1][1],m[1][0])):self.place_label(p,k,occupied,5.5)
            for level in [0]+self.grid['levels']['tower']:
                self.text(px+2*half*1000/scale+1,(30+(level-y0)*1000/scale)-1,f'{level:+.3f}',6)
            self.text(px,25,self.t('{side} side: Z {a} to {b}', side=side, a=f'{zmin:.2f}', b=f'{zmin+2*half:.2f}'),6.5,GREY)
        self.c.restoreState()
        self.scale_bar(22,19,scale,5)
        # Risers in the tower front zone: shared runs grouped once, with clearance to the traced arch envelopes.
        zones=tower_zones(spec); groups={}
        for r in tower_routes:
            for rx,rz,ya,yb in risers(r['points']):
                if rx<1.0 and abs(rz)>6.3:groups.setdefault((round(rz,2),round(ya,2),round(yb,2),round(rx,2)),[]).append(self.route_ref[r['id']])
        x0=150; y=248
        self.text(x0,y,self.t('RISERS IN THE TOWER FRONT WALL'),9,bold=True); y-=8
        cols=[x0,x0+12,x0+40,x0+66,x0+96,x0+128]
        for x,head in zip(cols,[self.t(s) for s in ['Tower','Grid set-out','From h','To h','Clear of arch','Routes']]):self.text(x,y,head,6.5,bold=True)
        for (rz,ya,yb,rx),refs in sorted(groups.items(),key=lambda kv:(kv[0][0]>0,abs(kv[0][0]),kv[0][1])):
            y-=4.5
            gaps=[max(abs(rz)-zmax,zmin-abs(rz)) if not zmin<abs(rz)<zmax else -min(abs(rz)-zmin,zmax-abs(rz))
                  for _,zmin,zmax,za,zb in zones if ya<zb and yb>za]
            if y<30:raise ValueError('Tower riser table overflows its sheet; paginate before printing')
            clear=min(gaps) if gaps else None
            # Board risers run on the room face of the closed front wall, not through the outer arch.
            board=any(math.dist((rx,rz),(s['pos'][0],s['pos'][2]))<.05 for s in sources.values())
            self.text(cols[0],y,'B' if rz<0 else 'H',6.5,bold=True)
            self.text(cols[1],y,f"{setout(rx,self.grid['longitudinal'])}/{setout(rz,self.grid['transverse'])}",6.5)
            self.text(cols[2],y,height(ya),6.5); self.text(cols[3],y,height(yb),6.5)
            if board:self.text(cols[4],y,self.t('board, room face'),6.5)
            else:self.text(cols[4],y,'-' if clear is None else f'{clear:.2f} m',6.5,RED if clear is not None and clear<.05 else INK,clear is not None and clear<.05)
            self.fit(cols[5],y,f"{len(refs)}: "+'/'.join(sorted(set(refs))[:6])+(' ...' if len(set(refs))>6 else ''),408-cols[5],6.5)
        y-=8
        for note in [
            'Clear of arch: horizontal distance from the riser to the nearest traced arch envelope (outer moulding ring of the ground or stage arch) over the same height. Negative means inside the arch; louvres, roses and paired openings all lie inside these envelopes.',
            'CAD basis (DWG 23 Oct 2026): the tower drawings dimension only the levels -2.080 / +0.000 / +8.390 / +15.840 / +23.140 / +29.090 / +36.920, the 4.900 m tower width and the 5.830 x 4.130 m plan at +15.84. Arch, louvre and rose centres and radii are traced from drawn lines (E01B, E02), not dimensioned. The DWG has no text for decoration sizes, materials or electrical items.',
            'B / H: the sheet follows model axes (B left, H right seen from the courtyard). The CAD sheets draw H on the left (ENG-027 open). Name towers by grid letter, never left or right.',
            'Keep risers in the solid corner piers. Never chase through louvres, roses or arch mouldings. Wall thickness, pier core, reinforcement and chase depth are on ENGINEERING HOLD; confirm on site before cutting.']:
            y=self.wrap(x0,y,self.t(note),255,7.5,3.7)-2.5
        self.end()

    def place_label(self, p, label, occupied, size):
        px,py=p
        width=pdfmetrics.stringWidth(self.clean(label),self.font,size)+2
        for dx,dy in [(3,2),(-width-3,2),(3,-7),(-width-3,-7),(3,9),(-width-3,9),(3,-14),(-width-3,-14)]+[(3,16+i*7) for i in range(8)]:
            box=(px+dx,py+dy-1,px+dx+width,py+dy+6)
            if not any(box[0]<b[2]+1 and box[2]>b[0]-1 and box[1]<b[3]+1 and box[3]>b[1]-1 for b in occupied):break
        occupied.append(box)
        self.c.setStrokeColor(GREY);self.c.setLineWidth(.25);self.c.line(px,py,box[0],box[1]+2.5)
        self.c.setFillColor(colors.white);self.c.rect(box[0],box[1],box[2]-box[0],7,fill=1,stroke=0)
        self.text(box[0]/mm,(box[1]+1)/mm,label,size)

    def install_key(self):
        rows=sorted(self.install_ref.items(),key=lambda kv:kv[1])
        count={code:sum(r['installation']==text for r in self.routes.values()) for text,code in rows}
        self.start('IM-01',self.t('Installation note key'),self.t('One note per distinct model installation method / proposals, not approved installation details'))
        y=247
        self.text(14,y,self.t('Code'),8,bold=True);self.text(30,y,self.t('Routes'),8,bold=True);self.text(48,y,self.t('Model installation note'),8,bold=True)
        y-=6
        for text,code in rows:
            self.text(14,y,code,7.5,bold=True);self.text(30,y,str(count[code]),7.5)
            y=self.wrap(48,y,self.t(text),355,7.5,3.6)-2
            self.c.setStrokeColor(PALE);self.c.setLineWidth(.3);self.c.line(14*mm,(y+1)*mm,406*mm,(y+1)*mm)
            y-=2.5
            if y<24:raise ValueError('Installation key overflows one sheet; paginate before printing')
        self.end()

    def setout_pages(self):
        """Every route once, in route-index order, with each vertex as grid set-out and height."""
        cols=[14,28,68,80,104]; chain_w=406-cols[4]; size=6.5; lead=3.4
        lines=[]
        for r in self.routes.values():
            what=','.join(r['itemIds']) if r['role'] in ['drop','local'] else self.t('Shared context')+' '+r['circuit']
            tokens=setout_chain(r['points'],self.grid); rows=[]; line=''
            for t in tokens:
                trial=(line+' > '+t) if line else t
                if pdfmetrics.stringWidth(trial,self.font,size)>chain_w*mm and line:rows.append(line+' >');line=t
                else:line=trial
            rows.append(line)
            lines.append((r,what,rows))
        part=0; i=0
        while i<len(lines):
            part+=1
            self.start(f'RS-{part:02}',self.t('Route set-out schedule'),self.t('Each route once / vertices in order from the board / grid axis + offset (m) / h = height above nave floor +0.000'))
            y=247
            for x,head in zip(cols,[self.t(s) for s in ['Ref','Equipment / context','Note','Drawn m','Vertex set-out from the source end']]):self.text(x,y,head,7,bold=True)
            y-=5
            while i<len(lines) and y-len(lines[i][2])*lead>20:
                r,what,rows=lines[i]
                self.text(cols[0],y,self.route_ref[r['id']],size,bold=True)
                self.fit(cols[1],y,what,cols[2]-cols[1]-1,size)
                self.text(cols[2],y,self.install_ref[r['installation']],size)
                self.text(cols[3],y,f"{r['length']:.2f}",size)
                for n,row in enumerate(rows):self.text(cols[4],y-n*lead,row,size)
                y-=len(rows)*lead+1.2
                self.c.setStrokeColor(PALE);self.c.setLineWidth(.25);self.c.line(14*mm,(y+2.2)*mm,406*mm,(y+2.2)*mm)
                i+=1
            self.end()

    def sequence(self):
        for page in range(3):
            self.start(f'SQ-{page+1:02}',self.t('3D installation planning sequence'),self.t('Same stage text as the local viewer / proposed coordination order / no work or approval recorded'))
            y=243
            for step in self.data['steps'][page*3:page*3+3]:
                self.text(16,y,self.t(step['title']),13,bold=True)
                self.text(16,y-9,self.t('3D layer: {system} / {mode}', system=self.t(step['system']), mode=self.t(step['mode'])),9,GREY)
                self.wrap(16,y-19,self.t(step['task']),175,10,5)
                self.text(215,y,self.t('HOLD / responsible specialist release required'),9,RED,True)
                self.wrap(215,y-9,self.t(step['hold']),181,10,5)
                y-=73
            self.end()

    def build(self):
        self.cover()
        for i,sheet in enumerate(self.data['sheets']):self.sheet(sheet,i+1)
        self.tower_sheet();self.schedules();self.install_key();self.setout_pages();self.sequence();self.c.save()


def generate(output, language='en'):
    if language not in ('en','vi'):
        raise ValueError('Unsupported drawing language')
    previous = output / 'manifest.json'
    other_pdf = output / pdf_name('vi' if language == 'en' else 'en')
    if other_pdf.exists() or (previous.exists() and json.loads(previous.read_text()).get('language','en') != language):
        raise ValueError('Output folder contains the other language; choose a separate folder.')
    output.mkdir(parents=True, exist_ok=True)
    # Validate in a temporary staging folder, preserving the previous delivered set on failure.
    with tempfile.TemporaryDirectory(prefix='thachbi-print-') as temp:
        stage=Path(temp)
        snapshot=stage/'model-snapshot.json'
        subprocess.run(['node',str(ROOT/'scripts/export_print_model.cjs'),str(snapshot)],cwd=ROOT,check=True)
        data=json.loads(snapshot.read_text())
        validate(data)
        pdf=stage/pdf_name(language)
        book=Drawings(pdf,data,language);book.build()
        (stage/'drawing-index.json').write_text(json.dumps(book.index,indent=2)+'\n')
        with (stage/'route-vertices.csv').open('w',newline='') as f:
            writer=csv.writer(f, lineterminator="\n");writer.writerow(['Route ID','Vertex (1-based)','X m','Y m','Z m'])
            for r in data['full']['routes']:
                for n,p in enumerate(r['points']):writer.writerow([r['id'],n+1,*p])
        with (stage/'equipment-coordinates.csv').open('w',newline='') as f:
            writer=csv.writer(f, lineterminator="\n");writer.writerow(['ID','Circuit','Board','X m','Y m','Z m','Provisional product category'])
            for c in book.equipment.values():writer.writerow([c['id'],c['circuit'],c['board'],*c['position'],c['product']])
        dependencies=['scripts/build_review_drawings.py','scripts/export_print_model.cjs','scripts/review_drawings_i18n.py']
        if language == 'vi':dependencies += ['scripts/fonts/'+name for name in FONT_FILES]
        manifest={'schema':1,'language':language,'status':'Design development - not for construction','basis':data['basis'],'gitRevision':data['gitRevision'],'sourceFiles':{**data['sourceFiles'],**{p:sha(ROOT/p) for p in dependencies}},'systemsHash':data['registerSystemsHash'],'counts':{'equipment':len(book.equipment),'routes':len(book.routes),'vertices':sum(len(r['points']) for r in book.routes.values()),'pages':book.page,'planSectionSegments':len(data['sections']['plan']['segments']),'towerSectionSegments':len(data['sections']['towerFront']['segments'])},'sectionBasis':data['sections']['basis'],'scales':{'plan':book.plan_scale,'height':book.section_scale},'files':{p.name:sha(p) for p in sorted(stage.iterdir())}}
        (stage/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
        for p in stage.iterdir():
            # Replace only this builder's named outputs; keep unrelated user files.
            target=output/p.name
            pending=output/(p.name+'.tmp');pending.write_bytes(p.read_bytes());os.replace(pending,target)
    print(f'Created {book.page} A3 pages: {output / pdf.name}')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--language',choices=['en','vi'],default='en',help='Drawing language (default: en)')
    parser.add_argument('--output',type=Path,help='Output directory (default: output/pdf for en; output/pdf-vi for vi)')
    args=parser.parse_args()
    output=args.output or ROOT/('output/pdf-vi' if args.language=='vi' else 'output/pdf')
    generate(output.resolve(),args.language)


if __name__=='__main__':main()
