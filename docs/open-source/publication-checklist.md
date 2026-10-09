# Open-source publication checklist

Status: **prepared, not published. PUBLICATION HOLD on the items in section 3.** Reviewed 10 October 2026 at commit `1d4b255` (`eng/11-outlets-facade-statues`) and the tips of all 21 remote branches.

The owner decided on 10 October 2026 to open the project to community review and chose its licences ([NOTICE](../../NOTICE.md)). This record covers the source, history and licence review that [plan phase 07](../../plan/phases/07-release-and-operations.md) and [plan/architecture.md](../../plan/architecture.md) require before the GitHub repository is made public. It is a software and records check carried out by an AI agent. It is not legal advice, and changing the repository's visibility remains the owner's action.

Once the repository is public, every branch, every past commit, and every pull request and issue is public. Deleting a file later does not remove it from the history.

## 1. What was checked

| Check | Method | Result |
| --- | --- | --- |
| Credentials in current files | `git grep` on the tips of all local and remote branches for GitHub, cloud-provider, API-key, private-key, JWT and Vercel token patterns | None found |
| Local access files | `git check-ignore` and `git log --all` for `.env.private-review-access` and `.env.private-review-handover.txt` | Ignored by `.gitignore`; never committed |
| Private-review password | Searched all branch tips (`git grep -F`) and all history (`git log --all -S`) for the stored value | Not present in any commit |
| Environment and key files in history | `git log --all --diff-filter=A --name-only` for `.env*`, key and certificate files | Only `web/.env.example` and a test fixture |
| E-mail addresses and telephone numbers in tracked text | `git grep` on all branch tips | None found in documents. Commit metadata carries the owner's e-mail address (114 of 141 commits). |
| Named private individuals in documents | `git grep` for Vietnamese and English titles followed by names | None found in text. See H2 for a name visible inside images. |
| Deployment addresses | `git grep` for hosted-preview domains on all branch tips | One Vercel preview address on `web/05-protected-review` (H3) |
| Third-party material | Reference manifests, provenance files, font and library licence files, drawing sources | Recorded in [NOTICE](../../NOTICE.md); holds H1 and H2 |

Limits: pattern searches miss secrets that do not match a known shape, and text searches do not read the content of images, PDFs or spreadsheets. The five photographs in H2 were opened and looked at; the other images were not individually inspected for people or private details.

## 2. Done

- [x] Licences chosen by the owner: MIT for software, CC BY 4.0 for the project's own documents, data and images. [LICENSE](../../LICENSE), [NOTICE](../../NOTICE.md).
- [x] Contributor documents: [CONTRIBUTING](../../CONTRIBUTING.md), [code of conduct](../../CODE_OF_CONDUCT.md), [security policy](../../SECURITY.md), issue and pull-request templates, [CODEOWNERS](../../.github/CODEOWNERS).
- [x] Agent rules for public work and the protected branch: [AGENTS.md](../../AGENTS.md).
- [x] `main` protection applied on GitHub with [scripts/protect_main_branch.sh](../../scripts/protect_main_branch.sh): a pull request is required, with one approving review from the code owner; a new push discards an earlier approval; conversations must be resolved; force pushes and branch deletion are refused. GitHub reports the branch as protected. Enforcement was not tested by attempting a direct push. Re-run `sh scripts/protect_main_branch.sh --show` after the repository becomes public.
- [x] Local export folder `exports/` (films and private-review packages) added to `.gitignore`.
- [x] Ten branches already contained in `main` deleted (section 4).

## 3. Holds before the repository is made public

| ID | Item | Why it matters | Owner decision needed |
| --- | --- | --- | --- |
| H1 | Architectural drawings: eight PDFs and ten drawing images in `docs/layout_design/`, with copies in `docs/beams-roof-connections/sources/` | They are the work of the church's designers. The project licences do not cover them, and publishing them needs their agreement and the parish's. | Obtain written agreement and record it here, or move them to private storage and remove them from history. |
| H2 | `docs/beams-roof-connections/sources/IMG_2676.PNG`–`IMG_2679.PNG` and `IMG_20260910_171557_634_1.JPG`; the same files were earlier stored under `Thach_Bi_Viewer/references/01-timber-frame/sources/` | Photographs of other churches from unrecorded photographers. `IMG_2676.PNG` is a phone screenshot of a shared video that shows the sender's name and profile picture; the other three screenshots were not individually opened and should be assumed to be the same. The JPG shows a congregation at a distance. | Obtain permission; or replace them with cropped copies without the name and remove the originals from history; or remove them. |
| H3 | Unmerged branches `web/00-evidence`, `web/02-homepage`, `web/03-timeline`, `web/04-lightweight-visit`, `web/05-protected-review` | They become public too. `web/05` records the address of the password-protected parish preview. The password is not in Git. | Decide whether the preview address may be public. Merge, keep or delete each branch before publication. |
| H4 | Generated concept images, including the sanctuary wing saints | Their own record says the public-use review is pending. | Confirm they may be shared as concepts. |
| H5 | Owner's e-mail address in commit metadata | Public with the history. | Accept, or rewrite history with a private GitHub address before publication. |

Removing a file from history rewrites shared history and changes every commit ID after it. It needs the owner's separate instruction, a backup, and a fresh review of every branch. Nothing has been rewritten.

## 4. Branches on 10 October 2026

Deleted locally and on GitHub because `main` and `eng/11-outlets-facade-statues` already contain every commit. The tip is given so that a branch can be recreated with `git branch <name> <tip>`.

| Branch | Tip |
| --- | --- |
| `claude/busy-lamport-bm22qw` | `74249c2` |
| `codex/church-web-roadmap` | `f260525` |
| `eng/00-plan` | `5edd115` |
| `eng/00-brief-clarifications` | `396d1b2` |
| `eng/01-baseline` | `85ed134` |
| `eng/07-local-review-layers` | `a75b6bd` |
| `eng/08-review-navigation` | `dda6c4b` |
| `eng/09-print-and-sequence` | `fd23bd3` |
| `eng/10-wing-review` | `7216da8` |
| `web/01-framework` | `100e939` |

Kept, because each holds commits that are in neither `main` nor `eng/11-outlets-facade-statues`:

| Branch | Tip | Commits not merged | Content |
| --- | --- | --- | --- |
| `eng/02-coordinated-optimisation` | `8274191` | 3 | Option comparison study, protocol and run evidence |
| `eng/03-concealment` | `a9e6515` | 1 | Concealment failures and per-item detail requirements |
| `eng/04-routes` | `e6a3dcd` | 1 | Common-vertex baseline 2D and 3D route maps |
| `eng/05-boards-and-controls` | `ae18c68` | 2 | Board control state contract and gated outputs |
| `eng/06-registers-and-handover` | `c160822` | 1 | Held engineering handover and register reconciliation |
| `web/00-evidence` | `84edc9e` | 3 | Private web source inventory and release contracts |
| `web/02-homepage` | `bcbc5bb` | 3 | Bilingual gallery (pull request 3, closed unmerged) |
| `web/03-timeline` | `7766b46` | 6 | Adds the construction timeline |
| `web/04-lightweight-visit` | `a8a0b88` | 9 | Adds the lightweight 3D visit |
| `web/05-protected-review` | `dd15763` | 12 | Adds the protected parish preview |

`web/02` to `web/05` repeat the same commit subjects under different IDs; `web/05-protected-review` appears to carry the whole line. That has not been verified file by file.

## 5. When the owner publishes

1. Close or accept each hold in section 3 and record the decision here.
2. Replace the private-review password if there is any doubt about where it has been shown.
3. Change the visibility under **Settings → General → Danger Zone**.
4. Confirm protection: `sh scripts/protect_main_branch.sh --show`.
5. Under **Settings → Advanced Security**, enable private vulnerability reporting, secret scanning and push protection. [SECURITY.md](../../SECURITY.md) relies on the first of these.
6. Update the statements that the repository is private in [docs/web/deployment.md](../web/deployment.md) and decision D11 in [plan/decisions-and-sources.md](../../plan/decisions-and-sources.md).
7. Before connecting `main` to automatic deployment, read the warning in [plan/architecture.md](../../plan/architecture.md): a merge must not publish the website by accident.
