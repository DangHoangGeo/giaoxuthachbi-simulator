# Delivery configuration and verified private preview

**Current development release, 8 October 2026:** `development-content-20261008-two` selects a limited introduction, two owner-reported milestones and sixteen AI concepts plus a separate lightweight architectural 3D visit as application inputs. The owner permits showing this project-created work with prominent “In development / Đang phát triển” and “Not for construction / Không dùng để thi công” notes; see [permission and scope](publication-permission.md). The private preview is now deployed and checked; real-site-photo and parish operating acceptance remain open, and full G2/G3 are held.

The initial sections record the local foundation; the private-review increment below records the confirmed hosting configuration. Exact new deployment verification is retained in phase evidence. Web01 created no Vercel project, domain, auth tenant, private store or production environment. The [selected pointer](../../web/content/current.json) now names the development release; that application state does not confirm a deployed URL. The existing church Vercel project is now connected to this GitHub repository; its settings were read through the CLI on 8 October 2026. The repository was private on that date. **Update, 10 October 2026:** the owner has made the repository public, and merging to `main` creates a Vercel production deployment (observed for `cf07b7c`; see H6 in the [publication checklist](../open-source/publication-checklist.md)). Contributions now go to `dev`, and promoting `dev` to `main` is a website release. The [development guide](development.md) contains the working local commands and the [data boundary](data-boundary.md) defines allowed build inputs.

## Update, 10 October 2026: the viewer is published and the private preview is retired

Owner decision (USER CONFIRMED): the website should show the same 3D model as the local viewer, and no private version is needed. See the [viewer document](viewer.md) and [access control](access-control.md). For hosting this means:

- **The build reads outside the `web` root.** `scripts/prepare-viewer.mjs` copies `../Thach_Bi_Viewer` into `web/public/viewer/` before every build. The Vercel project must allow source files outside the root directory, which reverses the “Disabled” line in the table below. Confirm it from the preview build of the pull request that introduced this change.
- **No runtime credentials.** The private Blob store, its connection variables and the shared password are no longer used by any code. The owner may delete the store and the variables; nothing in this repository did so.
- **Web checks** now also run when `Thach_Bi_Viewer/**` changes, and the workflow checks out `/web/` and `/Thach_Bi_Viewer/`. It still uses read-only permission and no credentials.
- **Every merge to `main` deploys production** (publication checklist, H6). A viewer change that reaches `main` is therefore a website change.

The sections below record the earlier configuration and are kept as history. Where they describe private inputs, a private preview or a private store, they describe what was retired on this date.

## Unprivileged checks

[Web checks](../../.github/workflows/web-checks.yml) runs on ordinary pull requests and pushes affecting `web/` or its workflow, on `main`/`web/**` branches. It uses read-only repository permission, a 15-minute cap, no deployment credentials, no privileged pull-request trigger, no cache shared with a publisher and no retained auth state. Checkout persists no credentials and requests only `web/` with a shallow sparse checkout. Sparse checkout limits working files; it is not a security sandbox for arbitrary code or a way to make a private Git repository public-safe.

Official `actions/checkout` **v7.0.1** and `actions/setup-node` **v7.0.0** are pinned to the exact commit SHAs returned from their own repository tag references on 8 October 2026. The action runtime is Node 24; the application runtime it installs is the separate pinned Node **22.23.3** / npm **10.9.9**. Workflow checks verify those versions before installation. The runner is Ubuntu 24.04; the local visual evidence uses macOS desktop Chrome. Headless Chromium CI does not replace that desktop inspection or testing on the actual parish machine.

The workflow runs locked install, lint, type generation/checks, unit tests, a high/critical dependency-audit gate, production build, artifact-boundary inspection and desktop browser journeys. `npx --no-install` uses the locked Playwright CLI to install its matching Chromium. No model build, original drawing, register, real site image or cloud credential is a test input. A new advisory or failing check must be reviewed rather than force-fixed or ignored. Account settings may still require approval for a fork's first run; those settings are not changed here.

## Proposed Vercel project settings

The owner connected the existing project to GitHub. Use `web` as the Root Directory for this application. The table distinguishes proposed build settings from the confirmed project/storage scope; release acceptance and longer-term operating ownership remain open. Verify platform support when those settings are applied.

| Setting | Proposed value / remaining decision |
| --- | --- |
| Root directory | `web` |
| Framework preset | Next.js |
| Install command | `npm ci` against `web/package-lock.json` |
| Build command | `npm run build` |
| Output directory | Framework default; do not set a static export directory |
| Include source files outside root | Disabled; no extra `includeFiles` or repository-copy step |
| Node | Supported Node 22 line, verify actual Vercel patch/npm compatibility with the pins before enabling |
| Public inputs | Only the reviewed `web/content` files and explicitly cleared `web/public` derivatives |
| Private inputs | Full-detail architectural gzip and policy/manifest in private Blob; runtime authenticated reads on phase-05 preview, never bundled originals |
| Preview environment | Verified phase-05 deployment with shared parish password and a bounded private share link; credentials are outside source |
| Branch/auto-deploy | Confirmed GitHub integration: production `main` remains `dd2538d`; phase-04 preview is READY. Phase-05 protected preview is on `web/05-protected-review`; phases remain unmerged |
| Region for private storage | Singapore `sin1`, private `thachbi-private-review` store; preview/development only |
| Project / team / plan | `giaoxuthachbi-simulator` / `danghoanggeos-projects` / existing Hobby; no paid plan change. Parish operating owner and longer-term budget remain open |

`rootDirectory` is a project setting, not a `vercel.json` key. No guessed project configuration or CLI deployment token is committed. The loopback standalone server is for local verification; Vercel uses the framework's native build output. The platform controls its runtime patch versions, so local reproducibility is not proof that a cloud build will accept the current engine constraints.

## Preview and release handoff

Hosting, branch integration, private storage and scoped shared access are configured below. Parish administrators, budget/alerts, longer-term auto-deploy policy and the actual desktop/browser/site-network profile still need owner confirmation. Display permission is already recorded for the selected project-created work; remaining Web00 operating roles and rights outside that scope stay open. Configure the integration directly in its provider; credentials do not belong in chat or source.

When the owner-connected development preview is available, repeat the included route/locale/no-JS/error/denial and artifact checks on that exact preview; record its URL, commit, content hash and environment. Keep unfinished private paths inaccessible. Phase 07 requires the release scope, rights, operator ownership, recovery rehearsal and post-deploy checks before a completed public launch. Historical local G1 checks do not satisfy these later gates or establish deployment of the selected content.

Sources checked 8 October 2026: [GitHub secure workflow guidance](https://docs.github.com/en/actions/reference/security/secure-use), [Vercel build settings](https://vercel.com/docs/builds/configure-a-build), [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0). The Vercel deployments/CI skill informed the original foundation runbook; deployment actions and their evidence are recorded below.

## Private-review increment, 8 October 2026

The CLI confirmed the existing `giaoxuthachbi-simulator` project and GitHub integration: root `web`, production branch `main`, project setting Node 24.x, Hobby plan. The earlier statement that no target is known is historical. Phase-04 preview deployment was ready on the provider; the full-detail increment is deployed from `web/05-protected-review` at `d29331f`. See [access control and private storage](access-control.md) for the owner-selected shared password, preview/development-only store, and unchanged production boundary. [Cloud delivery evidence](../../review/web-private-review-2026-10-08/delivery.md) records the ready deployment, successful CI, password denial and actual full-model rendering. This scoped delivery does not complete G5 or certify release acceptance.
