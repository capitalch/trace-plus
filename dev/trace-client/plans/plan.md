# Plan: Toggle Product Active Status in Product Master Grid

## Problem Statement
Create a feature to toggle product active status directly from the product master grid checkbox, with the following business rules:
- If product is active and stock is 0, allow deactivation with confirmation
- If product is active and stock > 0, do NOT allow deactivation (show alert)
- If product is inactive, allow activation with confirmation

---

## Current State Analysis

### File: `src/features/accounts/inventory/product-master/product-master.tsx`

**Line 97 - Current Active Column:**
```typescript
{ field: 'isActive', headerText: 'Active', type: 'boolean', width: 80,
  template: (props: any) => <input type='checkbox' checked={props.isActive} aria-label="isActive" readOnly /> }
```
The checkbox is currently `readOnly` and cannot be toggled.

### Available SQL IDs (from `sql-ids-map.ts`):
- `getStockOnId` (Line 105): Gets current stock for a productId
- `updateProductActiveStatus` (Line 114): Updates active status with productId and isActive

### Utility Functions Available:
- `Utils.showConfirmDialog(title, message, onConfirm)` - Shows confirmation dialog
- `Utils.showAlertMessage(title, message)` - Shows alert message
- `Utils.doGenericQuery({buCode, dbName, dbParams, sqlId, sqlArgs})` - Executes SQL query

---

## Implementation Steps

### Step 1: Create the Active Status Toggle Handler
**Location:** `src/features/accounts/inventory/product-master/product-master.tsx`

Add a new async function `handleActiveStatusToggle`:

```typescript
async function handleActiveStatusToggle(productId: number, currentIsActive: boolean, productLabel: string) {
    if (currentIsActive) {
        // Product is currently active, user wants to deactivate
        // First check stock
        const stockRes: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getStockOnId,
            sqlArgs: { productId: productId }
        });

        const stock = stockRes?.[0]?.stock || 0;

        if (stock > 0) {
            // Stock exists, cannot deactivate
            Utils.showAlertMessage(
                'Cannot Deactivate',
                `Product "${productLabel}" has stock of ${stock}. Please clear stock before deactivating.`
            );
            return;
        }

        // Stock is 0, show confirmation to deactivate
        Utils.showConfirmDialog(
            'Deactivate Product',
            `Are you sure you want to deactivate "${productLabel}"?`,
            async () => {
                await updateActiveStatus(productId, false);
            }
        );
    } else {
        // Product is inactive, user wants to activate
        Utils.showConfirmDialog(
            'Activate Product',
            `Are you sure you want to activate "${productLabel}"?`,
            async () => {
                await updateActiveStatus(productId, true);
            }
        );
    }
}
```

### Step 2: Create the Update Active Status Function
**Location:** `src/features/accounts/inventory/product-master/product-master.tsx`

Add function to call the server update:

```typescript
async function updateActiveStatus(productId: number, isActive: boolean) {
    try {
        await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.updateProductActiveStatus,
            sqlArgs: {
                productId: productId,
                isActive: isActive
            }
        });

        Utils.showSaveMessage();

        // Refresh the grid
        const loadData = context.CompSyncFusionGrid[instance].loadData;
        if (loadData) await loadData();

        // Clear product search cache
        dispatch(clearCache());
    } catch (e: any) {
        console.error(e);
        Utils.showErrorMessage(e);
    }
}
```

### Step 3: Update the Active Column Template
**Location:** `src/features/accounts/inventory/product-master/product-master.tsx` (Line 97)

Change the template from readOnly checkbox to clickable:

```typescript
{
    field: 'isActive',
    headerText: 'Active',
    type: 'boolean',
    width: 80,
    template: (props: any) => (
        <input
            type='checkbox'
            checked={props.isActive}
            aria-label="Toggle active status"
            className="cursor-pointer w-4 h-4 accent-blue-600"
            onChange={() => handleActiveStatusToggle(props.id, props.isActive, props.label)}
        />
    )
}
```

### Step 4: Verify SQL IDs are in the Map
**Location:** `src/app/maps/sql-ids-map.ts`

Confirm these entries exist (already verified):
- Line 105: `getStockOnId: "get_stock_on_id"`
- Line 114: `updateProductActiveStatus: "update_product_active_status"`

---

## Complete Code Changes

### File: `src/features/accounts/inventory/product-master/product-master.tsx`

**Changes Summary:**
1. Update line 97 - Change Active column template to be clickable
2. Add `handleActiveStatusToggle` function (after line 111)
3. Add `updateActiveStatus` function (after handleActiveStatusToggle)

---

## Testing Checklist

- [ ] Click Active checkbox on a product with stock > 0
  - Should show alert "Cannot Deactivate" with stock amount
  - Checkbox should remain checked
- [ ] Click Active checkbox on an active product with stock = 0
  - Should show confirmation "Deactivate Product?"
  - On confirm: checkbox unchecks, grid refreshes
  - On cancel: no change
- [ ] Click Active checkbox on an inactive product
  - Should show confirmation "Activate Product?"
  - On confirm: checkbox checks, grid refreshes
  - On cancel: no change
- [ ] Verify grid refreshes after status change
- [ ] Verify product search cache is cleared after status change
- [ ] No console errors during any operation

---

## Success Criteria

1. Active column checkbox is clickable (not readOnly)
2. Deactivation blocked if stock > 0 with clear error message
3. Deactivation allowed if stock = 0 with confirmation
4. Activation allowed with confirmation
5. Grid refreshes after status change
6. Product cache cleared to reflect changes in other components
7. No regression in existing product master functionality

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/accounts/inventory/product-master/product-master.tsx` | Update Active column template, add toggle handlers |

---

## Notes

- The SQL IDs `getStockOnId` and `updateProductActiveStatus` are already defined
- Server-side implementation is already complete per the instructions
- Follow existing patterns in the file (handleOnDelete, handleOnEdit) for consistency
- Use `Utils.showConfirmDialog` for confirmations (not delete confirm)
- Use `Utils.showAlertMessage` for blocking alerts
