# Synthetic progress screenshots

Captured from the already-running presentation-only harness at `http://127.0.0.1:3120`. No server start/stop, source edit, or build was performed. The synthetic build banner is visible in every screenshot: `SYNTHETIC TEST BUILD — NO CHURCH EVIDENCE`.

| Route | Capture | Screenshot | Result |
|---|---|---|---|
| `/en/progress?sort=oldest` | First viewport, 1440×900 | `screenshots/en-progress-oldest-first-viewport.png` | HTTP 200; no horizontal overflow or console/page/request/HTTP errors |
| `/vi/progress?sort=oldest` | First viewport, 1440×900 | `screenshots/vi-progress-oldest-first-viewport.png` | HTTP 200; no horizontal overflow or console/page/request/HTTP errors |
| `/en/progress/synthetic-event-002` | Full page, 1440×1083 | `screenshots/en-synthetic-event-002-fullpage.png` | HTTP 200; no horizontal overflow or console/page/request/HTTP errors |
| `/vi/progress/synthetic-event-003` | Full page, 1440×1333 | `screenshots/vi-synthetic-event-003-fullpage.png` | HTTP 200; no horizontal overflow or console/page/request/HTTP errors |

The list pages have a 7,667 px document height; only their first viewport was captured as requested. Event screenshots capture the entire page. Chrome was headed Google Chrome 154.0.8037.98 on macOS arm64, using Node 22.23.3. The exact as-run Playwright script and page diagnostics are in `capture.mjs` and `results.json`; `checksums.sha256` covers the outputs.

This is synthetic presentation evidence from port 3120, not production output or church evidence. The actual production capture is stored separately in `/private/tmp/thachbi-web03-desktop/`.
