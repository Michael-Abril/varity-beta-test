#!/usr/bin/env bash
# usage: sanity-py.sh <relpath> <strategy>
# strategies: pip-req | pip-e | poetry
set -u
d="$1"
strat="$2"
ROOT="/home/user/varity-beta-test/varity-beta-test"
log="$ROOT/.logs/sanity-$(echo "$d" | tr / -).log"
{
  echo "=== $d (strategy=$strat) ==="
  cd "$ROOT/$d" || { echo "RESULT install=FAIL reason=cd-failed"; exit 0; }
  echo "--- venv ---"
  if ! python3 -m venv .venv 2>&1; then
    echo "RESULT install=FAIL reason=venv-create-failed"; exit 0
  fi
  # shellcheck disable=SC1091
  source .venv/bin/activate
  python -m pip install --upgrade pip --quiet 2>&1 || true
  echo "--- install ($strat) ---"
  case "$strat" in
    pip-req)
      if timeout 300 pip install -r requirements.txt 2>&1; then
        echo "RESULT install=PASS"
      else
        echo "RESULT install=FAIL"
      fi
      ;;
    pip-e)
      if timeout 300 pip install -e . 2>&1; then
        echo "RESULT install=PASS"
      else
        echo "RESULT install=FAIL"
      fi
      ;;
    poetry)
      if timeout 300 poetry install --no-root 2>&1; then
        echo "RESULT install=PASS"
      else
        echo "RESULT install=FAIL"
      fi
      ;;
    *)
      echo "unknown strategy"
      echo "RESULT install=FAIL reason=unknown-strategy"
      ;;
  esac
} > "$log" 2>&1
