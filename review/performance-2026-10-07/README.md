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
