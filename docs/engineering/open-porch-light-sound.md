# Open-porch lighting and lower nave speakers

25 October 2026. **In development / Đang phát triển. Not for construction / Không dùng để thi công.**

The owner requested a review of both verandas after the outer walls were removed, exterior floodlights to reveal the arches, and nave speakers at about 2.5 m (`USER CONFIRMED`, chat, 25 October). This is a coordinated **CONCEPT** layout. The previous pendant arrangement belonged to the earlier enclosure. Geometry follows [porches.js](../../Thach_Bi_Viewer/porches.js) and the [parish meeting record](parish-meeting-2026-10-25.md). Products, capacities, fixings and compliance are not approved.

## Implemented model

Coordinates are metres above nave floor: X toward the sanctuary, B negative Z, H positive Z. Porch floor is −0.32 m. Each side has nine bays: 2′–3, 3–4, 4–5, 5–6, 6–7, 7–8, 8–9, 10–11 and 11–12. Bay 9–10 is the wing and is excluded from this arcade arrangement.

| Group | Both sides | Reference position / aiming | Stable IDs and logical circuit |
| --- | ---: | --- | --- |
| Wall path floods | 18 | X = bay end −0.43, Y 3.10, Z ±7.47; aim at bay midpoint, floor plane −0.30, Z ±8.85. 900 lm, 90°, 3000 K concept | Existing L119–L136, L4 |
| Exterior arch floods | 36 | Two per bay on outer pilaster faces, X = bay start +0.075 / bay end −0.075, Y 2.60, Z ±10.654; cross-aim onto arch moulding near Y 5.35. 750 lm, 45°, 3000 K concept | `L-ARCH-{B/H}-{bay}-{A/B}`, L4 |
| Porch wall fills | 18 | One per bay, X = bay end −0.43, Y 2.70, Z ±7.47; aim toward bay midpoint at ear Y 0.88, Z ±8.85. Level −16 dB, aligned delays | S279–S282 retained in bays 3–4 and 6–7; 14 new `S-PORCH-{B/H}-{bay}`, A2 |
| Nave wall columns | 12 | Existing X axis −0.43, Z ±7.25; Y **2.50**, tilt −14°, yaw ±140°, level −6 dB | S261–S272, A1 |
| Entrance hall columns | 2 | Existing X/Z anchors; Y **2.50**, re-aim at X 7.5, Y 1.2, Z ±3.6; level −9 dB | S273–S274, A5 |

The 2.5 m value is the modeled mounting/acoustic reference. The tilted 0.6 m nave enclosure extends down to approximately **2.197 m** and up to 2.796 m. Entrance fills extend down to 2.197 m at the earlier entrance wall, or 2.213 m with the concurrent door-relocation working geometry; the height review retains the wall X/Z of each layout. It is not a claim of 2.5 m clear headroom. Confirm the actual product, bracket, impact risk and local access criteria. Two wing speakers S276/S278 retain their separate held arrangement.

Small finish-matched brackets sit on modeled masonry/pilasters. Exterior floods stand above circulation, with no new ground fittings. Head pivots and optical axes use actual modeled offsets. Full envelopes pass the fixture-to-fixture overlap screen and mounting rays meet real modeled masonry. These screens do not validate anchors, residual masonry, support loads, weather seals, insect protection, glare, corrosion or safe replacement access. Do not chase structural cores without the structural designer's approval. The new speaker enclosure reuses the old generic pendant acoustic category for comparison; its weather rating and measured directivity are unknown. No manufacturer performance is inferred from its appearance.

## Comparative calculations

[Evidence and commands](../../review/veranda-sound-2026-10-25/README.md) retain the before layout, five height/tilt cases, four porch gain cases and fixed probes on both sides. Physics, acceptance thresholds and indoor receiver grids are unchanged. Full service, four-block seating, 60% occupancy, existing room/door/roof assumptions and automatic delay alignment:

| Metric | Previous layout | Selected combined concept |
| --- | ---: | ---: |
| Nave seats at STI ≥0.60 | 84.03% | 94.79% |
| Nave minimum / mean STI | 0.5345 / 0.6327 | 0.5699 / 0.6596 |
| Wing minimum / mean STI | 0.4090 / 0.4834 | 0.4109 / 0.4857 |
| Ambo / altar feedback margin | 0.926 / 1.413 dB | 0.936 / 1.428 dB |
| Direct A2 speech at porch probes, each side | 32.59–63.80 dBA | 52.23–58.35 dBA |
| Direct L4 floor light, each side | 3.93–12.57 lx | 11.54–38.38 lx |
| Direct L4 arch-surface light, each side | 0 lx | 9.59–73.23 lx |

There are 81 porch walking/ear probes and 54 arch probes per side. The arch probes intersect actual moulding meshes. Lux uses the existing simplified occluders and generic beam distribution with maintenance factor 0.8; it excludes interreflection and a full glare/spill assessment. Outdoor speech is **direct A2 sound only**, not outdoor STI, a crowd-noise margin or a commissioned measurement. Wind, reflected sound, weather and crowd noise require field checks. The 100-lux veranda/circulation trial target remains **UNMET** in this direct-light comparison; no target is relaxed. Avoid buying the provisional 9 W category by interpreting these figures as final product photometry.

Including all configured evening light sources at the same 81 floor probes per side gives **11.64–122.40 lx**, mean **37.80 lx**. This confirms that other circuit spill does not bring every probe to 100 lx. The maximum is not a uniformity or glare pass. Final task-light output/optics need further lighting design with selected products; the arch wash is decorative.

At Y 2.5, tilt −14° gave better nave coverage than −8°, −20° and −26° in the height study. Raising porch gain from −16 to −15/−12/−9 dB progressively reduced feedback margins. The low gain is a starting comparison setting, not an approved crowded-service level. Both microphone margins remain below 3 dB and wing clarity remains below its existing target. Seasonal/occupancy/overflow checks and responsible acoustician commissioning are required; higher porch levels must be reviewed with the nave microphones operating.

The [six-case sensitivity](../../review/veranda-sound-2026-10-25/sensitivity.json) retains both original seating populations in Full service, Weekday and courtyard-overflow modes. Two-block full service gives 96.88% nave seats at STI 0.60, wing minimum/mean 0.410/0.485 and feedback 0.820/1.308 dB. Courtyard overflow reduces nave good coverage to 65.97% (four blocks) / 73.96% (two blocks); ambo feedback becomes −0.630/−0.718 dB. Existing lighting/air/sightline and central-view fan holds remain. These failures prohibit an all-criteria pass.

## Wiring, controls and saved layouts

L4 remains **DB-1 → LC-1 → L4 · Circulation & verandas**; new arch/path fittings share its existing dimmer and quick modes. A separate physical arch/porch circuit is a possible design decision, not implemented hardware. A2 remains **DB-1 → AV-1 → A2 · Veranda fill**, with A1 and A5 retaining their logical controls. All speaker drops are signal home runs. Passive audio power is not mains demand; amplifier mains estimates remain separate.

New arch leads follow the existing outer-column/roof route generator, crossing above the porch roof lining and descending the column line to the fixture. Inner-wall lights/fills and lower nave speakers use their corresponding wall-band drops. Mains/audio containment separation, weatherproof entries, covers, service loops, circuit capacity, driver compatibility, protection and actual manual-control terminals remain **ENGINEERING HOLD**. Each item/drop is in the matched [layout](../electrical-grid/equipment-layout.json), [electrical snapshot](../electrical-grid/electrical-systems.json) and six [category workbooks](../electrical-grid/categories/README.md). There are 386 connected components and 445 routes after this issue (+50 each). A3 drawings and `output/electrical-review/` predate this revision and remain stale.

The scoped revision is `2026-10-25-open-porch-light-sound-1`. Before adoption, startup writes a full backup under `thachbi.simulator.v1.before-open-porch-light-sound`. A side migrates only if all 9 old lanterns and 2 old fills match their frozen prior defaults or the current defaults. A moved, hidden, deleted or retuned member blocks automatic conversion of that side. Lower nave columns migrate individually only from exact prior defaults. IDs, user notes, mute and dim states are retained; new fittings inherit their bay/group's switch/dimmer. Only changed/new speakers receive delay alignment. Repeated startup does not restore deleted equipment. Save failure rolls the migration back. Older or customized layouts can therefore retain the old design; reset recommended design only after exporting a backup and intentionally accepting replacement of edits.

Built-in Full service/Christmas/overflow enable A2; Weekday, prayer, cleaning, night and All off keep it off. L4 values remain 1/0.5/0.25/1/0.3/0 for full/weekday/prayer/cleaning/night/off. Life-safety E1 and DB-1/DB-2 feeder behavior are unchanged. Unknown physical terminals/channels stay blank in Excel. Public `?visit` remains read-only and does not load an engineering layout.

## Verification status

Headless geometry, calculation, routing, preservation and web-package checks are recorded with the issue. Desktop browser observation remains blocked by the saved local-origin permission; day/evening appearance, GPU illumination, visual glare, console behavior and audio listening are **not visually verified**. A passing script does not satisfy that review or establish construction acceptance. On 25 October 2026 the owner explicitly authorized source/headless verification and a local commit for this equipment issue as an exception to AGENTS.md's desktop-review requirement. This exception does not approve physical installation or close the unresolved design targets.
