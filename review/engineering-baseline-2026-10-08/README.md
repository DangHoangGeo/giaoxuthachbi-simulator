# Engineering baseline evidence — 8 October 2026

The approved roadmap was merged to main as `daadc10`; E1 begins from that revision. No equipment, analytical physics, geometry, thresholds, sampling, source workbook or saved electrical snapshot was changed to obtain this baseline.

| Package | Evidence and scope |
| --- | --- |
| Fresh checks | [Check record](checks/README.txt), [commands, hashes and repeat comparison](checks/summary.json), raw logs under `checks/logs/`. Geometry, 24 independent estimate cases, two calculation audits, electrical and timber-package consistency pass. Strict simulator fails at known low-feedback warning gate. |
| Source facts | [Source inventory](source-notes/index.md), [exact source locators](source-notes/inventory.json). Conflicting/historical values are observations, not endorsed design targets. |
| Registers and dimensions | [Workbook inventory](source-inventory/README.md), [independent extraction verification](source-inventory/verification.json). 118 saved fingerprint/count comparisons agree. Seven workbooks unchanged; blank engineering inputs and 22 dimension open items remain open. |
| Drawing spot review | [Printed-sheet observations](drawings/README.md): sheets 6 / 4 / 5 rendered and inspected from floor/nave/sanctuary PDFs. No dimension inferred from raster scaling. |
| Per-receiver scenarios | [24-case summary](study-summary.md), [manifest](study-results/manifest.json), [verification](study-verification.json). 8,832 evaluations repeated exactly, 19 source hashes, every saved equipment/setting matched; failing IDs and raw checks retained. |

Two full audits agree exactly on eight JSON records and 182 numerical leaves after excluding runtime/timestamp fields. Passing calculation checks do not pass the performance design: ambo/altar feedback ~1.2/1.7 dB, wing STI minimum .439, four of 368 seats below 200 lux, and estimated nominal exhaust rate ~3.5 ACH remain issues. Full method/product/field validation remains required.

The primary agent inspected the delegated logs, comparison code, literal cell reports, source references and the three drawing renders. Source snapshots and checks support inventory consistency only. Registers were not regenerated because no owning equipment or route source changed. Browser-edited layouts and their storage were not accessed.

The full workbook cell dumps are reproducible intermediate files excluded by `source-inventory/.gitignore`; compact CSV/JSON locators, source hashes and both read-only extraction/verification scripts are retained. Run extraction before its independent verification when reproducing on another checkout. Do not overwrite archived evidence while evaluating a different source revision; copy the scripts and record the new output location/revision.
