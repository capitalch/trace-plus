#!/usr/bin/env bash
# collect-changes.sh — phase 1 of /git-deploy. READ ONLY.
# Gathers everything the model needs to describe this upload. Stages nothing,
# writes nothing, touches no network. Run from anywhere inside the repo.
#
# Exit codes: 0 = collected (or NO_CHANGES), 1 = guard failed, 2 = SECRET_SUSPECT.
set -euo pipefail

MAX_DIFF_LINES=1500
MAX_NEW_FILE_LINES=40

fail() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

# --- guard: this must be the trace-plus repo -------------------------------
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || fail "not inside a git repository"
[ "$(basename "$ROOT")" = "trace-plus" ] || fail "repo root is $ROOT — expected a folder named trace-plus"
ORIGIN=$(git -C "$ROOT" remote get-url origin 2>/dev/null) || fail "no 'origin' remote configured"
case "$ORIGIN" in
    *capitalch/trace-plus*) ;;
    *) fail "origin is $ORIGIN — expected capitalch/trace-plus" ;;
esac
cd "$ROOT"

# --- header ----------------------------------------------------------------
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
    read -r BEHIND AHEAD <<<"$(git rev-list --left-right --count '@{u}...HEAD')"
    AHEAD_BEHIND="ahead $AHEAD, behind $BEHIND"
else
    UPSTREAM="(none — first push will need -u)"
    AHEAD_BEHIND="(unknown)"
fi
echo "ROOT=$ROOT"
echo "BRANCH=$BRANCH"
echo "UPSTREAM=$UPSTREAM"
echo "AHEAD_BEHIND=$AHEAD_BEHIND"
echo "HEAD=$(git log -1 --format='%h %s' 2>/dev/null || echo '(no commits yet)')"

# --- nothing to do? --------------------------------------------------------
if [ -z "$(git status --porcelain)" ]; then
    echo "NO_CHANGES"
    exit 0
fi

# --- secret guard ----------------------------------------------------------
# Every path git would stage, fully expanded. `git status --porcelain` collapses a
# wholly-untracked directory to "dir/", which would hide a secret sitting inside it,
# so the candidate list is built from name-only listings instead.
SECRET_RE='(^|/)\.env|(^|/)config\.[^/]+$|\.(pem|key|p12|pfx)$|(^|/)id_rsa'
CANDIDATES=$( {
    git diff --name-only HEAD
    git diff --cached --name-only
    git ls-files --others --exclude-standard
} | sort -u)
SUSPECT=$(printf '%s\n' "$CANDIDATES" | grep -E "$SECRET_RE" || true)
if [ -n "$SUSPECT" ]; then
    echo "SECRET_SUSPECT: $(printf '%s' "$SUSPECT" | tr '\n' ' ')"
    echo "Refusing to collect. Add these to .gitignore or confirm they are safe."
    exit 2
fi

# --- status and stat -------------------------------------------------------
echo
echo "=== STATUS ==="
git status --short
echo
echo "=== STAT ==="
git diff --stat HEAD
echo "SHORTSTAT=$(git diff --shortstat HEAD | sed 's/^ *//')"

# --- diff body (deployment/ and secret-shaped paths never read) ------------
echo
echo "=== DIFF ==="
DIFF=$(git diff HEAD -- . \
    ':(exclude)deployment/**' \
    ':(exclude)**/.env*' \
    ':(exclude).env*' \
    ':(exclude)**/config.*' \
    ':(exclude)config.*' || true)
DIFF_LINES=$(printf '%s\n' "$DIFF" | wc -l)
if [ "$DIFF_LINES" -gt "$MAX_DIFF_LINES" ]; then
    # `|| true`: head closes the pipe early, and SIGPIPE on printf would otherwise
    # abort the whole script under `set -o pipefail`
    printf '%s\n' "$DIFF" | head -n "$MAX_DIFF_LINES" || true
    echo "DIFF_TRUNCATED: showed $MAX_DIFF_LINES of $DIFF_LINES lines — describe the rest from STAT"
else
    printf '%s\n' "$DIFF"
fi

# --- untracked files -------------------------------------------------------
echo
echo "=== NEW FILES ==="
git ls-files --others --exclude-standard | while IFS= read -r f; do
    case "$f" in deployment/*) echo "--- $f (deployment — not read)"; continue ;; esac
    # belt and braces: the guard above already aborts on these, never read one here
    if printf '%s\n' "$f" | grep -qE "$SECRET_RE"; then
        echo "--- $f (secret-shaped path — not read)"
        continue
    fi
    if [ -d "$f" ] || ! grep -Iq . "$f" 2>/dev/null; then
        echo "--- $f (binary or unreadable — not read)"
        continue
    fi
    echo "--- $f (first $MAX_NEW_FILE_LINES lines)"
    head -n "$MAX_NEW_FILE_LINES" "$f"
    # a file with no trailing newline would otherwise glue the next --- header
    # onto its last content line
    echo
done
echo
echo "=== END ==="
