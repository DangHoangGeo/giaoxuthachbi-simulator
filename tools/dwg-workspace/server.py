#!/usr/bin/env python3
"""Local-only CAD review. Uploaded files never leave this machine."""
import hashlib
import json
import math
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

import ezdxf
from ezdxf import bbox
from ezdxf.addons.drawing import Frontend, RenderContext, layout
from ezdxf.addons.drawing.config import BackgroundPolicy, ColorPolicy, Configuration
from ezdxf.addons.drawing.svg import SVGBackend, SVGRenderBackend
from ezdxf.math import BoundingBox2d

ROOT = Path(__file__).resolve().parents[2]
from drawing_inventory import DRAWINGS

HERE = Path(__file__).resolve().parent
LIMIT = 64 * 1024 * 1024
SOURCE_HASH = '2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae'
# Enlarged tower-ornament crops share the export spec of the 23102026 PDF volume 11.
TOWER_DETAILS = json.loads((ROOT / 'docs/layout_design/dwg-2026-10-23/tower-details-23102026.json').read_text())['chi_tiet']
CONFIG = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK, min_lineweight=.08)

class EntitySVG(SVGRenderBackend):
    def add_strokes(self, d, properties):
        before = len(self.entities)
        super().add_strokes(d, properties)
        if len(self.entities) > before:
            self.entities[-1].set('data-handle', properties.handle)
    def add_filling(self, d, properties):
        before = len(self.entities)
        super().add_filling(d, properties)
        if len(self.entities) > before:
            self.entities[-1].set('data-handle', properties.handle)

class DrawingSVG(SVGBackend):
    @staticmethod
    def make_backend(page, settings):
        return EntitySVG(page, settings)

class Workspace:
    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='thachbi-dwg-')
        self.doc = None
        self.boxes = []
        self.sheets = []
        self.name = ''
        self.revision = None
        self.lock = threading.Lock()
    def load(self, data, name):
        # Build a candidate first; failed replacements leave the current drawing intact.
        ext = Path(name).suffix.lower()
        if ext not in ('.dwg', '.dxf'):
            raise ValueError('Choose a DWG or DXF file.')
        if not data or len(data) > LIMIT:
            raise ValueError('File is empty or exceeds 64 MB.')
        candidate = Path(self.tmp.name) / 'candidate'
        candidate.mkdir(exist_ok=True)
        source = candidate / ('input' + ext)
        source.write_bytes(data)
        warnings = ''
        if ext == '.dwg':
            if not re.match(rb'AC10\d\d', data[:6]):
                raise ValueError('This file does not have a recognizable DWG header.')
            converter = shutil.which('dwg2dxf')
            if not converter:
                raise ValueError('LibreDWG dwg2dxf is missing. Install libredwg and restart.')
            target = candidate / 'converted.dxf'
            target.unlink(missing_ok=True)
            limiter = ('import os,resource,sys; '
                       'resource.setrlimit(resource.RLIMIT_FSIZE,(536870912,536870912)); '
                       'os.execv(sys.argv[1],sys.argv[1:])')
            with tempfile.TemporaryFile() as log:
                result = subprocess.run([sys.executable, '-c', limiter, converter, '-o', str(target), str(source)], stdout=log, stderr=log, timeout=180)
                log.seek(0)
                warnings = log.read(4096).decode('utf-8', 'replace')
            if result.returncode != 0 or not target.is_file():
                raise ValueError('DWG conversion failed. Check the file in native CAD; LibreDWG may not support it.')
            source = target
        try:
            doc = ezdxf.readfile(source)
        except Exception as e:
            raise ValueError('DXF could not be read: ' + str(e)[:200]) from e
        boxes = []
        total = len(doc.modelspace())
        if total > 300000:
            raise ValueError('Drawing exceeds the 300,000 model-space entity limit.')
        xrefs = sum(1 for block in doc.blocks if block.block.dxf.flags & 4)
        cache = bbox.Cache()
        for entity in doc.modelspace():
            bounds = bbox.extents([entity], fast=True, cache=cache)
            if bounds.has_data:
                a, b = bounds.extmin, bounds.extmax
                boxes.append((entity, a.x, a.y, b.x, b.y))
        if not boxes:
            raise ValueError('No supported drawable model-space geometry was found.')
        x0 = min(b[1] for b in boxes); y0 = min(b[2] for b in boxes)
        x1 = max(b[3] for b in boxes); y1 = max(b[4] for b in boxes)
        if not all(math.isfinite(v) for v in (x0,y0,x1,y1)):
            raise ValueError('The drawing has non-finite geometry extents.')
        padding = max(x1-x0, y1-y0, 1) * .05
        if x1 == x0: x0 -= padding; x1 += padding
        if y1 == y0: y0 -= padding; y1 += padding
        digest = hashlib.sha256(data).hexdigest()
        sheets = [{'id': 'all', 'name': 'Entire model space', 'frame': [x0,y0,x1,y1]}]
        if digest == SOURCE_HASH:
            sheets += [{'id': d['id'], 'name': d['en'], 'frame': d['frame']} for d in DRAWINGS]
            sheets += [{'id': d['id'], 'name': f"Tower detail ({d['ban_ve']}): {d['en']}", 'frame': d['khung_cat_cad_mm']}
                       for d in TOWER_DETAILS]
        self.doc, self.boxes, self.sheets, self.name = doc, boxes, sheets, name
        self.revision = secrets.token_hex(16)
        self.digest = digest
        return {'revision': self.revision, 'name': name, 'hash': digest, 'sheets': sheets, 'count': len(boxes),
                'insunits': doc.header.get('$INSUNITS', 0), 'church': digest == SOURCE_HASH,
                'conversionWarnings': bool(warnings.strip()), 'total': total, 'unbounded': total-len(boxes), 'xrefs': xrefs}
    def sheet(self, ident):
        if not self.doc:
            raise ValueError('Open a drawing first.')
        return next((s for s in self.sheets if s['id'] == ident), None) or (_ for _ in ()).throw(ValueError('Unknown sheet.'))
    def entities(self, frame, handles=None):
        x0,y0,x1,y1 = frame
        return [e for e,a,b,c,d in self.boxes if c >= x0 and a <= x1 and d >= y0 and b <= y1 and (handles is None or e.dxf.handle in handles)]
    def svg(self, ident):
        sheet = self.sheet(ident); x0,y0,x1,y1 = sheet['frame']
        backend = DrawingSVG()
        Frontend(RenderContext(self.doc), backend, config=CONFIG).draw_entities(self.entities(sheet['frame']))
        backend.set_background('#ffffff')
        page = layout.Page(297, 210, units=layout.Units.mm)
        box = BoundingBox2d([(x0,y0),(x1,y1)])
        return backend.get_string(page, settings=layout.Settings(fit_page=True, crop_at_margins=True), render_box=box)
    def pdf(self, ident, handles):
        import io
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
        sheet = self.sheet(ident)
        if handles is not None:
            if not isinstance(handles, list) or len(handles) > 150000 or any(not isinstance(h,str) or not re.fullmatch(r'[0-9A-Fa-f]+',h) for h in handles):
                raise ValueError('Invalid selection.')
            handles = set(handles)
            if not handles:
                raise ValueError('Select at least one drawing object.')
        entities = self.entities(sheet['frame'], handles)
        if not entities:
            raise ValueError('The selection has no drawable objects on this sheet.')
        x0,y0,x1,y1 = sheet['frame']
        if handles is not None:
            selected = [b for b in self.boxes if b[0].dxf.handle in handles and b[3] >= x0 and b[1] <= x1 and b[4] >= y0 and b[2] <= y1]
            x0=max(x0,min(b[1] for b in selected)); y0=max(y0,min(b[2] for b in selected))
            x1=min(x1,max(b[3] for b in selected)); y1=min(y1,max(b[4] for b in selected))
            pad = max(x1-x0,y1-y0,1)*.05
            frame = sheet['frame']
            x0=max(frame[0], x0-pad); x1=min(frame[2], x1+pad)
            y0=max(frame[1], y0-pad); y1=min(frame[3], y1+pad)
        fig = plt.figure(figsize=(11.69,8.27))
        ax = fig.add_axes([.03,.09,.94,.86])
        Frontend(RenderContext(self.doc), MatplotlibBackend(ax), config=CONFIG).draw_entities(entities)
        ax.set_xlim(x0,x1); ax.set_ylim(y0,y1); ax.set_aspect('equal', adjustable='box'); ax.axis('off')
        fig.text(.03,.062,f'{self.name[:70]}  |  {ident}  |  SHA-256 {self.digest[:12]}  |  Fit to page',fontsize=7)
        fig.text(.03,.035,'IN DEVELOPMENT / ĐANG PHÁT TRIỂN  •  NOT FOR CONSTRUCTION / KHÔNG DÙNG ĐỂ THI CÔNG',fontsize=7)
        buf=io.BytesIO(); fig.savefig(buf,format='pdf',metadata={'Title':'Local drawing review','Author':''}); plt.close(fig)
        return buf.getvalue()

class Handler(BaseHTTPRequestHandler):
    workspace = Workspace()
    def setup(self):
        super().setup()
        self.connection.settimeout(30)
    def valid_host(self):
        return self.headers.get('Host') in (f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}')
    def send(self, code, data, kind='application/json'):
        if isinstance(data, (dict,list)): data=json.dumps(data).encode()
        elif isinstance(data,str): data=data.encode()
        self.send_response(code); self.send_header('Content-Type',kind); self.send_header('Content-Length',str(len(data)))
        self.send_header('Cache-Control','no-store'); self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
        self.end_headers(); self.wfile.write(data)
    def do_GET(self):
        if not self.valid_host(): return self.send(403, {'error':'Invalid host.'})
        path=urlsplit(self.path).path
        files={'/':('index.html','text/html; charset=utf-8'),'/app.js':('app.js','text/javascript; charset=utf-8'),'/style.css':('style.css','text/css; charset=utf-8')}
        if path == '/project-available': return self.send(200, {'available': (ROOT / 'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg').is_file()})
        if path in files:
            name, kind=files[path]; return self.send(200,(HERE/name).read_bytes(),kind)
        if path.startswith('/drawing/'):
            with self.workspace.lock:
                if self.headers.get('X-Drawing-Revision') != self.workspace.revision or not self.workspace.revision: return self.send(409, {'error':'Drawing changed in another tab. Open it again.'})
                try: return self.send(200,self.workspace.svg(path[len('/drawing/'):]),'image/svg+xml')
                except Exception as e: return self.send(400,{'error':str(e)})
        return self.send(404,{'error':'Not found.'})
    def do_POST(self):
        if not self.valid_host() or self.headers.get('Origin') != f'http://{self.headers.get("Host")}':
            return self.send(403,{'error':'Invalid origin.'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length <= 0 or length > LIMIT: raise ValueError('Request is empty or exceeds 64 MB.')
            data=self.rfile.read(length)
            if len(data) != length: raise ValueError('Incomplete request body.')
            with self.workspace.lock:
                self.process_post(data)
        except Exception as e: return self.send(400,{'error':str(e) or 'Unable to process drawing.'})
    def process_post(self, data):
        try:
            if self.path == '/open-project':
                project = ROOT / 'docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg'
                if not project.is_file(): raise ValueError('Project DWG is not present locally.')
                return self.send(200, self.workspace.load(project.read_bytes(), project.name))
            if self.path == '/open':
                name=unquote(self.headers.get('X-File-Name','drawing'))
                name=Path(name.replace('\\','/')).name[:200]
                return self.send(200,self.workspace.load(data,name))
            if self.path == '/export':
                request=json.loads(data)
                if request.get('revision') != self.workspace.revision or not self.workspace.revision: return self.send(409, {'error':'Drawing changed in another tab. Open it again.'})
                pdf=self.workspace.pdf(request['sheet'],request.get('handles'))
                return self.send(200,pdf,'application/pdf')
            return self.send(404,{'error':'Not found.'})
        except Exception as e: return self.send(400,{'error':str(e) or 'Unable to process drawing.'})
    def log_message(self, format, *args): pass

if __name__ == '__main__':
    port = int(os.environ.get('DWG_WORKSPACE_PORT','8765'))
    server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
    print(f'Drawing workspace: http://127.0.0.1:{port}  (Ctrl-C to stop)',flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close(); Handler.workspace.tmp.cleanup()
