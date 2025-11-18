# Plan: Fix reducerWithReset Not Being Called on Logout

## Problem Statement
The `reducerWithReset` function in `store.ts` is not being called when logout occurs, which means Redux state is not being properly reset to `undefined` as intended.

## Current Implementation Analysis

### Store Configuration (store.ts:40-48)
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // this resets all slices
  }
  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: reducerWithReset,
});
```

**How it SHOULD work:**
1. When `doLogout` action is dispatched
2. `reducerWithReset` checks if `action.type === doLogout.type`
3. If true, sets `state = undefined`
4. Calls `rootReducer(undefined, action)`
5. Redux initializes all slices to their `initialState`

### doLogout Action (login-slice.ts:32-47)
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

## Root Cause Analysis

### Issue 1: Action Type String Format
Redux Toolkit generates action types in the format: `"sliceName/actionName"`

For the `doLogout` action:
- **Slice name:** `'login'`
- **Action name:** `'doLogout'`
- **Generated action.type:** `'login/doLogout'`

**Current check in store.ts:**
```typescript
if (action.type === doLogout.type)
```

This SHOULD work because `doLogout.type` is a property that contains the string `'login/doLogout'`.

### Issue 2: State Mutation Problem (CRITICAL)
The current code tries to mutate the `state` parameter:

```typescript
state = undefined; // ❌ This reassigns the parameter, doesn't affect the returned value
```

**The problem:** Reassigning a function parameter doesn't change what the function returns. The code then returns `rootReducer(state, action)` where `state` is still undefined in the local scope, but this doesn't properly reset the Redux store.

**The fix:** Return `rootReducer(undefined, action)` directly instead of mutating the parameter.

### Issue 3: Verification Needed
Need to verify:
1. Is `doLogout.type` the correct string?
2. Is the action actually being dispatched?
3. Is `reducerWithReset` being called?

## Debugging Steps

### Step 1: Add Console Logs to Verify Execution
**File:** `src/app/store.ts`
**Lines:** 40-45

```typescript
const reducerWithReset = (state: any, action: any) => {
  console.log('🔍 reducerWithReset called:', action.type);

  if (action.type === doLogout.type) {
    console.log('🔴 LOGOUT ACTION DETECTED!');
    console.log('doLogout.type:', doLogout.type);
    console.log('action.type:', action.type);
    console.log('State before reset:', state);

    state = undefined; // this resets all slices

    console.log('State after reset:', state);
  }

  const result = rootReducer(state, action);

  if (action.type === doLogout.type) {
    console.log('State after rootReducer:', result);
  }

  return result;
};
```

### Step 2: Verify Action Type Match
**File:** `src/app/store.ts`

Add this check:
```typescript
const reducerWithReset = (state: any, action: any) => {
  // Verify the action type string
  if (action.type?.includes('logout') || action.type?.includes('Logout')) {
    console.log('🟡 Logout-related action:', action.type);
    console.log('Expected type:', doLogout.type);
    console.log('Match:', action.type === doLogout.type);
  }

  if (action.type === doLogout.type) {
    state = undefined;
  }
  return rootReducer(state, action);
};
```

### Step 3: Check Redux DevTools
1. Open Redux DevTools in browser
2. Click logout
3. Check the Actions tab for an action with type `'login/doLogout'`
4. If the action appears, check if state was reset
5. If state wasn't reset, the comparison might be failing

## Solution Options

### Solution 1: Return Undefined Instead of Mutating (RECOMMENDED)
**File:** `src/app/store.ts`

**Replace:**
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // ❌ Wrong - mutates parameter
  }
  return rootReducer(state, action);
};
```

**With:**
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    console.log('🔴 LOGOUT: Resetting Redux state');
    // ✅ Correct - pass undefined to rootReducer
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
```

**Why this works:**
- Redux state should not be mutated
- Passing `undefined` to `rootReducer` forces all slices to initialize
- More explicit and clear
- Standard Redux pattern

### Solution 2: Use String Literal Instead of doLogout.type
**File:** `src/app/store.ts`

```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === 'login/doLogout') {  // Use string literal
    console.log('🔴 LOGOUT: Resetting Redux state');
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
```

**Pros:**
- Removes dependency on import
- Explicit and clear
- No chance of import issues

**Cons:**
- Hardcoded string (but it's a standard Redux pattern)
- Need to update if slice name changes

### Solution 3: Use Action Type Check Helper
**File:** `src/app/store.ts`

```typescript
import { doLogout, loginReducer } from "../features/login/login-slice";

const reducerWithReset = (state: any, action: any) => {
  // More robust check - Redux Toolkit's match method
  if (doLogout.match(action)) {
    console.log('🔴 LOGOUT: Resetting Redux state');
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
```

**Note:** `doLogout.match(action)` is a Redux Toolkit feature that's more type-safe.

## Recommended Implementation

### Priority 1: Fix the State Mutation Issue (CRITICAL)

**File:** `src/app/store.ts`
**Lines:** 40-45

**Replace:**
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // this resets all slices
  }
  return rootReducer(state, action);
};
```

**With:**
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    console.log('🔴 LOGOUT: Resetting Redux state');
    // Pass undefined to rootReducer instead of mutating state
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
```

### Priority 2: Simplify doLogout Reducer

**File:** `src/features/login/login-slice.ts`
**Lines:** 32-47

**Replace:**
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

**With:**
```typescript
doLogout: (state: LoginType) => {
  // reducerWithReset handles global reset
  // Just return initialState to be explicit
  return initialState;
},
```

### Priority 3: Add Verification Logs (Temporary)

Add console logs to verify it's working, then remove after testing:

```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    console.log('🔴 LOGOUT: Resetting Redux state');
    console.log('Action type:', action.type);
    console.log('Expected type:', doLogout.type);
    console.log('State keys before reset:', Object.keys(state || {}));

    const result = rootReducer(undefined, action);

    console.log('State keys after reset:', Object.keys(result || {}));
    return result;
  }
  return rootReducer(state, action);
};
```

## Testing Checklist

### Test 1: Verify Action Type
1. Add console log: `console.log('doLogout.type:', doLogout.type)` at module level
2. Refresh app
3. Check console - should show `'login/doLogout'`

### Test 2: Verify Logout Action Dispatched
1. Open Redux DevTools
2. Click logout
3. Check Actions tab
4. **Expected:** Action with type `'login/doLogout'` appears

### Test 3: Verify State Reset
1. Login and use the app (populate Redux state)
2. Open Redux DevTools - State tab
3. Note state values
4. Click logout
5. **Expected:** All slices show their initialState values

### Test 4: Check Console Logs
1. With the console.log statements added
2. Click logout
3. **Expected:** See logs showing:
   - "🔴 LOGOUT: Resetting Redux state"
   - State keys before and after
   - Both should show the slice names

### Test 5: Verify No Persistence
1. Login as User A
2. Create some data
3. Logout
4. Check Redux DevTools
5. **Expected:** All state is reset
6. Login as User B
7. **Expected:** No data from User A

## Alternative Diagnosis

If the above doesn't work, the issue might be:

### Possibility 1: Redux DevTools Not Updating
- Redux DevTools might be caching state
- Try: Refresh the page after logout
- Try: Disable/re-enable Redux DevTools

### Possibility 2: Persistent Middleware
- Check if there's Redux Persist or similar middleware
- Search codebase for: `persistStore`, `persistReducer`, `redux-persist`

### Possibility 3: State Hydration
- Check if state is being loaded from localStorage/sessionStorage after reset
- Look for `localStorage.getItem` or `sessionStorage.getItem` in useEffect hooks

### Possibility 4: Action Not Reaching Store
- The logout handler might not be dispatching the action correctly
- Check logout-menu-button.tsx line 130: `dispatch(doLogout())`
- Verify dispatch is from the correct Redux store

## Expected Behavior After Fix

1. User clicks logout
2. `handleOnLogout()` dispatches `doLogout()` action
3. `reducerWithReset` intercepts the action
4. Checks `action.type === 'login/doLogout'`
5. Returns `rootReducer(undefined, action)`
6. All slices initialize to their `initialState`
7. Redux DevTools shows all state reset
8. Console logs confirm reset happened
9. User is redirected to login page
10. Next login shows fresh state

## Files to Modify

### Must Change:
- **`src/app/store.ts`** (lines 40-45) - Fix state mutation to return undefined

### Should Change:
- **`src/features/login/login-slice.ts`** (lines 32-47) - Simplify doLogout reducer

### Temporary (for debugging):
- **`src/app/store.ts`** - Add console logs to verify execution

## Success Criteria

✅ Console log shows "🔴 LOGOUT: Resetting Redux state"
✅ Redux DevTools shows `'login/doLogout'` action
✅ Redux DevTools State tab shows all slices at initialState after logout
✅ No data persists between different user sessions
✅ Form data is cleared after logout
✅ businessContextToggle resets to false

## Notes

- **The most likely issue is that `state = undefined` doesn't properly pass undefined to rootReducer**
- Using `return rootReducer(undefined, action)` is the standard Redux pattern
- This pattern is used in Redux Toolkit documentation
- The fix is simple but critical for proper state management
- After fixing, remove temporary console logs for production

## Additional Considerations

### If Using Redux Persist
If the codebase uses redux-persist, need additional steps:

```typescript
import { persistor } from './persistor'; // if it exists

function handleOnLogout() {
    handleOnClickAway()
    resetGlobalContext(context)
    dispatch(doLogout())

    // Clear persisted state
    if (persistor) {
        persistor.purge();
    }

    navigate('/login', { replace: true })
}
```

### TypeScript Type Safety
Consider typing the action parameter:

```typescript
import { AnyAction } from '@reduxjs/toolkit';

const reducerWithReset = (state: any, action: AnyAction) => {
  if (action.type === doLogout.type) {
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
```
