# Plan: Optimize getLeafSubledgerAccountsOnClass Query

## Context

The `get_leaf_subledger_accounts_on_class` query powers every `AccountPickerFlat` dropdown
(Payment, Receipt, Contra, Journal vouchers all call it — several times per page load).
It currently uses two CTEs and a `(TABLE cte_name) IS NULL` pattern to handle the optional
`accClassNames` filter. Both CTEs are unnecessary and the NULL-check idiom can confuse the
query planner. Additionally, the `AccM` table has no indexes on the three columns the query
filters and joins on (`accLeaf`, `classId`, `parentId`), which will matter as account count grows.

---

## Files to Modify

| File | Change |
|------|--------|
| `trace-server/app/graphql/db/sql_accounts.py` (line ~2290) | Replace query with simplified flat form |
| `trace-server/app/graphql/scripts/accounts.sql` (or a new migration) | Add three indexes on `AccM` |

---

## Step 1 — Simplify the SQL query

Remove both CTEs entirely. Reference `%(accClassNames)s` directly in the WHERE clause.
PostgreSQL can evaluate `%(accClassNames)s IS NULL` as a constant condition and may eliminate
the `string_to_array` branch at plan time when a value is present.

**Replacement query:**

```sql
SELECT
    a.id,
    a."accName",
    CASE WHEN a."accLeaf" = 'S' THEN true ELSE false END AS "isSubledger",
    a."accLeaf",
    p."accName" AS "accParent",
    CASE WHEN a."accLeaf" = 'L' THEN true ELSE false END AS "isDisabled"
FROM "AccM" a
JOIN "AccM" p  ON p.id = a."parentId"
JOIN "AccClassM" c ON c.id = a."classId"
WHERE a."accLeaf" IN ('S', 'L', 'Y')
  AND (
      %(accClassNames)s IS NULL
      OR c."accClass" = ANY(string_to_array(%(accClassNames)s, ','))
  )
ORDER BY
    CASE WHEN a."accLeaf" = 'L' THEN a.id ELSE a."parentId" END,
    CASE WHEN a."accLeaf" = 'L' THEN 0 ELSE 1 END,
    a."accName"
```

Key changes vs original:
- `accClassNames` CTE removed — parameter used directly twice (evaluated as a constant by planner)
- `cte1` CTE removed — single flat query; planner can see all predicates together for a better join order
- `(TABLE "accClassNames") IS NULL` → `%(accClassNames)s IS NULL` — standard SQL, planner-friendly
- CASE expressions for `isSubledger` / `isDisabled` simplified (one branch each)
- No change to the ORDER BY (logic must stay identical)

No changes required in the TypeScript client — parameter is still passed as a comma-separated
string or null from `accClassNames?.join(',') || null`.

---

## Step 2 — Add indexes on AccM

Currently `AccM` has only a primary key index. Three columns are hit on every execution:

```sql
-- Covers the WHERE clause filter (most selective condition in most calls)
CREATE INDEX IF NOT EXISTS "AccM_accLeaf_idx" ON "AccM" ("accLeaf");

-- Covers the self-join to fetch parent name
CREATE INDEX IF NOT EXISTS "AccM_parentId_idx" ON "AccM" ("parentId");

-- Covers the JOIN to AccClassM used for class filtering
CREATE INDEX IF NOT EXISTS "AccM_classId_idx" ON "AccM" ("classId");
```

`AccClassM` is a tiny lookup table (< 20 rows); no index needed there.

Optional: once indexes above exist, a partial composite index can cover the common
filtered case more tightly:

```sql
CREATE INDEX IF NOT EXISTS "AccM_accLeaf_classId_idx"
    ON "AccM" ("classId", "accLeaf")
    WHERE "accLeaf" IN ('S', 'L', 'Y');
```

This partial index is smaller and allows index-only scans for the WHERE + JOIN combination.

---

## Verification

1. Run the new query directly in psql with a NULL param and with a non-null param
   (`'sale,purchase'`) — results must match the original query exactly (same rows, same order).
2. Run `EXPLAIN (ANALYZE, BUFFERS)` on both variants and confirm the new query shows
   Index Scan (or Bitmap Index Scan) on `AccM_accLeaf_idx` instead of Seq Scan once
   indexes are in place.
3. In the app: navigate to a Payment voucher, open the account picker — dropdown should
   populate with identical options and be as fast or faster.
