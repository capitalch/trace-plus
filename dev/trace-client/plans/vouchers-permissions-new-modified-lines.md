# Vouchers Permissions Implementation - New/Modified Lines Identification

This document identifies the specific new and modified lines required for implementing the granular voucher permissions system.

---

## File 1: `src/features/layouts/master-menu-data.ts`

### MODIFY: Type Definitions (Lines 318-337)

**Current Code:**
```typescript
export type MenuDataItemType = {
  id: string;
  label: string;
  icon: any;
  iconColorClass: string;
  children: Array<ChildMenuItemType>;
  path?: string;
};

export type ChildMenuItemType = {
  id: string;
  label: string;
  path: string;
};
```

**New Code:**
```typescript
export type MenuDataItemType = {
  id: string;
  label: string;
  icon: any;
  iconColorClass: string;
  children: Array<ChildMenuItemType>;
  path?: string;
  requiredPermission?: string;  // ✅ NEW LINE
};

export type ChildMenuItemType = {
  id: string;
  label: string;
  path: string;
  requiredPermission?: string;  // ✅ NEW LINE
};
```

### MODIFY: Menu Data (Lines 24-30)

**Current Code:**
```typescript
{
  id: "10",
  label: "All Vouchers",
  path: "/all-vouchers",
},
```

**New Code:**
```typescript
{
  id: "10",
  label: "All Vouchers",
  path: "/all-vouchers",
  requiredPermission: 'vouchers.menu.all-vouchers.view'  // ✅ NEW LINE
},
```

---

## File 2: `src/features/layouts/side-bar/side-menu.tsx`

### ADD: Import Statement (Line 1)

**New Code:**
```typescript
import { useUserHasControlPermission } from '../../../utils/secured-controls/permissions'  // ✅ NEW LINE
```

### MODIFY: getAllParentsWithChildren Function (Lines 30-39)

**Current Code:**
```typescript
function getAllParentsWithChildren() {
    const items: any[] = menuData.map((item: MenuDataItemType, index: number) => {
        return (
            <div key={index} className="flex flex-col">
                {getParentWithChildren(item)}
            </div>
        )
    })
    return (items)
}
```

**New Code:**
```typescript
function getAllParentsWithChildren() {
    const items: any[] = menuData
        .filter((item: MenuDataItemType) => {  // ✅ NEW LINE
            // Filter parent menu if it has requiredPermission  // ✅ NEW LINE
            if (item.requiredPermission) {  // ✅ NEW LINE
                return useUserHasControlPermission(item.requiredPermission)  // ✅ NEW LINE
            }  // ✅ NEW LINE
            // Show parent if it has at least one visible child  // ✅ NEW LINE
            const visibleChildren = item.children.filter((child: ChildMenuItemType) => {  // ✅ NEW LINE
                if (child.requiredPermission) {  // ✅ NEW LINE
                    return useUserHasControlPermission(child.requiredPermission)  // ✅ NEW LINE
                }  // ✅ NEW LINE
                return true  // ✅ NEW LINE
            })  // ✅ NEW LINE
            return visibleChildren.length > 0  // ✅ NEW LINE
        })  // ✅ NEW LINE
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

### MODIFY: getChildren Function (Lines 71-94)

**Current Code:**
```typescript
function getChildren(item: MenuDataItemType) {
    const children = item.children.map((child: ChildMenuItemType, index: number) => {
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
```

**New Code:**
```typescript
function getChildren(item: MenuDataItemType) {
    const children = item.children
        .filter((child: ChildMenuItemType) => {  // ✅ NEW LINE
            // Filter child menu items based on permissions  // ✅ NEW LINE
            if (child.requiredPermission) {  // ✅ NEW LINE
                return useUserHasControlPermission(child.requiredPermission)  // ✅ NEW LINE
            }  // ✅ NEW LINE
            return true  // ✅ NEW LINE
        })  // ✅ NEW LINE
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
```

---

## File 3: `src/features/accounts/vouchers/voucher-controls/form-action-buttons.tsx`

### ADD: Import Statement (Line 1)

**New Code:**
```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"  // ✅ NEW LINE
```

### MODIFY: FormActionButtons Component (Lines 10-55)

**Current Code:**
```typescript
export function FormActionButtons({ className }: FormActionButtonsType) {
    const {
        formState: {
            errors,
            isDirty,
            isSubmitting,
        }, control
    } = useFormContext<VoucherFormDataType>();
    const { resetAll }: any = useFormContext();

    // const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)
    // const hasSubmitPermission = userSecuredControls?.some(
    //     control => control.controlName === 'payment-save'
    // )
    const debitEntries = useWatch({ control, name: "debitEntries" }) || [];
    const creditEntries = useWatch({ control, name: "creditEntries" }) || [];
    const totalDebits = debitEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const totalCredits = creditEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const isBalanced = totalDebits === totalCredits;

    return (
        <div className={clsx("flex h-10 gap-4 mr-6", className)}>
            {/* <button type="button" onClick={handleOnTest}>Test</button> */}
            {/* Reset */}
            <button
                onClick={resetAll}
                type="button"
                className="inline-flex items-center px-5 font-medium text-center text-white bg-amber-500 rounded-lg transition hover:bg-amber-800 focus:outline-hidden focus:ring-4 focus:ring-amber-300 disabled:bg-amber-200 dark:bg-amber-600 dark:focus:ring-amber-800 dark:hover:bg-amber-700"
            >
                <IconReset className="mr-2 w-6 h-6 text-white" />
                Reset
            </button>

            {/*hasSubmitPermission && */<button
                type="submit"
                className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg transition hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
                disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isBalanced}
            ><IconSubmit className="mr-2 w-6 h-6 text-white" />
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>}
        </div>)
}
```

**New Code:**
```typescript
export function FormActionButtons({ className }: FormActionButtonsType) {
    const {
        formState: {
            errors,
            isDirty,
            isSubmitting,
        }, control
    } = useFormContext<VoucherFormDataType>();
    const { resetAll }: any = useFormContext();

    const debitEntries = useWatch({ control, name: "debitEntries" }) || [];
    const creditEntries = useWatch({ control, name: "creditEntries" }) || [];
    const voucherId = useWatch({ control, name: "id" })  // ✅ NEW LINE
    const voucherType = useWatch({ control, name: "voucherType" })  // ✅ NEW LINE

    const totalDebits = debitEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const totalCredits = creditEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const isBalanced = totalDebits === totalCredits;

    // Determine if this is create or edit mode  // ✅ NEW LINE
    const isEditMode = !!voucherId  // ✅ NEW LINE

    // ✅ Check voucher-type-specific permissions  // ✅ NEW LINE
    const getVoucherTypePermission = (action: 'create' | 'edit') => {  // ✅ NEW LINE
        if (!voucherType) return false  // ✅ NEW LINE
        const voucherTypeLower = voucherType.toLowerCase()  // ✅ NEW LINE
        return useUserHasControlPermission(`vouchers.${voucherTypeLower}.${action}`)  // ✅ NEW LINE
    }  // ✅ NEW LINE

    const canCreate = getVoucherTypePermission('create')  // ✅ NEW LINE
    const canEdit = getVoucherTypePermission('edit')  // ✅ NEW LINE

    // Determine if user can submit based on mode and voucher type  // ✅ NEW LINE
    const canSubmit = isEditMode ? canEdit : canCreate  // ✅ NEW LINE

    return (
        <div className={clsx("flex h-10 gap-4 mr-6", className)}>
            {/* Submit Button - Only shown if user has permission for this voucher type */}  {/* ✅ MODIFIED COMMENT */}
            {canSubmit && (  {/* ✅ MODIFIED LINE */}
                <button
                    type="submit"
                    className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg transition hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
                    disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isBalanced}
                >
                    <IconSubmit className="mr-2 w-6 h-6 text-white" />
                    {isSubmitting ? "Submitting..." : isEditMode ? "Update" : "Submit"}  {/* ✅ MODIFIED LINE */}
                </button>
            )}
        </div>)
}
```

**Removed Lines:**
- Lines 20-23: Commented-out permission code

---

## File 4: `src/features/accounts/vouchers/all-vouchers/all-vouchers.tsx`

### ADD: Import Statement (Line 1)

**New Code:**
```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"  // ✅ NEW LINE
```

### MODIFY: tabsInfo Definition (Lines 51-60)

**Current Code:**
```typescript
const tabsInfo: CompTabsType = [
    {
        label: "New / Edit",
        content: <AllVouchersMain />
    },
    {
        label: "View",
        content: <AllVouchersView instance={instance} />
    }
];
```

**New Code:**
```typescript
// ✅ Check if user can view the vouchers list/grid  // ✅ NEW LINE
const canViewVouchersList = useUserHasControlPermission('vouchers.list.view')  // ✅ NEW LINE

const tabsInfo: CompTabsType = [
    {
        label: "New / Edit",
        content: <AllVouchersMain />
    },
    // Only show View tab if user has permission  // ✅ NEW LINE
    ...(canViewVouchersList ? [{  // ✅ MODIFIED LINE
        label: "View",
        content: <AllVouchersView instance={instance} />
    }] : [])  // ✅ MODIFIED LINE
];
```

---

## File 5: `src/features/accounts/vouchers/all-vouchers/all-vouchers-view.tsx`

### ADD: Import Statement (Line 1)

**New Code:**
```typescript
import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"  // ✅ NEW LINE
```

### ADD: Permission Checks in Component (After line 38)

**New Code:**
```typescript
// ✅ Check delete permission (applies to all voucher types)  // ✅ NEW LINE
const canDelete = useUserHasControlPermission('vouchers.delete')  // ✅ NEW LINE

// Helper function to check if user can edit a specific voucher type  // ✅ NEW LINE
const canEditVoucherType = (voucherType: string): boolean => {  // ✅ NEW LINE
    if (!voucherType) return false  // ✅ NEW LINE
    const voucherTypeLower = voucherType.toLowerCase()  // ✅ NEW LINE
    return useUserHasControlPermission(`vouchers.${voucherTypeLower}.edit`)  // ✅ NEW LINE
}  // ✅ NEW LINE
```

### MODIFY: onEdit Handler (Lines 391-397)

**Current Code:**
```typescript
async function handleOnEdit(data: RowDataType) {
    try {
        populateFormFromId(data.id);
    } catch (e: any) {
        console.error(e);
    }
}
```

**New Code:**
```typescript
async function handleOnEdit(data: RowDataType) {
    try {
        // ✅ Check permission before allowing edit  // ✅ NEW LINE
        const canEdit = canEditVoucherType(Utils.getTranTypeName(data.tranTypeId || 0))  // ✅ NEW LINE
        if (!canEdit) {  // ✅ NEW LINE
            Utils.showAlertMessage("Permission Denied", "You don't have permission to edit this voucher type")  // ✅ NEW LINE
            return  // ✅ NEW LINE
        }  // ✅ NEW LINE
        populateFormFromId(data.id);
    } catch (e: any) {
        console.error(e);
    }
}
```

**Note:** The grid's onEdit and onDelete are currently called directly from CompSyncFusionGrid. For dynamic permission-based rendering of Edit/Delete buttons, the grid component would need to support a custom action column template.

**Alternative Implementation:** Add voucherType field to RowDataType and use template for actions column:

```typescript
{
    field: 'actions',
    headerText: 'Actions',
    width: 100,
    template: (props: any) => {
        const voucherTypeName = Utils.getTranTypeName(props.tranTypeId || 0)
        const canEdit = canEditVoucherType(voucherTypeName)

        return (
            <div className="flex gap-2">
                {canEdit && (
                    <button onClick={() => handleOnEdit(props)}>
                        Edit
                    </button>
                )}
                {canDelete && (
                    <button onClick={() => handleOnDelete(props.id)}>
                        Delete
                    </button>
                )}
            </div>
        )
    }
}
```

---

## File 6: `src/features/accounts/vouchers/voucher-controls/voucher-status-bar.tsx`

### ADD: Import Statement (Line 1)

**New Code:**
```typescript
import { useUserHasMultiplePermissions } from "../../../../utils/secured-controls/permissions"  // ✅ NEW LINE
```

### ADD: Permission Checks (After line 41, before getPrintPreview function)

**New Code:**
```typescript
// ✅ Check voucher type visibility permissions  // ✅ NEW LINE
const voucherTypePermissions = useUserHasMultiplePermissions({  // ✅ NEW LINE
    canViewPayment: 'vouchers.payment.view',  // ✅ NEW LINE
    canViewReceipt: 'vouchers.receipt.view',  // ✅ NEW LINE
    canViewContra: 'vouchers.contra.view',  // ✅ NEW LINE
    canViewJournal: 'vouchers.journal.view'  // ✅ NEW LINE
})  // ✅ NEW LINE

// ✅ Filter voucher types based on permissions  // ✅ NEW LINE
const visibleVoucherTypes = voucherTypes.filter((type) => {  // ✅ NEW LINE
    switch(type) {  // ✅ NEW LINE
        case 'Payment':  // ✅ NEW LINE
            return voucherTypePermissions.canViewPayment  // ✅ NEW LINE
        case 'Receipt':  // ✅ NEW LINE
            return voucherTypePermissions.canViewReceipt  // ✅ NEW LINE
        case 'Contra':  // ✅ NEW LINE
            return voucherTypePermissions.canViewContra  // ✅ NEW LINE
        case 'Journal':  // ✅ NEW LINE
            return voucherTypePermissions.canViewJournal  // ✅ NEW LINE
        default:  // ✅ NEW LINE
            return false  // ✅ NEW LINE
    }  // ✅ NEW LINE
})  // ✅ NEW LINE
```

### MODIFY: Voucher Type Buttons Rendering (Line 140)

**Current Code:**
```typescript
{voucherTypes.map((type) => (
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
```

**New Code:**
```typescript
{visibleVoucherTypes.map((type) => (  {/* ✅ MODIFIED: voucherTypes → visibleVoucherTypes */}
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
```

---

## Summary of Changes

### Files Modified: 6
1. `master-menu-data.ts` - Add `requiredPermission` field to types and data
2. `side-menu.tsx` - Add filtering logic based on permissions
3. `form-action-buttons.tsx` - Add voucher-type-specific submit button logic
4. `all-vouchers.tsx` - Add conditional View tab rendering
5. `all-vouchers-view.tsx` - Add permission checks for edit/delete
6. `voucher-status-bar.tsx` - Add voucher type button filtering

### Total New Lines: ~65
### Total Modified Lines: ~25
### Total Lines of Code Changed: ~90

### Key Patterns:
1. **Import Pattern**: `import { useUserHasControlPermission } from "../../../../utils/secured-controls/permissions"`
2. **Single Permission Check**: `const canX = useUserHasControlPermission('vouchers.X.Y')`
3. **Multiple Permission Check**: `const permissions = useUserHasMultiplePermissions({ ... })`
4. **Dynamic Permission**: ```const canX = useUserHasControlPermission(`vouchers.${voucherTypeLower}.${action}`)```
5. **Conditional Rendering**: `{canX && <Component />}` or `...(canX ? [item] : [])`
6. **Array Filtering**: `.filter(item => checkPermission(item))`
