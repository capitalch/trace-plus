# Vouchers Module Permissions Implementation Plan

## Overview
Complete implementation plan for Vouchers module with secured controls, including permission checking methods and UI integration for menu visibility and action button enable/disable.

---

## Part 1: Secured Controls Definition

### 1.1 Vouchers Module Controls (100-119)

```json
[
  {
    "controlNo": 100,
    "controlName": "vouchers.menu.all-vouchers.view",
    "controlType": "menu",
    "descr": "Can view 'All Vouchers' menu item in sidebar"
  },
  {
    "controlNo": 101,
    "controlName": "vouchers.list.view",
    "controlType": "action",
    "descr": "Can view vouchers in View tab (list/grid)"
  },
  {
    "controlNo": 102,
    "controlName": "vouchers.delete",
    "controlType": "action",
    "descr": "Can delete vouchers from grid"
  },
  {
    "controlNo": 103,
    "controlName": "vouchers.print",
    "controlType": "action",
    "descr": "Can print vouchers"
  },
  {
    "controlNo": 104,
    "controlName": "vouchers.export",
    "controlType": "action",
    "descr": "Can export vouchers to PDF/Excel"
  },
  {
    "controlNo": 110,
    "controlName": "vouchers.payment.view",
    "controlType": "action",
    "descr": "Can view Payment voucher type button and view Payment vouchers"
  },
  {
    "controlNo": 111,
    "controlName": "vouchers.payment.create",
    "controlType": "action",
    "descr": "Can create new Payment vouchers"
  },
  {
    "controlNo": 112,
    "controlName": "vouchers.payment.edit",
    "controlType": "action",
    "descr": "Can edit existing Payment vouchers"
  },
  {
    "controlNo": 120,
    "controlName": "vouchers.receipt.view",
    "controlType": "action",
    "descr": "Can view Receipt voucher type button and view Receipt vouchers"
  },
  {
    "controlNo": 121,
    "controlName": "vouchers.receipt.create",
    "controlType": "action",
    "descr": "Can create new Receipt vouchers"
  },
  {
    "controlNo": 122,
    "controlName": "vouchers.receipt.edit",
    "controlType": "action",
    "descr": "Can edit existing Receipt vouchers"
  },
  {
    "controlNo": 130,
    "controlName": "vouchers.contra.view",
    "controlType": "action",
    "descr": "Can view Contra voucher type button and view Contra vouchers"
  },
  {
    "controlNo": 131,
    "controlName": "vouchers.contra.create",
    "controlType": "action",
    "descr": "Can create new Contra vouchers"
  },
  {
    "controlNo": 132,
    "controlName": "vouchers.contra.edit",
    "controlType": "action",
    "descr": "Can edit existing Contra vouchers"
  },
  {
    "controlNo": 140,
    "controlName": "vouchers.journal.view",
    "controlType": "action",
    "descr": "Can view Journal voucher type button and view Journal vouchers"
  },
  {
    "controlNo": 141,
    "controlName": "vouchers.journal.create",
    "controlType": "action",
    "descr": "Can create new Journal vouchers"
  },
  {
    "controlNo": 142,
    "controlName": "vouchers.journal.edit",
    "controlType": "action",
    "descr": "Can edit existing Journal vouchers"
  }
]
```

---

## Part 2: Permission Checking Methods

### 2.1 Create Permissions Utility File

**File**: `src/utils/permissions.ts`

```typescript
import { useSelector } from 'react-redux'
import { RootStateType } from '../app/store'

/**
 * Custom React hook to check if user has permission for a control
 *
 * @param controlName - The secured control name (e.g., 'vouchers.create')
 * @returns true if user has permission, false otherwise
 *
 * @example
 * const canCreate = useUserHasControlPermission('vouchers.create')
 * if (canCreate) {
 *   // Show submit button
 * }
 */
export const useUserHasControlPermission = (controlName: string): boolean => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  // Admin users (userType = 'A') have all permissions
  if (userType === 'A') {
    return true
  }

  // Super Admin users (userType = 'S') have all permissions
  if (userType === 'S') {
    return true
  }

  // Check if control exists in user's secured controls
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

/**
 * Pure function to check permission (for use outside components)
 *
 * @param state - Redux root state
 * @param controlName - The secured control name
 * @returns true if user has permission, false otherwise
 */
export const hasControlPermission = (state: RootStateType, controlName: string): boolean => {
  const userType = state.login.userDetails?.userType
  const userSecuredControls = state.login.userSecuredControls

  // Admin and Super Admin users have all permissions
  if (userType === 'A' || userType === 'S') {
    return true
  }

  // Check if control exists in user's secured controls
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

/**
 * Hook to check multiple permissions at once
 *
 * @param controlNames - Array of control names to check
 * @returns Object with permission results
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useUserHasMultiplePermissions({
 *   canCreate: 'vouchers.create',
 *   canEdit: 'vouchers.edit',
 *   canDelete: 'vouchers.delete'
 * })
 */
export const useUserHasMultiplePermissions = <T extends Record<string, string>>(
  permissions: T
): Record<keyof T, boolean> => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  // Admin and Super Admin users have all permissions
  if (userType === 'A' || userType === 'S') {
    return Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)
  }

  // Check each permission
  return Object.entries(permissions).reduce((acc, [key, controlName]) => {
    acc[key as keyof T] = userSecuredControls?.some(
      control => control.controlName === controlName
    ) ?? false
    return acc
  }, {} as Record<keyof T, boolean>)
}
```

---

## Part 3: Implementation in Components

### 3.1 Menu Visibility (Side Menu)

**File**: `src/features/layouts/master-menu-data.ts`

**Purpose**: Control visibility of "All Vouchers" menu item in sidebar

**Implementation**:

```typescript
export type MenuDataItemType = {
  id: string
  label: string
  icon: any
  iconColorClass: string
  children: Array<ChildMenuItemType>
  path?: string
  requiredPermission?: string  // NEW FIELD
}

export type ChildMenuItemType = {
  id: string
  label: string
  path: string
  requiredPermission?: string  // NEW FIELD
}

export const MasterMenuData: MenuDataType = {
  accounts: [
    {
      id: "1",
      label: "Vouchers",
      icon: IconVoucher,
      iconColorClass: "text-primary-500",
      children: [
        {
          id: "10",
          label: "All Vouchers",
          path: "/all-vouchers",
          requiredPermission: 'vouchers.menu.all-vouchers.view'  // Controls "All Vouchers" menu item visibility
        },
      ],
    },
    // ... other menus
  ],
  // ... admin, superAdmin
}
```

**File**: `src/features/layouts/side-bar/side-menu.tsx`

```typescript
import { useUserHasControlPermission } from '../../../utils/secured-controls/permissions'

function SideMenu() {
  // ... existing code ...

  function getAllParentsWithChildren() {
    const items: any[] = menuData
      .filter((item: MenuDataItemType) => {
        // Filter parent menu if it has requiredPermission
        if (item.requiredPermission) {
          return useUserHasControlPermission(item.requiredPermission)
        }
        // Show parent if it has at least one visible child
        const visibleChildren = item.children.filter((child: ChildMenuItemType) => {
          if (child.requiredPermission) {
            return useUserHasControlPermission(child.requiredPermission)
          }
          return true
        })
        return visibleChildren.length > 0
      })
      .map((item: MenuDataItemType, index: number) => {
        return (
          <div key={index} className="flex flex-col">
            {getParentWithChildren(item)}
          </div>
        )
      })
    return (items)
  }

  function getChildren(item: MenuDataItemType) {
    const children = item.children
      .filter((child: ChildMenuItemType) => {
        // Filter child menu items based on permissions
        if (child.requiredPermission) {
          return useUserHasControlPermission(child.requiredPermission)
        }
        return true
      })
      .map((child: ChildMenuItemType, index: number) => {
        return (
          <button
            key={index}
            id={child.id}
            onClick={(e: any) => handleChildClick(e, child.label, child.path)}
            className={clsx(
              childClass,
              getSelectedChildClass(child.id, item),
              getChildHoverClass(item),
              "text-neutral-700"
            )}
          >
            <span className="transition-colors">{child.label}</span>
          </button>
        )
      })
    return (
      <div className={clsx(getParentExpandedClass(item.id), transitionClass)}>
        {children}
      </div>
    )
  }

  // ... rest of the code ...
}
```

---

### 3.2 Action Buttons Enable/Disable (Voucher Type Specific)

**File**: `src/features/accounts/vouchers/voucher-controls/form-action-buttons.tsx`

**Current Location**: Lines 10-50

**Purpose**: Control Submit button visibility based on voucher type (Payment/Receipt/Contra/Journal) and mode (create/edit)

**Implementation**:

```typescript
import clsx from "clsx"
import { useFormContext, useWatch } from "react-hook-form"
import _ from "lodash"
import { IconReset } from "../../../../controls/icons/icon-reset"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { VoucherFormDataType } from "../all-vouchers/all-vouchers"
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"

export function FormActionButtons({ className }: FormActionButtonsType) {
    const {
        formState: {
            errors,
            isDirty,
            isSubmitting,
        },
        control
    } = useFormContext<VoucherFormDataType>()

    const { resetAll }: any = useFormContext()

    const debitEntries = useWatch({ control, name: "debitEntries" }) || []
    const creditEntries = useWatch({ control, name: "creditEntries" }) || []
    const voucherId = useWatch({ control, name: "id" })
    const voucherType = useWatch({ control, name: "voucherType" }) // "Payment", "Receipt", "Contra", "Journal"

    const totalDebits = debitEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0)
    const totalCredits = creditEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0)
    const isBalanced = totalDebits === totalCredits

    // Determine if this is create or edit mode
    const isEditMode = !!voucherId

    // ✅ Check voucher-type-specific permissions
    const getVoucherTypePermission = (action: 'create' | 'edit') => {
        if (!voucherType) return false

        const voucherTypeLower = voucherType.toLowerCase() // "payment", "receipt", "contra", "journal"
        return useUserHasControlPermission(`vouchers.${voucherTypeLower}.${action}`)
    }

    const canCreate = getVoucherTypePermission('create')
    const canEdit = getVoucherTypePermission('edit')

    // Determine if user can submit based on mode and voucher type
    const canSubmit = isEditMode ? canEdit : canCreate

    return (
        <div className={clsx("flex h-10 gap-4 mr-6", className)}>
            {/* Submit Button - Only shown if user has permission for this voucher type */}
            {canSubmit && (
                <button
                    type="submit"
                    className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg transition hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
                    disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isBalanced}
                >
                    <IconSubmit className="mr-2 w-6 h-6 text-white" />
                    {isSubmitting ? "Submitting..." : isEditMode ? "Update" : "Submit"}
                </button>
            )}
        </div>
    )
}

type FormActionButtonsType = {
    className?: string
}
```

**Key Logic**:
1. Get current `voucherType` from form (Payment/Receipt/Contra/Journal)
2. Check permission based on voucher type:
   - **Create mode**: Check `vouchers.payment.create`, `vouchers.receipt.create`, etc.
   - **Edit mode**: Check `vouchers.payment.edit`, `vouchers.receipt.edit`, etc.
3. Only show Submit button if user has permission for that specific voucher type and action

---

### 3.3 View Tab Visibility

**File**: `src/features/accounts/vouchers/all-vouchers/all-vouchers.tsx`

**Current Location**: Lines 51-60 (tabsInfo definition)

**Purpose**: Control visibility of the "View" tab (vouchers list/grid)

**Implementation**:

```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"

export function AllVouchers() {
    // ... existing code ...

    // ✅ Check if user can view the vouchers list/grid
    const canViewVouchersList = useUserHasControlPermission('vouchers.list.view')

    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllVouchersMain />
        },
        // Only show View tab if user has permission
        ...(canViewVouchersList ? [{
            label: "View",
            content: <AllVouchersView instance={instance} />
        }] : [])
    ]

    // ... rest of the code ...
}
```

---

### 3.4 Edit/Delete Buttons in View Grid (Voucher Type Specific)

**File**: `src/features/accounts/vouchers/all-vouchers/all-vouchers-view.tsx`

**Purpose**: Control Edit/Delete button visibility in grid based on voucher type permissions

**Implementation**:

```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"

export function AllVouchersView({ instance }: AllVouchersViewType) {
    // ✅ Check delete permission (applies to all voucher types)
    const canDelete = useUserHasControlPermission('vouchers.delete')

    // Helper function to check if user can edit a specific voucher type
    const canEditVoucherType = (voucherType: string): boolean => {
        if (!voucherType) return false
        const voucherTypeLower = voucherType.toLowerCase()
        return useUserHasControlPermission(`vouchers.${voucherTypeLower}.edit`)
    }

    // In grid columns configuration
    const columns = [
        // ... other columns ...
        {
            field: 'voucherType',
            headerText: 'Voucher Type',
            type: 'string',
            width: 30,
        },
        {
            field: 'actions',
            headerText: 'Actions',
            template: (props: any) => {
                const canEdit = canEditVoucherType(props.voucherType)

                return (
                    <div className="flex gap-2">
                        {canEdit && (
                            <button onClick={() => handleEdit(props)}>
                                Edit
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => handleDelete(props.id)}>
                                Delete
                            </button>
                        )}
                    </div>
                )
            }
        }
    ]

    // ... rest of the code ...
}
```

**Key Logic**:
1. Delete permission is **global** across all voucher types (`vouchers.delete`)
2. Edit permission is **voucher-type-specific**:
   - Check `vouchers.payment.edit` for Payment vouchers
   - Check `vouchers.receipt.edit` for Receipt vouchers
   - Check `vouchers.contra.edit` for Contra vouchers
   - Check `vouchers.journal.edit` for Journal vouchers
3. Each row in the grid dynamically shows Edit button based on the specific voucher's type

---

### 3.5 Voucher Type Buttons Visibility (Status Bar)

**File**: `src/features/accounts/vouchers/voucher-controls/voucher-status-bar.tsx`

**Current Location**: Lines 140-154 (voucher type buttons mapping)

**Purpose**: Control visibility of Payment, Receipt, Contra, and Journal buttons based on `.view` permissions

**Implementation**:

```typescript
import { useUserHasMultiplePermissions } from "../../../../utils/secured-controls/permissions"

export function VoucherStatusBar({ className, tabsInfo }: VoucherStatusBarType) {
    const dispatch: AppDispatchType = useDispatch()
    const { watch, setValue } = useFormContext<VoucherFormDataType>()

    // ... existing code ...

    // ✅ Check voucher type visibility permissions
    const voucherTypePermissions = useUserHasMultiplePermissions({
        canViewPayment: 'vouchers.payment.view',
        canViewReceipt: 'vouchers.receipt.view',
        canViewContra: 'vouchers.contra.view',
        canViewJournal: 'vouchers.journal.view'
    })

    // ✅ Filter voucher types based on permissions
    const visibleVoucherTypes = voucherTypes.filter((type) => {
        switch(type) {
            case 'Payment':
                return voucherTypePermissions.canViewPayment
            case 'Receipt':
                return voucherTypePermissions.canViewReceipt
            case 'Contra':
                return voucherTypePermissions.canViewContra
            case 'Journal':
                return voucherTypePermissions.canViewJournal
            default:
                return false
        }
    })

    return (
        <div className={clsx("relative w-full bg-gradient-to-r from-slate-50 to-slate-100 px-4 sm:px-6 py-3 rounded-lg shadow-sm border border-slate-200", className)}>
            {/* ... existing mode badge and crown code ... */}

            {/* Right section - Preview and Voucher Type Buttons */}
            <div className="flex gap-2 items-center flex-wrap flex-shrink-0 order-2 lg:order-3 ml-auto">
                <div className="flex gap-2 items-center">
                    {/* Preview button */}
                    <div>
                        {getPrintPreview()}
                    </div>

                    {/* ✅ Only render visible voucher types */}
                    {visibleVoucherTypes.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleVoucherTypeChange(type)}
                            className={clsx(
                                "cursor-pointer px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm whitespace-nowrap",
                                voucherType === type
                                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-2 border-indigo-500 shadow-md scale-105"
                                    : "bg-white text-slate-700 border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md",
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* ... rest of the code ... */}
        </div>
    )
}
```

**Key Changes**:
1. Import `useUserHasMultiplePermissions` hook
2. Check **`.view`** permissions for all 4 voucher types:
   - `vouchers.payment.view`
   - `vouchers.receipt.view`
   - `vouchers.contra.view`
   - `vouchers.journal.view`
3. Filter `voucherTypes` array based on permissions
4. Only render buttons for voucher types the user has permission to view

**Permission Logic**:
- **`.view` permission** controls button visibility AND ability to view that voucher type
- A user with only `vouchers.receipt.view` will:
  - ✅ See only the "Receipt" button
  - ❌ Not see Payment, Contra, or Journal buttons
- Admin users (userType='A'/'S') will see all voucher type buttons

---

## Part 4: Testing Setup

### 4.1 Mock User Permissions for Testing

**Create test data in Redux state**:

```typescript
// Scenario 1: Built-in User (view-only - all voucher types)
const builtInUserControls = [
  { controlName: 'vouchers.menu.all-vouchers.view' },  // Can see "All Vouchers" menu
  { controlName: 'vouchers.list.view' },               // Can see View tab
  { controlName: 'vouchers.payment.view' },            // Can see Payment button + view Payment vouchers
  { controlName: 'vouchers.receipt.view' },            // Can see Receipt button + view Receipt vouchers
  { controlName: 'vouchers.contra.view' },             // Can see Contra button + view Contra vouchers
  { controlName: 'vouchers.journal.view' }             // Can see Journal button + view Journal vouchers
  // NO create, edit, or delete permissions
]

// Scenario 2: Built-in Sales Person (ONLY Receipt - can create)
const builtInSalesPersonControls = [
  { controlName: 'vouchers.menu.all-vouchers.view' },  // Can see "All Vouchers" menu
  { controlName: 'vouchers.list.view' },               // Can see View tab
  { controlName: 'vouchers.receipt.view' },            // Can see Receipt button ONLY
  { controlName: 'vouchers.receipt.create' }           // Can create Receipt vouchers ONLY
  // NO edit or delete permissions
  // NO Payment, Contra, or Journal access
]

// Scenario 3: Built-in Accountant (edit-only - all voucher types)
const builtInAccountantControls = [
  { controlName: 'vouchers.menu.all-vouchers.view' },
  { controlName: 'vouchers.list.view' },
  { controlName: 'vouchers.payment.view' },
  { controlName: 'vouchers.payment.edit' },            // Can edit Payment
  { controlName: 'vouchers.receipt.view' },
  { controlName: 'vouchers.receipt.edit' },            // Can edit Receipt
  { controlName: 'vouchers.contra.view' },
  { controlName: 'vouchers.contra.edit' },             // Can edit Contra
  { controlName: 'vouchers.journal.view' },
  { controlName: 'vouchers.journal.edit' }             // Can edit Journal
  // NO create or delete permissions
]

// Scenario 4: Custom Role - Payment specialist (full Payment access)
const paymentSpecialistControls = [
  { controlName: 'vouchers.menu.all-vouchers.view' },
  { controlName: 'vouchers.list.view' },
  { controlName: 'vouchers.payment.view' },            // Payment button visible
  { controlName: 'vouchers.payment.create' },          // Can create Payment
  { controlName: 'vouchers.payment.edit' },            // Can edit Payment
  { controlName: 'vouchers.delete' }                   // Can delete any voucher
  // NO access to Receipt, Contra, or Journal
]
```

### 4.2 Test Scenarios

| User Role | Menu | View Tab | Visible Buttons | Create | Edit | Delete |
|-----------|------|----------|----------------|--------|------|--------|
| **Admin (userType='A')** | ✅ | ✅ | Payment, Receipt, Contra, Journal | ✅ All | ✅ All | ✅ All |
| **Built-in User** | ✅ | ✅ | Payment, Receipt, Contra, Journal | ❌ None | ❌ None | ❌ None |
| **Built-in Sales Person** | ✅ | ✅ | Receipt ONLY | ✅ Receipt ONLY | ❌ None | ❌ None |
| **Built-in Accountant** | ✅ | ✅ | Payment, Receipt, Contra, Journal | ❌ None | ✅ All types | ❌ None |
| **Payment Specialist** | ✅ | ✅ | Payment ONLY | ✅ Payment ONLY | ✅ Payment ONLY | ✅ All |

### 4.3 Expected UI Behavior by Role

**Built-in User (View-Only)**:
- ✅ "All Vouchers" menu item visible
- ✅ "View" tab visible
- ✅ All 4 voucher type buttons visible (Payment, Receipt, Contra, Journal)
- ❌ Submit button NEVER shown (no create/edit permissions)
- ❌ Edit button NEVER shown in grid
- ❌ Delete button NEVER shown in grid

**Built-in Sales Person (Receipt Only)**:
- ✅ "All Vouchers" menu item visible
- ✅ "View" tab visible
- ✅ ONLY "Receipt" button visible (other 3 hidden)
- ✅ Submit button shown ONLY when Receipt voucher type selected and in create mode
- ❌ Edit button NEVER shown in grid
- ❌ Delete button NEVER shown in grid

**Built-in Accountant (Edit Only)**:
- ✅ "All Vouchers" menu item visible
- ✅ "View" tab visible
- ✅ All 4 voucher type buttons visible
- ✅ Submit button shown ONLY in edit mode (when editing any voucher type)
- ✅ Edit button shown for ALL voucher types in grid
- ❌ Delete button NEVER shown in grid

**Payment Specialist (Payment Full Access)**:
- ✅ "All Vouchers" menu item visible
- ✅ "View" tab visible
- ✅ ONLY "Payment" button visible
- ✅ Submit button shown for Payment vouchers (both create and edit)
- ✅ Edit button shown ONLY for Payment vouchers in grid
- ✅ Delete button shown for ALL vouchers in grid

---

## Part 5: Implementation Steps

### Step 1: Create Permissions Utility
✅ **Action**: Create `src/utils/permissions.ts` with all methods
- `useUserHasControlPermission(controlName)`
- `hasControlPermission(state, controlName)`
- `useUserHasMultiplePermissions(permissions)`

**Files to create**: 1
**Estimated time**: 15 minutes

---

### Step 2: Update Master Menu Data
✅ **Action**: Add `requiredPermission` fields to menu items
- Update `MenuDataItemType` type
- Update `ChildMenuItemType` type
- Add permission to Vouchers menu

**Files to modify**: 1 (`master-menu-data.ts`)
**Estimated time**: 10 minutes

---

### Step 3: Implement Menu Filtering
✅ **Action**: Update `side-menu.tsx` to filter menus based on permissions
- Filter parent menus
- Filter child menus

**Files to modify**: 1 (`side-menu.tsx`)
**Estimated time**: 20 minutes

---

### Step 4: Implement Action Buttons Permissions
✅ **Action**: Update `form-action-buttons.tsx`
- Add permission checks for Submit, Reset buttons
- Conditionally render buttons
- Handle create vs edit mode

**Files to modify**: 1 (`form-action-buttons.tsx`)
**Estimated time**: 15 minutes

---

### Step 5: Implement View Tab Permissions
✅ **Action**: Update `all-vouchers.tsx`
- Add permission check for View tab
- Conditionally add View tab to tabs array

**Files to modify**: 1 (`all-vouchers.tsx`)
**Estimated time**: 10 minutes

---

### Step 6: Implement Grid Action Permissions
✅ **Action**: Update `all-vouchers-view.tsx`
- Add permission checks for Edit/Delete buttons in grid
- Conditionally render action buttons

**Files to modify**: 1 (`all-vouchers-view.tsx`)
**Estimated time**: 15 minutes

---

### Step 7: Manual Testing
✅ **Action**: Test with different user roles
- Test as Admin (userType='A')
- Test as Built-in User
- Test as Built-in Sales Person
- Test as Built-in Accountant

**Estimated time**: 30 minutes

---

## Part 6: Quick Reference

### Permission Control Names

```typescript
// Menu visibility
'vouchers.menu.all-vouchers.view'  // "All Vouchers" menu item in sidebar

// View permissions
'vouchers.list.view'               // View tab (vouchers list/grid)

// Global permissions (apply to all voucher types)
'vouchers.delete'                  // Delete button in grid (for any voucher type)
'vouchers.print'                   // Print button (future)
'vouchers.export'                  // Export button (future)

// Payment voucher permissions
'vouchers.payment.view'            // Payment button visibility + view Payment vouchers
'vouchers.payment.create'          // Create Payment vouchers
'vouchers.payment.edit'            // Edit Payment vouchers

// Receipt voucher permissions
'vouchers.receipt.view'            // Receipt button visibility + view Receipt vouchers
'vouchers.receipt.create'          // Create Receipt vouchers
'vouchers.receipt.edit'            // Edit Receipt vouchers

// Contra voucher permissions
'vouchers.contra.view'             // Contra button visibility + view Contra vouchers
'vouchers.contra.create'           // Create Contra vouchers
'vouchers.contra.edit'             // Edit Contra vouchers

// Journal voucher permissions
'vouchers.journal.view'            // Journal button visibility + view Journal vouchers
'vouchers.journal.create'          // Create Journal vouchers
'vouchers.journal.edit'            // Edit Journal vouchers
```

---

### Usage Patterns

#### Pattern 1: Single Permission Check (Menu Visibility)
```typescript
const canViewMenu = useUserHasControlPermission('vouchers.menu.all-vouchers.view')

return (
  <div>
    {canViewMenu && <MenuItem label="All Vouchers" />}
  </div>
)
```

#### Pattern 2: Voucher Type Specific Permissions
```typescript
// Get current voucher type from form
const voucherType = useWatch({ control, name: "voucherType" }) // "Payment", "Receipt", etc.
const voucherTypeLower = voucherType?.toLowerCase()

// Check if user can create this specific voucher type
const canCreate = useUserHasControlPermission(`vouchers.${voucherTypeLower}.create`)

return (
  <div>
    {canCreate && <button>Submit</button>}
  </div>
)
```

#### Pattern 3: Multiple Voucher Type Permissions (Status Bar)
```typescript
const voucherTypePermissions = useUserHasMultiplePermissions({
  canViewPayment: 'vouchers.payment.view',
  canViewReceipt: 'vouchers.receipt.view',
  canViewContra: 'vouchers.contra.view',
  canViewJournal: 'vouchers.journal.view'
})

const visibleVoucherTypes = ['Payment', 'Receipt', 'Contra', 'Journal'].filter((type) => {
  switch(type) {
    case 'Payment': return voucherTypePermissions.canViewPayment
    case 'Receipt': return voucherTypePermissions.canViewReceipt
    case 'Contra': return voucherTypePermissions.canViewContra
    case 'Journal': return voucherTypePermissions.canViewJournal
    default: return false
  }
})
```

#### Pattern 4: Conditional Tab Rendering
```typescript
const canViewList = useUserHasControlPermission('vouchers.list.view')

const tabs = [
  { label: 'New/Edit', content: <Form /> },
  ...(canViewList ? [{ label: 'View', content: <Grid /> }] : [])
]
```

#### Pattern 5: Dynamic Grid Action Buttons
```typescript
const canDelete = useUserHasControlPermission('vouchers.delete')

const canEditVoucherType = (voucherType: string): boolean => {
  const voucherTypeLower = voucherType.toLowerCase()
  return useUserHasControlPermission(`vouchers.${voucherTypeLower}.edit`)
}

// In grid template
template: (props: any) => {
  const canEdit = canEditVoucherType(props.voucherType)

  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  )
}
```

---

## Part 7: Database Setup

### 7.1 Insert Secured Controls (SQL)

```sql
-- Insert vouchers module controls into SecuredControlM table
INSERT INTO SecuredControlM (controlNo, controlName, controlType, descr)
VALUES
-- Menu and general permissions
(100, 'vouchers.menu.all-vouchers.view', 'menu', 'Can view All Vouchers menu item in sidebar'),
(101, 'vouchers.list.view', 'action', 'Can view vouchers in View tab (list/grid)'),
(102, 'vouchers.delete', 'action', 'Can delete vouchers from grid'),
(103, 'vouchers.print', 'action', 'Can print vouchers'),
(104, 'vouchers.export', 'action', 'Can export vouchers to PDF/Excel'),

-- Payment voucher permissions
(110, 'vouchers.payment.view', 'action', 'Can view Payment voucher type button and view Payment vouchers'),
(111, 'vouchers.payment.create', 'action', 'Can create new Payment vouchers'),
(112, 'vouchers.payment.edit', 'action', 'Can edit existing Payment vouchers'),

-- Receipt voucher permissions
(120, 'vouchers.receipt.view', 'action', 'Can view Receipt voucher type button and view Receipt vouchers'),
(121, 'vouchers.receipt.create', 'action', 'Can create new Receipt vouchers'),
(122, 'vouchers.receipt.edit', 'action', 'Can edit existing Receipt vouchers'),

-- Contra voucher permissions
(130, 'vouchers.contra.view', 'action', 'Can view Contra voucher type button and view Contra vouchers'),
(131, 'vouchers.contra.create', 'action', 'Can create new Contra vouchers'),
(132, 'vouchers.contra.edit', 'action', 'Can edit existing Contra vouchers'),

-- Journal voucher permissions
(140, 'vouchers.journal.view', 'action', 'Can view Journal voucher type button and view Journal vouchers'),
(141, 'vouchers.journal.create', 'action', 'Can create new Journal vouchers'),
(142, 'vouchers.journal.edit', 'action', 'Can edit existing Journal vouchers');
```

### 7.2 Link Controls to Roles

```sql
-- Built-in User (view-only - all voucher types)
INSERT INTO RoleSecuredControlX (roleId, securedControlId)
SELECT
  (SELECT roleId FROM RoleM WHERE roleName = 'built-in-user'),
  id
FROM SecuredControlM
WHERE controlName IN (
  'vouchers.menu.all-vouchers.view',
  'vouchers.list.view',
  'vouchers.payment.view',
  'vouchers.receipt.view',
  'vouchers.contra.view',
  'vouchers.journal.view'
);

-- Built-in Sales Person (ONLY Receipt - can create)
INSERT INTO RoleSecuredControlX (roleId, securedControlId)
SELECT
  (SELECT roleId FROM RoleM WHERE roleName = 'built-in-sales-person'),
  id
FROM SecuredControlM
WHERE controlName IN (
  'vouchers.menu.all-vouchers.view',
  'vouchers.list.view',
  'vouchers.receipt.view',
  'vouchers.receipt.create'
);

-- Built-in Accountant (edit-only - all voucher types, no create)
INSERT INTO RoleSecuredControlX (roleId, securedControlId)
SELECT
  (SELECT roleId FROM RoleM WHERE roleName = 'built-in-accountant'),
  id
FROM SecuredControlM
WHERE controlName IN (
  'vouchers.menu.all-vouchers.view',
  'vouchers.list.view',
  'vouchers.payment.view',
  'vouchers.payment.edit',
  'vouchers.receipt.view',
  'vouchers.receipt.edit',
  'vouchers.contra.view',
  'vouchers.contra.edit',
  'vouchers.journal.view',
  'vouchers.journal.edit'
);
```

---

## Summary

**Total Secured Controls**: 17
- 1 menu control
- 4 general action controls (list.view, delete, print, export)
- 12 voucher-type-specific controls (4 voucher types × 3 actions each: view, create, edit)

**Total Files to Modify**: 5
- `master-menu-data.ts` - Add permission field for "All Vouchers" menu item
- `side-menu.tsx` - Filter menu items based on permissions
- `form-action-buttons.tsx` - Show Submit button based on voucher type and create/edit permissions
- `all-vouchers.tsx` - Show View tab based on list.view permission
- `all-vouchers-view.tsx` - Show Edit/Delete buttons based on voucher type and permissions
- `voucher-status-bar.tsx` - Filter voucher type buttons based on .view permissions

**Total Implementation Time**: ~2.5 hours

**Key Features**:
1. ✅ **Granular voucher type control**: Separate permissions for Payment, Receipt, Contra, and Journal
2. ✅ **CRUD separation**: Independent view, create, and edit permissions per voucher type
3. ✅ **Menu visibility**: Control "All Vouchers" menu item visibility
4. ✅ **Dynamic UI**: Voucher type buttons shown/hidden based on user permissions
5. ✅ **Context-aware actions**: Submit button shown based on current voucher type and mode
6. ✅ **Grid row-level permissions**: Edit button shown per voucher based on its type
7. ✅ **Admin auto-permissions**: Admin users (userType='A'/'S') bypass all permission checks
8. ✅ **Clean, reusable hooks**: `useUserHasControlPermission` and `useUserHasMultiplePermissions`
9. ✅ **Type-safe implementation**: Full TypeScript support

**Permission Hierarchy**:
```
vouchers.menu.all-vouchers.view          → Menu visibility
  └─ vouchers.list.view                  → View tab visibility
      └─ vouchers.{type}.view            → Voucher type button visibility
          ├─ vouchers.{type}.create      → Create permission for specific type
          └─ vouchers.{type}.edit        → Edit permission for specific type
  └─ vouchers.delete                     → Delete permission (global)
```

**Example Use Cases**:
- **Sales Person**: Only sees Receipt button, can only create Receipt vouchers
- **Accountant**: Sees all voucher types, can only edit (not create)
- **Payment Clerk**: Only sees Payment button, can create and edit Payment vouchers
- **Manager**: Full access to all voucher types and operations
