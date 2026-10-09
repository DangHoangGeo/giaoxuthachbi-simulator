from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[2]
package = Path(__file__).resolve().parent
manifest = json.loads((package / 'manifest.json').read_text())
checks = 0
for field in ('sources', 'evidence', 'unchangedEngineeringSources'):
    for name, expected in manifest[field].items():
        actual = hashlib.sha256((root / name).read_bytes()).hexdigest()
        assert actual == expected, (field, name)
        checks += 1
for item in manifest['localLinks']:
    assert (root / item['resolved']).exists(), item
    checks += 1
print(json.dumps({'checks': checks, 'failures': 0, 'buildId': manifest['buildId']}))
