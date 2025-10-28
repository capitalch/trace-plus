# Plan: Implement 4-Level Hierarchy in Right Tree Grid

## Requirements
Based on `hier.md`:
1. **4-Level Hierarchy**: Role → controlType → controlPrefix → controlName
2. **No functional changes**: Drop, link, and unlink behavior remains the same
3. **Display only changes**: Only visual tree structure changes
4. **Reversible**: Ability to revert to original implementation

## Current State
- Right grid shows: Role → Secured Controls (2 levels)
- Uses `childMapping="securedControls"`
- Data from SQL: `SqlIdsMap.getRolesSecuredControlsLink`
- Drag and drop works correctly
- Link/unlink functionality works

## Strategy

### Approach: Data Transformation with Git Branch Safety

**Branch Strategy**:
1. Current working state is in `main` branch
2. Create a new git commit of working state (backup point)
3. Implement 4-level hierarchy
4. If it doesn't work, can easily revert with `git reset --hard HEAD~1`

## Implementation Steps

### Step 1: Create Backup Commit
```bash
git add .
git commit -m "Working 2-level tree grid before 4-level hierarchy implementation"
```
This creates a restore point we can revert to if needed.

### Step 2: Data Transformation Function

Create a function to transform the 2-level data into 4-level hierarchy:

```typescript
function transformTo4LevelHierarchy(roles: any[]): any[] {
    if (!roles || !Array.isArray(roles)) return roles;

    return roles.map(role => {
        // If no secured controls, return role with empty children
        if (!role.securedControls || !Array.isArray(role.securedControls) || role.securedControls.length === 0) {
            return {
                ...role,
                level: 0,
                type: "role",
                children: []
            };
        }

        // Group secured controls by controlType
        const groupedByType = _.groupBy(role.securedControls, 'controlType');

        const typeChildren = Object.entries(groupedByType).map(([controlType, controlsOfType]: [string, any[]]) => {
            // Group by controlPrefix within each type
            const groupedByPrefix = _.groupBy(controlsOfType, 'controlPrefix');

            const prefixChildren = Object.entries(groupedByPrefix).map(([controlPrefix, controlsOfPrefix]: [string, any[]]) => {
                // Level 3: Actual controls
                const controlChildren = controlsOfPrefix.map(control => ({
                    ...control,
                    level: 3,
                    type: "control",
                    pkey: control.id || control.pkey,
                    roleId: role.roleId,
                    securedControlId: control.securedControlId,
                    name: control.name,
                    descr: control.descr
                }));

                // Level 2: Prefix group
                return {
                    level: 2,
                    type: "prefixGroup",
                    controlPrefix: controlPrefix,
                    name: controlPrefix,
                    roleId: role.roleId,
                    pkey: `${role.roleId}_${controlType}_${controlPrefix}`,
                    children: controlChildren,
                    count: controlChildren.length
                };
            });

            // Level 1: Type group
            return {
                level: 1,
                type: "typeGroup",
                controlType: controlType,
                name: controlType,
                roleId: role.roleId,
                pkey: `${role.roleId}_${controlType}`,
                children: prefixChildren,
                count: controlsOfType.length
            };
        });

        // Level 0: Role
        return {
            ...role,
            level: 0,
            type: "role",
            children: typeChildren,
            securedControls: role.securedControls // Keep for unlink all functionality
        };
    });
}
```

### Step 3: Apply Transformation

**Option A: Transform in useMemo** (Recommended)
```typescript
// Get original data from Redux
const originalData = useSelector((state: RootStateType) => {
    return state.queryHelper[linksInstance]?.data?.[0]?.jsonResult;
});

// Transform data
const transformedData = useMemo(() => {
    if (!originalData || !Array.isArray(originalData)) return [];
    return transformTo4LevelHierarchy(originalData);
}, [originalData]);
```

**Option B: Transform in custom loadData**
```typescript
const customLoadData = useCallback(async () => {
    const originalLoadData = context.CompSyncFusionTreeGrid[linksInstance].loadData;
    await originalLoadData();

    // Get and transform data
    const treeGridRef = context.CompSyncFusionTreeGrid[linksInstance]?.gridRef;
    if (treeGridRef?.current) {
        const originalData = treeGridRef.current.dataSource;
        const transformed = transformTo4LevelHierarchy(originalData);
        treeGridRef.current.dataSource = transformed;
        treeGridRef.current.refresh();
    }
}, []);
```

### Step 4: Update TreeGrid Configuration

```typescript
<CompSyncfusionTreeGrid
    addUniqueKeyToJson={true}
    className=''
    childMapping="children"  // Changed from "securedControls"
    columns={getLinkColumns()}
    dataSource={transformedData}  // Use transformed data
    height="calc(100vh - 335px)"
    instance={linksInstance}
    minWidth='400px'
    pageSize={11}
    rowHeight={40}
    sqlArgs={{}}
    sqlId={SqlIdsMap.getRolesSecuredControlsLink}
    treeColumnIndex={0}
/>
```

### Step 5: Update Template Functions

#### nameColumnTemplate
```typescript
function nameColumnTemplate(props: any) {
    // Level 0: Role
    if (props.level === 0 || props.type === "role") {
        return (
            <div className="flex items-center">
                <span className='font-semibold text-gray-900'>{props.name}</span>
                {getChildCount(props)}
            </div>
        );
    }

    // Level 1: Type Group
    if (props.level === 1 || props.type === "typeGroup") {
        return (
            <div className='flex items-center gap-2 py-1 px-2 bg-blue-50 rounded'>
                <IconControls className='w-4 h-4 text-blue-600' />
                <span className='text-xs font-medium text-gray-600'>Type:</span>
                <span className='font-semibold text-blue-800'>{props.controlType || props.name}</span>
                <span className='inline-flex items-center px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold'>
                    {props.count || 0}
                </span>
            </div>
        );
    }

    // Level 2: Prefix Group
    if (props.level === 2 || props.type === "prefixGroup") {
        return (
            <div className='flex items-center gap-2 py-1 px-2 ml-4 bg-green-50 rounded'>
                <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
                </svg>
                <span className='text-xs font-medium text-gray-600'>Prefix:</span>
                <span className='font-semibold text-green-800'>{props.controlPrefix || props.name}</span>
                <span className='inline-flex items-center px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-semibold'>
                    {props.count || 0}
                </span>
            </div>
        );
    }

    // Level 3: Control
    return (
        <div className="flex items-center ml-8">
            <div className='flex items-center justify-center w-6 h-6 bg-sky-100 rounded'>
                <IconControls className="w-4 h-4 text-sky-600" />
            </div>
            <span className='ml-2 text-gray-700'>{props.name}</span>
        </div>
    );
}
```

#### descrColumnTemplate
```typescript
function descrColumnTemplate(props: any) {
    // Show description and buttons only for roles and actual controls
    // Not for group headers (type and prefix groups)

    if (props.type === "typeGroup" || props.type === "prefixGroup") {
        return null; // No description for group headers
    }

    return (
        <div className="flex flex-row items-center">
            <span>{props.descr}</span>
            {getLinkOrUnlinkButton(props)}
            {getUnlinkAllButton(props)}
        </div>
    );
}
```

#### getLinkOrUnlinkButton
```typescript
function getLinkOrUnlinkButton(props: any) {
    // Link button for roles (level 0)
    if (props.level === 0 || props.type === "role") {
        return (
            <TooltipComponent content={Messages.messLinkSecuredControl}>
                <button
                    onClick={() => handleOnClickLink(props)}
                    className="ml-2 p-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                    aria-label="Link secured control to role"
                >
                    <IconLink className="w-6 h-6 text-blue-600 hover:text-blue-700" />
                </button>
            </TooltipComponent>
        );
    }

    // Unlink button for actual controls (level 3)
    if (props.level === 3 || props.type === "control") {
        return (
            <TooltipComponent content={Messages.messUnlinkSecuredControl}>
                <button
                    onClick={() => handleOnClickUnlink(props)}
                    className="ml-2 p-1.5 rounded-md hover:bg-amber-50 transition-all duration-200 hover:scale-110"
                    aria-label="Unlink secured control from role"
                >
                    <IconUnlink className="w-6 h-6 text-amber-600 hover:text-amber-700" />
                </button>
            </TooltipComponent>
        );
    }

    return null;
}
```

### Step 6: Update Drag & Drop Logic

The drag and drop needs to find the parent role regardless of which level is dropped on:

```typescript
function findParentRole(targetRowData: any, viewRecords: any[]): any {
    // If dropped on role, return it
    if (targetRowData.level === 0 || targetRowData.type === "role") {
        return targetRowData;
    }

    // Walk up using roleId to find the role
    const roleId = targetRowData.roleId;
    return viewRecords.find((r: any) =>
        (r.level === 0 || r.type === "role") && r.roleId === roleId
    );
}

function onSecuredControlsRowDrop(args: any) {
    args.cancel = true;
    const targetGridRef = context.CompSyncFusionTreeGrid[linksInstance].gridRef;

    // ... existing validation code ...

    const rolesLinkViewRecords = targetGridRef.current.getCurrentViewRecords();
    const targetRowData = rolesLinkViewRecords[args.dropIndex];

    // Find the parent role
    const parentRole = findParentRole(targetRowData, rolesLinkViewRecords);

    if (!parentRole) {
        console.error('Could not find parent role');
        return;
    }

    // Get existing controls from the role
    const existingControls = parentRole.securedControls || [];
    const existingIds = existingControls.map((c: any) => c.securedControlId);

    // Filter out already linked controls
    const sourceIds: string[] = args.data?.map((x: any) => x.id) || [];
    const newIds = sourceIds.filter(id => !existingIds.includes(id));

    // Proceed with link operation using roleId
    const roleId = parentRole.roleId;
    // ... rest of link logic ...
}
```

### Step 7: Update setExpandedKeys

```typescript
function setExpandedKeys() {
    const expandedKeys: Set<number> = new Set();

    // Expand the entire path to the dropped location
    let current = targetRowData;
    while (current) {
        if (current.pkey) {
            expandedKeys.add(current.pkey);
        }

        // Stop at role level
        if (current.level === 0 || current.type === "role") {
            break;
        }

        // Try to find parent
        if (current.parentItem) {
            current = rolesLinkViewRecords[current.parentItem.index];
        } else {
            break;
        }
    }

    context.CompSyncFusionTreeGrid[linksInstance].expandedKeys = expandedKeys;
}
```

### Step 8: Add Expand/Collapse All Button

```typescript
function ExpandCollapseTreeButton() {
    return (
        <button
            onClick={handleToggleAllTreeGroups}
            className='w-8 h-8 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md'
            title={allTreeGroupsExpanded ? 'Collapse all' : 'Expand all'}
        >
            {allTreeGroupsExpanded ? <CollapseIcon /> : <ExpandIcon />}
        </button>
    );
}

function handleToggleAllTreeGroups() {
    const treeGridRef = context.CompSyncFusionTreeGrid[linksInstance]?.gridRef;
    if (!treeGridRef?.current) return;

    if (allTreeGroupsExpanded) {
        treeGridRef.current.collapseAll();
        setAllTreeGroupsExpanded(false);
    } else {
        treeGridRef.current.expandAll();
        setAllTreeGroupsExpanded(true);
    }
}
```

## Testing Checklist

### Display Testing
- [ ] Roles display at level 0
- [ ] Type groups display at level 1 with proper styling
- [ ] Prefix groups display at level 2 with proper styling
- [ ] Controls display at level 3
- [ ] Expand/collapse works at all levels
- [ ] Expand/collapse all button works

### Functionality Testing
- [ ] Drag from left grid to role (level 0) - should link
- [ ] Drag from left grid to type group (level 1) - should link to parent role
- [ ] Drag from left grid to prefix group (level 2) - should link to parent role
- [ ] Drag from left grid to control (level 3) - should link to parent role
- [ ] Link button on role works
- [ ] Unlink button on control (level 3) works
- [ ] Unlink all button on role works
- [ ] No duplicate links created
- [ ] Controls disappear from left when linked
- [ ] Tree refreshes correctly after link/unlink

### Edge Cases
- [ ] Role with no controls shows empty structure
- [ ] Role with controls of single type
- [ ] Role with controls of single prefix
- [ ] Multiple controls with same name but different types
- [ ] Data refresh after operations

## Rollback Plan

If implementation doesn't work:

### Option 1: Git Reset (Recommended)
```bash
git reset --hard HEAD~1
```
This reverts to the commit before implementation.

### Option 2: Manual Revert
1. Change `childMapping` back to `"securedControls"`
2. Remove `dataSource` prop or set to `undefined`
3. Revert template functions to 2-level logic
4. Remove transformation function and related code

### Option 3: Git Stash
Before starting:
```bash
git stash push -m "4-level hierarchy attempt"
```
To restore:
```bash
git stash pop
```

## Success Criteria

1. ✅ 4-level hierarchy displays correctly
2. ✅ All drag and drop scenarios work
3. ✅ Link/unlink functionality unchanged
4. ✅ No TypeScript errors
5. ✅ Build succeeds
6. ✅ UI is responsive and performs well
7. ✅ Can revert to original state if needed

## Implementation Order

1. **Create backup commit** (safety first!)
2. **Add transformation function**
3. **Update TreeGrid to use transformed data**
4. **Update template functions** (start with nameColumnTemplate)
5. **Test display** (verify 4 levels show correctly)
6. **Update drag & drop logic** (findParentRole function)
7. **Test all link/unlink scenarios**
8. **Add expand/collapse all button**
9. **Final testing**
10. **If issues, rollback using git reset**

## Notes

- Transformation preserves `securedControls` on role for unlink all functionality
- Each node has `roleId` for tracing back to parent role
- `pkey` is unique for each node for expand/collapse tracking
- `type` field helps identify node type in templates
- Display-only change means all SQL and backend logic unchanged
