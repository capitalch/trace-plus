# Plan: Fix "Selected" Badge Issue - Root Cause Analysis & Final Solution

## Problem Description

**Issue**: When controls are selected in a prefix group under one Type (e.g., "menu" → "vouchers"), the "X selected" badge also appears in prefix groups with the same name under different Types (e.g., "action" → "vouchers").

**Example**:
```
Type: menu
├─ Prefix: vouchers (2 controls)
│   ├─ MENU.VOUCHERS.VIEW ✓ (selected)
│   └─ MENU.VOUCHERS.EDIT ✓ (selected)
│   Badge: "2 selected" ✅ CORRECT

Type: action
└─ Prefix: vouchers (5 controls)
    ├─ ACTION.VOUCHERS.CREATE ☐ (not selected)
    ├─ ACTION.VOUCHERS.DELETE ☐ (not selected)
    Badge: "2 selected" ❌ WRONG! Should show nothing
```

---

## Root Cause Analysis

### Why Previous Fixes Failed

**Attempt 1**: Added `parentType` parameter to filtering functions
- **Result**: Still failed
- **Reason**: The template function is called during React render, and SyncFusion may batch-render multiple group instances with the same prefix name

**Attempt 2**: Used `groupProps.items` array
- **Result**: Still failed
- **Reason**: The `items` property might not exist, or SyncFusion doesn't provide it in the group caption template context

### The Real Problem

SyncFusion's grouping setup:
```typescript
groupSettings={{
    columns: ['controlType', 'controlPrefix'],
    ...
}}
```

This creates hierarchical grouping: Type → Prefix. However:

1. When the `multiLevelGroupCaptionTemplate` is called for a **Prefix group**, the `groupProps` object contains:
   - `field: 'controlPrefix'`
   - `groupKey: 'vouchers'`
   - **BUT NO REFERENCE to which Type parent it belongs to!**

2. When `getSelectedCountBadge(groupProps)` is called, it only knows `field='controlPrefix'` and `key='vouchers'`

3. The function then filters ALL records where `controlPrefix === 'vouchers'` (across all types)

4. React renders all group captions, and they ALL show the same count because they're all calling with the same parameters

---

## The Real Solution: Add Type Context to Group Key

### Approach: Modify Data to Include Type in Prefix

Instead of trying to detect the parent type at render time, we should **include the type information in the prefix itself** when the data is structured for grouping.

### Option 1: Composite Grouping Key (Recommended)

Add a computed field to the data that combines type and prefix:

```typescript
// Before grouping, add a composite field to each record
const enhancedDataSource = dataSource.map(record => ({
    ...record,
    typePrefix: `${record.controlType}|${record.controlPrefix}` // e.g., "menu|vouchers"
}));
```

Then group by this composite key:
```typescript
groupSettings={{
    columns: ['controlType', 'typePrefix'], // Use composite key instead of controlPrefix
    ...
}}
```

**Benefits**:
- ✅ Each prefix group is now unique: "menu|vouchers" vs "action|vouchers"
- ✅ No ambiguity in template rendering
- ✅ Simple filtering logic
- ✅ No complex parent detection needed

**Display**:
Update the template to strip the type prefix when displaying:
```typescript
const displayName = typeName.includes('|')
    ? typeName.split('|')[1]  // Show "vouchers"
    : typeName;
```

### Option 2: Use Group Data Manager Context

SyncFusion provides a `DataManager` in the group context. We can access parent group information through it.

```typescript
function getSelectedCountBadge(groupProps: any): JSX.Element | null {
    const field = groupProps.field;
    const groupKey = groupProps.groupKey || groupProps.key;

    // For prefix groups, find parent type from groupProps
    let parentType: string | undefined = undefined;

    if (field === 'controlPrefix' && groupProps.level === 1) {
        // groupProps should have parent info at level 1 (nested under type)
        // Access through groupProps.parentGKey or similar
        parentType = groupProps.parentGKey;
    }

    // ... rest of logic
}
```

**Note**: This requires investigating the exact structure of `groupProps` to find where parent information is stored.

---

## Recommended Implementation Plan

### Phase 1: Add Composite Key (Cleanest Solution)

#### Step 1: Add Computed Field in useEffect

**File**: `admin-link-secured-controls-with-roles.tsx`
**Location**: Before the grid component

```typescript
// After getting data from Redux, enhance it
useEffect(() => {
    if (!gridRef?.current) return;

    const originalData = gridRef.current.dataSource as any[];
    if (!originalData) return;

    // Add composite typePrefix field
    const enhancedData = originalData.map(record => ({
        ...record,
        typePrefix: `${record.controlType}|${record.controlPrefix}`
    }));

    // Update grid data source
    gridRef.current.dataSource = enhancedData;
    gridRef.current.refresh();
}, [/* appropriate dependencies */]);
```

#### Step 2: Update Group Settings

**File**: `admin-link-secured-controls-with-roles.tsx`
**Location**: Line 361-366

**Change**:
```typescript
groupSettings={{
    columns: ['controlType', 'typePrefix'],  // ✅ Use composite key
    showDropArea: false,
    showGroupedColumn: false,
    captionTemplate: multiLevelGroupCaptionTemplate
}}
```

#### Step 3: Update Template Display Logic

**File**: `admin-link-secured-controls-with-roles.tsx`
**Location**: Line 992 (multiLevelGroupCaptionTemplate)

```typescript
function multiLevelGroupCaptionTemplate(props: any) {
    const typeName = props.groupKey || props.key || props.headerText || props.value || 'Unknown';
    const count = props.count || 0;

    const isTypeGroup = (props.field || '') === 'controlType';

    if (!isTypeGroup) {
        // This is a typePrefix group (composite key like "menu|vouchers")
        // Extract just the prefix part for display
        const displayName = typeName.includes('|')
            ? typeName.split('|')[1]
            : typeName;

        return (
            <div className='flex items-center gap-2 py-1.5 px-3 -ml-3.5 bg-linear-to-r from-green-50 to-green-100/50'>
                {/* ... */}
                <span className='font-semibold text-green-800 text-sm'>{displayName}</span>
                {/* ... */}
            </div>
        );
    }

    // ... type group rendering
}
```

#### Step 4: Update Column Definition

Add the new column to the grid:

```typescript
function getSecuredControlsColumns(): SyncFusionGridColumnType[] {
    return [
        {
            field: "controlName",
            headerText: "Control",
            type: "string",
            width: 180,
        },
        {
            field: "controlType",
            headerText: "Type",
            type: "string",
            width: 60,
        },
        {
            field: "descr",
            headerText: "Description",
            type: "string",
        },
        {
            field: "controlPrefix",
            headerText: "",
            type: "string",
            width: 60,
        },
        {
            field: "typePrefix",       // ✅ Add this
            headerText: "",            // Hidden column
            type: "string",
            visible: false,            // Don't display
            width: 0,
        },
    ]
}
```

#### Step 5: Simplify Filtering Functions

Now all filtering functions become simple because `typePrefix` is unique:

```typescript
function getSelectedCountBadge(groupProps: any): JSX.Element | null {
    const field = groupProps.field;
    const groupKey = groupProps.groupKey || groupProps.key;

    const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
    if (!gridRef?.current) return null;

    const dataSource = gridRef.current.dataSource as any[];
    if (!dataSource) return null;

    // Simple filtering - no need for parent type logic!
    const recordsInGroup = dataSource.filter((record: any) => {
        if (field === 'controlType') {
            return record.controlType === groupKey;
        } else if (field === 'typePrefix') {  // ✅ Use composite key
            return record.typePrefix === groupKey;
        }
        return false;
    });

    const selectedRecords = gridRef.current.getSelectedRecords() as any[];
    const selectedIds = new Set(selectedRecords.map((r: any) => r.id));

    const selectedInGroup = recordsInGroup.filter(r => selectedIds.has(r.id)).length;

    if (selectedInGroup === 0) return null;

    return (
        <span className='inline-flex items-center px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs font-semibold border border-purple-400'>
            {selectedInGroup} selected
        </span>
    );
}
```

**Update ALL filtering functions**:
- `getSelectedCountInGroup` - Replace `controlPrefix` with `typePrefix`
- `getAllControlIdsFromGroup` - Replace `controlPrefix` with `typePrefix`
- `handleSelectAllInGroup` - Replace `controlPrefix` with `typePrefix`
- Remove all the parent type detection logic (no longer needed!)

---

## Alternative: Debug groupProps Structure

Before implementing the composite key solution, we should log what's actually in `groupProps`:

```typescript
function multiLevelGroupCaptionTemplate(props: any) {
    // Temporary debug logging
    if (props.field === 'controlPrefix') {
        console.log('Prefix Group Props:', {
            field: props.field,
            key: props.key,
            groupKey: props.groupKey,
            level: props.level,
            parentGKey: props.parentGKey,
            parentPrimaryKey: props.parentPrimaryKey,
            allKeys: Object.keys(props),
            items: props.items?.length,
            data: props.data,
        });
    }

    // ... rest of function
}
```

This will help us understand if there's a simpler way to access parent context.

---

## Implementation Steps

1. ✅ Add debug logging to understand groupProps structure
2. ⏭️ If parent info exists in groupProps, use it
3. ⏭️ Otherwise, implement composite key solution (recommended)
4. ⏭️ Update all filtering functions to use typePrefix
5. ⏭️ Update template to display prefix name correctly
6. ⏭️ Remove unnecessary parent detection logic
7. ⏭️ Test thoroughly

---

## Why This Will Work

1. **Unique Keys**: Each prefix group now has a unique identifier: "menu|vouchers" ≠ "action|vouchers"
2. **No Ambiguity**: React renders each group with a distinct key
3. **Simple Logic**: Filtering just checks `typePrefix === groupKey`
4. **Clean Code**: Removes all complex parent detection logic
5. **Maintainable**: Easy to understand and debug

---

## Testing Checklist

1. ⏭️ Select controls in "menu → vouchers"
   - Verify badge shows only in that group
2. ⏭️ Select controls in "action → vouchers"
   - Verify badge shows only in that group
3. ⏭️ Verify prefix names display correctly (without type prefix)
4. ⏭️ Verify checkbox selection works correctly
5. ⏭️ Verify select-all works for individual prefix groups
6. ⏭️ Verify Type-level count shows total across all prefixes
