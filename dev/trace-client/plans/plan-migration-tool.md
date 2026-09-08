# Plan: Migration Tool for trace-plus (`dev/trace-plus-tools/migration-tool`)

**Goal:** a small local GUI that runs an arbitrary SQL script against **every selected BU schema
of every selected client database**, one schema at a time, with a per-schema success/failure
result — modelled on the existing service-plus tool at
`~/projects/service-plus/dev/service-plus-tools/migration-tool`.

**This is a plan only. Nothing is implemented.**
`dev/trace-plus-tools/migration-tool/` already exists and is empty.

---

## Part A — The reference implementation (service-plus)

Read in full before building. Stack: **Python + Streamlit + psycopg3 + python-dotenv**,
run locally with `streamlit run app.py`.

| File | Role |
|---|---|
| `DESIGN.md` | architecture + the reasoning behind each choice (16 KB, worth reading first) |
| `README.md` | setup + usage + "what is Streamlit" background |
| `config.py` | loads `DB_HOST/PORT/USER/PASSWORD` from `.env` into a frozen dataclass; fails fast |
| `models.py` | `ClientDb`, `SchemaTarget`, `MigrationResult` dataclasses |
| `db.py` | `connect`, `test_connection`, `list_client_dbs`, `list_schemas`, `run_sql_in_schema`, `check_sql_in_schema` |
| `app.py` | the whole UI (~400 lines): sidebar Connect + Targets, main panel SQL + Check/Continue + Messages |
| `pages/1_❓_Help.py` | Streamlit auto-registered Help page |
| `.streamlit/config.toml` | `toolbarMode = "minimal"` |
| `.env.example`, `requirements.txt` | committed; `.env` is git-ignored |

Behaviours worth copying verbatim:
- **Dashboard, not a wizard.** Everything always visible; Check/Continue are *disabled* with a
  caption saying what's missing, never hidden. Page never grows — sidebar scrolls independently,
  SQL box and Messages box are fixed-height with internal scroll.
- **Per-schema transaction.** One `BEGIN`/`COMMIT`/`ROLLBACK` wrapping the entire script per
  schema. A failure rolls that schema back and the batch **continues** to the next schema.
- **Check = real dry-run.** Same code path, `commit=False`, always `ROLLBACK`. Not a
  self-reported confirmation checkbox.
- **Stale-check invalidation.** `_current_check_key()` = (sql_text, sorted target tuple).
  Changing SQL or targets after a successful Check re-disables Continue.
- **Sequential execution** with live per-schema results rendered inside the loop.
- **`_execute_in_schema` never raises** — every outcome is a returned `MigrationResult`.
- Two Streamlit traps already solved there, do not re-discover them:
  - a checkbox with an existing `key` **ignores `value=`** on rerun — "select all" must write
    into `st.session_state` from an `on_change` callback (`_apply_select_all`);
  - `st.download_button` needs an explicit unique `key` when re-rendered in a loop.
- `st.rerun()` after Check, because widgets already drawn this run won't re-evaluate `disabled=`.

---

## Part B — How trace-plus differs (this is the substance of the work)

The service-plus tool cannot be copy-pasted. The tenancy model is genuinely different, and three
of the differences are load-bearing.

### B1. Control database and client table
| | service-plus | **trace-plus** |
|---|---|---|
| Control DB | `service_plus_client` | **`traceAuth`** (`trace-server/app/config.py:20`, `Config.DB_NAME`) |
| Client table | `public.client(id, name, db_name, is_active)` | **`"ClientM"(id, clientCode, clientName, isActive, isExternalDb, dbName, dbParams)`** |
| Listing query | `PublicSql.GET_ACTIVE_CLIENT_DBS` | `SqlSecurity.get_all_clients` / `get_client_details_on_id` (`sql_security.py:181, 271`) |

Note the **quoted camelCase identifiers** throughout trace-plus — every column reference needs
double quotes.

### B2. ⚠️ Per-client connection parameters — the big one
service-plus reaches **every** tenant DB on one shared host/port/user/password; only `dbname`
changes. **trace-plus does not.** `ClientM.isExternalDb` / `ClientM.dbParams` mean a client's
database can live on an entirely different server with different credentials.

`dbParams` is a **Fernet-encrypted JSON string** (`Config.CRYPTO_KEY`, decrypted by
`app/core/utils.py:16 decrypt()`). The authoritative resolution logic is
`app/graphql/db/psycopg_async_helper.py:26 get_conn_info()`:

```python
db_params = dbParams.copy() if db_params is None else db_params.copy()   # default = Config DB_*
conn = db_params.get('conn', None)
if conn:                       # a second, nested encrypted layer
    conn = decrypt(conn)
    db_params = json.loads(conn)
env = get_env()                                        # APP_ENV, default "development"
if env == "development":
    db_params.pop("ipAddress"); db_params.pop("internalPort")   # → uses host + port
else:
    db_params["host"] = db_params.pop("ipAddress")              # → uses ipAddress + internalPort
    db_params["port"] = db_params.pop("internalPort")
db_params["dbname"] = dbName
```

**The tool must reimplement this resolution, including the nested `conn` key and the env swap.**

### B3. ⚠️ The `APP_ENV` host/port trap
In `development` the connection uses `host`/`port`
(`node150483-trace-link.cloudjiffy.net:11085` — publicly reachable). Otherwise it uses
`ipAddress`/`internalPort` (`192.168.14.20:5432` — **only reachable from inside the hosting
network**). The migration tool runs on an operator's laptop, so it needs the *public* pair —
i.e. the `development` branch — even when operating on production data. Getting this backwards
produces a connection timeout that looks like a credentials problem. Make it an explicit,
labelled radio in the UI ("Public host/port" vs "Internal ipAddress/internalPort"), defaulting
to public, rather than an invisible `APP_ENV` read.

### B4. BU schemas
- A BU schema is created by executing `app/graphql/scripts/accounts.sql` into `public`, then
  `ALTER SCHEMA public RENAME TO <buCode>` (`app/graphql/handlers/create_bu.py:105-120`).
  So **one schema per BU, named exactly `buCode`**.
- **`public` must be excluded** from targets — it is scratch space between BU creations and may
  exist as an empty or half-built leftover. Selecting it would be a real hazard.
- There is **no `security` schema** in trace-plus (that was service-plus's exclusion). Security
  lives in the separate `traceAuth` database. The exclusion set here is
  `{'public', 'information_schema'}` plus `NOT LIKE 'pg\_%' ESCAPE '\'`.
- `traceAuth."BuM"(id, clientId, buCode, buName, isActive)` gives a **human-readable BU name**
  per schema and enables a **drift check** service-plus's tool has no equivalent of:
  - a schema in the client DB with no matching `BuM` row → orphan;
  - a `BuM` row whose schema is missing → provisioning never completed.

### B5. What this replaces today
`trace-server/app/db_update/sql_patch6.sql` — a single accumulating file of hand-applied
patches, tracked by comments:
```
-- Created on 28-09-2025
-- to be added accounts.sql
-- All databases till 28-09-2025 updated with this
ALTER TABLE "AccM" ADD COLUMN IF NOT EXISTS "isHidden" boolean NOT NULL DEFAULT false;
```
That comment *is* the migration history today. The tool makes the apply step repeatable and
visible; keeping that file as the record of what has been applied stays a manual discipline
in v1 (see Step 13 for the optional history table).

### B6. ⚠️ `CREATE INDEX CONCURRENTLY` breaks the per-schema transaction model
`plans/plan.md` (the General Ledger performance plan) needs exactly this tool to roll out
`CREATE INDEX CONCURRENTLY` on `"TranD"("accId")` and `"TranD"("tranHeaderId")` across every
tenant. **`CONCURRENTLY` cannot run inside a transaction block**, so service-plus's
always-`BEGIN`/`COMMIT` design would reject the tool's own first real use case. Likewise a
`ROLLBACK`-based Check is meaningless for it.

This is not an edge case to defer — it is the motivating migration. v1 needs an explicit
**execution-mode** choice (Step 7.4).

### B7. Secrets
`trace-server/app/config.py` hardcodes DB credentials and `CRYPTO_KEY` in a committed file.
**The tool must not import `Config`** — it reads its own `.env`, matching service-plus. Do not
propagate the hardcoded-secrets pattern into a new tool; that is a separate problem to raise
with the user, not to replicate.

### B8. `.gitignore` gap
service-plus's `.gitignore` has `**/.env*` **followed by `!**/.env.example`** (lines 111-112).
trace-plus has `**/.env*` at line 111 **with no negation** — so `.env.example` would be silently
untracked. Fix in Step 3.

---

## Part C — Execution steps

### Step 1 — Scaffold
Create under `dev/trace-plus-tools/migration-tool/` (folder exists, empty):
```
DESIGN.md  README.md  requirements.txt  .env.example
config.py  models.py  db.py  app.py
.streamlit/config.toml
pages/1_❓_Help.py
sql/            # smoke-test + real migration scripts (Step 12)
plans/plan.md   # a copy of this plan, alongside the tool
```

### Step 2 — Dependencies
`requirements.txt`:
```
streamlit>=1.38,<2.0
psycopg[binary]>=3.3,<3.4
python-dotenv>=1.0,<2.0
cryptography>=42.0          # Fernet — needed for ClientM.dbParams (B2); service-plus needs no such dep
```
Local venv: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
System Python is 3.14.4; pin nothing tighter than 3.11+.

### Step 3 — Configuration
1. `.env` (git-ignored) and `.env.example` (committed):
   ```
   DB_HOST=            # public host, e.g. node150483-trace-link.cloudjiffy.net
   DB_PORT=            # public port, e.g. 11085
   DB_USER=
   DB_PASSWORD=
   CRYPTO_KEY=         # Fernet key — required to decrypt ClientM.dbParams for external-DB clients
   ```
   Control database name is **not** in `.env` — it is a UI field defaulting to `traceAuth`,
   so the same install can target a staging control DB (same call service-plus made, §5).
2. **Add `!**/.env.example` immediately after `**/.env*` in trace-plus's root `.gitignore`**
   (B8), or add a local `.gitignore` in the tool folder. Verify with
   `git check-ignore -v dev/trace-plus-tools/migration-tool/.env.example` returning nothing.
3. `config.py`: frozen `DbConnectionSettings(host, port, user, password, crypto_key)` +
   `ConfigError` raised with one clear message listing every missing key.
   `CRYPTO_KEY` is **optional-but-warned**: absent, the tool still works for internal-DB clients
   and must say plainly that external-DB clients cannot be reached.

### Step 4 — `models.py`
```python
@dataclass(frozen=True)
class ClientDb:
    id: int; client_code: str; client_name: str
    db_name: str; is_external_db: bool; db_params: str | None

@dataclass(frozen=True)
class ResolvedConn:              # new vs service-plus — see B2
    host: str; port: int; user: str; password: str; dbname: str
    source: str                  # "shared" | "external" — shown in the UI

@dataclass(frozen=True)
class SchemaTarget:
    client: ClientDb; schema_name: str
    bu_name: str | None          # from traceAuth."BuM" (B4); None = orphan schema
    @property
    def label(self) -> str: ...  # "Client — buName (buCode) @ dbName"

@dataclass(frozen=True)
class MigrationResult:
    target: SchemaTarget; success: bool
    error_message: str | None; duration_seconds: float
    rows_affected: int | None    # useful feedback for DML-style migrations
```

### Step 5 — `db.py`, part 1: connection resolution (the trace-plus-specific core)
1. `resolve_conn(settings, client, db_name, *, use_internal: bool) -> ResolvedConn`
   — a faithful **sync** port of `get_conn_info()` (B2):
   - start from the shared `.env` params;
   - if `client.is_external_db` and `client.db_params`: `decrypt()` it, `json.loads`, and handle
     the **nested `conn` key** (decrypt + parse again);
   - apply the host/port vs ipAddress/internalPort swap from the `use_internal` flag (B3), not
     from an env var;
   - set `dbname`, plus `keepalives=1, keepalives_idle=30`, `connect_timeout=10`.
   Unit-test this function against a known-good encrypted `dbParams` value **before** any UI
   exists — it is the one piece with no service-plus equivalent to copy.
2. `connect(resolved) -> psycopg.Connection`.
3. `test_connection(settings, control_db_name)` — against `traceAuth` only.

### Step 6 — `db.py`, part 2: discovery
1. `list_clients(settings, control_db_name) -> list[ClientDb]`
   ```sql
   SELECT "id","clientCode","clientName","dbName","isExternalDb","dbParams"
   FROM "ClientM" WHERE "isActive" = true AND "dbName" IS NOT NULL
   ORDER BY "clientName"
   ```
   Add a UI toggle to include inactive clients (default off).
2. `list_bus(settings, control_db_name) -> dict[int, dict[str, str]]` — `clientId → {buCode: buName}`
   from `traceAuth."BuM"`, for labels and the drift check (B4).
3. `list_schemas(settings, client, *, use_internal) -> list[str]`
   ```sql
   SELECT schema_name FROM information_schema.schemata
   WHERE schema_name NOT IN ('public','information_schema')
     AND schema_name NOT LIKE 'pg\_%' ESCAPE '\'
   ORDER BY schema_name
   ```
4. **Per-client failure isolation** (new vs service-plus, forced by B2): one unreachable
   external client must not break the whole Targets list — catch, show that client as
   "unreachable: <error>" with 0 schemas, and carry on. service-plus's `st.warning` inside the
   loop is the right shape; the failure is just much likelier here.

### Step 7 — `db.py`, part 3: execution
1. `_execute_in_schema(settings, target, sql_text, *, commit, use_internal, autocommit) -> MigrationResult`
   — never raises; every outcome is a returned `MigrationResult`.
2. Transactional path (default): `SET search_path TO <ident>` via `psycopg.sql.Identifier`,
   execute the whole script, then `COMMIT` (run) or `ROLLBACK` (check).
3. `run_sql_in_schema` = `commit=True`; `check_sql_in_schema` = `commit=False`.
4. **Autocommit path (new — required by B6).** When the operator picks
   **"No transaction (autocommit)"**, open the connection with `autocommit=True` and execute
   without a wrapping transaction, so `CREATE INDEX CONCURRENTLY`, `VACUUM`, `ALTER TYPE ... ADD
   VALUE` etc. work. In this mode:
   - **Check is disabled** and must say so — there is no rollback to dry-run with. Offer instead
     a "run on one schema first" workflow;
   - the mode selector carries a prominent warning that a mid-script failure leaves that schema
     **partially applied**;
   - default is transactional; autocommit is a deliberate opt-in, never sticky across a Reset.
5. Multi-statement scripts: psycopg3 uses the simple-query protocol when `execute()` is called
   with no parameters, so a multi-statement script works. Never pass `sqlArgs` — the SQL is
   verbatim operator input.
6. Capture `cur.rowcount` into `MigrationResult.rows_affected`.
7. Per-target **timeout**: `SET LOCAL statement_timeout` (transactional) / `SET statement_timeout`
   (autocommit), operator-settable, default e.g. 5 min, `0` = unlimited. A tenant-wide DDL run
   that hangs on one lock must not hang the whole batch invisibly.

### Step 8 — `app.py` (UI)
Port service-plus's `app.py` structure, then adapt:

**Sidebar**
- **Reset** (`on_click` clearing all of `st.session_state`, dynamic checkbox keys included).
- **Connect**: control DB name (default `traceAuth`), **Network radio: Public host/port ▸
  default | Internal ipAddress/internalPort** (B3), "Test Connection". On success populate
  clients + the `BuM` map.
- **Targets**: one expander per client — header shows `clientName · clientCode · N schema(s)`
  and an `⚠ external DB` badge when `isExternalDb`. Per-schema checkboxes labelled
  `buCode — buName`, with `⚠ no BuM row` on orphans (B4). Per-client "select all",
  global "select all everywhere", running "N schemas across M clients" count.
  **Copy service-plus's `on_change`-callback pattern exactly** — the `value=`-is-ignored trap.

**Main panel**
- SQL: "Paste SQL" / "Load .sql file" toggle + Clear (bump `uploader_version` to reset the
  uploader), fixed 260px box.
- **Execution mode** radio: `One transaction per schema (default)` / `No transaction
  (autocommit) — required for CREATE INDEX CONCURRENTLY`, plus the statement-timeout field.
- **Check SQL** — dry-run against every target; disabled (with an explanatory caption) in
  autocommit mode.
- **Continue — N schema(s)** — enabled only on a fresh successful check; reuse
  `_current_check_key()` staleness, extended to include execution mode and network mode.
- **Messages / Results** — fixed-height container, re-rendered inside the run loop for live
  progress, CSV download (explicit unique `key=`), success/failure counts.
- `st.rerun()` after Check.

### Step 9 — Help page and inline help
`pages/1_❓_Help.py`, adapting service-plus's structure to trace-plus content:
what the tool is/isn't; the `traceAuth → ClientM.dbName → buCode schema` model (B1/B4);
internal vs external client databases and what `CRYPTO_KEY` is for (B2); public vs internal
network mode and the symptom when it's wrong (B3); what a per-schema transaction guarantees and
what autocommit mode gives up (B6); troubleshooting — bad credentials, control DB unreachable,
one client unreachable while others work, `CRYPTO_KEY` missing/wrong, a schema missing an object
an older tenant never got. Plus `help=` tooltips on every non-obvious control.

### Step 10 — Docs and Streamlit config
1. `.streamlit/config.toml` — `[client] toolbarMode = "minimal"` (copy as-is).
2. `DESIGN.md` — trace-plus's own version: Part B of this plan is its backbone.
3. `README.md` — setup, the Streamlit background section (copy), usage, and an explicit
   **"first run on one throwaway schema"** instruction.

### Step 11 — Verification (before any real migration)
1. `resolve_conn` unit test: internal client, external client, external client with the nested
   `conn` key, missing `CRYPTO_KEY`, both network modes.
2. Connect to `traceAuth`; confirm the client list matches `ClientM` and BU labels match `BuM`.
3. Confirm `public` never appears as a selectable target (B4).
4. Simulate an unreachable client (bogus port) → that client degrades, others still list (Step 6.4).
5. Smoke-test SQL in `sql/`, mirroring service-plus's `plans/plan.md`:
   - `create_test_probe.sql` — `CREATE TABLE IF NOT EXISTS migration_tool_test_probe ...` +
     seed rows `ON CONFLICT DO NOTHING` (idempotent, unqualified — `search_path` resolves it);
   - `drop_test_probe.sql` — `DROP TABLE IF EXISTS migration_tool_test_probe;`
   Run both against **one throwaway schema** first, then a whole client.
6. Deliberate-failure test: a script with a syntax error → that schema ❌ with the real Postgres
   message, the batch continues, and the schema is verifiably unchanged.
7. Stale-check test: Check, then edit the SQL / change targets / change mode → Continue disables
   and the warning appears.

### Step 12 — First real use
Roll out the General Ledger indexes from `plans/plan.md` Step 2:
`"TranD"("tranHeaderId")`, `"TranD"("accId")`, `"TranH"("finYearId","branchId","tranDate")`,
`"AccOpBal"("accId","finYearId","branchId")` — as
`CREATE INDEX CONCURRENTLY IF NOT EXISTS`, in **autocommit mode** (B6), followed by a separate
`ANALYZE "TranD"; ANALYZE "TranH";` pass. Run off-peak; one throwaway schema first, then one
client, then the rest. Keep `app/db_update/sql_patch6.sql` updated with the applied-on date, and
add the same DDL to `app/graphql/scripts/accounts.sql` so new BUs get it.

### Step 13 — Explicitly out of scope for v1
- **Migration history** — the tool reports only the current run. Tracking stays the
  `sql_patch6.sql` comment convention (B5). *Recommended as v1.1:* an optional
  `_migration_history(name, applied_at, checksum)` table per schema with a "skip schemas already
  at this name" checkbox — a bigger win here than in service-plus, because trace-plus's current
  tracking is a hand-edited comment.
- Parallel execution across schemas; automatic ordering/dependencies; up/down scripts.
- Structured seed-data forms — seed data is just SQL.
- Authentication. The tool is run locally by a trusted operator holding the credentials
  already; the same trust level as `psql`. Revisit only if it is ever hosted.
- Writing to `ClientM`/`BuM` — the tool reads the control DB and never modifies it.

---

## Part D — Risk register

| Risk | Mitigation |
|---|---|
| Wrong network mode → looks like a credentials failure | Explicit labelled radio (B3), default public, and a Help entry naming the symptom |
| External client's `dbParams` won't decrypt | `CRYPTO_KEY` validated at startup; per-client failure isolation (Step 6.4); clear message naming that client |
| `CONCURRENTLY` rejected inside a transaction | Autocommit mode (Step 7.4) — the motivating case, not an afterthought |
| Autocommit run fails halfway → schema partially applied | Prominent warning, Check disabled with explanation, "one schema first" guidance, idempotent-SQL advice (`IF NOT EXISTS`) |
| Accidental run against every tenant | Check gate, fresh-check-required Continue, no sticky "select all" across Reset, throwaway-schema-first in README |
| `public` selected as a target | Excluded in SQL, verified in Step 11.3 |
| A long DDL holds a lock and hangs the batch | Per-target `statement_timeout` (Step 7.7) |
| No undo on a committed schema | Stated in README and Help; Check is the only gate |
| Credentials leaking into the repo | `.env` git-ignored + `!**/.env.example` negation (Step 3.2); never import `Config` (B7) |

---

## Part E — Open questions for the user
1. **Location of this plan.** Written to `trace-client/plans/` per the trace-client `CLAUDE.md`
   convention. Should it instead live at
   `dev/trace-plus-tools/migration-tool/plans/plan.md`, matching service-plus's layout?
2. **`CRYPTO_KEY` in the tool's `.env`.** Required to reach external-DB clients. Are there any
   external-DB clients in production today? If none, this can be deferred and the tool ships
   shared-connection-only, much simpler.
3. **Migration history table** (Step 13) — v1.1, or leave tracking as the `sql_patch6.sql`
   comment convention?
4. **Inactive clients** — hide entirely, or show behind an "include inactive" toggle?
