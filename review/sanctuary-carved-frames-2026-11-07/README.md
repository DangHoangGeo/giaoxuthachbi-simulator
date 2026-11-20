# Rich sanctuary carving and continuous ceiling grid · 7 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner requested more professional gold carving approaching the approved concept on the main arch and side shrines. The owner then supplied a screenshot showing the visual break at the broad cove, requesting a continuous red grid from the upper ceiling onto the sides. That screenshot is an appearance instruction and is retained by the owner outside the repository.

## Carving and grid

The approved [sanctuary concept](../../Thach_Bi_Viewer/references/02-sanctuary/concepts/09-sanctuary-approved-concept.png) is the art source. Broad rolled paired volutes, overlapping veined fronds and three-ring floral centres form two fitted borders on each of the five lobed frames. Similar borders enrich the central niche shoulders and both shrine canopies. The central and shrine pilasters use fuller linked scroll repeats. Red satin grounds leave the gold sculpture legible. The motifs are authored interpretations with artist and material review pending.

Four shared transverse stations continue from the chamber ceiling across the cornice and plumb cove to both side vaults. Two red horizontal strips divide each previously blank plumb face. Gold bosses are seated closer to the side-rib surface, and the transverse rib profile is shallower to clear existing fittings. The actual boarding profiles and longitudinal light-bearing ribs retain their design basis. See the [owning specification](../../docs/sanctuary-model.md#rich-carved-frames-and-continuous-red-ceiling-grid--7-november-2026) for coordinates, source derivation, proxy sections and holds.

## Visual evidence

| View | Before | After |
| --- | --- | --- |
| Main arch, day | [Before](before-main-arch-day.jpg) | [After](after-main-arch-day.jpg) |
| Main arch, evening | [Before](before-main-arch-evening.jpg) | [After](after-main-arch-evening.jpg) |
| Marian shrine, day | [Before](before-mary-day.jpg) | [After](after-mary-day.jpg) |
| Marian shrine, evening | [Before](before-mary-evening.jpg) | [After](after-mary-evening.jpg) |
| Joseph shrine, day | [Before](before-joseph-day.jpg) | [After](after-joseph-day.jpg) |
| Joseph shrine, evening | [Before](before-joseph-evening.jpg) | [After](after-joseph-evening.jpg) |
| Cove grid, day | [Before](before-cove-day.jpg) | [After](after-cove-day.jpg) |
| Cove grid, evening | [Before](before-cove-evening.jpg) | [After](after-cove-evening.jpg) |

Inspect the [rolled arch carving](detail-arch-scroll-day.jpg), [shrine border](detail-shrine-scroll-day.jpg) and [shrine pilaster](detail-shrine-pilaster-day.jpg) at close range. The selected native canvas captures have no image enhancement or resampling. Desktop viewport is 1600 × 1000 for comparisons; the viewer's adaptive graphics policy controls the native canvas size. The main-arch pair is 1442 × 901. Other captures follow the recorded desktop quality policy.

| Camera | Position X,Y,Z in metres | Target X,Y,Z in metres |
| --- | --- | --- |
| Main arch | 32, 2.1, 0 | 46, 7.1, 0 |
| Marian shrine | 45.2, 2.7, -4.4 | 48.8, 5, -5.5 |
| Joseph shrine | 45.2, 2.7, 4.4 | 48.8, 5, 5.5 |
| Cove | 45.5, 3.6, 0 | 46.3, 8, 3.9 |
| Arch scroll close-up | 42.5, 10.2, -0.7 | 44.175, 10.7, -1 |
| Shrine border close-up | 47.2, 6.35, -5.3 | 48.93, 6.45, -6 |
| Shrine pilaster close-up | 47.4, 4.1, -4.36 | 48.93, 4.2, -4.36 |

The controlled before/after comparison uses base e1f5a34 with this sanctuary-only change, excluding concurrent support-cladding, doorway and wing-lighting work. The current-project [main arch](integrated-main-arch-day.jpg), [cove](integrated-cove-day.jpg), evening views and close-ups include the subsequently committed 4598485 interior support-cladding, doorway and LW lighting revision. Source hashes are in the metrics files. Fresh browser profiles avoid anyone's saved engineering layout. These photographs of the viewer show a design-development model.

## Verification

- Model verification checks all twenty fitted fields against their actual backing contours and reserved openings, plus pillar/pinnacle bounds. Complete scroll repeats are omitted where they cannot fit.
- A straight tapered ribbon independently checks outward face orientation and enclosed volume. Its cross-section area is 1.32 × width × height, and width/height taper by (1 − 0.72t). For length 1 m, width 0.10 m and height 0.07 m, expected volume is 0.004183872 m³. This is a software geometry case, unrelated to a construction section.
- Grid checks enforce the same X stations on chamber, plumb cove and side vaults, the full plumb extent, eight cornice returns, four horizontal strips and retained coffer counts.
- Fixture-envelope and beam-axis checks now include the new carving, cove grid and floral bosses. Initial contacts with shrine accents and vault uplights were corrected through decorative profiles and boss seating. The final check retains the known ambo-key-light/abacus contact as an engineering hold.
- Current-project public viewer preparation and exact byte-copy verification pass for 83 files, 72,059,773 bytes. All 116 web unit tests pass in 12 test files.
- Actual desktop views cover both frame styles and two/four seating blocks. The integrated public visit records zero page/console errors, keeps the editing panel closed and records no engineering-layout reads/writes from startup through navigation and display changes. The [integrated visit record](integrated-metrics.json) and [normal-mode record](integrated-normal-modes.json) retain those results.
- The fresh full calculation audit uses the integrated current-project model. Its results and limitations are recorded before commit below. Final face-orientation and fine-midrib sampling corrections retain the analytical inputs and are separately covered by final model, fitting and beam checks.

## Rendering cost and limits

In the controlled main-arch comparison, draw calls remain 317 and triangles rise from 5,043,213 to 7,261,737, about 44%. Repeated source buffers are immutable and indexed, with finer sampling concentrated on visible leaf profiles. The integrated model records 303,278,558 display-buffer bytes versus 658,105,440 for expanded buffers, passing the existing memory target. These counters exclude textures and other GPU allocations. Frame rate on modest desktop hardware remains unmeasured.

The final carving pattern and tool-work remain for a commissioned artist to resolve. This pass improves modeled composition and relief. Craft authenticity, selected finishes, product photometry, gilding glare, material fire performance, support, maintenance and construction authorization remain pending. Existing feedback, speech, air, sightline and concealment holds remain open. The [category-register procedure](../../docs/electrical-grid/register.md) and [quantity summary](../../docs/electrical-grid/summary-report.md) require no ornament export because equipment, routes, IDs, coordinates, loads and controls have no changed field in this pass.

## Handover

The fresh [calculation audit](calculation-audit.json) passes, including the lighting, air, sound and grid operating rehearsals (17, 15, 14 and 12 steps). It includes 399 model items and the current LW/doorway revision. Existing low feedback margins remain at 0.9 dB for the ambo and 1.4 dB for the altar. Wing STI remains 0.410 minimum and 0.484 average. Minimum occupied-zone air speed remains 0.05 m/s, with 61% meeting the existing project target. These are model estimates. The audit loaded before final display-only winding and fine-midrib sampling corrections; final contour, analytical-volume, fitting and beam-axis checks were rerun and pass.

All new local documentation links, staged whitespace and captured-source hashes are checked. Unrelated entrance/ramp work and the owner's drawing files are preserved.
