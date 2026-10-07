"""Package consistency checks only. This is NOT a structural design calculation."""
from pathlib import Path
import hashlib
import json
import math
import re
import struct

base = Path(__file__).resolve().parent
req = json.loads((base / 'requirements.json').read_text())
manifest = json.loads((base / 'image-manifest.json').read_text())
assert req['engineeringApproved'] is False
assert all(value is None for value in req['engineeringInputs'].values())
assert len(req['connections']) == 10
assert len(req['members']) == 10
for connection in req['connections']:
    assert connection['status'] == 'ENGINEERING_HOLD'
    assert connection['verifiedCapacity'] is None
for entry in manifest['files']:
    file = base / entry['file']
    assert file.is_file(), file
    assert hashlib.sha256(file.read_bytes()).hexdigest() == entry['sha256'], file
    if entry['role'] == 'generated_concept':
        assert struct.unpack('>II', file.read_bytes()[16:24]) == (1920, 1080), file
assert len([e for e in manifest['files'] if e['role'] == 'generated_concept']) == 8
for file in base.glob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)', file.read_text()):
        if target.startswith(('https://', 'http://', '#')):
            continue
        assert (file.parent / target.split('#')[0]).is_file(), (file, target)
g = req['geometry']
pitch = math.degrees(math.atan((g['ridgeDatum']['value'] - g['eaveDatum']['value']) / g['roofHalfRun']['value']))
assert math.isclose(pitch, g['roofPitch']['value'])
s = req['spanSensitivity']
ratio = s['wideSpanM'] / s['typicalSpanM']
for power, key in [(1, 'reactionRatio'), (2, 'momentRatio'), (4, 'deflectionRatio')]:
    assert math.isclose(ratio ** power, s[key])
assert math.isclose(g['longitudinalX']['value']['10'] - g['longitudinalX']['value']['9'], 7.2)
print('PASS: image hashes/dimensions, local document links, member/connection records, unresolved-engineering status and span arithmetic. No structural capacity verified.')
