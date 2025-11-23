# Plan: Add toDate Parameter to Balance Sheet & Profit Loss

## Status: PLANNING

## Objective
Modify the `get_balanceSheet_profitLoss` SQL query and update both Balance Sheet and Profit Loss UI components to support viewing financial statements as of any date within the financial year.

## Overview

Both Balance Sheet and Profit Loss statements use the **same SQL query** (`get_balanceSheet_profitLoss`), so:
- **One SQL change** affects both reports
- **Two UI components** need updates (Balance Sheet and Profit Loss)
- Both share similar structure and can use identical implementation approach

---

# PART 1: SERVER-SIDE CHANGES

## Current SQL Structure

**File**: `app\graphql\db\sql_accounts.py`
**Query**: `get_balanceSheet_profitLoss` (line 1335)

### Current Parameters:
- `branchId` - Branch filter
- `finYearId` - Financial year filter

### Query Structure:
1. **Recursive hierarchy** (hier CTE)
2. **Constants** - branchId, finYearId (line 1355)
3. **Base data** (cte1):
   - Transactions from TranH/TranD (lines 1366-1370)
   - Opening balances from AccOpBal (lines 1379-1382)
4. **Aggregation** (cte2) - Summarizes at hierarchy levels
5. **Profit/Loss calculation** (cte3)
6. **Final output** (cte4) - Separates by account type
7. **JSON result** - Returns liabilities, assets, expenses, incomes, profitOrLoss

## SQL Changes Required

### Change 1: Add toDate Parameter (Line 1355)

**Current**:
```sql
-- Constants for branch and financial year
"branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
-- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),
```

**Updated**:
```sql
-- Constants for branch and financial year
"branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "toDate" as (values (%(toDate)s::date)),
-- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)), "toDate" AS (VALUES ('2024-12-31'::date)),
```

### Change 2: Add Date Filter to Transactions (Line 1369-1370)

**Current**:
```sql
FROM "TranH" h
JOIN "TranD" d ON h.id = d."tranHeaderId"
JOIN "AccM" a ON a.id = d."accId"
WHERE h."finYearId" = (TABLE "finYearId")
    AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
UNION ALL
```

**Updated**:
```sql
FROM "TranH" h
JOIN "TranD" d ON h.id = d."tranHeaderId"
JOIN "AccM" a ON a.id = d."accId"
WHERE h."finYearId" = (TABLE "finYearId")
    AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
    AND (CASE WHEN (TABLE "toDate") IS NULL THEN TRUE ELSE h."tranDate" <= (TABLE "toDate") END)
UNION ALL
```

### Change 3: Keep Opening Balances Unchanged

**No changes needed** to AccOpBal section (lines 1379-1382).
Opening balances represent the start of the financial year and should not be filtered by date.

## SQL Implementation Steps

1. ✓ Add `"toDate"` CTE to constants section (line 1355)
2. ✓ Update test comment line to include toDate example (line 1356)
3. ✓ Add date filter to transaction WHERE clause (after line 1370)
4. ✓ Opening balances remain unchanged

---

# PART 2: CLIENT-SIDE CHANGES

## Files to Modify

1. **Balance Sheet**: `trace-client/src/features/accounts/final-accounts/balance-sheet.tsx`
2. **Profit Loss**: `trace-client/src/features/accounts/final-accounts/profit-loss.tsx`

Both files have **identical structure** and require **identical changes**.

## Current UI Structure

### Balance Sheet (balance-sheet.tsx):
- Line 37: `isAllBranches` switch
- Lines 67-79: `loadData` callback with sqlArgs
- Lines 74-77: sqlArgs contains branchId, finYearId

### Profit Loss (profit-loss.tsx):
- Line 37: `isAllBranches` switch
- Lines 66-78: `loadData` callback with sqlArgs
- Lines 73-76: sqlArgs contains branchId, finYearId

## Design Approach

### Always-Visible Date Picker (Same as Trial Balance)

**Key Features**:
1. Date picker always visible next to "All branches" switch
2. Defaults to financial year end date
3. User can select any date within financial year
4. Auto-resets when context changes (BU, finYear, branch)

**Benefits**:
- Consistent with Trial Balance implementation
- Simple, clean UI
- Smart default shows full year data
- No hidden state

## Client-Side Changes (Both Files)

### 1. Add State Variable

**Location**: After existing selectors (around line 40)

```typescript
// Local state for date filter
const [selectedToDate, setSelectedToDate] = useState<string>('')
```

### 2. Add Date Reset Effect

**Location**: Before loadData callback (around line 55)

```typescript
// Reset date to financial year end when context changes
useEffect(() => {
    setSelectedToDate(format(parseISO(currentFinYear.endDate), 'yyyy-MM-dd'))
}, [buCode, finYearId, branchId, isAllBranches, currentFinYear])
```

**Note**: Both components already have `currentFinYear` from `useUtilsInfo` hook

### 3. Update loadData Dependencies

**Location**: In useEffect that calls loadData

**Balance Sheet** (find existing useEffect around line 120):
```typescript
useEffect(() => {
    loadData()
}, [buCode, branchId, isAllBranches, finYearId, selectedToDate]) // Add selectedToDate
```

**Profit Loss** (find existing useEffect around line 110):
```typescript
useEffect(() => {
    loadData()
}, [buCode, branchId, isAllBranches, finYearId, selectedToDate]) // Add selectedToDate
```

### 4. Update sqlArgs in loadData Callback

**Balance Sheet** (lines 74-77):
```typescript
sqlArgs: {
    branchId: isAllBranches ? null : loginInfo.currentBranch?.branchId,
    finYearId: loginInfo.currentFinYear?.finYearId,
    toDate: selectedToDate || null, // ADDED
},
```

**Profit Loss** (lines 73-76):
```typescript
sqlArgs: {
    branchId: isAllBranches ? null : loginInfo.currentBranch?.branchId,
    finYearId: loginInfo.currentFinYear?.finYearId,
    toDate: selectedToDate || null, // ADDED
},
```

### 5. Update UI Toolbar

Both components have a toolbar section that needs the date picker added.

#### Balance Sheet Toolbar Update

**Find**: Section with CompSwitch (search for "compSwitchBalanceSheet")
**Update**: Add date picker next to switch

```typescript
<div className="flex items-center gap-4">
    <CompSwitch
        instance={CompInstances.compSwitchBalanceSheet}
        className=""
        leftLabel="All branches"
        rightLabel=""
    />
    <div className="flex items-center gap-2">
        <label className="font-medium text-sm">
            As on Date:
        </label>
        <input
            type="date"
            value={selectedToDate}
            min={format(parseISO(currentFinYear.startDate), 'yyyy-MM-dd')}
            max={format(parseISO(currentFinYear.endDate), 'yyyy-MM-dd')}
            onChange={(e) => setSelectedToDate(e.target.value)}
            className="px-3 py-1 text-sm border rounded-md cursor-pointer"
        />
    </div>
</div>
```

#### Profit Loss Toolbar Update

**Find**: Section with CompSwitch (search for "compSwitchProfitLoss")
**Update**: Add date picker next to switch (same code as Balance Sheet)

```typescript
<div className="flex items-center gap-4">
    <CompSwitch
        instance={CompInstances.compSwitchProfitLoss}
        className=""
        leftLabel="All branches"
        rightLabel=""
    />
    <div className="flex items-center gap-2">
        <label className="font-medium text-sm">
            As on Date:
        </label>
        <input
            type="date"
            value={selectedToDate}
            min={format(parseISO(currentFinYear.startDate), 'yyyy-MM-dd')}
            max={format(parseISO(currentFinYear.endDate), 'yyyy-MM-dd')}
            onChange={(e) => setSelectedToDate(e.target.value)}
            className="px-3 py-1 text-sm border rounded-md cursor-pointer"
        />
    </div>
</div>
```

### 6. Check Existing Imports

Both files already import:
- ✓ `useState` from React (line 1)
- ✓ `format, parseISO` from date-fns (line 24)
- ✓ `currentFinYear` from useUtilsInfo (lines 41-52)

**No new imports needed!** All required dependencies already exist.

---

# IMPLEMENTATION STEPS

## Phase 1: Server-Side (SQL Changes)

### Step 1: Update SQL Query ✓
1. Add `toDate` parameter to constants (line 1355)
2. Update test comment with toDate example (line 1356)
3. Add date filter to transaction WHERE clause (after line 1370)

**File**: `app\graphql\db\sql_accounts.py`

## Phase 2: Client-Side (Balance Sheet)

### Step 2: Update balance-sheet.tsx ✓
1. Add `selectedToDate` state variable (after line 40)
2. Add date reset useEffect (around line 55)
3. Update loadData dependencies (around line 120)
4. Add toDate to sqlArgs (lines 74-77)
5. Update toolbar UI with date picker

**File**: `trace-client/src/features/accounts/final-accounts/balance-sheet.tsx`

## Phase 3: Client-Side (Profit Loss)

### Step 3: Update profit-loss.tsx ✓
1. Add `selectedToDate` state variable (after line 40)
2. Add date reset useEffect (around line 55)
3. Update loadData dependencies (around line 110)
4. Add toDate to sqlArgs (lines 73-76)
5. Update toolbar UI with date picker

**File**: `trace-client/src/features/accounts/final-accounts/profit-loss.tsx`

## Phase 4: Testing

### Step 4: Test All Scenarios ✓
- See Testing Checklist below

---

# BEHAVIOR FLOW

## On Initial Load:
1. Component mounts
2. Date reset useEffect sets `selectedToDate` to financial year end date
3. loadData triggers with `toDate = year end date`
4. SQL filters transactions up to year end (full year data)
5. Balance Sheet/P&L displays complete year data

## When User Changes Date:
1. User selects new date from date picker
2. `selectedToDate` state updates
3. loadData effect triggers (because selectedToDate changed)
4. SQL filters transactions up to new date
5. Balance Sheet/P&L updates to show data as of selected date

## When Context Changes (Branch/BU/FinYear):
1. Context change detected (buCode, finYearId, branchId, or isAllBranches)
2. Date reset useEffect resets `selectedToDate` to new financial year end
3. loadData effect triggers (because selectedToDate changed)
4. Data reloads with reset date
5. User sees fresh data for new context

---

# EXPECTED RESULTS

## Balance Sheet
- **Assets**: Shows balances up to selected date
- **Liabilities**: Shows balances up to selected date
- **Profit/Loss**: Calculated from opening + transactions up to date
- **Total**: Assets = Liabilities + Equity (including profit/loss)

## Profit & Loss Statement
- **Incomes**: All income transactions up to selected date
- **Expenses**: All expense transactions up to selected date
- **Net Profit/Loss**: Income - Expenses up to selected date

## Date Behavior
- **Default**: Financial year end (shows full year)
- **Mid-year**: Shows partial year data up to that date
- **Reset**: Auto-resets to year-end when context changes

---

# TESTING CHECKLIST

## Server-Side (SQL)
- [ ] SQL executes without errors
- [ ] toDate parameter accepts date values
- [ ] toDate NULL returns full year data
- [ ] Transaction filtering works correctly
- [ ] Opening balances remain unchanged
- [ ] Profit/Loss calculation is accurate
- [ ] All account types (L, A, E, I) are calculated correctly

## Client-Side (Both Components)
- [ ] Date picker shows financial year end on initial load
- [ ] Date picker constrained to financial year boundaries
- [ ] Changing date triggers data reload
- [ ] sqlArgs correctly passes selected date to backend
- [ ] Balance Sheet balances correctly as of date
- [ ] Profit Loss calculates correctly up to date
- [ ] Assets = Liabilities + Equity + Profit/Loss
- [ ] Date resets when business unit changes
- [ ] Date resets when financial year changes
- [ ] Date resets when branch changes
- [ ] Date resets when "All branches" toggle changes
- [ ] Works correctly with "All branches" switch
- [ ] UI is responsive and well-aligned
- [ ] No console errors or warnings
- [ ] PDF export works with selected date (if applicable)

## Integration Testing
- [ ] Trial Balance, Balance Sheet, and P&L all work with date filters
- [ ] Consistent behavior across all three reports
- [ ] Data consistency: Trial Balance totals match BS + P&L

---

# FINANCIAL STATEMENTS CONTEXT

## Balance Sheet (Statement of Financial Position)
**Purpose**: Shows financial position as of a specific date
**Formula**: Assets = Liabilities + Equity

**Components**:
- **Assets (A)**: What the company owns
- **Liabilities (L)**: What the company owes
- **Equity**: Owner's stake = Assets - Liabilities
- **Profit/Loss**: Added to liabilities (profit) or assets (loss)

**Date Filtering Impact**:
- Opening balances: From year start
- Changes during year: Transactions up to selected date
- Closing balances: Opening + Changes up to date

## Profit & Loss Statement (Income Statement)
**Purpose**: Shows performance over a period (year start to selected date)
**Formula**: Net Profit/Loss = Incomes - Expenses

**Components**:
- **Incomes (I)**: Revenue earned
- **Expenses (E)**: Costs incurred
- **Net Profit/Loss**: Difference between incomes and expenses

**Date Filtering Impact**:
- Period: From financial year start to selected date
- All income/expense transactions up to date
- Not affected by opening balances (P&L is period-based)

---

# ACCOUNTING PRINCIPLES

## Why Opening Balances Don't Get Filtered:
Opening balances represent the **starting point** of the financial year. They should always be included regardless of the selected date because:
1. They show the position at the beginning of the year
2. Current balances = Opening + Transactions up to date
3. Filtering opening balances would give incorrect results

## Why Transactions Get Filtered:
Transactions represent **activity during the year**. When viewing statements as of a date:
1. Only include activity up to that date
2. Future transactions (after the date) are excluded
3. Gives accurate "point in time" view

---

# SIMILAR TO TRIAL BALANCE

This implementation follows the **exact same pattern** as Trial Balance:
- Same date picker UI
- Same auto-reset behavior
- Same SQL filtering approach
- Same parameter handling

**Benefits of Consistency**:
- Users get familiar UI across all reports
- Easier maintenance (same code patterns)
- Predictable behavior

---

# FUTURE ENHANCEMENTS (Optional)

1. **Comparative statements**: Show two dates side-by-side
2. **Date presets**: "Month End", "Quarter End" buttons
3. **Date in title**: Show "Balance Sheet as on [Date]" in header/PDF
4. **Historical snapshots**: Save and compare multiple dates
5. **Trend analysis**: Chart changes over multiple dates
6. **Ratio analysis**: Calculate ratios as of selected date
7. **Budget comparison**: Compare actuals vs budget as of date

---

# SUMMARY

## Server-Side:
- ✓ One SQL query change (`get_balanceSheet_profitLoss`)
- ✓ Affects both Balance Sheet and Profit Loss
- ✓ 3 lines of SQL changes
- ✓ Backward compatible (NULL toDate = full year)

## Client-Side:
- ✓ Two component updates (balance-sheet.tsx, profit-loss.tsx)
- ✓ Identical implementation for both
- ✓ No new imports needed (all dependencies exist)
- ✓ ~30 lines of code per component
- ✓ Consistent with Trial Balance implementation

## Testing:
- ✓ Comprehensive checklist covers all scenarios
- ✓ Both SQL and UI testing
- ✓ Integration testing with Trial Balance

## Benefits:
- ✓ Flexible date-based financial reporting
- ✓ Accurate point-in-time statements
- ✓ User-friendly interface
- ✓ Automatic reset on context changes
- ✓ Consistent with accounting best practices
