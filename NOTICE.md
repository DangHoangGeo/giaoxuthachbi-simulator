# Licences, attribution and third-party material

Licence decision: **USER CONFIRMED** by the project owner on 10 October 2026. This file says which licence covers which part of the repository. The licences cover only work made for this project. Material made by other people keeps its own terms and is listed separately below.

## Not engineering advice

Everything here is a design study. The model, simulations, schedules, drawings and reports are planning estimates. They are not approved construction documents, and they do not replace a responsible qualified engineer's checked design or measurements on site. The licences below provide the work as it is, without warranty. Anyone who reuses it for another building is responsible for their own design, checking and approvals.

## The project's own work

| Material | Where | Licence |
| --- | --- | --- |
| Software: viewer, simulator, verification and generation scripts, web application source, workflows | `Thach_Bi_Viewer/` scripts, styles and pages; `scripts/`; `web/`; `.github/` | [MIT](LICENSE) |
| Documents and data: briefs, methods, studies, plans, review records, the dimension workbook, equipment registers, schedules and exports | `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/`, `plan/`, `review/`, `output/`, model and layout data in `Thach_Bi_Viewer/` | [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) |
| Images rendered from the project's 3D model | `Thach_Bi_Viewer/references/` and `review/`, where the manifest records a model capture | CC BY 4.0 |
| Film music: the original *Homeland* melody and the project's note transcription of the Bach/Gounod *Ave Maria* (both source works are in the public domain; see the [simulator guide](docs/simulator/guide.md)) | `Thach_Bi_Viewer/cinematic-tour.js` | MIT, as part of the software |

The full CC BY 4.0 legal text is at <https://creativecommons.org/licenses/by/4.0/legalcode>.

**Suggested credit:** “Thạch Bi Church design simulator project, <https://github.com/DangHoangGeo/giaoxuthachbi-simulator>, CC BY 4.0”, with a note of any changes you made.

## Generated concept images

Concept images made with image-generation tools are recorded with their prompts and provenance in the [reference manifest](Thach_Bi_Viewer/references/manifest.json), the per-folder provenance files and the [timber image manifest](docs/beams-roof-connections/image-manifest.json). The project shares them under CC BY 4.0 to the extent that it holds rights in them. Copyright in machine-generated images is unsettled and differs between countries, so the project cannot promise more than that. They remain **CONCEPT** images. The public-use review recorded for the [sanctuary wing saints](Thach_Bi_Viewer/references/10-wing-saints/README.md) is still pending.

## Material that is not covered by the project licences

No licence is granted by this project for the following. They are kept as source evidence for review. Ask the rights holder before reusing them.

| Material | Where | Status |
| --- | --- | --- |
| The church's architectural drawings and images taken from them | `docs/layout_design/*.pdf`, the drawing images `docs/layout_design/*.png`, and the copies in `docs/beams-roof-connections/sources/` | Rights remain with the drawing authors and the parish. Permission to publish them is a **PUBLICATION HOLD** in the [publication checklist](docs/open-source/publication-checklist.md). |
| Five photographs and phone screenshots of other churches | `docs/beams-roof-connections/sources/IMG_*` | Third-party images. Their photographer and permission are not recorded. The four screenshots were cropped on 10 October 2026 to remove the sender's name and profile picture. **PUBLICATION HOLD**. |
| three.js, bundled inside the viewer | `Thach_Bi_Viewer/bundle.js` | MIT, © three.js authors: [THREE_LICENSE.txt](Thach_Bi_Viewer/THREE_LICENSE.txt) |
| Noto Sans fonts for PDF exports | `scripts/fonts/` | SIL Open Font License 1.1: [OFL.txt](scripts/fonts/OFL.txt) |
| Web application dependencies | installed from `web/package-lock.json`, not stored here | Each package's own licence |
| Manufacturer names, product data, supplier names and price references | `docs/budget/`, `docs/systems/`, registers | Belong to their owners. They are quoted as references and are not endorsements or offers. |

The name and image of Thạch Bi parish belong to the parish community. The licences do not permit using them to suggest that the parish or the project endorses another work.

## Adding material

Record the source, author, date and licence or permission of anything you add that you did not make yourself, in the relevant manifest. Do not add material whose terms do not allow public sharing. See [CONTRIBUTING.md](CONTRIBUTING.md).
