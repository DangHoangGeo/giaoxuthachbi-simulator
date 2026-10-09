# Delivery configuration and pending cloud setup

This is a local foundation, not a deployment record. Web01 creates no Vercel project, domain, auth tenant, private store or production environment. Public content remained unpublished and the repository was private when Web01 was recorded. **Update, 10 October 2026:** the owner has made the repository public, and a Vercel project connected to it now deploys `main` as production (see hold H6 in the [publication checklist](../open-source/publication-checklist.md)); the settings table below predates that connection and has not been reconciled with it. The [development guide](development.md) contains the working local commands and the [data boundary](data-boundary.md) defines allowed build inputs.

## Unprivileged checks

[Web checks](../../.github/workflows/web-checks.yml) runs on ordinary pull requests and pushes affecting `web/` or its workflow, on `main`/`web/**` branches. It uses read-only repository permission, a 15-minute cap, no deployment credentials, no privileged pull-request trigger, no cache shared with a publisher and no retained auth state. Checkout persists no credentials and requests only `web/` with a shallow sparse checkout. Sparse checkout limits working files; it is not a security sandbox for arbitrary code or a way to make a private Git repository public-safe.

Official `actions/checkout` **v7.0.1** and `actions/setup-node` **v7.0.0** are pinned to the exact commit SHAs returned from their own repository tag references on 8 October 2026. The action runtime is Node 24; the application runtime it installs is the separate pinned Node **22.23.3** / npm **10.9.9**. Workflow checks verify those versions before installation. The runner is Ubuntu 24.04; the local visual evidence uses macOS desktop Chrome. Headless Chromium CI does not replace that desktop inspection or testing on the actual parish machine.

The workflow runs locked install, lint, type generation/checks, unit tests, a high/critical dependency-audit gate, production build, artifact-boundary inspection and desktop browser journeys. `npx --no-install` uses the locked Playwright CLI to install its matching Chromium. No model build, original drawing, register, real site image or cloud credential is a test input. A new advisory or failing check must be reviewed rather than force-fixed or ignored. Account settings may still require approval for a fork's first run; those settings are not changed here.

## Proposed Vercel project settings

Apply these only after the owner specifies the actual team/project, preview policy, billing owner/budget and authorizes connecting the repository. Verify current platform support at that time.

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
| Private inputs | None today; later runtime authorization/storage only, never bundled originals |
| Preview environment | Owner-approved target with synthetic/public-safe inputs, no production credentials |
| Production branch/auto-deploy | Explicit owner decision before connecting; a merge must not accidentally publish |
| Region for private reads | Pending storage/provider jurisdiction and owner choice; no guess |
| Public domain, team, budget, billing owner | Pending |

`rootDirectory` is a project setting, not a `vercel.json` key. No guessed project configuration or CLI deployment token is committed. The loopback standalone server is for local verification; Vercel uses the framework's native build output. The platform controls its runtime patch versions, so local reproducibility is not proof that a cloud build will accept the current engine constraints.

## Preview and release handoff

The owner still needs to identify the hosting team/project and administrators, allowed preview branches/access policy, private data region, budget/alerts, production auto-deploy policy and actual desktop/browser/site-network profile. Rights/publication owners remain Web00 holds. No credential should be pasted into chat or committed; any later approved integration is configured directly in its provider.

After an authorized preview exists, repeat the included route/locale/no-JS/error/denial and artifact checks on that exact preview; record its URL, commit, content hash and environment. Keep unfinished private paths inaccessible. Phase 07 requires the release scope, rights, operator ownership, recovery rehearsal and post-deploy checks before public launch. A local passing G1 does not satisfy these later gates.

Sources checked 8 October 2026: [GitHub secure workflow guidance](https://docs.github.com/en/actions/reference/security/secure-use), [Vercel build settings](https://vercel.com/docs/builds/configure-a-build), [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0). The Vercel deployments/CI skill informed this runbook; no deployment action was taken.
