# Persistent lighting effects · 5 October 2026

Every active lamp retains diffuse surface illumination at all camera distances. The detailed point/spot-light pool handles shadows and highlights; a shared emitter texture supplies the other lamps at their actual positions without counting detailed sources twice.

- `distant-overview.jpg`: distant evening view with tower, facade, doorway and path effects all present.
- `distant-front.jpg`: second distant evening angle showing the opposite side.
- `verification.log`: passing simulator checks. All 184 active emitters are covered: 23 detailed sources plus 161 persistent sources at Balanced quality, with zero omitted sources. Coverage also passes in Fast mode, at distant cameras, inside/outside, and after remote dimmer/switch changes.

These screenshots capture the intermediate implementation. The subsequent sharpness/façade correction restores the original resolution at all quality settings; see ../sharp-facade-2026-10-05/. The persistent diffuse path uses the model's inverse-square/beam-cone approximation; it does not add shadow maps. The seating calculation remains 346 lux average, 193 lux minimum, 99% at or above 200 lux.
