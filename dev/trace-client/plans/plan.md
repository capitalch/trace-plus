# Fix Index Column NaN Issue in Stock Summary Report

## Problem Analysis (Updated)

The index column in the stock summary report grid is showing `NaN` when the refresh button is clicked and `loadData` is executed.

### Root Cause (Corrected)

Based on testing:
- **On first load**: `props.index` has correct values (0, 1, 2, 3...)
- **After refresh button clicked**: `props.index` becomes `undefined`

This indicates that the issue is related to how the grid re-renders when data is refreshed. When `loadData` is called and `setRowsData(rowsData)` updates the state, the grid re-renders but the `props.index` is not properly maintained during this refresh cycle.

### Current Code

**Index Template Function** (`comp-syncfusion-grid-hook.tsx:294-303`):
```typescript
function indexColumnTemplate(props: any) {
  const idx: number = props.index !== undefined
    ? +props.index + 1
    : (props.__index !== undefined ? +props.__index + 1 : 1);
  return idx;
}
```

**Problem**: When `props.index` is `undefined` after refresh, it falls back to checking `props.__index` (also undefined), then returns 1 for all rows.

## Investigation Needed

### 1. Check Grid Refresh Mechanism
The issue might be in how the grid handles the `loadData` prop:

**File**: `stock-summary-report.tsx:133`
```typescript
<CompSyncFusionGrid
  ...
  loadData={loadData}
  ...
/>
```

**File**: `comp-syncfusion-grid.tsx:131`
```typescript
context.CompSyncFusionGrid[instance].loadData = loadData || loadDataLocal;
```

### 2. Check How DataSource Updates Affect Template Props
When `setRowsData(rowsData)` is called in `loadData` function (`stock-summary-report.tsx:538-572`), the grid's dataSource changes. We need to verify if this causes the template to lose the index information.

**File**: `comp-syncfusion-grid.tsx:177`
```typescript
dataSource={dataSource || selectedData || []}
```

### 3. Potential Grid State Issue
The grid might be losing its internal state when dataSource changes. SyncFusion GridComponent might need a key or proper refresh mechanism.

## Solution Options

### Option 1: Force Grid Refresh with Proper Index (Recommended)
Add a key to force proper re-rendering when data changes:

**Modify**: `comp-syncfusion-grid.tsx:161-199`
```typescript
<GridComponent
  key={`${instance}-${(dataSource || selectedData || []).length}`}
  ...
/>
```

This forces React to recreate the grid component when data changes, ensuring props.index is properly set.

### Option 2: Use GridComponent's refresh() Method
Call the grid's `refresh()` method after data is loaded to ensure proper state:

**Modify**: `stock-summary-report.tsx:538-572` - Add after `setRowsData(rowsData)`:
```typescript
async function loadData() {
  try {
    // ... existing code ...
    setRowsData(rowsData);

    // Force grid refresh to maintain index
    const gridInstance = context.CompSyncFusionGrid[instance]?.gridRef?.current;
    if (gridInstance) {
      setTimeout(() => gridInstance.refresh(), 0);
    }
  } catch (e: any) {
    console.log(e);
  }
}
```

### Option 3: Use Column valueAccessor Instead of Template
Instead of using template, use `valueAccessor` which might preserve index better:

**Modify**: `comp-syncfusion-grid-hook.tsx:225-236`
```typescript
if (hasIndexColumn) {
  colDirectives.unshift(
    <ColumnDirective
      key="#"
      allowEditing={false}
      field="__rowIndex"
      headerText="#"
      valueAccessor={(field: string, data: any, column: any) => {
        // This gets called with proper context
        return data.index !== undefined ? data.index + 1 : '';
      }}
      width={indexColumnWidth}
    />
  );
}
```

### Option 4: Store Index in Data (Most Reliable)
Modify the data to include the index when setting it:

**Modify**: `stock-summary-report.tsx:568`
```typescript
setRowsData(rowsData.map((row, idx) => ({ ...row, __rowIndex: idx + 1 })));
```

Then use simple field reference:
```typescript
if (hasIndexColumn) {
  colDirectives.unshift(
    <ColumnDirective
      key="#"
      allowEditing={false}
      field="__rowIndex"
      headerText="#"
      width={indexColumnWidth}
    />
  );
}
```

## Recommended Approach

**Use Option 4** (Store Index in Data) because:
1. Most reliable - index is part of the data
2. No dependency on SyncFusion's internal state
3. Works consistently on initial load and refresh
4. Simple to implement and maintain

## Implementation Steps

1. **Modify the loadData function** in all files using `CompSyncFusionGrid` with `hasIndexColumn={true}`
   - Update `setRowsData()` calls to inject `__rowIndex`

2. **For stock-summary-report.tsx**:
   ```typescript
   setRowsData(rowsData.map((row, idx) => ({ ...row, __rowIndex: idx + 1 })));
   ```

3. **Update the trim handler** (`stock-summary-report.tsx:517-521`):
   ```typescript
   function handleOnClickTrim() {
     setRowsData((prev) =>
       prev
         .filter((item: RowDataType) => item.clos !== 0)
         .map((row, idx) => ({ ...row, __rowIndex: idx + 1 }))
     );
   }
   ```

4. **Update the remove handler** (`stock-summary-report.tsx:574-578`):
   ```typescript
   function handleOnRemove(props: any) {
     setRowsData((prev) =>
       prev
         .filter((item: RowDataType) => item.productId !== props.productId)
         .map((row, idx) => ({ ...row, __rowIndex: idx + 1 }))
     );
   }
   ```

5. **Update index column in hook** (`comp-syncfusion-grid-hook.tsx:225-236`):
   ```typescript
   if (hasIndexColumn) {
     colDirectives.unshift(
       <ColumnDirective
         key="#"
         allowEditing={false}
         field="__rowIndex"
         headerText="#"
         textAlign="Right"
         width={indexColumnWidth}
       />
     );
   }
   ```

6. **Remove the indexColumnTemplate function** - no longer needed

## Files to Modify

1. `c:\projects\trace-plus\dev\trace-client\src\controls\components\syncfusion-grid\comp-syncfusion-grid-hook.tsx`
   - Lines 225-236: Update index column directive to use `field="__rowIndex"`
   - Lines 294-303: Remove `indexColumnTemplate` function

2. `c:\projects\trace-plus\dev\trace-client\src\features\accounts\inventory\reports\inventory-reports\stock-summary-report\stock-summary-report.tsx`
   - Line 568: Update `setRowsData` to inject `__rowIndex`
   - Lines 517-521: Update `handleOnClickTrim` to re-index after filtering
   - Lines 574-578: Update `handleOnRemove` to re-index after removing

## Expected Outcome

After the fix:
- Index column displays sequential numbers (1, 2, 3, ...) correctly on initial load
- Index column maintains sequential numbers after refresh button is clicked
- Index numbers update correctly after trim or remove operations
- No NaN values appear in any scenario
- Index is always in sync with the visible row position
