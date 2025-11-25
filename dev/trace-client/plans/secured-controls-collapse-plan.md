# Plan: Fix Left Side Secured Controls Grid Default Expansion State

## Problem
The left side Secured Controls grid is currently expanded by default after retrieving data, but it should be collapsed by default (like the right side tree grid).

## Analysis: How Right Side Grid Works

The right side uses `CompSyncfusionTreeGrid` which has built-in collapse behavior:
- **Component**: `CompSyncfusionTreeGrid` (line 577-594)
- **Key Property**: `enableCollapseAll` (line 124 in comp-syncfusion-tree-grid.tsx)
- **Default Behavior**: TreeGrid collapses all nodes by default when `enableCollapseAll` is true

## Analysis: Left Side Grid Current State

The left side uses `CompSyncFusionGrid` with grouping:
- **Component**: `CompSyncFusionGrid` (line 522-551)
- **Grouping**: Uses `groupSettings` with columns: ['controlType', 'controlPrefix'] (line 535-540)
- **Current Issue**: No property to control default collapsed state for groups
- **Syncfusion Behavior**: Grid groups expand by default

## Solution: Simple Configuration Approach

**Instead of using dataBound event handler**, add `enableGroupCollapse` property to `groupSettings`.

### Implementation

Update the `groupSettings` configuration (line 535-540):

```typescript
groupSettings={{
    columns: ['controlType', 'controlPrefix'],
    showDropArea: false,
    showGroupedColumn: false,
    captionTemplate: multiLevelGroupCaptionTemplate,
    enableLazyLoading: false  // ADD THIS LINE - ensures groups start collapsed
}}
```

**OR** use the more direct approach:

```typescript
groupSettings={{
    columns: ['controlType', 'controlPrefix'],
    showDropArea: false,
    showGroupedColumn: false,
    captionTemplate: multiLevelGroupCaptionTemplate,
    // Syncfusion Grid doesn't have enableGroupCollapse,
    // so we need the dataBound approach instead
}}
```

## Revised Solution: dataBound Event Handler

Since Syncfusion Grid's `groupSettings` doesn't have a built-in "start collapsed" property, we need to use the `dataBound` event:

### Step 1: Add State Variable
**Location**: Around line 36 (after `allTreeGroupsExpanded`)

```typescript
const [isInitialLoad, setIsInitialLoad] = useState(true);
```

### Step 2: Add dataBound Event Handler
**Location**: Around line 807 (in Event Handlers section)

```typescript
const handleSecuredControlsDataBound = useCallback(() => {
    const gridRef = context.CompSyncFusionGrid[securedControlsInstance]?.gridRef;
    if (!gridRef?.current) return;

    // On initial load, collapse all groups
    if (isInitialLoad) {
        gridRef.current.groupCollapseAll();
        setAllGroupsExpanded(false);
        setIsInitialLoad(false);
    }
}, [isInitialLoad, context.CompSyncFusionGrid, securedControlsInstance]);
```

### Step 3: Add dataBound Prop to Grid
**Location**: Line 522-551 (CompSyncFusionGrid component)

Add the `dataBound` prop:

```typescript
<CompSyncFusionGrid
    aggregates={getSecuredControlsAggregates()}
    allowGrouping={true}
    columns={getSecuredControlsColumns()}
    dataBound={handleSecuredControlsDataBound}  // ADD THIS LINE
    gridDragAndDropSettings={{
        allowRowDragAndDrop: true,
        onRowDragStart: onRowDragStart,
        onRowDrop: onSecuredControlsRowDrop,
        selectionType: 'Multiple',
        targetId: linksInstance
    }}
    groupSettings={{
        columns: ['controlType', 'controlPrefix'],
        showDropArea: false,
        showGroupedColumn: false,
        captionTemplate: multiLevelGroupCaptionTemplate
    }}
    hasCheckBoxSelection={true}
    height="calc(100vh - 355px)"
    instance={securedControlsInstance}
    minWidth='400px'
    rowHeight={40}
    rowSelected={handleRowSelected}
    rowDeselected={handleRowDeselected}
    sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
    sqlId={SqlIdsMap.allSecuredControls}
/>
```

## Files to Modify
- `C:\projects\trace-plus\dev\trace-client\src\features\security\admin\link-unlink-secured-controls.tsx\admin-link-secured-controls-with-roles.tsx`

## Specific Line Changes

| Line | Change Type | Description |
|------|-------------|-------------|
| ~36 | Add | Add `const [isInitialLoad, setIsInitialLoad] = useState(true);` |
| ~430 | Add | Add `handleSecuredControlsDataBound` callback function |
| ~522 | Modify | Add `dataBound={handleSecuredControlsDataBound}` prop |

## Why This Approach?

### Comparison with Right Side Grid

| Aspect | Left Side (Grid) | Right Side (TreeGrid) |
|--------|------------------|----------------------|
| Component | CompSyncFusionGrid | CompSyncfusionTreeGrid |
| Data Structure | Flat with grouping | Hierarchical tree |
| Collapse Property | ❌ Not available | ✓ `enableCollapseAll` |
| Solution | dataBound event | Built-in property |

### Why dataBound Instead of Other Events?

1. **actionComplete**: Fires for many actions (sort, filter, group, etc.) - harder to track
2. **created**: Grid not fully initialized with data yet
3. **dataBound**: ✓ Fires exactly when data is bound and grid is ready
4. **useEffect**: Timing issues - grid may not be ready

## Testing Considerations

### 1. Initial Page Load
- ✓ Open the Link Secured Controls page
- ✓ Verify left side grid groups are collapsed by default
- ✓ Verify right side tree grid remains collapsed by default
- ✓ Verify data loads correctly in both grids

### 2. Expand/Collapse Button (Left Side)
- ✓ Click the expand all button
- ✓ Verify all groups expand
- ✓ Click collapse all button
- ✓ Verify all groups collapse
- ✓ Verify button icon toggles correctly

### 3. Refresh Button (Left Side)
- ✓ Expand some groups manually
- ✓ Click refresh button
- ✓ Verify grid preserves current expand/collapse state
- ✓ Verify `isInitialLoad` is false, so no auto-collapse happens

### 4. Data Updates
- ✓ Drag and drop controls to link them
- ✓ Verify left grid maintains expand/collapse state
- ✓ Verify right grid refreshes correctly

### 5. Both Grids Together
- ✓ Verify both grids start collapsed
- ✓ Verify independent expand/collapse controls work
- ✓ Verify consistent user experience

## Edge Cases & Decisions

### Q: What happens on refresh?
**A**: User's expand/collapse state is preserved
- `isInitialLoad` becomes `false` after first load
- Subsequent `dataBound` calls skip the collapse logic
- User preferences are maintained

### Q: What if user expands, then navigates away and back?
**A**: Grid resets to collapsed (component remounts)
- Component unmounts when navigating away
- New component instance has `isInitialLoad = true`
- Grid collapses again on mount

### Q: Should we persist expand/collapse state across sessions?
**A**: Not in this implementation (keep it simple)
- Current approach: collapse on mount, preserve during session
- Future enhancement: could store in localStorage/Redux

## Implementation Summary

This fix makes the left side Secured Controls grid behave like the right side tree grid:

1. **Add state tracking**: `isInitialLoad` to detect first data load
2. **Add event handler**: `handleSecuredControlsDataBound` to collapse on initial load
3. **Wire up the event**: Add `dataBound` prop to CompSyncFusionGrid
4. **Result**: Both grids start collapsed, consistent UX

The approach is minimal, non-intrusive, and preserves user preferences during the session.
