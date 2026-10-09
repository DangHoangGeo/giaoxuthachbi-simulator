"""Verify the frozen gallery evidence at its containing source revision."""
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).parent
manifest = json.loads((HERE / 'manifest.json').read_text())
failures = []
checks = 0

def check(value, label):
    global checks
    checks += 1
    if not value:
        failures.append(label)

for group in ['sources', 'evidence', 'unchangedEngineeringSources']:
    for name, expected in manifest[group].items():
        p = ROOT / name
        check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest() == expected, name)
raw = json.loads((HERE / 'desktop/results.json').read_text())
check(raw['source']['hashesStableDuringCapture'], 'source stability')
check(raw['source']['localBuildId'] == manifest['buildId'], 'capture build')
for p, digest in raw['source']['sourceHashesAfter'].items():
    if p != 'web/.next/BUILD_ID':
        check(hashlib.sha256((ROOT / p).read_bytes()).hexdigest() == digest, f'captured source {p}')
served = json.loads((HERE / 'desktop/served-build-check.json').read_text())
check(served['passed'] and served['extractedBuildId'] == manifest['buildId'], 'served build')
check(len(raw['desktopChecks']) == 4, 'desktop samples')
for sample in raw['desktopChecks']:
    check(sample['status'] == 200, 'desktop HTTP')
    check(not sample['facts']['document']['horizontalOverflow'], 'desktop overflow')
    check(sample['axe']['violations'] == [], 'axe violations')
    for key in ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors']:
        check(sample['diagnostics'][key] == [], f'desktop {key}')
check(len(raw['performance']['samples']) == 10, 'performance samples')
for sample in raw['performance']['samples']:
    check(sample['navigationError'] is None and sample['navigation']['status'] == 200, 'lab navigation')
    check(sample['webMetrics']['observerErrors'] == {'lcp': None, 'cls': None}, 'observers')
    requests = sample['cdpBytes']['rawRequests']
    check(not any(r['fromDiskCache'] or r['fromServiceWorker'] for r in requests), 'cold-cache bytes')
    check(sum(r['loadingFinishedEncodedBytes'] or 0 for r in requests) == sample['cdpBytes']['loadingFinishedEncodedBytes'], 'transfer sum')
check(raw['performance']['oneMbpsDegradedReadableCheck']['readableServerRenderedContent'], 'degraded reading')
for filename, expected in [('unit.log.gz', '69 passed'), ('browser-production.log.gz', '5 passed'), ('browser-synthetic-final.log.gz', '5 passed')]:
    check(expected in gzip.decompress((HERE / filename).read_bytes()).decode(), filename)
synthetic = json.loads((HERE / 'synthetic/captures.json').read_text())
check(len(synthetic['captures']) == 6 and synthetic['errors'] == [], 'synthetic captures')
check(not any(row['overflow'] for row in synthetic['captures']), 'synthetic overflow')
print(json.dumps({'checks': checks, 'failures': failures}, indent=2))
raise SystemExit(bool(failures))
