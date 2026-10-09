"""Verify this snapshot's source/evidence hashes, not engineering compliance."""
import hashlib
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
root = folder.parent.parent
manifest = json.loads((folder / 'manifest.json').read_text())
failures = []
for group in ['sources', 'evidence']:
    for name, expected in manifest[group].items():
        path = root / name
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            failures.append(name)
assert not failures, failures
print(f"Verified {len(manifest['sources'])} source and {len(manifest['evidence'])} evidence files.")
