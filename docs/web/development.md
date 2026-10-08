# Local web development

Phase 01 local foundation and phase 02 local gallery preparation, 8 October 2026. No public launch, cloud account or private viewer is enabled. Branch `web/01-framework` starts from main `9c37b38`; the private Web00 preparation remains unmerged at [`84edc9e`](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/tree/84edc9e). Its publication holds remain in force. No originals, engineering records or cleared launch media are copied into this application.

## Runtime and commands

Use Node **22.23.3** and its npm **10.9.9**, with the committed `web/.node-version`, exact package versions and single npm lockfile. Do not run another package manager. On this machine the patched runtime was downloaded into a task temporary directory from the official Node distribution; system Node was not replaced. The macOS arm64 archive SHA-256 is `23b25245dcfb9af7262f8ff142e9e2e0af025368117329e7a7458a51e5922f53`, checked against the same HTTPS distribution's `SHASUMS256.txt` (not a separate signature verification).

From the repository root, with that Node/npm on PATH:

```sh
cd web
npm ci
npm run lint
npm run typecheck
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
npm start -- --port 3100
```

`npm run dev` binds only loopback. `npm start` runs the standalone production server, also on loopback. Phase 02 adds `npm run check:media` as a mandatory pre-build check of all public media bytes and inventory; the [private media workflow](public-content.md#private-media-preparation) documents preparation and review. Sharp 0.35.5 is pinned explicitly as a development tool (the same version already present transitively). The build copies only `web/.next/static` and an optional `web/public` into standalone output. Never copy repository-level sources there. Run the browser suite after building; it starts and stops its own production server on port 3100:

```sh
PLAYWRIGHT_CHANNEL=chrome HEADED=1 npm run test:browser
```

This uses installed desktop Chrome and a fresh automation context. CI can use Playwright's installed Chromium instead. No phone profile is configured. Public text and language links work without JavaScript. `/` redirects to `/vi`; supported pages are `/vi`, `/en` and their `/about-this-site` and `/design` equivalents. Unimplemented review, site and sign-in paths return 404 and are absent from navigation. These 404s are not a substitute for phase-05 authorization.

The `(public)` loading boundary deliberately excludes the unavailable-path fallback, allowing the latter to send a real 404 before streaming. Error, missing-content and loading presentations are separate. Preview copy remains parish-review pending and the shell sends `noindex` metadata/headers; this does not provide confidentiality or publication approval.

## Dependency decisions

Next **16.4.0** and React **19.3.0** were checked against [Next's active support policy](https://nextjs.org/support-policy), [16.4 release](https://nextjs.org/blog/next-16-4) and [React versions](https://react.dev/versions). Node 22 remains a supported LTS line; use the patched [22.23.3 release](https://nodejs.org/en/blog/release/v22.23.3). Reassess its support window before launch and during maintenance.

TypeScript **6.0.3** is pinned and verified with the framework. [Biome **2.5.15**](https://biomejs.dev/installation/quick-start/) provides lint, accessibility/React rules, import organization and formatting. The initial ESLint configuration required either incompatible React/accessibility plugin peers on ESLint 10 or [end-of-life ESLint 9](https://eslint.org/version-support/). It also introduced an unpatched development-only braces advisory. Replace that stack with supported Biome rather than shipping peer overrides or an unsupported linter. The final full and runtime audits are recorded with the lockfile in the evidence package; no automatic force fix was used.

Tailwind **4.3.3** uses `@tailwindcss/postcss`. Tests use Vitest **5.0.3** and Playwright **1.64.0**. No canary framework, remote font download or external image is required. Audit results are point-in-time package checks, not a security guarantee; recheck on dependency updates and before release.

## Scope and evidence

The [framework evidence](../../review/web-framework-2026-10-08/README.md) records exact checks, visual review and source hashes. The `design-taste-frontend` and `vercel:react-best-practices` skills guided a simple server-rendered shell with isolated error interactions. Functional/accessibility scope takes priority over decorative motion; no perpetual animation, model rebuild or physical-system changes are part of this phase.

No production credentials are required. Keep `.env` files ignored; `.env.example` documents the current absence of integrations. The [strict public reader and disabled protected interface](data-boundary.md) are implemented with contract tests and a production artifact scan (`npm run check:boundary`). A clean-copy run, negative boundary probes and GitHub CI passed; see the [delivery evidence](../../review/web-framework-2026-10-08/delivery/README.md) and [deployment runbook](deployment.md). Cloud setup remains pending. Engineering target failures and publication/site/cloud input holds remain independent of this web shell.

The isolated synthetic gallery suite builds its own temporary presentation copy and serves loopback port 3120:

```sh
PLAYWRIGHT_CHANNEL=chrome HEADED=1 npx --no-install playwright test --config playwright.gallery.config.ts
```

This is test tooling only. It cannot approve publication or replace the real production build/boundary checks. See the [gallery workflow](public-content.md#gallery-and-narrative-presentation). Do not deploy the test copy.


Phase 03 adds `/vi/progress`, `/en/progress` and known stable event-ID pages. Actual content remains unpublished; unknown event IDs return 404. See [timeline behavior](timeline.md) and [maintainer staging](progress-publishing.md). `npm run build` now runs `check:content` before `check:media`. Existing `npm run test:browser` includes production timeline/GET/304/405/no-JS cases; `playwright.gallery.config.ts` includes synthetic gallery and progress cases. Both configs use separate output directories; running sequentially is the documented default. No authenticated, publication-write or physical-control route is added.
