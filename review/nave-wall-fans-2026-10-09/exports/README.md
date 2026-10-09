# Matched exports · nave wall fans · 9 October 2026

Everything below was regenerated from the same default model (330 model items plus 5 enclosures; 296 connected components; 343 routes; 2,779 vertices). Design-development outputs, not construction or purchasing approval.

| Output | Command | Result |
| --- | --- | --- |
| Electrical schedules (`docs/electrical-grid/`) | `node scripts/verify_simulator.cjs --electrical --export-electrical` | passed; log [electrical-export.log](electrical-export.log) |
| Six category registers + summary report | `node scripts/build_equipment_register.mjs --verify-workflow` | passed; retained inputs, 10 retired equipment IDs and 14 retired routes preserved ([register-preservation.json](register-preservation.json)) |
| English A3 drawings (44 pages) `output/pdf/` | `python3 scripts/build_review_drawings.py` | `verify_review_drawings.py`: 0 failed checks |
| Vietnamese A3 drawings (44 pages) `output/pdf-vi/` | `python3 scripts/build_review_drawings.py --language vi` | `verify_review_drawings.py --language vi --compare-language output/pdf`: 0 failed checks. Needed the new axis 2′ translation in `scripts/review_drawings_i18n.py`. |
| Cable-load review and Japan budget `output/electrical-review/` | `python3 scripts/build_electrical_budget.py` | `verify_electrical_budget.py`: all software/package checks pass |

Python needs ReportLab, pypdf and pdfplumber (`scripts/requirements-drawings.txt`); the repository's usual configured runtime was used.

## Quantities changed by the sixteen fans

- Known maximum mains subset 8,677.518 W → **9,227.518 W** (+550 W: 16 × 55 W high speed, replacing 6 × 55 W). Default operating demand unchanged at 5,552.950 W because F2 stays OFF.
- Modeled cable centreline 5,707.072 m → 5,732.592 m; quotation scenario 6,923.779 m (323 pieces) → 6,971.851 m (333 pieces).
- Japan partial retail comparison unchanged at JPY895,996 (fans and cable remain unpriced).

Superseded earlier outputs: `baseline/` holds the pre-change register snapshot and previews; regenerable and not kept in Git. `docs/engineering/SESSION-HANDOVER-2026-10-09.md` is a historical closeout and keeps its older numbers.
