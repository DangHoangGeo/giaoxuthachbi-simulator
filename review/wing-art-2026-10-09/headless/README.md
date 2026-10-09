# Wing saints headless verification

Run from the repository root:

```sh
node scripts/verify_wing_art.cjs
python3 scripts/build_saint_textures.py --check
```

The suite loads actual viewer geometry and simulator modules through the existing study adapter. Browser, GPU, audio and storage services are isolated stubs. Adapter-only instrumentation exposes its existing in-memory storage and seeds saved layouts; no user browser storage is read or changed. Injected quota failures are deliberate test inputs.

[art-results.json](art-results.json) records source SHA-256 values, native artwork identity, the four mesh envelopes and 47 software cases. Every loaded source must stay unchanged during an ordinary run. During coordinated parallel work, `--allow-electrical-edits` can explicitly exclude the separate electrical module from the freeze assertion; both beginning and final hashes and the exclusion are recorded. Such a run still exercises the actual loaded electrical module, but must be repeated after that module changes before a coordinated handover.

[source-freeze-interruption.json](source-freeze-interruption.json) preserves an earlier attempt invalidated when the reference gallery module was regenerated during the run. It describes that earlier attempt only. The current result is the fresh `art-results.json` status and matching source fingerprints.

The checks cover native 1024 × 1536 pixels and exact SHA-256 values, offline pointers, independent decoding of the two packaged data URLs back to byte-identical native PNGs, four stable picture IDs, unpowered decoration absent from mains schedules/routes, zero demand/rating change, complete frame and mesh envelopes between window edges, conservative complete-pair additions and reserved-ID collisions, immutable migration inputs, scoped explicit adoption, complete durable backup, unrelated edited equipment and opposite-wing art, settings/scenes/notes, actual fixture types, undo/redo, current no-op, storage failures, saved-layout startup and reload after deleting an entire pair.

Expected warnings from injected backup and save failures document that the preceding layout was retained. A passing software result does not approve the final artwork, frame dimensions or material, public-use rights, fixing, wall substrate, maintenance access, engineering performance or construction. GPU texture appearance and desktop controls require separate visual review. Existing sound, lighting, ventilation, feedback and sightline limitations remain independent of this test.
