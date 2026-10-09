# Web03 desktop progress-route evidence

Final capture ran on 2026-10-08 against local production at `http://127.0.0.1:3130`. Browser: headed Google Chrome 154.0.8037.98 on macOS 26.5.1, Apple M1 Pro, Node 22.23.3. Branch/HEAD: `web/03-timeline` / `d8d645dbd0f3b5c3d9e6e6dc43988acdd615d9f7`. The capture recorded local `.next/BUILD_ID` `QQh-hTBf3dlLBbHcS_6Yk`; monitored source hashes and the local build ID were unchanged from before to after.

Four normal checks covered `/en/progress` and `/vi/progress` at 1440×900 and 1280×800. Each returned HTTP 200 with no horizontal overflow, page/console/request errors, or HTTP errors. Axe reported 0 violations, 39 passes, and 0 incomplete checks in each viewport. The displayed progress history is empty by design and states that no reviewed updates have been published for the selection.

The first Tab focused the visible skip-to-main link in both locales; focus screenshots and the eight-stop sequences are in `results.json`. The visible focus box overlaps the brand area in the captured header. Both locales remained free of horizontal overflow with root font-size temporarily set to 200% by injected CSS (16px to 32px); this was not native browser zoom. Reduced-motion emulation matched the preference and reported zero document animations.

With JavaScript disabled, both pages returned HTTP 200, retained readable server-rendered text, and showed their localized `noscript p` hint. The expected JavaScript chunk request was blocked by the deliberately disabled-JavaScript context.

Three new-context cold-cache `/en/progress` samples used CDP emulation at 10 Mbps down, 1 Mbps up, and 100 ms RTT. LCP samples were 276, 276, and 280 ms; CLS was 0 in all three. Each sample recorded 159,239 total `Network.loadingFinished.encodedDataLength` bytes, including 147,804 bytes for JavaScript. Raw request-level values are preserved in `results.json`. These are lab samples on one desktop and do not represent field performance; no INP was measured or inferred.

A supplemental read-only check at 02:48:29 UTC confirmed `/en/progress` returned HTTP 200 and the single embedded Next RSC `b` field matched disk build ID `QQh-hTBf3dlLBbHcS_6Yk`. The response was 14,750 bytes, SHA-256 `7c3cbae80a40300ab850afd298c2aa5fd2bf1cd5447ef3dcdb9bcd687d1cf733`; no HTML dump was saved. `/en/progress/missing` returned HTTP 404. See `route-build-check.json` and `verify-route-build.mjs`.

The final set contains 12 screenshots plus `capture.mjs`, `results.json`, and the supplemental route/build verifier. The earlier capture from build `9IgjMN2j4cCibIDB0AiU0`, taken before the final malformed-date fix, is preserved separately under `initial/` and is superseded by the final root-level results. `checksums.sha256` covers both sets.
