# Voucher Permissions Implementation

Complete guide for implementing granular voucher type permissions (Payment, Receipt, Contra, Journal).

---

## Permissions Structure

**25 Total Controls**: 1 menu + 24 voucher-specific (4 types × 6 actions)

```typescript
// Menu
'vouchers.menu.all-vouchers.view'

// Per voucher type (payment/receipt/contra/journal)
'vouchers.{type}.view'      // Button visibility + list access
'vouchers.{type}.create'    // Create new vouchers
'vouchers.{type}.edit'      // Edit existing vouchers
'vouchers.{type}.delete'    // Delete vouchers
'vouchers.{type}.preview'   // Preview vouchers
'vouchers.{type}.export'    // Export to PDF/Excel
```

---

## Permission Utility (`src/utils/permissions.ts`)

```typescript
import { useSelector } from 'react-redux'
import { RootStateType } from '../app/store'

export const useUserHasControlPermission = (controlName: string): boolean => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  if (userType === 'A' || userType === 'S') return true
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

export const hasControlPermission = (state: RootStateType, controlName: string): boolean => {
  const userType = state.login.userDetails?.userType
  const userSecuredControls = state.login.userSecuredControls

  if (userType === 'A' || userType === 'S') return true
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

export const useUserHasMultiplePermissions = <T extends Record<string, string>>(
  permissions: T
): Record<keyof T, boolean> => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  if (userType === 'A' || userType === 'S') {
    return Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)
  }

  return Object.entries(permissions).reduce((acc, [key, controlName]) => {
    acc[key as keyof T] = userSecuredControls?.some(
      control => control.controlName === controlName
    ) ?? false
    return acc
  }, {} as Record<keyof T, boolean>)
}
```

---

## Implementation Changes

### 1. Menu Data (`master-menu-data.ts`)

**Add permission field to types:**
```typescript
export type MenuDataItemType = {
  // ... existing fields
  requiredPermission?: string;  // ADD
}

export type ChildMenuItemType = {
  // ... existing fields
  requiredPermission?: string;  // ADD
}
```

**Add to All Vouchers menu item:**
```typescript
{
  id: "10",
  label: "All Vouchers",
  path: "/all-vouchers",
  requiredPermission: 'vouchers.menu.all-vouchers.view'  // ADD
}
```

### 2. Side Menu (`side-menu.tsx`)

**Import:**
```typescript
import { useUserHasControlPermission } from '../../../utils/secured-controls/permissions'
```

**Filter parent menus:**
```typescript
function getAllParentsWithChildren() {
    const items: any[] = menuData
        .filter((item: MenuDataItemType) => {
            if (item.requiredPermission) {
                return useUserHasControlPermission(item.requiredPermission)
            }
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
```

**Filter child menus:**
```typescript
function getChildren(item: MenuDataItemType) {
    const children = item.children
        .filter((child: ChildMenuItemType) => {
            if (child.requiredPermission) {
                return useUserHasControlPermission(child.requiredPermission)
            }
            return true
        })
        .map((child: ChildMenuItemType, index: number) => {
            // ... existing render code
        })
    // ... rest of code
}
```

### 3. Form Action Buttons (`form-action-buttons.tsx`)

**Import:**
```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"
```

**Check permissions:**
```typescript
export function FormActionButtons({ className }: FormActionButtonsType) {
    const { formState: { errors, isDirty, isSubmitting }, control } = useFormContext<VoucherFormDataType>()
    const { resetAll }: any = useFormContext()

    const debitEntries = useWatch({ control, name: "debitEntries" }) || []
    const creditEntries = useWatch({ control, name: "creditEntries" }) || []
    const voucherId = useWatch({ control, name: "id" })
    const voucherType = useWatch({ control, name: "voucherType" })

    const totalDebits = debitEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0)
    const totalCredits = creditEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0)
    const isBalanced = totalDebits === totalCredits

    const isEditMode = !!voucherId

    const getVoucherTypePermission = (action: 'create' | 'edit') => {
        if (!voucherType) return false
        const voucherTypeLower = voucherType.toLowerCase()
        return useUserHasControlPermission(`vouchers.${voucherTypeLower}.${action}`)
    }

    const canCreate = getVoucherTypePermission('create')
    const canEdit = getVoucherTypePermission('edit')
    const canSubmit = isEditMode ? canEdit : canCreate

    return (
        <div className={clsx("flex h-10 gap-4 mr-6", className)}>
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
```

### 4. All Vouchers (`all-vouchers.tsx`)

**Import:**
```typescript
import { useUserHasMultiplePermissions } from "../../../../utils/secured-controls/permissions"
```

**Conditional View tab:**
```typescript
const voucherTypePermissions = useUserHasMultiplePermissions({
    canViewPayment: 'vouchers.payment.view',
    canViewReceipt: 'vouchers.receipt.view',
    canViewContra: 'vouchers.contra.view',
    canViewJournal: 'vouchers.journal.view'
})

const canViewAnyVoucherType = Object.values(voucherTypePermissions).some(permission => permission)

const tabsInfo: CompTabsType = [
    {
        label: "New / Edit",
        content: <AllVouchersMain />
    },
    ...(canViewAnyVoucherType ? [{
        label: "View",
        content: <AllVouchersView instance={instance} />
    }] : [])
]
```

### 5. Voucher Status Bar (`voucher-status-bar.tsx`)

**Import:**
```typescript
import { useUserHasMultiplePermissions } from "../../../../utils/secured-controls/permissions"
```

**Filter visible buttons:**
```typescript
const voucherTypePermissions = useUserHasMultiplePermissions({
    canViewPayment: 'vouchers.payment.view',
    canViewReceipt: 'vouchers.receipt.view',
    canViewContra: 'vouchers.contra.view',
    canViewJournal: 'vouchers.journal.view'
})

const visibleVoucherTypes = voucherTypes.filter((type) => {
    switch(type) {
        case 'Payment': return voucherTypePermissions.canViewPayment
        case 'Receipt': return voucherTypePermissions.canViewReceipt
        case 'Contra': return voucherTypePermissions.canViewContra
        case 'Journal': return voucherTypePermissions.canViewJournal
        default: return false
    }
})

// In render:
{visibleVoucherTypes.map((type) => (
    <button /* ... existing button props */>
        {type}
    </button>
))}
```

### 6. All Vouchers View (`all-vouchers-view.tsx`)

**Import:**
```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"
```

**Add permission helpers:**
```typescript
const canEditVoucherType = (voucherType: string): boolean => {
    if (!voucherType) return false
    const voucherTypeLower = voucherType.toLowerCase()
    return useUserHasControlPermission(`vouchers.${voucherTypeLower}.edit`)
}

const canDeleteVoucherType = (voucherType: string): boolean => {
    if (!voucherType) return false
    const voucherTypeLower = voucherType.toLowerCase()
    return useUserHasControlPermission(`vouchers.${voucherTypeLower}.delete`)
}

const canPreviewVoucherType = (voucherType: string): boolean => {
    if (!voucherType) return false
    const voucherTypeLower = voucherType.toLowerCase()
    return useUserHasControlPermission(`vouchers.${voucherTypeLower}.preview`)
}

const canExportVoucherType = (voucherType: string): boolean => {
    if (!voucherType) return false
    const voucherTypeLower = voucherType.toLowerCase()
    return useUserHasControlPermission(`vouchers.${voucherTypeLower}.export`)
}
```

**Grid actions column template:**
```typescript
{
    field: 'actions',
    headerText: 'Actions',
    template: (props: any) => {
        const voucherTypeName = Utils.getTranTypeName(props.tranTypeId || 0)
        const canEdit = canEditVoucherType(voucherTypeName)
        const canDelete = canDeleteVoucherType(voucherTypeName)
        const canPreview = canPreviewVoucherType(voucherTypeName)
        const canExport = canExportVoucherType(voucherTypeName)

        return (
            <div className="flex gap-2">
                {canEdit && <button onClick={() => handleEdit(props)}>Edit</button>}
                {canDelete && <button onClick={() => handleDelete(props.id)}>Delete</button>}
                {canPreview && <button onClick={() => handlePreview(props)}>Preview</button>}
                {canExport && <button onClick={() => handleExport(props)}>Export</button>}
            </div>
        )
    }
}
```

---

## Database Setup

```sql
-- Insert controls (100-145)
INSERT INTO SecuredControlM (controlNo, controlName, controlType, descr)
VALUES
(100, 'vouchers.menu.all-vouchers.view', 'menu', 'Can view All Vouchers menu item'),
(110, 'vouchers.payment.view', 'action', 'Can view Payment button and list'),
(111, 'vouchers.payment.create', 'action', 'Can create Payment vouchers'),
(112, 'vouchers.payment.edit', 'action', 'Can edit Payment vouchers'),
(113, 'vouchers.payment.delete', 'action', 'Can delete Payment vouchers'),
(114, 'vouchers.payment.preview', 'action', 'Can preview Payment vouchers'),
(115, 'vouchers.payment.export', 'action', 'Can export Payment vouchers'),
(120, 'vouchers.receipt.view', 'action', 'Can view Receipt button and list'),
(121, 'vouchers.receipt.create', 'action', 'Can create Receipt vouchers'),
(122, 'vouchers.receipt.edit', 'action', 'Can edit Receipt vouchers'),
(123, 'vouchers.receipt.delete', 'action', 'Can delete Receipt vouchers'),
(124, 'vouchers.receipt.preview', 'action', 'Can preview Receipt vouchers'),
(125, 'vouchers.receipt.export', 'action', 'Can export Receipt vouchers'),
(130, 'vouchers.contra.view', 'action', 'Can view Contra button and list'),
(131, 'vouchers.contra.create', 'action', 'Can create Contra vouchers'),
(132, 'vouchers.contra.edit', 'action', 'Can edit Contra vouchers'),
(133, 'vouchers.contra.delete', 'action', 'Can delete Contra vouchers'),
(134, 'vouchers.contra.preview', 'action', 'Can preview Contra vouchers'),
(135, 'vouchers.contra.export', 'action', 'Can export Contra vouchers'),
(140, 'vouchers.journal.view', 'action', 'Can view Journal button and list'),
(141, 'vouchers.journal.create', 'action', 'Can create Journal vouchers'),
(142, 'vouchers.journal.edit', 'action', 'Can edit Journal vouchers'),
(143, 'vouchers.journal.delete', 'action', 'Can delete Journal vouchers'),
(144, 'vouchers.journal.preview', 'action', 'Can preview Journal vouchers'),
(145, 'vouchers.journal.export', 'action', 'Can export Journal vouchers');
```

---

## Test Scenarios

| Role | Menu | Visible Buttons | Create | Edit | Delete | Preview | Export |
|------|------|----------------|--------|------|--------|---------|--------|
| **Admin** | ✅ | All 4 types | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| **View-Only User** | ✅ | All 4 types | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Sales Person** | ✅ | Receipt only | ✅ Receipt | ❌ | ❌ | ❌ | ❌ |
| **Accountant** | ✅ | All 4 types | ❌ | ✅ All | ❌ | ❌ | ❌ |
| **Payment Specialist** | ✅ | Payment only | ✅ Payment | ✅ Payment | ✅ Payment | ✅ Payment | ✅ Payment |

---

## Summary

- **Files Modified**: 6
- **New Lines**: ~85
- **Modified Lines**: ~30
- **Implementation Time**: ~3 hours
- **Total Controls**: 25 (1 menu + 24 voucher-specific)
- **Key Pattern**: Voucher-type-specific permissions for granular access control
