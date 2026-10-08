# Private full-detail model transport package

**In development / Đang phát triển · Not for construction / Không dùng để thi công.** Prepared locally on 8 October 2026 for the requested protected architectural review. This record verifies the transport package; authentication, protected storage, deployment and desktop rendering require their separate checks.

The owning input is [the detailed sharing GLB](../../exports/sharing/README.md), exported from source commit `c151c71c1f81ec327701c705822dc6dee252eaa6` by Three.js GLTFExporter r186. Its [delivery manifest](../../exports/sharing/delivery-2026-10-08.json) and [export source manifest](../../exports/sharing/source-manifest-2026-10-08.json) agree on the exact source bytes and SHA-256. The package compresses that existing file; it does not regenerate, simplify, quantize or rewrite the model or textures.

| Artifact | Exact bytes | SHA-256 |
| --- | ---: | --- |
| Original / decoded `Thach-Bi-full-detail-2026-10-08.glb` | 125,105,044 | `a8968ba5368da66f46083321ebc586c151ffa72a8c823bbfb09d9d769509e341` |
| Transport `Thach-Bi-full-detail-2026-10-08.glb.gz` | 53,230,983 | `e81a94607d7edae12784375d39f9a56aa2a2a60490b64c9c8ef0d819b762c944` |

The compressed artifact is approximately 53.23 MB (50.76 MiB); the decoded model is approximately 125.11 MB (119.31 MiB). Gzip reduces transferred bytes only. Browser parsing, texture allocation and GPU memory still depend on the full model; these figures do not predict memory usage or loading time on the parish desktop/network. This is a separate protected-review package and does not meet the lightweight public scene's 10 MB transfer target.

## Reproduction and verification

Run from the repository root with Python 3.9 or later:

```sh
python3 scripts/web/package-private-model.py
python3 scripts/web/package-private-model.py --verify
```

The [authoring script](../../scripts/web/package-private-model.py) uses only Python's standard library and fixed repository-relative inputs. It creates the local ignored binary under `exports/private-review/` and the tracked, non-secret [package manifest](../../exports/private-review/manifest.json). It writes no files under `web/` and performs no network calls or cloud upload. Existing outputs must match; a different artifact or manifest is preserved and causes failure rather than silent replacement. Keep the ignored binary in the separate project artifact backup; a Git clone requires the original sharing GLB to reproduce it.

Compression uses `gzip.GzipFile`, level 9, 1,048,576-byte stream blocks, `mtime=0`, an empty filename header and OS header byte 255. The recorded run used Python 3.13.4 with zlib build/runtime 1.2.12. The script independently replays compression and compares the complete compressed length/hash, then reads decompression to EOF to check the gzip CRC/trailer, decoded length and original SHA-256. Both checks passed. These fixed settings reproduce the same gzip on the recorded runtime; a different zlib implementation/version may produce different compressed bytes and requires a reviewed new package. No creation timestamp enters the generated manifest, so repeated runs with the same inputs/runtime reproduce it.

The GLB framing check found glTF 2.0 with one JSON chunk (184,636 bytes) and one embedded BIN chunk (124,920,380 bytes). All buffer views stay within the embedded buffer, and all 126 PNG images reference embedded buffer views. A recursive check of the entire JSON, including extension payloads, found **zero URI fields**. No external resource fetch is needed by this model. The inspected model contains 1 scene, 144 nodes, 131 meshes, 100 materials, 126 textures and no animations; these are actual GLB counts, distinct from the source builder's counts including hidden alternatives.

The manifest also pins hashes of both source manifests, the source Git revision, units/axes, compression runtime, the verification results and extension inventory. It contains no password, identity record, storage credential, cloud URL or absolute user filesystem path. Keep its repository source paths out of public content contracts; a protected endpoint should expose only its permitted release metadata. Transport integrity does not grant access: private bytes and metadata must be delivered only after server-side authorization with the separately verified cache policy.

## Fidelity and engineering limits

The decoded-file equality preserves every existing geometry, material, texture, transform and coordinate byte. It does not establish that another viewer reproduces source shading, lighting, shadows, reflections or procedural behavior. The source GLB retains optional `EXT_materials_bump`; a loader needs explicit support to display that bump detail. No extension is marked required. Other declared extensions are `KHR_materials_clearcoat`, `KHR_materials_ior`, `KHR_materials_emissive_strength`, `KHR_materials_unlit` and `KHR_texture_transform`. Gzip packaging adds no decoder or rendering support.

The export is the architectural display profile with four pew blocks and open doors, native generated texture resolution and unquantized geometry. It excludes dynamic engineering equipment/overlays, the engineering simulator, schedules, source drawings and editing/physical controls. The complete offline tool remains the owning source for those capabilities. Missing fans or supports in this profile are not evidence of concealment: the [central-view/all-hidden constraint](../engineering/central-view-constraint.md) remains in force, and exposed centreline fan schemes remain excluded. Ornament is a visualization proxy. The [existing viewer limitations](viewer.md#documentation-and-engineering-impact) retain lighting shortfalls, wing speech clarity, ambo/altar feedback, airflow, concealed mounting/maintenance, route/control approval and specialist-review holds. No construction or purchasing approval follows from a matching hash.

Reviewed for this package: the sharing manifests/README, `scripts/web/export-visit.mjs`, [viewer delivery](viewer.md), [data boundary](data-boundary.md), [publication permission](publication-permission.md), [phase-05 scope](../../plan/phases/05-protected-review.md), [data/publication requirements](../../plan/data-and-publication.md) and the central-view constraint. The source GLB and source model/equipment/routes are unchanged, so no dimensional, electrical or category-register refresh is warranted. Verification here covers local byte integrity, deterministic compression and embedded resources. Browser appearance, desktop performance, protected delivery and the broader G5 simulator/documents/register acceptance remain separate work.
