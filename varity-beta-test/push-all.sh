#!/usr/bin/env bash
# push-all.sh — create one GitHub repo per framework slot and push.
#
# Usage:
#   ./push-all.sh <github-owner>            # uses SSH (git@github.com:<owner>/...)
#   ./push-all.sh <github-owner> --https    # uses HTTPS instead
#
# Requires: gh CLI authenticated (`gh auth login`) and write access under <github-owner>.
# Idempotent: skips creating remotes that already exist locally, skips
# creating GitHub repos that already exist remotely. Re-running just re-pushes.

set -uo pipefail

OWNER="${1:-}"
PROTOCOL="ssh"
if [[ "${2:-}" == "--https" ]]; then PROTOCOL="https"; fi

if [[ -z "$OWNER" ]]; then
  echo "usage: $0 <github-owner> [--https]" >&2
  exit 2
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "error: 'gh' CLI not found on PATH" >&2
  exit 2
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated. Run: gh auth login" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# slot:framework-name pairs (framework-name becomes the GitHub repo suffix)
SLOTS=(
  "js-ts/nextjs:nextjs"
  "js-ts/react:react"
  "js-ts/vue:vue"
  "js-ts/express:express"
  "js-ts/fastify:fastify"
  "js-ts/nestjs:nestjs"
  "js-ts/koa:koa"
  "js-ts/hono:hono"
  "python/fastapi:fastapi"
  "python/django:django"
  "python/flask:flask"
)

declare -a SUMMARY_LINES=()
declare -a SUMMARY_URLS=()

for entry in "${SLOTS[@]}"; do
  slot="${entry%%:*}"
  fw="${entry##*:}"
  repo_name="varity-test-${fw}"
  full="${OWNER}/${repo_name}"
  url_https="https://github.com/${full}.git"
  url_ssh="git@github.com:${full}.git"
  view_url="https://github.com/${full}"

  echo ""
  echo "=== [${slot}] -> ${full} ==="

  if [[ ! -d "${ROOT}/${slot}/.git" ]]; then
    echo "SKIP: ${slot} is not a git repo (did you run the workspace setup?)"
    SUMMARY_LINES+=("SKIP   ${slot}  (no .git)")
    SUMMARY_URLS+=("${slot}\t(skipped)")
    continue
  fi

  # 1. Create GitHub repo if missing
  if gh repo view "${full}" >/dev/null 2>&1; then
    echo "GitHub repo already exists: ${full}"
  else
    echo "Creating GitHub repo: ${full}"
    if ! gh repo create "${full}" --private --description "Varity beta test: ${fw}" >/dev/null; then
      echo "FAIL: could not create ${full}"
      SUMMARY_LINES+=("FAIL   ${slot}  (gh repo create)")
      SUMMARY_URLS+=("${slot}\t(create failed)")
      continue
    fi
  fi

  # 2. Wire up local remote
  cd "${ROOT}/${slot}"

  if [[ "$PROTOCOL" == "https" ]]; then remote_url="${url_https}"
  else remote_url="${url_ssh}"; fi

  if git remote get-url origin >/dev/null 2>&1; then
    existing="$(git remote get-url origin)"
    if [[ "${existing}" != "${remote_url}" ]]; then
      echo "Updating origin: ${existing} -> ${remote_url}"
      git remote set-url origin "${remote_url}"
    else
      echo "origin already set to ${remote_url}"
    fi
  else
    echo "Adding origin -> ${remote_url}"
    git remote add origin "${remote_url}"
  fi

  # 3. Push
  if git push -u origin main; then
    echo "PUSHED: ${view_url}"
    SUMMARY_LINES+=("OK     ${slot}  -> ${view_url}")
    SUMMARY_URLS+=("${slot}\t${view_url}")
  else
    echo "FAIL: push failed for ${slot}"
    SUMMARY_LINES+=("FAIL   ${slot}  (push)")
    SUMMARY_URLS+=("${slot}\t(push failed)")
  fi

  cd "${ROOT}"
done

echo ""
echo "============================================================"
echo "SUMMARY"
echo "============================================================"
printf '%s\n' "${SUMMARY_LINES[@]}"
echo ""
echo "Paste these into the Varity dashboard:"
printf '%b\n' "${SUMMARY_URLS[@]}"
