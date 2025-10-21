# Menu Permissions Integration Plan

## Overview
Integrate menu view permissions from `access-controls.json` with the left sidebar menu to control visibility of parent and child menu items for business users based on their assigned permissions.

---

## Current State Analysis

### Existing Infrastructure
✅ **Permissions Data**: Menu controls defined in `access-controls.json` (controlNo 1000-1386)
✅ **Permission Hooks**: Base hooks available in `permissions-hooks.ts`
✅ **Menu Structure**: Defined in `master-menu-data.ts` with 7 parents + 26 children
✅ **Redux Store**: User permissions stored in `state.login.userSecuredControls`

### What's Missing
❌ Menu items don't have `controlName` properties
❌ No filtering logic based on permissions
❌ Admin/Super Admin menus not excluded from filtering

---

## Implementation Steps

### Step 1: Update Menu Data Types
**File**: `src/features/layouts/master-menu-data.ts`

**Add controlName to types:**
```typescript
export type MenuDataItemType = {
  id: string
  label: string
  icon: any
  iconColorClass: string
  children: Array<ChildMenuItemType>
  path?: string
  controlName?: string  // NEW - for permission checking
}

export type ChildMenuItemType = {
  id: string
  label: string
  path: string
  controlName?: string  // NEW - for permission checking
}
```

**Update Accounts menu data with controlNames:**
- Add controlName to all 7 parent items
- Add controlName to all 26 child items
- Leave Admin/Super Admin menus unchanged (no controlNames)

**Example:**
```typescript
{
  id: "1",
  label: "Vouchers",
  icon: IconVoucher,
  iconColorClass: "text-primary-500",
  controlName: "vouchers.menu.parent.view",  // NEW
  children: [
    {
      id: "10",
      label: "All Vouchers",
      path: "/all-vouchers",
      controlName: "vouchers.menu.all-vouchers.view"  // NEW
    }
  ]
}
```

---

### Step 2: Create Menu Filtering Hook
**File**: `src/features/layouts/use-filtered-menu.ts` (NEW)

**Purpose**: Filter menu items based on user permissions

**Hook Signature:**
```typescript
export const useFilteredMenu = (
  menuType: MenuItemType
): MenuDataItemType[]
```

**Logic:**
```typescript
function useFilteredMenu(menuType: MenuItemType): MenuDataItemType[] {
  const userSecuredControls = useSelector(
    (state: RootStateType) => state.login.userSecuredControls
  )

  const menuData = MasterMenuData[menuType]

  // IMPORTANT: No filtering for admin/superAdmin
  if (menuType === 'admin' || menuType === 'superAdmin') {
    return menuData
  }

  // Filter Accounts menu based on permissions
  return menuData
    .map(parent => filterParentItem(parent, userSecuredControls))
    .filter(parent => parent !== null) as MenuDataItemType[]
}

function filterParentItem(
  parent: MenuDataItemType,
  userControls: SecuredControlType[]
): MenuDataItemType | null {
  const hasParentPermission = checkPermission(parent.controlName, userControls)

  // Filter children
  const filteredChildren = parent.children.filter(child =>
    checkPermission(child.controlName, userControls)
  )

  // Decision logic:
  // 1. Parent has permission + has accessible children → Show parent with children
  // 2. Parent has permission + no children → Show parent only (if has direct path)
  // 3. No parent permission + has accessible children → Show parent with children
  // 4. No parent permission + no accessible children → Hide completely

  if (hasParentPermission || filteredChildren.length > 0) {
    return {
      ...parent,
      children: filteredChildren
    }
  }

  return null
}

function checkPermission(
  controlName: string | undefined,
  userControls: SecuredControlType[]
): boolean {
  if (!controlName) return true // No controlName = no restriction
  return userControls?.some(c => c.controlName === controlName) ?? false
}
```

---

### Step 3: Update SideMenu Component
**File**: `src/features/layouts/side-bar/side-menu.tsx`

**Changes:**
```typescript
// BEFORE:
const menuData = MasterMenuData[menuItemSelector]

// AFTER:
import { useFilteredMenu } from '../use-filtered-menu'

const menuData = useFilteredMenu(menuItemSelector)
```

**That's it!** No other changes needed to rendering logic.

---

### Step 4: Handle Edge Cases

#### Empty Menu State
**When**: User has no menu permissions at all

**Solution**: Show helpful message
```typescript
if (menuData.length === 0 && menuItemSelector === 'accounts') {
  return (
    <div className="p-4 text-center text-neutral-500">
      <p>No menu items available.</p>
      <p className="text-sm">Contact your administrator.</p>
    </div>
  )
}
```

#### Parent with No Children
**When**: User has parent permission but no child permissions

**Solution**:
- If parent has `path`: Show as clickable item
- If parent has no `path`: Hide parent (it was just a container)

#### Child-Only Permissions
**When**: User has child permissions but not parent permission

**Solution**: Still show parent (but possibly grayed out or non-clickable)

---

## Data Mapping

### Menu ID → Control Name Mapping

| Menu ID | Control Number | Control Name | Type |
|---------|---------------|--------------|------|
| **Parents** |
| 1 | 1000 | vouchers.menu.parent.view | parent |
| 2 | 1010 | purchase-sales.menu.parent.view | parent |
| 3 | 1020 | masters.menu.parent.view | parent |
| 4 | 1030 | final-accounts.menu.parent.view | parent |
| 5 | 1040 | options.menu.parent.view | parent |
| 6 | 1050 | reports.menu.parent.view | parent |
| 7 | 1060 | inventory.menu.parent.view | parent |
| **Vouchers Children** |
| 10 | 1100 | vouchers.menu.all-vouchers.view | child |
| **Purchase/Sales Children** |
| 21 | 1110 | purchase-sales.menu.purchase.view | child |
| 22 | 1111 | purchase-sales.menu.purchase-return.view | child |
| 23 | 1112 | purchase-sales.menu.sales.view | child |
| 24 | 1113 | purchase-sales.menu.sales-return.view | child |
| 25 | 1114 | purchase-sales.menu.debit-notes.view | child |
| 26 | 1115 | purchase-sales.menu.credit-notes.view | child |
| **Masters Children** |
| 31 | 1200 | masters.menu.company-info.view | child |
| 32 | 1201 | masters.menu.general-settings.view | child |
| 33 | 1202 | masters.menu.accounts-master.view | child |
| 34 | 1203 | masters.menu.opening-balances.view | child |
| 35 | 1204 | masters.menu.branches.view | child |
| 36 | 1205 | masters.menu.financial-years.view | child |
| **Final Accounts Children** |
| 41 | 1300 | final-accounts.menu.trial-balance.view | child |
| 42 | 1301 | final-accounts.menu.balance-sheet.view | child |
| 43 | 1302 | final-accounts.menu.pl-account.view | child |
| 44 | 1303 | final-accounts.menu.general-ledger.view | child |
| **Options Children** |
| 51 | 1350 | options.menu.bank-recon.view | child |
| 52 | 1351 | options.menu.common-utilities.view | child |
| 53 | 1352 | options.menu.exports.view | child |
| **Reports Children** |
| 61 | 1370 | reports.menu.all-transactions.view | child |
| **Inventory Children** |
| 71 | 1380 | inventory.menu.categories.view | child |
| 72 | 1381 | inventory.menu.brands.view | child |
| 73 | 1382 | inventory.menu.product-master.view | child |
| 74 | 1383 | inventory.menu.opening-stock.view | child |
| 75 | 1384 | inventory.menu.reports.view | child |
| 76 | 1385 | inventory.menu.stock-journal.view | child |
| 77 | 1386 | inventory.menu.branch-transfer.view | child |

---

## Permission Logic Flow

```
User Login
    ↓
Server returns userSecuredControls
    ↓
Redux stores in state.login.userSecuredControls
    ↓
User switches to Accounts menu
    ↓
useFilteredMenu('accounts') hook executes
    ↓
Check menuType:
  - admin/superAdmin? → Return all items unfiltered
  - accounts? → Continue to filtering
    ↓
For each parent item:
  1. Check parent.controlName permission
  2. Filter children based on child.controlName
  3. Decide whether to show parent:
     - Has parent perm OR has children → Show
     - No parent perm AND no children → Hide
    ↓
Return filtered menu array
    ↓
SideMenu renders filtered items
```

---

## Testing Strategy

### Test Cases

#### 1. Full Permissions
**Given**: User has all menu permissions
**Expected**: All 7 parents + 26 children visible

#### 2. No Permissions
**Given**: User has zero menu permissions
**Expected**: Empty state message shown

#### 3. Parent Only Permission
**Given**: User has "vouchers.menu.parent.view" only
**Expected**: Vouchers parent visible, no children

#### 4. Child Only Permission
**Given**: User has "purchase-sales.menu.purchase.view" only
**Expected**: Purch/Sales parent visible + Purchase child only

#### 5. Mixed Permissions
**Given**: User has some parents + some children
**Expected**: Correct subset shown

#### 6. Admin User
**Given**: User switches to Admin menu
**Expected**: All admin items visible (no filtering)

#### 7. Menu Switching
**Given**: User switches between accounts/admin/superAdmin
**Expected**: Correct filtering behavior for each

---

## Implementation Checklist

- [ ] Update `MenuDataItemType` and `ChildMenuItemType` types
- [ ] Add `controlName` to all 7 Accounts parent items
- [ ] Add `controlName` to all 26 Accounts child items
- [ ] Create `use-filtered-menu.ts` hook
- [ ] Implement parent filtering logic
- [ ] Implement child filtering logic
- [ ] Handle empty state
- [ ] Update `side-menu.tsx` to use filtering hook
- [ ] Test with full permissions
- [ ] Test with no permissions
- [ ] Test with partial permissions
- [ ] Test admin/superAdmin menus (no filtering)
- [ ] Test menu switching
- [ ] Verify no console errors
- [ ] Verify correct navigation behavior

---

## Files to Modify

1. **`src/features/layouts/master-menu-data.ts`**
   - Add controlName to types
   - Update Accounts menu data with controlNames

2. **`src/features/layouts/use-filtered-menu.ts`** (NEW)
   - Create filtering hook
   - Implement permission checking logic

3. **`src/features/layouts/side-bar/side-menu.tsx`**
   - Import and use filtering hook
   - Add empty state UI

---

## Estimated Effort

- **Update menu data**: 1 hour
- **Create filtering hook**: 2 hours
- **Update SideMenu component**: 30 minutes
- **Testing**: 2 hours
- **Total**: ~5.5 hours

---

## Security Considerations

### Frontend Only
⚠️ **Important**: This is UI-level security only
- Users can still guess URLs and navigate directly
- Backend must enforce all permissions on API calls
- Menu filtering is for UX, not security

### Defense in Depth
1. **Menu Level**: Hide items (this implementation) ✅
2. **Route Level**: Route guards (future enhancement) 🔮
3. **Component Level**: Permission checks in components ✅
4. **API Level**: Backend validates all requests ✅

---

## Future Enhancements

1. **Keyboard Navigation**: Handle filtered menus in keyboard shortcuts
2. **Search**: Update menu search to work with filtered items
3. **Recently Accessed**: Show recently accessed items even if hidden
4. **Permission Groups**: Bulk assign common permission sets
5. **Default Permissions**: Auto-assign permissions to new roles

---

## Notes

- Only Accounts menu requires permission filtering
- Admin and Super Admin menus always show all items
- Empty parent containers (no path, no accessible children) should be hidden
- Navigation should work seamlessly with filtered menus
- Consider caching filtered menu to avoid recalculating on every render
