# Performance review · 7 October 2026

Starting source revision: `89fcd19`. Three smaller read-only audit agents gathered
renderer, geometry and simulator/audio findings; the main agent implemented and
verified the changes. See [implementation notes](../../docs/simulator/performance.md).

The [baseline browser measurement](browser-baseline.json) used Chrome with ANGLE
Metal on an Apple M1 Pro, a fresh offline file URL, 1280 × 800 CSS pixels, device
ratio 1, default four-block layout and full-service equipment. Automatic quality
changes were disabled for the comparison. After a three-second warm-up, each
stationary nave scenario was sampled for six seconds. Median frame interval was
101.5 ms in day and 102.4 ms in evening, approximately 10 fps; p95 intervals were
117.2 and 120.1 ms. The baseline had 779 draw calls, 1,747,938 drawn triangles,
194 active emitters and approximately 364–366 MB reported JS heap. Heap is not
GPU memory and varies with garbage collection. These figures describe this test
machine and configuration, not every low-end PC.

Geometry checks preserve the full triangle stream, transformed vertex positions,
normals and UVs. Full verification and follow-up browser results are recorded
with each completed optimization below.

## Indexed geometry

Architectural display buffers: **140,895,744 → 93,545,556 bytes (33.6% less)**
for the standalone model check, retaining **1,467,664 triangles** and 136 material
batches. The simulator includes its additional structural variants and equipment.
[Model checks](model-indexed.log) and [simulator audit](simulator-indexed.log) pass;
[the strict simulator check](simulator-strict.log) retains the known low feedback
margins. All 24 independent estimate cases passed on the unchanged calculation code.

[Browser results after indexing](browser-indexed.json) confirm the same draw calls,
triangle count and emitter coverage. Startup was 3.39 s versus 5.22 s in the initial
run; these single startup samples are indicative, not a statistically established
speedup. Frame times remain approximately 10 fps, locating the next bottleneck in
lighting/shading. The fluctuating JS heap is not used to claim a memory percentage;
the directly counted geometry-buffer bytes above are reproducible.

Inspected [day](indexed-day.jpg), [evening](indexed-evening.jpg) and
[phone-sized cutaway/reference frame](indexed-phone.jpg) captures. The phone
capture includes a resize/compositing artifact at its bottom; final interactive
verification will use a settled viewport. No page errors were recorded. Source
geometry, equipment layout and calculation/export data are unchanged.

## Spatial lights and adaptive display

The next working revision is based on `8def66f`; its JSON `sourceCommit` identifies
that parent because the verified changes and evidence are committed together.
The [standard automatic profile](standard-auto/profile.json) was repeated after
other GPU and calculation checks finished. Chrome/Metal, viewport and default
equipment match the baseline; the new default uses the fast native-light split
and independent automatic resolution. Each case has nine seconds of warm-up,
five seconds stationary and five seconds of keyboard walking from the nave.

| Scenario | Median frame interval | p95 interval | Framebuffer at end |
| --- | ---: | ---: | --- |
| Initial full-resolution day, stationary | 101.5 ms | 117.2 ms | 1280 × 800 |
| Initial full-resolution evening, stationary | 102.4 ms | 120.1 ms | 1280 × 800 |
| Standard automatic day, walking | 38.4 ms (~26 fps) | 47.6 ms | 896 × 560 |
| Standard automatic evening, walking | 34.0 ms (~29 fps) | 42.0 ms | 896 × 560 |
| Light graphics + 4× CPU throttle, day walking | 29.2 ms (~34 fps) | 33.0 ms | 640 × 400 |
| Light graphics + 4× CPU throttle, evening walking | 29.1 ms (~34 fps) | 32.1 ms | 640 × 400 |

These are end-to-end mode comparisons, not an isolated algorithm speedup:
resolution, native-light budget and camera motion differ. Standard retains two
preview shadow sources; explicit light graphics disables shadows and antialiasing.
All 194 active emitters contribute in both. The [CPU-throttled profile](light-cpu4/profile.json)
uses the same M1 Pro GPU, so it does not establish performance on a weak GPU.
CPU throttling begins after startup. No old-PC frame-rate guarantee is claimed.

The cell grid averages 66.4 candidate sources and has a maximum of 86 for this
layout, versus 194 in the full loop. It builds once during each run and does not
rebuild on camera movement. Neither walking sample redraws the cached shadows.
[GPU comparisons](gpu-grid.json) pass all 32 cases with maximum channel error zero.
The independent cone test passes 1,819,840 coverage cases plus boundary/tangency
checks. Display-policy checks cover manual settings, adaptive floor, navigation,
idle invalidation, hidden tabs and resize.

Inspected standard [desktop day](standard-auto/day.jpg),
[desktop evening](standard-auto/evening.jpg), [phone day](standard-auto/phone-day.jpg),
[phone evening](standard-auto/phone-evening.jpg) and
[phone reference frame / two-block cutaway](standard-auto/phone-cutaway.jpg).
The corresponding [light phone capture](light-cpu4/phone-evening.jpg) shows the
expected reduced sharpness. Fresh phone contexts remove the earlier resize
artifact. [Saved-view PNG](standard-auto/saved-view.png) verifies synchronous
capture with `preserveDrawingBuffer` disabled. No page or console errors occurred.

[Intermediate experiment data](experiments.json) includes a rejected finer spatial
geometry batching trial: draw calls rose without a useful frame-time improvement,
so the original 136 architectural material batches were retained.

`verify_model`, all 24 `verify_estimates` cases and
`verify_simulator --report --estimates` passed again. Simulator calculation targets
remain explicitly unmet: low ambo/altar feedback margins, wing speech clarity,
some lighting locations and the documented ventilation/sightline limitations.
No physics formula, sample set, threshold, equipment layout or route export changed.
