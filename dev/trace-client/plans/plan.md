# Plan: Fix Redux State Persistence Issues on Logout

## Problem 1: Redux State Not Resetting on Logout

### Root Cause
In `src/app/store.ts:40-44`, the `reducerWithReset` function attempts to reset state by assigning `state = undefined`:
```javascript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // ❌ This doesn't work!
  }
  return rootReducer(state, action);
};
```

**Why this fails**: Reassigning the `state` parameter only changes the local variable reference, not the actual Redux state.

---

## Problem 2: Form Data Persists After Logout (Race Condition)

### Root Cause
Even after fixing Problem 1, there's a **timing issue** where form data is saved AFTER the logout action:

**Order of operations when user logs out**:
1. User clicks logout button (`logout-menu-button.tsx:127-132`)
2. `dispatch(doLogout())` is called → Redux state is reset
3. `navigate('/login')` is called → React Router changes route
4. Current route components unmount (e.g., AllSales, AllPurchases, etc.)
5. **Component cleanup functions run** (`all-sales.tsx:73-78`)
6. `dispatch(saveSalesFormData(data))` executes → **Form data is saved BACK to Redux!**
7. Result: savedFormData has values again despite logout

### Example from all-sales.tsx (lines 73-78):
```javascript
useEffect(() => {
    return (() => {
        const data = getSerializedFormData()
        dispatch(saveSalesFormData(data));  // ⚠️ Runs on unmount, AFTER logout
    })
}, [dispatch, getValues])
```

### Affected Slices
All slices with `savedFormData` property:
1. `sales` (sales-slice.ts)
2. `purchase` (purchase-slice.ts)
3. `purchaseReturn` (purchase-return-slice.ts)
4. `salesReturn` (sales-return-slice.ts)
5. `debitNotes` (debit-notes-slice.ts)
6. `creditNotes` (credit-notes-slice.ts)
7. `vouchers` (voucher-slice.ts)

---

## Solution Strategy

### Fix 1: Correct the `reducerWithReset` Function ✅
**File**: `src/app/store.ts` (line 40-45)

**Change from**:
```javascript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // ❌ Doesn't work
  }
  return rootReducer(state, action);
};
```

**Change to**:
```javascript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    return rootReducer(undefined, action); // ✅ Correct - passes undefined to all reducers
  }
  return rootReducer(state, action);
};
```

**Why this works**: Passes `undefined` to `rootReducer`, which distributes it to all slice reducers. Each reducer sees `undefined` state and returns its `initialState`.

---

### Fix 2: Prevent Form Data from Being Saved After Logout ✅

We have **3 options** to prevent the race condition:

#### **Option A: Add extraReducers to Each Slice (Recommended)**
Add `extraReducers` to each slice that listens for `doLogout` action and resets `savedFormData`:

**Example for sales-slice.ts**:
```javascript
import { doLogout } from "../../login/login-slice";

const salesSlice = createSlice({
    name: 'sales',
    initialState: initialState,
    reducers: {
        // ... existing reducers
    },
    extraReducers: (builder) => {
        builder.addCase(doLogout, (state) => {
            return initialState; // Reset entire state to initial values
        });
    }
})
```

**Pros**:
- Centralized in the slice definition
- Works regardless of component unmount timing
- Explicitly handles logout at the reducer level

**Cons**:
- Requires changes to 7 different slice files

---

#### **Option B: Check isLoggedIn Before Saving in Cleanup**
Modify cleanup functions to check if user is still logged in before saving:

**Example for all-sales.tsx** (lines 73-78):
```javascript
useEffect(() => {
    return (() => {
        const reduxState = Utils.getReduxState();
        if (reduxState.login.isLoggedIn) {  // ✅ Only save if still logged in
            const data = getSerializedFormData();
            dispatch(saveSalesFormData(data));
        }
    })
}, [dispatch, getValues])
```

**Pros**:
- Simple logic
- Fixes the root cause (don't save when logging out)

**Cons**:
- Requires changes to multiple component files (7+ files)
- Relies on checking Redux state in cleanup function
- State might already be reset by the time cleanup runs

---

#### **Option C: Combined Approach (Most Robust)**
Implement both Fix 1 and Option A:
1. Fix `reducerWithReset` to properly reset state
2. Add `extraReducers` to all slices to explicitly handle `doLogout`

**Pros**:
- Double protection against state persistence
- Most reliable solution
- State reset happens at reducer level, immune to timing issues

**Cons**:
- More code changes

---

## Recommended Implementation Plan

### Step 1: Fix `reducerWithReset` (Critical)
**File**: `src/app/store.ts:40-45`

```javascript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
```

### Step 2: Add `extraReducers` to All Slices (Recommended)
Add to these 7 files:

1. **sales-slice.ts**
2. **purchase-slice.ts**
3. **purchase-return-slice.ts**
4. **sales-return-slice.ts**
5. **debit-notes-slice.ts**
6. **credit-notes-slice.ts**
7. **voucher-slice.ts**

**Pattern to add**:
```javascript
import { doLogout } from "../../login/login-slice"; // Add import

const XxxSlice = createSlice({
    name: 'xxx',
    initialState: initialState,
    reducers: {
        // existing reducers...
    },
    extraReducers: (builder) => {
        builder.addCase(doLogout, () => {
            return initialState; // Reset to initial state on logout
        });
    }
})
```

### Step 3: Test the Fix
1. Log in to the application
2. Navigate to Sales/Purchase/Voucher forms
3. Fill in some form data
4. Click logout button
5. **Verify**: Redux state is completely reset (use Redux DevTools)
6. **Verify**: `savedFormData` is `null` for all slices
7. **Verify**: User is redirected to `/login`
8. Log in again
9. **Verify**: Forms start with default/empty values

---

## Alternative: Simpler Approach (If Time Constrained)

If implementing extraReducers in 7 files is too time-consuming, we can use **Option B** as a quick fix:

### Modify Cleanup Functions to Check Login State

**Pattern for all form components**:
```javascript
useEffect(() => {
    return (() => {
        const reduxState = Utils.getReduxState();
        if (reduxState.login.isLoggedIn) {
            const data = getSerializedFormData();
            dispatch(saveXxxFormData(data));
        }
    })
}, [dispatch, getValues])
```

**Files to modify** (7+ files):
- `src/features/accounts/purchase-sales/sales/all-sales.tsx`
- `src/features/accounts/purchase-sales/purchases/*.tsx`
- `src/features/accounts/purchase-sales/purchase-returns/*.tsx`
- `src/features/accounts/purchase-sales/sales-return/*.tsx`
- `src/features/accounts/purchase-sales/debit-notes/*.tsx`
- `src/features/accounts/purchase-sales/credit-notes/*.tsx`
- `src/features/accounts/vouchers/*.tsx`

---

## Summary

### Required Changes:
1. **Fix `reducerWithReset`** in `store.ts` (1 file) - **CRITICAL**

### Recommended Additional Changes:
2. **Add `extraReducers`** to all 7 slice files - **RECOMMENDED**

### Optional Cleanup:
3. Remove commented line `// state = undefined` from `login-slice.ts:47`
4. Remove manual property resets in `doLogout` reducer (lines 33-46) since state reset now happens at store level

### Expected Result:
- All Redux state (including `savedFormData`) properly resets to `undefined`/`initialState` on logout
- No form data persists after logout
- Clean slate when user logs in again
