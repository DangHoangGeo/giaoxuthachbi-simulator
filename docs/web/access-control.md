# Access control: retired

**Retired 10 October 2026 by owner decision (USER CONFIRMED):** “we don't need a private version anymore. everything could be public now.”

From 8 to 10 October 2026 the website had a password-protected route, `/vi/review` and `/en/review`, that served a full-detail model from private storage after a shared parish password. It has been removed:

- the routes under `web/src/app/[locale]/review/`, the request proxy `web/src/proxy.ts`, `web/src/lib/server/review/` and `web/src/components/private-review.tsx`;
- the publishing script `web/scripts/publish-private-model.mjs` and the packaging script `scripts/web/package-private-model.py`;
- the `@vercel/blob` dependency. The website now needs no runtime credentials.

The public [3D visit](viewer.md) now shows the project's own viewer, which is more complete than the retired private model.

## What the owner may still want to clean up

These exist outside the repository and were not touched:

- the private storage (Vercel Blob) holding the 53 MB model package and the shared-password record;
- the storage credentials in the Vercel project's environment variables;
- the local files `.env.private-review-access` and `.env.private-review-handover.txt`, and the package under `exports/private-review/`.

The shared password was never committed. It can simply be discarded once the storage is deleted.

## History

The design, tests and deployment evidence of the retired route are in Git history at `23e48f1` (`docs/web/access-control.md`, `docs/web/private-model-package.md`) and in [review/web-private-review-2026-10-08](../../review/web-private-review-2026-10-08/README.md). That evidence describes a route that no longer exists.

`web/src/lib/server/protected-content.ts`, which denies every protected read, is unchanged. Any future private feature needs a new design and the checks in [plan phase 05](../../plan/phases/05-protected-review.md).
