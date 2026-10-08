# Lightweight public visit and detailed sharing model

**Implemented development preview, 8 October 2026. Not for construction.** Owner direction: keep the best model for direct file sharing, and keep the web version light. This separates a full-resolution architectural exchange file from the public display derivative. It does not replace the existing engineering simulator.

## Current deliverables

- `/vi/visit` and `/en/visit`: explicit Enter 3D, orbit/zoom, exterior/nave/sanctuary/overhead viewpoints, roof visibility, bounded central-aisle movement, Auto/Day/Night, low graphics, close, cancel/retry and a permanently available gallery link.
- [Detailed sharing package](../../exports/sharing/README.md): native-resolution GLB plus ZIP, kept locally outside the public build and Git large-file history. Exact source and delivery hashes accompany it. The original offline viewer remains in `Thach_Bi_Viewer/OPEN_CHURCH.html` with its complete engineering functionality.
- [Sixteen concept images](expanded-gallery-assets.json): original project artwork and native originals retained. Public derivative images are labeled concepts, not site photographs or exact model renders. The homepage now gives images and the 3D entry more space; gallery dates, credits and limitations remain in expandable details and the enlargement dialog.

## Reproducible export and chosen representation

The source is revision `c151c71c1f81ec327701c705822dc6dee252eaa6`. [Export input manifest](../../review/web-visit-2026-10-08/web-export-source.json) pins the eight actual builder files and their SHA-256 hashes. The authoring exporter builds the existing model with real browser Canvas textures and a deterministic visual-texture random seed. It reuses the same initialization anchors as the model check, clones existing display batches and scrubs public node/material metadata. No source file, calculation input, emitter, layout, threshold or sampling grid is edited.

Units remain metres: X toward the sanctuary; Y up from nave finished floor; Z centred on D/E, negative toward B, positive toward H. The profile includes open doors, four pew blocks and visible architectural display batches. Invisible alternatives are not exported. Source build-root counts include hidden groups and therefore differ from actual exported mesh counts.

| Profile compared | File bytes | Transfer / fidelity implication |
| --- | ---: | --- |
| Full-resolution architectural GLB | 125,105,044 | Native generated texture resolution, no geometry quantization; direct sharing only |
| Raw GLB with 512 px texture cap | 107,705,312 | About 37.9 MB at Node's default gzip; exceeds the 10 MB web scene target |
| WebP quality 80 then Meshopt, gzip level 9 | 24,685,140 decoded; **8,770,080 transferred** | Selected web copy; same 131 exported meshes and 1,377,320 triangles; 512 px textures and quantized positions/normals |

The compression order matters: convert textures **before** Meshopt. Running a generic rewrite after Meshopt can decompress geometry. Position quantization uses 16 bits, normals 14 and texture coordinates 16; coordinates outside the quantizer's supported UV range are retained without quantization. There is no mesh simplification. [Independent comparison](../../review/web-visit-2026-10-08/geometry-comparison.json) checks per-mesh world bounds, names, primitive counts and total triangles: maximum bound delta **0.00046344 m**, below the declared 0.002 m display comparison tolerance. This is not a per-vertex check or survey accuracy claim.

Known material difference: glTF-transform 4.5.1 does not preserve the optional `EXT_materials_bump` extension. The web copy loses this bump detail; the full-resolution sharing GLB retains it. Web lighting uses a presentation environment and ambient/directional lights. It is not the source photometric simulation. Source procedural/shader behavior, shadows and reflections are not guaranteed to match another GLB viewer. The conceptual artwork also contains ornament not yet fully modelled.

A generated GLB avoids shipping the legacy application and its private catalogs/editing capability, and reduces public transfer below the scene-byte target. A measured thin-procedural-adapter comparison has **not** been completed; this is a reversible development implementation, not closure of phase 04 package 1 or G4. Final local measurements were 7.984 seconds to interactive at 10 Mbps/100 ms, 9.3 ms p95 RAF cadence, and a 600-second five-cycle session with one canvas after each entry and successful context-loss retry. These are headed M1 Pro lab observations, not confirmation on the parish desktop; see [full review evidence and limitations](../../review/web-visit-2026-10-08/README.md).

### Commands

From the repository root, with pinned Node 22.23.3/npm 10.9.9 and web dependencies installed:

```sh
node scripts/web/export-visit.mjs /absolute/new/light-staging
node scripts/web/export-visit.mjs /absolute/new/full-staging full
npm ci --prefix scripts/web/toolchain
node scripts/web/toolchain/compress.mjs /absolute/new/light-staging/church.glb /absolute/new/compressed-staging
node scripts/web/toolchain/compare.mjs /absolute/new/light-staging/church.glb /absolute/new/compressed-staging/web.glb /absolute/new/compressed-staging/comparison.json
```

The original measured export used glTF-transform CLI 4.5.1. Its general pattern parser pulled in an unpatched braces advisory. The committed authoring toolchain therefore uses the same pinned glTF-transform core/extensions/functions 4.5.1 APIs directly, Meshoptimizer 1.2.0 and Sharp 0.35.5, without the CLI/pattern parser. A locked reinstall and audit pass with zero advisories. The direct-API decoded GLB exactly matches the measured CLI output. Python gzip level 9 with zero timestamp matches the original compressed artifact; Python/zlib versions are recorded in the compression result. It never enters the public application. Three.js/GLTFExporter/GLTFLoader are r186 (web package 0.186.0). Export directories must be new; the exporter refuses overwriting earlier evidence. The compressor creates and hashes a gzip file in private staging. Copy only that hash-named `.glb.gz` into `web/public/models/` and record its size/hash/decoded size/source revision in `web/content/visit.json`. Review provenance and decoded GLB before changing those two public inputs. The mandatory `check:media` rejects unknown manifest fields, wrong hashes/lengths, oversized output, private metadata/extras, external resource URIs, unpublished state and unlisted assets. Re-run build, boundary and browser checks.

[Three.js GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), and [glTF-transform Meshopt](https://gltf-transform.dev/modules/functions/functions/meshopt) describe the authoring/runtime format capabilities. Library support is not engineering verification.

## Runtime boundary and lifecycle

Three.js and the model load only after Enter 3D. The client checks the exact compressed SHA-256 and lengths before parsing. There are no source drawings, category Excel registers, simulator/editor/catalog/audio bundles, private schedules or physical commands in the public scene. Anonymous users can download the published derivative; its contents are deliberately public. Legacy localStorage layouts are neither read nor migrated. The sole new stored value is the display preference `thachbi.public-visit.atmosphere.v1`.

The Enter button is disabled in server-rendered HTML until hydration attaches its handler; this prevents missed clicks during cold slow-network route entry. The renderer caps device pixel ratio at 1.5; low graphics uses 1. It has one animation loop, pauses rendering while hidden, and releases geometries, materials, texture bitmaps, environment maps, observers and renderer on close/navigation. Fetch cancellation, decode cancellation cleanup and context-loss retry preserve the static alternative. No audio is loaded.

Auto uses the browser IANA timezone: day 06:00 inclusive to 18:00 exclusive, night otherwise. It checks each minute and on focus/tab resume, with a labeled daytime fallback when time detection fails. This is an atmosphere setting, not sunrise/sunset or lighting control. Pure timezone/boundary/DST fixtures are tested separately from GPU rendering.

Navigation is orbit plus a guided central-aisle camera at Y=1.6 m, Z=0, X clamped to 6–36 m. It is **not** a validated free-walking/collision system or an inclusive sightline study. Viewpoint buttons reset an orbit that becomes awkward. Equipment overlays omitted by this profile are not evidence that fans, lights or speakers have been concealed; the engineering concealment hold remains.

## Documentation and engineering impact

Reviewed: `docs/sanctuary-model.md`, `docs/church-view-renderings.md`, `docs/simulator/methods-and-limitations.md`, `docs/electrical-grid/controls.md`, `docs/electrical-grid/register.md`, `docs/electrical-grid/summary-report.md`, `plan/architecture.md` and the phase-04/quality plans. This export changes public appearance and behavior only. Model geometry, analytical source, equipment/route IDs, settings and quantities stay unchanged; new electrical/category exports would misleadingly imply an engineering revision, so none are generated. Source model verification and source hashes accompany the web checks.

Unresolved: low illumination at some seats, wing speech clarity, ambo/altar feedback, airflow, concealed mounting/maintenance, route/control approval and specialist inputs. Software checks do not resolve these. G4 remains open for the agreed parish desktop/network, adapter comparison, full navigation and complete release review. The branch stays unmerged until its phase exit criteria pass. No cloud URL has been verified.
