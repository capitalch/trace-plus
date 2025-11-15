# Plan: Fix closeValue Calculation for Stock Journal Items in get_stock_summary_report

## Problem Statement

Items produced through stock journal transactions (`tranTypeId = 11`) are showing incorrect `closeValue` of 0. This occurs because the `lastPurchasePrice` calculation only considers regular purchase transactions (`tranTypeId = 5`) and ignores the price from stock journal transactions.

---

## File Location

**File:** `C:\projects\trace-plus\dev\trace-server\app\graphql\db\sql_accounts.py`
**Query:** `get_stock_summary_report`
**Lines:** 3032-3285

---

## Current Logic Analysis

### Good News: Stock Journal Price is Already Captured! ✓

**Lines 3060-3068** - Stock Journal already includes price:
```sql
-- Stock Journals
SELECT
    h."id", "productId", "tranTypeId", "qty",
    "price", "tranDate", "dc"
FROM "TranH" h
JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
```

This is correct - the actual price from `StockJournal` table is being selected.

### The Problem: lastPurchasePrice Only Uses tranTypeId = 5

**Lines 3209-3216** - CTE5 only considers purchase transactions:
```sql
-- ========== LAST PURCHASE PRICE ==========
cte5 AS (
    SELECT DISTINCT ON ("productId")
        "productId", "price" AS "lastPurchasePrice"
    FROM cte0
    WHERE "tranTypeId" = 5  -- ❌ ONLY REGULAR PURCHASES
    ORDER BY "productId", "tranDate" DESC
),
```

**Lines 3228** - Final price calculation in cte6:
```sql
COALESCE("lastPurchasePrice", "openingPrice", "purPrice") AS "lastPurchasePrice",
```

**Lines 3267** - closeValue calculation in cte8:
```sql
("clos" * "lastPurchasePrice")::NUMERIC(12,2) AS "closValue",
```

### Why closeValue is 0 for Stock Journal Items:

1. Stock journal items (tranTypeId = 11) are NOT captured in cte5
2. If an item has NO regular purchases (tranTypeId = 5), then `lastPurchasePrice` from cte5 is NULL
3. Falls back to `openingPrice`, which may be 0 or NULL for newly produced items
4. Falls back to `purPrice`, which may also be 0 or NULL
5. Final `closValue = clos * 0 = 0` ❌

---

## Solution Design

### Observation: lastTranPurchasePrice Already Exists!

Looking at **lines 3108-3127 (cte00)**, there's already a `lastTranPurchasePrice` calculation:

```sql
-- ========== ADD LAST TRAN PURCHASE PRICE ==========
cte00 AS (
    SELECT
        c0.*,
        (
            SELECT DISTINCT ON ("productId") "price"
            FROM cte0
            WHERE "tranTypeId" IN (5,11)  -- ✓ Includes both purchases AND stock journals
            AND "tranDate" <= c0."tranDate"
            AND "productId" = c0."productId"
            AND "price" IS NOT NULL AND "price" <> 0
            AND dc <> 'C'  -- Excludes credits
            ORDER BY "productId", "tranDate" DESC, "id" DESC
        ) AS "lastTranPurchasePrice",
        "openingPrice",
        p."purPrice"
    FROM cte0 c0
    LEFT JOIN cte1 c1 ON c1."productId" = c0."productId"
    join "ProductM" p on p.id = c0."productId"
),
```

This `lastTranPurchasePrice` is currently only used for gross profit calculation in cte000 (lines 3134-3135), but it's NOT being used in the final `closValue` calculation!

### Strategy

Instead of creating a new CTE, we should **use the existing `lastTranPurchasePrice`** in the final calculations block (cte6). We need to:

1. Pass `lastTranPurchasePrice` through the CTE chain
2. Use it as a fallback when `lastPurchasePrice` (from cte5) is 0 or NULL

---

## Detailed Changes

### Change 1: Add lastTranPurchasePrice to cte000 aggregation (Line 3154)

**Current (Line 3154):**
```sql
SUM( "grossProfit") AS "grossProfit"
```

**Modified:**
```sql
SUM("grossProfit") AS "grossProfit",
MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"  -- Add this line
```

**Rationale:** Aggregate the `lastTranPurchasePrice` per product so it can be passed to subsequent CTEs.

---

### Change 2: Pass lastTranPurchasePrice through cte22 (Line 3156)

No change needed - just ensure the new column from Change 1 is available.

---

### Change 3: Pass lastTranPurchasePrice through cte2 (Line 3165-3168)

**Current:**
```sql
cte2 as (
    select c22.*, c222."lastPurchaseDate"
    from cte22 as c22 left join cte222 as c222 on c22."productId" = c222."productId"
),
```

**Modified:**
```sql
cte2 as (
    select c22.*, c222."lastPurchaseDate"
    from cte22 as c22 left join cte222 as c222 on c22."productId" = c222."productId"
),  -- No change needed, c22.* already includes lastTranPurchasePrice
```

---

### Change 4: Pass lastTranPurchasePrice through cte3 (Lines 3184)

**Current (Line 3184):**
```sql
MAX("lastPurchaseDate") AS "lastPurchaseDate"
```

**Modified:**
```sql
MAX("lastPurchaseDate") AS "lastPurchaseDate",
MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"  -- Add this line
```

**Rationale:** Aggregate and pass the `lastTranPurchasePrice` to the next CTE.

---

### Change 5: Pass lastTranPurchasePrice through cte4 (Line 3204)

**Current (Line 3204):**
```sql
COALESCE("grossProfit", 0) AS "grossProfit",
"openingPrice", "lastSaleDate"
```

**Modified:**
```sql
COALESCE("grossProfit", 0) AS "grossProfit",
"lastTranPurchasePrice",  -- Add this line
"openingPrice", "lastSaleDate"
```

**Rationale:** Pass the column through to cte6 where it will be used.

---

### Change 6: Use lastTranPurchasePrice in final calculations (Lines 3219-3240, specifically line 3228)

**Current (Line 3228):**
```sql
COALESCE("lastPurchasePrice", "openingPrice", "purPrice") AS "lastPurchasePrice",
```

**Modified:**
```sql
CASE
    WHEN COALESCE("lastPurchasePrice", 0) > 0 THEN "lastPurchasePrice"
    WHEN COALESCE("lastTranPurchasePrice", 0) > 0 THEN "lastTranPurchasePrice"
    WHEN COALESCE("openingPrice", 0) > 0 THEN "openingPrice"
    ELSE "purPrice"
END AS "lastPurchasePrice",
```

**Rationale:**
- **Priority 1:** Use `lastPurchasePrice` from regular purchases (tranTypeId = 5) if available and > 0
- **Priority 2:** Use `lastTranPurchasePrice` from any transaction (includes tranTypeId = 11) if available and > 0
- **Priority 3:** Use `openingPrice` if available and > 0
- **Priority 4:** Fall back to `purPrice` from ProductM table

This ensures items produced via stock journals will use the price from those transactions.

---

### Change 7: Update cte4 JOIN to include lastTranPurchasePrice (Line 3206)

**Current (Line 3206):**
```sql
FROM cte1 c1
FULL JOIN cte3 c3 ON c1."productId" = c3."productId"
```

This stays the same, but we need to ensure cte3 provides the `lastTranPurchasePrice` column (which we added in Change 4).

---

## Summary of All Changes

| Location | Line | Change | Purpose |
|----------|------|--------|---------|
| cte22 | 3154 | Add `MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"` | Aggregate lastTranPurchasePrice |
| cte3 | 3184 | Add `MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"` | Pass through to cte4 |
| cte4 | 3204 | Add `"lastTranPurchasePrice",` | Pass through to cte6 |
| cte6 | 3228 | Replace COALESCE with CASE statement | Use lastTranPurchasePrice as fallback |

---

## Impact on Calculations

### Before Fix:
```
For items with only stock journal transactions (tranTypeId = 11):
- lastPurchasePrice (from cte5) = NULL
- Falls back to openingPrice = 0 (for new items)
- Falls back to purPrice = 0 (if not set)
- closValue = clos * 0 = 0 ❌
```

### After Fix:
```
For items with only stock journal transactions (tranTypeId = 11):
- lastPurchasePrice (from cte5) = NULL
- lastTranPurchasePrice = [price from stock journal] ✓
- closValue = clos * lastTranPurchasePrice = CORRECT VALUE ✓
```

---

## Testing Plan

### Test Case 1: Items with only stock journals
```sql
-- Find products with only stock journal transactions
SELECT * FROM cte8
WHERE "stockJournalDebits" > 0
  AND "purchase" = 0
ORDER BY "productId";
```

**Expected:** `closValue` should be > 0 when `clos` > 0

### Test Case 2: Items with both purchases and stock journals
```sql
-- Find products with both transaction types
SELECT * FROM cte8
WHERE "stockJournalDebits" > 0
  AND "purchase" > 0
ORDER BY "productId";
```

**Expected:** Should use regular purchase price (no change in behavior)

### Test Case 3: Items with only regular purchases
```sql
-- Find products with only regular purchases
SELECT * FROM cte8
WHERE "purchase" > 0
  AND "stockJournalDebits" = 0
ORDER BY "productId";
```

**Expected:** No change in behavior, should continue using lastPurchasePrice from cte5

### Test Case 4: Items with no transactions (opening balance only)
```sql
SELECT * FROM cte8
WHERE "op" > 0
  AND "purchase" = 0
  AND "stockJournalDebits" = 0
  AND "sale" = 0
ORDER BY "productId";
```

**Expected:** Should use openingPrice (no change in behavior)

---

## Verification Query

After implementing the fix, run this to verify:

```sql
-- Compare items before and after fix
SELECT
    "productCode",
    "product",
    "clos",
    "lastPurchasePrice",
    "closValue",
    "stockJournalDebits",
    "purchase",
    "openingPrice"
FROM cte8
WHERE ("stockJournalDebits" > 0 OR "stockJournalCredits" > 0)
  AND "clos" > 0
ORDER BY "closValue" DESC;
```

Look for items where:
- `stockJournalDebits` > 0 (has stock journal transactions)
- `purchase` = 0 (no regular purchases)
- `closValue` > 0 (should now be correct, not 0)

---

## Implementation Steps

1. **Locate the query** in `sql_accounts.py` (lines 3032-3285)
2. **Apply Change 1** - Add `lastTranPurchasePrice` aggregation in cte22 (line ~3154)
3. **Apply Change 2** - Add `lastTranPurchasePrice` aggregation in cte3 (line ~3184)
4. **Apply Change 3** - Pass `lastTranPurchasePrice` through cte4 (line ~3204)
5. **Apply Change 4** - Update price calculation logic in cte6 (line ~3228)
6. **Test the query** with sample data
7. **Verify results** using test cases above
8. **Deploy** to production after validation

---

## Risk Assessment

- **Low Risk:** Changes are additive and use hierarchical fallback
- **Backward Compatible:** Existing logic for regular purchases remains unchanged
- **Graceful Degradation:** Falls back through multiple price sources
- **No Schema Changes:** Only query logic changes, no database structure changes

---

## Rollback Plan

If issues arise:
1. Git revert the changes in `sql_accounts.py`
2. Restart the application server
3. No data migration needed (query-only changes)

---

## Key Benefits

1. ✓ Correct `closValue` for items produced via stock journals
2. ✓ Uses existing `lastTranPurchasePrice` calculation (already in query)
3. ✓ Maintains backward compatibility
4. ✓ No new CTEs needed
5. ✓ Minimal code changes
6. ✓ Hierarchical fallback ensures robustness
