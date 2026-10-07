# Viewer performance and memory

The 7 October 2026 optimization preserves the design geometry, all equipment IDs,
positions and settings, materials, emitter physics, collision model, source notes,
and analytical samples. It changes display storage and runtime work. It does not
resolve the documented lighting, feedback, wing clarity, ventilation or sightline
shortfalls.

## Geometry storage

[render-batches.js](../../Thach_Bi_Viewer/render-batches.js) builds indexed display
buffers directly from source meshes, one material per original top-level group.
It retains the original vertices, normal/UV seams and triangle order; it does not
weld, decimate or remove carving. Previously the viewer expanded every indexed
triangle into three independent vertices, then kept transformed copies of every
part until the final material buffer was assembled. Fixture prototypes now use
the same direct indexed merger. The original object hierarchy remains available
for source inspection, GLB export, picking and verification.

The group-to-display mapping still governs roofs, openings, seating and timber
variants. Static display meshes and the retained architectural source graph skip
matrix recomputation. Equipment and fan heads remain dynamic. If future code moves
an architectural source after batching, it must explicitly update its matrices and
rebuild the corresponding display geometry.

## Lighting work

[light-grid.js](../../Thach_Bi_Viewer/simulator/light-grid.js) divides the display
domain X [−24, 64), Y [−4, 40), Z [−32, 32) metres into 4 m cells. Each cell keeps
every point source, plus every spotlight whose infinite outer cone intersects the
cell's enclosing sphere. The sphere has a 2 mm margin and the cone is conservatively
expanded for Float32 upload rounding. A source is rejected only when it cannot
illuminate that cell. There is no brightness threshold, distance cutoff or
camera-dependent source removal. Surfaces outside the domain use the complete list.
Unsupported texture sizes also fall back to the complete list.

The texture-backed shader uses the original source order and the same physical
material calculation. Native lights are masked out of that list to avoid double
counting. The recommended layout averages 66.4 candidates per cell instead of 194;
the additional grid texture occupies 4,026,880 bytes. Camera movement and dimming
reuse the grid; source membership, position, aim or cone changes rebuild it.
`verify_light_grid.cjs` checks more than 1.8 million contributing-source cases and
cone boundaries. `verify_gpu_lighting.cjs` compares the grid with the complete loop
on the GPU, including domain boundaries, native-light mixing, lacquer, gold and
sheen. The recorded 32 cases have identical RGBA output.

Fresh layouts use the fast native-light budget; saved quality settings remain
respected. All lamps still contribute, with the same physical shading. The two
standard preview shadow slots retain their lamp identities. Camera-only native
pool reassignment reuses shadow maps; fixture edits and building/systems visibility
changes invalidate them. No analytical light, sound or fan input changes.

## Resolution and frame scheduling

**View settings → Preview resolution** defaults to automatic. It starts at up to
one device pixel per CSS pixel, bounded by a 1.3 million pixel starting budget,
then reduces the ratio in 0.15 steps during sustained slow frames, to a floor of
0.5. Full, 75% and 50% settings are explicit alternatives, relative to the existing
device-ratio cap of 1.5. The control displays the actual framebuffer dimensions.
Resolution adapts independently of the simulator's native-light budget. It affects
sharpness, not equipment outputs, material properties or analytical samples.

The **Use light graphics** button saves the current layout and restarts the offline
viewer with `?graphics=light`: 50% resolution, antialiasing off and preview shadow
maps off. Illumination and physical reflections remain active. This explicit mode
trades edge/detail sharpness and preview shadows for weaker hardware. The same
button restores standard graphics. PNG capture renders immediately before reading
pixels, allowing `preserveDrawingBuffer` to stay disabled.

Navigation renders at the available frame rate. A stationary view renders up to
approximately 30 fps while fans and other simulation updates remain current. Hidden
tabs stop the main viewer work; resume resets timing. The minimap writes to the DOM
only when its displayed position/orientation changes. No animation speed, collision
rule or analysis threshold is adjusted to make a benchmark pass.

## Equipment edits and controls

Circuit switches, dimmers, fan speed controls and sound faders update their fixtures
in a synchronous batch, then notify the map, control panels, audio and route layer
once. A single-item edit also emits once. Undo/import restores the complete layout
before notifying consumers, preserving the existing history boundaries and saved
IDs. Display-only settings no longer schedule a full lighting/acoustics/air analysis;
physical inputs still invalidate it.

Rebuilding a fixture releases its old private glow material and obsolete pendant
references. Selection outlines release both geometry and material. Live fixtures
and placement previews protect their shared prototypes; only the oldest unused
variants are evicted, retaining at most 32 unused prototypes. The copied primitive
cache retains at most 256 entries. Undo can regenerate an evicted variant from its
unchanged serialized parameters. Fan oscillation updates its moving hierarchy
directly; the physical fan source coordinates match the former full-fixture update.

Electrical schedules are recalculated from current inputs, while existing route
meshes keep their buffers whenever their exact points and displayed radius match.
Moved/removed equipment still changes/removes its route, with the same stable IDs.
The measured 32-light circuit action changed from 64 item notifications and 329
reallocated route geometries to one notification and zero reallocations. Twenty
forced fixture rebuilds now release all 20 old glow materials.

The simulator audit stress-tests nested/interrupted batches, undo/redo, live and
preview cache protection, more than 100 geometry edits, material disposal, route
reuse and unchanged fan source positions. `verify_viewer_controls.cjs` checks real
browser controls, moving blades, systems isolation and saved move/dim/deletion
through reload and import. Derived feedback margins are recalculated after reload,
not treated as user-entered fields.

Run `node scripts/verify_model.cjs` to verify source/batch triangle counts,
transformed positions, normals, UVs and buffer memory reduction, alongside the
existing geometry and navigation checks. Run `node scripts/verify_simulator.cjs
--report --estimates` for equipment and calculation consistency. Browser evidence
is recorded in [the performance review](../../review/performance-2026-10-07/README.md).

Additional checks: `node scripts/verify_light_grid.cjs` and
`node scripts/verify_viewer_performance.cjs`. Optional browser checks use an installed
Playwright module and Chrome; they add no dependencies to the offline viewer:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/verify_gpu_lighting.cjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/profile_viewer.cjs --out=/tmp/church-standard
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/profile_viewer.cjs --light --cpu=4 --out=/tmp/church-light
```

CPU throttling is applied after startup. It does not emulate a weaker GPU or prove
a frame rate on every old PC. Full resolution remains available for detailed review.

No equipment layout, control mapping or specification changes in this rendering
work. A pre-existing verification side effect was found: its temporary move test
restored equipment `L3`'s position but not its pendant anchor. The exported snapshot
therefore showed +10.394880 m instead of the actual model's +8.590 m anchor. The test
now restores both; the paired electrical exports, category registers and summary
are refreshed, correcting only route `drop:LC1:L1:light:-1:L3` from 8.391731 m to
7.005 m. This restores the existing model intent, not a new engineering route design.
Quantities, IDs, equipment output and entered workbook fields remain preserved.
Governing documents checked: [sanctuary](../sanctuary-model.md),
[systems brief](../interior-systems-plan.md), [lighting](../systems/lighting.md),
[simulator methods](methods-and-limitations.md), [controls](../electrical-grid/controls.md)
and [register workflow](../electrical-grid/register.md).
