# Logout Fix Plan

## Current State Analysis

### What Currently Happens on Logout

**File**: `src/features/layouts/nav-bar/logout-menu-button.tsx`

**Current `handleOnLogout` implementation** (lines 112-116):
```typescript
function handleOnLogout() {
    handleOnClickAway() // Otherwise the menu remains open
    resetGlobalContext(context)
    dispatch(doLogout())
}
```

### Issues Identified

#### ✅ **Issue 1: GlobalContext NOT fully cleaned**
**File**: `src/app/global-context.tsx`

**Current `resetGlobalContext` function** (lines 12-15):
```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
}
```

**Problem**: Missing `DataInstances` cleanup!

**GlobalContextType structure** (lines 17-39):
```typescript
export type GlobalContextType = {
  CompSyncFusionGrid: { ... };      // ✅ Being reset
  CompSyncFusionTreeGrid: { ... };  // ✅ Being reset
  DataInstances: {                   // ❌ NOT being reset!
    [key: string]: {
      deletedIds: (number | string)[];
    };
  };
};
```

#### ✅ **Issue 2: Redux Store IS properly cleaned**
**File**: `src/app/store.ts`

**Redux cleanup mechanism** (lines 40-45):
```typescript
const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // this resets all slices
  }
  return rootReducer(state, action);
};
```

**Status**: ✅ **WORKING CORRECTLY** - All slices are reset when `doLogout` is dispatched

**All Registered Slices** (will all be reset):
- ✅ `accounts`
- ✅ `accountPickerTree`
- ✅ `queryHelper`
- ✅ `layouts`
- ✅ `login`
- ✅ `reduxComp`
- ✅ `salesReport`
- ✅ `stockSummaryReport`
- ✅ `stockTransReport`
- ✅ `vouchers`
- ✅ `purchase`
- ✅ `purchaseReturn`
- ✅ `debitNotes`
- ✅ `creditNotes`
- ✅ `sales`
- ✅ `salesReturn`
- ✅ `searchProduct`

#### ❌ **Issue 3: No navigation to /login after logout**

**Problem**: User stays on the current protected route after logout
- User clicks logout → state cleared → but still on protected route
- The `<Protected>` component should redirect, but may not handle post-logout state correctly
- Need to explicitly navigate to `/login` route

#### ⚠️ **Issue 4: Potential Protected route guard issue**

**File**: `src/features/layouts/protected.tsx` (not yet inspected)
- May not properly redirect after logout
- May cause issues if logout happens while on a protected route

---

## Solution Plan

### Fix 1: Complete GlobalContext Cleanup ✅

**File**: `src/app/global-context.tsx`

**Current code**:
```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
}
```

**Fixed code**:
```typescript
export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
  globalContext.DataInstances = {};  // ADD THIS LINE
}
```

**Impact**: Ensures deleted IDs tracking is cleared on logout

---

### Fix 2: Add Navigation to /login ✅

**File**: `src/features/layouts/nav-bar/logout-menu-button.tsx`

**Add import**:
```typescript
import { useNavigate } from "react-router-dom"
```

**Update component**:
```typescript
export function LogoutMenuButton({ className }: { className?: string }) {
    const navigate = useNavigate()  // ADD THIS LINE
    // ... rest of existing code

    function handleOnLogout() {
        handleOnClickAway()
        resetGlobalContext(context)
        dispatch(doLogout())
        navigate('/login')  // ADD THIS LINE
    }
}
```

**Impact**: Immediately redirects user to login page after logout

---

### Fix 3: Optional - Clear localStorage/sessionStorage ⚠️

**Consideration**: Check if any sensitive data is stored in browser storage

**Potential additions to `handleOnLogout`**:
```typescript
function handleOnLogout() {
    handleOnClickAway()
    resetGlobalContext(context)
    dispatch(doLogout())

    // Clear browser storage if needed
    // localStorage.clear()  // Only if app uses localStorage
    // sessionStorage.clear()  // Only if app uses sessionStorage

    navigate('/login')
}
```

**Action**: Inspect if app stores tokens/data in localStorage
- Look for `localStorage.setItem` or `sessionStorage.setItem` calls
- If found, clear them on logout for security

---

## Implementation Steps

### Step 1: Fix GlobalContext Reset ✅
1. Open `src/app/global-context.tsx`
2. Update `resetGlobalContext` function
3. Add `globalContext.DataInstances = {}`

### Step 2: Add Navigation to Login ✅
1. Open `src/features/layouts/nav-bar/logout-menu-button.tsx`
2. Import `useNavigate` from `react-router-dom`
3. Call `useNavigate()` hook in component
4. Add `navigate('/login')` at end of `handleOnLogout`

### Step 3: Test Logout Flow ✅
1. Login to application
2. Navigate to various pages
3. Use various features (grids, forms, etc.)
4. Click logout
5. Verify:
   - ✅ Redirected to `/login`
   - ✅ Redux state is empty (check Redux DevTools)
   - ✅ GlobalContext is empty (console.log it)
   - ✅ Cannot navigate back to protected routes without re-login

### Step 4: Check for localStorage/sessionStorage Usage ⚠️
1. Search codebase for `localStorage` and `sessionStorage`
2. If tokens/sensitive data are stored, clear on logout
3. Test login persists correctly after clearing

---

## Testing Checklist

- [ ] GlobalContext.CompSyncFusionGrid is cleared
- [ ] GlobalContext.CompSyncFusionTreeGrid is cleared
- [ ] GlobalContext.DataInstances is cleared (NEW FIX)
- [ ] All Redux slices reset to initial state
- [ ] User redirected to /login immediately
- [ ] Cannot access protected routes after logout
- [ ] Can login again successfully
- [ ] No console errors during logout
- [ ] localStorage/sessionStorage cleared if applicable

---

## Files to Modify

1. **`src/app/global-context.tsx`**
   - Add `DataInstances` cleanup to `resetGlobalContext`

2. **`src/features/layouts/nav-bar/logout-menu-button.tsx`**
   - Import `useNavigate`
   - Add navigation to `/login` after logout

3. **Optional: Check `src/features/layouts/protected.tsx`**
   - Ensure proper redirect logic when `isLoggedIn = false`

---

## Security Considerations

### Current State
- ✅ Redux state properly cleared via `reducerWithReset`
- ⚠️ GlobalContext partially cleared (missing DataInstances)
- ❌ No explicit navigation to login
- ❓ Unknown if localStorage/sessionStorage used

### After Fixes
- ✅ Complete state cleanup
- ✅ Forced navigation to login
- ✅ Clean logout flow

### Additional Security Recommendations
1. **Token Invalidation**: If using JWT tokens, consider:
   - Calling backend logout API to invalidate tokens
   - Clearing tokens from storage

2. **Session Cleanup**: Clear any session data

3. **Cache Cleanup**: Consider clearing Apollo/React Query cache if used

---

## Risk Assessment

### Low Risk Changes ✅
- Adding `DataInstances = {}` to resetGlobalContext
- Adding `navigate('/login')` to handleOnLogout

### Medium Risk ⚠️
- Clearing localStorage/sessionStorage (only if improperly done)
- May affect "Remember Me" functionality if present

### Testing Required ✅
- Test on all user types (Super Admin, Admin, Business User)
- Test logout from different routes
- Test rapid logout/login cycles
- Test with browser back button after logout

---

## Estimated Effort

- **Implementation**: 15 minutes
- **Testing**: 30 minutes
- **Total**: 45 minutes

---

## Success Criteria

✅ User cannot access any protected route after logout
✅ All application state is cleaned (Redux + GlobalContext)
✅ User is immediately redirected to /login page
✅ User can successfully login again
✅ No memory leaks or lingering state
