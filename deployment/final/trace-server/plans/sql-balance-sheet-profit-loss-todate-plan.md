# Plan: SQL Changes for get_balanceSheet_profitLoss - Add toDate Parameter

## Status: PLANNING

## Objective
Add `toDate` parameter to the `get_balanceSheet_profitLoss` SQL query to support Balance Sheet and Profit & Loss statements as of a specific date.

## File to Modify
**File**: `app\graphql\db\sql_accounts.py`
**Query**: `get_balanceSheet_profitLoss` (starts at line 1335)

---

## Current Query Structure

The query has the following structure:
1. **Recursive CTE (hier)** - Builds account hierarchy
2. **Constants** - branchId, finYearId (line 1355)
3. **Base Data (cte1)** - Combines transactions and opening balances
   - Transactions from TranH/TranD (lines 1366-1370)
   - Opening balances from AccOpBal (lines 1379-1382)
4. **Aggregation (cte2)** - Summarizes by account
5. **Profit/Loss (cte3)** - Calculates net profit or loss
6. **Final Data (cte4)** - Prepares output with closing balances
7. **JSON Result** - Returns liabilities, assets, expenses, incomes, profitOrLoss

---

## SQL Changes Required

### Change 1: Add toDate Parameter to Constants Section

**Location**: Line 1355-1356

**Current Code**:
```sql
-- Constants for branch and financial year
"branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
-- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),
```

**Updated Code**:
```sql
-- Constants for branch and financial year
"branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "toDate" as (values (%(toDate)s::date)),
-- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)), "toDate" AS (VALUES ('2024-12-31'::date)),
```

**Changes**:
- Line 1355: Add `"toDate" as (values (%(toDate)s::date)),` at the end
- Line 1356: Add `"toDate" AS (VALUES ('2024-12-31'::date)),` to test comment

---

### Change 2: Add Date Filter to Transaction Selection

**Location**: Line 1369-1371 (WHERE clause for transactions)

**Current Code**:
```sql
FROM "TranH" h
JOIN "TranD" d ON h.id = d."tranHeaderId"
JOIN "AccM" a ON a.id = d."accId"
WHERE h."finYearId" = (TABLE "finYearId")
    AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
UNION ALL
```

**Updated Code**:
```sql
FROM "TranH" h
JOIN "TranD" d ON h.id = d."tranHeaderId"
JOIN "AccM" a ON a.id = d."accId"
WHERE h."finYearId" = (TABLE "finYearId")
    AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
    AND (CASE WHEN (TABLE "toDate") IS NULL THEN TRUE ELSE h."tranDate" <= (TABLE "toDate") END)
UNION ALL
```

**Changes**:
- Add new line after line 1370: `AND (CASE WHEN (TABLE "toDate") IS NULL THEN TRUE ELSE h."tranDate" <= (TABLE "toDate") END)`

**Logic Explanation**:
- If `toDate` is NULL → Include all transactions (backward compatible)
- If `toDate` has a value → Include only transactions where `tranDate <= toDate`

---

### Change 3: Opening Balances - NO CHANGES

**Location**: Lines 1379-1382 (AccOpBal selection)

**Current Code** (KEEP AS IS):
```sql
SELECT
    b.id,
    b."accId",
    CASE WHEN b."dc" = 'D' THEN b."amount" ELSE -b."amount" END AS "opening",
    0.00 AS "debit",
    0.00 AS "credit",
    a."parentId"
FROM "AccOpBal" b
JOIN "AccM" a ON a.id = b."accId"
WHERE b."finYearId" = (TABLE "finYearId")
    AND (SELECT COALESCE((TABLE "branchId"), b."branchId") = b."branchId")
```

**No changes needed** - Opening balances represent the start of the financial year and should always be included regardless of the selected date.

---

## Complete Modified SQL Query

**Full query** (lines 1335-1443):

```sql
get_balanceSheet_profitLoss = """
WITH RECURSIVE hier AS (
        SELECT
            "accId",
            "opening",
            "debit",
            "credit",
            "parentId"
        FROM cte1
        UNION ALL
        SELECT
            a."id" AS "accId",
            h."opening",
            h."debit",
            h."credit",
            a."parentId"
        FROM hier h
        JOIN "AccM" a ON h."parentId" = a."id"
    ),
    -- Constants for branch and financial year
    "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "toDate" as (values (%(toDate)s::date)),
    -- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)), "toDate" AS (VALUES ('2024-12-31'::date)),
    -- Base data preparation
    cte1 AS (
        SELECT
            d.id,
            d."accId",
            0.00 AS "opening",
            CASE WHEN d."dc" = 'D' THEN d."amount" ELSE 0.00 END AS "debit",
            CASE WHEN d."dc" = 'C' THEN d."amount" ELSE 0.00 END AS "credit",
            a."parentId"
        FROM "TranH" h
        JOIN "TranD" d ON h.id = d."tranHeaderId"
        JOIN "AccM" a ON a.id = d."accId"
        WHERE h."finYearId" = (TABLE "finYearId")
            AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
            AND (CASE WHEN (TABLE "toDate") IS NULL THEN TRUE ELSE h."tranDate" <= (TABLE "toDate") END)
        UNION ALL
        SELECT
            b.id,
            b."accId",
            CASE WHEN b."dc" = 'D' THEN b."amount" ELSE -b."amount" END AS "opening",
            0.00 AS "debit",
            0.00 AS "credit",
            a."parentId"
        FROM "AccOpBal" b
        JOIN "AccM" a ON a.id = b."accId"
        WHERE b."finYearId" = (TABLE "finYearId")
            AND (SELECT COALESCE((TABLE "branchId"), b."branchId") = b."branchId")
    ),

    -- Summarize data at each hierarchy level
    cte2 AS (
        SELECT
            h."accId",
            a."accName",
            a."accType",
            h."parentId",
            SUM(h."opening") AS "opening",
            SUM(h."debit") AS "debit",
            SUM(h."credit") AS "credit",
            SUM(h."opening" + h."debit" - h."credit") AS "closing"
        FROM hier h
        JOIN "AccM" a ON a."id" = h."accId"
        GROUP BY
            h."accId",
            a."accName",
            a."accType",
            h."parentId"
    ),

    -- Calculate profit or loss
    cte3 AS ( SELECT
        SUM(CASE WHEN "accType" in('L','A') THEN opening + debit - credit ELSE 0 END) as "profitOrLoss"
        FROM cte1 c
        JOIN "AccM" a ON a."id" = c."accId"
    ),

    -- Final aggregation
    cte4 AS (
        SELECT
            c."accId" AS id,
            c."accName",
            c."accType",
            ABS(c."closing") AS "closing",
            CASE WHEN c."closing" < 0 THEN 'C' ELSE 'D' END AS "closing_dc",
            c."parentId",
            ARRAY_AGG(child."accId" ORDER BY child."accName") AS "children"
        FROM cte2 c
        LEFT JOIN cte2 child ON child."parentId" = c."accId"
        where (c.closing != 0)
        GROUP BY
            c."accId",
            c."accName",
            c."closing",
            c."parentId",
            c."accType"
        ORDER BY
            c."accType",
            c."accName"
    )
    -- Build JSON result
    SELECT JSON_BUILD_OBJECT(
        'profitOrLoss', (SELECT "profitOrLoss" FROM cte3),
        'liabilities', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'L'),
        'assets', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'A'),
        'expenses', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'E'),
        'incomes', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'I')
    ) AS "jsonResult"
"""
```

---

## Implementation Steps

### Step 1: Add toDate Parameter
- **Line 1355**: Add `"toDate" as (values (%(toDate)s::date)),` after finYearId
- **Result**: Defines toDate as a parameter that accepts a date value

### Step 2: Update Test Comment
- **Line 1356**: Add `"toDate" AS (VALUES ('2024-12-31'::date)),` to commented line
- **Result**: Provides example value for testing

### Step 3: Add Date Filter to Transactions
- **After Line 1370**: Add new WHERE condition
- **Code**: `AND (CASE WHEN (TABLE "toDate") IS NULL THEN TRUE ELSE h."tranDate" <= (TABLE "toDate") END)`
- **Result**: Filters transactions based on toDate

### Step 4: Verify Opening Balances
- **Lines 1379-1382**: No changes needed
- **Result**: Opening balances remain unfiltered (correct behavior)

---

## How It Works

### When toDate is NULL (Default/Backward Compatible):
```
Opening Balances: Included (from AccOpBal)
Transactions: All transactions for the financial year
Result: Full year Balance Sheet and P&L
```

### When toDate is Provided (e.g., '2024-09-30'):
```
Opening Balances: Included (from AccOpBal - year start)
Transactions: Only transactions where tranDate <= '2024-09-30'
Result: Balance Sheet and P&L as of September 30, 2024
```

---

## Calculation Logic

### For Each Account:
```
Opening Balance (year start) = From AccOpBal table
+ Debits (up to toDate) = From TranD where dc='D' and tranDate <= toDate
- Credits (up to toDate) = From TranD where dc='C' and tranDate <= toDate
= Closing Balance (as of toDate)
```

### Profit or Loss Calculation:
```
Profit/Loss = (Liabilities + Assets accounts: opening + debit - credit)
```

This is calculated in cte3 and represents the net effect on equity.

---

## Testing Scenarios

### Test 1: NULL toDate (Full Year)
**Input**: `toDate = NULL`
**Expected**: All transactions included, same as current behavior
**SQL**: CASE condition returns TRUE, no filtering applied

### Test 2: Year End Date
**Input**: `toDate = '2024-03-31'` (financial year end)
**Expected**: All transactions up to year end (full year data)
**SQL**: `h."tranDate" <= '2024-03-31'`

### Test 3: Mid-Year Date
**Input**: `toDate = '2024-09-30'` (6 months into year)
**Expected**: Only transactions from April 1 to September 30
**SQL**: `h."tranDate" <= '2024-09-30'`

### Test 4: Year Start Date
**Input**: `toDate = '2024-04-01'` (first day of year)
**Expected**: Opening balances only, no transactions
**SQL**: `h."tranDate" <= '2024-04-01'` (filters out future transactions)

---

## Validation Checks

After implementing, verify:

- [ ] SQL query executes without syntax errors
- [ ] toDate parameter is properly defined in CTE
- [ ] Transaction WHERE clause includes date filter
- [ ] Opening balances are NOT filtered by date
- [ ] CASE statement handles NULL correctly
- [ ] Date filtering uses `<=` (less than or equal to)
- [ ] All account types (L, A, E, I) are calculated correctly
- [ ] Profit/Loss calculation remains accurate
- [ ] JSON output structure remains unchanged

---

## Impact on Financial Statements

### Balance Sheet (as of toDate):
- **Assets (A)**: Shows closing balances as of date
- **Liabilities (L)**: Shows closing balances as of date
- **Profit/Loss**: Included in the statement, affects equity
- **Formula**: Assets = Liabilities + Equity (including P&L)

### Profit & Loss Statement (for period):
- **Incomes (I)**: Revenue earned from year start to toDate
- **Expenses (E)**: Costs incurred from year start to toDate
- **Net Profit/Loss**: Difference between incomes and expenses for the period

---

## Accounting Principle: Why Opening Balances Don't Get Filtered

**Key Concept**: Opening balances represent the **starting point** of the financial year.

**Why No Date Filter?**
1. Opening balances are the position at the **beginning** of the year
2. They are needed to calculate current balances: `Closing = Opening + Changes`
3. Filtering opening balances would produce incorrect results

**Example**:
```
Year Start: April 1, 2024
toDate: September 30, 2024 (6 months)

Opening Balance (Apr 1): ₹100,000  (Always included)
Debits (Apr-Sep): ₹50,000          (Filtered by toDate)
Credits (Apr-Sep): ₹30,000         (Filtered by toDate)
Closing Balance (Sep 30): ₹120,000 (100,000 + 50,000 - 30,000)
```

If we filtered opening balances by date, we'd get ₹20,000 instead of ₹120,000 (incorrect).

---

## Backward Compatibility

**Current Behavior** (without toDate):
- All transactions for the financial year are included
- Returns full year Balance Sheet and P&L

**New Behavior** (with toDate = NULL):
- CASE condition: `WHEN (TABLE "toDate") IS NULL THEN TRUE`
- Returns TRUE, so all transactions are included
- **Identical to current behavior** ✓

**Conclusion**: Existing code that doesn't pass toDate will continue to work exactly as before.

---

## Summary

### Changes Required:
1. ✓ Add `toDate` parameter to constants (1 line)
2. ✓ Update test comment with example (1 line)
3. ✓ Add date filter to transaction WHERE clause (1 line)

### Total Lines Changed: 3

### Affected Components:
- Balance Sheet report (will use toDate when provided)
- Profit & Loss report (will use toDate when provided)

### Backward Compatible: Yes
- NULL toDate = Full year data (current behavior)
- Date provided = Data up to that date (new feature)

### Next Step:
After SQL changes, client-side components (balance-sheet.tsx and profit-loss.tsx) will need to pass the toDate parameter in sqlArgs (separate implementation).
