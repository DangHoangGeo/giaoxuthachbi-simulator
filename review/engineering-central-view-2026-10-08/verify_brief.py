#!/usr/bin/env python3
"""Check this documentation-only clarification against frozen Git evidence."""
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
BASE = '703268a'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def at_pointer(value, pointer):
    for token in pointer.lstrip('/').split('/'):
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


inventory = json.loads((HERE / 'candidate-inventory.json').read_text())
layout_path = 'docs/electrical-grid/equipment-layout.json'
layout = json.loads((ROOT / layout_path).read_text())
assert (ROOT / layout_path).read_bytes() == git('show', BASE + ':' + layout_path)
items = {item['id']: item for item in layout['items']}
rows = list(csv.DictReader((HERE / 'fan-inventory.csv').open(newline='')))
assert len(rows) == len({r['id'] for r in rows}) == 35
assert {r['id'] for r in rows} == {r['id'] for r in inventory['currentFans']}
assert {r['id'] for r in rows} == {i['id'] for i in layout['items'] if i['type'].startswith('fan')}
for row in rows:
    item = items[row['id']]
    assert at_pointer(layout, row['item_json_pointer']) == item
    assert [float(row[k]) for k in ('x_m', 'y_m', 'z_m')] == item['pos']
    for key in ('type', 'name', 'circuit', 'mount'):
        assert row[key] == item[key], (row['id'], key)
    for key in ('hidden', 'on'):
        assert (row[key] == 'true') == item[key], (row['id'], key)
    assert float(row['speed']) == item['speed']
for row in inventory['currentFans']:
    item = items[row['id']]
    assert row['positionM'] == item['pos']
    assert all(row[k] == item[k] for k in ('type', 'hidden', 'on', 'circuit'))

source_recovery = {}
for file, expected in inventory['sourceHashes'].items():
    actual = digest(git('show', 'ae18c68:' + file))
    assert actual == expected, file
    source_recovery[file] = actual
candidate_counts = {}
for candidate in inventory['candidates']:
    source = candidate['inputSource']
    raw = git('show', source['commit'] + ':' + source['path'])
    assert digest(raw) == source['sha256']
    original = json.loads(raw)
    count = 0
    for patch in candidate['fanPatches']:
        assert at_pointer(original, patch['patchPointer']) == patch['patch']
        if patch['patch'].get('pos', [None, None, None])[2] == 0:
            count += 1
    candidate_counts[candidate['id']] = count
assert list(candidate_counts.values()) == [0, 0, 6]

unchanged = ['Thach_Bi_Viewer/simulator/' + name for name in
             ['design.js', 'catalog.js', 'engine.js', 'physics.js', 'analysis.js', 'electrical.js']]
unchanged += ['docs/electrical-grid/' + name for name in
              ['equipment-layout.json', 'electrical-systems.json', 'electrical-schedule.csv', 'summary-report.md', 'categories/manifest.json']]
unchanged += [str(p.relative_to(ROOT)) for p in sorted((ROOT / 'docs/electrical-grid/categories').glob('*/register.xlsx'))]
for file in unchanged:
    assert (ROOT / file).read_bytes() == git('show', BASE + ':' + file), file

changed = git('diff', '--name-only', BASE).decode().splitlines()
markdown = sorted({file for file in changed if file.endswith('.md')} |
                  {'docs/engineering/central-view-constraint.md', str((HERE / 'README.md').relative_to(ROOT))})
links = []
remote_refs = []
for file in markdown:
    text = (ROOT / file).read_text()
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
        url = urlsplit(target.strip('<>'))
        if url.scheme:
            match = re.match(r'/DangHoangGeo/giaoxuthachbi-simulator/blob/([^/]+)/(.+)', url.path)
            if url.netloc == 'github.com' and match:
                git('cat-file', '-e', match[1] + ':' + unquote(match[2]))
                remote_refs.append(target)
            continue
        path = ((ROOT / file).parent / unquote(url.path)).resolve() if url.path else ROOT / file
        if path != HERE / 'verification.json':
            assert path.exists(), (file, target)
        if url.fragment and path.suffix == '.md':
            anchors = {re.sub(r'[^\w\s-]', '', heading.lower().replace('`', '')).replace(' ', '-')
                       for heading in re.findall(r'^#{1,6}\s+(.+)', path.read_text(), re.M)}
            assert unquote(url.fragment) in anchors, (file, target)
        links.append({'file': file, 'target': target})

result = {
    'status': 'PASS', 'scope': 'brief clarification only; no model/register change or new performance claim',
    'baseline': BASE, 'frozen_source_recovered_at': 'ae18c68',
    'frozen_source_sha256': source_recovery,
    'fan_records_equal_to_main': len(rows), 'candidate_exact_z0_counts': candidate_counts,
    'unchanged_model_register_files': {f: digest((ROOT / f).read_bytes()) for f in unchanged},
    'markdown_files': markdown, 'local_links': links, 'git_blob_links_resolve': remote_refs,
    'limitations': 'Protected-view envelope, concealed equipment performance and physical approvals remain held. No numerical engineering threshold changed.'
}
(HERE / 'verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(f'PASS: 35 fan records; {len(unchanged)} untouched engineering/register files; {len(links)} local links; {len(remote_refs)} Git blob links.')
