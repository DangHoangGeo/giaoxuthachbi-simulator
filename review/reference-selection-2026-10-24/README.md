# Updated façade references in the viewer · 24 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner asked to see the new front/side church images when opening the 3D model. This follow-up connects four of the [six generated images](../church-views-2026-10-24/README.md) to the active offline and web viewer reference list. The original image delivery alone had not changed that selection.

## Selection

| Stable reference ID | New selected image |
| --- | --- |
| `church-views-20261007-01-exterior-front-day` | `03-facade/native/2026-10-24-01-front-day.png` |
| `church-views-20261007-02-exterior-corner-day` | `03-facade/native/2026-10-24-02-front-corner-day.png` |
| `church-views-20261007-04-exterior-corner-evening` | `03-facade/native/2026-10-24-03-opposite-corner-evening.png` |
| `church-views-20261007-03-entrance-detail-day` | `03-facade/native/2026-10-24-04-facade-detail-day.png` |

These four cards appear first in **References / Tham chiếu**. Clicking each card opens its new image in the existing lightbox. Startup/failure front/exterior links and the no-script exterior link also use the new files. The detail now belongs to the façade category. Its Vietnamese title and the reference/image script cache revisions are updated. The new files are byte-identical native 1672 × 941 copies; no image editing or resampling occurs in this follow-up. Earlier dated images, source inputs and provenance are preserved. Interior selections are unchanged.

The current image register, manifest, `references.js`, coverage, reference library and affected folder guides were updated together. The generation manifest and rendering/web-viewer documents record the selection. No 3D object, visibility behavior, equipment record, route, power, material, physical control or simulator input changes, so equipment/line registers do not need regeneration. Established engineering failures and holds remain open.

## Checks

- Headed desktop Chrome at 1440 × 1000: local offline viewer in English and an HTTP-served generated web viewer in Vietnamese. All four first cards and all four lightboxes loaded their expected native images; startup exterior links matched; day/evening selection remained stable. No page/console errors. [Results](results.json).
- Visit-only mode: Simulator button remained hidden, with zero reads/writes/removals of engineering-layout storage keys during the check. This selection changes no mode or permission code.
- Visually inspected the [web reference panel](web-visit-references.jpg) and [front-image lightbox](web-visit-front-lightbox.jpg). [Offline reference panel](offline-references.jpg), [offline lightbox](offline-front-lightbox.jpg).
- Metadata: stable ID set preserved; `references.js` equals the reference manifest; four native file/master/register hashes and dimensions agree; provenance files exist. Main reference-library local links resolve.
- `node web/scripts/prepare-viewer.mjs` and `node web/scripts/check-viewer.mjs`: passed, **68 files / 71,081,306 bytes**, exact inventory, size and SHA-256. The four new images are exported; the four superseded front/side/detail exports are excluded. Historical selection paths in metadata are relative to the reference directory so they do not cause the web image scanner to republish unused artwork.
- `node scripts/check-build-boundary.mjs` from `web/`: passed with zero failures against existing build `2kr-HZYsjDtdIBlECZSH0`. This checks the saved build, rather than claiming a new production build or deployment.
- `git diff --check` and the staged diff check passed. No unrelated engineering simulations were rerun for image-list/metadata changes.

The generated local web copy is refreshed. The live website receives the change on its next authorized build/deployment; this session does not push or deploy. The separate website editorial gallery is unchanged. Standalone reference-library and dated-gallery pages retain their existing local-only scope in the web export.
