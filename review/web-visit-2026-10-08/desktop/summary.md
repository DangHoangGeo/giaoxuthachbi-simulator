# Desktop visit evidence

- Run: 2026-10-08T12:56:51.904Z to 2026-10-08T13:08:20.576Z
- Branch/HEAD: `web/04-lightweight-visit` / `c151c71c1f81ec327701c705822dc6dee252eaa6`
- Build ID: `1WAT1D-QKfVwh3_eGjCPT` (file SHA-256: `51b8cf9d3cc81b2abb87ad167973a984a726162534807fa3643dcaa042e1643b`)
- Chrome: 154.0.8037.98; Darwin 25.5.0; arm64
- GPU: `{"context":true,"vendor":"Google Inc. (Apple)","renderer":"ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro, Unspecified Version)","version":"WebGL 2.0 (OpenGL ES 3.0 Chromium)","shadingLanguageVersion":"WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)"}`
- Cold initial requests: /vi: 280474 B total, 145409 B JS, 0 model requests before Enter; /vi/design: 581190 B total, 154324 B JS, 0 model requests before Enter
- Explicit Enter: 7984 ms; model 8770573 B, total 8938456 B. Criteria were 12 s and 10,000,000 B; failed criteria are reported as measured.
- Frame path: {"samples":7200,"p50Ms":8.30000000000291,"p95Ms":9.299999999995634,"p99Ms":9.399999999999636,"maxMs":9.799999999999272,"over33ms":0,"over50ms":0}
- Ten-minute route soak: 600028 ms; canvas counts [1]; heap 76505032 → 75375356 B.
- Context loss/retry: {"extensionAvailable":true,"retryVisible":true,"retrySucceeded":true}
- 1 Mbps fallback: {"cancelShown":true,"elapsedBeforeCancelMs":59,"canvasAfterCancel":0,"galleryLinkAvailable":true,"galleryUrl":"http://127.0.0.1:3132/en/design","galleryHeading":"Images and design","galleryStatus":200,"modelRequests":[],"modelFinishedBytes":0}
- Horizontal overflow: {"visit":{"viewportWidth":1440,"documentWidth":1440,"documentHeight":1216,"horizontalOverflow":false,"bodyWidth":1440},"gallery":[{"route":"/vi","overflow":{"viewportWidth":1440,"documentWidth":1440,"documentHeight":1339,"horizontalOverflow":false,"bodyWidth":1440}},{"route":"/vi/design","overflow":{"viewportWidth":1440,"documentWidth":1440,"documentHeight":4499,"horizontalOverflow":false,"bodyWidth":1440}}]}
- Browser/runtime errors: 0
- Source hashes stable: true

This is headed desktop-browser evidence for the preview build only. It is not parish-device acceptance or field performance. LCP/CLS/INP field data were not measured.

Supplemental capture notes: the original `/vi/design` full-page screenshot is preserved as `vi-design-initial-lazy.png`; lower lazy-loaded cards were blank in that initial state. A separate post-soak capture loaded all 16 image elements before taking `vi-design-scrolled-all-images.png`; its 809,732 media bytes are excluded from cold-load totals. The parent reported a separate software-Chrome CI smoke on port 3100 around 13:07–13:08 UTC, overlapping soak minutes 9–10; resource observations in those last minutes may reflect concurrent CPU load. The 60-second RAF sample preceded that overlap. See `supplemental-notes.json`.

The soak sampled JavaScript heap only; no WebGL/GPU memory counter was available, so the canvas/heap observations do not prove zero GPU memory leak. The parent later reported four separate software-Chrome visit tests passed locally in 37.3 seconds with no application-source changes.
