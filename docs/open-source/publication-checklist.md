# Open-source publication checklist

Status: **published by the owner. The repository was found public on 10 October 2026, with pull request 5 merged into `main` at `cf07b7c`. No decision is recorded for the items in section 3, so they remain open and are now publicly visible.** The review below was made on 10 October 2026 at commit `1d4b255` (`eng/11-outlets-facade-statues`) and the tips of all 21 remote branches, while the repository was still private.

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
- [x] Two-branch flow, owner decision of 10 October 2026: contributions go to `dev`, the default branch, created from `main` at `6c2133f`; `main` receives only what the owner promotes from `dev`. This keeps an unreviewed batch away from the branch that the website may deploy from (H6).
- [x] `dev` and `main` protection applied on GitHub with [scripts/protect_branches.sh](../../scripts/protect_branches.sh): a pull request is required, with one approving review from the code owner; a new push discards an earlier approval; conversations must be resolved; force pushes and branch deletion are refused. GitHub reports the branch as protected. No direct push was attempted; GitHub marks pull request 5 as blocked until it is reviewed, which shows the rule is active. The owner cannot approve their own pull request and merges it through the administrator bypass. Re-run `sh scripts/protect_branches.sh --show` after the repository becomes public.
- [x] Local export folder `exports/` (films and private-review packages) added to `.gitignore`.
- [x] Ten branches already contained in `main` deleted (section 4). `eng/11-outlets-facade-statues` has since been merged by pull request 5 and can be deleted as well.

## 3. Open items, now public

These were recorded as holds before publication. The repository has since been made public, so each item is exposed until the owner records a decision. Making the repository private again is the quickest way to pause exposure while deciding; it does not undo copies already made.

| ID | Item | Why it matters | Owner decision needed |
| --- | --- | --- | --- |
| H1 | Architectural drawings: eight PDFs and ten drawing images in `docs/layout_design/`, with copies in `docs/beams-roof-connections/sources/` | They are the work of the church's designers. The project licences do not cover them, and publishing them needs their agreement and the parish's. | Obtain written agreement and record it here, or move them to private storage and remove them from history. |
| H2 | `docs/beams-roof-connections/sources/IMG_2676.PNG`–`IMG_2679.PNG` and `IMG_20260910_171557_634_1.JPG`; the same files were earlier stored under `Thach_Bi_Viewer/references/01-timber-frame/sources/` | Photographs of other churches from unrecorded photographers. `IMG_2676.PNG` is a phone screenshot of a shared video that shows the sender's name and profile picture; the other three screenshots were not individually opened and should be assumed to be the same. The JPG shows a congregation at a distance. | **Partly resolved, 10 October 2026:** the four screenshots were cropped to the picture area, so current files no longer show the name, profile picture, message date or file name; all four were opened and checked after cropping. The JPG has no messaging frame and no GPS data and is unchanged. Still open: the uncropped files remain in the Git history of every branch (also under the earlier `Thach_Bi_Viewer/references/01-timber-frame/sources/` path), and permission for the photographs is not recorded. Removing them from history needs the owner's separate instruction. |
| H3 | Unmerged branches `web/00-evidence`, `web/02-homepage`, `web/03-timeline`, `web/04-lightweight-visit`, `web/05-protected-review` | They become public too. `web/05` records the address of the password-protected parish preview. The password is not in Git. | Decide whether the preview address may be public. Merge, keep or delete each branch before publication. **Update, 10 October 2026:** the web branches were merged through `dev` into `main`, and the owner then retired the private preview: its routes and scripts are removed and the preview address in the history no longer leads to a maintained page. The private storage and its credentials still exist in the hosting account until the owner deletes them. |
| H4 | Generated concept images, including the sanctuary wing saints | Their own record says the public-use review is pending. | Confirm they may be shared as concepts. |
| H5 | Owner's e-mail address in commit metadata | Public with the history. | Accept, or rewrite history with a private GitHub address before publication. |
| H6 | A Vercel project is connected to this GitHub repository | **Observed 10 October 2026:** every pushed branch gets a Vercel preview build, and merging pull request 5 into `main` created a Vercel *Production* deployment of `cf07b7c` (GitHub deployment record, 2026-10-09T19:57Z). `main` is therefore the production branch: a merge to `main` publishes the website at the address shown on the repository page. The policy for pull requests from forks was not inspected (no Vercel access in this review). | Treat every `dev` → `main` promotion as a website release. In Vercel, confirm that the production branch is `main` and not the repository default branch, and that builds for pull requests from forks need the owner's authorisation. |

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

## 5. After publication

- [x] Visibility changed to public by the owner (found 10 October 2026).
- [x] Protection of both branches confirmed with `sh scripts/protect_branches.sh --show` on the public repository.
- [x] Statements that the repository is private corrected in [docs/web/deployment.md](../web/deployment.md) and decision D11 in [plan/decisions-and-sources.md](../../plan/decisions-and-sources.md).
- [ ] Accept or resolve each item in section 3 and record the decision here. H2 first: it shows a private person's name.
- [ ] Replace the private-review password if there is any doubt about where it has been shown.
- [ ] Under **Settings → Advanced Security**, enable private vulnerability reporting, secret scanning and push protection. All were off on 10 October 2026. [SECURITY.md](../../SECURITY.md) relies on the first of these.
- [ ] Close H6. [plan/architecture.md](../../plan/architecture.md) warns that a connected `main` commonly deploys on merge: a merge must not publish the website by accident.
