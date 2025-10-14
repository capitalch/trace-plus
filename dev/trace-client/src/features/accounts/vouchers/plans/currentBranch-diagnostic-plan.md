# Current Branch Not Being Populated - Diagnostic Plan

## Problem Statement
`currentBranch` is not being populated in the Redux store, causing `branchId`, `branchName`, `branchAddress`, and `branchGstin` to be `undefined` in the `useUtilsInfo()` hook.

## Data Flow Analysis

### 1. Initial Data Load
**File:** `business-units-options.tsx:54-92`

When a business unit is selected:
1. Calls `SqlIdsMap.getSettingsFinYearsBranches` to fetch accSettings, finYears, and branches
2. Dispatches `setFinYearsBranchesAccSettings({ accSettings, finYears, branches })`
3. This populates `state.login.allBranches` array

### 2. Setting Current Branch
**File:** `fin-years-branches-options.tsx:31-49`

The `setCurrentFinYearBranch()` function:
```typescript
const currentBranchId: number = loginInfo?.userDetails?.lastUsedBranchId || 1
const currentBranchObject: BranchType | undefined = allBranches?.find(
  (b: BranchType) => b.branchId === currentBranchId
)
if (_.isEmpty(currentBranchObject)) {
    return // ← PROBLEM: Silently returns without setting branch
}
dispatch(setCurrentBranch(currentBranchObject))
```

**Triggered by:** `useEffect` when `allFinYearsBranchesSelector` changes

### 3. Current Branch Usage
**File:** `utils-info-hook.tsx:13`

```typescript
const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)
```

## Root Causes (Possible)

### Cause 1: Empty `allBranches` Array
If `allBranches` is empty or undefined:
- The SQL query `SqlIdsMap.getSettingsFinYearsBranches` is not returning branch data
- The database might not have branches configured
- The query might be failing silently

### Cause 2: Branch ID Mismatch
If `lastUsedBranchId` doesn't match any `branchId` in `allBranches`:
- The `.find()` returns `undefined`
- `_.isEmpty(undefined)` returns `true`
- Function returns early without dispatching

### Cause 3: Lodash `isEmpty` Issue
`_.isEmpty(undefined)` returns `true`, but:
- `_.isEmpty({})` also returns `true`
- If the branch object exists but has only optional fields, it might be considered "empty"

### Cause 4: Timing Issue
The `useEffect` in `fin-years-branches-options.tsx` might:
- Run before `allBranches` is fully populated
- Not re-trigger when branches data arrives

## Diagnostic Steps

### Step 1: Check if Branches Are Being Fetched
**Location:** `business-units-options.tsx:81`

Add console logging:
```typescript
const result: any = res?.data?.genericQuery?.[0]?.jsonResult
if (result) {
    console.log('Branches fetched:', result.allBranches);
    dispatch(setFinYearsBranchesAccSettings({
        accSettings: result?.allSettings,
        finYears: result.allFinYears,
        branches: result.allBranches
    }))
}
```

### Step 2: Check if `setCurrentFinYearBranch` Is Being Called
**Location:** `fin-years-branches-options.tsx:31`

Add logging at function entry:
```typescript
function setCurrentFinYearBranch() {
    const { allFinYears, allBranches } = allFinYearsBranchesSelector
    console.log('setCurrentFinYearBranch called:', {
        allFinYears: allFinYears?.length,
        allBranches: allBranches?.length,
        currentBranchId: loginInfo?.userDetails?.lastUsedBranchId
    });
    // ... rest of function
}
```

### Step 3: Check Branch Lookup Logic
**Location:** `fin-years-branches-options.tsx:34-40`

Add detailed logging:
```typescript
const currentBranchId: number = loginInfo?.userDetails?.lastUsedBranchId || 1
const currentBranchObject: BranchType | undefined = allBranches?.find(
  (b: BranchType) => b.branchId === currentBranchId
)
console.log('Branch lookup:', {
    currentBranchId,
    currentBranchObject,
    isEmpty: _.isEmpty(currentBranchObject),
    allBranchIds: allBranches?.map(b => b.branchId)
});
```

### Step 4: Check Redux Store State
Using Redux DevTools or console:
```typescript
// In browser console after app loads:
// Check if branches are in store
console.log($0) // If Redux DevTools extension installed
// OR
// Add temporary logging in component
useEffect(() => {
    console.log('Redux Login State:', {
        allBranches: allBranchesSelectorFn(store.getState()),
        currentBranch: currentBranchSelectorFn(store.getState())
    });
}, []);
```

## Potential Fixes

### Fix 1: Better Error Handling
**File:** `fin-years-branches-options.tsx:38-41`

Replace silent return with error handling:
```typescript
if (_.isEmpty(currentBranchObject)) {
    console.error('Branch not found:', {
        currentBranchId,
        availableBranches: allBranches?.map(b => b.branchId)
    });
    Utils.showErrorMessage('Branch configuration error: Branch not found');
    return;
}
```

### Fix 2: Use Nullish Check Instead of `isEmpty`
**File:** `fin-years-branches-options.tsx:38`

```typescript
if (!currentBranchObject) {
    console.error('Branch not found');
    return;
}
```

This is more explicit than `_.isEmpty()` which can be misleading.

### Fix 3: Default to First Branch if Not Found
**File:** `fin-years-branches-options.tsx:34-41`

```typescript
const currentBranchId: number = loginInfo?.userDetails?.lastUsedBranchId || 1
let currentBranchObject: BranchType | undefined = allBranches?.find(
    (b: BranchType) => b.branchId === currentBranchId
)

// Fallback to first branch if specified branch not found
if (!currentBranchObject && allBranches && allBranches.length > 0) {
    console.warn(`Branch ${currentBranchId} not found, using first available branch`);
    currentBranchObject = allBranches[0];
}

if (!currentBranchObject) {
    console.error('No branches available');
    Utils.showErrorMessage('No branches configured');
    return;
}
```

### Fix 4: Ensure SQL Query Returns Branches
**Check SQL Query:** `SqlIdsMap.getSettingsFinYearsBranches`

Verify the SQL query is correctly fetching branches:
- Check database has branch records
- Check SQL query includes branch table JOIN
- Check query results are properly mapped to `allBranches`

## Testing Checklist

After implementing fixes:

- [ ] Check browser console for branch-related logs
- [ ] Verify `allBranches` array is populated in Redux store
- [ ] Verify `currentBranch` object is set in Redux store
- [ ] Verify `useUtilsInfo()` returns valid `branchId`, `branchName`, `branchAddress`, `branchGstin`
- [ ] Test with different branches (head office and non-head office)
- [ ] Test voucher PDF generation with populated branch data
- [ ] Check if branch address displays correctly in PDF

## Recommended Next Steps

1. **Immediate:** Add console logging to diagnose where the data flow breaks
2. **Short-term:** Implement better error handling (Fix 1 or Fix 2)
3. **Long-term:** Consider fallback to first branch if configured branch not found (Fix 3)
4. **Verification:** Check database and SQL query to ensure branches are being fetched

## Files Involved

1. **src/features/layouts/nav-bar/account-options-info/business-units-options.tsx** - Fetches branches
2. **src/features/layouts/nav-bar/account-options-info/fin-years-branches-options.tsx** - Sets current branch
3. **src/utils/utils-info-hook.tsx** - Reads current branch from Redux
4. **src/features/login/login-slice.ts** - Redux state management
5. **SQL Query** - `SqlIdsMap.getSettingsFinYearsBranches` (backend/database)
