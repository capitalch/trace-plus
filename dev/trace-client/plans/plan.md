# Plan: Reset Purchases, Sales, and Returns When Business Unit, Financial Year, or Branch Changes

## Problem Statement

Similar to vouchers, purchase, sales, and return forms do not automatically reset when the user changes the Business Unit (BU), Financial Year (FY), or Branch in the status bar. This can lead to data inconsistencies where:
- A purchase/sale is being edited for one BU/FY/Branch
- User switches to different BU/FY/Branch in the status bar
- The form retains old data that belongs to the previous context
- Saving could create invalid or inconsistent data

**Requirement**: Automatically reset the following forms when any of these status bar values change:
1. Business Unit (BU)
2. Financial Year (FY)
3. Branch

**Affected Forms**:
- Purchases (`all-purchases.tsx`)
- Sales (`all-sales.tsx`)
- Purchase Returns (`all-purchase-returns.tsx`)
- Sales Returns (`all-sales-return.tsx`)

---

## Current Implementation

### File: `src/features/accounts/purchase-sales/purchases/all-purchases/all-purchases.tsx`

**Lines 92-98**: Current useUtilsInfo Hook

```typescript
const { branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();
const methods = useForm<PurchaseFormDataType>(
    {
        mode: "all",
        criteriaMode: "all",
        defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
    });
```

**Lines 202-230**: getDefaultPurchaseFormValues Function

```typescript
function getDefaultPurchaseFormValues(): PurchaseFormDataType {
    return ({
        id: undefined,
        autoRefNo: "",
        tranDate: '',
        userRefNo: null,
        remarks: null,
        tranTypeId: 5,
        isGstInvoice: hasGstin,
        isIgst: false,

        debitAccId: null,
        creditAccId: null,
        gstin: null,

        purchaseLineItems: [],

        totalInvoiceAmount: 0,
        totalQty: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,

        branchId: branchId || 1,        // ← Uses current branchId
        deletedIds: [],
        finYearId: finYearId || 0,      // ← Uses current finYearId
        toggle: true
    });
}
```

**Lines 336-341**: Existing resetAll Function

```typescript
function resetAll() {
    clearErrors()
    reset(getDefaultPurchaseFormValues());
    dispatch(clearPurchaseFormData());
    dispatch(setInvoicExists(false))
}
```

**Existing Reset Triggers**:
- Line 120: Reset when switching to View tab
- Line 194: Reset after successful save (if not coming from report)

---

## Issue Analysis

### The Problem

The purchase, sales, and return forms do **NOT** automatically reset when:
- User changes Business Unit in status bar
- User changes Financial Year in status bar
- User changes Branch in status bar

### Why This Is Problematic

**Scenario**:
1. User creates a purchase for BU "Wholesale", FY "2023-24", Branch "Delhi"
2. Adds products, sets supplier account, enters invoice details
3. User switches BU to "Retail" in status bar
4. Purchase form still shows line items meant for "Wholesale" BU
5. If user saves, data goes to wrong BU context

**Data Consistency Risk**:
- Purchases could be saved with incorrect finYearId
- Purchases could be saved with incorrect branchId
- Account selections might be invalid for the new BU
- Product associations might be wrong for different BU
- Invoice numbering could become inconsistent
- Historical data could become corrupted

---

## Available Redux Selectors

From `login-slice.ts:256-279`:

```typescript
export const currentBusinessUnitSelectorFn = (state: RootStateType) =>
  state.login.currentBusinessUnit

export const currentFinYearSelectorFn = (state: RootStateType) =>
  state.login.currentFinYear

export const currentBranchSelectorFn = (state: RootStateType) =>
  state.login.currentBranch
```

These selectors return:
- `currentBusinessUnit`: `BusinessUnitType` with `buId`, `buCode`, `buName`
- `currentFinYear`: `FinYearType` with `finYearId`, `startDate`, `endDate`
- `currentBranch`: `BranchType` with `branchId`, `branchName`, `branchCode`

---

## Solution Design

### Approach: useEffect with Dependency Array

Add a `useEffect` hook that watches for changes in:
1. `currentBusinessUnit?.buId`
2. `currentFinYear?.finYearId`
3. `currentBranch?.branchId`

When any of these change, call `resetAll()` to clear the form.

This is the **exact same approach** as vouchers for consistency.

---

## Implementation for Each Form

### Form 1: All Purchases

**File**: `src/features/accounts/purchase-sales/purchases/all-purchases/all-purchases.tsx`

#### Change 1: Import Selectors (After line 22)

```typescript
import {
    currentBusinessUnitSelectorFn,
    currentFinYearSelectorFn,
    currentBranchSelectorFn
} from "../../../../login/login-slice";
```

#### Change 2: Select Current Values (After line 92)

```typescript
// Watch for changes in BU, FY, Branch for automatic reset
const currentBusinessUnit = useSelector(currentBusinessUnitSelectorFn);
const currentFinYear = useSelector(currentFinYearSelectorFn);
const currentBranch = useSelector(currentBranchSelectorFn);
```

#### Change 3: Add Reset Effect (After line 130)

```typescript
// Reset form when BU, Financial Year, or Branch changes in status bar
useEffect(() => {
    // Skip reset on initial mount (when all values are undefined)
    if (!currentBusinessUnit || !currentFinYear || !currentBranch) {
        return;
    }

    // Reset the form to clear any stale data from previous context
    resetAll();
}, [currentBusinessUnit?.buId, currentFinYear?.finYearId, currentBranch?.branchId]);
```

---

### Form 2: All Sales

**File**: `src/features/accounts/purchase-sales/sales/all-sales.tsx`

**Apply the exact same pattern**:
1. Import selectors
2. Add useSelector calls
3. Add useEffect with reset logic

**Note**: Sales form structure should be similar to purchases.

---

### Form 3: All Purchase Returns

**File**: `src/features/accounts/purchase-sales/purchase-returns/all-purchase-returns/all-purchase-returns.tsx`

**Apply the exact same pattern**:
1. Import selectors
2. Add useSelector calls
3. Add useEffect with reset logic

---

### Form 4: All Sales Returns

**File**: `src/features/accounts/purchase-sales/sales-return/all-sales-return.tsx`

**Apply the exact same pattern**:
1. Import selectors
2. Add useSelector calls
3. Add useEffect with reset logic

---

## Why This Solution Works

### 1. Dependency Array

```typescript
[currentBusinessUnit?.buId, currentFinYear?.finYearId, currentBranch?.branchId]
```

- Watches only the ID fields (primitive values)
- React detects changes using `Object.is()` comparison
- Triggers effect when any ID changes

### 2. Initial Mount Guard

```typescript
if (!currentBusinessUnit || !currentFinYear || !currentBranch) {
    return;
}
```

- Prevents reset on component mount when values are loading
- Only resets on actual changes after initial load

### 3. Reuses Existing resetAll()

```typescript
resetAll();
```

For **Purchases**:
- Clears form errors (line 337)
- Resets to default values with updated finYearId/branchId (line 338)
- Clears Redux saved form data (line 339)
- Clears invoice exists flag (line 340)

**Other forms** should have similar resetAll() logic.

### 4. Safe Reset Logic

The `resetAll()` function:
- Gets fresh default values with updated finYearId/branchId
- Clears all line items (purchases/sales details)
- Clears all form errors
- Clears saved form data from Redux
- Resets form-specific flags (like invoiceExists)

---

## Edge Cases

### Edge Case 1: User Has Unsaved Line Items

**Scenario**: User added multiple purchase/sale line items, then changes BU/FY/Branch

**Behavior**: Form resets immediately, losing all unsaved line items

**Options**:

#### Option A: Silent Reset (Recommended)
- Reset without warning
- User expects context switch to reset form
- Status bar changes are explicit user actions
- Matches vouchers behavior

#### Option B: Confirm Before Reset
- Show confirmation dialog
- "You have unsaved changes. Switching will reset the form. Continue?"
- Better UX but adds complexity
- Inconsistent with vouchers

**Recommendation**: **Option A (Silent Reset)**
- Consistency across all transaction forms
- Status bar changes are deliberate
- Users learn the behavior quickly

---

### Edge Case 2: Invoice Exists Check

**Scenario** (Purchases): User enters invoice number, invoice exists check runs, then user changes BU

**Behavior**: Form resets, clearing invoice exists error

**Result**: ✅ Correct - different BU = different invoice namespace

---

### Edge Case 3: Product Line Items

**Scenario**: User adds 10 products to purchase, then changes FY

**Behavior**: All line items cleared

**Result**: ✅ Correct - products might have different pricing/availability in different FY/BU

---

### Edge Case 4: GST Invoice Flag

**Scenario**: User checks "GST Invoice", enters GSTIN, then changes BU

**Behavior**: Form resets, GST invoice flag reset to default based on new BU's hasGstin

**Result**: ✅ Correct - new BU might have different GST configuration

---

### Edge Case 5: Edit Mode

**Scenario**: User editing existing purchase (has id), then changes BU

**Behavior**: Form resets, id cleared

**Result**: ✅ Correct - cannot edit purchase from different BU context

---

## Testing Checklist

### For Each Form (Purchases, Sales, Purchase Returns, Sales Returns)

**Functional Testing**

- [ ] **BU Change**: Create entry, change BU, verify reset
- [ ] **FY Change**: Create entry, change FY, verify reset
- [ ] **Branch Change**: Create entry, change Branch, verify reset
- [ ] **Multiple Changes**: Create entry, change BU → FY → Branch, verify resets
- [ ] **Line Items**: Add line items, change context, verify cleared
- [ ] **Edit Mode**: Edit existing entry, change context, verify reset
- [ ] **Initial Mount**: Navigate to form, verify no unwanted reset
- [ ] **Saved Form Data**: Fill form, navigate away, navigate back, change context, verify reset

**Purchase-Specific Testing**

- [ ] Invoice exists check cleared after reset
- [ ] Invoice number field error cleared
- [ ] Credit/debit account cleared
- [ ] GSTIN field cleared

**Sales-Specific Testing**

- [ ] Customer account cleared
- [ ] Sales line items cleared
- [ ] Sales-specific flags reset

**Returns-Specific Testing**

- [ ] Original invoice reference cleared
- [ ] Return line items cleared
- [ ] Return-specific calculations reset

---

## Files to Modify

### Priority 1: Core Transaction Forms

1. **`src/features/accounts/purchase-sales/purchases/all-purchases/all-purchases.tsx`**
   - Main purchase entry form
   - ~395 lines
   - Has resetAll() function (line 336)

2. **`src/features/accounts/purchase-sales/sales/all-sales.tsx`**
   - Main sales entry form
   - Should have similar structure
   - Need to verify resetAll() exists

3. **`src/features/accounts/purchase-sales/purchase-returns/all-purchase-returns/all-purchase-returns.tsx`**
   - Purchase return form
   - Should have resetAll() function

4. **`src/features/accounts/purchase-sales/sales-return/all-sales-return.tsx`**
   - Sales return form
   - Should have resetAll() function

---

## Implementation Steps

### Step 1: All Purchases (20 minutes)

**File**: `src/features/accounts/purchase-sales/purchases/all-purchases/all-purchases.tsx`

**Location 1** (After line 22): Add import
**Location 2** (After line 92): Add selectors
**Location 3** (After line 130): Add effect

**Test**: Create purchase, change BU/FY/Branch, verify reset

---

### Step 2: All Sales (15 minutes)

**File**: `src/features/accounts/purchase-sales/sales/all-sales.tsx`

**Actions**: Apply same 3 changes
**Test**: Create sale, change BU/FY/Branch, verify reset

---

### Step 3: All Purchase Returns (15 minutes)

**File**: `src/features/accounts/purchase-sales/purchase-returns/all-purchase-returns/all-purchase-returns.tsx`

**Actions**: Apply same 3 changes
**Test**: Create return, change BU/FY/Branch, verify reset

---

### Step 4: All Sales Returns (15 minutes)

**File**: `src/features/accounts/purchase-sales/sales-return/all-sales-return.tsx`

**Actions**: Apply same 3 changes
**Test**: Create return, change BU/FY/Branch, verify reset

---

### Step 5: Regression Testing (20 minutes)

**Actions**:
- Test all forms together
- Test context switching between forms
- Verify no side effects

**Total Time**: ~85 minutes (~1.5 hours)

---

## Code Template

For consistency, use this template for each form:

```typescript
// === IMPORTS ===
import {
    currentBusinessUnitSelectorFn,
    currentFinYearSelectorFn,
    currentBranchSelectorFn
} from "../../../../login/login-slice";

// === INSIDE COMPONENT ===
export function FormComponent() {
    // ... existing code ...

    const { branchId, finYearId, buCode, /* ... */ } = useUtilsInfo();

    // Watch for changes in BU, FY, Branch for automatic reset
    const currentBusinessUnit = useSelector(currentBusinessUnitSelectorFn);
    const currentFinYear = useSelector(currentFinYearSelectorFn);
    const currentBranch = useSelector(currentBranchSelectorFn);

    // ... other hooks ...

    // Reset form when BU, Financial Year, or Branch changes in status bar
    useEffect(() => {
        // Skip reset on initial mount (when all values are undefined)
        if (!currentBusinessUnit || !currentFinYear || !currentBranch) {
            return;
        }

        // Reset the form to clear any stale data from previous context
        resetAll();
    }, [currentBusinessUnit?.buId, currentFinYear?.finYearId, currentBranch?.branchId]);

    // ... rest of component ...
}
```

---

## Risk Assessment

### Low Risk

- ✅ Small, isolated changes (~15 lines per file)
- ✅ Reuses existing `resetAll()` functions
- ✅ No logic changes to reset behavior
- ✅ Guard clause prevents unwanted resets
- ✅ Easy to rollback
- ✅ Same pattern as vouchers (already proven)

### No Breaking Changes

- ✅ Existing reset triggers unchanged
- ✅ Form behavior unchanged (except for new automatic reset)
- ✅ No API changes
- ✅ No database changes
- ✅ No changes to save logic

---

## Success Criteria

### Definition of Done

**For Each Form**:
1. ✅ Form resets when Business Unit changes
2. ✅ Form resets when Financial Year changes
3. ✅ Form resets when Branch changes
4. ✅ No reset on initial component mount
5. ✅ Line items cleared after reset
6. ✅ Form errors cleared after reset
7. ✅ Saved form data cleared after reset
8. ✅ No console errors
9. ✅ No TypeScript errors
10. ✅ All test cases pass

---

## Comparison with Vouchers

### Similarities

✅ Same Redux selectors used
✅ Same useEffect pattern
✅ Same dependency array
✅ Same guard clause
✅ Same resetAll() approach
✅ Same edge cases

### Differences

⚠️ Vouchers: Single file (`all-vouchers.tsx`)
⚠️ Purchases/Sales: 4 separate files

⚠️ Vouchers: Simpler line items (debit/credit entries)
⚠️ Purchases/Sales: Complex line items (products, GST, quantities)

⚠️ Vouchers: No invoice exists check
⚠️ Purchases: Invoice exists validation needs clearing

### Why Same Pattern Works

- All are transaction forms
- All tied to BU/FY/Branch context
- All have resetAll() functions
- All use React Hook Form
- All store saved data in Redux
- All need same context consistency

---

## Summary

**Problem**: Purchase, sales, and return forms don't reset when BU/FY/Branch changes in status bar

**Root Cause**: No automatic reset mechanism watching for context changes

**Solution**: Add `useEffect` hook that watches Redux state for currentBusinessUnit, currentFinYear, and currentBranch changes, and calls `resetAll()` when detected

**Files to Modify** (4 files):
1. `src/features/accounts/purchase-sales/purchases/all-purchases/all-purchases.tsx`
2. `src/features/accounts/purchase-sales/sales/all-sales.tsx`
3. `src/features/accounts/purchase-sales/purchase-returns/all-purchase-returns/all-purchase-returns.tsx`
4. `src/features/accounts/purchase-sales/sales-return/all-sales-return.tsx`

**Changes Per File**:
- Import 3 Redux selectors
- Add 3 `useSelector` calls
- Add 1 `useEffect` with reset logic

**Lines Changed**: ~15 lines per file (~60 lines total)

**Risk**: Low (same proven pattern as vouchers)

**Time Estimate**: 85 minutes (20 + 15 + 15 + 15 + 20 for testing)

**Consistency**: Exact same pattern as vouchers for predictable behavior

---

Ready to implement ✅
