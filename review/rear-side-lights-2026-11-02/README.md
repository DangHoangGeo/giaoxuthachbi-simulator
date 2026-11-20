# Rear side-wall lighting review — 2 November 2026

**CONCEPT / NOT FOR CONSTRUCTION.** The owner asked to retain the four rear reading projectors and move them away from the main entrance. L59/L61 and L60/L62 now form symmetric pairs by the axis-3 side-wall piers, on L2. Wall coordinates are X 9.25 and 9.60 m, Y 3.65 m, Z ±7.25 m. The emitters are aimed toward the rear outer and centre seats respectively. The visible bodies clear the modeled pier face; a 21 mm model clearance is not a site tolerance or fixing design. These fixtures are below the modeled fan blades. The exit sign is unchanged.

The simulator retains a 50 W planning allowance per projector. The outer-row heads use 6,000 lm and 44°; the centre heads now use 6,000 lm and 36°, instead of 3,300 lm and 50°. No product has been selected and no optical or electrical rating is approved.

Reproduce with `node scripts/study_rear_side_lighting.cjs` from the repository root. In the default full-service four-block configuration, at the 0.8 m book plane, without daylight and with the simulator's maintenance assumptions, the **uncalibrated** model estimates:

| Block | Points | Minimum | Average | Below 200 lux |
| --- | ---: | ---: | ---: | ---: |
| Central | 138 | 212.2 lux | 295.7 lux | 0 |
| Outer | 138 | 246.9 lux | 360.6 lux | 0 |
| Wing | 80 | 321.2 lux | 382.1 lux | 0 |

The simulated fan-blade interaction check reported no warning in this scenario. This is not an assessment of measured illumination, glare, flicker, emergency lighting, or code compliance. The earlier removal study had 14 points below 200 lux; the alternative of mounting heads on the main beam produced fan-interaction warnings and was rejected.

Review the fixture's IES/LDT data, realistic maintained output, driver and dimming, vertical face illuminance and glare, electrical containment, pier clearance and installation, fixings, heat and fire protection, maintenance access, and fan operation with the responsible lighting and electrical designers. Confirm actual light levels in a representative full-scale trial. Coordinate physical wiring and life-safety design separately. Structural capacity and electrical protection remain engineering holds.

Verification: model and plan checks, electrical export, register-preservation workflow, calculation audit in report mode, saved-layout migration, and web lint/typecheck/unit/browser checks passed. The ordinary simulator check continues to fail its established no-warning target for ambo and altar feedback margins (0.9 and 1.4 dB); wing speech clarity and ventilation limitations remain open. English and Vietnamese A3 screening retain the existing page-3 text-overlap warning. None of these checks constitutes engineering approval.
