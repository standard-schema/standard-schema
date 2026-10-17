#!/usr/bin/env bash
# Block until a maintainer approves the staged version and the registry serves it.
#
# This is the human gate. The JSR job for the same package gates on the job that runs this, so JSR
# never carries a version npm has not approved. A GitHub job runs six hours at most; if the
# approval lands later, re-run the job — staging is idempotent, so it resumes from the approval.
set -euo pipefail

dir="${1:?usage: npm-await-approval.sh <package-dir>}"
name="$(node -p "require('./$dir/package.json').name")"
version="$(node -p "require('./$dir/package.json').version")"

{
  echo "## \`$name@$version\` is staged on npm"
  echo
  echo "Staged versions are not installable. Approve this one with 2FA, from a logged-in machine:"
  echo
  echo '```sh'
  echo "npm stage list $name"
  echo "npm stage view <stage-id>       # inspect it, or npm stage download <stage-id> for the tarball"
  echo "npm stage approve <stage-id>    # or use the Staged Packages tab on npmjs.com"
  echo '```'
  echo
  echo "This job waits 350 minutes. If the approval comes later, approve and re-run it."
} >>"$GITHUB_STEP_SUMMARY"

deadline=$(($(date +%s) + 350 * 60))
until [ "$(npm view "$name@$version" version 2>/dev/null)" = "$version" ]; do
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "::error::$name@$version is still not served after 350 minutes — approve the staged version and re-run this job"
    exit 1
  fi
  echo "… $name@$version not served yet (staged, awaiting approval) — $(date -u +%H:%M:%SZ)"
  sleep 60
done
echo "✓ $name@$version is approved and served"
