# Route load and cable comparison review

Status: **DERIVED / CONCEPT / ENGINEERING HOLD**. On 9 October 2026 the engineer confirmed that the parish has no available supply or installation data and requested all open layout/design questions in the report. The [editable question register](../engineering/questions-for-parish-and-designers.json) and [existing issues](../engineering/issues.md) remain open. This review uses the held wing layout on `eng/10-wing-review`; it does not complete E2, E4 or E5.

## Deliverables and refresh

Run from the repository root, after exporting and refreshing the matched model/registers:

```sh
python3 scripts/build_electrical_budget.py
python3 scripts/verify_electrical_budget.py
```

Use the same Python dependencies as the [drawing exporter](print-drawings.md). The program loads the actual default model, checks exact equality with the electrical export and verifies all six workbook fingerprints before it writes. It never edits a model, browser layout, workbook input or approval field. A changed product, quantity or location requires fresh matched exports. Browser edits require a separately coordinated source configuration.

Outputs in `output/electrical-review/`:

- `thach-bi-cable-load-review-vi.pdf`: Vietnamese basis in 14 A3 pages, all 333 route rows, both sizing comparisons, 41 confirmation questions and source references.
- `route-load-schedule.csv` / `route-load-review.json`: every route ID, downstream equipment, endpoints, geometry length, load/energy trace, complete signal length, quotation allowance, comparison currents/areas, voltage-drop bound and unresolved verification fields.
- `load-snapshot.json`: classified catalogue inputs from the actual simulator, including every item and exact source fingerprints.
- `thach-bi-budget-japan-vi.pdf`, equipment/group CSVs and `budget-japan.json`: separate 10-page [Japanese market budget review](../budget/README.md).
- `open-questions.csv`: the question register as a UTF-8 Excel-readable table. The JSON is the owning editable question source.
- `manifest.json`: source/font/output hashes, counts and issue status. An independent verifier refuses changed source/output hashes. This matched issue contains 320 model items plus 5 enclosures; 286 shown components have electrical/signal connections.

## What is calculated

All shown lights and fans are evaluated at catalogue maximum, including normally-off F2/F4/festival items. No operating scene is used to shrink a cable. The known-subset maximum is **8,677.518 W**, before AV rack maximum/nameplates, control self-consumption, unmodeled loads or supply losses. The present full-service operating model is **5,552.950 W** including the simulator's amplifier estimate; this is a different quantity. The saved 1.5 h service and 40 services/month give 8.329 kWh/service and 333.177 service-only kWh/month. These are modeled estimates, excluding between-service use, other building loads and distribution losses. Passive-speaker 60/30 W audio ratings and the simulator's proportional amplifier allowances are not mains nameplates. AV-1 maximum remains `null`.

An explicit **25% planning reserve** gives 10,846.897 W for the known subset. The comparison currents are 52.400 A at 230 V/PF0.9 and 61.630 A at 220 V/PF0.8. These are not whole-installation maximum currents or a main-breaker selection. The reserve is not a quoted Vietnamese code rule and does not make an installation safe under arbitrary overload; protection must disconnect an overload before the conductor is damaged.

For each mains trunk, sum its unique downstream items. For each branch use its own item load, but size its overload comparison against the **common circuit protection for all branches of that logical circuit**. Four supply feeders take the unique source membership, rather than summing repeated trunk/drop rows. A circuit or enclosure is not counted again in the installation load. Operating W/kWh rows trace downstream demand: never sum feeder, trunk and branch rows as a consumption total.

### Reproducible sizing comparisons

The [input file](cable-design-inputs.json) preserves real supply/installation fields as `null`. It contains two explicitly unconfirmed single-phase comparison cases. S1 assumes 230 V/PF0.9, 45°C and four bunched circuits; S2 assumes 220 V/PF0.8, 50°C and six. PVC temperature factors are 0.79/0.71 and grouping factors 0.65/0.57. B2 copper/PVC multicore **three-loaded-conductor** current values are used as a conservative table comparison for the assumed single-phase circuits; different cable/installation/harmonic conditions require a new checked design.

This version calculates comparison cases only. It refuses populated real supply/installation, manufacturer-nameplate or route-approval fields rather than silently ignoring newly entered design data. Retain any confirmed answers, then extend and independently check the calculation method with the responsible designer before regenerating; entering data alone does not release a hold. Failed validation or PDF generation preserves the previous issue. Outputs are staged and the manifest is published last; interrupted publication is detectable through its hashes. Unrelated output-directory files are preserved.

1. `I = P / (U × PF)`; comparison current uses maximum catalogue P times 1.25.
2. Compare `Ib ≤ In ≤ Iz`, with `Iz = table current × temperature factor × grouping factor`. Smallest listed comparison breaker ≥ circuit current is applied to the whole circuit's branches. No trip curve/physical breaker is selected.
3. Use a conservative triangle bound on the single-phase steady-state formula: `ΔU ≤ 2 I (R + X) L`, `R=23.7/S Ω/km`, `X=0.08 Ω/km`, one-way `L` in km. The hot-copper resistance benchmark comes from the guide's XLPE example; it is a resistance comparison, not permission to heat PVC to XLPE limits or a manufacturer's resistance.
4. Explicit comparison voltage-drop allocation: mains feeder 1%, lighting trunk/branch 1% each, fan trunk/branch 2% each. For each endpoint add the correct source feeder, its actual `upstreamLength` on the trunk and its own branch. Keeping full trunk load on every trunk point is an upper-bound approximation, not an exact tapped-network loss model.
5. Compare the resulting DB-1-to-load bound with 3% for light/5% for fan as **international comparison budgets**. Utility-to-DB1 geometry and drop are missing, so the whole-installation check stays `null` even when this limited comparison passes. Changing the allocation requires a recorded design decision and rerun, not adjustment to hide a fail.

The present **80.683 m DB-1→DB-2 feeder** serves a known catalogue subset of 2,686.889 W, including F4. S1/S2 produce 35/50 mm² copper comparison candidates under this 1% feeder allocation. That large result exposes a route/supply/voltage-budget trade-off; it is not a cable to order. Review three-phase allocation, actual loads and a feasible shorter maintained/concealed route with the designers. LC-1/FC-1 remain functional enclosures; whether their loads share one real feeder or individually protected pass-through circuits is unresolved.

### Signal and quantity basis

Speaker and microphone trunks are **bundles of independent home runs**. Add each branch's own `length + upstreamLength` once. Do not add the bundle corridor to cable metres. Audio 100 V currents, where shown, assume all catalogue audio ratings are 100 V taps solely for comparison; actual impedance/taps/line voltage and amplifier outputs are unknown. No speaker or microphone cable size is approved.

Current quantities are 3,916.992 m ordinary mains route segments plus 1,790.080 m complete audio/microphone home runs = **5,707.072 m modeled cable centreline**. The 583.921 m bundle corridors are excluded from this cable total. A quotation scenario adds **10% + 2 m per modeled cable piece** (323 pieces), giving **6,923.779 m**. Actual installed lengths and terminations must be surveyed. No conduit/tray purchasing length is inferred: shared containment, actual outside diameters, fill, separation and routing require design. Cable metres are not multiplied by core count when pricing multicore cable; single-core buying requires its own core/colour/length schedule.

## Required engineering checks before purchase

All 333 routes keep official cable, breaker and design-current approvals blank. The report does not substitute catalogue wattages for product nameplates. Confirm phases, voltage, fault level, earthing, neutral/PE, harmonic heating, actual protection and disconnection/adiabatic withstand, inrush/start/restart, terminal limits, selectivity, RCD/SPD/lightning, fire performance, separation/fire stopping, supports and maintenance. Selected products may invalidate these comparisons. Keep manual operation, DB-1/DB-2 logic and life-safety functions independent of internet. See questions Q01–Q15 and the [control brief](controls.md).

## Verified reference basis

Checked 9 October 2026. The [official Vietnamese catalogue](https://tieuchuanxaydung.vsqi.gov.vn/quychuan/view?sohieu=QCVN+12%3A2014%2FBXD) lists QCVN 12:2014/BXD active and identifies its public-building electrical scope. The original official full text endpoint returned HTTP403; exact clause adoption and project applicability remain the responsible electrical designer's task. No overseas table establishes Vietnamese compliance.

Schneider Electric's engineering references explain [current definitions](https://www.electrical-installation.org/enwiki/Conductor_sizing%3A_methodology_and_definition), [installation/derating](https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing), [protection coordination](https://www.electrical-installation.org/enwiki/Practical_values_for_a_protective_scheme), [voltage-drop equations](https://www.electrical-installation.org/enwiki/Calculation_of_voltage_drop_in_steady_load_conditions) and [comparison drop budgets](https://www.electrical-installation.org/enwiki/Maximum_voltage_drop_limit). Figures and locations are recorded in the input source register. They support a reproducible comparison while the project code/supply/product basis is incomplete.
