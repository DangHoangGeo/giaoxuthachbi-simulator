#!/usr/bin/env python3
"""Check this immutable evidence package against its recorded source revision."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / 'shell-manifest.json').read_text())
failures = []
checks = 0
for group in ('sources', 'evidence', 'unchangedEngineeringSources'):
    for name, expected in manifest[group].items():
        checks += 1
        path = ROOT / name
        actual = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
        if actual != expected:
            failures.append(f'{group}: {name}')
for name in manifest['documentsChecked']:
    path = ROOT / name
    for link in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if '://' in link or link.startswith('#'):
            continue
        target = link.split('#')[0]
        checks += 1
        if not (path.parent / target).exists():
            failures.append(f'broken link {name}: {target}')
print(json.dumps({'checks': checks, 'failures': failures}, indent=2))
raise SystemExit(bool(failures))
