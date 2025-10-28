# Plan: Step 3 - Implement Permission Checks in React Components

## Overview
Add permission checks to React components for the 31 new access controls that were added to `access-controls.json`. This will enforce role-based access control for Masters and Inventory features.

## Prerequisites
- ✅ Step 1 & 2 completed: 31 access controls added to JSON
- ⚠️ **IMPORTANT**: Controls must be synced to database via super-admin interface before testing

## Permission System Architecture

### Existing Hooks (in `permissions-hooks.ts`)
1. **`useUserHasControlPermission(controlName)`** - Check single permission
2. **`useUserHasMultiplePermissions(permissions)`** - Check multiple permissions at once
3. **Module-specific hooks** - e.g., `usePurchasePermissions()`, `useSalesPermissions()`

### Pattern Used
```typescript
// Define permission checks
const permissions = useUserHasMultiplePermissions({
  canCreate: 'module.feature.create',
  canEdit: 'module.feature.edit',
  canDelete: 'module.feature.delete'
})

// Use in component
{permissions.canCreate && <CreateButton />}
{permissions.canEdit && <EditButton />}
{permissions.canDelete && <DeleteButton />}
```

## Implementation Plan

### Phase 1: Add Permission Hooks to `permissions-hooks.ts`

Create module-specific hooks for each feature following existing pattern.

#### 1.1 Masters Module Hooks

```typescript
/**
 * Hook to check all permissions for Company Info
 */
export function useCompanyInfoPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canEdit: 'masters.company-info.edit'
  })
  return permissions
}

/**
 * Hook to check all permissions for General Settings
 */
export function useGeneralSettingsPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canEdit: 'masters.general-settings.edit'
  })
  return permissions
}

/**
 * Hook to check all permissions for Accounts Master
 */
export function useAccountsMasterPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'masters.accounts-master.create',
    canEdit: 'masters.accounts-master.edit',
    canDelete: 'masters.accounts-master.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Opening Balances
 */
export function useOpeningBalancesPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canEdit: 'masters.opening-balances.edit'
  })
  return permissions
}

/**
 * Hook to check all permissions for Branches
 */
export function useBranchesPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'masters.branches.create',
    canEdit: 'masters.branches.edit',
    canDelete: 'masters.branches.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Financial Years
 */
export function useFinancialYearsPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'masters.financial-years.create',
    canEdit: 'masters.financial-years.edit',
    canDelete: 'masters.financial-years.delete'
  })
  return permissions
}
```

#### 1.2 Inventory Module Hooks

```typescript
/**
 * Hook to check all permissions for Categories
 */
export function useCategoriesPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'inventory.categories.create',
    canEdit: 'inventory.categories.edit',
    canDelete: 'inventory.categories.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Brands
 */
export function useBrandsPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'inventory.brands.create',
    canEdit: 'inventory.brands.edit',
    canDelete: 'inventory.brands.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Product Master
 */
export function useProductMasterPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'inventory.product-master.create',
    canEdit: 'inventory.product-master.edit',
    canDelete: 'inventory.product-master.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Opening Stock
 */
export function useOpeningStockPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canCreate: 'inventory.opening-stock.create',
    canEdit: 'inventory.opening-stock.edit',
    canDelete: 'inventory.opening-stock.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Stock Journal
 */
export function useStockJournalPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'inventory.stock-journal.view',
    canCreate: 'inventory.stock-journal.create',
    canEdit: 'inventory.stock-journal.edit',
    canDelete: 'inventory.stock-journal.delete'
  })
  return permissions
}

/**
 * Hook to check all permissions for Branch Transfer
 */
export function useBranchTransferPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'inventory.branch-transfer.view',
    canCreate: 'inventory.branch-transfer.create',
    canEdit: 'inventory.branch-transfer.edit',
    canDelete: 'inventory.branch-transfer.delete'
  })
  return permissions
}
```

### Phase 2: Update React Components

For each component, add permission checks to conditionally render buttons/actions.

#### 2.1 Masters Components

##### Company Info
**File**: `src/features/accounts/masters/company-info/company-info.tsx`
- Import: `import { useCompanyInfoPermissions } from '../../../../utils/permissions/permissions-hooks'`
- Add hook: `const { canEdit } = useCompanyInfoPermissions()`
- Wrap edit button/form: `{canEdit && <EditButton />}`

##### General Settings
**File**: `src/features/accounts/masters/general-settings.tsx`
- Import hook
- Add permission check for edit functionality

##### Accounts Master
**Files**:
- Main: `src/features/accounts/masters/accounts/accounts-master.tsx`
- Modals: `accounts-add-child-modal.tsx`, `accounts-add-group-modal.tsx`, `accounts-edit-modal.tsx`

Actions:
- Import: `import { useAccountsMasterPermissions } from '../../../../utils/permissions/permissions-hooks'`
- Add hook: `const { canCreate, canEdit, canDelete } = useAccountsMasterPermissions()`
- Wrap buttons:
  - `{canCreate && <AddButton />}`
  - `{canEdit && <EditButton />}`
  - `{canDelete && <DeleteButton />}`

##### Opening Balances
**File**: `src/features/accounts/masters/opening-balance/accounts-opening-balance.tsx`
- Import hook
- Check `canEdit` for save button

##### Branches
**Files**:
- Main: `src/features/accounts/masters/branch-master/branch-master.tsx`
- Components: `new-branch-button.tsx`, `new-edit-branch.tsx`

Actions:
- Import hook
- Check permissions for create/edit/delete operations

##### Financial Years
**Files**:
- Main: `src/features/accounts/masters/fin-year-master/fin-year-master.tsx`
- Components: `new-edit-fin-year.tsx`, `new-fin-year-button.tsx`

Actions:
- Import hook
- Check permissions for create/edit/delete operations

#### 2.2 Inventory Components

##### Categories
**File**: `src/features/accounts/inventory/categories/product-categories.tsx`
- Import: `import { useCategoriesPermissions } from '../../../../utils/permissions/permissions-hooks'`
- Add hook: `const { canCreate, canEdit, canDelete } = useCategoriesPermissions()`
- Wrap toolbar buttons

##### Brands
**Files**:
- Main: `src/features/accounts/inventory/brands/brand-master.tsx`
- Components: `new-brand-button.tsx`, `new-edit-brand.tsx`

Actions:
- Import hook
- Check permissions

##### Product Master
**Files**:
- Main: `src/features/accounts/inventory/product-master/product-master.tsx`
- Components: `new-edit-product.tsx`, `new-product-button.tsx`

Actions:
- Import hook
- Check permissions

##### Opening Stock
**Files**:
- Main: `src/features/accounts/inventory/opening-stock/products-opening-balances.tsx`
- Grid: `products-opening-balances-grid.tsx`
- Workbench: `products-opening-balances-workbench.tsx`

Actions:
- Import hook
- Check permissions for CRUD operations

##### Stock Journal
**Files**:
- Main: `src/features/accounts/inventory/stock-journal/stock-journal.tsx`
- View: `stock-journal-view.tsx`
- Crown: `stock-journal-crown.tsx`

Actions:
- Import hook
- Check permissions including `canView`

##### Branch Transfer
**Files**:
- Main: `src/features/accounts/inventory/branch-transfer/products-branch-transfers.tsx`
- View: `products-branch-transfer-view.tsx`

Actions:
- Import hook
- Check permissions including `canView`

## Implementation Order

### Step 1: Add Hooks (1 file to modify)
1. Add all 12 permission hooks to `src/utils/permissions/permissions-hooks.ts`

### Step 2: Update Masters Components (6 features)
1. Company Info
2. General Settings
3. Accounts Master (multiple files)
4. Opening Balances
5. Branches (multiple files)
6. Financial Years (multiple files)

### Step 3: Update Inventory Components (6 features)
1. Categories
2. Brands (multiple files)
3. Product Master (multiple files)
4. Opening Stock (multiple files)
5. Stock Journal (multiple files)
6. Branch Transfer (multiple files)

## Testing Checklist

For each component:
- [ ] Import permission hook correctly
- [ ] Call hook at component level (not inside conditionals)
- [ ] Wrap action buttons with permission checks
- [ ] Test with different roles to verify access control
- [ ] Ensure UI degrades gracefully (hide buttons, not show errors)
- [ ] Check console for no React hooks errors

## Common Patterns

### Pattern 1: Simple Button Conditional
```typescript
const { canCreate } = useFeaturePermissions()

return (
  <div>
    {canCreate && <button onClick={handleCreate}>Create</button>}
  </div>
)
```

### Pattern 2: Disable Button Instead of Hide
```typescript
const { canEdit } = useFeaturePermissions()

return (
  <button disabled={!canEdit} onClick={handleEdit}>
    Edit
  </button>
)
```

### Pattern 3: Multiple Actions
```typescript
const { canCreate, canEdit, canDelete } = useFeaturePermissions()

return (
  <div>
    {canCreate && <CreateButton />}
    {canEdit && <EditButton />}
    {canDelete && <DeleteButton />}
  </div>
)
```

### Pattern 4: Grid Column Actions
```typescript
const { canEdit, canDelete } = useFeaturePermissions()

const columns = [
  // ... other columns
  {
    field: 'actions',
    template: (props: any) => (
      <div>
        {canEdit && <EditIcon onClick={() => handleEdit(props)} />}
        {canDelete && <DeleteIcon onClick={() => handleDelete(props)} />}
      </div>
    )
  }
]
```

## Notes

1. **Hook Rules**: Always call hooks at the top level of the component, never inside conditionals or loops
2. **Graceful Degradation**: Hide/disable UI elements rather than showing error messages
3. **Sync Controls**: Ensure new controls are synced to database before testing
4. **Role Assignment**: Link controls to appropriate roles via admin interface
5. **Documentation**: Add JSDoc comments to all new hooks
6. **Consistency**: Follow existing patterns in codebase

## File Summary

### Files to Modify:
- **1 hook file**: `src/utils/permissions/permissions-hooks.ts`
- **6 Masters features**: ~12-15 component files
- **6 Inventory features**: ~15-20 component files
- **Total**: ~30-35 files to modify

### Hooks to Add: 12 new permission hooks
- 6 Masters hooks
- 6 Inventory hooks

### Control Names to Check: 31 controls
- 13 Masters controls
- 18 Inventory controls

## Success Criteria

- ✅ All 12 permission hooks added and documented
- ✅ All buttons/actions wrapped with permission checks
- ✅ No React hooks errors in console
- ✅ UI gracefully handles missing permissions
- ✅ Different roles see different UI elements
- ✅ All features work correctly with appropriate permissions
