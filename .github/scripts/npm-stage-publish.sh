#!/usr/bin/env bash
# Stage one package directory on npm: `npm stage publish` through OIDC trusted publishing.
#
# CI can only stage, never publish — the trusted publisher on each @standard-schema package is
# stage-only. A staged version is not installable, though its number is reserved, until a
# maintainer approves it with 2FA (`npm stage approve <id>`, or the Staged Packages tab on
# npmjs.com). A stolen credential that cuts a release can then fill npm's staged queue and
# nothing else.
#
# Idempotent. A version the registry already serves is skipped; a version already sitting in the
# staged queue makes `npm stage publish` refuse, and that refusal counts as success here, because
# npm-await-approval.sh still gates on the registry serving the version. The refusal's exact
# wording is matched loosely: stage-only publishing has not run in this repo yet, so the string is
# unobserved. Anything else is fatal.
set -euo pipefail

dir="${1:?usage: npm-stage-publish.sh <package-dir>}"
name="$(node -p "require('./$dir/package.json').name")"
version="$(node -p "require('./$dir/package.json').version")"

if [ "$(npm view "$name@$version" version 2>/dev/null)" = "$version" ]; then
  echo "✓ $name@$version is already published — skipping"
  exit 0
fi

# `pnpm publish` resolved `workspace:` ranges to real versions on its way out. npm does not know
# the protocol and would publish the literal string, so do it here: same tarball as before.
# shellcheck disable=SC2016  # the single quotes are the point: bash must not touch the JS.
node -e '
  const fs = require("node:fs");
  const dir = process.argv[1];
  const file = `${dir}/package.json`;
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  let rewrote = false;
  for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [dep, range] of Object.entries(pkg[field] ?? {})) {
      if (!range.startsWith("workspace:")) continue;
      const version = JSON.parse(fs.readFileSync(`${dir}/node_modules/${dep}/package.json`, "utf8")).version;
      const suffix = range.slice("workspace:".length);
      const resolved = { "*": version, "^": `^${version}`, "~": `~${version}` }[suffix];
      if (!resolved) {
        console.log(`::error::${dep}: unsupported workspace range ${range}`);
        process.exit(1);
      }
      pkg[field][dep] = resolved;
      rewrote = true;
      console.log(`  ${field}.${dep}: ${range} -> ${resolved}`);
    }
  }
  if (rewrote) fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
' "$dir"

echo "→ staging $name@$version"
out="$(mktemp)"
if (cd "$dir" && npm stage publish --provenance --access public) >"$out" 2>&1; then
  cat "$out"
  rm -f "$out"
  exit 0
fi
cat "$out"
if grep -qiE 'already (been )?staged|staged version|E409|EPUBLISHCONFLICT|previously published' "$out"; then
  echo "✓ $name@$version is already staged — the approval wait decides the rest"
  rm -f "$out"
  exit 0
fi
rm -f "$out"
echo "::error::staging $name@$version failed"
exit 1
