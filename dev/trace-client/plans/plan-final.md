# Secured Controls Logic - Complete Implementation Guide

## Overview

This document provides a **compact, up-to-date implementation guide** for the secured controls (permissions) system, incorporating voucher-specific permissions.

---

## 1. Architecture Summary

### 1.1 Three-Layer Permission System

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: USER TYPE (Broadest)                              │
│ ─────────────────────────────────────────                   │
│ • Super Admin (S) → Full Access to Everything               │
│ • Admin (A) → Full Access to Everything                     │
│ • Business User (B) → Controlled by Secured Controls        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: SECURED CONTROLS (Fine-grained)                   │
│ ─────────────────────────────────────────                   │
│ • Defined in: secured-controls.json                         │
│ • Format: "module.entity.action"                            │
│ • Example: "vouchers.payment.create"                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: RUNTIME CHECK (In Components)                     │
│ ─────────────────────────────────────────                   │
│ • Hook: useVoucherPermissions()                             │
│ • Utility: useUserHasControlPermission()                    │
│ • Utility: useUserHasMultiplePermissions()                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Current Secured Controls Definition

### 2.1 File: `src/utils/secured-controls/secured-controls.json`

**Structure**: 29 voucher controls (1 menu + 28 actions)

```json
{
  "controlNo": 110-146,
  "controlName": "vouchers.{type}.{action}",
  "controlType": "menu" | "action",
  "descr": "Human-readable description"
}
```

### 2.2 Control Numbering Scheme

| Range    | Type      | Actions (7 each)                                    |
|----------|-----------|-----------------------------------------------------|
| **100**  | Menu      | vouchers.menu.all-vouchers.view                     |
| **110-116** | Payment | view, select, create, edit, delete, preview, export |
| **120-126** | Receipt | view, select, create, edit, delete, preview, export |
| **130-136** | Contra  | view, select, create, edit, delete, preview, export |
| **140-146** | Journal | view, select, create, edit, delete, preview, export |

### 2.3 Control Name Pattern

```
vouchers.{voucherType}.{action}

Where:
  voucherType = payment | receipt | contra | journal
  action      = view | select | create | edit | delete | preview | export
```

---

## 3. Permission Utilities

### 3.1 File: `src/utils/secured-controls/permissions.ts`

**Three Core Functions:**

#### A. Single Permission Check (Hook)
```typescript
useUserHasControlPermission(controlName: string): boolean
```
- **When**: Check ONE permission
- **Returns**: `true` if user has permission
- **Auto-grants**: Admin (A) and Super Admin (S) always return `true`

#### B. Single Permission Check (Non-Hook)
```typescript
hasControlPermission(state: RootStateType, controlName: string): boolean
```
- **When**: Inside Redux selectors or non-component code
- **Returns**: `true` if user has permission
- **Usage**: Selectors, utility functions

#### C. Multiple Permissions Check (Hook)
```typescript
useUserHasMultiplePermissions<T>(permissions: T): Record<keyof T, boolean>
```
- **When**: Check MULTIPLE permissions at once (efficient!)
- **Returns**: Object with boolean for each permission
- **Auto-grants**: Admin (A) and Super Admin (S) get all `true`

**Example Usage:**
```typescript
const { canCreate, canEdit, canDelete } = useUserHasMultiplePermissions({
  canCreate: 'vouchers.payment.create',
  canEdit: 'vouchers.payment.edit',
  canDelete: 'vouchers.payment.delete'
})
```

---

## 4. Voucher Permissions Hook

### 4.1 File: `src/features/accounts/vouchers/voucher-permissions-hook.ts`

**Purpose**: Centralized hook for ALL voucher type permissions.

#### Hook Signature
```typescript
useVoucherPermissions(voucherType?: string): {
  canView: boolean
  canSelect: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canPreview: boolean
  canExport: boolean
}
```

#### Features
- ✅ **Automatic form context reading**: Reads `voucherType` from React Hook Form if not provided
- ✅ **Explicit parameter**: Pass voucher type directly
- ✅ **Batch permission check**: Checks all 7 permissions in one call
- ✅ **Type-safe**: Returns strongly-typed object
- ✅ **Fallback handling**: Returns all `false` if no voucher type

#### Implementation
```typescript
export function useVoucherPermissions(voucherType?: string) {
  // 1. Try to get voucher type from form context
  const formContext = useFormContext<VoucherFormDataType>()
  const formVoucherType = useWatch({
    control: formContext.control,
    name: "voucherType"
  })

  // 2. Resolve voucher type (parameter > form)
  const resolvedVoucherType = voucherType || formVoucherType
  const voucherTypeLower = resolvedVoucherType?.toLowerCase() || ""

  // 3. Check all permissions at once (batch operation)
  const permissions = useUserHasMultiplePermissions({
    canView: `vouchers.${voucherTypeLower}.view`,
    canSelect: `vouchers.${voucherTypeLower}.select`,
    canCreate: `vouchers.${voucherTypeLower}.create`,
    canEdit: `vouchers.${voucherTypeLower}.edit`,
    canDelete: `vouchers.${voucherTypeLower}.delete`,
    canPreview: `vouchers.${voucherTypeLower}.preview`,
    canExport: `vouchers.${voucherTypeLower}.export`
  })

  // 4. Fallback if no voucher type
  if (!resolvedVoucherType) {
    return {
      canView: false, canSelect: false, canCreate: false,
      canEdit: false, canDelete: false, canPreview: false,
      canExport: false
    }
  }

  return permissions
}
```

---

## 5. Usage Patterns

### 5.1 Pattern 1: Within Form Context (Auto-Read)

**When**: Component is inside `<FormProvider>` with `voucherType` field

```typescript
import { useVoucherPermissions } from './voucher-permissions-hook'

function FormActionButtons() {
  // ✅ Automatically reads voucherType from form
  const { canCreate, canEdit } = useVoucherPermissions()

  const isEditMode = !!voucherId
  const canSubmit = isEditMode ? canEdit : canCreate

  return canSubmit ? <button type="submit">Submit</button> : null
}
```

**Benefits:**
- Zero props needed
- Reacts to form changes automatically
- Clean, declarative code

---

### 5.2 Pattern 2: Explicit Voucher Type

**When**: Outside form context or checking specific voucher type

```typescript
import { useVoucherPermissions } from './voucher-permissions-hook'

function PaymentVoucherActions() {
  // ✅ Pass explicit voucher type
  const permissions = useVoucherPermissions('Payment')

  if (!permissions.canView) return null

  return (
    <div>
      {permissions.canCreate && <button>New Payment</button>}
      {permissions.canEdit && <button>Edit</button>}
      {permissions.canDelete && <button>Delete</button>}
      {permissions.canPreview && <button>Preview</button>}
      {permissions.canExport && <button>Export</button>}
    </div>
  )
}
```

---

### 5.3 Pattern 3: Dynamic Voucher Type (Grid Actions)

**When**: Rendering actions for each row in a grid

```typescript
function VoucherGridActionCell({ voucher }) {
  const voucherTypeName = Utils.getTranTypeName(voucher.tranTypeId)

  // ✅ Dynamic voucher type per row
  const { canEdit, canDelete, canPreview, canExport } =
    useVoucherPermissions(voucherTypeName)

  return (
    <div className="flex gap-2">
      {canEdit && <button onClick={() => handleEdit(voucher)}>Edit</button>}
      {canDelete && <button onClick={() => handleDelete(voucher)}>Delete</button>}
      {canPreview && <button onClick={() => handlePreview(voucher)}>Preview</button>}
      {canExport && <button onClick={() => handleExport(voucher)}>Export</button>}
    </div>
  )
}
```

---

### 5.4 Pattern 4: Multiple Voucher Types (Menu/Tabs)

**When**: Checking permissions for multiple voucher types at once

```typescript
import { useUserHasMultiplePermissions } from '../../../utils/secured-controls/permissions'

function AllVouchersComponent() {
  // ✅ Check all voucher types at once
  const voucherTypePermissions = useUserHasMultiplePermissions({
    canViewPayment: 'vouchers.payment.view',
    canViewReceipt: 'vouchers.receipt.view',
    canViewContra: 'vouchers.contra.view',
    canViewJournal: 'vouchers.journal.view'
  })

  const canViewAnyVoucherType = Object.values(voucherTypePermissions)
    .some(permission => permission)

  // Filter visible tabs/buttons
  const visibleVoucherTypes = ['Payment', 'Receipt', 'Contra', 'Journal']
    .filter(type => {
      switch(type) {
        case 'Payment': return voucherTypePermissions.canViewPayment
        case 'Receipt': return voucherTypePermissions.canViewReceipt
        case 'Contra': return voucherTypePermissions.canViewContra
        case 'Journal': return voucherTypePermissions.canViewJournal
        default: return false
      }
    })

  return (
    <div>
      {visibleVoucherTypes.map(type => (
        <button key={type}>{type}</button>
      ))}
    </div>
  )
}
```

---

## 6. Permission Check Flow

### 6.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Login                                               │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Server Returns:                                          │
│    • userType: 'S' | 'A' | 'B'                             │
│    • userSecuredControls: [...controls from user's role]    │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Redux State (login slice)                               │
│    state.login.userDetails.userType                         │
│    state.login.userSecuredControls                          │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Component Renders                                        │
│    const permissions = useVoucherPermissions('Payment')     │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Permission Check Logic                                   │
│                                                              │
│    IF userType === 'S' OR userType === 'A'                 │
│       RETURN { canCreate: true, canEdit: true, ... }        │
│    ELSE                                                      │
│       CHECK userSecuredControls for each:                   │
│         - vouchers.payment.view                             │
│         - vouchers.payment.select                           │
│         - vouchers.payment.create                           │
│         - vouchers.payment.edit                             │
│         - vouchers.payment.delete                           │
│         - vouchers.payment.preview                          │
│         - vouchers.payment.export                           │
│       RETURN { canCreate: true/false, ... }                 │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. UI Conditional Rendering                                 │
│    {permissions.canCreate && <button>Create</button>}       │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Permission Lookup Pseudocode

```javascript
function checkPermission(controlName) {
  // Step 1: Get user type from Redux
  userType = redux.login.userDetails.userType

  // Step 2: Admin bypass
  if (userType === 'S' || userType === 'A') {
    return true  // ✅ Admins always have access
  }

  // Step 3: Get user's secured controls from Redux
  userControls = redux.login.userSecuredControls

  // Step 4: Check if control exists in user's list
  hasPermission = userControls.some(
    control => control.controlName === controlName
  )

  return hasPermission  // ✅ or ❌
}
```

---

## 7. Implementation Checklist

### 7.1 For Adding New Secured Controls

- [ ] **Step 1**: Add to `secured-controls.json`
  ```json
  {
    "controlNo": 150,
    "controlName": "module.entity.action",
    "controlType": "action",
    "descr": "Description"
  }
  ```

- [ ] **Step 2**: Super Admin imports JSON to database
  - Via Super Admin → Secured Controls → Import

- [ ] **Step 3**: Link controls to roles
  - Via Admin → Link Secured Controls with Roles

- [ ] **Step 4**: Use in components
  ```typescript
  const canDoAction = useUserHasControlPermission('module.entity.action')
  ```

### 7.2 For Creating Feature-Specific Permission Hook

**Template for New Feature:**

```typescript
// src/features/[feature]/[feature]-permissions-hook.ts

import { useUserHasMultiplePermissions } from '../../utils/secured-controls/permissions'

export function use[Feature]Permissions(entityType?: string) {
  const entityTypeLower = entityType?.toLowerCase() || ""

  const permissions = useUserHasMultiplePermissions({
    canView: `[feature].${entityTypeLower}.view`,
    canCreate: `[feature].${entityTypeLower}.create`,
    canEdit: `[feature].${entityTypeLower}.edit`,
    canDelete: `[feature].${entityTypeLower}.delete`,
    // ... add more actions as needed
  })

  if (!entityType) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    }
  }

  return permissions
}
```

**Example for Sales:**
```typescript
export function useSalesPermissions(saleType?: string) {
  const saleTypeLower = saleType?.toLowerCase() || ""

  const permissions = useUserHasMultiplePermissions({
    canView: `sales.${saleTypeLower}.view`,
    canCreate: `sales.${saleTypeLower}.create`,
    canEdit: `sales.${saleTypeLower}.edit`,
    canDelete: `sales.${saleTypeLower}.delete`,
    canPreview: `sales.${saleTypeLower}.preview`,
    canExport: `sales.${saleTypeLower}.export`,
  })

  if (!saleType) {
    return { canView: false, canCreate: false, canEdit: false,
             canDelete: false, canPreview: false, canExport: false }
  }

  return permissions
}
```

---

## 8. Best Practices

### 8.1 DO ✅

1. **Always call hooks unconditionally**
   ```typescript
   // ✅ CORRECT
   const permissions = useVoucherPermissions(voucherType)
   if (!voucherType || !permissions.canView) return null
   ```

2. **Use batch checks for multiple permissions**
   ```typescript
   // ✅ CORRECT (1 hook call)
   const { canEdit, canDelete, canPreview } = useVoucherPermissions('Payment')
   ```

3. **Create feature-specific permission hooks**
   ```typescript
   // ✅ CORRECT - Reusable, maintainable
   const permissions = useVoucherPermissions('Payment')
   ```

4. **Use descriptive control names**
   ```typescript
   // ✅ CORRECT
   'vouchers.payment.create'  // Clear hierarchy
   ```

### 8.2 DON'T ❌

1. **Don't call hooks conditionally**
   ```typescript
   // ❌ WRONG - Violates Rules of Hooks
   if (voucherType) {
     const permissions = useVoucherPermissions(voucherType)
   }
   ```

2. **Don't make multiple single permission checks**
   ```typescript
   // ❌ WRONG (3 hook calls - inefficient!)
   const canEdit = useUserHasControlPermission('vouchers.payment.edit')
   const canDelete = useUserHasControlPermission('vouchers.payment.delete')
   const canPreview = useUserHasControlPermission('vouchers.payment.preview')
   ```

3. **Don't hardcode permission strings everywhere**
   ```typescript
   // ❌ WRONG - Hard to maintain, error-prone
   const canEdit = useUserHasControlPermission('vouchers.payment.edit')
   ```

4. **Don't call hooks in callbacks/loops**
   ```typescript
   // ❌ WRONG
   template: (props) => {
     const permissions = useVoucherPermissions(props.type) // Hook in render!
   }
   ```

---

## 9. Performance Optimization

### 9.1 Batch Permission Checks

**Problem**: Multiple permission checks = multiple Redux selector calls

**Solution**: Use `useUserHasMultiplePermissions` or feature-specific hooks

**Before (Slow):**
```typescript
const canView = useUserHasControlPermission('vouchers.payment.view')      // 2 selectors
const canCreate = useUserHasControlPermission('vouchers.payment.create')  // 2 selectors
const canEdit = useUserHasControlPermission('vouchers.payment.edit')      // 2 selectors
// Total: 6 Redux selector calls
```

**After (Fast):**
```typescript
const { canView, canCreate, canEdit } = useVoucherPermissions('Payment')
// Total: 2 Redux selector calls (inside useUserHasMultiplePermissions)
```

### 9.2 Memoization

For expensive permission calculations:

```typescript
import { useMemo } from 'react'

function ExpensiveComponent() {
  const permissions = useVoucherPermissions('Payment')

  // Memoize derived values
  const canModify = useMemo(
    () => permissions.canCreate || permissions.canEdit,
    [permissions.canCreate, permissions.canEdit]
  )

  return <div>{canModify && <Button>Modify</Button>}</div>
}
```

---

## 10. Testing Scenarios

### 10.1 User Type Based Testing

| User Type | Expected Behavior |
|-----------|------------------|
| **Super Admin (S)** | ✅ All permissions = `true` (bypass) |
| **Admin (A)** | ✅ All permissions = `true` (bypass) |
| **Business User (B)** | ⚠️ Depends on role's secured controls |

### 10.2 Business User Permission Scenarios

| Scenario | Controls Assigned | Expected Result |
|----------|------------------|----------------|
| **Full Access** | All 7 actions for Payment | All permissions = `true` |
| **View Only** | Only `vouchers.payment.view` | canView = `true`, rest = `false` |
| **Create + Edit** | `view`, `select`, `create`, `edit` | canView/Select/Create/Edit = `true` |
| **No Access** | None | All permissions = `false` |

### 10.3 Test Cases

```typescript
describe('useVoucherPermissions', () => {
  it('should return all true for Admin users', () => {
    mockReduxState({ userType: 'A' })
    const { canView, canCreate, canEdit } = useVoucherPermissions('Payment')
    expect(canView).toBe(true)
    expect(canCreate).toBe(true)
    expect(canEdit).toBe(true)
  })

  it('should check user controls for Business Users', () => {
    mockReduxState({
      userType: 'B',
      userSecuredControls: [
        { controlName: 'vouchers.payment.view' },
        { controlName: 'vouchers.payment.create' }
      ]
    })
    const { canView, canCreate, canEdit } = useVoucherPermissions('Payment')
    expect(canView).toBe(true)
    expect(canCreate).toBe(true)
    expect(canEdit).toBe(false)  // Not in user's controls
  })

  it('should return all false if no voucher type', () => {
    const permissions = useVoucherPermissions()
    expect(permissions.canView).toBe(false)
  })
})
```

---

## 11. Summary

### 11.1 Key Files

| File | Purpose |
|------|---------|
| `permissions.ts` | Core permission utilities (3 functions) |
| `secured-controls.json` | Permission definitions (29 controls) |
| `voucher-permissions-hook.ts` | Feature-specific permission hook |
| `secured-controls-logic.md` | Architecture documentation |

### 11.2 Key Concepts

1. **User Type Bypass**: Admin (A) and Super Admin (S) always have full access
2. **Business User Checks**: Controlled by `userSecuredControls` from role
3. **Batch Efficiency**: Use `useUserHasMultiplePermissions` for multiple checks
4. **Feature Hooks**: Create specific hooks like `useVoucherPermissions` for DRY code
5. **Control Naming**: Follow pattern `module.entity.action`
6. **Sequential Numbering**: Group related controls (110-116, 120-126, etc.)

### 11.3 Permission Actions (Standard Set)

For most features, use these 7 actions:

1. **view** - View list/button for entity type
2. **select** - Select items from list (for linking/referencing)
3. **create** - Create new records
4. **edit** - Modify existing records
5. **delete** - Remove records
6. **preview** - Preview before finalizing
7. **export** - Export to PDF/Excel/CSV

### 11.4 Quick Reference

**Check ONE permission:**
```typescript
const canCreate = useUserHasControlPermission('vouchers.payment.create')
```

**Check MULTIPLE permissions:**
```typescript
const { canCreate, canEdit, canDelete } = useUserHasMultiplePermissions({
  canCreate: 'vouchers.payment.create',
  canEdit: 'vouchers.payment.edit',
  canDelete: 'vouchers.payment.delete'
})
```

**Use FEATURE HOOK:**
```typescript
const permissions = useVoucherPermissions('Payment')
// Returns: { canView, canSelect, canCreate, canEdit, canDelete, canPreview, canExport }
```

---

## End of Document

**Last Updated**: 2025-10-20
**Version**: 2.0 (includes select permission)
**Total Controls**: 29 voucher controls (1 menu + 28 actions)
