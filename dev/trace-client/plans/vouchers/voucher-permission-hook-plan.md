# Voucher Permission Hook Implementation Plan

## Overview
Create a reusable React hook `useVoucherPermissions` that returns permission flags (canCreate, canView, canEdit, canDelete, canPreview, canExport) based on the selected voucher type and current user's permissions.

---

## File to Create

**File**: `src/features/accounts/vouchers/hooks/voucher-permission-hook.ts`

---

## Hook Design

### Input Parameters (Optional)
```typescript
voucherType?: string  // "Payment", "Receipt", "Contra", "Journal" (optional - will read from form if not provided)
```

### Output (Return Value)
```typescript
{
  canView: boolean,
  canCreate: boolean,
  canEdit: boolean,
  canDelete: boolean,
  canPreview: boolean,
  canExport: boolean
}
```

---

## Implementation Details

### 1. Hook Signature
```typescript
export function useVoucherPermissions(voucherType?: string)
```

### 2. Logic Flow
1. Try to read `voucherType` from form context using `useWatch` (if hook is used within form context)
2. If `voucherType` parameter is provided, use that instead (parameter takes precedence)
3. If neither available, return all permissions as `false`
4. Convert voucher type to lowercase for permission name construction
5. Use `useUserHasMultiplePermissions` hook to check all 6 permissions at once
6. Return object with 6 boolean flags

### 3. Smart Behavior
- **Option A**: Call with parameter → `useVoucherPermissions('Payment')`
  - Uses the provided voucher type
- **Option B**: Call without parameter → `useVoucherPermissions()`
  - Automatically reads from form context (if available)
  - Perfect for components that are already inside the form

### 3. Permission Name Pattern
```typescript
// For voucherType = "Payment"
'vouchers.payment.view'
'vouchers.payment.create'
'vouchers.payment.edit'
'vouchers.payment.delete'
'vouchers.payment.preview'
'vouchers.payment.export'
```

### 4. Edge Cases
- If `voucherType` is undefined/null/empty → all permissions return `false`
- If user is Admin (userType='A' or 'S') → all permissions return `true` (handled by base permission hook)
- Case-insensitive voucher type handling (convert to lowercase)
- If used outside form context and no parameter provided → returns all `false` (safe fallback)

---

## Complete Implementation Code

```typescript
import { useFormContext, useWatch } from 'react-hook-form'
import { useUserHasMultiplePermissions } from '../../../../utils/secured-controls/permissions'
import { VoucherFormDataType } from '../all-vouchers/all-vouchers'

/**
 * Custom hook to check all permissions for a specific voucher type
 *
 * Can be used in two ways:
 * 1. With parameter: useVoucherPermissions('Payment') - uses the provided voucher type
 * 2. Without parameter: useVoucherPermissions() - automatically reads from form context
 *
 * @param voucherType - Optional voucher type (Payment, Receipt, Contra, Journal).
 *                      If not provided, reads from form context
 * @returns Object with permission flags for all actions
 *
 * @example
 * // Option 1: Provide voucher type explicitly
 * const { canCreate, canEdit } = useVoucherPermissions('Payment')
 *
 * @example
 * // Option 2: Read from form context automatically
 * const { canCreate, canEdit } = useVoucherPermissions()
 */
export function useVoucherPermissions(voucherType?: string) {
  // Try to read from form context if available and no parameter provided
  let resolvedVoucherType = voucherType

  try {
    const { control } = useFormContext<VoucherFormDataType>()
    const formVoucherType = useWatch({ control, name: "voucherType" })

    // Use parameter if provided, otherwise use form value
    resolvedVoucherType = voucherType || formVoucherType
  } catch (error) {
    // Not in form context, use parameter only (or undefined)
    resolvedVoucherType = voucherType
  }

  // If no voucher type available from either source, return all false
  if (!resolvedVoucherType) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canPreview: false,
      canExport: false
    }
  }

  // Convert voucher type to lowercase for permission construction
  const voucherTypeLower = resolvedVoucherType.toLowerCase()

  // Check all permissions at once
  const permissions = useUserHasMultiplePermissions({
    canView: `vouchers.${voucherTypeLower}.view`,
    canCreate: `vouchers.${voucherTypeLower}.create`,
    canEdit: `vouchers.${voucherTypeLower}.edit`,
    canDelete: `vouchers.${voucherTypeLower}.delete`,
    canPreview: `vouchers.${voucherTypeLower}.preview`,
    canExport: `vouchers.${voucherTypeLower}.export`
  })

  return permissions
}
```

---

## Usage Examples

### Example 1: Form Action Buttons (Auto-read from form)
**File**: `form-action-buttons.tsx`

**Before:**
```typescript
const voucherId = useWatch({ control, name: "id" })
const voucherType = useWatch({ control, name: "voucherType" })

const isEditMode = !!voucherId

const getVoucherTypePermission = (action: 'create' | 'edit') => {
    if (!voucherType) return false
    const voucherTypeLower = voucherType.toLowerCase()
    return useUserHasControlPermission(`vouchers.${voucherTypeLower}.${action}`)
}

const canCreate = getVoucherTypePermission('create')
const canEdit = getVoucherTypePermission('edit')
const canSubmit = isEditMode ? canEdit : canCreate
```

**After (automatically reads voucherType from form):**
```typescript
const voucherId = useWatch({ control, name: "id" })
const { canCreate, canEdit } = useVoucherPermissions() // ✅ No parameter needed!

const isEditMode = !!voucherId
const canSubmit = isEditMode ? canEdit : canCreate
```

**Lines Saved**: 14 lines → 4 lines

**Note**: The hook automatically reads `voucherType` from form context, so you don't need to use `useWatch` for it anymore!

---

### Example 2: Grid Action Buttons
**File**: `all-vouchers-view.tsx`

**Before:**
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

// In grid template
template: (props: any) => {
    const voucherTypeName = Utils.getTranTypeName(props.tranTypeId || 0)
    const canEdit = canEditVoucherType(voucherTypeName)
    const canDelete = canDeleteVoucherType(voucherTypeName)
    const canPreview = canPreviewVoucherType(voucherTypeName)
    const canExport = canExportVoucherType(voucherTypeName)

    return (/* ... */)
}
```

**After:**
```typescript
// In grid template
template: (props: any) => {
    const voucherTypeName = Utils.getTranTypeName(props.tranTypeId || 0)
    const { canEdit, canDelete, canPreview, canExport } = useVoucherPermissions(voucherTypeName)

    return (/* ... */)
}
```

**Lines Saved**: 30 lines → 5 lines

---

### Example 3: Conditional Button Rendering (Auto-read from form)
```typescript
function VoucherActions() {
    // ✅ Hook automatically reads voucherType from form
    const { canPreview, canExport } = useVoucherPermissions()

    return (
        <div className="flex gap-2">
            {canPreview && (
                <button onClick={handlePreview}>
                    Preview
                </button>
            )}
            {canExport && (
                <button onClick={handleExport}>
                    Export
                </button>
            )}
        </div>
    )
}
```

---

### Example 4: Multiple Voucher Type Checks (Status Bar)
**Note**: For status bar where we need to check ALL voucher types at once, the existing `useUserHasMultiplePermissions` approach is still preferred:

```typescript
// This pattern is better for status bar (checking all types at once)
const voucherTypePermissions = useUserHasMultiplePermissions({
    canViewPayment: 'vouchers.payment.view',
    canViewReceipt: 'vouchers.receipt.view',
    canViewContra: 'vouchers.contra.view',
    canViewJournal: 'vouchers.journal.view'
})

// useVoucherPermissions is better for checking a SINGLE selected voucher type
const { canCreate, canEdit } = useVoucherPermissions(selectedVoucherType)
```

---

## Benefits

### 1. Code Reusability
- Single hook replaces multiple helper functions across components
- Consistent permission checking logic

### 2. Cleaner Code
- Reduces boilerplate from ~20-30 lines to 1-2 lines per usage
- More readable and maintainable

### 3. Type Safety
- TypeScript ensures all 6 permission flags are available
- Auto-completion for return values

### 4. Performance
- Uses `useUserHasMultiplePermissions` internally (single Redux selector call)
- No unnecessary re-renders

### 5. Consistent API
- Same input/output pattern across all components
- Easy to understand and use

---

## Files to Modify After Hook Creation

### 1. `form-action-buttons.tsx`
- Replace `getVoucherTypePermission` function with `useVoucherPermissions` hook
- Simplify permission checks

### 2. `all-vouchers-view.tsx`
- Remove 4 helper functions (`canEditVoucherType`, `canDeleteVoucherType`, etc.)
- Use `useVoucherPermissions` in grid template

### 3. Future components
- Any new component that needs voucher permissions can import and use this hook

---

## Testing Scenarios

### Test 1: Admin User
```typescript
// Given: userType = 'A', voucherType = 'Payment'
const result = useVoucherPermissions('Payment')
// Expected: All permissions = true
expect(result).toEqual({
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canPreview: true,
  canExport: true
})
```

### Test 2: Limited User (Receipt Create Only)
```typescript
// Given: userSecuredControls = ['vouchers.receipt.view', 'vouchers.receipt.create']
const result = useVoucherPermissions('Receipt')
// Expected: Only view and create = true
expect(result).toEqual({
  canView: true,
  canCreate: true,
  canEdit: false,
  canDelete: false,
  canPreview: false,
  canExport: false
})
```

### Test 3: No Voucher Type
```typescript
// Given: voucherType = undefined
const result = useVoucherPermissions(undefined)
// Expected: All permissions = false
expect(result).toEqual({
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canPreview: false,
  canExport: false
})
```

### Test 4: Case Insensitive
```typescript
// Given: voucherType = 'PAYMENT' (uppercase)
const result = useVoucherPermissions('PAYMENT')
// Expected: Should work correctly (converted to lowercase)
expect(result.canView).toBe(true) // If user has permission
```

---

## Implementation Steps

### Step 1: Create Hook File
✅ Create `src/features/accounts/vouchers/hooks/voucher-permission-hook.ts`
- Implement hook logic
- Add JSDoc comments
- Export hook function

**Estimated time**: 10 minutes

---

### Step 2: Update `form-action-buttons.tsx`
✅ Import and use hook
- Replace existing permission logic
- Test Submit button visibility

**Estimated time**: 5 minutes

---

### Step 3: Update `all-vouchers-view.tsx`
✅ Import and use hook
- Remove helper functions
- Update grid template
- Test Edit/Delete/Preview/Export buttons

**Estimated time**: 10 minutes

---

### Step 4: Testing
✅ Manual testing with different user roles
- Test as Admin
- Test as limited user (Receipt only)
- Test with no voucher type selected
- Test all 4 voucher types

**Estimated time**: 15 minutes

---

## Summary

**Total Files**:
- 1 new file (hook)
- 2 files to refactor (form-action-buttons, all-vouchers-view)

**Code Reduction**:
- ~50-60 lines of duplicate code removed
- Replaced with single 30-line hook

**Total Implementation Time**: ~40 minutes

**Key Features**:
1. ✅ Single hook for all voucher permission checks
2. ✅ Returns all 6 permission flags at once
3. ✅ Works with any voucher type (Payment/Receipt/Contra/Journal)
4. ✅ Handles edge cases (undefined type, admin users)
5. ✅ Type-safe and well-documented
6. ✅ Reduces code duplication across components
7. ✅ Easy to use and understand
8. ✅ Performance optimized (single selector call)

**Hook Signature**:
```typescript
useVoucherPermissions(voucherType?: string): {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canPreview: boolean
  canExport: boolean
}
```
