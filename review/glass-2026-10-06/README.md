# Glass and seating review — 6 October 2026

Checkpoint of all previous changes: `8ddc03d`.

The viewer starts with coloured curved window heads and clear rectangular
bodies. The twelve duplicate full-height saint panels are removed. All three
entrance-door fanlights now use the coloured artwork with normalized UVs.
Leaded panes use locally generated colour, bump and roughness maps with physical
reflections. Repeated designs share materials to limit rendering overhead.

Indoor palms disappear in two-block seating and restore in four-block seating
when their individual visibility is enabled. Their walk colliders follow the
same rule. Electrical rebuilds and isolation preserve that visibility. Outdoor
courtyard trees retain their separate visibility switch.

Validation:

- `node scripts/verify_model.cjs`: passed, including forty clear window bodies,
  all coloured curved panes, removed overlays, UV bounds and repeated toggles.
- `node scripts/verify_simulator.cjs --estimates`: passed, including palm
  visibility/collision changes, manual visibility, outdoor palm independence,
  electrical rebuild/isolation, and existing fixture/calculation checks.
- The strict simulator command retains the existing microphone-feedback and
  acoustic design targets documented in the earlier stats audit; its low
  feedback-margin warning failure is unchanged by this glass update.
- Browser: default Coloured selection, repeated clear/coloured switching,
  repeated two/four-block switching, day/evening views and entrance glazing.
  No browser errors were reported. Results are in the adjacent JSON files.
- Syntax checks and `git diff --check`: passed.

`check.html` is a local review harness for the actual viewer, with camera and
inspection controls. Screenshots retain the viewer UI and crop only that
harness's test toolbar.
