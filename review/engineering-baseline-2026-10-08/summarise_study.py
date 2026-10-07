"""Check frozen study provenance and summarise unchanged simulator outputs.

Run from any directory: python3 review/engineering-baseline-2026-10-08/summarise_study.py
Does not re-run physics or modify source/layouts; writes study-summary.md and
study-verification.json beside this script. Historical source hashes are checked
against this checkout, so use the source revision recorded in the manifest.
"""
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[1]
RESULTS = OUT / 'study-results'
load = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = load(RESULTS / 'manifest.json')
assert manifest['repeat']['passed'] is True
for f, h in manifest['sourceSha256'].items():
    assert sha(ROOT / f) == h, f'Source differs: {f}'
for f, h in manifest['files'].items():
    assert sha(RESULTS / f) == h, f'Result differs: {f}'
assert sha(OUT / 'study-inputs/scenarios.json') == manifest['scenarioSha256']
baseline = load(RESULTS / 'baseline-layout.json')
saved = load(ROOT / 'docs/electrical-grid/equipment-layout.json')
assert baseline['items'] == saved['items'], 'Saved equipment differs'
assert baseline['settings'] == saved['settings'], 'Saved settings differ'
cases = [load(RESULTS / (c['id'] + '.json')) for c in manifest['scenarios']['cases']]
assert len(cases) == 24
receivers = {}
for c in cases:
    s = c['results']
    assert len(s['seats']) == s['n'] == 368
    coordinates = [(x['receiverId'], x['x'], x['y'], x['z']) for x in s['seats']]
    receivers.setdefault(c['layoutBlocks'], coordinates)
    assert coordinates == receivers[c['layoutBlocks']], 'Sample coverage changed between scenes'
    if c['id'].startswith(('off-', 'security-', 'cleaning-', 'prayer-')):
        assert all(x['sti'] is None and x['spl'] is None for x in s['seats']), 'No-source sound should remain missing'
    if c['id'].startswith('off-'):
        assert all(x['lux'] == 0 and x['air'] == 0 for x in s['seats'])
        assert c['power']['total'] == 15, 'Existing exit-sign allowance should remain'
full = next(c for c in cases if c['id'] == 'full-4')
audit = load(OUT / 'checks/audit-report-1.json')
# Find the actual full report in the independent existing verifier output.
def objects(v):
    if isinstance(v, dict):
        yield v
        for x in v.values(): yield from objects(x)
    elif isinstance(v, list):
        for x in v: yield from objects(x)
report = next(o for o in objects(audit) if o.get('seats') == 368 and 'buildMs' in o)
checks = [('lux', 'min', 0), ('lux', 'avg', 0), ('sti', 'min', 3), ('sti', 'avg', 3), ('air', 'min', 2), ('air', 'max', 2), ('noise', 'avg', 1), ('noise', 'max', 1)]
for metric, statistic, digits in checks:
    assert round(full['results'][metric][statistic], digits) == report[metric][statistic], (metric, statistic)
assert round(full['power']['total']) == report['power']['totalW']
lines = ['# Frozen study results', '', 'Generated from the 24 cases in [study-results/manifest.json](study-results/manifest.json); every case samples all 368 receivers. Numbers are rounded here only; raw JSON retains full precision, settings, equipment, checks and location IDs. When no speech source exists, raw STI failure lists are empty because no STI is evaluated. The table shows both STI and its failure count as **n/a**, not a pass.', '', '| Case | Minimum book lux | Below scene target | Minimum STI | Below .60 | Air below .30 m/s | Ambo / altar margin dB |', '| --- | ---: | ---: | ---: | ---: | ---: | --- |']
for c in cases:
    r, k = c['results'], c['criteria']
    speech = f"{r['sti']['min']:.4f}" if r['sti'] else 'n/a'
    count = str(len(k['belowSTI060'])) if r['sti'] else 'n/a'
    lux_count = str(len(k['belowSceneLux'])) if k['belowSceneLux'] is not None else 'n/a'
    margins = ' / '.join(f"{m['feedbackMarginDb']:.2f}" if m['feedbackMarginDb'] is not None else 'n/a' for m in c['microphones'])
    lines.append(f"| [{c['id']}](study-results/{c['id']}.json) | {r['lux']['min']:.3f} | {lux_count} | {speech} | {count} | {len(k['belowAir030'])} | {margins} |")
lines += ['', 'Air lower-bound counts for unoccupied/off/cool modes are descriptive, not a claim that fans should run in those modes. Occupancy-zone and seasonal acceptance remain pending. The source files determine every computed value; the runner does not change physics, sample density or thresholds.', '', 'Fresh model load repeated every case exactly after removing only export timestamps. Both layouts retain 288 nave plus 80 wing receivers, with different nave positions. This is not approved capacity. The exported default matches every saved layout item and setting; existing independent audit summary values agree at their published rounding.', '']
(OUT / 'study-summary.md').write_text('\n'.join(lines))
verification = {'result': 'passed', 'cases': len(cases), 'receiversPerCase': 368, 'receiverEvaluations': sum(c['results']['n'] for c in cases), 'repeatedEvaluations': 2 * sum(c['results']['n'] for c in cases), 'repeat': manifest['repeat'], 'sourceFilesVerified': len(manifest['sourceSha256']), 'resultFilesVerified': len(manifest['files']), 'savedLayoutItemsAndSettings': 'exact match', 'fixedReceiverCoverage': 'unchanged within each layout', 'noSourceSound': 'null preserved', 'auditRoundedComparisons': len(checks) + 1}
(OUT / 'study-verification.json').write_text(json.dumps(verification, indent=2) + '\n')
print(json.dumps(verification))
