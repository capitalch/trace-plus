# trace-plus: schema & SQL assessment, and a staged hardening plan

## Context

You asked two questions: is the trace-server database schema and SQL overly complex and
ill-advised, and if you changed it to follow best practices, would migrating the data be hard.

This document answers both, then lays out what I recommend doing. It is grounded in a full
read of `app/graphql/scripts/accounts.sql` (2,534 lines, 30 tables), the 138 hand-written SQL
query constants in `app/graphql/db/sql_accounts.py` (4,743 lines) and `sql_security.py`,
the execution layer in `psycopg_async_helper.py`, and a coupling survey across trace-server,
trace-client and trace_mobile_plus.

**Your stated position:** roughly 6-50 BU schemas live in production; the pain is SQL
maintainability and data-integrity risk, and you are weighing a rewrite; you want additive
work now with renames planned separately for later.

---

## Answer 1 — Is it overly complex?

**The data model is not the problem, and I would not redesign it.**

A single `TranH`/`TranD` journal discriminated by `tranTypeId`, a self-referencing `AccM`
chart of accounts, `Ext*` tables extending `AccM`/`TranD`, and separate opening-balance
tables is a recognizable, defensible double-entry accounting design. It is not
over-engineered. A rewrite would spend a large budget to arrive somewhere structurally
similar, while putting real ledger data at risk.

**What is actually wrong is a set of missing things, not wrong things:**

| Finding | Evidence |
|---|---|
| **Zero CHECK constraints in the entire schema** | verified: `grep -c -i "CHECK ("` on `accounts.sql` returns 0 |
| `dc character(1)` — the debit/credit flag the whole ledger rests on — accepts any character | `TranD:1191`, `AccOpBal:351`, `BankOpBal:459`, `StockJournal:1132` |
| `AccM.accLeaf` column DEFAULT is lowercase `'n'`; all seeded data uses uppercase `'N'`/`'Y'` | `accounts.sql:311` |
| **27 of 36 foreign keys (~75%) have no usable index** | only 6 `CREATE INDEX` statements exist in the whole schema |
| `TranH.autoRefNo` (the voucher number) has no UNIQUE constraint | uniqueness relies on app logic via `TranCounter`, which itself has no FKs at all |
| **Three FKs ship as `NOT VALID`** — unenforced in every BU ever created | `BankOpBal_accId_fkey` `:2279`, `BankOpBal_finYearId_fkey` `:2287`, `BranchTransfer_tranHeaderId_fkey` `:2319` |
| `TranD.id`/`TranH.id` are `integer` (max 2.1B), not `bigint`, on a perpetually-growing ledger | `accounts.sql:1206`, `1252` |
| Money/quantity types inconsistent for the same concept | `BankOpBal.amount numeric(14,2)` vs `(12,2)` elsewhere; `StockJournal.price numeric(12,0)` — no paise; `hsn` typed 4 different ways across 4 tables; `qty` fractional on `ProductOpBal` but integer on the three tables that consume it |
| Two identity styles coexist | plain sequences on most tables, `GENERATED ALWAYS AS IDENTITY` on 7 |

**The template has drifted from the fleet, in both directions.** `app/db_update/sql_patch6.sql`
records that `AccM."isHidden"` was added and `ExtBusinessContactsAccM.email` was made nullable.
Neither is in `accounts.sql` (verified: 0 hits for `isHidden`; `email text NOT NULL` still at
line 737). So **a business unit created today is provisioned missing changes that existing
tenants already have.** Separately, `TranTypeM` seed data stops at id 11 — a new BU gets the
`BranchTransfer` table, its FKs, its sequence and its audit trigger, but not the transaction-type
row needed to actually raise a branch-transfer voucher.

**The SQL layer is the weaker half.** Two idioms account for most of it:
- The `with "x" as (values (%(x)s::int))` header plus `(TABLE "x")` references appears in 45 of
  94 queries in `sql_accounts.py` (326 `(TABLE "x")` occurrences). It buys nothing over writing
  `%(x)s` directly. Its origin is visible in the source: nearly every query has a commented-out
  literal twin (`--with "branchId" as (values (1::int))`) kept in sync by hand for debugging.
- `COALESCE((TABLE "x"), col) = col`, used 39 times to make a filter optional, is
  **non-sargable** — Postgres cannot reduce it to an index-friendly equality, so it must be
  evaluated per row. This compounds the missing indexes rather than merely coexisting with them.

Duplication is real: the stock-movement rollup formula is hand-copied across at least four
queries (`get_sales_report`, `get_stock_summary_report`, `get_stock_trans_report`,
`get_business_health`); `get_sales_report` (324 lines) and `mobile_get_sales_report` (287 lines)
independently reimplement the same report with different techniques; there are 10 near-identical
`does_X_exist` queries. `sql_security.py:610-694` contains a dead `allSqls` dict with 27
identical CTEs unioned together, referenced nowhere.

**Verdict:** unconventional and unfinished rather than overly complex. It needs *completing*,
not replacing.

---

## Answer 2 — Would migrating the data be hard?

**No. Data migration is not the hard part, and that reframes the whole question.**

Almost nothing worth changing requires moving data:
- Adding indexes: no data movement, online via `CREATE INDEX CONCURRENTLY`.
- Adding CHECK/UNIQUE constraints: no data movement (`NOT VALID` then `VALIDATE`).
- Widening `integer` → `bigint`: rewrites the table but is mechanical and reversible in plan.
- Fixing template drift: pure DDL.
- Renaming a column or table in Postgres: **metadata-only and instant**, regardless of table size.

**The hard part is the application, not the database.** There is:
- **no ORM and no schema abstraction** — confirmed, zero SQLAlchemy/Alembic/Prisma/etc.;
- **no migration framework** — the entire history is dated comments in one 12-line file;
- **no test suite anywhere** — no pytest/jest/vitest/cypress in any of the three repos; the
  Flutter app's only test is the unmodified starter template.

And column names travel raw from the browser to Postgres. `Utils.doGenericUpdate` is called
**43 times across 34 files**, sending `xData` objects whose *keys become SQL column names*.
Add 377 Syncfusion `field:` bindings across 25 files, 76 files importing `AllTables`, and 108
importing `SqlIdsMap`. A rename has a blast radius well over 100 files with zero regression
coverage.

So: **the database migration is trivial; the client migration is the risk.** That is precisely
why "additive now, renames later behind a compatibility layer" is the right call.

One encouraging find: `lab/pg-to-ts/` shows someone already ran `pg-to-ts generate` against this
database and produced typed TypeScript interfaces for all 32 tables. It is stale (missing
`isHidden`) and nothing imports it — but it proves the schema→types path works here and costs
one command.

---

## Two findings that outrank everything above

These are not schema-design issues, but they surfaced during the review and are more urgent
than anything else in this document.

**1. Cross-tenant access is not enforced.** `app/security/security_utils.py:76-88` — `validate_token`
decodes the JWT purely to check signature and expiry, and **discards the decoded payload**. It
never compares the token's client or BU against the request. Meanwhile `dbName` (which selects
the target database) and `buCode` (which becomes the `search_path` schema) both come from the
request body, via `graphql_helper.py` → `exec_sql`. Any authenticated user can name another
tenant's database and schema.

**2. Client-supplied identifiers are interpolated into SQL.** In `psycopg_async_helper.py`:
- `get_insert_sql:348-369` — `tableName` and every column name come from `xData.keys()`,
  f-string-interpolated with only a bare double-quote wrap.
- `get_update_sql:372-387` — same, **plus** `xData['id']` spliced directly into
  `WHERE id = {xData['id']}` unparameterized, in a statement that already binds every other value.
- `process_deleted_ids:390-401` — `deletedIds` elements `str()`-concatenated into `IN (...)`.
- `create_bu.py:118` — `f"ALTER SCHEMA public RENAME TO {bu_code};"`, not even quoted.

Values are bound correctly throughout. Identifiers and these particular ids are not.

---

## Recommended plan

Ordered by risk-adjusted value. Phases 0-1 gate everything else.

### Phase 0 — Close the two security gaps
*Not additive-schema work, but it should not wait behind it.*

1. Make `validate_token` return its decoded claims, and add an authorization check in the
   GraphQL helpers that the token's client owns the requested `dbName` and that its user is
   linked to the requested `buCode` (`traceAuth."BuM"`/`"UserBuX"` already model this).
2. Replace identifier interpolation with `psycopg.sql.Identifier()` in `get_insert_sql`,
   `get_update_sql`, `process_deleted_ids`, and the `SET search_path` calls; bind `xData['id']`
   and `deletedIds` as parameters.
3. Add a server-side allow-list of writable tables/columns for the generic CRUD path, sourced
   from `information_schema.columns` at startup.
4. Constrain `sqlId` — `graphql_helper.py:267` does `getattr(sqlQueryObject, sqlId)`, letting a
   caller run any query constant by name. Restrict to an explicit read allow-list.

*Files: `app/security/security_utils.py`, `app/graphql/graphql_helper.py`,
`app/graphql/db/psycopg_async_helper.py`, `app/graphql/handlers/create_bu.py`.*

### Phase 1 — Build the delivery vehicle and learn the fleet's true state
Nothing structural can be applied to 6-50 schemas by hand.

1. Build the migration tool per `trace-client/plans/plan-migration-tool.md`. It **must** ship
   with autocommit mode — `CREATE INDEX CONCURRENTLY` cannot run in a transaction, and that is
   the first real migration.
2. Run a **read-only drift audit** across every schema before changing anything, and diff the
   results against `accounts.sql` and against each other. The fleet is known to have diverged;
   assume nothing is uniform.
3. Add a per-schema **migration history table** so this never returns to being a comment in a
   `.sql` file.

### Phase 2 — Data-integrity pre-flight, then constraints
Every CHECK we want may already be violated by live rows. Validate first, fix data, then
constrain — `NOT VALID` followed by `VALIDATE CONSTRAINT` to avoid long exclusive locks.
Priority order: `dc` ∈ ('D','C') on all four tables; `accType`; `accLeaf` (including the
lowercase-default mismatch); `TranH.autoRefNo` uniqueness.

### Phase 3 — Index rollout
The missing FK indexes, `CONCURRENTLY`, highest-value first: `TranD(tranHeaderId)`,
`TranD(accId)`, then `SalePurchaseDetails(tranDetailsId)`, `ExtGstTranD(tranDetailsId)`,
`StockJournal(tranHeaderId)`, `BranchTransfer(tranHeaderId)`, `AccM(parentId)`,
`TranH(contactsId)`, and a `TranH(finYearId, branchId, tranDate)` to serve the filters the
existing composite index cannot. This also resolves the General Ledger timeouts documented in
`trace-client/plans/plan.md`.

### Phase 4 — Template reconciliation
Get `accounts.sql` back in sync so new BUs match patched ones, without re-importing a tenant's
seed data (the existing `accounts1.sql` appears to be a dump of a real tenant, which is how
demo rows leaked into a template before). Fold in `isHidden`, the `email` nullability change,
and the missing `TranTypeM` id-12 row.

### Phase 5 — SQL layer maintainability
Incremental, no schema change:
1. Replace `COALESCE((TABLE "x"), col) = col` with a sargable form. Highest performance payoff
   per line changed.
2. Retire the `(values(...))`/`(TABLE "x")` idiom in favour of plain `%(x)s`, query by query,
   as each is next touched. Do not do a big-bang rewrite of all 94.
3. Extract the stock-movement rollup into one shared SQL function so the four hand-copies stop
   drifting.
4. Delete the dead `allSqls` block in `sql_security.py:610-694`.
5. Add `LIMIT`/keyset pagination to the unbounded report queries.

### Phase 6 — Design the rename path (design only, do not execute yet)
When you do want idiomatic snake_case, the mechanism that makes it survivable is a
**compatibility layer**: rename the physical tables, then create updatable views under the old
camelCase names so the 100+ client touchpoints keep working, and migrate call sites in batches
behind that. Revive `lab/pg-to-ts/` to generate typed TS interfaces and wire them into
`database-tables-map.ts`/`xData` call sites, so the next rename is caught at compile time rather
than in production. **Get a smoke-test suite in place before this phase begins** — with zero
tests today, a rename is otherwise unverifiable.

---

## Verification

- **Phase 0:** attempt a cross-tenant read with a valid token for another client — must be
  rejected. Attempt a generic update naming a non-allow-listed table/column — must be rejected.
- **Phase 1:** the drift audit runs read-only against every schema and produces a comparable
  fingerprint; the migration tool applies a no-op idempotent script to one throwaway schema
  first, then a whole client.
- **Phase 2:** each constraint's pre-flight query returns zero violations before it is applied;
  after `VALIDATE`, inserting a bad `dc` value fails.
- **Phase 3:** `EXPLAIN (ANALYZE, BUFFERS)` on the General Ledger query for the largest account
  before and after, against the baseline in `trace-client/plans/plan.md`; check
  `pg_stat_user_indexes` shows the new indexes being used; check for `INVALID` indexes left by
  failed `CONCURRENTLY` runs.
- **Phase 4:** provision a fresh BU from the updated `accounts.sql` into a scratch database and
  diff its fingerprint against a known-good production schema — they should match.
- **Phase 5:** each rewritten query's output must be byte-identical to the original for several
  accounts and date ranges before it replaces it.

---

## Explicitly not doing

- No schema rewrite. The model is sound; the cost/benefit is not there.
- No renames in this plan — Phase 6 is design only.
- No changes to the client in Phases 0-5.
- No ORM adoption. Typed generated interfaces (`pg-to-ts`) give most of the safety at a
  fraction of the disruption.


---

# Appendix — execution mechanics

Verified additions discovered while working these out:

- **Three foreign keys ship as `NOT VALID` in the template itself** — `BankOpBal_accId_fkey`
  (`accounts.sql:2279`), `BankOpBal_finYearId_fkey` (`:2287`), `BranchTransfer_tranHeaderId_fkey`
  (`:2319`). **Every BU ever created has these three FKs unenforced**, so orphan rows may already
  exist. No new DDL is needed — only `VALIDATE CONSTRAINT`, after a pre-flight count.
- **`accounts.sql`'s own seed data is clean.** `AccM` rows 1-30 all use uppercase `'N'`/`'Y'`
  (`:1442+`). The lowercase `'n'` problem therefore comes *only* from the column DEFAULT firing on
  rows the application inserted without setting `accLeaf` — a bounded, fixable population.
- **`accounts1.sql` is dead and is the real contamination risk.** Nothing references it (verified);
  `create_bu.py:109` only ever opens `accounts.sql`. But it is a `pg_dump` of a real tenant — it
  contains a live `Settings` menu blob, a `'head office'` branch row, a `PosM 'sample1'` row — sitting
  in version control. Retiring it is zero-risk repo hygiene, and worth doing on its own merits.

## A. Fleet drift audit (read-only, no locks, safe against production any time)

Run per schema through the migration tool's connection loop, capture client-side, diff client-side.
Cross-schema SQL diffing is not viable because clients can be on separate hosts (`ClientM.isExternalDb`).

```sql
-- Columns: type, nullability, default
SELECT table_name, column_name, ordinal_position, data_type, udt_name,
       character_maximum_length, numeric_precision, numeric_scale, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = current_schema()
ORDER BY table_name, ordinal_position;

-- Constraints WITH definition text and validity — this is what catches the NOT VALID FKs
SELECT conrelid::regclass::text AS table_name, conname, contype, convalidated,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
ORDER BY table_name, conname;

-- Indexes including validity — catches INVALID leftovers from interrupted CONCURRENTLY builds
SELECT t.relname AS table_name, i.relname AS index_name,
       ix.indisunique, ix.indisvalid, ix.indisready, pg_get_indexdef(ix.indexrelid) AS index_def
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class t ON t.oid = ix.indrelid
WHERE t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
ORDER BY table_name, index_name;

-- Function bodies — catches audit_function()/get_stock_on_date() drift between tenants
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
ORDER BY p.proname;
```

Reduce each schema to one comparable hash so 6-50 schemas collapse into a few buckets:

```sql
SELECT md5(string_agg(line, E'\n' ORDER BY line)) AS schema_fingerprint
FROM (
  SELECT 'COL|'||table_name||'|'||column_name||'|'||data_type||'|'||is_nullable||'|'||coalesce(column_default,'') AS line
  FROM information_schema.columns WHERE table_schema = current_schema()
  UNION ALL
  SELECT 'CON|'||conrelid::regclass::text||'|'||conname||'|'||contype||'|'||convalidated||'|'||pg_get_constraintdef(oid)
  FROM pg_constraint WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
  UNION ALL
  SELECT 'IDX|'||indexrelid::regclass::text||'|'||indisvalid||'|'||pg_get_indexdef(indexrelid)
  FROM pg_index WHERE indrelid IN (SELECT oid FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema()))
  UNION ALL
  SELECT 'FUNC|'||proname||'|'||pg_get_functiondef(oid)
  FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema())
) s;
```

**Procedure:** build a gold reference by running `accounts.sql` into a scratch schema and
fingerprinting it; fingerprint every real schema; bucket by hash (identical hash = no work needed);
diff each distinct non-gold bucket against gold as a set difference. Keep the raw per-schema dumps —
the migration-history table records what was *run*, not what is *there*.

## B. Data-quality pre-flight (read-only except where flagged)

Run per schema before that schema's constraint DDL. **Any query returning > 0 removes that schema
from the wave.** Never make a constraint pass by loosening it.

```sql
-- dc flags — all four tables
SELECT dc, count(*) FROM "TranD" GROUP BY dc;   -- repeat for AccOpBal, BankOpBal, StockJournal
SELECT count(*) FROM "TranD" WHERE dc NOT IN ('D','C');

-- accType
SELECT count(*) FROM "AccM" WHERE "accType" NOT IN ('A','L','I','E');

-- accLeaf: separate the known-bad default from genuinely unexpected values
SELECT count(*) FROM "AccM" WHERE "accLeaf" = 'n';                    -- expected: some
SELECT count(*) FROM "AccM" WHERE "accLeaf" NOT IN ('Y','N','S','n'); -- expected: zero

-- autoRefNo: test BOTH scopes, you don't yet know which the app guarantees
SELECT "autoRefNo", count(*) FROM "TranH" GROUP BY "autoRefNo" HAVING count(*) > 1;
SELECT "branchId","finYearId","tranTypeId","autoRefNo", count(*) FROM "TranH"
GROUP BY "branchId","finYearId","tranTypeId","autoRefNo" HAVING count(*) > 1;

-- the three already-NOT VALID FKs: what would fail VALIDATE?
SELECT count(*) FROM "BankOpBal" b LEFT JOIN "AccM" a ON a.id = b."accId"
  WHERE b."accId" IS NOT NULL AND a.id IS NULL;
SELECT count(*) FROM "BankOpBal" b LEFT JOIN "FinYearM" f ON f.id = b."finYearId"
  WHERE b."finYearId" IS NOT NULL AND f.id IS NULL;
SELECT count(*) FROM "BranchTransfer" bt LEFT JOIN "TranH" h ON h.id = bt."tranHeaderId"
  WHERE bt."tranHeaderId" IS NOT NULL AND h.id IS NULL;
```

Duplicate voucher numbers, if found, are a **business decision** (renumber vs. tag-and-defer), not a
silent fix. Same for stray `dc` values — inspect and correct row by row, never bulk-coerce a ledger.

**The one data-mutating step in this entire plan** — snapshot first, run per schema, verify immediately:

```sql
-- snapshot before: SELECT id, "accLeaf" FROM "AccM" WHERE "accLeaf" = 'n';
BEGIN;
UPDATE "AccM" SET "accLeaf" = 'N' WHERE "accLeaf" = 'n';
ALTER TABLE "AccM" ALTER COLUMN "accLeaf" SET DEFAULT 'N';
COMMIT;
-- verify after: SELECT count(*) FROM "AccM" WHERE "accLeaf" = 'n';  -- must be 0
```

## C. Constraint adoption — lock levels

| Operation | Lock | Scans table | Blocks reads/writes | In a transaction? |
|---|---|---|---|---|
| `ADD CONSTRAINT ... CHECK ... NOT VALID` | `ACCESS EXCLUSIVE`, brief | No | Briefly | Yes |
| `VALIDATE CONSTRAINT` | `SHARE UPDATE EXCLUSIVE` | Yes, full | **No** | Yes |
| `ADD CONSTRAINT ... UNIQUE USING INDEX` | `ACCESS EXCLUSIVE`, brief | No | Briefly | Yes |
| `CREATE [UNIQUE] INDEX CONCURRENTLY` | `SHARE UPDATE EXCLUSIVE` | Yes, twice | **No** | **No — must be outside** |

Do every `ADD ... NOT VALID` in one transaction per schema (all catalog-only, fast), commit, then run
each `VALIDATE` as its own statement — no reason to hold a transaction open across `TranD`'s full scan.

```sql
-- seed row (idempotent)
INSERT INTO "TranTypeM" (id, "tranType", "tranCode")
SELECT 12, 'Branch transfer', 'BRT'
WHERE NOT EXISTS (SELECT 1 FROM "TranTypeM" WHERE id = 12);

-- CHECKs
ALTER TABLE "AccM"         ADD CONSTRAINT "accM_accLeaf_chk"     CHECK ("accLeaf" IN ('Y','N','S')) NOT VALID;
ALTER TABLE "AccM"         ADD CONSTRAINT "accM_accType_chk"     CHECK ("accType" IN ('A','L','I','E')) NOT VALID;
ALTER TABLE "TranD"        ADD CONSTRAINT "tranD_dc_chk"         CHECK (dc IN ('D','C')) NOT VALID;
ALTER TABLE "AccOpBal"     ADD CONSTRAINT "accOpBal_dc_chk"      CHECK (dc IN ('D','C')) NOT VALID;
ALTER TABLE "BankOpBal"    ADD CONSTRAINT "bankOpBal_dc_chk"     CHECK (dc IN ('D','C')) NOT VALID;
ALTER TABLE "StockJournal" ADD CONSTRAINT "stockJournal_dc_chk"  CHECK (dc IN ('D','C')) NOT VALID;
-- then, each as its own statement:
ALTER TABLE "AccM" VALIDATE CONSTRAINT "accM_accLeaf_chk";   -- etc. for each

-- the three FKs that have shipped unenforced since day one
ALTER TABLE "BankOpBal"      VALIDATE CONSTRAINT "BankOpBal_accId_fkey";
ALTER TABLE "BankOpBal"      VALIDATE CONSTRAINT "BankOpBal_finYearId_fkey";
ALTER TABLE "BranchTransfer" VALIDATE CONSTRAINT "BranchTransfer_tranHeaderId_fkey";

-- voucher-number uniqueness: build the index out-of-band, attach it fast
--   (autocommit, outside any transaction)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "tranH_branch_finyear_type_autoRefNo_uidx"
    ON "TranH" ("branchId","finYearId","tranTypeId","autoRefNo");
--   (back in a transaction — metadata-only attach)
ALTER TABLE "TranH" ADD CONSTRAINT "tranH_branch_finyear_type_autoRefNo_uk"
    UNIQUE USING INDEX "tranH_branch_finyear_type_autoRefNo_uidx";

-- TranCounter currently has NO foreign keys at all — purely additive
ALTER TABLE "TranCounter" ADD CONSTRAINT "tranCounter_finYearId_fkey"  FOREIGN KEY ("finYearId")  REFERENCES "FinYearM"(id)  NOT VALID;
ALTER TABLE "TranCounter" ADD CONSTRAINT "tranCounter_branchId_fkey"   FOREIGN KEY ("branchId")   REFERENCES "BranchM"(id)   NOT VALID;
ALTER TABLE "TranCounter" ADD CONSTRAINT "tranCounter_tranTypeId_fkey" FOREIGN KEY ("tranTypeId") REFERENCES "TranTypeM"(id) NOT VALID;
```

**Deferred to a maintenance window, not part of this additive phase:** the type inconsistencies
(`BankOpBal.amount numeric(14,2)`, `StockJournal.price numeric(12,0)`, the four `hsn` types, the
`qty` integer/numeric split). `ALTER COLUMN TYPE` takes `ACCESS EXCLUSIVE` and rewrites the table
even for a lossless widening — it does not meet the online bar this phase is scoped to.

## D. Index rollout (autocommit mode required)

Tier 1 first, then re-measure before continuing — Tier 1 alone should resolve the General Ledger
timeouts.

```sql
-- Tier 1: the General Ledger fix
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tranD_accId"        ON "TranD" ("accId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tranD_tranHeaderId" ON "TranD" ("tranHeaderId");

-- Tier 2: line-detail tables joined off TranD in every GL/GST report
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_salePurchaseDetails_tranDetailsId" ON "SalePurchaseDetails" ("tranDetailsId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_extGstTranD_tranDetailsId"         ON "ExtGstTranD" ("tranDetailsId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_stockJournal_tranHeaderId"         ON "StockJournal" ("tranHeaderId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_branchTransfer_tranHeaderId"       ON "BranchTransfer" ("tranHeaderId");

-- Tier 3: TranH FKs unusable because non-leading in ("branchId","tranTypeId","finYearId")
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tranH_finYearId"  ON "TranH" ("finYearId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tranH_tranTypeId" ON "TranH" ("tranTypeId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tranH_contactsId" ON "TranH" ("contactsId");

-- Tier 4: AccM self-join, used by every recursive chart-of-accounts query
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accM_parentId" ON "AccM" ("parentId");

-- Tier 5: remaining unindexed FKs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_autoSubledgerCounter_accId"      ON "AutoSubledgerCounter" ("accId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_autoSubledgerCounter_branchId"   ON "AutoSubledgerCounter" ("branchId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_autoSubledgerCounter_finYearId"  ON "AutoSubledgerCounter" ("finYearId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accOpBal_branchId"               ON "AccOpBal" ("branchId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_bankOpBal_accId"                 ON "BankOpBal" ("accId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_bankOpBal_finYearId"             ON "BankOpBal" ("finYearId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_branchTransfer_destBranchId"     ON "BranchTransfer" ("destBranchId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_branchTransfer_productId"        ON "BranchTransfer" ("productId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_extBankReconTranD_tranDetailsId" ON "ExtBankReconTranD" ("tranDetailsId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_extMiscAccM_accId"               ON "ExtMiscAccM" ("accId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_stockJournal_productId"          ON "StockJournal" ("productId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_salePurchaseDetails_productId"   ON "SalePurchaseDetails" ("productId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notes_branchId"                  ON "Notes" ("branchId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_productOpBal_branchId"           ON "ProductOpBal" ("branchId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_productOpBal_finYearId"          ON "ProductOpBal" ("finYearId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_productM_catId"                  ON "ProductM" ("catId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_categoryM_parentId"              ON "CategoryM" ("parentId");
```

Then `ANALYZE` the touched tables.

**Detect and clean up interrupted `CONCURRENTLY` builds** — they leave an `INVALID` index behind that
consumes space and is never used:

```sql
SELECT t.relname AS table_name, i.relname AS index_name
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class t ON t.oid = ix.indrelid
WHERE ix.indisvalid = false
  AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = current_schema());
-- remediate (also cannot run in a transaction):
DROP INDEX CONCURRENTLY IF EXISTS "idx_tranD_accId";  -- then re-run the CREATE
```

## E. Template reconciliation

1. Append a clearly-delimited `-- Hardening (added <date>)` section to `accounts.sql` carrying the
   two `sql_patch6.sql` items, the missing seed row, the `accLeaf` default fix, and every CHECK/FK/
   index from sections C and D. In a brand-new empty schema, plain `CREATE INDEX` and
   `ADD CONSTRAINT` without `NOT VALID` are instant and safe — use the simple forms *there only*.
   ```sql
   ALTER TABLE "ExtBusinessContactsAccM" ALTER COLUMN "email" DROP NOT NULL;
   ALTER TABLE "AccM" ADD COLUMN IF NOT EXISTS "isHidden" boolean NOT NULL DEFAULT false;
   ALTER TABLE "AccM" ALTER COLUMN "accLeaf" SET DEFAULT 'N';
   INSERT INTO "TranTypeM" VALUES (12, 'Branch transfer', 'BRT');
   ```
2. **Never regenerate the template by `pg_dump`-ing a live tenant again.** Split provisioning into
   `schema.sql` (pure DDL, regenerable via `pg_dump --schema-only --no-owner` from a *throwaway* BU
   that has never taken a transaction) and `seed.sql` (hand-maintained reference `INSERT`s only:
   `AccClassM`, the `AccM` chart skeleton, `FinYearM`, `GodownM`, `TranTypeM`, `UnitM`).
   `create_bu.py:109` then concatenates both — a small, well-contained change.
3. Retire `accounts1.sql`. It is unreferenced and contains real tenant rows in version control.
4. **Prove convergence** by provisioning a fresh BU from the updated template and confirming its
   fingerprint (section A) matches a fully-hardened production schema. Do not verify by eye.

## F. Migration tracking

```sql
CREATE TABLE IF NOT EXISTS "_migration_history" (
    id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          text        NOT NULL UNIQUE,
    checksum      text        NOT NULL,
    applied_at    timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_by    text        NOT NULL DEFAULT current_user,
    success       boolean     NOT NULL DEFAULT true,
    error_message text
);
```

Apply protocol, wired into the migration tool's per-schema loop:
- Row exists, `success = true`, checksum matches → **skip** (idempotent).
- Row exists, `success = true`, checksum **differs** → **stop and alert.** Someone edited an
  already-applied migration. This is the single thing the comment convention in `sql_patch6.sql`
  can never catch, and the reason the checksum column exists.
- Row exists, `success = false` → safe to retry, given idempotent DDL.
- No row → proceed.

For autocommit migrations (the `CONCURRENTLY` indexes), the history-row write **must** be a separate
subsequent statement — it cannot share a transaction with `CREATE INDEX CONCURRENTLY`. Treat "run the
DDL" and "record the outcome" as two steps in every mode, never assume one transaction covers both.

Once `_migration_history` exists everywhere, stop appending to `sql_patch6.sql`; keep it as the
historical record of pre-tracking changes.

## G. Wave sequencing

| Wave | Contents | Window? | Reversible? |
|---|---|---|---|
| 0 | Section A fingerprint audit (read-only) | No | N/A |
| 1 | Create `_migration_history` everywhere | No | Yes |
| 2 | Section B pre-flight counts | No | N/A |
| 3 | **`accLeaf` UPDATE + DEFAULT** — the only data mutation | Off-peak | Only via the snapshot |
| 4 | Seed row, CHECKs, FK `VALIDATE`s, `TranCounter` FKs (transactional mode) | No | Yes — `DROP CONSTRAINT` |
| 5 | `TranH` unique index + constraint (**autocommit**) | Off-peak | Yes |
| 6 | Section D indexes (**autocommit**) | Off-peak preferred | Yes |
| 7 | Template reconciliation + retire `accounts1.sql` | No | Yes (file change) |
| 8 | Re-run fingerprint fleet-wide, confirm convergence | No | N/A |

**Hard rules:**
- **Never mix an autocommit run (waves 5, 6) with a transactional run (waves 3, 4) in the same tool
  invocation.** Different connection modes.
- **Wave 3 must complete and re-verify on a schema before wave 4's `accLeaf` CHECK runs on that same
  schema.** Out of order, the CHECK is added while `'n'` rows still exist and either fails or, if you
  weaken it to allow `'n'`, defeats its own purpose.
- Everything except wave 3 is reversible via `DROP CONSTRAINT` / `DROP INDEX`.
- **`reset_all()` is a live hazard during rollout.** It `TRUNCATE ... CASCADE`s through
  `TranD`/`TranH`/`AccOpBal`/`ExtGstTranD`, silently also emptying `SalePurchaseDetails`,
  `ExtBankReconTranD`, `StockJournal` and `BranchTransfer`, and bypasses the audit triggers entirely
  because `TRUNCATE` does not fire row-level triggers. If anyone calls it mid-rollout, that schema's
  pre-flight counts and history rows go stale — re-run sections A and B for it. Fixing its blast
  radius is a separate, smaller piece of work.
