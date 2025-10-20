# Plan: Fix Syncfusion Grid Error with Conditional onPreview Handler

## Problem Statement

**Error Encountered:**
```
TypeError: column.valueAccessor is not a function
```

**When it happens:**
- User switches voucher types (e.g., from Payment to Receipt)
- `canPreview` permission changes from `true` to `false` or vice versa
- `onPreview={canPreview ? handleOnPreview : undefined}` is being used

**Root Cause:**
- Syncfusion Grid doesn't handle `undefined` values for event handler props properly
- When `undefined` is passed, it breaks the grid's internal column rendering logic
- The `valueAccessor` function gets confused when prop changes from function to undefined

---

## Current Implementation

**File**: `all-vouchers-view.tsx`

**Line 116:**
```typescript
<CompSyncFusionGrid
    // ... other props
    onPreview={canPreview ? handleOnPreview : undefined}  // ❌ PROBLEM
    // ... other props
/>
```

**Issue:**
- Passing `undefined` to `onPreview` causes Syncfusion Grid internal errors
- Grid tries to access `valueAccessor` on columns but fails

---

## Solution Options

### Option 1: Always Pass Handler, Check Permission Inside (Simple but Less Secure)

```typescript
<CompSyncFusionGrid
    onPreview={handleOnPreviewWithPermissionCheck}
/>

// In component:
function handleOnPreviewWithPermissionCheck(data: RowDataType) {
    if (!canPreview) {
        return; // Or show "no permission" message
    }
    dispatch(triggerVoucherPreview(data.id!));
}
```

**Pros:**
- ✅ Simple
- ✅ No undefined values
- ✅ Grid always has a function

**Cons:**
- ❌ Handler still exists even without permission
- ❌ Preview button/column might still show in grid
- ❌ Less secure (relies on runtime check)

---

### Option 2: Conditional Prop Spreading (Recommended)

Only include the `onPreview` prop when permission exists.

```typescript
<CompSyncFusionGrid
    // ... other props
    {...(canPreview && { onPreview: handleOnPreview })}
    // ... other props
/>
```

**Pros:**
- ✅ Clean solution
- ✅ Prop completely absent when no permission
- ✅ No undefined values
- ✅ Preview column won't render when prop is missing
- ✅ More secure

**Cons:**
- None

---

### Option 3: Check Grid Component Definition

Check if the grid component itself handles `undefined` or if we need to pass `null`.

**Investigate:**
```typescript
// Does this work better?
onPreview={canPreview ? handleOnPreview : null}  // null instead of undefined?
```

**Result:**
- Likely won't work - Syncfusion Grid expects either a function or no prop at all
- Not recommended

---

## Recommended Solution: Option 2

### Implementation

**Change Line 96-122 in `all-vouchers-view.tsx`:**

**Before:**
```typescript
<CompSyncFusionGrid
    aggregates={getAggregates()}
    allowPaging={true}
    allowTextWrap={false}
    pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000, 5000, 10000] }}
    buCode={buCode}
    className="mt-2 mr-6"
    columns={getColumns()}
    dataSource={rowsData}
    deleteColumnWidth={40}
    editColumnWidth={40}
    hasCheckBoxSelection={true}
    height="calc(100vh - 368px)"
    instance={instance}
    isSmallerFont={true}
    loadData={loadData}
    minWidth="400px"
    onCopy={handleOnCopy}
    onEdit={handleOnEdit}
    onDelete={handleOnDelete}
    onPreview={canPreview ? handleOnPreview : undefined}  // ❌ PROBLEM
    onRowDataBound={handleOnRowDataBound}
    previewColumnWidth={40}
    rowHeight={35}
    searchFields={['id', 'autoRefNo', 'accName', 'userRefNo', 'remarks', 'lineRefNo', 'lineRemarks', 'instrNo', 'tags', 'gstin', 'hsn']}
/>
```

**After:**
```typescript
<CompSyncFusionGrid
    aggregates={getAggregates()}
    allowPaging={true}
    allowTextWrap={false}
    pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000, 5000, 10000] }}
    buCode={buCode}
    className="mt-2 mr-6"
    columns={getColumns()}
    dataSource={rowsData}
    deleteColumnWidth={40}
    editColumnWidth={40}
    hasCheckBoxSelection={true}
    height="calc(100vh - 368px)"
    instance={instance}
    isSmallerFont={true}
    loadData={loadData}
    minWidth="400px"
    onCopy={handleOnCopy}
    onEdit={handleOnEdit}
    onDelete={handleOnDelete}
    {...(canPreview && { onPreview: handleOnPreview })}  // ✅ SOLUTION
    onRowDataBound={handleOnRowDataBound}
    previewColumnWidth={40}
    rowHeight={35}
    searchFields={['id', 'autoRefNo', 'accName', 'userRefNo', 'remarks', 'lineRefNo', 'lineRemarks', 'instrNo', 'tags', 'gstin', 'hsn']}
/>
```

**Changes:**
- Line 116: Replace `onPreview={canPreview ? handleOnPreview : undefined}`
- With: `{...(canPreview && { onPreview: handleOnPreview })}`

---

## How Conditional Prop Spreading Works

### JavaScript Spread Operator with Conditional

```typescript
{...(canPreview && { onPreview: handleOnPreview })}
```

**Explanation:**

1. **When `canPreview` is `true`:**
   ```typescript
   canPreview && { onPreview: handleOnPreview }
   // Returns: { onPreview: handleOnPreview }

   {...{ onPreview: handleOnPreview }}
   // Spreads: onPreview={handleOnPreview}
   ```

2. **When `canPreview` is `false`:**
   ```typescript
   canPreview && { onPreview: handleOnPreview }
   // Returns: false (short-circuit evaluation)

   {...false}
   // Spreads: nothing (false spreads to empty object)
   ```

**Result:**
- When permission exists → Prop is added
- When permission missing → Prop is completely absent (not `undefined`)

---

## Additional Improvements (Optional)

### Also Apply to Other Action Handlers

You might want to apply the same pattern to other handlers if they have permissions:

```typescript
<CompSyncFusionGrid
    // ... other props
    {...(canEdit && { onEdit: handleOnEdit })}
    {...(canDelete && { onDelete: handleOnDelete })}
    {...(canPreview && { onPreview: handleOnPreview })}
    // ... other props
/>
```

**But wait**, check if you have these permissions:
- Look at line 19: `const { canPreview } = useVoucherPermissions();`
- Only extracting `canPreview`

**If you want to add other permissions:**
```typescript
const { canEdit, canDelete, canPreview } = useVoucherPermissions();
```

**Then use:**
```typescript
<CompSyncFusionGrid
    // ... other props
    onCopy={handleOnCopy}  // Copy might not need permission
    {...(canEdit && { onEdit: handleOnEdit })}
    {...(canDelete && { onDelete: handleOnDelete })}
    {...(canPreview && { onPreview: handleOnPreview })}
    // ... other props
/>
```

**For now, just fix `onPreview` as requested.**

---

## Testing Scenarios

### Test Case 1: User with Preview Permission
**Given:**
- User has `vouchers.payment.preview` permission
- Viewing Payment vouchers

**Expected:**
- Preview button visible in grid
- Clicking preview opens preview modal
- No errors

### Test Case 2: User without Preview Permission
**Given:**
- User lacks `vouchers.payment.preview` permission
- Viewing Payment vouchers

**Expected:**
- Preview button/column NOT visible in grid
- No errors
- Grid renders normally

### Test Case 3: Switching Voucher Types (Payment → Receipt)
**Given:**
- User has `vouchers.payment.preview` but NOT `vouchers.receipt.preview`
- Currently viewing Payment vouchers with preview button visible

**Action:** Switch to Receipt voucher type

**Expected:**
- ✅ No `valueAccessor` error
- Grid re-renders successfully
- Preview button disappears (no permission for Receipt)
- Data loads for Receipt vouchers

### Test Case 4: Switching Voucher Types (Receipt → Payment)
**Given:**
- User has `vouchers.payment.preview` but NOT `vouchers.receipt.preview`
- Currently viewing Receipt vouchers (no preview button)

**Action:** Switch to Payment voucher type

**Expected:**
- ✅ No errors
- Grid re-renders successfully
- Preview button appears (permission for Payment)
- Data loads for Payment vouchers

### Test Case 5: Admin User
**Given:**
- Admin user (all permissions)
- Switching between all voucher types

**Expected:**
- Preview button always visible
- No errors when switching types
- Grid functions normally

---

## Why This Fix Works

### Problem with `undefined`

```typescript
onPreview={canPreview ? handleOnPreview : undefined}
```

**What React does:**
1. Passes prop `onPreview` with value `undefined` to component
2. Component receives: `props.onPreview = undefined`
3. Syncfusion Grid tries to use `props.onPreview` in its internal logic
4. Grid assumes it's a function, calls it → ERROR

### Solution with Conditional Spreading

```typescript
{...(canPreview && { onPreview: handleOnPreview })}
```

**What React does:**
1. **When true**: Spreads `{ onPreview: handleOnPreview }` → Adds prop
2. **When false**: Spreads nothing → Prop doesn't exist
3. Component receives: `props.onPreview` is either a function OR not present
4. Syncfusion Grid checks `if (props.onPreview)` → Only renders preview column if prop exists

**Key Difference:**
- ❌ `undefined`: Prop exists but has undefined value
- ✅ Not spread: Prop doesn't exist at all

---

## Implementation Steps

- [ ] **Step 1**: Locate line 116 in `all-vouchers-view.tsx`
- [ ] **Step 2**: Replace `onPreview={canPreview ? handleOnPreview : undefined}` with `{...(canPreview && { onPreview: handleOnPreview })}`
- [ ] **Step 3**: Test with user who has preview permission (button should show)
- [ ] **Step 4**: Test with user without preview permission (button should hide)
- [ ] **Step 5**: Test switching between voucher types (should not error)
- [ ] **Step 6**: Verify no `valueAccessor` errors in console

---

## Summary

### Problem
- `onPreview={canPreview ? handleOnPreview : undefined}` causes Syncfusion Grid errors
- Grid doesn't handle `undefined` values for event handlers

### Solution
- Use conditional prop spreading: `{...(canPreview && { onPreview: handleOnPreview })}`
- Prop is completely absent when permission is false
- No `undefined` values passed to grid

### Benefits
- ✅ No more `valueAccessor` errors
- ✅ Clean permission-based rendering
- ✅ Preview column shows/hides based on permission
- ✅ Grid handles prop changes smoothly

### Files Modified
- `src/features/accounts/vouchers/all-vouchers/all-vouchers-view.tsx`

### Lines Changed
- 1 line modified (line 116)

### Risk
- Very Low (just changing prop syntax, same functionality)

---

## End of Plan

**Ready to Implement**: Yes ✅
**Estimated Time**: 2 minutes
**Complexity**: Very Low
**Risk**: Very Low
