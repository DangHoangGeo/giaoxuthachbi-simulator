# The 3D visit: the project's own viewer on the website

**Implemented 10 October 2026. Design in development, not for construction.**

**Owner decision, 10 October 2026 (USER CONFIRMED):** the website's 3D model should be as close as possible to the local model; a private version is no longer needed and everything may be public. The owner chose to put the real viewer on the website in a visit-only mode, without the Simulator editing tools.

## What changed and why

Until 10 October the website showed a separate exported copy of the model (a compressed GLB from source revision `c151c71`, 8 October) drawn by a small web-only scene. It differed from the local viewer in three ways that could not be closed by re-exporting:

| | Exported copy (retired) | Local viewer |
| --- | --- | --- |
| Content | Building shell and pews only. No lights, fans, loudspeakers, statues, wing saints or outlets. Frozen at 8 October. | The recommended design with every modelled item, always the current revision. |
| Appearance | 512 px textures, no bump detail, flat background, two fixed lamps, no shadows. | Full procedural textures, sky, sun and shadows, modelled lamps, day and evening scenes. |
| Download | 8.6 MB compressed model, plus the web scene code. | About 5.4 MB compressed for the whole viewer (measured below). |

The website now serves `Thach_Bi_Viewer/` itself. There is one model, so the website cannot drift from the local version again.

## How it works

- `/vi/visit` and `/en/visit` keep the site shell, the “In development · Not for construction” notice and an explicit **Enter 3D** button. Nothing from the viewer is requested before the visitor enters.
- On entry the page embeds `/viewer/OPEN_CHURCH.html` in a frame from the same site. A link opens the same address full size in a new tab.
- [web/scripts/viewer-files.mjs](../../web/scripts/viewer-files.mjs) is the single definition of what is published: the entry page, every script and stylesheet in `Thach_Bi_Viewer/` and `Thach_Bi_Viewer/simulator/`, `planning/`, the three.js licence, and each `references/` image that those files name and that exists. Markdown notes, manifests and unreferenced images are not published.
- [web/scripts/prepare-viewer.mjs](../../web/scripts/prepare-viewer.mjs) copies those files to `web/public/viewer/` before `npm run dev` and `npm run build`. The folder is generated and ignored by Git. Files are copied byte for byte. The only change is that the entry page's `<html>` element receives `class="visit-only"`.
- [web/scripts/check-viewer.mjs](../../web/scripts/check-viewer.mjs) runs in every build and fails unless the copy has exactly that file list and those bytes.
- The site's `X-Frame-Options: DENY` header stays on every page. Only `/viewer/*` is `SAMEORIGIN`, so the viewer can be framed by this site and by no other.

## Visit-only mode

The mode lives in the viewer, so it can be tried locally at `Thach_Bi_Viewer/OPEN_CHURCH.html?visit`.

| In visit-only mode | Behaviour |
| --- | --- |
| Simulator button and panel | Hidden, and `setOpen` refuses to open the panel. All scene editing (select, drag, add, delete, duplicate) already requires the open panel, so none of it is reachable. |
| Saved layouts | The engine uses its own key `thachbi.visit.v1` and clears it on every load. It never reads, migrates or overwrites `thachbi.simulator.v1`. Every visit starts from the recommended design. |
| Kept | Explore and Walk, Discover places, the map, day and evening, view settings, references, the cinematic tour, the three technical tours (lighting, fans and air, sound; since 11 October 2026), the **Controls** dock that switches the modelled lights, fans and sound scenes, and the estimate read-outs. |
| Notice | “Design in development · Not for construction · Đang phát triển · Không dùng để thi công” stays on screen. |

Nothing in the viewer operates equipment in the church. The technical tours show the simulator's analysis maps and quote its figures for the recommended design in the scene the visitor has chosen; they switch nothing and each one closes on “Estimates, not measurements” and the design status. The estimate read-outs are the simulator's planning estimates with their documented limitations ([methods and limitations](../simulator/methods-and-limitations.md)); showing them publicly does not make them measurements or approvals. The known unmet design targets are unchanged.

## Measurements, 10 October 2026

Local production build served by the standalone server on an M-series Mac, desktop Chromium, 1280 × 800:

- Start-up of `/viewer/OPEN_CHURCH.html`: 32 requests, **5,433 KB transferred** (8,791 KB decoded), no reference image requested.
- Published copy: 62 files, 71.3 MB on disk. About 58 MB of that is 22 Full HD reference images that load only when a visitor opens References or when start-up fails.
- The viewer reached `church.ready` in the frame and showed all 354 items of the recommended design.

Start-up previously fetched two fallback pictures (5.4 MB) even when the viewer started normally. `startup.js` now fetches them only if start-up fails.

These are lab observations on one machine. They are not a measurement on the parish computer or network, and frame rate on modest hardware has not been measured. The viewer's existing “light graphics” option remains available.

## Limits and open items

- **Language:** the viewer's interface is in English. The page around it is bilingual, and the Vietnamese page says so. Translating the viewer is not done.
- **Desktop only**, as the owner scoped on 8 October 2026. No phone testing or phone layout.
- **Hosting setting:** the build reads `../Thach_Bi_Viewer` from outside the `web` root. The Vercel project must allow source files outside the root directory. This is verified by the preview build of the pull request, not by local checks.
- **Broken image names:** `bundle.js` still names seven reference images that were moved on 7 October. The viewer tolerates their absence. They are not published and not fixed here.
- `planning/index.html` links to a Markdown document outside the viewer; that link does not resolve on the website. The rendered brief beside it does.
- The estimate read-outs, sightline tools and seating options carry the same limitations as in the local viewer. No engineering hold is closed by this change.

## Retired on 10 October 2026

- The exported web model: `web/public/models/*.glb.gz`, `web/content/visit.json`, the web scene in `web/src/lib/viewer/` and its model checks. The old record is in Git history at `23e48f1` and its evidence stays in [review/web-visit-2026-10-08](../../review/web-visit-2026-10-08/README.md).
- The password-protected full-detail preview: see [access control](access-control.md) and [private model package](private-model-package.md).
- The GLB exporter [scripts/web/export-visit.mjs](../../scripts/web/export-visit.mjs) and its toolchain remain for anyone who wants a model file for another program. The website no longer uses them.

## Checks

See the [evidence record](../../review/web-public-viewer-2026-10-10/README.md) for commands and results.
