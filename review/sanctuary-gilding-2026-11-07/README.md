# Sanctuary lacquer and gilding review · 7 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner requested more detailed gold carving on the sanctuary lacquer. The appearance reference is the project's [approved sanctuary concept](../../Thach_Bi_Viewer/references/02-sanctuary/concepts/09-sanctuary-approved-concept.png). Actual viewer images below document authored procedural relief. The image-generation provenance of the appearance reference remains in its original manifest.

## Appearance

Paired vines follow the lobed niche head and branch into curled shoulder scrolls, a central flower and an upper rosette. Folded, scalloped leaves carry tapered raised midribs. Four central and four side-shrine pilasters gain climbing stems with counter-leaves, small rooted volutes, buds and basal flowers. The broad lacquer field has lower grain contrast using its own copied material.

Review the [before detail](before-detail-day.jpg), [after detail](after-detail-day.jpg), [before evening](before-detail-evening.jpg) and [after evening](after-detail-evening.jpg). At nave distance compare the [before day](before-nave-day.jpg), [after day](after-nave-day.jpg), [before evening](before-nave-evening.jpg) and [after evening](after-nave-evening.jpg). The [off-axis day](after-off-axis-day.jpg) and [off-axis evening](after-off-axis-evening.jpg) inspect relief from a front pew. These are native canvas captures, without image enhancement or resampling.

The Crucifix and blue recess retain the central emphasis. Red gaps separate the leaves and scrolls. The lighting and exposure settings are the same in each before/after pair. Bright evening reflections on gilding require later glare and material-sample review. Fine sculpture, carving practice and fabrication remain for the artist and responsible designers to develop.

## Capture basis

The isolated viewer uses base commit 6669e2e plus the sanctuary-only change. Concurrent doorway, support-cladding and other edits in the shared working tree are excluded from this comparison. The before capture uses that commit's original sanctuary source. JSON files record the source SHA-256 and rendering counters. A fresh browser profile avoids loading anyone's saved engineering layout.

| View | Camera X,Y,Z in metres | Target X,Y,Z in metres |
| --- | --- | --- |
| Nave | 35, 1.65, 0 | 48, 4.5, 0 |
| Off-axis front pew | 39, 1.65, 2.2 | 48, 4.8, 0 |
| Three-quarter detail | 42, 4.5, -1 | 48.2, 6, 0 |

Desktop Chromium used a 1600 × 1000 viewport with the viewer's own rendering quality policy. Canvas pixel dimensions follow that policy. Six views in each set cover daylight and evening. The [normal-mode record](normal-modes.json) checks both drawing/reference frames and two/four seating blocks. The [after metrics](after-metrics.json) record zero page errors and verify visit-only mode blocks opening the editing panel. Instrumented engineering-layout reads/writes during navigation and display changes were empty.

The nave view rises from 277 to 278 draw calls and from 3,659,067 to 3,923,963 rendered triangles, approximately 7.2% more triangles. The extra material is the locally softened lacquer. Foliage is merged into existing named meshes before display batching. These counters describe this camera and hardware setup. Frame rate and modest-computer performance were not measured.

## Verification

- The isolated final model check passes, including new whole-contour tests for the raised foliage. Every projected vertex stays outside the niche hole, within the lacquer backing contour and in front of its surface. Existing pilaster bounds and pinnacle clearances also pass.
- Public viewer preparation and exact-copy verification pass for 83 files, 72,041,733 bytes.
- All 116 web unit tests pass across 12 test files.
- Normal desktop mode reports no page errors across both frame and seating options. Visit-only captures report no page errors, editing remains unreachable, and navigation/display changes make no engineering-layout reads or writes.
- The full simulator calculation audit and shared-tree model check are recorded at handover below.
- Local paths in the new documentation and staged whitespace are checked before commit.

No equipment, route, control, analytical boundary or physical material input changes in this decorative pass. The [sanctuary record](../../docs/sanctuary-model.md#lacquer-and-gilded-carving-detail--7-november-2026) lists the coordinated documents and explains why electrical exports and category workbooks require no refresh. Existing engineering holds remain open.

## Handover

The isolated calculation audit completed successfully with the existing unmet design targets retained. Feedback margins remain 0.9 dB at the ambo and 1.4 dB at the altar. Wing STI remains 0.410 minimum and 0.484 average. Air speed remains 0.05 m/s minimum, with 61% of receivers meeting the existing target. The audit loaded the first carving iteration; subsequent refinements affect display contours and leaf size with identical analytical inputs.

The shared-tree model check stops at an unrelated coloured-oval/fanlight count of 61 versus 63 during concurrent opening/exterior edits. The isolated sanctuary-only model check passes. Concurrent support-cladding, doorway and other edits are preserved outside this commit. All new local documentation links and staged whitespace pass.


## Architectural refinement

The first iteration is retained as the after images above. Following the owner's request for a senior architectural critique, a second pass develops three scales of carving. The larger crown scroll and mirrored niche foliage establish the composition. Counter-vines, capital friezes and rooted lotus bouquets articulate the panels. Fine foliate chasing follows the niche architrave, canopy band and lower friezes.

Review the [refined nave by day](refined-nave-day.jpg), [refined nave by evening](refined-nave-evening.jpg), [refined close-up by day](refined-detail-day.jpg), [refined close-up by evening](refined-detail-evening.jpg), [refined off-axis day](refined-off-axis-day.jpg) and [refined off-axis evening](refined-off-axis-evening.jpg). The same cameras and illumination settings are retained.

The underlying architectural and liturgical decisions retain their own sources. This review accepts the revision as a developed model study. Final sculpture, craft samples, gilding finish, substrate, durability, cleaning and glare still need artist and responsible-designer review. Proportioned procedural carving remains an interpretation of the approved art reference.


The final detailed nave capture records 278 draw calls and 5,031,929 triangles. Compared with the original 3,659,067-triangle view, the finer carving adds about 37.5% rendered triangles. Indexed relief assembly reuses the viewer's existing merger and preserves triangle shapes and normals. The model check records 253,189,282 display-buffer bytes versus 454,256,544 bytes for expanded buffers, passing the existing memory threshold. These are software counters. Frame rate on modest desktop hardware remains unmeasured.

The second pass uses the same engineering inputs as the completed full audit. Focused simulator/electrical verification passes with 366 installed components and 425 selectable runs. The final viewer copy check passes for 83 files and 72,045,738 bytes, and all 116 web unit tests pass. The final contour check covers the entire chased architrave, lower panel bounds, substrate contact and frieze envelopes in addition to the first-pass checks.


The lower seven panel grounds now use plain satin lacquer, allowing the raised gold bouquet to read clearly. Inspect the [lotus panel](craft-lower-panel-day.jpg), [capital frieze](craft-capital-day.jpg) and [paired pilaster carving](craft-pilaster-day.jpg). These close views use cameras at (47, 1.8, 0.9), (46.8, 6.05, 2.8) and (46.6, 4.2, 2.9) metres, aimed respectively at (48.12, 1.72, 0.9), (48.12, 6.15, 2.45) and (48.12, 4.25, 2.47). Their source hash and zero page-error record are in the [craft metrics](craft-metrics.json).

Final model verification passes after the plain-ground correction, including seven satin panel grounds and the separate retained patterned service-door panels. Local links, staged whitespace and correspondence between staged source and capture source hashes pass. Concurrent unrelated work remains outside the sanctuary commits.
