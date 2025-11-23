# Plan: Add toDate Filter to Balance Sheet

## Current Behavior
The Balance Sheet component currently:
- Uses the current financial year's end date directly (line 54)
- Has no user control to change the "as on date" for the balance sheet
- Automatically loads data for the financial year end date only
- The `loadData` function (lines 67-135) queries without a toDate parameter in sqlArgs (lines 74-77)

## Problem
Users cannot view the balance sheet for any date other than the financial year end date. They need flexibility to see balance sheet positions at different dates within the financial year.

## Proposed Solution
Add a date input field with an Apply button (similar to Trial Balance implementation) to allow users to select and apply any date within the financial year range.

## Implementation Plan

### 1. Add Import for useRef
**File:** `balance-sheet.tsx` (line 1)
- Add `useRef` to the imports from React
- Current: `import { ChangeEvent, useCallback, useEffect, useState } from "react"`
- Updated: `import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"`

### 2. Add State and Ref Variables
**File:** `balance-sheet.tsx` (after line 39)

Add the following state and ref:
```typescript
const [appliedDate, setAppliedDate] = useState<string | null>(
    currentFinYear ? format(currentFinYear?.endDate, 'yyyy-MM-dd') : null
)
const dateInputRef = useRef<HTMLInputElement>(null)
```

**Purpose:**
- `appliedDate`: The date that triggers data refresh (used in loadData)
- `dateInputRef`: Direct reference to the input element for smooth editing

### 3. Add useEffect to Initialize Date
**File:** `balance-sheet.tsx` (after the new state variables)

Add useEffect to sync date when financial year/branch changes:
```typescript
useEffect(() => {
    const formattedDate = format(currentFinYear?.endDate || '', 'yyyy-MM-dd')
    setAppliedDate(formattedDate)
    if (dateInputRef.current) {
        dateInputRef.current.value = formattedDate
    }
}, [buCode, finYearId, branchId, isAllBranches, currentFinYear])
```

### 4. Update loadData Function
**File:** `balance-sheet.tsx` (lines 67-135)

**Changes needed:**
1. Add `appliedDate` to the dependency array (line 127-135)
2. Update sqlArgs to include toDate parameter (lines 74-77):

```typescript
sqlArgs: {
    branchId: isAllBranches ? null : loginInfo.currentBranch?.branchId,
    finYearId: loginInfo.currentFinYear?.finYearId,
    toDate: appliedDate  // NEW: Add this line
},
```

3. Update dependency array to include `appliedDate`:
```typescript
}, [
    dbName,
    loginInfo,
    decodedDbParamsObject,
    isAllBranches,
    liabsInstance,
    assetsInstance,
    dispatch,
    appliedDate  // NEW: Add this
]);
```

### 5. Update useEffect for loadData
**File:** `balance-sheet.tsx` (line 137-139)

Update the useEffect dependency array to watch `appliedDate`:
```typescript
useEffect(() => {
    loadData()
}, [buCode, finYearId, branchId, isAllBranches, loadData, appliedDate])
```

Note: Since `loadData` already has `appliedDate` in its dependencies, and this useEffect depends on `loadData`, the data will refresh when `appliedDate` changes.

### 6. Update lastDateOfYear Variable
**File:** `balance-sheet.tsx` (line 54)

Change from using `currentFinYear?.endDate` to use `appliedDate`:
```typescript
const lastDateOfYear = appliedDate
    ? format(parseISO(appliedDate), "do MMMM yyyy")
    : format(parseISO(currentFinYear?.endDate || ''), "do MMMM yyyy")
```

This ensures the PDF preview shows the correct selected date.

### 7. Update CustomControl Function
**File:** `balance-sheet.tsx` (lines 250-272)

Add date input with Apply button after the "All branches" switch:

```typescript
function CustomControl() {
    return (
    <div className="flex items-center justify-between">
        {/* All branches */}
        <CompSwitch className="mt-1 mr-4 ml-4" instance={CompInstances.compSwitchBalanceSheet} leftLabel="All branches" />

        {/* NEW: Date input with Apply button */}
        <div className="flex items-center gap-2 mr-4">
            <label className="font-medium text-sm">
                As on Date:
            </label>
            <input
                ref={dateInputRef}
                type="date"
                defaultValue={appliedDate || ''}
                className="px-3 py-1 text-sm border rounded-md cursor-pointer"
            />
            <button
                onClick={() => {
                    if (dateInputRef.current) {
                        setAppliedDate(dateInputRef.current.value)
                    }
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Apply
            </button>
        </div>

        <CompSyncFusionTreeGridSearchBox instance={balanceSheetInstance} handleOnChange={handleOnChangeSearchText} />

        {/* Preview Pdf balance sheet */}
        <TooltipComponent content='Preview' className="flex items-center ml-4">
            <button onClick={async () => {
                setIsDialogOpen(true)
            }}>
                <IconPreview1 className="w-8 h-8 text-blue-500" />
            </button>
        </TooltipComponent>

        {/* Refresh */}
        <TooltipComponent content='Refresh' className="">
            <WidgetButtonRefresh handleRefresh={doRefresh} />
        </TooltipComponent>
    </div>)
}
```

## Backend Considerations

**IMPORTANT:** Verify that the GraphQL query `balanceSheetProfitLoss` accepts a `toDate` parameter in sqlArgs.

- Check: `src/app/maps/graphql-queries-map.ts` or equivalent
- The backend SQL query must support filtering by toDate
- If the backend doesn't support toDate, coordinate with backend team to add this functionality

## Testing Steps

1. **Initial Load:**
   - Open Balance Sheet page
   - Verify date input shows financial year end date by default
   - Verify both Liabilities and Assets grids load correctly

2. **Date Input Editing:**
   - Click on date input and try typing/selecting a different date
   - Verify editing is smooth without lag or interruption
   - Verify data does NOT refresh while editing

3. **Apply Button:**
   - Select a different date within the financial year
   - Click Apply button
   - Verify both grids refresh with data for the selected date
   - Verify the date persists in the input field

4. **Date Validation:**
   - Try selecting dates outside the financial year range (if min/max added)
   - Verify appropriate validation

5. **Branch/Year Changes:**
   - Switch between branches using "All branches" toggle
   - Verify date resets to financial year end
   - Change financial year
   - Verify date resets to new financial year end

6. **PDF Preview:**
   - Select a custom date and click Apply
   - Click Preview button
   - Verify PDF shows the selected date (not just year end)

7. **Data Accuracy:**
   - Compare balance sheet figures at different dates
   - Verify profit/loss calculation is correct for selected date
   - Verify Assets = Liabilities balance

## Optional Enhancements

1. **Add Date Range Validation:**
   - Add `min` and `max` attributes to date input:
   ```typescript
   min={format(currentFinYear?.startDate || '', 'yyyy-MM-dd')}
   max={format(currentFinYear?.endDate || '', 'yyyy-MM-dd')}
   ```

2. **Add Loading State:**
   - Show loading indicator while data refreshes
   - Disable Apply button during loading

3. **Keyboard Support:**
   - Allow Enter key on date input to trigger Apply
   - Add onKeyDown handler to date input

4. **Visual Feedback:**
   - Highlight Apply button when date has changed but not applied
   - Show toast message on successful data load

## Files to Modify

- `src/features/accounts/final-accounts/balance-sheet.tsx`
  - Lines to add/modify: 1, ~40-50, 54, 74-77, 127-135, 137-139, 250-272

## Summary of Changes

| Change Type | Description | Lines |
|------------|-------------|-------|
| Import | Add `useRef` to imports | 1 |
| State | Add `appliedDate` state and `dateInputRef` | ~40 |
| Effect | Add initialization useEffect for date sync | ~45 |
| Update | Modify `loadData` sqlArgs to include toDate | 74-77 |
| Update | Add `appliedDate` to loadData dependencies | 127-135 |
| Update | Add `appliedDate` to useEffect dependencies | 137-139 |
| Update | Modify `lastDateOfYear` to use `appliedDate` | 54 |
| UI | Add date input with Apply button to CustomControl | 250-272 |

## Why This Approach?

Following the same pattern as Trial Balance ensures:
- **Consistency:** Users get the same experience across reports
- **Performance:** Using `useRef` makes date editing smooth
- **Control:** Users explicitly control when data refreshes via Apply button
- **Proven:** This approach already works well in Trial Balance
