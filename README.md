# Thạch Bi Church — 3D model and design simulator

A personal project to help my hometown church in Vietnam make better decisions about lighting, sound, fans, electrical routing and construction details. It brings a virtual 3D model, comparative simulations and engineering records together so that the community can review ideas before spending limited resources.

**This is an evolving design study.** The model and simulator produce planning estimates; they are not approved construction drawings or a substitute for checked engineering design and on-site measurements.

**This is an open-source project, and help is welcome.** Experienced engineers, architects, craftspeople and software contributors can review the work, [report a problem](CONTRIBUTING.md#report-a-bug-or-a-review-finding) or [send a pull request](CONTRIBUTING.md#send-a-pull-request). Software is under the [MIT licence](LICENSE); the project's documents, data and images are under CC BY 4.0. Third-party drawings and photographs are excluded: see [NOTICE](NOTICE.md).

## Why I started

My hometown is a small village in Ninh Bình, Vietnam, formerly in Nam Định Province. Our community has deep Catholic roots, connected to the early history of the faith in Vietnam. The church has long been part of our everyday lives.

As I write this in October 2026, our old church is about 34 years old. Parts of it have deteriorated, and it can no longer comfortably serve the number of people who come there. Construction of the new church began in **February 2026**. The foundation is already finished, and construction is underway. Building a new church is a major undertaking for a small village. Families contribute what they can afford, and some people contribute their time and labor at the construction site.

When I was a teenager, I also helped with small construction projects at the church. I now live abroad and follow the building work through the parish's Facebook updates. Seeing elderly neighbors turn up and work through hot days has stayed with me. I kept wondering how I could help from far away, beyond making a donation.

On Sunday, **4 October 2026**, my brother-in-law called and asked whether I could use AI to help optimize the church's lighting and electrical control boards. I replied, “Of course, I'm very happy to help.”

That conversation became the starting point for this project. Through my personal AI projects, software experience and knowledge of civil engineering, I saw a way to contribute: build a virtual model of the church, compare equipment placements, examine the assumptions and make the results understandable to the people making decisions.

The work has grown to include sound, fan-based air movement and ventilation, electrical routes, and the coordination of complex construction details. I intend to share daily progress as I develop it, including mistakes, unresolved questions and lessons learned.

My hope reaches beyond this one church. Communities with limited budgets and limited access to specialist engineers deserve thoughtful design and careful evaluation too. I want to explore how technology, transparent records and help from experienced people can make that work more accessible and make better use of local resources.

## What the project does

- **3D visualization:** explore the church, walk through it, compare seating layouts and inspect the architecture, sanctuary, materials and proposed details.
- **Lighting studies:** adjust fixture positions, aiming and settings; compare estimated illumination at seats and other evaluation points.
- **Sound studies:** compare loudspeaker and microphone positions, speech clarity, delays, room reverberation and feedback risks. A listening mode helps explore the proposed arrangement.
- **Fans and ventilation:** compare local air movement, fan noise and ventilation assumptions. The current brief uses fans and ventilation, with no air conditioning.
- **Electrical coordination:** inspect matching 2D/3D route geometry, equipment and route IDs, boards, circuits and geometric lengths. Develop main/sub-board manual controls and quick operating modes alongside the web interface.
- **Equipment records:** maintain six Excel registers by usage category, each with the same Equipment, Electrical Lines and Route Points sheets, plus guidance. A summary reports quantities, modeled usage and missing engineering information.

The immediate priority is to coordinate the positions of lights, speakers, microphones and fans, then refine their wiring and physical controls. Energy use, maintenance access, repairability and long-term operation matter alongside appearance and comfort.

**Construction update — 7 October 2026:** the project owner confirms the February 2026 start, completed foundation and ongoing construction. Exact milestone dates, site photographs and verified as-built measurements will be recorded as they become available. The digital model remains a design study; this progress update does not establish that its geometry matches the work already built.

## Planned web app

The [web app roadmap](plan/README.md) proposes Next.js on Vercel: a public church homepage and image gallery, a construction timeline, a 3D visit and read-only engineering views. A later inspection view will help Father find upcoming work and inspect source-backed object positions, dimensions and specifications.

The website under `web/` has a Vietnamese/English homepage, a gallery of design concepts, a construction timeline and a 3D visit, all marked “In development · Not for construction”. Since 10 October 2026 the 3D visit is the same viewer described below, opened in a visit-only mode without the Simulator editing tools, so the website and the local model cannot drift apart ([how it works](docs/web/viewer.md)). There is no private version. See the [development guide](docs/web/development.md) and [delivery status](docs/web/deployment.md). The eight-phase roadmap still governs the remaining features and launch gates. The offline viewer remains the engineering authoring application.

## Open the model

See the [7 October church concept gallery](Thach_Bi_Viewer/references/00-overview/2026-10-07/index.html) for sixteen exterior, interior, carved-detail and top-down views, including side-door/window close-ups and the sanctuary-end rear elevation, with native originals and resampled Full HD copies. These use the model and approved art references; they are generated design concepts, not construction-site photographs. [Design notes and provenance](docs/church-view-renderings.md) explain the source hierarchy and limitations.

1. Download or clone the repository. If downloading a ZIP, extract it completely. The full history is several hundred megabytes; `git clone --depth 1` is enough to open the model and run the checks.
2. Open [Thach_Bi_Viewer/OPEN_CHURCH.html](Thach_Bi_Viewer/OPEN_CHURCH.html) in a browser with JavaScript and WebGL 2 support.
3. Choose **Go inside** to explore, or **Simulator** to work with lighting, sound, fans and equipment. Use **Simulator → Wiring** for electrical routes.

Keep the whole viewer folder and its assets together. The viewer runs locally without installing a server or downloading runtime dependencies. Opening an HTML file in GitHub's source preview does not run the model.

For Father and first-time visitors there is a step-by-step Vietnamese guide with narration and a short video: [Hướng dẫn tải về và xem mô hình](docs/guides/father-quick-start/README.md) (also at `/guide/index.html` on the website).

See the [viewer instructions](Thach_Bi_Viewer/READ_ME.txt) and [simulator guide](docs/simulator/guide.md) for controls. To inspect the lights, fans, sound, socket outlets and cable routes system by system, start with the short [inspection guide for the parish priest and local engineer](docs/electrical-inspection-guide.md) ([tiếng Việt](docs/electrical-inspection-guide.vi.md)). Edited layouts are saved in the browser; export a layout JSON before moving to another browser or sharing a study. Browser edits do not automatically update the repository or the Excel files. The simulator does not control installed equipment.

## Start here

| If you want to… | Read |
| --- | --- |
| Understand the design brief and priorities | [Interior and systems plan](docs/interior-systems-plan.md) |
| Understand the calculations and their limits | [Simulator methods and limitations](docs/simulator/methods-and-limitations.md) |
| Review drawing dimensions and unresolved geometry | [Drawing and dimension sources](docs/layout_design/) and [dimension workbook](docs/layout_design/Thach_Bi_Church_Dimensions.xlsx) |
| Review the sanctuary and current interior | [Sanctuary model](docs/sanctuary-model.md) |
| Review timber members and connection concepts | [Beams and roof reference package](docs/beams-roof-connections/README.md) |
| Review routes, boards and operating modes | [Electrical grid documentation](docs/electrical-grid/README.md) and [control brief](docs/electrical-grid/controls.md) |
| Inspect equipment, line IDs and positions | [Category Excel registers](docs/electrical-grid/categories/README.md) and [refresh workflow](docs/electrical-grid/register.md) |
| See total quantities, usage and missing inputs | [Summary report](docs/electrical-grid/summary-report.md) |
| Report a bug, review a calculation or send a pull request | [Contributing guide](CONTRIBUTING.md) |
| Change code, the model or documents, yourself or with an AI agent | [Project and AI-agent rules](AGENTS.md) |
| Know what you may reuse, and on what terms | [Licences and third-party material](NOTICE.md) |
| Implement the future public and protected web app | [Web roadmap and phase plans](plan/README.md) |

## Where community help would matter most

I know there are parts of this work that need more experience than I can bring alone. A careful review of one assumption, one detail or one calculation would already be valuable.

| Area | Review and contributions needed |
| --- | --- |
| Lighting | Selected-product photometry, maintained illumination, glare, faces and reading tasks, aiming, outdoor spill and emergency lighting. |
| Acoustics and sound | Speech intelligibility in the wings, microphone feedback margins, loudspeaker selection and placement, occupied-room behavior and commissioning methods. |
| Fans and ventilation | Outdoor-air delivery, fan duty points, make-up air, noise, mounting clearances and comfort in hot, humid weather. |
| Electrical and controls | Supply and earthing assumptions, cable/protection design, routing feasibility, main/sub-board layout, local manual control and safe failure/restart behavior. |
| Structure and construction | Timber/concrete interfaces, member and connection assumptions, equipment supports, tolerances, durability and installation access. |
| Accessibility and operation | Seating, circulation, sightlines, clear operator labels and practical maintenance routines. |
| Software and simulation | Calculation verification, measured-data comparison, reproducible scenarios, model/document consistency and usability on modest devices. |

The [7 October 2026 review](docs/simulator/README.md) still records low ambo/altar microphone feedback margins, a wing speech-clarity shortfall and lighting/ventilation limitations. Product selections, final cable specifications and physical control channels also remain incomplete. These are useful starting points for review.

## How to contribute

The [contributing guide](CONTRIBUTING.md) has the details. In short:

- **Found a bug or a mistake?** [Open an issue](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/issues/new/choose) with one of the two short templates. Say where it is, how to see it, what you expected and what evidence you have. Reviews and explanations are useful even without a code change. English and Vietnamese are both welcome.
- **Want to change something?** Fork the repository, work on a branch and open a pull request against `dev`. Every change is reviewed and merged by the maintainer, [@DangHoangGeo](https://github.com/DangHoangGeo). `main` holds the reviewed version and receives only what the maintainer promotes from `dev`; both branches are protected. For larger changes, open an issue first.
- **Security or privacy problem?** Report it privately as described in [SECURITY.md](SECURITY.md).

Read [AGENTS.md](AGENTS.md) before editing; it applies to people and to AI agents. Every 3D change must check its governing documentation and update affected specifications, plans, registers and reports in the same logical commit. Preserve stable IDs, original source evidence and entered engineering data. Run the relevant checks, then make a small commit for each coherent change. Include the checks/results and remaining limitations in the commit and pull-request description.

Everything committed is public. Do not add passwords, private contact details, images of private people, or drawings and photographs you do not have the right to share. Be respectful: see the [code of conduct](CODE_OF_CONDUCT.md).

Please distinguish a visual concept, a simulation estimate, a measurement and an engineer-approved design. Changes intended for installation need the responsible designers' review and coordination with the people building and operating the church.

## Verification for contributors

Run the relevant commands from the repository root. The core JavaScript checks use Node.js; the timber package validator uses Python 3.

```sh
# Geometry, seating and model consistency
node scripts/verify_model.cjs

# Independent analytical cases for the estimate methods
node scripts/verify_estimates.cjs

# Integrated calculation audit, reporting unmet design targets
node scripts/verify_simulator.cjs --report --estimates

# Electrical route checks
node scripts/verify_simulator.cjs --electrical

# Timber reference-package consistency
python3 docs/beams-roof-connections/validate.py

# Whitespace and patch checks before committing
git diff --check
```

The stricter `node scripts/verify_simulator.cjs` also requires its design targets to pass; the documented baseline has unresolved failures. Report those honestly. Headless tests check software behavior and calculation consistency; they do not verify browser rendering, listening-device playback or actual building performance.

The HTML brief generator requires `marked`. Excel regeneration uses the configured `@oai/artifact-tool` runtime, which is separate from the offline viewer and core checks. See the [register workflow](docs/electrical-grid/register.md) before refreshing spreadsheets; it explains dependencies, source snapshots and preservation of editable fields.

## Repository layout

| Location | Contents |
| --- | --- |
| `Thach_Bi_Viewer/` | Offline viewer, model, simulator modules, interactive plan and reference assets. |
| `docs/` | Drawing sources, design briefs, calculation limitations, engineering studies and equipment registers. |
| `scripts/` | Verification and document/register generation tools. |
| `web/` | Local desktop web foundation; unpublished public shell and disabled private access. |
| `plan/` | Engineering/web roadmaps, implementation phases and release criteria. |
| `review/` | Dated review evidence and historical comparisons; earlier results may not describe the current model. |
| `AGENTS.md` | Shared rules for accuracy, coordinated documentation, testing and small commits. |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` | How to report problems, send pull requests and behave in the project. |
| `LICENSE`, `NOTICE.md` | Licences, attribution and the third-party material they do not cover. |
| `.github/` | Issue and pull-request templates, code owner and the web checks workflow. |

## Licence and reuse

Other parishes and communities are welcome to reuse this work. The project owner chose the licences on 10 October 2026:

- **Software** (viewer, simulator, scripts, web application): [MIT](LICENSE).
- **The project's own documents, data, registers and model renderings:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit the project and say what you changed.
- **Not covered:** the church's architectural drawings, photographs of other churches, and bundled third-party code and fonts. They keep their owners' terms. Generated concept images are shared only to the extent the project holds rights in them.

[NOTICE.md](NOTICE.md) lists exactly what falls under each heading. Preserve the recorded attribution and provenance in the [reference manifest](Thach_Bi_Viewer/references/manifest.json) and [timber image manifest](docs/beams-roof-connections/image-manifest.json). The licences provide the work as it is, without warranty: a reused model or calculation still needs its own checked engineering design.

The source and history review that precedes making the repository public is recorded in the [publication checklist](docs/open-source/publication-checklist.md).

Thank you for helping a small community ask better questions, find errors earlier and make informed decisions about a building it hopes to use for many years.
