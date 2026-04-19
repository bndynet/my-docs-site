#!/usr/bin/env bash
# Verify the local @bndynet/docs package against a clean consumer install.
#
# One-command smoke + regression matrix for the CLI hardenings:
#   A. Fresh init → npm install → docs build  (end-to-end, covers the
#      consumer-mode TSX babel-loader rule and the layout-elk alias fallback)
#   B. Existing package.json missing `overrides.webpackbar`    → docs init
#      merges it in without clobbering other fields
#   C. Existing user-owned `overrides.webpackbar` (different range) → docs
#      init preserves the user's value (never overwrites)
#   D. Re-running docs init on an already-initialized dir is idempotent
#   E. Adding `"type": "commonjs"` to package.json makes `docs build` fail
#      fast with a clear error (no fog of webpack parse errors)
#
# Usage:
#   scripts/verify-local-consumer.sh [WORKDIR]         # full regression matrix
#   scripts/verify-local-consumer.sh --demo [DIR]      # spin up a real, runnable
#                                                     #   project in CWD/DIR
#                                                     #   (default: ./bndy-demo)
#   scripts/verify-local-consumer.sh --help
#   npm run verify:local
#   npm run demo:local -- my-demo                      # pass DIR through npm
#
# Env flags:
#   KEEP=1          keep the temp workdir on success (default: clean up;
#                   ignored in --demo mode — demo dirs are always kept)
#   VERBOSE=1       stream full npm install / docs build output
#
# --demo produces a real consumer project you can `cd` into and run
# (`npm start`, `npm run build`, `npm run serve`). It only runs Case A.
#
# Exit: 0 on all-pass, non-zero + preserved workdir on first failure.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PKG_DIR="$REPO_DIR/packages/docs"
BIN="$PKG_DIR/bin/docs.cjs"
USER_CWD="$PWD"

if [ ! -x "$BIN" ] && [ ! -f "$BIN" ]; then
  echo "error: cannot find local CLI at $BIN" >&2
  exit 1
fi

# --- argument parsing ---
WORKDIR_ARG=""
DEMO=""
KEEP="${KEEP:-}"
VERBOSE="${VERBOSE:-}"

print_help() {
  sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --demo)
      # `--demo` with optional DIR arg. If next token is missing or
      # starts with `-`, fall back to the default name.
      shift
      if [ $# -gt 0 ] && [ "${1#-}" = "$1" ]; then
        DEMO="$1"; shift
      else
        DEMO="bndy-demo"
      fi
      ;;
    --demo=*)
      DEMO="${1#--demo=}"
      [ -n "$DEMO" ] || DEMO="bndy-demo"
      shift
      ;;
    --keep)    KEEP=1;    shift ;;
    --verbose) VERBOSE=1; shift ;;
    -h|--help) print_help; exit 0 ;;
    --)        shift; WORKDIR_ARG="${1:-}"; break ;;
    -*)
      echo "error: unknown flag: $1" >&2
      print_help >&2
      exit 2
      ;;
    *)
      if [ -z "$WORKDIR_ARG" ]; then
        WORKDIR_ARG="$1"
      else
        echo "error: unexpected extra argument: $1" >&2
        exit 2
      fi
      shift
      ;;
  esac
done

# --- colors (only if TTY) ---
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
  RED=$(tput setaf 1); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3)
  BLUE=$(tput setaf 4); DIM=$(tput dim); BOLD=$(tput bold); RESET=$(tput sgr0)
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; DIM=""; BOLD=""; RESET=""
fi

header() { printf "\n%s==> %s%s\n" "${BOLD}${BLUE}" "$1" "$RESET"; }
ok()     { printf "%s  ✓ %s%s\n"   "$GREEN" "$1" "$RESET"; }
info()   { printf "%s    %s%s\n"   "$DIM" "$1" "$RESET"; }
warn()   { printf "%s  ! %s%s\n"   "$YELLOW" "$1" "$RESET"; }
fail()   { printf "%s  ✗ %s%s\n"   "$RED"   "$1" "$RESET"; exit 1; }

SUCCESS=0
WORK=""
cleanup() {
  local rc=$?
  if [ -n "$WORK" ] && [ -d "$WORK" ]; then
    if [ "$SUCCESS" -eq 1 ] && [ -z "$KEEP" ]; then
      rm -rf "$WORK"
    else
      printf "\n%s(workdir kept at %s)%s\n" "$YELLOW" "$WORK" "$RESET"
    fi
  fi
  exit "$rc"
}
trap cleanup EXIT INT TERM

# --- 1. pack @bndynet/docs from the workspace ---
header "1) Pack @bndynet/docs from $PKG_DIR"
cd "$PKG_DIR"
# Clear stale tarballs so we always pick up the newest artifact.
rm -f bndynet-docs-*.tgz
TARBALL_NAME=$(npm pack 2>/dev/null | tail -1)
TARBALL="$PKG_DIR/$TARBALL_NAME"
[ -f "$TARBALL" ] || fail "npm pack did not produce a tarball"
ok "packed $TARBALL_NAME"

# Swap the @bndynet/docs dep in <dir>/package.json to point at the local
# tarball (real copy, NOT a symlink — symlinks hide consumer-mode bugs).
swap_dep_to_tarball() {
  local dir="$1"
  node - "$dir" "$TARBALL" <<'JS'
const fs = require('fs');
const path = require('path');
const [, , dir, tarball] = process.argv;
const p = require(path.join(dir, 'package.json'));
p.dependencies = p.dependencies || {};
p.dependencies['@bndynet/docs'] = 'file:' + tarball;
fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(p, null, 2) + '\n');
JS
}

# ---------------------------------------------------------------------------
# --demo mode — spin up a real, runnable consumer project in CWD/DIR and
# stop. Skip the regression matrix; the caller wants to inspect/run it.
# ---------------------------------------------------------------------------
if [ -n "$DEMO" ]; then
  case "$DEMO" in
    /*) DEMO_DIR="$DEMO" ;;
    *)  DEMO_DIR="$USER_CWD/$DEMO" ;;
  esac

  if [ -e "$DEMO_DIR" ] && [ -n "$(ls -A "$DEMO_DIR" 2>/dev/null || true)" ]; then
    fail "target exists and is non-empty: $DEMO_DIR (remove it first, or pick another name)"
  fi
  mkdir -p "$DEMO_DIR"

  header "2) Demo — init + install + build into $DEMO_DIR"
  node "$BIN" init "$DEMO_DIR" >/dev/null
  [ -f "$DEMO_DIR/package.json" ]   || fail "demo: init did not create package.json"
  [ -f "$DEMO_DIR/docs.config.js" ] || fail "demo: init did not create docs.config.js"
  ok "init scaffolded docs.config.js + docs/intro.md + package.json"

  swap_dep_to_tarball "$DEMO_DIR"
  info "pinned @bndynet/docs → $TARBALL"

  pushd "$DEMO_DIR" >/dev/null
  if [ -n "$VERBOSE" ]; then
    npm install
  else
    info "running npm install (silent — pass VERBOSE=1 to stream)"
    npm install --silent >/dev/null 2>&1 || fail "demo: npm install failed"
  fi
  ok "npm install complete"

  if [ -n "$VERBOSE" ]; then
    npx docs build
  else
    info "running docs build (silent) — smoke test only; remove ./build after"
    LOG=$(npx docs build 2>&1) || { printf "%s\n" "$LOG"; fail "demo: docs build failed"; }
    printf "%s\n" "$LOG" | grep -q "Compiled successfully" \
      || { printf "%s\n" "$LOG"; fail "demo: 'Compiled successfully' missing"; }
  fi
  popd >/dev/null
  ok "docs build succeeded"

  # Pretty relative path if the demo lives under the user's CWD.
  DISPLAY_DIR="$DEMO_DIR"
  case "$DEMO_DIR" in
    "$USER_CWD"/*) DISPLAY_DIR="${DEMO_DIR#$USER_CWD/}" ;;
  esac

  header "Demo ready at $DEMO_DIR"
  printf "\n%s  next steps%s\n" "$BOLD" "$RESET"
  printf "    cd %s\n" "$DISPLAY_DIR"
  printf "    npm start          # dev server at http://localhost:3000\n"
  printf "    npm run build      # production build into ./build\n"
  printf "    npm run serve      # preview the production build\n"
  printf "\n%s  cleanup%s\n" "$BOLD" "$RESET"
  printf "    rm -rf %s\n\n" "$DISPLAY_DIR"

  SUCCESS=1
  # WORK is empty, so the cleanup trap is a no-op and the demo dir stays.
  exit 0
fi

# ---------------------------------------------------------------------------
# Full regression matrix (default)
# ---------------------------------------------------------------------------

# --- 2. workdir ---
if [ -n "$WORKDIR_ARG" ]; then
  WORK="$WORKDIR_ARG"
  rm -rf "$WORK"
  mkdir -p "$WORK"
else
  WORK=$(mktemp -d 2>/dev/null)
fi
ok "workdir = $WORK"

# ---------------------------------------------------------------------------
# Case A — fresh init + npm install + docs build (end-to-end smoke)
# ---------------------------------------------------------------------------
header "2) Case A — fresh init + npm install + docs build"
A="$WORK/A"
mkdir -p "$A"
node "$BIN" init "$A" >/dev/null
[ -f "$A/package.json" ]    || fail "A: init did not create package.json"
[ -f "$A/docs.config.js" ]  || fail "A: init did not create docs.config.js"
[ -f "$A/docs/intro.md" ]   || fail "A: init did not create docs/intro.md"
grep -q '"webpackbar"' "$A/package.json" || fail "A: overrides.webpackbar missing from scaffolded package.json"
ok "init scaffolded docs.config.js + docs/intro.md + package.json with overrides"

swap_dep_to_tarball "$A"
info "swapped @bndynet/docs dep → $TARBALL"

pushd "$A" >/dev/null
if [ -n "$VERBOSE" ]; then
  npm install
else
  info "running npm install (silent — pass VERBOSE=1 to stream)"
  npm install --silent >/dev/null 2>&1 || fail "A: npm install failed"
fi
ok "npm install complete"

if [ -n "$VERBOSE" ]; then
  npx docs build
  BUILD_RC=$?
else
  info "running docs build (silent)"
  LOG=$(npx docs build 2>&1) || { printf "%s\n" "$LOG"; fail "A: docs build failed"; }
  printf "%s\n" "$LOG" | grep -q "Compiled successfully" \
    || { printf "%s\n" "$LOG"; fail "A: 'Compiled successfully' not found in build log"; }
  printf "%s\n" "$LOG" | grep -q "Generated static files" \
    || { printf "%s\n" "$LOG"; fail "A: 'Generated static files' not found in build log"; }
  # The whole point: no manual layout-elk install, no user tweak required.
  printf "%s\n" "$LOG" | grep -q "Can't resolve '@mermaid-js/layout-elk'" \
    && { printf "%s\n" "$LOG"; fail "A: layout-elk alias fallback did not fire"; } \
    || true
fi
popd >/dev/null
ok "docs build succeeded end-to-end (layout-elk fallback active, no manual steps)"

# ---------------------------------------------------------------------------
# Case B — existing package.json missing overrides → init merges
# ---------------------------------------------------------------------------
header "3) Case B — existing package.json, missing overrides → init merges"
B="$WORK/B"
mkdir -p "$B"
cat > "$B/package.json" <<'JSON'
{
  "name": "case-b",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "4.17.21"
  }
}
JSON
OUT=$(node "$BIN" init "$B" 2>&1) || { printf "%s\n" "$OUT"; fail "B: init errored"; }
printf "%s\n" "$OUT" | grep -q "added 1 override" \
  || { printf "%s\n" "$OUT"; fail "B: expected 'added 1 override' in init output"; }
grep -q '"webpackbar"' "$B/package.json"   || fail "B: override not written to package.json"
grep -q '"lodash"'     "$B/package.json"   || fail "B: user dependency clobbered!"
grep -q '"case-b"'     "$B/package.json"   || fail "B: user name field clobbered!"
ok "merged overrides; user fields (name / dependencies) preserved"

# ---------------------------------------------------------------------------
# Case C — existing user override → init preserves (never overwrites)
# ---------------------------------------------------------------------------
header "4) Case C — user-set overrides.webpackbar → init preserves"
C="$WORK/C"
mkdir -p "$C"
cat > "$C/package.json" <<'JSON'
{
  "name": "case-c",
  "version": "1.0.0",
  "overrides": {
    "webpackbar": "^7.0.1",
    "other-pkg": "2.0.0"
  }
}
JSON
OUT=$(node "$BIN" init "$C" 2>&1) || { printf "%s\n" "$OUT"; fail "C: init errored"; }
printf "%s\n" "$OUT" | grep -q "skip (overrides already in place)" \
  || { printf "%s\n" "$OUT"; fail "C: expected 'skip (overrides already in place)'"; }
grep -q '"\^7\.0\.1"'  "$C/package.json" || fail "C: user override VALUE was changed!"
grep -q '"other-pkg"'  "$C/package.json" || fail "C: user's sibling override was removed!"
ok "user value (^7.0.1) + sibling override preserved untouched"

# ---------------------------------------------------------------------------
# Case D — second init on already-initialized dir is idempotent
# ---------------------------------------------------------------------------
header "5) Case D — idempotent second init on case A dir"
OUT=$(node "$BIN" init "$A" 2>&1) || { printf "%s\n" "$OUT"; fail "D: init errored"; }
printf "%s\n" "$OUT" | grep -q "skip (overrides already in place)" \
  || { printf "%s\n" "$OUT"; fail "D: overrides merge was not idempotent"; }
printf "%s\n" "$OUT" | grep -q "skip (exists)" \
  || { printf "%s\n" "$OUT"; fail "D: scaffolded files were re-created"; }
ok "re-running init is a no-op"

# ---------------------------------------------------------------------------
# Case E — "type": "commonjs" → docs build fails fast with clear error
# ---------------------------------------------------------------------------
header "6) Case E — \"type\": \"commonjs\" guard"
node - "$A" <<'JS'
const fs = require('fs');
const path = require('path');
const [, , dir] = process.argv;
const p = require(path.join(dir, 'package.json'));
p.type = 'commonjs';
fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(p, null, 2) + '\n');
JS
pushd "$A" >/dev/null
set +e
OUT=$(npx docs build 2>&1)
CODE=$?
set -e
popd >/dev/null
if [ "$CODE" -eq 0 ]; then
  printf "%s\n" "$OUT"
  fail "E: docs build should have exited non-zero"
fi
printf "%s\n" "$OUT" | grep -q '"type": "commonjs"' \
  || { printf "%s\n" "$OUT"; fail "E: fatal guard message not emitted"; }
ok "docs build exited $CODE with targeted fatal message"

# Undo the E mutation so a preserved workdir is usable.
node - "$A" <<'JS'
const fs = require('fs');
const path = require('path');
const [, , dir] = process.argv;
const p = require(path.join(dir, 'package.json'));
delete p.type;
fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(p, null, 2) + '\n');
JS

# ---------------------------------------------------------------------------
header "All cases passed"
ok "A (smoke) + B (merge) + C (preserve) + D (idempotent) + E (type:commonjs fatal)"
SUCCESS=1
