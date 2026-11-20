# Façade contact shading · 19 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner reported that plaster darkened on approach and asked to preserve soft shadows around the carvings and mouldings. The old display pass could fetch depth and reconstruct positions from different texels where the half-resolution effect sampled between pixels. It also spread shade over a 0.90 m reach. The corrected pass uses matching depth texels and a 0.18 m reach. [Display settings](../../docs/interior-finish.md#façade-contact-shading--19-november-2026)

[Day comparison](day.jpg) · [Evening comparison](evening.jpg)

Desktop Chrome, visit-only, 1360 × 820 at 1×. The images compare `6caa5c4` and the corrected display pass at 12 m and 55 m from the upper plaster target. The target is X 2.936, Y 13.85, Z 2.36 m. The camera offsets follow the normalized vector (−1, −0.15, −0.22). Comparison labels were added below or above the render. The capture session neutralized textures under publication hold H8. The images use the same model geometry and entrance layout in both versions. [Publication record](../../docs/open-source/publication-checklist.md)

## Pixel checks

The regression script renders both lighting modes and compares the median 11 × 11 pixel patch on a 0–255 display-luma scale. Each reference frame removes only contact shading so it keeps the same exposure, lights, haze and tone mapping. These values describe the image.

| View | Day | Evening |
| --- | --- | --- |
| Upper plaster at 6 m and 100 m, before | 149 / 216 | 113 / 166 |
| Upper plaster at 6 m and 100 m, after | 217 / 216 | 167 / 166 |
| Contact shade beside the central moulding at 6 m and 25 m, after | −15 / −15 | −12 / −13 |

At 6, 25, 55 and 100 m the regression samples the upper and lower front and side plaster. At the synthetic tilted wall, the flat surface reads the same with contact shading enabled. A raised bar produces a shadow on that same wall. The test reproduced the broad brightness shift on the older viewer and passed on the corrected version.

```sh
HEADED=1 PLAYWRIGHT_MODULE="$PWD/web/node_modules/playwright" node scripts/verify_display_finish_browser.cjs
```

The local desktop visit, viewer inventory, production boundary, rendering policy and GPU lighting checks passed. Next.js compiled the site and stopped the release build on its existing dependency security advisory. The local browser tests used the compiled pages and prepared viewer files. The simulation and engineering holds continue to apply. [Engineering baseline](../../docs/engineering/central-view-constraint.md)
