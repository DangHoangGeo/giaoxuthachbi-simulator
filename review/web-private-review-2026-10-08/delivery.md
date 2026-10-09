# Protected preview delivery — 8 October 2026

The full-detail architectural preview is deployed from **`d29331f7dffe808320c678d12fc2cc887cb1f830`** on `web/05-protected-review`. Package commit: **`c5fd000`**. Main remains `dd2538d`; the full engineering workspace gate G5 is still open and this phase is not merged.

- Deployment: `dpl_4x9r5v9YKd12oxNUy6W5YyddWZ8Y`, provider state **READY**. [Owner preview](https://giaoxuthachbi-simulator-8kojnh22k-danghoanggeos-projects.vercel.app/vi/review). This ordinary URL retains the Vercel account gate; Father's exact share URL is deliberately kept private.
- Existing project `giaoxuthachbi-simulator`, team `danghoanggeos-projects`, Hobby plan, `web` root, GitHub branch auto-deployment. No production promotion or plan upgrade. Function region reported `iad1`; private Blob storage is `sin1`. These are different regions; performance on the parish network remains unverified.
- [GitHub CI run 37789517080](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/actions/runs/37789517080) **completed successfully**: locked install, runtime pins, lint/typecheck, 201 unit cases, high/critical dependency audit, production build, boundary checks, 15 browser cases and 8 synthetic gallery/timeline cases. [Raw job metadata](cloud/ci-status.json) and compressed full log are retained.

## Father's access

The owner-selected shared parish credential and the exact provider share link are in the **ignored, mode-600 local file `.env.private-review-handover.txt`**. Neither appears in this record, Git or the site. The file contains brief Vietnamese/English desktop instructions. Share it privately with Father; no message has been sent on the owner's behalf.

The provider share link expires **7 November 2026 at 14:06:05 UTC** (21:06:05 Vietnam). The parish password expires **6 January 2027 at 13:37:36 UTC**. The earlier limit governs access. Renew/revoke the scoped provider share link through the existing deployment's sharing controls; rotate or disable the private application policy as documented in [access control](../../docs/web/access-control.md). Do not disable project-wide deployment protection.

This flow uses [Vercel's supported shareable link](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links) to pass the outer provider gate, then requires the parish password at server-side page and data reads. The connector returned 403 for share creation; the exact same endpoint/project/team succeeded through the already authenticated CLI. The provider returned a 30-day expiry. No unrelated protection settings were broadened.

## Live verification

[Final cloud results](cloud/results.json) are from headed desktop Chrome 154.0.8037.98, 1440 × 1000, with the real private model and **Father's share-link flow, without OIDC or a Vercel account**. The private credentials are read from ignored files by the captured script, never embedded in it.

- Share link without parish credentials: 401 and the parish challenge. Wrong password: 401. Valid password: page 200, protected HEAD 200, browser access check 204. [Entry results](cloud/share-results.json).
- Anonymous page/model/RSC: 401. Authenticated Range override: 416. No model download or canvas before Enter. Exactly one complete model download in the final cloud run; the renderer reached ready only after compressed and decoded size/hash checks.
- Actual full-detail exterior, nave and sanctuary views rendered, with explicit Day and Night settings. Primary review inspected the screenshots. Close disposed the canvas; a subsequent simulated access denial closed the review. Actual close/re-entry and denial disposal with an active scene were separately verified in the local production evidence.
- Final share-link model load: **34,287 ms**. The first authenticated cloud run also rendered the complete model, in **138,214 ms**, before its HEAD assertion failed. Both timings are recorded; they are device/network observations without throttling, not a Vietnam performance guarantee.
- No unexpected browser errors in the final run. One expected 401 console entry belongs to the intentionally simulated access-denial check.
- Live policy revocation: temporarily disabling the policy returned 401 for page, model and access requests with the previously valid password. The original policy was restored in a `finally` block and access returned 204. [Revocation and restoration](cloud/revocation.json).
- Anonymous direct private-store request: **403**, recorded in [storage denial](cloud/storage-denial.json). The model stays outside public assets and the deployment bundle.

The initial cloud harness expected Content-Length on HEAD, which Vercel removed while applying Brotli transfer compression. The response was authenticated, private/no-store, and application/octet-stream, and the full client had already verified both byte counts/hashes. The cloud harness now checks status, type and no-store; local HEAD still checks the exact length. **Application integrity checks were not changed.** The original failing assertion is retained in [its record](cloud/initial-head-assertion-failure.json). A separate API-client access probe returned 401 because that client only supplies Basic credentials after a challenge, while `/access` deliberately does not challenge; the final probe uses the real authenticated browser fetch and received 204.

## Limits and next responsibility

The website contains the complete native-detail architectural GLB, **not the complete engineering simulator**. Its shading is illustrative; source geometry, textures, equipment schedules and physics were not changed. “In development / Not for construction” remains visible. All lighting, feedback/wing-speech, ventilation, concealment, routes/controls and responsible-designer approval holds remain.

Father still needs to try his actual desktop and connection in Vietnam. The file is approximately 53 MB per load; use a stable connection. HTTP Basic has no reliable page logout or idle timeout: close all private browser windows when finished. Already delivered bytes cannot be revoked. The broader document/register/scenario/role workspace and full G5 acceptance are not claimed complete.
