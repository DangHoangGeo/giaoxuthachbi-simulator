#!/usr/bin/env python3
"""Synthetic regression test: no private source drawings or rendered artifacts are used."""
import hashlib
import importlib.util
import json
import re
import socket
import tempfile
import threading
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import ezdxf
import pymupdf

SPEC = importlib.util.spec_from_file_location('workspace_server', Path(__file__).with_name('server.py'))
server_module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(server_module)


class WorkspaceTest(unittest.TestCase):
    def test_synthetic_api_and_revision_identity(self):
        doc = ezdxf.new()
        doc.header['$INSUNITS'] = 1
        model = doc.modelspace()
        line = model.add_line((0, 0), (10, 0))
        dimension = model.add_linear_dim(base=(0, 3), p1=(0, 0), p2=(10, 0))
        dimension.render()  # Include the cached dimension graphics stored in the DXF.
        inner = doc.blocks.new('INNER')
        inner.add_line((0, 0), (2, 2))
        outer = doc.blocks.new('OUTER')
        outer.add_blockref('INNER', (0, 0))
        insert = model.add_blockref('OUTER', (5, 5))
        handles = {line.dxf.handle, dimension.dimension.dxf.handle, insert.dxf.handle}
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'fixture.dxf'
            doc.saveas(source)
            data = source.read_bytes()

        server = server_module.ThreadingHTTPServer(('127.0.0.1', 0), server_module.Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f'http://127.0.0.1:{server.server_port}'

        def request(path, body=None, headers=None, timeout=30):
            req = Request(base + path, data=body, headers={'Origin': base, **(headers or {})})
            try:
                with urlopen(req, timeout=timeout) as response:
                    return response.status, response.read()
            except HTTPError as exc:
                return exc.code, exc.read()

        def export(revision, selected):
            return request('/export', json.dumps({'revision': revision, 'sheet': 'all', 'handles': selected}).encode())

        idle = socket.create_connection(('127.0.0.1', server.server_port))
        try:
            self.assertEqual(request('/', timeout=2)[0], 200)  # Idle browser preconnections must not block requests.
            status, result = request('/open', data, {'X-File-Name': 'fixture.dxf'})
            self.assertEqual(status, 200)
            info = json.loads(result)
            self.assertEqual(info['hash'], hashlib.sha256(data).hexdigest())
            self.assertEqual(info['insunits'], 1)
            self.assertFalse(info['church'])
            self.assertEqual(len(info['sheets']), 1)
            self.assertEqual(info['sheets'][0]['frame'][2], 10)  # No inch-to-mm rescaling.
            revision = info['revision']
            status, svg = request('/drawing/all', headers={'X-Drawing-Revision': revision})
            self.assertEqual(status, 200)
            self.assertIn(b'fill="#ffffff"', svg.lower())
            self.assertEqual(set(re.findall(r'data-handle="([0-9A-F]+)"', svg.decode())), handles)
            root = ET.fromstring(svg)
            namespace = {'svg': 'http://www.w3.org/2000/svg'}
            background = root.find('svg:rect', namespace)
            self.assertIsNotNone(background)
            self.assertEqual(background.get('fill').lower(), '#ffffff')
            style = root.find('svg:defs/svg:style', namespace)
            self.assertIsNotNone(style)
            self.assertRegex(style.text, r'stroke:\s*#000000')
            self.assertTrue(root.findall('.//svg:path[@data-handle]', namespace))
            for handle in handles:
                status, pdf = export(revision, [handle])
                self.assertEqual(status, 200)
                with pymupdf.open(stream=pdf, filetype='pdf') as result:
                    self.assertTrue(result[0].get_drawings())
                    self.assertFalse(result[0].get_images())
                    self.assertAlmostEqual(result[0].rect.width, 841.68, delta=1)
                    self.assertAlmostEqual(result[0].rect.height, 595.44, delta=1)
            self.assertEqual(export(revision, list(handles))[0], 200)
            self.assertEqual(export(revision, [])[0], 400)
            self.assertEqual(request('/open', b'bad file', {'X-File-Name': 'bad.dxf'})[0], 400)
            self.assertEqual(request('/open', b'bad file', {'X-File-Name': 'bad.dwg'})[0], 400)
            self.assertEqual(request('/../../server.py')[0], 404)
            self.assertEqual(request('/drawing/all', headers={'Host': 'evil.invalid'})[0], 403)
            self.assertEqual(request('/drawing/all', headers={'X-Drawing-Revision': revision})[0], 200)
            self.assertEqual(request('/open', data, {'X-File-Name': 'fixture.dxf', 'Origin': 'http://evil.invalid'})[0], 403)
            # Hold a render after revision validation; replacement must wait until it completes.
            workspace = server_module.Handler.workspace
            original_svg = workspace.svg
            entered, release, replaced = threading.Event(), threading.Event(), threading.Event()
            results = {}
            def delayed_svg(ident):
                entered.set()
                if not release.wait(5):
                    raise TimeoutError('Test did not release render')
                return original_svg(ident)
            workspace.svg = delayed_svg
            def render_in_thread():
                results['render'] = request('/drawing/all', headers={'X-Drawing-Revision': revision})[0]
            def replace_in_thread():
                results['replace'] = request('/open', data, {'X-File-Name': 'concurrent.dxf'})[0]
                replaced.set()
            render_thread = threading.Thread(target=render_in_thread)
            replace_thread = threading.Thread(target=replace_in_thread)
            try:
                render_thread.start()
                self.assertTrue(entered.wait(2))
                replace_thread.start()
                self.assertFalse(replaced.wait(.25), 'Replacement crossed an active render')
            finally:
                release.set()
                render_thread.join(5)
                if replace_thread.ident is not None:
                    replace_thread.join(5)
                workspace.svg = original_svg
            self.assertEqual(results, {'render': 200, 'replace': 200})
            self.assertEqual(request('/drawing/all', headers={'X-Drawing-Revision': revision})[0], 409)
            # Load once more to test a subsequent replacement and stale export.
            status, current = request('/open', data, {'X-File-Name': 'fixture.dxf'})
            self.assertEqual(status, 200)
            revision = json.loads(current)['revision']
            status, second = request('/open', data, {'X-File-Name': '../second.dxf'})
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(second)['name'], 'second.dxf')
            self.assertNotEqual(json.loads(second)['revision'], revision)
            self.assertEqual(request('/drawing/all', headers={'X-Drawing-Revision': revision})[0], 409)
            self.assertEqual(export(revision, list(handles))[0], 409)
            line_doc = ezdxf.new()
            line_doc.modelspace().add_line((0, 0), (10, 0))
            with tempfile.TemporaryDirectory() as directory:
                line_path = Path(directory) / 'line.dxf'
                line_doc.saveas(line_path)
                status, line_info = request('/open', line_path.read_bytes(), {'X-File-Name': 'line.dxf'})
            self.assertEqual(status, 200)
            line_info = json.loads(line_info)
            self.assertGreater(line_info['sheets'][0]['frame'][3] - line_info['sheets'][0]['frame'][1], 0)
            self.assertEqual(request('/drawing/all', headers={'X-Drawing-Revision': line_info['revision']})[0], 200)
        finally:
            idle.close()
            server.shutdown()
            thread.join()
            server.server_close()
            server_module.Handler.workspace.tmp.cleanup()


if __name__ == '__main__':
    unittest.main()
