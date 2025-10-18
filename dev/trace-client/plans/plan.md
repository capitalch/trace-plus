# Plan: Display SearchProduct Only When Accounts Menu Is Active

## Problem Statement
The SearchProduct component is currently always visible in the navbar regardless of which menu is active. It should only be displayed when the "Accounts" menu item is active, and hidden when "Super Admin" or "Admin" menu items are active.

## Current Behavior

### NavBar Component (nav-bar.tsx:35)
```tsx
<SearchProduct />
```
The SearchProduct component is rendered unconditionally in the navbar, making it visible for all user types and menu items.

### Menu Item State Management

The application uses Redux to track which menu item is currently active:

**State Location**: `layouts-slice.ts`
- State path: `state.layouts.navBar.menuItem`
- Type: `MenuItemType = 'accounts' | 'superAdmin' | 'admin'`
- Default value: `'accounts'`
- Selector function: `menuItemSelectorFn(state)`

**Menu Item Setting Logic** (nav-bar-hook.tsx:24-34):
```tsx
useEffect(() => {
    if (userTypeSelector === UserTypesEnum.SuperAdmin) {
        dispatch(setMenuItem({ menuItem: 'superAdmin' }))
    } else if (userTypeSelector === UserTypesEnum.Admin) {
        dispatch(setMenuItem({ menuItem: "accounts" }))
    } else {
        dispatch(setMenuItem({ menuItem: "accounts" }))
    }
}, [dispatch, userTypeSelector])
```

### User Types (global-types-interfaces-enums.ts)
```tsx
export enum UserTypesEnum {
  SuperAdmin = "S",
  Admin = "A",
  BusinessUser = "B",
}
```

### Current Menu Item Behavior
- **SuperAdmin users**: Start with `menuItem = 'superAdmin'`, cannot switch menu
- **Admin users**: Start with `menuItem = 'accounts'`, can toggle between 'accounts' and 'admin'
- **BusinessUser**: Always have `menuItem = 'accounts'`

## Root Cause Analysis

The SearchProduct component is product/inventory related and only makes sense in the context of the Accounts menu (business operations), not in the Super Admin or Admin menus (which are for system administration and user management).

## Proposed Solution

### Option 1: Conditional Rendering in NavBar Component (RECOMMENDED)
Add conditional logic in nav-bar.tsx to only render SearchProduct when the active menu item is 'accounts'.

**Location**: `nav-bar.tsx:35`

**Changes**:
```tsx
// Before
{getBuFyBranchInfo()}
<SearchProduct />

// After
{getBuFyBranchInfo()}
{menuItemSelector === 'accounts' && <SearchProduct />}
```

**Implementation Requirements**:
1. Import `menuItemSelectorFn` from layouts-slice
2. Import `useSelector` (already imported)
3. Get the current menu item using the selector
4. Conditionally render SearchProduct based on menu item

**Benefits**:
- Simple, straightforward implementation
- Clear conditional logic in the component
- No changes to other components
- Easy to understand and maintain

### Option 2: Create a Wrapper Component
Create a conditional wrapper component that handles the menu item check internally.

**New Component**: `ConditionalSearchProduct.tsx`
```tsx
export function ConditionalSearchProduct() {
    const menuItem = useSelector(menuItemSelectorFn)

    if (menuItem !== 'accounts') {
        return null
    }

    return <SearchProduct />
}
```

**Drawbacks**:
- Creates an unnecessary extra component
- Adds complexity without clear benefits
- More files to maintain

### Option 3: Move Logic to useNavBar Hook
Add a function in the useNavBar hook to conditionally return SearchProduct.

**Drawbacks**:
- Mixing data/logic with component rendering
- Less clear separation of concerns
- Hook already has enough responsibilities

## Recommended Implementation Plan

### Step 1: Modify nav-bar.tsx Component
**File**: `src/features/layouts/nav-bar/nav-bar.tsx`

**Action 1**: Import the menu item selector (line 8)
```tsx
import { closeSlidingPane, compAppLoaderVisibilityFn, selectSlidingPaneStateFn } from "../../../controls/redux-components/comp-slice"
```

Add import after this line:
```tsx
import { menuItemSelectorFn } from "../layouts-slice"
```

**Action 2**: Get the current menu item using selector (line 19)
```tsx
const { isOpen, identifier, title, width } = useSelector(selectSlidingPaneStateFn)
const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, CompInstances.compAppLoader))
```

Add after this line:
```tsx
const menuItemSelector = useSelector(menuItemSelectorFn)
```

**Action 3**: Add conditional rendering for SearchProduct (line 35)
```tsx
// Before
{getBuFyBranchInfo()}
<SearchProduct />

// After
{getBuFyBranchInfo()}
{menuItemSelector === 'accounts' && <SearchProduct />}
```

### Step 2: Verify the Solution

**Test Cases**:
1. **SuperAdmin user login**:
   - Menu item should be 'superAdmin'
   - SearchProduct should NOT be visible

2. **Admin user login**:
   - Default menu item should be 'accounts'
   - SearchProduct SHOULD be visible
   - When switching to 'admin' menu
   - SearchProduct should NOT be visible
   - When switching back to 'accounts' menu
   - SearchProduct SHOULD be visible again

3. **BusinessUser login**:
   - Menu item should be 'accounts'
   - SearchProduct SHOULD be visible

## Files to Modify
1. `src/features/layouts/nav-bar/nav-bar.tsx` (Lines 8, 19, 35)

## Implementation Summary

The solution involves:
1. Importing the `menuItemSelectorFn` selector
2. Using the selector to get the current active menu item
3. Conditionally rendering `<SearchProduct />` only when `menuItemSelector === 'accounts'`

This ensures that SearchProduct is only shown when users are working with the Accounts menu (business operations context), and hidden when they're in Super Admin or Admin menus (system administration context).

## Benefits
1. **Context-appropriate UI**: SearchProduct only appears in the relevant context
2. **Clean UI**: Reduces clutter in Super Admin and Admin views
3. **Simple implementation**: Single line conditional rendering
4. **Maintainable**: Easy to understand and modify
5. **No breaking changes**: Doesn't affect existing functionality

## Testing Checklist
- [ ] Login as SuperAdmin - verify SearchProduct is NOT visible
- [ ] Login as Admin - verify SearchProduct IS visible on Accounts menu
- [ ] As Admin, switch to Admin menu - verify SearchProduct is NOT visible
- [ ] As Admin, switch back to Accounts menu - verify SearchProduct IS visible
- [ ] Login as BusinessUser - verify SearchProduct IS visible
- [ ] Verify SearchProduct functionality still works when visible
- [ ] Check responsive behavior on mobile/tablet/desktop
