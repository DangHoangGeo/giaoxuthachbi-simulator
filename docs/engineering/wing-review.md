# Sanctuary wings: coordinated review, 9 October 2026

**CONCEPT / ENGINEERING HOLD.** Current default: **two smaller brass chandeliers, two wall fans, one wall speaker and a Saint Peter–Saint Paul pair in each wing**. None of the tested alternatives meets every lighting, speech, feedback, air, noise and concealment target. This is a held visual/engineering review, not an accepted optimum, construction issue or purchase schedule. Phase E2 remains unmerged.

## Owner intent and dimensional basis

`USER CONFIRMED`: smaller brass chandeliers matching the nave; fewer than four per wing; wall fans instead of the two large roof fans; two speakers total, one per wing, facing toward the entrance in Father's viewing direction; and **Peter plus Paul between the two windows in each wing** (four pictures total). The six nave wall fans are visible by default but remain OFF in built-in modes. These directions do not approve product capacity, exposed equipment, bracket strength or installation.

Model metres: X increases toward the sanctuary, Y above nave floor, Z negative B / positive H. Entrance-facing means **−X / yaw180°**. Compass orientation remains unverified; conflicting east/west descriptions must not set out a speaker. Geometry is `MODEL TRANSCRIPTION`: `bundle.js`, outer veranda9–10 wall and Side-gable return wall definitions. Wing grid X36.975–44.175 (7.20 m); floorY−0.320; gable centreZ±13.249/thickness0.30/innerface±13.099; windowsX37.675–38.675 and42.475–43.475, Y0.850–3.608. Return walls are0.32 m thick; modeled inner limitsX37.135/44.015. Original dimensions/workbook conflicts are unchanged. Software decimals do not establish survey accuracy or bracket-hole set-out.

The full central **X38.675–42.475** strip is reserved for art because final picture size/height is unknown. Actual support substrate, recesses, finishes, install tolerances and service access require survey/architectural review.

## Current held equipment and settings

| Scope | IDs | Reference XYZ / settings | Basis and outstanding work |
| --- | --- | --- | --- |
| Two chandeliers per wing | L63/L65B; L67/L69H | X38.940/42.220,Y3.800,Z±10.150; downward100°,2700K,full dim1 | Unchanged5640lm/51W catalog assembly:2820lm/27W candle lamps plus unverified2820lm/24W reading optic; no IES/LDT, thermal/glare/flicker approval |
| Two wall fans per wing | F240/F241B; F242/F243H | X38.050/43.100,Y4.050,Z±13.060; aimX38.940/42.220,Y0.280,Z±10.150; low1 | Same45cm fan ratings as previous fanWall: low.45m³/s35W47dBA@1m; medium.60m³/s45W52dBA; high.75m³/s55W57dBA. New `fanWingWall` bracket envelope only, not an approved product |
| One wall speaker per wing | S276B/S278H | X43.720,Y4.850,Z±13.060; yaw180°,tilt−50°,gain−6dB; aligned22.9/37.1ms | Existing slimColumn representative directivity/sensitivity unchanged. Passive60W audio rating is not mains demand. Selected product, response, amplifier channels and commissioning pending |
| Peter / Paul pair per wing | D-WING-B-PETER/PAUL and D-WING-H-PETER/PAUL | X39.700/41.450,Y2.200,Z±13.095; faces into wing | **CONCEPT** frame1.12×1.62 m, artwork1.00×1.50 m; final dimensions/height/frame/glass/substrate/fixings all pending. Unpowered, no electrical routes |

L64/L66/L68/L70, S275/S277 and F-WING-B/H-3/4 are retired from the default; retained IDs are not renumbered. User-entered register fields and retired records remain through the owning refresh workflow.

Chandelier body low point is aboutY2.5595, **2.8795 m above wing floor**; suspension ends are projected roof visualization references, not engineered anchors. The extended fan bracket has a modeled pivot outreach0.40 m instead of0.14 m: it removes actual sampled guard/wall penetration without changing fan ratings or noise assumptions. Its0.26 m increase changes the real modeled nozzle position used by the calculation. Structural capacity, vibration, corrosion and maintenance envelope remain null/unapproved.

## Coordinated alternatives and honest failures

The [sound sweep](../../review/wing-sound-2026-10-09/sweep/comparison.json) compares 23 cases, retaining all 368 receivers,80 wings, unchanged light/fan inputs and actual complete layout imports. Two slim columns atY4.4/tilt−50/gain−6 gave the highest tested minimum wing STI,0.429234/mean0.489869 in four-block seating, versus0.425676/0.499902 for the earlier four pendants with four wall fans. This worsened ambo/altar feedback from1.206/1.715 to0.855/1.347 dB (target3). Lower gain−10 improved feedback but reduced wing minimum to about0.392 and created late-echo seats; point-source alternatives were worse in minimum clarity. No speaker case passed all targets.

The later full geometry check rejected that sound reference atX43.82 because its tilted complete body overlaps the return wall. Moving toX43.72 atY4.4 intersects the new sampled rear-fan envelope. Raising toY4.85 clears both; **this changes performance and is recalculated in the joint review**, rather than claiming the earlier acoustic optimum still applies. The wing speakers do not face each other or the sanctuary. Direct aim alone cannot eliminate reverberant microphone return.

[Combined light/fan study](../../review/wing-revision-2026-10-09/comparison.json) records 20 cases for each seating layout, all 368/80 points and worst-seat coordinates. Representative light outcomes (same unchanged assembly ratings):

| Light option | Wing minimum / mean lux | Below200 / above300, of80 | Decision |
| --- | --- | --- | --- |
| Earlier four per wing,Y4.4 |204.325 /295.461 |0 /40 | More equipment than owner requests; central wall-fan positions also occupy artwork strip |
| Two per wing,Y3.8 |121.599 /214.059 |36 /8 | Held appearance choice; insufficient task light remains plainly visible |
| Two per wing,Y4.4 |127.200 /182.658 |52 /0 | Slightly higher worst point, more dark seats and lower average; not selected |

Worst book point isX43.040,Y0.480,Z±8.100 (seat floorZ±8.350). The nominal lumen rating has not been increased to make two lamps pass. A separately coordinated, concealed task-light solution or demonstrably suitable selected photometry is still needed; no extra fixture is silently added. Glare/vertical-face illumination, lacquer reflections, daylight and fan-blade flicker remain unverified.

Two end-pier fans atX37.325/43.825,Y2.7/3.5 numerically cover only36–42 of80 wing seats at.3–.8m/s; raising speed worsens noise. **Those layouts are physically rejected**: sampled guards cross window and return-wall extents. Existing four fans per wing at medium meet nominal local air 80/80 but exceed noise/speech criteria and occupy the saints strip. The no-wing-fan comparison reduces noise but leaves all 80 wing air points below target. The current above-window extended-bracket pair is included separately in [final comparisons](../../review/wing-revision-2026-10-09/README.md); no all-criteria pass is inferred.

Four chandeliers total use 204 W and four low wall fans use 140 W, **344W less** than the preceding eight-light/eight-fan review (408+280W). Maximum connected fan rating is220W for four units. This is a catalog comparison, not a lifecycle saving or utility/nameplate measurement. AV electrical input remains unknown; passive audio ratings must not be added as mains watts.

## Final coordinated default results

Fresh full-service four-block results at the final raised speaker / extended fan geometry: wing light **121.599–319.883 lux, mean214.058625**,36/80 below200 and8 above300; local air **0.062058–0.455662 m/s**,32/80 inside.3–.8; noise maximum **45.739876 dBA**,80/80 above45; STI minimum/mean **0.4222299304 /0.4900177167**,80/80 below.60 and12 below.45. Every wing sample is below68dBA speech; **ambo/altar feedback0.8531504855 /1.3466838877 dB** remain below3. No target was relaxed. Whole church has40/368 book points below200,72 air points below.3,364 noise points above45 and129 STI points below.60.

Medium fan speed only brings36/80 wing air points into range while increasing peak noise to48.903204dBA and reducing minimum STI to0.410637. It is not selected. Turning these fans off passes the noise comparison but leaves0/80 wing air points in range; speech remains held. KeepingY3.8 chandeliers leaves fewer dim seats and a higher average thanY4.4, but minimum task light still fails. The final form uses fewer visible objects and preserves the art strip; it does **not** win all engineering criteria. Retain separate task-light, quiet-fan/acoustic and concealment work instead of increasing imaginary outputs.

Worst measurement points in final four-block low mode: bookX43.040,Y0.480,Z−8.100; airX38.110,Y0.280,Z−11.950; speech clarityX43.040,Y0.880,Z−10.150; maximum noiseX42.490,Y0.880,Z+11.950. Equivalent side/per-seat values and all source transforms are retained in the [raw final case](../../review/wing-revision-2026-10-09/final-blocks-4/lights2-y3.8-fans2-extended-y4.05-speed1.json). The corrected two-block layout gives wing minimum/mean STI0.4215765928/0.4896412166 and feedback0.8063110065/1.2969322910dB; it also fails. Do not use earlier count-cached two-block values.

## Calculation basis and corrected seating cache

Use actual `design.js`/`catalog.js`/`engine.js`/`analysis.js` and whole-layout imports so source types, transforms, emitters and routes agree. Unchanged settings: occupancy.60,maintenance.80,ambient40dBA,28°C,75%RH,openings1.0. Lux at local floor+.80m with per-seat book offsets; air+.60m; speech/noise+1.20m. All 368 receivers remain (288nave/80wing), in both2/4block layouts; these are not approved capacity.

Targets remain 200–300lux,.3–.8m/s,STI.60, weaker historical wing minimum.45/mean.50, noise45dBA and feedback3dB. These project criteria are not established Vietnamese code clauses; see [acceptance](acceptance-matrix.md) and [design basis](design-basis.md). Empirical jets and statistical acoustics are comparison methods, not CFD or measured/commissioned performance. Decibel averages use acoustic energy, not arithmetic dBA.

A real cache defect was found: two/four-block layouts have the same368 count, so a key using only count could retain directional audience interception from the other seating positions. `refreshSeats` now clears that cache when the actual receiver-array identity changes. [Independent regression](../../review/wing-revision-2026-10-09/audience-cache-regression.json) recomputes all 28 source fractions for4→2→4 and a same-count position change; the old code fails the negative control. Four-block historical results remain exact; earlier two-block sound results are superseded by corrected cases. Physics, thresholds and sampling are unchanged. No cache fix is counted as engineering acceptance.

## Artwork, clearance and visibility

[Native Peter/Paul artwork and exact generation provenance](../../Thach_Bi_Viewer/references/10-wing-saints/README.md) retain two 1024×1536 PNGs, generated with the built-in image tool. They are reused across four frames without resampling. Subjects/location are user intent; likeness, final artwork and physical print/product remain concepts. No picture light or electrical demand is invented. No analytical room absorption/material property is changed to improve speech; real framed/glazed surfaces require coordinated acoustic/lighting review.

The [finite-mesh geometry screen](../../scripts/verify_wing_clearance.cjs) checks full chandelier/support/speaker/frame boxes,17 fan-yaw samples across±40°, gable/window/return-wall/art strip, existing2.4m above-floor screen and50° main task-cone halfangle. [Actual bounds](../../review/wing-revision-2026-10-09/final-clearance/geometry.json) remain inspectable. Sampling does not certify continuous motion, installation tolerance, manufacturer/service clearance or mount capacity. Broad field tails/decorative candle light can still strike blades. No mounting cavity/support strength is inferred.

Equipment is visible in normal 3D. The all-hidden requirement remains unresolved from seated/standing, shorter/wheelchair, sanctuary/choir/entrance and exterior approaches; turning meshes off is not concealment. The exposed above-window fan brackets and speakers require architectural/parish review and full-scale performance/access tests.

## Electrical, controls and saved layouts

L8 has four chandelier items; F5 has four wall-fan items through **DB-1→FC-1**. F1 retains14 nave roof fans; F2 retains6 shown/OFF nave wall fans. A1 retains one wing speaker each throughAV-1. DB-1/DB-2 feeder logic remains unchanged. Physical channels/terminals/cable/protection/supply/earthing/fault level are pending; no physical equipment commands exist. Existing quick-mode dim/speed values are unchanged comparison settings; lighting/air/noise failures mean they are not approved operating instructions.

The exact entry is `Thach_Bi_Viewer/OPEN_CHURCH.html`. Saved layouts may differ. Conservative migration changes only a whole exact untouched original or intermediate wing; moved/deleted/renamed/noted/retuned/operating-overridden records preserve the whole side. Lights/fans and sound use separate revisions. First-issue art is additive per missing pair, never overwrites reserved IDs; an edited/partial pair remains partial. The marker prevents deleted art reappearing on reload. No global layout reset/version bump occurs.

**Simulator→Wiring** shows live content, actual counts, obsolete/mismatching IDs and separate history markers. Explicit **Use reviewed lights and fans**, **Use reviewed speaker** and **Use reviewed saints ·B/H** actions write full durable backups first, affect only the chosen scope and support Undo/Redo. Light ON/dim and retained notes survive; sound ON/note survive; custom/unrelated items/scenes/settings stay. Existing reserved-ID conflicts block replacement. Backup/save failure leaves layout/history unchanged. Undo captures actual prior equipment including unrecorded slider edits. Export browser JSON for a backup outside browser storage. These are local model edits, not hardware commands.

Matching category registers, schedules, 2D/3D routes, bilingual PDFs, conditional cable report and Japan budget come from the same final default revision. Browser edits require a separate matched export workflow. Geometric lengths exclude installed slack/spares/terminations; current cable/protection and full cost remain unapproved. See [parish/designer questions](questions-for-parish-and-designers.json), including picture dimensions and fixing.

## Next responsible review

Lighting: selected photometry and fewer-visible-fixture task-light solution. Mechanical/acoustics: quieter selected fan, installed duty/noise curve and speech/feedback trials. Architecture/structure: real picture/window/wall/roof survey, equipment/art size and mounting/support/access, concealment from all required people/viewpoints. Electrical: confirmed supply/earthing/fault level, protection/derating/inrush, actual AV mains and manual channels. Record measured commissioning and seasonal results before release.

Earlier four-light/four-fan results remain historical in [their evidence](../../review/wing-options-2026-10-09/README.md); they must not be presented as the current default. Current software checks do not remove any engineering hold.
