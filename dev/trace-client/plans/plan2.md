# Plan — `git-deploy` skill

## Goal

Create a Claude Code skill named **git-deploy** that uploads the whole `trace-plus`
folder to the GitHub remote and, in the same run, writes a brief automatic
description of *what this particular upload contains* — both as a real commit
message and as a dated entry in a running log file.

Invoked as `/git-deploy`, optionally `/git-deploy <hint>` or `/git-deploy --dry-run`.

## Present context and current design

- Repo root: `/home/sushant/projects/trace-plus`, remote `git@github.com:capitalch/trace-plus.git`,
  branch `main` already tracking `origin/main`.
- Monorepo layout: `dev/trace-client`, `dev/trace-server`, `dev/trace_mobile_plus`,
  plus `deployment/`, `docs/`, `env/`, `lab/`, `notes/`.
- Today's upload path is `trace-plus/git-deploy.sh`:

  ```bash
  #!/bin/bash
  git add .
  git commit -m "init"
  git push
  ```

- Result: 15 of the last 16 commits are literally `init`. `git log` carries no
  information; there is no changelog anywhere in the repo (`notes/Deployment.md`
  is server/nginx setup instructions, not a change history).
- No skills exist yet — `~/.claude/skills/` is empty and `trace-plus/.claude/`
  contains only `settings.local.json`.
- `.claudeignore` excludes `config.py`, `.env`, `**/.env*`, `**/config.*`.
  Global CLAUDE.md additionally forbids reading anything under a `deployment/` folder.

## Key constraints of present design

1. **No description of work.** The commit message is a hardcoded constant, so
   neither `git log` nor GitHub shows what changed in any upload.
2. **Blind staging.** `git add .` stages everything with no visibility into what
   is going up, and no guard against a stray `.env` / `config.*` / key file that
   is not yet in `.gitignore`.
3. **No failure handling.** If `git commit` finds nothing to commit, the script
   still runs `git push`; if push fails (no upstream, rejected non-fast-forward),
   the script exits silently with a non-zero code nobody reads.
4. **Runs from anywhere.** The script does not verify it is inside `trace-plus`,
   so running it from a sibling repo would commit the wrong tree.
5. **Not context-aware.** A shell script cannot summarise a diff; only the model can.

## New design brief

`/git-deploy` is a three-phase skill: **collect → describe → commit & push.**

- **Collect** (script, read-only): gather branch, upstream, `git status --short`,
  `git diff --stat HEAD`, and a size-capped textual diff, with `.claudeignore`
  paths and `deployment/**` excluded from the diff body (they are still committed,
  just never read).
- **Describe** (model): from that data write a commit message — one imperative
  subject line ≤ 72 chars, prefixed with the affected area, plus 3–6 bullets
  naming file/area and what actually changed — and the matching log entry.
- **Commit & push** (script): write the dated entry into `notes/deploy-log.md`
  *first*, then stage everything, commit once with the generated message, and push.

The log entry is written before staging, so it travels inside the same commit as
the code it describes — one commit and one push per deploy. The entry carries no
sha of its own (a commit cannot contain its own hash); it records `Base:`, the
short sha of the pre-commit HEAD, which is known in advance and makes
`git diff <base>..` show exactly that upload. The entry-to-commit mapping is
recoverable regardless: every deploy touches `notes/deploy-log.md`, so
`git log --oneline -- notes/deploy-log.md` lists one commit per entry, in order.

Log entry shape (`notes/deploy-log.md`, newest at top under the H1):

```markdown
## 2026-09-08 14:12 (main)
General ledger: fix account filter reset
- comp-react-select: preserve selection across re-render
- general-ledger: reset page index on branch change
- accounts-edit-modal: validate alias uniqueness before save
Files: 3 changed (+84 / -21) — Base: f88484b
```

## Files touched

| File | Action |
| --- | --- |
| `trace-plus/.claude/skills/git-deploy/SKILL.md` | new — skill definition and model instructions |
| `trace-plus/.claude/skills/git-deploy/scripts/collect-changes.sh` | new — read-only change collection |
| `trace-plus/.claude/skills/git-deploy/scripts/finish-deploy.sh` | new — stage, commit, log, push |
| `trace-plus/notes/deploy-log.md` | new — created by the first run, appended thereafter |
| `trace-plus/git-deploy.sh` | kept as the manual fallback; two comment lines added pointing at the skill |

## Implementation

### Step 1 — `collect-changes.sh` (read-only)

Create `trace-plus/.claude/skills/git-deploy/scripts/collect-changes.sh`, `set -euo pipefail`.

1. `ROOT=$(git rev-parse --show-toplevel)`; abort with a clear message unless
   `basename "$ROOT"` is `trace-plus` and `git remote get-url origin` contains
   `capitalch/trace-plus`.
2. Print a `BRANCH=` / `UPSTREAM=` / `AHEAD_BEHIND=` header block.
3. If `git status --porcelain` is empty → print `NO_CHANGES` and exit 0.
4. **Secret guard.** Scan the would-be-staged file list (`git status --porcelain`
   names, respecting `.gitignore`) against `(^|/)\.env`, `(^|/)config\.[^/]+$`,
   `\.(pem|key|p12|pfx)$`, `(^|/)id_rsa`. Any hit → print `SECRET_SUSPECT: <paths>`
   and exit 2. The skill must stop and ask the user.
5. Emit `git status --short` and `git diff --stat HEAD` in full.
6. Emit the diff body: `git diff HEAD -- . ':(exclude)deployment/**' ':(exclude)**/.env*' ':(exclude)**/config.*'`.
   If it exceeds ~1500 lines, emit only the first 1500 lines plus a
   `DIFF_TRUNCATED` marker so the model falls back to per-file `--stat` reasoning.
7. Emit untracked files separately (`git ls-files --others --exclude-standard`),
   with first ~40 lines of each new text file so new files can be described too.

### Step 2 — `finish-deploy.sh` (write phase)

Create `trace-plus/.claude/skills/git-deploy/scripts/finish-deploy.sh`, `set -euo pipefail`.

Arguments: `$1` = path to a file holding the commit message, `$2` = path to a file
holding the log entry body (subject + bullets + `Files:` line, no heading — the
script writes the heading and appends `— Base: <sha>` to the `Files:` line).

1. Re-run the root/remote guard from Step 1.
2. If `git status --porcelain` is empty → print `NO_CHANGES` and exit 0, **before**
   touching the log file. Nothing is written on a no-op run.
3. `BASE=$(git rev-parse --short HEAD)`, `WHEN=$(date '+%Y-%m-%d %H:%M')`,
   `BR=$(git rev-parse --abbrev-ref HEAD)`.
4. Create `notes/deploy-log.md` with `# Deploy log` if absent. Insert
   `## $WHEN ($BR)` followed by the `$2` body **directly beneath the H1**
   (newest first), using a small awk/python insert rather than `>>` append, and
   suffix the body's `Files:` line with ` — Base: $BASE`.
5. `git add -A` — this stages the code changes *and* the log entry together.
6. `git commit -F "$1"`. If the commit fails, restore `notes/deploy-log.md`
   (`git checkout -- notes/deploy-log.md`, or delete it if it was created this run)
   so a failed deploy leaves no orphan entry, then exit non-zero.
7. Push: if `git rev-parse --abbrev-ref @{u}` succeeds → `git push`; else
   `git push -u origin "$BR"`. Never `--force`.
8. Print a final `DEPLOYED sha=$(git rev-parse --short HEAD) base=$BASE branch=$BR files=<n>`
   line for the model to relay.

### Step 3 — `SKILL.md`

Create `trace-plus/.claude/skills/git-deploy/SKILL.md`:

- Frontmatter: `name: git-deploy`, and a `description` covering the triggers
  "upload trace-plus to git", "deploy", "push my changes", "commit and push".
- Body procedure:
  1. Run `collect-changes.sh`. Handle `NO_CHANGES` (report, stop, do not push) and
     `SECRET_SUSPECT` (report the paths, stop, ask whether to `.gitignore` them).
  2. Read the collected diff and write the commit message:
     - Subject: imperative, ≤ 72 chars, prefixed with the affected area
       (`General ledger:`, `Sales:`, `trace-server:`, `Docs:`, `Chore:`).
     - Blank line, then 3–6 bullets, each `- <file or area>: <what changed>`.
       Describe the change, not the file list — "preserve selection across re-render",
       not "modified comp-react-select.tsx".
     - Mixed uploads: lead the subject with the dominant area, cover the rest in bullets.
     - Append the standard trailer block (`Co-Authored-By: Claude Opus 5 …` +
       `Claude-Session: …`) as required by session attribution rules.
  3. Write the log body: same subject and bullets (without the trailer), plus a
     final `Files: N changed (+X / -Y)` line taken from `--stat`.
  4. Write both to the scratchpad, run `finish-deploy.sh`, relay the result:
     subject, sha, branch, file count, and the GitHub commit URL.
- Rules section: never read `deployment/**` or `.claudeignore` paths; never
  `--force`; never switch or create branches; never amend or rewrite existing
  history; if the push is rejected, report it and stop — do not auto-pull/rebase.
- Argument handling: a free-text argument is a *hint* that steers the subject line
  but never replaces reading the diff; `--dry-run` stops after step 3 and prints
  the proposed message and log entry without staging, committing or pushing.

### Step 4 — Seed `notes/deploy-log.md`

Create it with an `# Deploy log` H1 and a one-line note that entries are appended
by `/git-deploy`, newest first. Seeding it by hand keeps the first real run from
having to both create and insert.

### Step 5 — Leave `git-deploy.sh` in place

Do not delete or change it; it stays the zero-Claude fallback. Optionally add one
comment line pointing at the skill.

### Step 6 — cwd forwarder — **dropped, premise was wrong**

An earlier draft added a forwarder skill at `dev/trace-client/.claude/skills/` on the
assumption that a skill at the repo root would not be discovered from a session started
in `dev/trace-client`. That assumption was tested and is false.

The test: two uniquely-named probe skills, `probe-root` in `trace-plus/.claude/skills/`
and `probe-client` in `dev/trace-client/.claude/skills/`. From a session started in
`dev/trace-client`, **each appeared exactly once** — so the repo-root skills directory is
reachable from a subdirectory, and each directory is enumerated once. The forwarder was
pure duplication and has been deleted along with both probes.

Verify a discovery assumption with a probe before building around it.

## Testing

1. **Dry run** — `/git-deploy --dry-run` with the current working tree (5 modified/deleted
   + 6 untracked plan files). Expect a proposed message and log entry, and
   `git status` unchanged afterwards.
2. **Normal run** — `/git-deploy`. Verify: exactly **one** new commit;
   `git show --stat HEAD` lists `notes/deploy-log.md` alongside the code files;
   the new entry's `Base:` sha equals the previous HEAD and `git diff <base>..HEAD`
   reproduces the upload; `git log origin/main -1` shows the push landed.
3. **No-change run** — run again immediately. Expect `NO_CHANGES`, no commit, no push,
   and `notes/deploy-log.md` unchanged (no empty entry appended).
4. **Secret guard** — `touch trace-plus/dev/trace-server/config.local.py` and run.
   Expect the run to stop with `SECRET_SUSPECT` naming that path, and no commit.
5. **Wrong repo** — run the collect script from another git repo. Expect the root guard
   to abort.
6. **Large diff** — confirm the truncation marker appears and the message is still
   written from `--stat` when the diff exceeds the cap.
7. **Discovery from a subdirectory** — with a session started in `dev/trace-client`,
   confirm `/git-deploy` is listed even though the skill lives at the repo root.
8. **Deployment folder untouched** — change a file under `deployment/`, run, and confirm
   it is committed but its contents never appear in the collected diff.

## Flags and constraints

- **One commit per deploy.** The log entry ships inside the commit it describes, so
  `git log --oneline` stays free of bookkeeping commits and
  `git log -- notes/deploy-log.md` returns the real work commits. The entry names no
  sha of its own — `Base:` plus entry ordering covers every lookup that a sha would.
- **Staging is `git add -A`**, per the chosen behaviour: `plans/*.md`, `CLAUDE.md` and
  other scratch files go up with the code. The secret guard is the only filter.
- **The skill never resolves conflicts.** A rejected push is reported back, not fixed.
- **Model cost**: each run reads a capped diff, so a very large upload produces a
  coarser summary rather than a slow or truncated one.
- **One skill file, at the repo root.** It is discovered from `dev/trace-client` as well,
  so no per-folder copy is needed. If the picker ever shows the name more than once with a
  single file on disk, that is a client-side enumeration quirk — every row runs the same
  scripts.
- Skill is committed to the repo (project scope), so it also uploads itself on the
  first run — including the forwarder.

## As built

Deviations from the plan as written, and defects found while testing:

- **Step 6 dropped** — see above; the forwarder was deleted after the probe test.
- **Secret guard rewritten.** The planned candidate list came from `git status --porcelain`,
  which collapses a wholly-untracked directory to `dir/`. A secret inside a new directory
  therefore never matched the regex, and the NEW FILES loop — which *does* expand
  directories — read and printed it. The list is now built from `git diff --name-only`
  plus `git ls-files --others`, and the read loop carries its own second check.
- **SIGPIPE abort on large diffs.** `printf | head` under `set -o pipefail` killed the
  script at exit 141, so `DIFF_TRUNCATED`, NEW FILES and END never printed — exactly the
  case where the model most needs `STAT`. The truncating pipeline now ends in `|| true`.
- **Missing trailing newline.** A file whose last line lacks a newline glued the next
  `--- <path>` header onto its content. The NEW FILES loop now emits a separator.

Tested against a throwaway `trace-plus` clone with a local bare remote: single commit,
log entry inside it, `Base:` matching the prior HEAD, newest-first ordering, `NO_CHANGES`
no-op, secret guard (including a false-positive check on `vite.config.ts` /
`tailwind.config.js`), wrong-repo guard, diff truncation, `deployment/` never read,
commit-failure rollback, and push rejection leaving the commit local.
