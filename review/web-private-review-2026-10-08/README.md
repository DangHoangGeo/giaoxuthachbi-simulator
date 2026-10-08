# Shared-password full-detail architectural preview

Prepared 8 October 2026 on `web/05-protected-review`. Started from main `dd2538d`, with explicit `cherry-pick -x` dependencies from the verified public work through `a8a0b88`. The owner requested private web access for Father, then explicitly chose one shared parish password. [Access design and operations](../../docs/web/access-control.md) records the scoped exception to individual-account proposals. Main and full G5 remain unmerged/open.

## Verified local implementation

- Reproducible lossless private package committed as `c5fd000`: 53,230,983 gzip bytes, 125,105,044 decoded bytes identical to the original sharing GLB. [Package record](../../exports/private-review/manifest.json).
- Standard HTTP Basic page challenge plus independent server data checks, live origin policy, private/no-store responses, immutable private model path, streamed length/hash integrity, and client compressed/decoded hashes. No private files or credential policy enter public assets.
- Private Blob store created in Singapore, connected to preview/development only; complete upload readback checksum matched. The existing Hobby plan and Vercel outer deployment protection are preserved. One reviewed firewall change was published: 40 private-route requests/60 seconds/IP, per region; public routes unaffected.
- Native-texture architectural display with optional bump extension support; source coordinates, model files, equipment, registers and physics unchanged. Development/not-for-construction notes stay visible.
- Lint/typecheck, **201 unit checks** including **68 private-delivery cases**, production build, boundary scan, **15 production browser checks**, and **8 synthetic gallery/timeline checks** passed. The earlier shell test expected nonexistent review routes (404); it now requires the implemented authentication challenge (401), while other absent paths remain 404. No access or engineering criterion was weakened.
- Current secret-value scan found no password, digest, store token, OIDC token or private model hash in 2,033 built files. This exact-value check complements the normal boundary scan; neither is a universal secrecy proof.

## Actual desktop evidence

Build `4ohOQMmj2Tyvj0fs4mXvH`, headed Chrome 154.0.8037.98 on the local M1 Pro desktop, 1440 × 1000. The browser used the real private Singapore store through a loopback production app; no artificial network throttle. The full model opened in **44,175 ms**. This is an observed local network/device result, not Vietnam/parish acceptance or a performance guarantee.

[Raw results](desktop/results.json) and the as-run capture script record anonymous page/model/RSC 401, authenticated page/HEAD 200, Range 416, zero model requests before Enter, actual full-detail rendering, close/re-entry, and scene disposal on a simulated access-check denial. A single expected 401 browser log belongs to that denial probe; no unexpected console/page errors occurred. The final pictures explicitly select Day and Night; earlier Auto captures at night were not used as day evidence. Primary review inspected exterior, nave and sanctuary views. Full geometry and textures are preserved; shading remains illustrative and brighter/flatter than the source's artistic renderer.

Two failures remain traceable:

1. Blob's automatic Brotli transfer removed Content-Length and the SDK reported size zero. The model route failed closed with 503. Fixed by requesting identity transfer for an already-gzipped object, retaining strict size checks and adding a streamed SHA-256/length gate. Tests now cover zero/misleading metadata and oversized/truncated/corrupt streams.
2. The first successful-render script selected both the application's alert and Next's route announcer. The scoped `main` alert selector now verifies actual denial disposal; the initial locator failure is retained separately.

## Outstanding acceptance

[The cloud delivery record](delivery.md) now confirms the deployed preview, private handover and actual cloud checks; the sections above remain the local baseline evidence. The wider G5 engineering workspace (individual roles, results/parity, documents, registers and site inspection) remains incomplete. Father has not trialled his own desktop/network. Shared Basic access has no reliable app logout or idle timeout; use private browsing and close all private windows, or revoke the current policy. Policy expiry/rotation applies to future requests, not copies already received. Engineering holds for light, sound/feedback, air, concealment, routing and responsible-designer approval remain unresolved.
