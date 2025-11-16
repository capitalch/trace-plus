# Plan: Fix Sales Form Data Persistence

## Problem
Sales form data is lost when navigating away and coming back. The form should persist data temporarily so users can navigate to other pages and return without losing their work.

## Root Cause Analysis

### Issue 1: Cleanup Function Missing Dependencies (CRITICAL)
**Location:** `all-sales.tsx` lines 72-77

```typescript
useEffect(() => {
    return (() => {
        const data = getSerializedFormData()
        dispatch(saveSalesFormData(data));
    })
}, [dispatch, getValues])  // ❌ Has getValues but doesn't use it correctly
```

**Problem:**
- The cleanup function captures `getSerializedFormData` which internally calls `getValues()`
- But `getValues` in the dependency array doesn't trigger the effect to re-register
- This creates a stale closure - the cleanup might save OLD data, not current data
- The cleanup function should directly access current form values

### Issue 2: resetAll() Clears Saved Data Prematurely
**Location:** `all-sales.tsx` lines 105-107, 380-386

```typescript
// Line 105-107: Triggers on business context change
useEffect(() => {
    resetAll();
}, [buCode, finYearId, branchId]);

// Line 380-386: resetAll implementation
function resetAll() {
    clearErrors()
    reset(getDefaultSalesFormValues());
    dispatch(clearSalesFormData());  // ❌ Clears saved data immediately
    dispatch(clearSearchQuery());
    scrollToTop();
}
```

**Problem:**
- When business context (buCode/finYearId/branchId) changes, resetAll() is called
- This calls `clearSalesFormData()` which deletes the Redux saved data
- This is correct behavior - changing business context should clear the form
- However, if this happens while navigating, it clears data before it's saved

### Issue 3: Race Condition on Navigation
**Timeline of events when navigating away:**
1. User navigates away from sales form
2. Component starts unmounting
3. Cleanup function tries to save data (line 72-77)
4. **BUT** if buCode/finYearId/branchId changed, resetAll() runs first
5. resetAll() clears saved data (line 383)
6. Cleanup function saves data to Redux
7. User navigates back
8. **RESULT:** Saved data might be from the wrong business context OR might be cleared

### Issue 4: No Check for Empty/Default Data
**Location:** `all-sales.tsx` line 74

```typescript
const data = getSerializedFormData()
dispatch(saveSalesFormData(data));
```

**Problem:**
- Saves data even if it's just default values (empty form)
- No validation that there's actual user data worth saving
- Wastes Redux state with empty forms

---

## Solution Approach

### Fix 1: Improve Cleanup Function with Proper Closure
**Goal:** Ensure cleanup always saves the LATEST form data

**Change:**
```typescript
useEffect(() => {
    return () => {
        // Direct access to current values via getValues() at cleanup time
        const currentFormData = getValues();
        const serializedData = {
            ...currentFormData,
            totalInvoiceAmount: String(currentFormData.totalInvoiceAmount),
            totalQty: String(currentFormData.totalQty),
            totalCgst: String(currentFormData.totalCgst),
            totalSgst: String(currentFormData.totalSgst),
            totalIgst: String(currentFormData.totalIgst),
            totalSubTotal: String(currentFormData.totalSubTotal),
            totalDebitAmount: String(currentFormData.totalDebitAmount)
        };

        // Only save if form has meaningful data (not just defaults)
        const hasData = currentFormData.id ||
                       currentFormData.salesLineItems?.length > 0 ||
                       currentFormData.contactsData !== null;

        if (hasData) {
            dispatch(saveSalesFormData(serializedData));
        }
    };
}, [dispatch, getValues]);
```

### Fix 2: Conditional Clear in resetAll()
**Goal:** Only clear saved data when explicitly resetting, not on every business context change

**Option A: Don't clear on business context change (Recommended)**
```typescript
// Remove line 383 from resetAll()
function resetAll() {
    clearErrors()
    reset(getDefaultSalesFormValues());
    // dispatch(clearSalesFormData());  // ❌ REMOVE THIS
    dispatch(clearSearchQuery());
    scrollToTop();
}

// Only clear saved data after successful save or explicit clear
function finalizeAndSubmit() {
    // ... existing save logic ...

    if (!location.state?.id) {
        resetAll();
        dispatch(clearSalesFormData());  // ✅ Clear AFTER reset
    }
}
```

**Option B: Add parameter to resetAll() for conditional clear**
```typescript
function resetAll(clearSaved: boolean = false) {
    clearErrors()
    reset(getDefaultSalesFormValues());
    if (clearSaved) {
        dispatch(clearSalesFormData());
    }
    dispatch(clearSearchQuery());
    scrollToTop();
}

// Call with parameter when needed
useEffect(() => {
    resetAll(true);  // Clear saved data on business context change
}, [buCode, finYearId, branchId]);
```

### Fix 3: Validate Business Context on Load
**Goal:** Don't load saved data if business context has changed

```typescript
// Add business context to saved form data
function getSerializedFormData() {
    const formData = getValues()
    const serFormData = {
        ...formData,
        totalInvoiceAmount: String(formData.totalInvoiceAmount),
        totalQty: String(formData.totalQty),
        totalCgst: String(formData.totalCgst),
        totalSgst: String(formData.totalSgst),
        totalIgst: String(formData.totalIgst),
        totalSubTotal: String(formData.totalSubTotal),
        totalDebitAmount: String(formData.totalDebitAmount),
        // Add context
        _savedBuCode: buCode,
        _savedFinYearId: finYearId,
        _savedBranchId: branchId
    }
    return (serFormData)
}

// Check context before loading
useEffect(() => {
    if (savedFormData) {
        // Validate business context matches
        const contextMatches =
            savedFormData._savedBuCode === buCode &&
            savedFormData._savedFinYearId === finYearId &&
            savedFormData._savedBranchId === branchId;

        if (contextMatches) {
            reset(_.cloneDeep(getDeserializedFormData(savedFormData)));
            setTimeout(() => {
                setValue('toggle', !savedFormData.toggle, { shouldDirty: true });
            }, 0);
        } else {
            // Context changed, clear invalid saved data
            dispatch(clearSalesFormData());
        }
    }
}, [savedFormData, reset, setValue, buCode, finYearId, branchId, dispatch]);
```

---

## Recommended Implementation

### Step 1: Fix Cleanup Function (PRIORITY 1)
**File:** `src/features/accounts/purchase-sales/sales/all-sales.tsx`
**Lines:** 72-77

**Replace:**
```typescript
useEffect(() => {
    return (() => {
        const data = getSerializedFormData()
        dispatch(saveSalesFormData(data));
    })
}, [dispatch, getValues])
```

**With:**
```typescript
useEffect(() => {
    return () => {
        // Get current form values at cleanup time
        const currentFormData = getValues();

        // Only save if form has meaningful data
        const hasData = currentFormData.id ||
                       currentFormData.salesLineItems?.length > 0 ||
                       currentFormData.contactsData !== null ||
                       currentFormData.debitAccounts?.some(acc => acc.accId);

        if (hasData) {
            const serializedData = {
                ...currentFormData,
                totalInvoiceAmount: String(currentFormData.totalInvoiceAmount),
                totalQty: String(currentFormData.totalQty),
                totalCgst: String(currentFormData.totalCgst),
                totalSgst: String(currentFormData.totalSgst),
                totalIgst: String(currentFormData.totalIgst),
                totalSubTotal: String(currentFormData.totalSubTotal),
                totalDebitAmount: String(currentFormData.totalDebitAmount),
                // Save business context for validation
                _savedBuCode: buCode,
                _savedFinYearId: finYearId,
                _savedBranchId: branchId
            };
            dispatch(saveSalesFormData(serializedData));
        }
    };
}, [dispatch, getValues, buCode, finYearId, branchId]);
```

### Step 2: Add Business Context Validation (PRIORITY 1)
**File:** `src/features/accounts/purchase-sales/sales/all-sales.tsx`
**Lines:** 62-70

**Replace:**
```typescript
useEffect(() => {
    if (savedFormData) {
        reset(_.cloneDeep(getDeserializedFormData(savedFormData)));
        setTimeout(() => {
            setValue('toggle', !savedFormData.toggle, { shouldDirty: true });
        }, 0);
    }
}, [savedFormData, reset, setValue]);
```

**With:**
```typescript
useEffect(() => {
    if (savedFormData) {
        // Validate business context matches saved data
        const contextMatches =
            savedFormData._savedBuCode === buCode &&
            savedFormData._savedFinYearId === finYearId &&
            savedFormData._savedBranchId === branchId;

        if (contextMatches) {
            reset(_.cloneDeep(getDeserializedFormData(savedFormData)));
            setTimeout(() => {
                setValue('toggle', !savedFormData.toggle, { shouldDirty: true });
            }, 0);
        } else {
            // Context changed, clear invalid saved data
            console.warn('Business context changed, clearing stale saved data');
            dispatch(clearSalesFormData());
        }
    }
}, [savedFormData, reset, setValue, buCode, finYearId, branchId, dispatch]);
```

### Step 3: Remove clearSalesFormData from resetAll (PRIORITY 2)
**File:** `src/features/accounts/purchase-sales/sales/all-sales.tsx`
**Lines:** 380-386

**Replace:**
```typescript
function resetAll() {
    clearErrors()
    reset(getDefaultSalesFormValues());
    dispatch(clearSalesFormData());
    dispatch(clearSearchQuery());
    scrollToTop();
}
```

**With:**
```typescript
function resetAll() {
    clearErrors()
    reset(getDefaultSalesFormValues());
    // Don't clear saved data here - let cleanup handle it
    // dispatch(clearSalesFormData());
    dispatch(clearSearchQuery());
    scrollToTop();
}
```

### Step 4: Clear Saved Data After Successful Submit (PRIORITY 2)
**File:** `src/features/accounts/purchase-sales/sales/all-sales.tsx`
**Lines:** 161-163

**Replace:**
```typescript
if (!location.state?.id) {
    resetAll();
}
```

**With:**
```typescript
if (!location.state?.id) {
    resetAll();
    dispatch(clearSalesFormData());  // Clear saved data after reset
}
```

---

## Testing Checklist

### Test 1: Basic Persistence
- [ ] Fill out sales form partially
- [ ] Navigate to a different page (e.g., Reports)
- [ ] Navigate back to Sales
- [ ] **Verify:** Form data is restored

### Test 2: Empty Form Not Saved
- [ ] Open fresh sales form (no data entered)
- [ ] Navigate away
- [ ] Navigate back
- [ ] **Verify:** Form is still empty (no unnecessary save)

### Test 3: Business Context Change
- [ ] Fill out sales form
- [ ] Navigate away (data saved)
- [ ] Change Business Unit or Branch
- [ ] Navigate to Sales
- [ ] **Verify:** Form is reset (old data not loaded because context changed)

### Test 4: After Successful Save
- [ ] Fill out complete sales form
- [ ] Submit successfully
- [ ] Navigate away
- [ ] Navigate back to Sales
- [ ] **Verify:** Form is empty (saved data was cleared after submit)

### Test 5: Navigation from Report (Edit Mode)
- [ ] Navigate from report to edit a sale
- [ ] Sales form loads with data
- [ ] Make changes
- [ ] Navigate away WITHOUT saving
- [ ] Navigate back to Sales
- [ ] **Verify:** Form shows NEW sale (not the edited one, because edit mode shouldn't persist)

### Test 6: Multiple Business Contexts
- [ ] Fill sales form in BU1
- [ ] Navigate away (data saved for BU1)
- [ ] Switch to BU2
- [ ] Go to Sales
- [ ] **Verify:** Form is empty (BU1 data not loaded)
- [ ] Fill form in BU2
- [ ] Navigate away
- [ ] Switch back to BU1
- [ ] Go to Sales
- [ ] **Verify:** Form is empty (BU2 data not loaded, BU1 data was cleared)

---

## Files to Modify

- ✅ `src/features/accounts/purchase-sales/sales/all-sales.tsx` (lines 62-77, 161-163, 380-386)

---

## Benefits

✅ **Reliable persistence** - Form data saved at unmount time with current values
✅ **Context-aware** - Doesn't load data from different business context
✅ **Efficient** - Only saves when there's meaningful data
✅ **Clean state** - Clears data after successful save
✅ **No race conditions** - Proper cleanup timing

---

## Notes

- The cleanup function in useEffect runs when component unmounts OR when dependencies change
- Using `getValues()` directly in cleanup ensures we get the LATEST form values
- Adding business context to saved data prevents loading stale data
- Not clearing in resetAll() allows natural cleanup to handle persistence
