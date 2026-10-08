#!/usr/bin/env python3
"""Verify the phase-close snapshot; later edits require their own evidence revision."""
import gzip
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
manifest = json.loads((HERE / 'manifest.json').read_text())
checks = 0
failures = []
for group in ('sources', 'evidence', 'unchangedEngineeringSources'):
    for name, expected in manifest[group].items():
        checks += 1
        p = ROOT / name
        if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest() != expected:
            failures.append(f'{group}: {name}')
for name in manifest['documentsChecked']:
    p = ROOT / name
    for link in re.findall(r'\]\(([^)]+)\)', p.read_text()):
        if '://' in link or link.startswith('#'):
            continue
        checks += 1
        if not (p.parent / link.split('#')[0]).exists():
            failures.append(f'link: {name}: {link}')
for record in json.loads((HERE / 'clean-copy/raw-log-archive.json').read_text())['logs']:
    checks += 1
    raw = gzip.decompress((HERE / 'clean-copy' / record['path']).read_bytes())
    if hashlib.sha256(raw).hexdigest() != record['rawSha256']:
        failures.append(f'raw log: {record["path"]}')
print(json.dumps({'checks': checks, 'failures': failures}, indent=2))
raise SystemExit(bool(failures))
