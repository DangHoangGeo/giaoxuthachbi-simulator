# The viewer on the website: checks, 10 October 2026

Evidence for replacing the website's exported 3D model with the project's own viewer in visit-only mode, and for retiring the private preview. The design is described in [docs/web/viewer.md](../../docs/web/viewer.md). These are software checks on one development machine. They do not approve any engineering content and are not a measurement on the parish computer.

Source: branch `web/06-public-model`, based on `main` at `23e48f1`.

## Results

| Check | Command | Result |
| --- | --- | --- |
| Model geometry | `node scripts/verify_model.cjs` | Passed |
| Cinematic tour and short film | `node scripts/verify_cinematic.cjs` | Passed |
| Simulator calculation audit | `node scripts/verify_simulator.cjs --estimates` | Exit 0. Known unmet design targets are unchanged and still unmet. |
| Website lint | `npm run lint` in `web/` | 71 files, no findings |
| Website types | `npm run typecheck` | Passed |
| Website unit tests | `npm test` | 114 passed in 11 files |
| Website build | `npm run build` | Passed, including `check:media` (96 media files) and `check:viewer` (62 viewer files, 71,349,349 bytes, exact inventory and hashes) |
| Build boundary | `npm run check:boundary` | 2,320 entries inspected, no failures |
| Browser journeys | `npx playwright test` | 12 passed |
| Synthetic gallery harness | `npx playwright test --config playwright.gallery.config.ts` | 8 passed |

The browser journey “the viewer loads only on entry, in visit-only mode, and closes” confirms in a real browser that no viewer file is requested before **Enter 3D**; that the framed viewer reaches `church.ready`; that the Simulator button and panel are hidden; that `CHURCH_SIMULATOR.ui.setOpen(true)` does not open the panel; and that no `thachbi.simulator.v1` layout is written.

## Seen in the browser

Desktop Chromium at 1280 × 800, local production build:

- [visit-page-vi-day.jpg](visit-page-vi-day.jpg): the Vietnamese visit page with the viewer framed, daytime exterior, no Simulator button. This capture was taken before the development notice was moved from the bottom of the viewer to the top.
- [viewer-sanctuary-evening.jpg](viewer-sanctuary-evening.jpg): the published viewer opened directly, evening sanctuary, with the notice at the top.

Start-up of the published viewer: 32 requests, 5,433 KB transferred, 8,791 KB decoded, no image request, no console error. In the viewer served from the working tree, visit-only mode showed 354 items and left an existing `thachbi.simulator.v1` layout in that browser untouched.

## Not checked

- Local checks ran on Node 22.22.2 and npm 10.9.7 with the engine check relaxed, because the pinned Node 22.23.3 is not installed on this machine. GitHub Actions runs the same commands on the pinned versions.
- The Vercel build, which must read `Thach_Bi_Viewer/` from outside the `web` root. The pull request's preview build is the test of that.
- Frame rate and loading time on the parish computer and network.
- Sound playback of the films inside the framed viewer.
- Phone layouts, which are outside the owner's desktop-only scope.
