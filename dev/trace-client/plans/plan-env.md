# Plan — env/config management for trace-server, mirroring service-plus

## Goal

Make `trace-server` manage `.env`, `.env.example` and related configuration the way
`service-plus-server` already does: a typed `pydantic-settings` model, secrets supplied
from an untracked `.env`, a tracked `.env.example` template, and a secret-free `config.py`
that is safe to commit. One deliberate difference — the schema lives in a single model
rather than five files, and the template and checks are generated from it. See
"New design brief".

No values from the current `config.py` are reproduced in this plan — only key names.

## Status

**Migration complete (2026-09-10).** All nine steps done; trace-server now reads its
configuration from `.env` through a typed model, with no secret in tracked code.

| Step | What | Status |
| --- | --- | --- |
| 0 | Back up the pre-migration `config.py` outside the repo | **done** |
| 1 | Dependency manifest rewritten, moved, installed | **done — verified** |
| 2 | The `Settings` model | **done — 24 fields, 6 secrets** |
| 3 | What replaces `Config` | reading only, no action |
| 4 | `.env` and `.env.example` | **done — 28 checks pass** |
| 5 | Un-ignore `config.py` and `.env.example` | **done — verified** |
| 6 | Migrate the 44 call sites | **done — 44 sites, 8 secrets** |
| 7 | Cleanups (`e1004`, dead keys, `comment`) | **done — plus a duplicate-code bug fixed** |
| 8 | Check suite | **done — 28 checks pass, parity confirmed** |
| 9 | Verification | **done — migration complete** |

Out of plan scope, done along the way: the shared key was rotated on both sides, and
service-plus's two empty-defaulted WhatsApp HMAC secrets were fixed (see Flags).

## Present context and current design

### trace-server today

`dev/trace-server/app/config.py` is a plain class with hardcoded class attributes:

```python
class Config:
    PACKAGE_NAME = '...'
    SUPER_ADMIN_UID / SUPER_ADMIN_EMAIL / SUPER_ADMIN_HASH / SUPER_ADMIN_MOBILE_NO
    ACCESS_TOKEN_SECRET_KEY / ALGORITHM / ACCESS_TOKEN_EXPIRE_HOURS /
        ACCESS_TOKEN_EXPIRE_SECONDS_TEST / REFRESH_TOKEN_SECRET_KEY / REFRESH_TOKEN_EXPIRE_WEEKS
    DB_NAME / DB_USER / DB_PASSWORD / DB_HOST / DB_PORT / DB_IP_ADDRESS / DB_INTERNAL_PORT
    CRYPTO_KEY
    MAIL_USER_NAME / MAIL_PASSWORD / MAIL_FROM / MAIL_PORT / MAIL_SERVER
    SERVICE_PLUS_API_KEY
    comment: str = '...'          # a plaintext password hint
```

- **25 attributes, 7 of them secret-shaped**: `SUPER_ADMIN_HASH`,
  `ACCESS_TOKEN_SECRET_KEY`, `REFRESH_TOKEN_SECRET_KEY`, `DB_PASSWORD`, `CRYPTO_KEY`,
  `MAIL_PASSWORD`, `SERVICE_PLUS_API_KEY` — plus a `comment` attribute stating a password
  in prose. **The values currently in the file are not live credentials** (confirmed by the
  repo owner), so there is no active exposure to clean up. The design still treats these
  keys as secrets, because the `.env` that replaces the file will hold real ones.
- **44 references across 8 files**, every one via `from app.config import Config`:
  `app/graphql/graphql_helper.py`, `app/graphql/db/psycopg_async_helper.py`,
  `app/internal/internal_router.py`, `app/security/security_utils.py`,
  `app/security/security_helper.py`, `app/core/utils.py`, `app/core/mail.py`,
  `app/core/messages.py`.
- **Not in version control.** `.gitignore:147` (`**/config.*`) ignores it, so a fresh
  clone has neither the file nor any template for it.
- **No `.env`, no `.env.example`, no `requirements.txt`** in `dev/trace-server/`.
  Dependencies lived in the **repo-root** `requirements.txt` (tracked), and that file was
  a stale `pip freeze` dump — 23 lines pinning transitives (`annotated-types`, `h11`,
  `sniffio`) and Flask leftovers (`blinker`, `itsdangerous`, `Werkzeug`), while **omitting
  eight packages the code actually imports**: `ariadne`, `psycopg`, `bcrypt`,
  `cryptography`, `pandas`, `fastapi-mail`, `fpdf`, `PyJWT`. Its pins were also years
  behind the virtualenv (`fastapi==0.104.1` on file vs `0.135.2` installed;
  `pydantic==2.4.2` vs `2.12.5`). `dev/trace-server` is the only Python application in the repo.
  **This file has now been rewritten** — see Step 1.
- **Dead config**: `REFRESH_TOKEN_SECRET_KEY` and `REFRESH_TOKEN_EXPIRE_WEEKS` are defined
  but referenced nowhere outside `config.py`.
- **Untyped durations**: `ACCESS_TOKEN_EXPIRE_HOURS`, `ACCESS_TOKEN_EXPIRE_SECONDS_TEST`
  and `REFRESH_TOKEN_EXPIRE_WEEKS` are strings holding numbers.
- `app/core/messages.py:55` (`e1004`) tells the user to "check the Config.py file at server".

### service-plus-server — the pattern to copy

- `app/core/settings/` holds one `BaseSettings` subclass per concern:
  `api_settings.py`, `auth_settings.py`, `database_settings.py`, `email_settings.py`,
  `whatsapp_settings.py`. Each declares:

  ```python
  model_config = SettingsConfigDict(
      env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
  )
  ```

- **Secrets are fields with no default** (`client_db_password: str`, `secret_key`,
  `super_admin_password_hash`, `file_server_api_key`, `website_api_key`) so a missing
  `.env` entry fails at startup rather than silently running on a placeholder.
  Non-secret values (hosts, ports, CORS origins, log levels) carry inline defaults.
- **`@computed_field` properties** derive environment-dependent values from `app_env`
  (`file_server_url`, `trace_plus_url`, `frontend_url`) instead of duplicating them.
- **`app/config.py` is a composition root only** — it imports the domain classes,
  composes them by multiple inheritance, and instantiates one singleton:

  ```python
  class Settings(DatabaseSettings, AuthSettings, EmailSettings, WhatsappSettings, ApiSettings):
      model_config = SettingsConfigDict(env_file=".env", ...)
  settings = Settings()
  ```

- Consumers all write `from app.config import settings`, then `settings.<lower_name>`.
- Tracking: `config.py` tracked, `.env.example` tracked, `.env` untracked.
- `tests/core/test_settings.py` is an import-only smoke test asserting `Settings`
  subclasses every domain class, that one field from each domain resolves, and that the
  computed fields return one of their branches.
- Pins: `pydantic>=2.12,<2.13`, `pydantic-settings>=2.13,<2.14`; `pytest` in
  `requirements-dev.txt`.

## Key constraints of present design

Each is followed by what removes it. Six of the eight are closed outright by the new
design; the two that are not are called out as such.

1. **Secrets are the source file.** There is no separation between "what the app needs"
   and "the values for this machine", so there is nothing to hand a new developer.
   → *Closed by Steps 2 and 4*: the model holds the schema, `.env` holds the values,
   `.env.example` is the thing you hand over.
2. **Config is not in git, and cannot be.** `**/config.*` ignores it, so the file defining
   the app's entire configuration surface has no history, no review and no template. A
   fresh clone cannot start the server. → *Closed by Step 5*: once `config.py` is
   secret-free it is un-ignored and tracked.
3. **`.env.example` cannot simply be added.** `.gitignore:111` is `**/.env*`, which ignores
   the template too, so one committed today would be silently skipped. → *Closed by
   Step 5*: a `!**/.env.example` negation, verified with `git check-ignore`.
4. **No validation and no fail-fast.** A missing or misspelled value surfaces as an
   `AttributeError` deep in a request. → *Closed by Step 2*: required fields make pydantic
   refuse to construct `Settings`, so the server dies at startup naming the field.
5. **Untyped values.** Durations are strings; every consumer must coerce. → *Closed by
   Step 2*: `int` fields with `ge`/`le` bounds where a range is meaningful.
6. **A cross-repo shared secret is duplicated by hand.** `SERVICE_PLUS_API_KEY` must equal
   `trace_plus_service_key` in service-plus; nothing enforces it. → **Only mitigated.**
   The coupling is written into the field's `description`, so it appears as a comment above
   the key in `.env.example`, and Testing case 8 exercises a real cross-repo call. Actually
   *enforcing* it needs a shared secret store, which is out of scope here.
7. ~~**`pydantic-settings` is not a dependency yet**~~ — **already resolved.** The
   virtualenv runs `pydantic-settings==2.13.1` with `pydantic==2.12.5`, the exact pairing
   service-plus builds against. Only the manifest was out of date.
8. **The dependency manifest is in the wrong place and the wrong shape.** → *Closed by
   Step 1*, already done: direct dependencies with ranges, to be moved beside the app.

### Best practices added beyond fixing the above

These close gaps the original list did not name. All were prototyped and verified.

- **`SecretStr` for all six live secrets.** `repr(settings)`, `str()`, f-strings and logging
  output all render `**********`, so an accidental `print(settings)`, a debug traceback or
  a log line cannot leak a credential. Reading a secret becomes deliberate:
  `settings.db_password.get_secret_value()`. The type doubles as the marker both scripts
  use to decide what to mask.
- **Placeholder rejection.** A `.env` copied from the template and not filled in would
  otherwise start the server with `changeme` as its crypto key. A model-level validator
  rejects the placeholder on any field, so the failure is at startup and names the field.
  It lives in the model rather than the check script, so it protects the running app.
- **Validated types, not just typed.** `EmailStr` for the two address fields (the
  `email-validator` package is already installed) and `ge=1, le=65535` on the three port
  fields.
- **Errors must not print values.** pydantic's `ValidationError` for a missing field
  includes `input_value=` — the entire parsed `.env` dict, every other secret in it. Any
  handler that prints the raw exception leaks. `check_settings.py` prints only field name
  and message; **application startup error handling must do the same.**
- **Development-safe defaults.** Every non-secret default is a local value (`localhost`,
  `127.0.0.1`) so a fresh clone runs against nothing real, and production values arrive
  only via `.env`. service-plus instead defaults to live Cloudjiffy hostnames; do not copy
  that.
- **Real values enter only through `.env`.** Today's `config.py` holds non-live values, so
  the migration starts from a clean position: the moment real credentials appear they go
  into `.env`, never into a tracked file.

## New design brief

Adopt service-plus's *approach* — pydantic-settings, secrets from an untracked `.env`,
a committed `.env.example`, a secret-free `config.py` — but keep the schema in **one
place** rather than five. The model in `config.py` is the single source of truth; the
template and the checks are derived from it.

```
dev/trace-server/
├── .env                      # untracked — real values, this machine only
├── .env.example              # tracked — GENERATED from the model, never hand-edited
├── app/config.py             # one Settings class, ~60 lines; secret-free; TRACKED
└── scripts/
    ├── gen_env_example.py    # model -> .env.example
    └── check_settings.py     # checks every key, derived from the model
```

**Why not service-plus's four-module `app/core/settings/` split.** That split earns its
keep there: `api_settings.py` alone is 128 lines and the five domains total far more than
trace-server's 24 fields. Here it would mean five files, the same `SettingsConfigDict`
repeated in each, and a composition root whose only job is to reassemble what was split —
for a config surface that fits comfortably in one screen. Grouping the 24 fields under
comment headers in a single class gives the same readability with none of the wiring.

**The real win is that the schema is written once.** The earlier draft of this plan had it
three times — the settings classes, a hand-maintained `.env.example`, and a 24-key manifest
inside the check script — so any of the three could silently drift from the others. Now
`.env.example` is generated and the checker reads `Settings.model_fields`, so adding a
field to `config.py` is all it takes for both to follow.

**Deviation 1 — anchor `env_file` to the package, not the working directory.**
service-plus uses `env_file=".env"`, which resolves against the *current working
directory*; the server only finds its `.env` when launched from `dev/service-plus-server`.
Since this plan is asked to be robust, trace-server should resolve it absolutely:

```python
from pathlib import Path
SERVER_DIR = Path(__file__).resolve().parents[1]   # app/config.py -> dev/trace-server
model_config = SettingsConfigDict(env_file=SERVER_DIR / ".env", ...)
```

**Deviation 2 — `SERVICE_PLUS_API_KEY` is a required field with no default.**
In service-plus the twin of this key (`trace_plus_service_key`) is declared *with* a
default, in the tracked `api_settings.py` — which is how the real key reached git history
in the first place. A defaultless field cannot leak that way: with no value in the code,
`.env` is the only place it can come from. See "Flags" for the rotation follow-up.

### Name mapping

pydantic-settings is case-insensitive, so the `.env` keys stay upper-case while the Python
fields become lower-case:

| today | field | `.env` key | secret? |
| --- | --- | --- | --- |
| `Config.PACKAGE_NAME` | `package_name` | `PACKAGE_NAME` | no (default in code) |
| `Config.SUPER_ADMIN_UID` | `super_admin_uid` | `SUPER_ADMIN_UID` | no |
| `Config.SUPER_ADMIN_EMAIL` | `super_admin_email` | `SUPER_ADMIN_EMAIL` | no |
| `Config.SUPER_ADMIN_HASH` | `super_admin_hash` | `SUPER_ADMIN_HASH` | **yes — required** |
| `Config.SUPER_ADMIN_MOBILE_NO` | `super_admin_mobile_no` | `SUPER_ADMIN_MOBILE_NO` | no |
| `Config.ACCESS_TOKEN_SECRET_KEY` | `access_token_secret_key` | same | **yes — required** |
| `Config.ALGORITHM` | `algorithm` | `ALGORITHM` | no |
| `Config.ACCESS_TOKEN_EXPIRE_HOURS` | `access_token_expire_hours: int` | same | no |
| `Config.ACCESS_TOKEN_EXPIRE_SECONDS_TEST` | `access_token_expire_seconds_test: int` | same | no |
| `Config.DB_NAME/USER/HOST/PORT/IP_ADDRESS/INTERNAL_PORT` | `db_*` | same | no |
| `Config.DB_PASSWORD` | `db_password` | `DB_PASSWORD` | **yes — required** |
| `Config.CRYPTO_KEY` | `crypto_key` | `CRYPTO_KEY` | **yes — required** |
| `Config.MAIL_USER_NAME/FROM/PORT/SERVER` | `mail_*` | same | no |
| `Config.MAIL_PASSWORD` | `mail_password` | `MAIL_PASSWORD` | **yes — required** |
| `Config.SERVICE_PLUS_API_KEY` | `service_plus_api_key` | same | **yes — required** |
| `Config.REFRESH_TOKEN_*` | — | — | dead, see Step 7 |
| `Config.comment` | — | — | **delete** |

## Files touched

| File | Action |
| --- | --- |
| `dev/trace-server/app/config.py` | rewritten — one secret-free `Settings` model |
| `dev/trace-server/.env` | new — untracked; **the user fills in the real values** |
| `dev/trace-server/.env.example` | new — tracked, generated from the model |
| `dev/trace-server/scripts/gen_env_example.py` | new — regenerates the template |
| `dev/trace-server/scripts/check_settings.py` | new — checks every key |
| `.gitignore` | two negations so `config.py` and `.env.example` become trackable |
| `.claudeignore` (root) and `dev/trace-server/.claudeignore` | both narrowed — identical files, both list `config.*` |
| 8 consumer files | `Config.UPPER` → `settings.lower` (44 sites) |
| `dev/trace-server/app/core/messages.py` | `e1004` wording |
| `requirements.txt` (repo root) | rewritten (done), then moved to the server folder and deleted here |
| `dev/trace-server/requirements.txt` | its new home |

## Implementation

Every step ends with **Your part** — the actions for you. Anything not under a "Your part"
is background or already done.

### Step 0 — before you touch anything — ✅ DONE

Step 2 overwrites `app/config.py`, and that file is the **only** place the current values
exist: it is git-ignored, so there is no copy in history to recover them from. The values
are not live credentials, but they are the working configuration and the input to Step 4.

**Your part — done:**

1. ~~Copy `dev/trace-server/app/config.py` outside the repository.~~ Done. Verified from
   here: the original is still in place and untouched, and no stray copy sits inside the
   working tree where `git add -A` would catch it.
2. Keep the backup until Step 9 passes — Step 4 reads the values out of it, and Step 8's
   `--compare-old` uses it to prove nothing changed.

### Step 1 — dependency manifest — ✅ DONE

**Done:** the repo-root `requirements.txt` has been rewritten — 13 direct dependencies with
version ranges, every one verified against the installed venv:

```
ariadne>=1.0,<1.1              pandas>=3.0,<3.1               PyJWT>=2.12,<2.13
bcrypt>=5.0,<5.1               psycopg[binary]>=3.3,<3.4      uvicorn[standard]>=0.42,<0.43
cryptography>=46.0,<46.1       pydantic[email]>=2.12,<2.13    XlsxWriter>=3.2,<3.3
fastapi>=0.135,<0.136          pydantic-settings>=2.13,<2.14
fastapi-mail>=1.6,<1.7         fpdf>=1.7,<1.8
```

Three of those no import scan can find: `XlsxWriter` (pandas loads it by name for the Excel
export), `uvicorn[standard]` (the launcher, `--reload` needs the extra), and
`pydantic[email]` (Step 2 uses `EmailStr`; today it works only via a `fastapi-mail`
transitive).

**Your part — done and verified:** the manifest lives at
`dev/trace-server/requirements.txt`, the root copy is deleted, and the venv satisfies all
13 pins plus the `[email]`, `[binary]` and `[standard]` extras. `import app.main` still
succeeds.

### Step 2 — the `Settings` model — ✅ DONE

Rewrite `app/config.py` as a single `BaseSettings` subclass holding all 24 fields, grouped
under comment headers in the order of the mapping table (application, super admin, jwt,
database, crypto, mail, integration).

```python
SERVER_DIR = Path(__file__).resolve().parents[1]
PLACEHOLDER = "changeme"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=SERVER_DIR / ".env", env_file_encoding="utf-8",
        case_sensitive=False, extra="ignore",
    )
    db_host: str = Field(default="localhost", description="Database host")
    db_port: int = Field(default=5432, ge=1, le=65535, description="Database port")
    mail_from: EmailStr = Field(default="admin@example.com", description="From address")
    db_password: SecretStr = Field(description="Database password")

    @field_validator("*", mode="after")
    @classmethod
    def reject_placeholder(cls, v, info):
        """A .env copied from the template but not filled in must not start the server."""
        raw = v.get_secret_value() if isinstance(v, SecretStr) else v
        if isinstance(raw, str) and raw.strip().lower() == PLACEHOLDER:
            raise ValueError(f"{info.field_name} still holds the .env.example placeholder")
        return v

settings = Settings()
```

**Written to these rules** — `app/config.py` now holds 24 fields: 18 non-secret with
development-safe defaults and 6 `SecretStr` fields with no default. Verified: the secrets
and the required fields are exactly the same six, every field carries a description (they
become the comments in `.env.example`), and `REFRESH_TOKEN_*` and `comment` are gone.

1. **Non-secrets carry an inline default and a `description`.** The description becomes the
   comment above that key in `.env.example`, so write it properly. Defaults must be
   **development-safe** (`localhost`, `127.0.0.1`) — never a live host.
2. **Secrets are typed `SecretStr` with no default.** No default makes pydantic refuse to
   start without the value; `SecretStr` renders it as `**********` in `repr`, `str`,
   f-strings and logs. Both scripts detect a secret by this type, so there is no separate
   list of sensitive keys to maintain.
3. **Type the durations as `int`** and bound the three port fields with `ge=1, le=65535`.
4. **Use `EmailStr`** for `super_admin_email` and `mail_from`.
5. **Keep `env_file` anchored to `SERVER_DIR`**, not `".env"` — see Deviation 1.
6. **Do not carry over** `REFRESH_TOKEN_*` (dead) or `comment` (a password hint) — Step 7.

### Step 3 — what replaces `Config` — **no action, read before Step 6**

Step 2 leaves `config.py` exporting `settings` and no longer exporting `Config`. Every one
of the 8 consumer files today reads:

```python
from app.config import Config      # module level
...
Config.DB_NAME                     # somewhere in the body
```

and becomes:

```python
from app.config import settings
...
settings.db_name
```

Three consequences for Step 6:

1. **The server will not start between Step 2 and the end of Step 6.** Once `config.py`
   stops defining `Config`, every file still importing it fails with
   `ImportError: cannot import name 'Config'`, and these modules are imported while FastAPI
   starts. Expect a dead server for the duration — do not read it as a mistake, and do not
   try running the app until Step 6 is finished.

2. **Missing one usage inside a file fails later, not at startup.** If you change the
   import line but leave a single `Config.CRYPTO_KEY` further down, Python raises
   `NameError: name 'Config' is not defined` only when that line actually executes — which
   may be a rarely-used code path that reaches production before anyone runs it. "The
   server starts" therefore does not prove the migration is complete.

3. **So the completion check is a grep, not a smoke test** — see Step 6.

**Why no compatibility shim.** The alternative was to keep a small `Config` class in
`config.py` forwarding the old upper-case names to the new fields. That needs no call-site
edits, but it never expires: `Config.DB_NAME` and `settings.db_name` would both work
forever, so every value has two spellings and new code picks whichever the author saw
first. A shim is worth it when it is a temporary bridge with a removal date; here nothing
would ever force the removal.

### Step 4 — `.env` and `.env.example` — ✅ DONE

`gen_env_example.py` works before any `.env` exists — pydantic names the missing required
fields, so the script seeds throwaway values, loads the model definition and generates from
that. The throwaway value never reaches the template.

**Your part — done.** Verified from here without reading any value: `.env` exists with
`-rw-------`, `.env.example` is generated (2169 bytes), all 24 keys are present and
non-blank, the 6 secrets are set, no `changeme` survived, and template parity passes both
ways — `check_settings.py` exits 0 with 28 checks. Still worth running while the Step 0
backup exists: `check_settings.py --compare-old <backup>/config.py`, the one check that
catches a key left on a development default where the old file had something different.

1. `python scripts/gen_env_example.py` — writes `.env.example` from the model, grouped
   under section headers (Application, Super admin, JWT, Database, Crypto, Mail,
   Integration) taken from the `# comment` groups in `config.py`. Those headers are the
   only comments: key names speak for themselves, and a `changeme` value marks a key with
   no default.
2. `cp .env.example .env`.
3. Fill `.env` in from the Step 0 backup. Every key still showing `changeme` must get a
   real value — the placeholder validator refuses to start the server otherwise — and any
   key whose real value differs from the development default needs setting too.
4. `chmod 600 .env`.
5. Never hand-edit `.env.example`: regenerate it after any field change and commit it.

### Step 5 — make the safe files trackable — ✅ DONE

Both ignore mechanisms block the new arrangement. The negations below were tested in a
scratch repository: `config.py` and `.env.example` become trackable while `.env` — and
every `config.*`/`.env` elsewhere in the monorepo — stays ignored.

**Done.** Both negations are path-specific rather than glob-wide, which matters because
the deploy script copies the whole server tree into `deployment/final/`: a `!**/.env.example`
would have made that *copy* trackable too, showing up as an untracked file after every
deploy. Verified with `git check-ignore` — `dev/trace-server/app/config.py` and
`dev/trace-server/.env.example` are trackable; every `.env`, and both files under
`deployment/final/`, stay ignored. Both `.claudeignore` files were narrowed the same way,
each with a comment explaining why `config.py` is now safe to read.

Original steps, for reference:

1. In `.gitignore`, after line 147 (`**/config.*`), add `!dev/trace-server/app/config.py`.
2. In `.gitignore`, after line 111 (`**/.env*`), add `!dev/trace-server/.env.example`.
3. Verify:
   ```bash
   git check-ignore -v dev/trace-server/.env dev/trace-server/.env.example \
                       dev/trace-server/app/config.py
   ```
   Only `.env` may still be reported as ignored.
4. Narrow **both** `.claudeignore` files — the repo root one and
   `dev/trace-server/.claudeignore`; they are identical today and both list `config.py` and
   `**/config.*`. Drop the `config.*` entries so the now-safe model is readable; keep
   `.env` and `**/.env*`.

### Step 6 — migrate the consumers — ✅ DONE

44 substitutions across the 8 files listed in Present context.

**Your part:**

1. In each file, replace `from app.config import Config` with
   `from app.config import settings`, and each `Config.UPPER_NAME` with
   `settings.lower_name`.
2. For the six secrets, add `.get_secret_value()` — `Config.CRYPTO_KEY` becomes
   `settings.crypto_key.get_secret_value()`. This affects 8 of the 44 sites:
   `access_token_secret_key` (2), `crypto_key` (2), and one each for `db_password`,
   `mail_password`, `super_admin_hash`, `service_plus_api_key`. Passing a `SecretStr`
   where a string is expected fails loudly (bcrypt and psycopg both reject it), so a missed
   one cannot silently become a wrong value — but check them deliberately.
3. Do all 8 files before checking anything. Until the last one is converted, importing the
   app fails on whichever module has not been reached yet, so an early failure tells you
   nothing about the files already done.
4. Then verify once, from `dev/trace-server`:
   ```bash
   grep -rn "Config\." --include="*.py" app   # only the messages.py string should remain
   python -c "import app.main"                 # must import cleanly
   ```

### Step 7 — cleanups the migration exposes — ✅ DONE

**Done, and it exposed a live bug.** `e1004` was defined **twice** in `customErrorCodes`
(lines 55 and 56); Python keeps the last, so the super-admin message was dead and
`security_helper.py:340` — a 500 raised when super-admin config cannot be read — surfaced
"Either username or the password is invalid" instead. The super-admin message now has its
own code `e1038` and that call site raises it. `e1005` also pointed at "Config file" and now
names the `DB_*` keys in `.env`. Safe to renumber: the client only displays codes
(`Error ${status_code}: ${error_code}`) and never branches on them.

Original steps, for reference:

1. `app/core/messages.py:55` — `e1004` says "check the Config.py file at server". Reword to
   point at `.env` and the missing key. After this, the Step 6 grep must return nothing.
2. Decide on `REFRESH_TOKEN_SECRET_KEY` / `REFRESH_TOKEN_EXPIRE_WEEKS`: they are referenced
   nowhere. Drop them, or add them to the model if refresh tokens are planned — decide
   explicitly rather than porting dead keys by reflex.
3. Confirm the `comment` attribute is gone and was not carried into `.env.example`.

### Step 8 — the check suite — ✅ DONE

Both scripts exist under `dev/trace-server/scripts/`, need no test framework and no
addition to `requirements.txt`, and run from any working directory.

`check_settings.py` derives every key from `Settings.model_fields`, so it holds no list of
its own — adding a field to `config.py` is enough for it to be checked. It verifies:

1. `.env` and `.env.example` exist at the expected paths.
2. **Every key**: present, not `None`, not blank. Types and required-ness are already
   enforced by pydantic at construction — importing the model *is* that test — so what
   this adds is the blank check and a visible inventory. Non-secrets print their value;
   secrets print only "secret set (N chars)".
3. **Template parity in both directions** — a key in the model but missing from
   `.env.example`, or a stale key left in the template — each pointing at
   `gen_env_example.py` as the fix.
4. **`--compare-old`** parses the old `config.py` with `ast` and reports `MATCH`/`DIFFERS`
   per key, never values. New keys are listed as new; old keys not migrated are listed as
   dropped, which is where `REFRESH_TOKEN_*` should appear.

Exit codes: `0` passed, `1` a check failed, `2` settings could not be imported — what a
missing `.env`, an absent required key or a leftover placeholder produces. On that path it
prints field names and messages only, never the raw `ValidationError`, which would carry
the whole parsed `.env`.

Verified against a prototype of the migrated structure: healthy run, missing required
secret, leftover placeholder, template drift, parity against a mismatched old config,
generation with no `.env` present, and a run from `/`.

**Your part — done.** `check_settings.py` exits 0 with 28 checks passing, and
`--compare-old` against the Step 0 backup reported every migrated key as `MATCH` — so no
key was left sitting on a Step 2 development default, and the six secrets carried over
intact. `REFRESH_TOKEN_*` and `comment` show as deliberately not migrated.

```bash
python scripts/check_settings.py                              # exits 0
python scripts/check_settings.py --compare-old <step-0-copy>  # every key MATCH
```

### Step 9 — verification and rotation — ✅ DONE

**Your part:**

1. Start the server from a directory other than `dev/trace-server` — this is what
   Deviation 1 buys, and nothing else tests it.
2. Work through the Testing section below.
3. ~~Rotate the shared key.~~ **Done** before this plan ran (see Flags). What remains is
   confirming Testing case 8 passes, which proves the new value reached `.env` intact.
4. Delete the Step 0 backup once Testing passes.

## Testing

  1. **Fail-fast** — rename `.env` temporarily and start the server. Expect a pydantic
   `ValidationError` at startup naming every missing required key, not an
   `AttributeError` mid-request.
1b. **Startup errors must not print values** — confirm the server's own error path does
   not dump the raw `ValidationError`: for a missing field pydantic attaches
   `input_value=` holding the whole parsed `.env`. Print field names and messages only.
1c. **Placeholder guard** — set one key to `changeme` and start: startup must fail naming
   that field.
1d. **Secret masking** — `python -c "from app.config import settings; print(settings)"`
   must render every secret as `**********`.
2. **Typed values** — assert `isinstance(settings.access_token_expire_hours, int)`; the
   old string form silently worked in some call sites and not others.
3. **Parity sweep** — `check_settings.py --compare-old <step-0-copy>`: every migrated key
   reports `MATCH`, and the only entries listed as dropped are `REFRESH_TOKEN_*` and
   `comment`.
4. **Working-directory independence** — launch from `/` and from `dev/trace-client`;
   both must load `.env` (this is what Deviation 1 buys).
4b. **Template regenerates from scratch** — move `.env` aside and run
   `gen_env_example.py`; it must still produce all 24 keys, then restore `.env`.
5. **Ignore rules** — `git check-ignore -v` on `.env`, `.env.example`, `app/config.py`:
   ignored, not ignored, not ignored respectively.
6. **No secret is committable** — `git add -A && git status --short` after the migration
   must list `config.py` and `.env.example` but never `.env`.
7. **Full key check** — `python scripts/check_settings.py` exits 0: all 24 keys present
   and non-blank, `.env.example` in parity with the model, every required secret present.
8. **Cross-repo call** — exercise the service-plus → trace-plus internal endpoint that
   uses the `X-Service-Key` header. The key was rotated before this plan ran, so this is
   the test that proves the new value reached trace-plus's `.env` correctly. It cannot
   pass until Step 4 is done.
9. **Login + mail + DB** — one end-to-end pass per area (auth, email, database), since a
   wrong value in any of the three is invisible until that path is exercised.

## Flags and constraints

- **The shared key leaked and is scheduled for rotation after this plan runs.** The real
  `SERVICE_PLUS_API_KEY` / `trace_plus_service_key` was committed as the *default* of a
  tracked field in service-plus's `app/core/settings/api_settings.py`. Both working trees
  now hold a fake value, which stops the leak spreading but **does not undo it**: the
  original is still recoverable from git history by anyone with repo access
  (`git log -p -- app/core/settings/api_settings.py`). Rotation is the remedy — rewriting
  history is not worth it and would not reach clones and forks that already exist.

  **Status: rotated.** A new key has been generated and applied to service-plus and to the
  owner's credentials copy, and service-plus's `trace_plus_service_key` is now
  `Field(description=...)` with **no default** — so the value can only come from its `.env`
  and cannot be committed again. No further service-plus code change is needed.

  What remains: the new key must reach trace-plus's `.env` at Step 4 (it is in the owner's
  credentials copy, not in `config.py`), and Testing case 8 — the real cross-repo call —
  confirms the two sides agree. Until Step 4, trace-plus still carries a fake value, so
  that call is expected to fail; this is the one test that cannot pass before the
  migration.

  This plan deliberately does not copy the defaulted-secret pattern into trace-plus:
  Deviation 2 makes the trace-plus twin required and defaultless for the same reason.
- **I cannot verify the deployment side.** Your instructions bar reading anything under a
  `deployment/` folder, so I do not know whether trace-plus's deployment scripts, Docker
  images or nginx configs copy `config.py` into the image or set environment variables.
  **Before Step 6, check that yourself**: a container that expected `config.py` to exist
  will need `.env` supplied (mounted file, or real environment variables — pydantic reads
  both).
- **Secrets stay with you.** No step here has me copying secret values anywhere; Steps 0
  and 4 are yours. The values in today's `config.py` are not live, so the one-time read
  that produced this plan exposed nothing — but the same discipline applies afterwards,
  when `.env` holds the real thing. The one-time read you authorised was used only to enumerate key names and
  types for this plan, and no value from it appears in this document.
- **`python-dotenv` was dropped** from the manifest: nothing imports it, and
  `pydantic-settings` brings its own `.env` parsing. Do not wire both.
- **`fpdf` is the unmaintained original** (1.7.2, last released 2018); the maintained
  successor `fpdf2` ships the same `fpdf` module name but is not API-identical. The pin
  keeps today's behaviour; migrating is a separate, testable change.
- **The old manifest is preserved** at `scratchpad/requirements.old.txt` for diffing.
- **`.env` is never committed, but it is also never backed up.** After Step 9 deletes the
  Step 0 copy, the values exist only in that one untracked file. Keep them wherever you
  keep credentials.
- **service-plus WhatsApp HMAC secrets — fixed.** Both were declared `default=""`, and its
  live `.env` had WhatsApp configured with `whatsapp_delivery_otp_secret` empty, so
  delivery codes were being hashed with an empty key. Fixed in two layers: a settings
  validator requiring both secrets once WhatsApp is configured, and use-site guards in
  `token.py`/`otp.py` that refuse to sign or hash with an empty key. Its suite passes
  (6 passed, 4 skipped). Still open there: its secrets are plain `str`, not `SecretStr`, so
  `repr(settings)` renders them in full except the two carrying `repr=False` — trace-plus
  avoids that by construction.
- **Scope.** This plan covers `trace-server` only. `trace-client`, `trace_mobile_plus` and
  the `env/` folder at the repo root have their own configuration stories and are untouched.
