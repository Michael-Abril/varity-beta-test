#!/usr/bin/env bash
# usage: sanity-js.sh <relpath> <pm>
set -u
d="$1"
pm="$2"
ROOT="/home/user/varity-beta-test/varity-beta-test"
log="$ROOT/.logs/sanity-$(echo "$d" | tr / -).log"
{
  echo "=== $d (pm=$pm) ==="
  cd "$ROOT/$d" || { echo "RESULT install=FAIL build=SKIP reason=cd-failed"; exit 0; }
  echo "--- install ---"
  if timeout 300 "$pm" install 2>&1; then
    echo "INSTALL_OK"
  else
    echo "RESULT install=FAIL build=SKIP"
    exit 0
  fi
  echo "--- build ---"
  if timeout 300 "$pm" run build 2>&1; then
    echo "RESULT install=PASS build=PASS"
  else
    echo "RESULT install=PASS build=FAIL"
  fi
} > "$log" 2>&1
