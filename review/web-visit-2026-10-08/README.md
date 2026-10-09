# Desktop gallery, public visit and sharing export — 8 October 2026

Development preview on `web/04-lightweight-visit`, branched from main `dd2538d` with verified gallery/timeline dependencies cherry-picked through `c151c71`. The owner requested the missing 3D and idea images, then directed a full-detail sharing model and lightweight web profile. [Delivery and limitations](../../docs/web/viewer.md) define the implemented scope. Main is not advanced: complete G4, parish-device and operating/release gates remain open.

## Verified package

- Visual homepage, sixteen dated/labeled project concepts, larger gallery images and expandable metadata; original sixteen native masters unchanged. The three initial public media records and two event records remain unchanged.
- Real read-only architectural 3D loaded on demand, with viewpoint/roof/day-night/quality/close controls, bounded central-aisle movement and static fallback. Full engineering simulator stays separate and unchanged.
- Full-resolution GLB: 125,105,044 bytes, with a 53,232,485-byte direct-sharing ZIP. [Checksums and handling](../../exports/sharing/README.md). These large files are local deliverables excluded from Git and public web output.
- Public model: 8,770,080 compressed bytes, 24,685,140 decoded. Direct authoring APIs reproduce the exact existing compressed hash; see [compression reproduction](compression-reproduction.json). The CLI was removed from the committed authoring dependency graph to avoid its unpatched pattern-parser dependency. App and final authoring toolchain audits each report zero advisories.
- [Geometry comparison](geometry-comparison.json): 131 meshes and 1,377,320 triangles preserved, maximum per-mesh world-bound delta 0.00046344 m. [Full versus raw web export](full-to-web-source-comparison.json) has zero bound delta. These comparisons are not per-vertex engineering certification.

## Checks

The source model check passed; [59 engineering/source hashes](unchanged-engineering.json) match the earlier reviewed source exactly. No equipment, route, register, analytical sampling, criterion or calculated input changed.

Pinned Node 22.23.3 / npm 10.9.9, Next 16.4.0, Three.js r186, desktop Chrome on macOS. Logs in this directory record lint, type check, **133 unit checks**, production build/content/media validation, boundary scan, **12 production browser tests**, **8 synthetic browser tests**, and app/authoring dependency audits. Headed production checks cover actual GPU entry, close/re-entry, read-only behavior, model failure, no-JavaScript gallery/visit fallback, language, keyboard/dialog and public routing.

Two discovered defects were fixed without weakening checks:

1. A public streaming loading boundary could leave complete gallery HTML hidden with JavaScript disabled; removing that boundary restores server-rendered reading. The interactive 3D loading/error state remains.
2. On a cold throttled route change, an early click on the server-rendered Enter button could be ignored before hydration. The button now stays disabled until its handler is attached. A regression test holds script downloads, checks disabled state plus the gallery fallback, then releases scripts and checks enabled state.

Synthetic tests now open the metadata details control before checking its note, and place the script-injection fixture in a currently rendered title instead of a removed homepage body paragraph. They still verify escaping and non-execution.

## Desktop evidence and outstanding checks

The final headed Chrome/M1 Pro/ANGLE Metal run used build `1WAT1D-QKfVwh3_eGjCPT`, whose application sources match `cbc1672`. [Raw desktop results](desktop/results.json) and [screenshots/method](desktop/summary.md) record:

| Check | Observed result |
| --- | --- |
| Cold home / gallery initial transfer | 280,474 / 581,190 bytes; JS 145,409 / 154,324 bytes; zero model requests before Enter |
| Enter at 10 Mbps down, 1 Mbps up, 100 ms latency | 7,984 ms to controls/canvas; model response 8,770,573 bytes including HTTP overhead; 8,938,456 total post-click bytes |
| Fixed 60-second viewpoint path | 7,200 RAF intervals; p95 9.3 ms; maximum 9.8 ms; zero over 33 ms |
| Ten-minute session | 600,028 ms, five full route exits/re-entries; zero canvases on exit and one on re-entry; no errors or horizontal overflow |
| JS heap samples | About 75–165 MB, falling after garbage collection; final 75.4 MB |
| Forced graphics-context loss | Retry appeared and restored canvas/controls |
| 1 Mbps fallback | Cancel visible after 59 ms before fetch; a separate in-flight probe aborted after 114,603 bytes with `net::ERR_ABORTED`, zero canvas, and gallery HTTP 200 |
| Full gallery after scrolling | All sixteen images decoded with positive naturalWidth; no failed images/errors |

These are local laboratory observations, not parish-device acceptance, field Web Vitals, GPU timestamps or a comprehensive GPU-memory leak proof. A separate software-Chrome test overlapped the final soak minutes, after the 60-second RAF measurement; those late heap/soak observations include that concurrent load. Temperature was not measured. [Supplemental notes](desktop/supplemental-notes.json) and [in-flight cancellation](desktop/low-bandwidth-active-cancel.json) qualify the measurements. The initial gallery screenshot includes intentional unloaded off-screen images: use [the scrolled all-images capture](desktop/vi-design-scrolled-all-images.png) for complete visual review. Its scroll-triggered image bytes are excluded from initial-transfer measurements.

The earlier initial run took 10,888 ms and exposed the pre-hydration Enter bug in its first soak cycle. Its [diagnosis](desktop/hydration-diagnosis.json) is retained; it is not a passing soak. The final run above verifies the fix. GitHub run [37782934382](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/actions/runs/37782934382) passed all checks on `cc63f2d`. Initial GitHub CI had stalled in software 3D; [the CI follow-up](ci-software.md) records the exact failure, explicit software-renderer configuration and unchanged functional/performance criteria.

Primary visual review covered all sixteen concept contact-sheet images and exterior, nave, sanctuary and roof-hidden model screenshots. The web model retains the two timber-column rows, pew aisles, sanctuary and exterior proportions. Its smaller textures omit optional bump detail and its presentation lights are brighter/flatter than the original artistic scene; this does not alter source materials or photometry. Portrait/phone testing is outside the owner's confirmed scope.

G4 remains open: no agreed parish desktop/network validation, measured thin-adapter comparison, full collision/walking study or complete release acceptance. No source-map/metadata scan is a universal secrecy proof. Model controls provide no construction approval or all-hidden equipment result. Existing illumination, wing speech, feedback, air/concealment and routing/control engineering holds remain unresolved. No cloud deployment URL is confirmed.
