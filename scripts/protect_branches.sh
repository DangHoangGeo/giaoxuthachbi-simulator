#!/bin/sh
# Protect the dev and main branches on GitHub so that changes arrive only
# through a reviewed pull request. Run as the repository owner with the
# GitHub CLI:
#
#   sh scripts/protect_branches.sh            # apply to dev and main
#   sh scripts/protect_branches.sh --show     # print the current protection
#   BRANCHES=dev sh scripts/protect_branches.sh
#
# dev receives contributions; main receives only what the owner promotes from
# dev. GitHub offers branch protection on public repositories, and on private
# ones only with a paid plan. See docs/open-source/publication-checklist.md.
set -eu

REPO="${REPO:-DangHoangGeo/giaoxuthachbi-simulator}"
BRANCHES="${BRANCHES:-dev main}"

if [ "${1:-}" = "--show" ]; then
  for BRANCH in $BRANCHES; do
    echo "== $REPO:$BRANCH"
    gh api "repos/$REPO/branches/$BRANCH/protection" --jq '{
      approvals: .required_pull_request_reviews.required_approving_review_count,
      code_owner_review: .required_pull_request_reviews.require_code_owner_reviews,
      dismiss_stale_reviews: .required_pull_request_reviews.dismiss_stale_reviews,
      conversation_resolution: .required_conversation_resolution.enabled,
      force_pushes: .allow_force_pushes.enabled,
      deletions: .allow_deletions.enabled,
      enforce_admins: .enforce_admins.enabled
    }'
  done
  exit 0
fi

# One approving review from the code owner (.github/CODEOWNERS) is required.
# A new push discards an earlier approval. Force pushes and deleting the branch
# are refused. enforce_admins is false because GitHub does not let an author
# approve their own pull request: the owner merges their own work through the
# administrator bypass, and everyone else needs the owner's approval.
for BRANCH in $BRANCHES; do
  gh api --method PUT "repos/$REPO/branches/$BRANCH/protection" --silent --input - <<'JSON'
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
done
