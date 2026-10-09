# Nave wall-fan revision · 9 October 2026

Owner confirmed **eight fans per nave side, sixteen F2 wall fans total**, visible by default. Sanctuary wings retain two per side. Current source preserves six original IDs and appends ten named IDs. The short bracket is replaced by an extended geometry proxy; all fan ratings and all built-in F2 OFF settings remain unchanged. This is **CONCEPT / ENGINEERING HOLD**.

- [Owning design, dimensions, loads and saved-layout workflow](../../docs/engineering/nave-wall-fans.md)
- [Before default layout](before-layout.json) from commit614222c
- [Current default layout](current-layout.json) and [headless source/preservation proof](verification.json)
- [Continuous mesh/rotor clearance screen](geometry/README.md)
- [Desktop/offline GPU and saved-layout controls](desktop/results.json)
- [Matched route/register/bilingual PDF exports](exports/README.md)
- [Model check](model.log), [independent formula check](estimates.log), [integrated calculation audit](simulator.log)

Current model:330items plus5enclosures;296shown connected components;343routes;2,779vertices. Ten retired equipment IDs,14routes and46vertices remain. Representative F2 maximum becomes880W, adding550W to the known mains subset; default operating demand is unchanged. Supply, product selection, cable/protection, physical controls and structural fixings remain unapproved.

Old wing and closeout evidence at614222c remains historical, not silently rewritten. The separate user `exports/` directory is untouched. The new revision must remain on the held engineering branch until phase exits pass. Checks verify implementation/package consistency, not construction safety or suitability.
