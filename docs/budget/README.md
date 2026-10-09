# Japanese sourcing and budget review

Status: **quantity takeoff / market comparison / ENGINEERING HOLD**. The owner requested Japanese-market suppliers and Amazon Japan prices, omitting US-market research. Native JPY is retained; no conversion or landed-cost claim is invented. The parish has no confirmed electrical supply data. The [41-question confirmation register](../engineering/questions-for-parish-and-designers.json), [engineering issues](../engineering/issues.md), [cable review](../electrical-grid/cable-load-review.md) and held [wing review](../engineering/wing-review.md) govern the unresolved design.

## Outputs and source ownership

`python3 scripts/build_electrical_budget.py` generates a separate 10-page Vietnamese budget PDF and ID-based quantity CSVs in `output/electrical-review/`, alongside the 14-page cable report. The [drawing export](../electrical-grid/print-drawings.md) separately provides English and Vietnamese A3 route drawings. The budget builder does not edit the six category registers, overwrite their engineer inputs, select products or approve cables.

- [Amazon references](amazon-price-references.json): observed product price/pack/currency/voltage and compatibility gaps; only actual verified Amazon.co.jp prices are numeric.
- [Price research](amazon-research.md): linked listings, observations, exclusions and unpriced coverage.
- [Japanese suppliers](japan-suppliers.md) / [structured supplier evidence](japan-suppliers.json): primary manufacturer/channel documentation and support evidence.
- [Budget inputs](budget-assumptions.json): deliberate reference mappings and missing installation/import costs. A listed price is a comparison, not an approved product selection.
- [Vietnamese display text](report-text-vi.json): translates all 12 supplier rows and 11 retail-reference gaps; source fingerprints prevent stale translations after a fact change. Canonical technical descriptions/IDs in the takeoff stay linked to the model.
- `equipment-budget.csv`: all **330 model items plus five enclosures**, each once, with type/specification/coordinates/model envelope/quantity and electrical class. **15 hidden alternatives** are retained and excluded from the shown scope.
- `budget-quantity-groups.csv`: quantity groups with complete equipment ID membership; rounded required pack counts only when a comparable complete assembly and verified pack unit exist.
- `route-load-schedule.csv`: all **343 routes** and conditional load/cable/length calculations. Cable/containment budget quantities remain unapproved.

## Supplier decision criteria

Prefer evidence for the actual church duty over a low retail price: export-compatible voltage, IES/LDT or speaker/fan performance data, commissioning interfaces, local spare/service channels, repair access and relevant warranty. Japanese manufacturer and Japanese domestic retailer are different roles. Domestic-only warranty or export restrictions can outweigh retail price. Selected equipment still needs combined light/air/noise/speech/concealment review; a manufacturer shortlist is not an optimisation pass.

The [primary review shortlist](supplier-shortlist.json) chooses priorities for requesting information and comparable quotes, without appointing a supplier:

| Scope | First technical enquiry | Comparison | Why / outstanding gate |
| --- | --- | --- | --- |
| Architectural lighting | ENDO | Panasonic Vietnam | IES/international examples and manufacturer-listed Vietnam sales; exact dimmable driver/optic, glare and maintenance review needed. Brass chandelier assemblies and reading optics remain unpriced. |
| Installed sound | TOA | Yamaha | Manufacturer speaker simulation data and Vietnam channels. Compare actual seat STI/feedback with fans operating, amplification/DSP and commissioning support. |
| Microphones | Audio-Technica through manufacturer-listed Vietnam pro-audio channels | Exact model/capsule/base alternatives | Formal polar/phantom data; assess feedback and physical base, cables and spare availability before selection. |
| Fans / ventilation | Panasonic Vietnam and KDK | Mitsubishi | Duty-point/pressure/noise evidence and regional support. Concealment, occupied-zone air and mounting/access remain unresolved. |
| DB enclosures / protection | Nitto plus Mitsubishi | Terasaki; MISUMI Vietnam for documented components | Empty enclosure and breaker are separate design scopes. Fault level, supply, thermal layout, manual controls and trip coordination remain unknown. |
| Cable | Fujikura Dia for technical data | Locally approved cables and documented channels | No verified Vietnam channel or approved cable specification yet; do not require Japanese import where local repair/supply is better. |

These are engineering-review priorities derived from the [manufacturer evidence](japan-suppliers.md), not an objective overall ranking. Warranty, exact SKU availability, delivered cost and long-term support require written quotes. ODELIC's domestic voltage/overseas warranty limitations and MonotaRO Japan's direct-export restrictions make them conditional or excluded channels for this scope. No supplier has been contacted.

The [Vietnamese RFQ review brief](rfq-review-brief-vi.md) is prepared for comparable responses with the ID-based quantities, requested product data, accessories, delivered-price exclusions and warranty/commissioning questions. It is a draft document, not a sent message or order.

The design quantities remain independent of retail products: a 100 mm household exhaust fan does not replace the modeled 500 mm unit, a 300 mm wall fan does not inherit the 450 mm fan's flow/noise, a six-light household chandelier body does not include the proposed downward optic, and an 11.5 m festoon assembly does not equal every variable-length model string. Domestic 100 V products cannot be approved while the supply is unknown. Passive 100 V **audio line** is separate from mains voltage.

## Cost interpretation

Only a deliberately mapped, priced complete assembly or appropriate enclosure reference can enter a comparison subtotal. For mains products, explicit 220–240 V support is required for that comparison; a missing/100 V-only rating is excluded. Passive audio, signal and enclosure products have different voltage checks. This screen still does not validate power, geometry, photometry, noise, mounting or warranty. Components, unsuitable voltage products, unmatched string lengths and hidden alternatives stay visible as reference-only prices. Do not add alternative products to each other or double-count bulbs included in a luminaire price.

Unpriced scopes stay pending. The full equipment budget and installed project budget remain `null` until missing products, correct cable sizes/counts/lengths, conduit/tray, terminal/junction/fixing/fire-stopping quantities, scaffolding, labour, import/shipping/tax, commissioning, training, spares and contingency are quoted. The matched issue has 310 shown equipment/enclosures, 15 hidden alternatives, 2 priced comparison groups and 36 unpriced or excluded shown groups. A subtotal of observed retail comparisons is never labelled the complete project budget. The future procurement schedule must state exact product/model, seller authenticity, date, pack quantity, delivery/warranty and acceptance approval.

The executable sources and full output hashes are in `output/electrical-review/manifest.json`. Price pages can change independently of the model; refresh market references on the quotation date. No purchases or supplier contacts were made.

The 11 Amazon Japan observations include only two explicitly mapped class comparisons: 16 Yamaha VXL1B-8 speakers at JPY52,250 and two Audio-Technica PRO49QL microphones at JPY29,998, giving a **JPY895,996 partial retail comparison**. The speaker comparison is JPY836,000 and the microphone comparison is JPY59,996. S276/S278 now share the slimColumn comparison type; the existing Japanese price observations are reused. This covers neither the rest of the audio hardware nor the building systems budget. Geometry/directivity/warranty and associated hardware remain unapproved. All lighting/fan/cable/board prices remain RFQ or reference-only; the full budget stays pending. [Manufacturer review](product-reference-review.json) flags the Amazon Yamaha driver-count conflict and the microphone phantom-version discrepancy instead of transferring retail text into engineering inputs.

After rebuilding, run `python3 scripts/verify_electrical_budget.py`; it checks fresh model/register fingerprints, every route, independent current/derating/drop arithmetic, ownership of signal cable quantities, all equipment IDs, prices/packs/exclusions, PDF bounds/fonts and invalid-input refusal. Render and inspect both PDF reports after every substantive issue. Package tests cannot release the engineering holds.

PDF supplier/reference prose is Vietnamese. Canonical model specification text remains traceable in its source language; the source arrow uses the printed equivalent `->`, and equations use ASCII `<=`, because the bundled Noto Sans does not contain those two mathematical glyphs. All other unsupported glyphs stop export. The original CSV/JSON descriptions, inequalities in the calculation and technical meaning are unchanged.
