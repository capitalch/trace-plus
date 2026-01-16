# Plan: Reset Account Picker and Ledger Data on Business Unit Change

## Problem Statement
When the business unit is changed in the nav bar, the account picker selection and ledger data are not being reset. This can lead to stale or incorrect data being displayed since accounts and ledger entries are business unit-specific.

## Current Implementation Analysis

### Business Unit Change Flow
1. **BusinessUnitsListModal** dispatches `setCurrentBusinessUnit(bu)` when user selects a new BU
2. `toggleBusinessContext()` is dispatched to signal context change
3. `fetchAccDetails()` loads new financial years, branches, and account settings
4. However, account picker selection and ledger data are NOT reset

### Key Components
- **business-units-options.tsx**: Handles BU selection in nav bar
- **account-picker-tree-slice.ts**: Redux slice storing per-instance account selections
- **general-ledger.tsx**: Displays ledger data based on selected account

### Existing Reset Mechanism
- `toggleBusinessContext` in layouts-slice.ts flips a boolean flag
- Components can watch this flag to react to context changes
- Currently underutilized - empty useEffect in general-ledger.tsx (line 60-62)

---

## Proposed Solution

### Approach 1: Centralized Reset via Business Context Toggle (Recommended)

#### Step 1: Add Reset Action to Account Picker Slice
**File**: `src/controls/redux-components/account-picker-tree/account-picker-tree-slice.ts`

Add a new action to reset all account picker instances:
```typescript
resetAllAccountPickers: (state) => {
    // Reset all instance selections to null
    Object.keys(state).forEach(instance => {
        state[instance] = { id: null }
    })
}
```

#### Step 2: Create Reset Action in General Ledger (if needed)
If general ledger has its own data state, add a reset action or clear mechanism.

#### Step 3: Dispatch Resets in Business Units Options
**File**: `src/features/layouts/nav-bar/account-options-info/business-units-options.tsx`

When business unit changes (in `handleOnChange` or after `fetchAccDetails`):
```typescript
dispatch(resetAllAccountPickers())
// Clear any cached ledger data if applicable
```

#### Step 4: Utilize useEffect in General Ledger
**File**: `src/features/accounts/final-accounts/general-ledger/general-ledger.tsx`

Complete the existing empty useEffect to react to BU changes:
```typescript
useEffect(() => {
    // Reset local state/grid when business unit changes
    meta.current.data = []
    // Force re-render or clear grid reference
}, [currentBusinessUnitSelector])
```

---

### Approach 2: Watch Business Context Toggle in Components

#### Step 1: General Ledger watches businessContextToggle
```typescript
const businessContextToggle = useAppSelector(businessContextToggleSelectorFn)

useEffect(() => {
    // Reset ledger data when any business context changes
    meta.current.data = []
    // Clear grid
}, [businessContextToggle])
```

#### Step 2: Account Picker watches businessContextToggle
Either in each instance or via a parent wrapper component.

---

## Recommended Implementation Order

1. **Add `resetAllAccountPickers` action** to account-picker-tree-slice.ts
2. **Export the action** and import in business-units-options.tsx
3. **Dispatch reset** after business unit change in BusinessUnitsListModal's onChange handler
4. **Complete useEffect** in general-ledger.tsx to clear data on `currentBusinessUnitSelector` change
5. **Test** the flow: change BU → verify account picker clears → verify ledger grid clears

## Files to Modify

| File | Change |
|------|--------|
| `src/controls/redux-components/account-picker-tree/account-picker-tree-slice.ts` | Add `resetAllAccountPickers` action |
| `src/features/layouts/nav-bar/account-options-info/business-units-options.tsx` | Dispatch reset action on BU change |
| `src/features/accounts/final-accounts/general-ledger/general-ledger.tsx` | Complete useEffect to clear data on BU change |

## Testing Checklist

- [ ] Change business unit in nav bar
- [ ] Verify account picker selection is cleared
- [ ] Verify ledger grid is cleared/empty
- [ ] Verify selecting new account loads correct data for new BU
- [ ] Verify no console errors during transition
