# Private media pipeline verification

8 October 2026, `web/02-homepage`, parent `dec7a73`. Source hashes in [manifest.json](manifest.json) identify the exact files; the containing commit records the final revision. This change prepares publication copies and rejects invalid public assets. It publishes no church text/image and changes no engineering input.

- Pinned Node 22.23.3 / npm 10.9.9, Sharp 0.35.5; macOS arm64. Full dependency audit: 0 known advisories at this check.
- Lint: 37 files, no errors/warnings; TypeScript: pass; unit suite: **50/50**, including 19 media cases.
- Production build: pass, build ID `dslHTndmTyVoPrU5tZaoG`; public media preflight: 0 assets. Boundary scan: 1,807 entries, 53,598,750 bytes, 2,799 traced references, no failures.
- Existing **3/3 headed desktop Chrome** journeys pass (language/keyboard/axe, no-JavaScript reading, unavailable/private paths). No visual UI changed in this commit; new gallery visual evidence is still pending. No phone checks.
- Primary review checked source preservation, EXIF rotation direction through synthetic colored pixels, no enlargement/deduplication, all three downscale bounds, hash/byte/dimension metadata, rejected input/staging paths and a truncated PNG that passed metadata extraction but failed full decoding. Fixtures are invented and confined to temporary directories. No real GPS or parish photographs were used.
- The first test run exposed my invalid `.autoRotate()` call. The installed package/types and refreshed official docs confirm `.autoOrient()`, which is now tested. Test setup also corrected an existing-directory `mkdir`; no production assertion was weakened. This record retains the failure description; final logs record the corrected source.
- The read-only doc check found two qualifications, now corrected: the preflight runs through `npm run build`, and retaining an older cloud deployment remains prospective. Fifteen existing local links/anchors were checked, then the final evidence links were checked by the primary.
- All 59 engineering source hashes remain equal to the prior foundation record. Existing feedback/STI, lighting, air and concealment shortfalls and all construction holds remain unchanged; this software result is not design approval.

The main foundation's post-merge GitHub run [37713592083](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/actions/runs/37713592083) also succeeded at `dd2538d`. It verifies the earlier foundation, not this media change. Current checks have local raw logs archived losslessly as `.log.gz` with checksums in the manifest.

**Record correction:** `dec7a73`'s body says 14 local draft links; the actual [draft evidence](../draft-check.json) records **25**. That commit is preserved without rewriting history.

G2 remains held: parish-approved wording, cleared images and named publication owners are not supplied. Metadata stripping does not review actual pixels, permissions or privacy. Real-image quality/color review and desktop performance/assistive-technology review remain future acceptance work. Run `python3 review/web-content-2026-10-08/media/verify.py` at this source revision to check evidence/source hashes; later changes should not rewrite this frozen snapshot.
