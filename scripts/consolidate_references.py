"""Keep the selected checkpoint set; remove superseded generated project images."""
raise SystemExit('Legacy consolidation retired: organized references must be preserved. Use Thach_Bi_Viewer/references/index.html and manifest.json.')

from pathlib import Path
import json
import shutil
import hashlib

root = Path(__file__).resolve().parents[1]
gallery = root / 'review/reference-proposals/checkpoints-2026-10-05'
viewer = root / 'Thach_Bi_Viewer'
manifest = json.loads((gallery / 'manifest.json').read_text())
refs = viewer / 'references'
selected = [v['file'] for v in manifest['views']]
if all((refs / name).exists() for name in selected) and not (gallery / selected[0]).exists():
    raise SystemExit('References already consolidated.')
assert len(selected) == 9 and len(set(selected)) == 9
for name in selected:
    assert (gallery / name).is_file(), name
    shutil.copy2(gallery / name, refs / name)

html = (gallery / 'index.html').read_text()
for name in selected:
    html = html.replace('"' + name + '"', '"../../../Thach_Bi_Viewer/references/' + name + '"')
html = html.replace('For review · The simulator has not been changed.', 'Selected reference set · Open the updated simulator to compare the shared model.')
html = html.replace('<nav aria-label="Reference files">', '<nav aria-label="Reference files"><a href="../../../Thach_Bi_Viewer/OPEN_CHURCH.html">Open 3D simulator</a>')
(gallery / 'index.html').write_text(html)
manifest['status'] = 'Retained reference set for the simulator refinement requested 2026-10-05'
manifest['simulator_changed'] = True
manifest['source_priority'] = [
    'docs/layout_design/Thach_Bi_Church_Dimensions.xlsx',
    'docs/layout_design original drawings and Thach_Bi_All_Views.png',
    'Latest user corrections',
    'Retained images for finishes, ornament and lighting only',
]
for v in manifest['views']:
    v['file'] = '../../../Thach_Bi_Viewer/references/' + v['file']
(gallery / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
references = [dict(id=Path(v['file']).stem, title=v['title'], description=v['review_focus'],
                   url='references/' + Path(v['file']).name, type=v['type'],
                   status='Visual reference; measured drawings govern geometry') for v in manifest['views']]
(refs / 'manifest.json').write_text(json.dumps(references, ensure_ascii=False, indent=2) + '\n')
(viewer / 'references.js').write_text('window.CHURCH_REFERENCES = ' + json.dumps(references, ensure_ascii=False, indent=2) + ';\n')

# Audit exact files before deleting: source drawings are outside these candidate folders.
candidates = list((root / 'review/reference-proposals').rglob('*.png'))
candidates += [p for p in refs.glob('*.png') if p.name not in selected]
candidates += list(viewer.glob('church-*.png'))
audit = {'date':'2026-10-05', 'kept':[str((refs / n).relative_to(root)) for n in selected],
         'removed':[], 'bytes_removed':0}
for p in sorted(candidates):
    data = p.read_bytes()
    audit['removed'].append({'file':str(p.relative_to(root)), 'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest()})
    audit['bytes_removed'] += len(data)
(root / 'review/image-cleanup-2026-10-05.json').write_text(json.dumps(audit, indent=2) + '\n')
for p in candidates:
    p.unlink()
print(json.dumps({'kept':len(selected), 'removed':len(candidates), 'MiB_removed':round(audit['bytes_removed']/1024**2, 1)}))
