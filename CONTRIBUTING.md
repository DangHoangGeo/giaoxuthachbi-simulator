# Contributing to the Thạch Bi Church project

Thank you for wanting to help. This project supports a small parish in Vietnam that is building a new church with limited money and limited access to specialist engineers. A careful look at one assumption, one drawing detail or one calculation is already a real contribution. You do not need to write code.

English and Vietnamese are both welcome in issues and pull requests.

## Ways to help

| You are… | Useful contributions |
| --- | --- |
| A lighting, sound, ventilation, electrical or structural engineer | Check a method, an input or a result. Tell us what is wrong, what is missing and which standard or product data applies. |
| An architect, builder or craftsperson | Check that details can be built, reached and maintained. Point out clashes and unsafe access. |
| A software contributor | Fix bugs, improve checks, make the viewer faster or clearer. |
| Someone who reads carefully | Report unclear documents, broken links, wrong numbers and translation problems. |

The README lists [where help would matter most](README.md#where-community-help-would-matter-most).

## Report a bug or a review finding

[Open an issue](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/issues/new/choose) and choose a template. Include:

1. **Where:** the file, drawing sheet, equipment or route ID, or the place in the church.
2. **How to see it:** the steps, the scene and settings, and your browser if it is a viewer problem.
3. **What you saw and what you expected,** and why the difference matters.
4. **Evidence:** calculations, product data, measurements or standards, with units, sources and assumptions.
5. **A suggested correction,** or the information still needed to decide.

Please say which kind of statement you are making: a visual concept, a simulation estimate, a measurement or an engineer-approved value. The project keeps these apart.

Report security or privacy problems privately. See [SECURITY.md](SECURITY.md).

## Send a pull request

`main` is the reviewed branch. Changes reach it only through a pull request that the maintainer, [@DangHoangGeo](https://github.com/DangHoangGeo), has reviewed and merged. Nobody pushes to `main` directly.

1. For anything larger than a small fix, open an issue first so the approach can be agreed.
2. Fork the repository and create a branch from `main`. Use a short name such as `fix/plan-export-units`, `docs/sound-method` or `eng/12-topic`.
3. Read [AGENTS.md](AGENTS.md). Its rules apply to people and to AI agents alike. The most important ones:
   - Trace important claims to a source, with units and revision.
   - Keep unknown engineering values pending. Do not invent a plausible number.
   - A 3D model change and its documents, registers and exports go in the same commit.
   - Keep stable equipment, route and member IDs. Do not overwrite entered data or original drawings.
4. Make one coherent change per commit. Say in the commit body what you checked and what remains unresolved.
5. Run the checks that fit your change, then open the pull request against `main` and fill in the template.

The clone is large (several hundred megabytes) because review evidence is kept in the repository. `git clone --depth 1` is enough to run the viewer and the checks.

### Checks

Run from the repository root. Core checks need Node.js; the timber package validator needs Python 3.

```sh
node scripts/verify_model.cjs                         # geometry, seating, sanctuary, navigation
node scripts/verify_estimates.cjs                     # physics and statistics against analytical cases
node scripts/verify_simulator.cjs --report --estimates  # full calculation audit
node scripts/verify_simulator.cjs --electrical        # electrical routing
python3 docs/beams-roof-connections/validate.py       # timber reference package
git diff --check                                      # whitespace
```

`AGENTS.md` lists which check belongs to which kind of change. Some design targets are known to be unmet (microphone feedback margins, wing speech clarity, a few seats below the lighting brief). Report them as they are. Never change physics, inputs, thresholds or tests to obtain a passing result. Changes under `web/` are also checked by GitHub Actions.

For visual changes, look at the real viewer on a desktop browser in day and evening scenes and attach a screenshot. Headless checks do not prove rendering, sound playback or usability.

### What happens to your pull request

The maintainer reviews every pull request, may ask for changes, and merges it when it is ready. This is a volunteer project, so a reply can take some days. Anything meant to be installed in the building also needs review by the responsible designers and the people building and running the church. A merged pull request is not a construction approval.

### Using AI tools

AI-assisted contributions are welcome. You are responsible for what you submit: read it, run the checks, and make sure sources are real. Say in the pull request which parts an AI tool produced.

## Keep the repository safe to share

Everything committed here is public and stays in the history.

- No passwords, tokens, `.env` files or private access links.
- No phone numbers, home addresses or private contact details. No photographs or names of private individuals without their consent.
- No drawings, photographs, fonts, music or code that you do not have the right to share. Record the source, author and licence of anything you did not make yourself.

## Licence of contributions

By contributing you agree that your work is shared under the project's licences: [MIT](LICENSE) for software and CC BY 4.0 for documents, data and images, as set out in [NOTICE.md](NOTICE.md). You keep your copyright. Only contribute work that you have the right to share on these terms.

## Conduct

Be respectful, patient and honest. This is a place of worship for a real community. See the [code of conduct](CODE_OF_CONDUCT.md).
