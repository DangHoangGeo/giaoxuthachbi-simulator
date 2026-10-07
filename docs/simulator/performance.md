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

No equipment, electrical route, control mapping or specification changed in this
rendering work. The existing category workbooks, plan data, schedules and summary
retain their owning design revision; regenerating them would only change export
metadata. Governing documents checked: [sanctuary](../sanctuary-model.md),
[systems brief](../interior-systems-plan.md), [lighting](../systems/lighting.md),
[simulator methods](methods-and-limitations.md), [controls](../electrical-grid/controls.md)
and [register workflow](../electrical-grid/register.md).
