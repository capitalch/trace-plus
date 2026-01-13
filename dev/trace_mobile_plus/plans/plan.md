# Plan: Make Unit Name Clickable to Show Business Unit Selector

## Problem Statement
In the dashboard page, the business unit selector modal can be opened by clicking the business unit name in the AppBar. However, the unit name displayed in the secondary app bar is just a label and cannot be clicked. Users want to click the unit name to open the same business unit selector modal.

## Solution Approach

Pass the existing `_showBusinessUnitSelector` method from DashboardPage as a callback to DashboardSecondaryAppBarWidget. This avoids code duplication and reuses the existing logic.

## Current State

### DashboardPage (`lib/features/dashboard/dashboard_page.dart`)
- **Line 160-238**: `_showBusinessUnitSelector()` method shows modal to select business unit
- **Line 383-405**: Business unit name in AppBar is clickable via InkWell
- **Line 421**: DashboardSecondaryAppBarWidget is instantiated (no parameters passed)

### DashboardSecondaryAppBarWidget (`lib/features/dashboard/dashboard_secondary_app_bar_widget.dart`)
- **Line 5-6**: Constructor with no parameters
- **Line 38-49**: Unit name is displayed as a simple Text widget (NOT clickable)
- **Line 94-125**: Branch code IS clickable with InkWell (good example to follow)

## Implementation Plan

### Step 1: Add Callback Parameter to DashboardSecondaryAppBarWidget

**File**: `lib/features/dashboard/dashboard_secondary_app_bar_widget.dart`

**Current constructor** (lines 5-6):
```dart
class DashboardSecondaryAppBarWidget extends StatelessWidget {
  const DashboardSecondaryAppBarWidget({super.key});
```

**New constructor**:
```dart
class DashboardSecondaryAppBarWidget extends StatelessWidget {
  final VoidCallback? onUnitNameTap;

  const DashboardSecondaryAppBarWidget({
    super.key,
    this.onUnitNameTap,
  });
```

**Purpose**: Add optional callback parameter that will be called when unit name is tapped

**Lines to modify**: Lines 5-6

### Step 2: Make Unit Name Clickable with InkWell

**File**: `lib/features/dashboard/dashboard_secondary_app_bar_widget.dart`

**Current implementation** (lines 38-49):
```dart
// Left: Unit Name
Flexible(
  flex: 2,
  child: Text(
    unitName,
    style: const TextStyle(
      color: Colors.black87,
      fontSize: 13,
      fontWeight: FontWeight.w500,
    ),
    overflow: TextOverflow.ellipsis,
  ),
),
```

**New implementation**:
```dart
// Left: Unit Name (clickable)
Flexible(
  flex: 2,
  child: InkWell(
    onTap: onUnitNameTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey[300]!, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Text(
              unitName,
              style: const TextStyle(
                color: Colors.black87,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 4),
          const Icon(Icons.arrow_drop_down, color: Colors.black87, size: 18),
        ],
      ),
    ),
  ),
),
```

**Purpose**:
- Wrap unit name with InkWell to make it clickable
- Add visual styling to match branch code (grey background, border, dropdown icon)
- Call the callback when tapped

**Visual changes**:
- Light grey background
- Rounded border
- Dropdown arrow icon to indicate clickability
- Padding for better touch target

**Lines to modify**: Lines 38-49

### Step 3: Pass Callback from DashboardPage

**File**: `lib/features/dashboard/dashboard_page.dart`

**Current usage** (line 421):
```dart
const DashboardSecondaryAppBarWidget(),
```

**New usage**:
```dart
DashboardSecondaryAppBarWidget(
  onUnitNameTap: () => _showBusinessUnitSelector(context),
),
```

**Purpose**: Pass the existing `_showBusinessUnitSelector` method as a callback

**Lines to modify**: Line 421

## Implementation Steps Summary

1. ✅ **Step 1**: Add `onUnitNameTap` callback parameter to DashboardSecondaryAppBarWidget constructor
2. ✅ **Step 2**: Wrap unit name with InkWell and add visual styling
3. ✅ **Step 3**: Pass `_showBusinessUnitSelector` as callback from DashboardPage

## Files to Modify

1. **lib/features/dashboard/dashboard_secondary_app_bar_widget.dart**
   - Add callback parameter to constructor (lines 5-6)
   - Make unit name clickable with InkWell (lines 38-49)

2. **lib/features/dashboard/dashboard_page.dart**
   - Pass callback when instantiating widget (line 421)

## Visual Changes

### Before:
```
[Unit Name]  |  [- FinYear +]  |  [Branch Code ▼]
Plain text     Clickable          Clickable
```

### After:
```
[Unit Name ▼]  |  [- FinYear +]  |  [Branch Code ▼]
Clickable         Clickable          Clickable
```

All three sections will have consistent visual styling with grey background, border, and dropdown indicators.

## Testing Scenarios

### Test 1: Click Unit Name in Secondary AppBar
1. Open dashboard
2. Click on the unit name in the secondary app bar
3. **Expected**: Business unit selector modal opens
4. Select a different business unit
5. **Expected**: Unit name updates and modal closes

### Test 2: Click Business Unit in Main AppBar
1. Open dashboard
2. Click business unit name in main AppBar
3. **Expected**: Same modal opens as clicking secondary app bar unit name
4. Both trigger the same `_showBusinessUnitSelector` method

### Test 3: Visual Consistency
1. Open dashboard
2. **Expected**: Unit name has same visual style as branch code (grey background, border, dropdown icon)
3. Tap on unit name
4. **Expected**: Visual feedback (ripple effect)

### Test 4: Existing Functionality Still Works
1. Click branch code
2. **Expected**: Branch selector opens as before
3. Click +/- for financial year
4. **Expected**: Financial year changes as before

### Test 5: Long Unit Names
1. Test with a very long unit name
2. **Expected**: Text truncates with ellipsis
3. Layout doesn't break
4. Still clickable

## Advantages

✅ **No code duplication**: Reuses existing `_showBusinessUnitSelector` method
✅ **Consistent behavior**: Both locations trigger the same modal logic
✅ **Visual consistency**: Unit name styled like other clickable elements
✅ **Clear affordance**: Dropdown icon indicates clickability
✅ **Minimal changes**: Only 3 small modifications
✅ **Clean separation**: Widget receives behavior from parent

## Success Criteria

✅ Unit name in secondary app bar is clickable
✅ Clicking unit name opens business unit selector modal
✅ Same modal/logic used as main AppBar business unit selector
✅ Visual styling matches branch code styling
✅ Dropdown icon indicates clickability
✅ Existing functionality unchanged
✅ Works with long unit names (ellipsis)
✅ Touch feedback (ripple effect) on tap

## Risk Assessment

**Low Risk**:
- Changes are isolated and simple
- Reuses existing tested modal logic
- No code duplication
- No breaking changes
- Easy to test

## Implementation Status

⏳ **Ready to implement**

## Next Steps

1. Implement Step 1: Add callback parameter to constructor
2. Implement Step 2: Make unit name clickable with InkWell styling
3. Implement Step 3: Pass callback from DashboardPage
4. Test all scenarios
5. Verify visual consistency
