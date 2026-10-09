"""Receives the pictures and sound that driver.js sends from the viewer page.

Usage:  python3 scripts/film_export/receiver.py <output folder>

Listens on 127.0.0.1:8799 only, accepts PUT of .jpg/.mp4/.webm/.json files with
plain names (optionally one sub-folder) and writes them under the output folder.
"""
import http.server
import os
import re
import sys

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'film-export')
NAME = re.compile(r'[A-Za-z0-9_\-]+(/[A-Za-z0-9_\-]+)?\.(mp4|webm|jpg|json)')


class Handler(http.server.BaseHTTPRequestHandler):
    def _allow(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._allow()
        self.end_headers()

    def do_PUT(self):
        name = self.path.lstrip('/')
        if not NAME.fullmatch(name):
            self.send_response(400)
            self._allow()
            self.end_headers()
            return
        target = os.path.join(ROOT, name)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        left = int(self.headers.get('Content-Length', 0))
        with open(target, 'wb') as out:
            while left > 0:
                chunk = self.rfile.read(min(left, 1 << 20))
                if not chunk:
                    break
                out.write(chunk)
                left -= len(chunk)
        self.send_response(201)
        self._allow()
        self.end_headers()

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    os.makedirs(ROOT, exist_ok=True)
    print(f'Receiving film export files in {ROOT} (Ctrl+C to stop)')
    http.server.ThreadingHTTPServer(('127.0.0.1', 8799), Handler).serve_forever()
