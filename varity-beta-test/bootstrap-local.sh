#!/usr/bin/env bash
# bootstrap-local.sh — recreate the 11 framework slot repos on this machine.
#
# Each upstream is shallow-cloned, then its .git/ is removed and replaced with
# a fresh single-commit `main` branch — same as what was done in the original
# setup sandbox. Idempotent: skips slots that already look bootstrapped.
#
# Usage:
#   ./bootstrap-local.sh

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# slot:upstream-url[:subdir]
# subdir is optional; if set, only that subdir of the upstream is kept.
SLOTS=(
  "js-ts/nextjs|https://github.com/ixartz/Next-js-Boilerplate"
  "js-ts/react|https://github.com/stefanbobrowski/vite-react-ts-starter"
  "js-ts/vue|https://github.com/lecoueyl/vue3-template"
  "js-ts/express|https://github.com/w3tecch/express-typescript-boilerplate"
  "js-ts/fastify|https://github.com/yonathan06/fastify-typescript-starter"
  "js-ts/nestjs|https://github.com/nestjs/typescript-starter"
  "js-ts/koa|https://github.com/javieraviles/node-typescript-koa-rest"
  "js-ts/hono|https://github.com/honojs/starter|templates/nodejs"
  "python/fastapi|https://github.com/rafsaf/minimal-fastapi-postgres-template"
  "python/django|https://github.com/fceruti/django-starter-project"
  "python/flask|https://github.com/tko22/flask-boilerplate"
)

GIT_USER_NAME="${GIT_USER_NAME:-Varity Beta}"
GIT_USER_EMAIL="${GIT_USER_EMAIL:-beta@varity.local}"

ok=0
skip=0
fail=0

for entry in "${SLOTS[@]}"; do
  IFS='|' read -r slot url subdir <<<"$entry"
  target="${ROOT}/${slot}"

  echo ""
  echo "=== ${slot}  <-  ${url}${subdir:+  (subdir: ${subdir})} ==="

  if [[ -d "${target}/.git" ]]; then
    echo "SKIP: ${slot} already initialized"
    skip=$((skip+1))
    continue
  fi

  mkdir -p "${target}"
  if ! find "${target}" -mindepth 1 -maxdepth 1 -print -quit | grep -q .; then : # empty, fine
  else
    echo "FAIL: ${target} is not empty but has no .git — refusing to clobber."
    fail=$((fail+1))
    continue
  fi

  if [[ -n "${subdir:-}" ]]; then
    tmp="$(mktemp -d)"
    if ! git clone --depth=1 "${url}" "${tmp}"; then
      echo "FAIL: clone ${url}"
      rm -rf "${tmp}"
      fail=$((fail+1))
      continue
    fi
    if [[ ! -d "${tmp}/${subdir}" ]]; then
      echo "FAIL: subdir ${subdir} not found in ${url}"
      rm -rf "${tmp}"
      fail=$((fail+1))
      continue
    fi
    cp -a "${tmp}/${subdir}/." "${target}/"
    rm -rf "${tmp}"
  else
    if ! git clone --depth=1 "${url}" "${target}"; then
      echo "FAIL: clone ${url}"
      fail=$((fail+1))
      continue
    fi
    rm -rf "${target}/.git"
  fi

  (
    cd "${target}"
    git init -q -b main
    git -c "user.email=${GIT_USER_EMAIL}" -c "user.name=${GIT_USER_NAME}" add .
    git -c "user.email=${GIT_USER_EMAIL}" -c "user.name=${GIT_USER_NAME}" commit -q \
      -m "Initial commit from ${url}${subdir:+ (${subdir})} for Varity beta test"
  ) && {
    echo "OK: ${slot}  HEAD=$(git -C "${target}" rev-parse --short HEAD)"
    ok=$((ok+1))
  } || {
    echo "FAIL: git init/commit in ${target}"
    fail=$((fail+1))
  }
done

echo ""
echo "============================================================"
echo "BOOTSTRAP SUMMARY:  ok=${ok}  skip=${skip}  fail=${fail}"
echo "============================================================"

[[ "${fail}" -eq 0 ]]
