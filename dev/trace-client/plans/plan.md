# Plan: Add Fields to Right Side Tree Grid Similar to Left Side Grid

## Current State Analysis

### Left Side Grid (Secured Controls - CompSyncFusionGrid)
Located at: `src/features/security/super-admin/link-unlink-secured-controls/super-admin-link-secured-controls-with-roles.tsx:138-164`

**Current Columns:**
- `controlName` - Control name (width: 180)
- `controlType` - Type (width: 60)
- `descr` - Description (flexible width)
- `controlPrefix` - Prefix (width: 60)

**Features:**
- Grouping by controlType and controlPrefix
- Drag and drop capability
- Checkbox selection
- Aggregates (count)
- Multi-level group captions with badges

### Right Side Tree Grid (Roles & Linked Controls - CompSyncfusionTreeGrid)
Located at: `src/features/security/super-admin/link-unlink-secured-controls/super-admin-link-secured-controls-with-roles.tsx:187-202`

**Current Columns:**
- `name` - Role/Secured control name (with custom template)
- `descr` - Description (with link/unlink buttons)

**Structure:**
- Level 0: Roles
- Level 1: Secured controls linked to roles
- Uses `childMapping="securedControls"` for tree structure
- Data source: `SqlIdsMap.getRolesSecuredControlsLink`

## Feasibility Assessment

### ✅ YES - It is possible to add fields to the right side tree grid

**Reasons:**
1. The right side tree grid displays secured controls at level 1, which are the same entity type as the left grid
2. SyncFusion TreeGrid supports multiple columns just like the regular Grid
3. The data source can include all necessary fields (controlType, controlPrefix, etc.)
4. Column templates can be used to differentiate display based on tree level

## Implementation Plan

### Step 1: Verify Data Source
**File:** Check SQL query configuration
- Location: Verify `SqlIdsMap.getRolesSecuredControlsLink` returns all required fields
- Required fields for secured controls (level 1):
  - `controlName` (already has as `name`)
  - `controlType`
  - `controlPrefix`
  - `descr` (already present)

### Step 2: Update Column Definitions
**File:** `super-admin-link-secured-controls-with-roles.tsx:683-698`
**Function:** `getLinkColumns()`

Add new columns to the tree grid:
```typescript
{
    field: 'controlType',
    headerText: 'Type',
    type: 'string',
    width: 80,
    template: controlTypeColumnTemplate  // Show only for level 1
}
{
    field: 'controlPrefix',
    headerText: 'Prefix',
    type: 'string',
    width: 100,
    template: controlPrefixColumnTemplate  // Show only for level 1
}
```

### Step 3: Create Column Templates
**File:** `super-admin-link-secured-controls-with-roles.tsx`
**New Functions:** After line 726

Create template functions that render content conditionally based on tree level:

**Template 1: `controlTypeColumnTemplate(props)`**
- If `props.level === 1` (secured control): Display `props.controlType`
- If `props.level === 0` (role): Display empty or placeholder

**Template 2: `controlPrefixColumnTemplate(props)`**
- If `props.level === 1` (secured control): Display `props.controlPrefix`
- If `props.level === 0` (role): Display empty or placeholder

### Step 4: Update Existing Templates (Optional Enhancement)
**File:** `super-admin-link-secured-controls-with-roles.tsx:700-710, 718-726`

Consider adjusting existing templates:
- `nameColumnTemplate` - May need width adjustment
- `descrColumnTemplate` - May need to account for additional columns

### Step 5: Adjust Grid Width/Layout
**File:** `super-admin-link-secured-controls-with-roles.tsx:187-202`

Update CompSyncfusionTreeGrid props if needed:
- Adjust `minWidth` if total column width increases
- Consider adding horizontal scrolling if too many columns

### Step 6: Testing
Test the following scenarios:
1. Roles (level 0) display correctly without control-specific fields
2. Secured controls (level 1) display all fields properly
3. Tree expansion/collapse works correctly
4. Drag and drop functionality still works
5. Link/unlink actions still function
6. Layout responsive on different screen sizes
7. Unlink all functionality works

## Potential Challenges

### Challenge 1: Data Availability
**Issue:** SQL query may not return `controlType` and `controlPrefix` for child records
**Solution:**
- Verify/modify the SQL query at `SqlIdsMap.getRolesSecuredControlsLink`
- Ensure JOIN includes secured controls table with all necessary fields

### Challenge 2: Visual Clutter
**Issue:** Too many columns may make the interface crowded
**Solution:**
- Use appropriate column widths
- Consider making some columns optional/hideable
- Use icons or abbreviations for type/prefix
- Consider color coding instead of separate columns

### Challenge 3: Role Rows (Level 0)
**Issue:** Role rows don't have control-specific fields
**Solution:**
- Template functions should check `props.level` and render empty/null for level 0
- Alternatively, show aggregate info (e.g., count by type)

### Challenge 4: Responsive Design
**Issue:** Additional columns may break layout on smaller screens
**Solution:**
- Test on various screen sizes
- Consider using SyncFusion's column hiding feature for mobile
- Adjust `min-w-[400px]` in the parent div if needed

## Alternative Approaches

### Option A: Badge/Chip Display (Recommended)
Instead of separate columns, display type and prefix as badges within the name column:
```
[Icon] Control Name [Type Badge] [Prefix Badge]
```
**Pros:** Cleaner UI, less horizontal space
**Cons:** Slightly more complex template

### Option B: Tooltip on Hover
Show additional fields in a tooltip when hovering over secured control names
**Pros:** Minimal UI changes, cleaner interface
**Cons:** Less discoverable, requires user interaction

### Option C: Expandable Details Row
Add an expand icon to show additional details below each secured control
**Pros:** Very flexible, can show many fields
**Cons:** More complex implementation, requires extra clicks

## Recommendation

**Proceed with Step 2-3** (Adding columns with templates) BUT consider **Option A** (Badge display) for a better user experience:

1. Keep the tree structure and existing columns
2. Modify the `nameColumnTemplate` to include badges for `controlType` and `controlPrefix` when `level === 1`
3. Use color-coded badges similar to the left grid's group captions
4. This maintains consistency with the existing design language

## Estimated Complexity
- **SQL Query Update:** Low (if needed)
- **Column Addition:** Low-Medium
- **Template Creation:** Low
- **Testing:** Medium
- **Overall:** Medium complexity, high feasibility

## Success Criteria
- Right side tree grid displays controlType and controlPrefix for secured controls (level 1)
- Roles (level 0) display appropriately without these fields
- All existing functionality (drag-drop, link/unlink) continues to work
- UI remains clean and readable
- Responsive design maintained
