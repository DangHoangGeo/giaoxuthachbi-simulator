"""Verify this frozen snapshot at its owning source revision, not later edited trees."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
manifest = json.loads((Path(__file__).parent / 'manifest.json').read_text())
failures = []
checks = 0
for group in ['sources', 'evidence', 'unchangedEngineeringSources']:
    for name, expected in manifest[group].items():
        checks += 1
        path = ROOT / name
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            failures.append(name)
print(json.dumps({'checks': checks, 'failures': failures}, indent=2))
raise SystemExit(bool(failures))
