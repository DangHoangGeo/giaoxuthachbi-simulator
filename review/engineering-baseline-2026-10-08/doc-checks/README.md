# Documentation cross-check

Read-only mechanical check for the engineering documents and 8 October baseline evidence. This verifies local references and reported study numbers; it does not review engineering adequacy or code applicability.

## Results

- Checked 175 local Markdown links across the four `docs/engineering/` documents, baseline `README.md` and `study-summary.md`, source-notes index, simulator methods page, and engineering-roadmap README. No missing files or invalid heading anchors were found. Seven external links were left unfetched.
- The only command shown is in [baseline.md](../../../docs/engineering/baseline.md):14. From repository root, `scripts/study_systems.cjs` and the scenario input exist; the script accepts `--repeat`.
- All 24 rows in [study-summary.md](../study-summary.md) agree with their case JSON at displayed precision. Eight no-speech rows correctly show STI and the below-.60 column as `n/a`; the raw criteria arrays are empty. The introductory sentence at study-summary.md:3 says below-threshold counts are zero in those cases, which is inconsistent with how the table displays those counts. This is wording only; no reported table number is wrong.
- The full-service/four-block worst-location values and IDs in [baseline.md](../../../docs/engineering/baseline.md) match `study-results/full-4.json`. The stated two-block minimum and the weekday, prayer, overflow, and talker-distance scene figures also match their result JSONs.
- The baseline inventory counts match the saved verification and register summaries: 463 dimension rows, 51 model-grid rows, 22 open items, 327 equipment/enclosures, 329 routes, 2,681 vertices, and 118 saved fingerprint/count comparisons. The baseline layout snapshot exactly matches all 322 saved items and its settings.
- Parsed `source-notes/inventory.json` and checked its 90 file-and-line source locators; all referenced files and line ranges exist.

The machine-readable counts, checked values, and single wording finding are in [results.json](results.json). The check did not assess engineering adequacy, validate external legal/code references, run the reproducibility command, or re-evaluate every criterion in the acceptance matrix and design basis.

Primary resolution: clarified `summarise_study.py` and regenerated `study-summary.md`: no-source raw STI failure lists are empty because no STI is evaluated; the table deliberately renders both value and count as n/a. No numerical result or acceptance criterion changed.
