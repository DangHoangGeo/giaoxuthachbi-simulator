# Phase 01 — Framework and delivery foundation

Status: **not started**. Depends on phase 00's approved publication boundary and safe fixtures. Read [architecture](../architecture.md) and [quality gates](../quality-and-release.md).

## Outcome

A reproducible Next.js application shell in `web/`, with route and data boundaries that can safely support later public and protected features. The existing offline viewer continues to work.

## Inputs

Framework decision, public-safe content/schema fixtures, allowed locales, target browser/device baseline, and owner-approved hosting target if preview deployment is requested. Actual private records are unnecessary at this stage.

## Work packages, in order

1. **Scaffold and pin.** Recheck official support/security guidance, select stable compatible Next.js/React/Node versions, and create TypeScript App Router under `web/`. Use one package manager (npm unless an existing project decision supersedes it), commit its lockfile and runtime requirement. Add `.env.example` with names/descriptions only. Do not introduce a workspace orchestrator or move the legacy viewer.
2. **Create the route shell.** Implement `vi`/`en` routing, accessible navigation, page metadata, language preservation, loading/error/not-found states and responsive typography. Keep unimplemented private routes inaccessible and absent from public navigation; a placeholder is not protection. Public HTML must read sensibly without WebGL or client JavaScript.
3. **Implement data boundaries.** Add validated public-content readers, separate server-only protected interfaces and explicit release IDs. Reject unknown fields in the public export allowlist. Use synthetic private canaries to test that private paths/strings cannot leak into generated public files or bundles.
4. **Establish checks.** Add lint/typecheck/unit/build scripts and browser smoke tests. Test localized deep links, redirects, no-JS text, error states and safe failure on malformed manifests. Keep future auth disabled until phase 05 implements it; no temporary password, fake production login or public “private” dataset.
5. **Prepare delivery configuration.** Document `web/` as Vercel root, Next.js preset, frozen-lockfile install/build commands and the boundary between package inputs and private storage. Local clean-clone builds must work without production credentials. Cache/install output may be disposable; lockfile and release contracts are not.
6. **Connect a preview when authorized.** Confirm team/project, branch policy, region for private reads, budget and environment separation. Use preview-safe data and credentials. Community fork PRs run unprivileged checks; do not expose secrets via privileged CI or arbitrary preview code. Verify the actual preview routes, rather than treating a completed build as end-to-end success.

Suggested commit boundaries: framework/toolchain; route shell; schema/boundary tests; CI/preview configuration and runbook. Run each package's checks before its commit.

## Planned deliverables

- `web/package.json`, lockfile, runtime pin, TypeScript/configuration and route shell.
- `web/src/lib/contracts/` and separate public/server-only readers.
- Public-safe test fixtures, test scripts and CI workflow with least-privilege permissions.
- `docs/web/development.md` and `docs/web/deployment.md` containing exact working commands and configuration.

## Checks and exit gate G1

- [ ] Clean clone → locked install → lint/typecheck/unit tests → production build succeeds under the documented runtime.
- [ ] Public shell routes and deep links work in browser; errors and missing content remain understandable.
- [ ] No model, simulator, protected fixture or production secret appears in initial public assets.
- [ ] Existing offline opening workflow remains usable; run model checks if its code was touched.
- [ ] Root-directory/include-files rules are proven by inspecting production build artifacts.
- [ ] Authorized preview is inspected on phone and desktop, or cloud setup is explicitly still pending; no claim of deployment readiness without it.

## Risks and handover

Do not run the full legacy simulator during server rendering. Browser-only code must be behind a client boundary with cleanup. If hosting/account input is unavailable, complete local outputs and record the exact pending preview check; do not provision a substitute account. Pass the documented commands, content contract and validated shell to phase 02.
