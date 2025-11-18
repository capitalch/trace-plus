# Plan: Fix Redux Store and Global Context Cleanup on Logout

## Problem
After logout, Redux store and Global Context still contain values from the previous session. Although there's existing cleanup logic in `store.ts` and `resetGlobalContext()` is being called, the cleanup may not be complete or working correctly.

## Current Implementation Analysis

### What's Already in Place (store.ts:40-45):
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // this resets all slices
  }
  return rootReducer(state, action);
};
```

**This SHOULD reset the entire Redux store when `doLogout` action is dispatched.**

### Logout Flow (logout-menu-button.tsx:127-132):
```typescript
function handleOnLogout() {
    handleOnClickAway() // Otherwise the menu remains open
    resetGlobalContext(context)
    dispatch(doLogout())
    navigate('/login')
}
```

**Current sequence:**
1. Close dropdown menu
2. Reset global context (React Context API) ✅ Already implemented
3. Dispatch `doLogout()` action
4. Navigate to login page

### Global Context Reset (global-context.tsx:12-16):
```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
  // globalContext.DataInstances = {};
}
```

**Issue:** `DataInstances` is commented out and NOT being cleared! This could leave residual data.

### doLogout Action (login-slice.ts:32-47):
```typescript
doLogout: (state: LoginType) => {
  state.accSettings = undefined
  state.allBranches = undefined
  state.allBusinessUnits = undefined
  state.allFinYears = undefined
  state.allSecuredControls = undefined
  state.currentBranch = undefined
  state.currentBusinessUnit = undefined
  state.currentFinYear = undefined
  state.isLoggedIn = false
  state.role = undefined
  state.token = undefined
  state.userBusinessUnits = undefined
  state.userDetails = undefined
  state.userSecuredControls = undefined
},
```

**This manually clears only the `login` slice, but the `reducerWithReset` in store.ts should clear ALL slices.**

## Root Cause Analysis

The issue is that **both mechanisms are conflicting**:

1. **login-slice.ts** manually clears only login state fields
2. **store.ts** tries to reset the entire state to `undefined`

**Problem:** When `doLogout` action runs:
- First, it goes through `reducerWithReset` which sets `state = undefined`
- Then, it passes to `rootReducer` with `undefined` state
- `rootReducer` initializes ALL slices to their `initialState`
- BUT, the `doLogout` reducer in login-slice also runs
- This might interfere with the full reset

## Potential Issues

### Issue 1: Reducer Execution Order
The `doLogout` reducer in login-slice might be executing, but since state is already `undefined`, it might not properly clear values.

### Issue 2: Persisted State
If using Redux Persist or similar, state might be persisted and restored after logout.

### Issue 3: Async Operations
If there are pending async operations (thunks, API calls), they might restore data after logout.

### Issue 4: React Component State
Some values might be in React component state (useState, useRef) rather than Redux.

### Issue 5: Global Context Not Fully Cleared
The `resetGlobalContext()` function has `DataInstances` cleanup commented out. This means deleted IDs and other data in `DataInstances` will persist across logout/login sessions.

## Solution

### Recommended Fix: Complete Cleanup of Both Redux and Global Context

1. Remove redundant manual clearing from `login-slice.ts` and rely solely on the `reducerWithReset` in `store.ts`
2. Enable complete Global Context reset by uncommenting `DataInstances` cleanup

## Implementation Steps

### Step 1: Fix Global Context Reset - Enable DataInstances Cleanup
**File:** `src/app/global-context.tsx`
**Lines:** 12-16

**Action:** Uncomment the `DataInstances` reset to ensure complete cleanup

**Before:**
```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
  // globalContext.DataInstances = {};
}
```

**After:**
```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
  globalContext.DataInstances = {}; // ✅ Uncommented - clear deleted IDs and data
}
```

**Why this matters:**
- `DataInstances` stores deleted IDs and other transient data
- Without clearing, deleted items from previous session persist
- Could cause data inconsistencies between different user sessions
- Essential for clean logout

### Step 2: Remove Manual Clearing from doLogout (Optional but Cleaner)
**File:** `src/features/login/login-slice.ts`
**Lines:** 32-47

**Action:** Simplify the `doLogout` reducer since `reducerWithReset` handles full reset

**Before:**
```typescript
doLogout: (state: LoginType) => {
  state.accSettings = undefined
  state.allBranches = undefined
  // ... many lines of manual clearing
},
```

**After:**
```typescript
doLogout: (state: LoginType) => {
  // No need to manually clear - reducerWithReset handles this
  // Just set isLoggedIn to false as a marker
  state.isLoggedIn = false
},
```

**Alternative (More Explicit):**
```typescript
doLogout: (state: LoginType) => {
  // Return initialState to ensure clean reset
  return initialState;
},
```

### Step 3: Verify Redux DevTools After Logout
**Action:** Test the logout and check Redux DevTools

**Steps:**
1. Login to application
2. Navigate around and populate Redux state
3. Open Redux DevTools
4. Note the current state values
5. Click Logout
6. Check Redux DevTools - ALL slices should be reset to initialState

### Step 4: Add Debugging to Verify Reset (Temporary)
**File:** `src/app/store.ts`
**Lines:** 40-45

**Action:** Add console logs to verify the reset is working

```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    console.log('🔴 LOGOUT: Resetting Redux state');
    console.log('State before reset:', state);
    state = undefined; // this resets all slices
    console.log('State after reset:', state);
  }
  return rootReducer(state, action);
};
```

**Remove these logs after verification**

### Step 5: Add Global Context Verification Logs (Temporary)
**File:** `src/app/global-context.tsx`
**Lines:** 12-16

**Action:** Add console logs to verify global context is being reset

```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  console.log('🔵 LOGOUT: Resetting Global Context');
  console.log('Global Context before reset:', globalContext);

  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
  globalContext.DataInstances = {};

  console.log('Global Context after reset:', globalContext);
}
```

**Remove these logs after verification**

### Step 6: Check for Redux Persist (If Applicable)
**File:** `src/app/store.ts`

**Action:** Search for any persistence middleware

```typescript
// Look for patterns like:
import { persistStore, persistReducer } from 'redux-persist';
```

**If found:** Need to clear persisted storage on logout:
```typescript
function handleOnLogout() {
    handleOnClickAway()
    resetGlobalContext(context)
    dispatch(doLogout())

    // Clear persisted state if using redux-persist
    persistor.purge();

    navigate('/login')
}
```

### Step 7: Clear Any Browser Storage on Logout
**File:** `src/features/layouts/nav-bar/logout-menu-button.tsx`
**Lines:** 127-132

**Action:** Add browser storage cleanup (if needed)

**Before:**
```typescript
function handleOnLogout() {
    handleOnClickAway()
    resetGlobalContext(context)
    dispatch(doLogout())
    navigate('/login')
}
```

**After:**
```typescript
function handleOnLogout() {
    handleOnClickAway()
    resetGlobalContext(context)

    // Clear any browser storage
    localStorage.clear();
    sessionStorage.clear();

    dispatch(doLogout())
    navigate('/login')
}
```

**⚠️ Warning:** Only use `localStorage.clear()` if you're sure no other data needs to be preserved. Better approach:

```typescript
function handleOnLogout() {
    handleOnClickAway()
    resetGlobalContext(context)

    // Clear specific items only
    const keysToRemove = ['reduxState', 'token', 'userSession']; // adjust keys
    keysToRemove.forEach(key => localStorage.removeItem(key));

    dispatch(doLogout())
    navigate('/login')
}
```

### Step 8: Ensure Navigation Cleanup
**File:** `src/features/layouts/nav-bar/logout-menu-button.tsx`
**Lines:** 127-132

**Action:** Use `navigate` with `replace` option to prevent back navigation

**Current:**
```typescript
navigate('/login')
```

**Better:**
```typescript
navigate('/login', { replace: true })
```

This prevents users from pressing "Back" button and returning to authenticated pages.

## Testing Plan

### Test 1: Basic Logout Redux Reset
1. Login to application
2. Navigate to Sales page and fill form
3. Navigate to Reports and generate a report
4. Open Redux DevTools → check all slices have data
5. Open Browser Console → check Global Context has data
6. Click Logout
7. **Expected:** All Redux slices reset to initialState
8. **Expected:** Global Context is cleared
9. **Verify in Redux DevTools:**
   - `login.isLoggedIn = false`
   - `sales.savedFormData = undefined` (or initial value)
   - `layouts.businessContextToggle = false`
   - All other slices at initial state
10. **Verify in Console Logs:**
   - "🔴 LOGOUT: Resetting Redux state"
   - "🔵 LOGOUT: Resetting Global Context"
   - Global Context shows empty objects after reset

### Test 2: Cannot Access Authenticated Pages After Logout
1. Login and navigate to dashboard
2. Logout
3. Try to navigate back using browser back button
4. **Expected:** Redirected to login page

### Test 3: Fresh Login After Logout
1. Login as User A
2. Navigate around, create some data
3. Delete some items (to populate DataInstances)
4. Logout
5. Login as User B
6. **Expected:** No data from User A visible
7. **Expected:** Redux state is completely fresh
8. **Expected:** Global Context is completely fresh
9. **Expected:** Deleted IDs from User A don't appear for User B

### Test 4: Multiple Logout Attempts
1. Login
2. Logout
3. Try to logout again (if possible)
4. **Expected:** No errors, clean navigation

### Test 5: Logout with Pending Operations
1. Login
2. Trigger a slow API call (e.g., large report)
3. Immediately logout before it completes
4. **Expected:** No errors, state is cleared
5. **Expected:** API response doesn't update Redux after logout

## Files to Modify

### Primary Changes (MUST DO):
- **`src/app/global-context.tsx`** (lines 12-16) - Uncomment DataInstances cleanup ⚠️ CRITICAL
- `src/features/login/login-slice.ts` (lines 32-47) - Simplify doLogout reducer
- `src/features/layouts/nav-bar/logout-menu-button.tsx` (lines 127-132) - Add storage cleanup and navigation options

### Optional/Debugging:
- `src/app/store.ts` (lines 40-45) - Add temporary logging to verify Redux reset
- `src/app/global-context.tsx` (lines 12-16) - Add temporary logging to verify Global Context reset

## Risk Assessment

**Risk Level:** Low-Medium
- Changes are isolated to logout flow
- Existing reset mechanism in store.ts should work
- Main risk: if using Redux Persist or other middleware, need to handle that
- Worst case: User data persists between sessions (security issue)

## Expected Behavior After Fix

✅ **Complete Redux reset** - All slices return to initialState
✅ **Complete Global Context reset** - All context data cleared including DataInstances
✅ **Clean session** - No data leakage between users
✅ **No residual state** - Fresh application state on next login
✅ **Proper navigation** - Cannot go back to authenticated pages
✅ **Storage cleanup** - Browser storage cleared (if applicable)
✅ **No deleted ID leakage** - DataInstances cleared prevents deleted items from persisting

## Alternative Solutions

### Solution A: Keep Manual Clearing in doLogout
If `reducerWithReset` isn't working for some reason, keep the manual clearing but ensure ALL slices are covered:

```typescript
// In store.ts - export action types from each slice
// In login-slice.ts doLogout reducer
doLogout: (state: LoginType) => {
  // Manually clear all login state
  return initialState;
},

// AND dispatch clear actions for other slices in logout handler
function handleOnLogout() {
    dispatch(clearSalesFormData());
    dispatch(clearAccountsData());
    dispatch(clearAllReports());
    // ... clear all slices
    dispatch(doLogout());
    navigate('/login', { replace: true });
}
```

**❌ Not recommended:** Too much maintenance overhead

### Solution B: Reset Store on Navigation
Instead of resetting on `doLogout` action, reset when navigating to login:

```typescript
// In login component
useEffect(() => {
    // Clear store when login page mounts
    dispatch({ type: 'RESET_STORE' });
}, []);
```

**❌ Not recommended:** Less secure, delays the reset

## Recommended Implementation Priority

1. **Priority 1 (MUST):** ⚠️ **CRITICAL** - Uncomment `DataInstances` cleanup in `global-context.tsx`
2. **Priority 2 (MUST):** Verify `reducerWithReset` is working with Redux DevTools
3. **Priority 3 (MUST):** Simplify `doLogout` reducer to return `initialState`
4. **Priority 4 (SHOULD):** Add `navigate('/login', { replace: true })`
5. **Priority 5 (OPTIONAL):** Clear browser storage if needed
6. **Priority 6 (OPTIONAL):** Add temporary debug logs to verify both Redux and Global Context

## Notes

- The existing `reducerWithReset` pattern is a standard Redux technique
- Setting `state = undefined` causes Redux to initialize all slices with their `initialState`
- The issue might not be with the reset logic, but with verification - use Redux DevTools
- If state is persisting, look for Redux Persist, localStorage, or sessionStorage usage
- Global context is already being reset via `resetGlobalContext(context)` ✓
- **⚠️ IMPORTANT:** `DataInstances` cleanup is currently commented out - this MUST be enabled
- `DataInstances` stores `deletedIds` which can cause data inconsistencies if not cleared
- Global Context is passed by reference, so mutations directly affect the context

## Debug Checklist

If Redux store or Global Context is still not clearing:

### Redux Store:
- [ ] Check Redux DevTools after logout - is state actually populated?
- [ ] Check if Redux Persist is being used
- [ ] Check if localStorage/sessionStorage is being used
- [ ] Check if any components are holding state in useState/useRef
- [ ] Check browser Network tab - are API calls restoring state after logout?
- [ ] Check if any useEffect dependencies are triggering data fetches after logout
- [ ] Verify `doLogout.type` string matches in store.ts

### Global Context:
- [ ] Check if `DataInstances` cleanup is uncommented in `global-context.tsx`
- [ ] Verify `resetGlobalContext(context)` is called before `dispatch(doLogout())`
- [ ] Check console logs to see if reset function is executing
- [ ] Inspect `globalContext.DataInstances` in browser console after logout
- [ ] Verify no components are storing references to old context values
