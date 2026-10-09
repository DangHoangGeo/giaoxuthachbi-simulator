# Nave wall-fan geometry screen · 9 October 2026

Software geometry evidence for the sixteen F2 nave wall fans (eight per side, axes 2′, 3–9). **CONCEPT / ENGINEERING HOLD** — not a product, anchor, service-access, sightline or ventilation approval. Owning design: [nave-wall-fans.md](../../../docs/engineering/nave-wall-fans.md).

| File | What it shows |
| --- | --- |
| [geometry.json](geometry.json) | Displayed layout (`fanNaveWall`, 0.40 m pivot outreach). Every moving mesh vertex over the full ±40° sweep, plus the all-angle rotor sphere and 17 sampled full-mesh boxes, tested against every modeled building mesh box and every other fixture. Source hashes included. |
| [short-bracket-comparison.json](short-bracket-comparison.json) | The rejected short `fanWall` bracket (0.14 m outreach) at the same sixteen positions. |

## Results

- **Extended bracket (displayed):** passes. Column-face penetration 0.000 m; smallest gap to the modeled window/door crown (Y4.311) 0.920 m; no building-mesh or fixture intersection; no overlap between neighbouring fans' motion envelopes.
- **Short bracket (rejected):** 16 of 16 fans enter the modeled column face, by up to **0.241 m**. This is why `fanNaveWall` exists.

## Reproduce

```sh
node scripts/verify_nave_fan_clearance.cjs                    # displayed layout → geometry.json
node scripts/verify_nave_fan_clearance.cjs --short-bracket    # rejected bracket → short-bracket-comparison.json
```

## Limits

The 0.40 m outreach is a visualization proxy. Actual guard/bracket dimensions, strength, anchors, vibration, corrosion, installation tolerance, service clearance, light/blade interaction, airflow, noise, maintenance access, inclusive sightlines and concealment remain unknown. The modeled column face (Z±7.07 m, 0.58 m shaft) is a MODEL TRANSCRIPTION; the physical section is open (RFI-S07). Mesh clearance does not approve the fixing.
