# Cable, quantities and Japan sourcing review — 9 October 2026

Status: **ENGINEERING HOLD**. Basis `c132cfe` on `eng/10-wing-review`, preserving the held `eefc271` wing geometry. No model, circuit, route, physics or six-category workbook changes. The [register summary](../../docs/electrical-grid/summary-report.md) still correctly describes quantities, operating usage and completeness; this package adds separate maximum-load comparisons, not a replacement register issue.

## Delivered issue

- [Cable review](../../docs/electrical-grid/cable-load-review.md): fresh-model classification, 343 route rows, two explicit single-phase comparisons, independent current/derating/drop audit and 40 Vietnamese confirmation questions. All approved specifications and full-installation checks remain pending.
- [Japan budget and supplier review](../../docs/budget/README.md): 331 equipment/enclosure records, 12 documented supplier candidates, 38 official-source observations and 11 Amazon Japan price observations. Only two explicitly mapped audio class comparisons enter the JPY791,496 partial subtotal. Full budgets are null.
- [Output manifest](../../output/electrical-review/manifest.json) fingerprints sources, fonts, model and nine generated outputs; [QA results](qa-results.json) records repeatability, final PDF/raster hashes and checks. The 15-page cable and 10-page budget PDFs are A3 landscape with embedded Vietnamese fonts and a hold on every page.
- [Vietnamese RFQ brief](../../docs/budget/rfq-review-brief-vi.md) is a draft, not sent. No supplier contact, appointment, product selection, purchase or installation approval occurred.

## Verification

`python3 scripts/verify_electrical_budget.py` passed: fresh model/register equivalence; every route's unique load, current, conservative ampacity and voltage-drop comparison; ownership of 333 cable pieces; every equipment/group ID; price-pack/currency/exclusion rules; all 40 questions; every printed route ID; A3 bounds and font embedding; analytical cases; ten invalid-input refusals; failed-PDF issue preservation. See [full log](verify.txt).

The final builder ran twice in separate Python processes: all **ten files byte-identical**, including manifest and PDFs. Stable sorted reduction of unique equipment IDs removes process-dependent floating-point addition order; it changes no equations, loads, thresholds or sampling. CSVs use UTF-8 BOM for Excel and explicit LF record endings; staged whitespace review caught and removed the initial CRLF endings. Initial glyph validation rejected unsupported mathematical arrows/inequalities; printed ASCII equivalents preserve meaning while canonical CSV/JSON stays unchanged. Other unsupported glyphs stop export.

All 25 pages were rendered at 90 dpi with Poppler. Full-page PNGs and contact sheets are in `cable/` and `budget/`; final rerender hashes match the visually inspected issue. Vietnamese text, margins, headings, tables, sources, page transitions and holds showed no clipping, overlap or missing glyph. Physical A3 printing has not been checked.

[Existing estimate checks](estimates.txt) passed 24 cases. [Focused electrical checks](electrical.txt) passed for 296 connected components/343 routes and explicitly report `constructionApproved:false`. Node syntax, Python compilation, 93 local Markdown links, question-source paths, JSON parse and supplier fact/source-ID coverage passed. No UI/model change requires another GPU/phone inspection. Desktop-only scope remains in force. `git diff --check` passed before commit.

## Parent review of source claims

Manufacturer examples do not replace proxy performance. Parent spot checks confirm ENDO's [Vietnam sales subsidiary](https://www.endo-lighting.com/company/network/), TOA's [official Hanoi/HCM offices and toa-vn.com channel](https://www.toa-global.com/en/profile/company/network), KDK's [manufacturer-listed Vietnam agent](https://kdk.jp/worldwide-agent) and Audio-Technica's [listed professional resellers](https://www.audio-technica.com/en-sea/retail). They establish enquiry channels; exact-SKU stock, warranty, spares and delivered quotes remain unknown.

The [manufacturer conflict register](../../docs/budget/product-reference-review.json) retains Yamaha driver/geometry and microphone phantom-version discrepancies. Yamaha's [official indexed specification table](https://jp.yamaha.com/products/proaudio/speakers/vxl/specs.html) identifies VXL1B-8 as eight drivers, not Amazon's 24-driver description; direct page access returned 403. The Audio-Technica [full two-page manual](https://sea.audio-technica.com/image/catalog/Manual/PRO49Q_49QL_142316610_UM_V1_11L_web_190123.pdf) was read: cardioid, PRO49QL 418 mm, phantom DC separate from AC demand. Official indexed [Fuji VVF data](https://www.fujiewc.co.jp/product/vvf) and [Yazaki's VVF table](https://www.yazaki-group.com/file/VVF.pdf) corroborate the solid-conductor diameter convention: 2.0 mm is not 2.0 mm². These indexed observations are not claimed as full downloaded-document verification.

Retail observations were delegated and reviewed against the recorded direct-page evidence, quantities and manufacturer conflicts. Parent direct Amazon retrieval was unavailable; access limitations remain recorded. No retailer text is promoted to selected-product engineering input. All 100 V-only, wrong-size, body-only and unmapped comparisons remain excluded from the subtotal.

## Holds retained

Supply, phases, earthing, faults, real nameplates/inrush, AV maximum, utility-to-DB1 drop, PE/harmonics, protection, physical control hardware, containment and actual lengths remain unverified. The known maximum subset is 9,101.518 W, **not an upper bound of the complete installation**. The 80.683 m DB2 feeder's conditional 35/50 mm² candidates expose the long concealed route and drop-budget trade-off; they are not cables to order.

The held wing study still has 12/80 receivers below 0.3 m/s at low fan speed; peak noise about 48.75 dBA; wing STI below 0.6; ambo/altar feedback margins below 3 dB; 12 wing seats below 200 lux under the 20% light-output sensitivity. Product photometry, glare, concealment, support, moving clearances and maintenance access remain pending. No passing package check closes these issues. See [wing comparison](../../docs/engineering/wing-review.md), [issues](../../docs/engineering/issues.md) and [40-question register](../../docs/engineering/questions-for-parish-and-designers.json).

Phase exits are not met; leave the branch unmerged. Preserve unrelated `exports/` work. The next responsible electrical/specialist designers and parish must answer the named questions with survey/product/approval evidence before a construction or purchasing issue.
