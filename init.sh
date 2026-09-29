#!/bin/bash
set -e

# Verification gate. It must exit 0 before any feature is claimed done.

echo "=== Harness Initialization ==="

# Resolve node ONCE, then run every check through "$NODE".
#
# Why this indirection exists: on a Windows host the `bash` on PATH is usually
# WSL2's, and WSL's own PATH does not contain the Windows-side node install
# (nvm-for-Windows under C:\nvm4w\nodejs). A bare `node` then fails with
# `command not found` and, because of `set -e`, the gate dies at 127 before a
# single check runs — while the checks themselves are perfectly fine. Exit 127
# is therefore an environment symptom here, never a real verification failure,
# so resolve the interpreter explicitly and only fall back to failing loudly.
#
# Candidates are tried in order: whatever is on PATH, then the common Windows
# node locations translated to this shell's mount namespace. `/mnt/c` is WSL;
# on Git Bash and on a POSIX host the plain path is the one that exists, so it
# is tried too. Whichever resolves is used for all subsequent checks.
resolve_node() {
  # An explicit NODE=… from the environment wins: the fallback list below can
  # only guess the common install locations, and a caller who names an
  # interpreter knows better than any guess.
  if [ -n "${NODE:-}" ] && [ -x "$NODE" ]; then
    :
  elif command -v node >/dev/null 2>&1; then
    NODE="$(command -v node)"
  else
    NODE=""
    for candidate in \
      /mnt/c/nvm4w/nodejs/node.exe \
      "/c/nvm4w/nodejs/node.exe" \
      "/c/Program Files/nodejs/node.exe" \
      /mnt/c/Program\ Files/nodejs/node.exe \
      "/c/Program Files (x86)/nodejs/node.exe"
    do
      if [ -x "$candidate" ]; then
        NODE="$candidate"
        break
      fi
    done
  fi

  if [ -z "$NODE" ]; then
    echo ""
    echo "ERROR: no usable node interpreter found."
    echo "  'node' is not on PATH, and none of the fallback locations exist."
    echo "  Install Node 18+ (on WSL, install it INSIDE the distro), or export"
    echo "  NODE=/path/to/node to point this gate at a specific interpreter."
    exit 127
  fi

  echo "node: $NODE ($("$NODE" --version 2>/dev/null || echo 'version unknown'))"
}

resolve_node

# A script that package.json does not define yet is SKIPPED with a notice, so a
# fresh skeleton runs cleanly; a real verification failure still aborts below.
has_script() {
  [ -f package.json ] && "$NODE" -e "const s=require('./package.json').scripts||{};process.exit(s[process.argv[1]]?0:1)" "$1"
}

explain_failure() {
  echo ""
  echo "=== Verification FAILED ==="
  echo "Either the baseline is broken, or this skeleton has no runnable check yet."
  echo "Fix the baseline first, then re-run ./init.sh."
  echo "Do NOT mark any feature done until ./init.sh exits 0."
}
trap explain_failure ERR

# Counts the checks that actually ran. A guarded step SKIPS with a notice when package.json does not
# define the script yet, so before this counter existed ./init.sh could skip every check, print
# "Verification Complete" and exit 0 having verified nothing — the gate cannot fail, and "no feature
# may be marked done without evidence" becomes structurally unreachable on exactly the fresh skeleton
# where it matters most. Emitted unconditionally, because the branch that reaches the success tail at
# exit 0 must be the one that earned it. Same contract as the manual fallback templates/init.sh,
# which is the other producer of this file and carried the counter while this one did not.
RAN=0

echo "=== node scripts/check-ref-table.mjs ==="
"$NODE" scripts/check-ref-table.mjs
RAN=1

echo "=== node scripts/check-package.mjs ==="
"$NODE" scripts/check-package.mjs
RAN=$((RAN + 1))

if [ "$RAN" -eq 0 ]; then
  echo ""
  echo "ERROR: nothing in this harness verified anything — every check was skipped."
  echo "This project does not define the scripts named above yet, so none of them ran."
  echo "Replace them in ./init.sh with commands this repository can really run."
  echo "Until then ./init.sh MUST fail: a gate that cannot fail is not a gate."
  exit 1
fi

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read AGENTS.md for the startup path and the invariants"
echo "2. Pick ONE unfinished deliverable whose prerequisites are clear"
echo "3. Produce only that deliverable, staying inside its scope"
echo "4. Re-run this script before claiming done"
