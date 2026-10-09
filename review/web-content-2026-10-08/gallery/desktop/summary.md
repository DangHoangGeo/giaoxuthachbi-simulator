# Final desktop gallery evidence

Primary repeated the subagent's same bounded capture after correcting the singular English image count. Final production build: `9MolEJEIEN4WJpmEQVAoD`. [Raw measurements](results.json) contain source hashes before/after, identical viewports/sampling/network settings, requests and observer values. The original static-path probe only finds `chunks`; the separate [served-build check](served-build-check.json) confirms the embedded RSC `b` field matches the local build. It records a response hash/length, not a page dump.

Headed Chrome 154.0.8037.98; Apple M1 Pro; macOS 26.5.1; Node 22.23.3. VI/EN gallery at 1440×900 and 1280×800: no horizontal overflow, console/page/request/HTTP errors, or axe violations (19 passes, 0 incomplete per normal check). Both first-Tab skip links were visible and keyboard-operable. Its temporary focus box overlaps a small part of the unfocused brand; primary retained this as an observed cosmetic limitation. Reduced-motion preference matches with zero animations. Large text uses temporary `html { font-size: 200% !important; }` (32px computed root), not native browser text-only zoom; no horizontal overflow.

Five fresh-context samples per route; cache disabled; service workers blocked; CDP network emulation at 10 Mbps down / 1 Mbps up / 100 ms latency. All recorded requests are retained. `loadingFinished.encodedDataLength` totals include transfer overhead; JavaScript totals are identified by CDP Script type or JS MIME. These are controlled local lab observations, not field metrics.

| Route | LCP samples, ms | CLS | Total transfer, B | JavaScript transfer, B |
| --- | --- | --- | --- | --- |
| `/en` | 264, 280, 264, 256, 264 | 0 each | 153321 each | 143962 each |
| `/en/design` | 256, 260, 260, 260, 260 | 0 each | 162883 each | 152820 each |

Both **empty** routes are below the proposed 1.5 MB first-view / 200 KB JavaScript budgets in this sample. LCP is below 2.5 s; no INP or field 75th percentile is claimed. The 1 Mbps no-JavaScript check retains visible server-rendered content; its deliberate JS block produces one blocked script request and no page/HTTP error. Real-image payload/quality, full assistive-technology usability and parish-device/network acceptance remain unverified. No phone test.

Eleven PNGs cover normal windows, keyboard, large text, reduced motion and degraded reading. Scripts are the as-run host-specific commands; replay at this source/build with the local production server. Checksums were refreshed after the final capture.
