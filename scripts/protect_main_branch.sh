#!/bin/sh
# Protect the main branch on GitHub so that changes arrive only through a
# reviewed pull request. Run as the repository owner with the GitHub CLI:
#
#   sh scripts/protect_main_branch.sh            # apply
#   sh scripts/protect_main_branch.sh --show     # print the current protection
#
# GitHub offers branch protection on public repositories, and on private ones
# only with a paid plan. See docs/open-source/publication-checklist.md.
set -eu

REPO="${REPO:-DangHoangGeo/giaoxuthachbi-simulator}"
BRANCH="${BRANCH:-main}"

if [ "${1:-}" = "--show" ]; then
  gh api "repos/$REPO/branches/$BRANCH/protection"
  exit 0
fi

# One approving review from the code owner (.github/CODEOWNERS) is required.
# A new push discards an earlier approval. Force pushes and deleting the branch
# are refused. enforce_admins is false because GitHub does not let an author
# approve their own pull request: the owner merges their own work through the
# administrator bypass, and everyone else needs the owner's approval.
gh api --method PUT "repos/$REPO/branches/$BRANCH/protection" --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Protection applied to $REPO:$BRANCH"
