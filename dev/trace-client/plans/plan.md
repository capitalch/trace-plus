# Plan: Fix bill-sale (Auto Subledger) save error — `autoSubledgerDetails` is null

## Context
Saving a Sales invoice with **Payment Details → Auto Subledger (Bill Sale)** fails with a
client-side error. Root cause is server-side in `handle_auto_subledger`
(`trace-server/app/graphql/db/psycopg_async_helper.py`):

- Line 250 runs `SqlAccounts.get_auto_subledger_details`; lines 260-262 read its `jsonResult`.
- `jsonResult.get("autoSubledgerDetails", {})` returns **`None`** (the `{}` default only applies
  when the key is *absent*; here the key is present with JSON `null`), so line 264
  `autoSubledgerDetails.get("lastNo", 0)` raises `'NoneType' object has no attribute 'get'`.
  The exception is caught upstream and surfaced to the client as a generic error.

Why `autoSubledgerDetails` is null: in `get_auto_subledger_details` (`sql_accounts.py:1291`),
the `inserting` data-modifying CTE inserts a starter `AutoSubledgerCounter` row (`lastNo=1`) when
none exists, but the `autoSubledgerDetails` subquery reads the **base** `AutoSubledgerCounter`
table. Per PostgreSQL MVCC, a data-modifying CTE's inserted rows are **not visible** to other
table references in the same statement. So on the **first** bill sale for a given
finYear/branch/parent-account, the subquery returns no row → `row_to_json` → `NULL`.
(Subsequent sales work because the row already exists.)

The codebase already solves this correctly in `get_last_no` (`sql_accounts.py:2048`) by
`UNION ALL`-ing the `inserted` CTE with the base table. We mirror that here.

## Changes (all in trace-server)

### Step 1 — `sql_accounts.py` `get_auto_subledger_details` (~lines 1291-1334) — primary fix
Make the just-inserted counter row visible to the JSON build:
- Change `inserting ... RETURNING id` → `RETURNING "lastNo", "accId"`.
- Add a `counter` CTE that unions the inserted row with the existing row:
  ```sql
  , counter AS (
      SELECT "lastNo", "accId" FROM inserting
      UNION ALL
      SELECT d."lastNo", d."accId" FROM "AutoSubledgerCounter" d
      WHERE d."finYearId" = (TABLE "finYearId")
        AND d."branchId"  = (TABLE "branchId")
        AND d."accId"     = (TABLE "accId")
  )
  ```
- Point the `autoSubledgerDetails` subquery at `counter` instead of the base table:
  ```sql
  SELECT row_to_json(t) FROM (
      SELECT cnt."lastNo", a."accType", a."classId", c."accClass"
      FROM counter cnt
      JOIN "AccM" a ON a."id" = cnt."accId"
      JOIN "AccClassM" c ON c."id" = a."classId"
      LIMIT 1
  ) t
  ```
- Leave `branchCode` and `contactNameMobile` sub-selects as-is.

### Step 2 — `psycopg_async_helper.py` `handle_auto_subledger` (~lines 260-271) — hardening
Guard against JSON `null` so a null field can never re-introduce the `None.get` crash (this also
covers the analogous `contactNameMobile` path at lines 269-270):
- `autoSubledgerDetails = jsonResult.get("autoSubledgerDetails") or {}`
- `contactNameMobile = jsonResult.get("contactNameMobile") or {}`
Note: this alone is NOT sufficient (empty dict → `accType`/`classId` None → `insert_account`
would fail on NOT NULL columns); Step 1 is the real fix. Keep both.

## Verification
- New bill sale for a finYear/branch/parent-account with **no** prior `AutoSubledgerCounter`
  row → save succeeds, a new subledger `AccM` row is created with
  `accCode = {accId}/{branchCode}/1/{finYearId}`, and `AutoSubledgerCounter.lastNo` becomes 2.
- A **second** bill sale on the same parent → `accCode .../2/...`, counter → 3 (numbering
  continues; no regression on the previously-working path).
- Confirm no `'NoneType' object has no attribute 'get'` in `dev/trace-server/logs`.
