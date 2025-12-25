# Plan: Move FinYear and Branch Methods to SecondaryAppBarWidget

## Overview
Move the three methods (`_incrementFinYear`, `_decrementFinYear`, `_showBranchSelector`) from `dashboard_page.dart` into `SecondaryAppBarWidget` to make the widget self-contained and reduce coupling with the dashboard page.

## Current State
- `SecondaryAppBarWidget` is defined in `lib/features/dashboard/secondary_app_bar_widget.dart`
- It currently accepts three callback parameters that call methods in `DashboardPage`:
  - `onIncrementFinYear`: calls `_incrementFinYear(GlobalProvider)` from dashboard_page.dart:150
  - `onDecrementFinYear`: calls `_decrementFinYear(GlobalProvider)` from dashboard_page.dart:172
  - `onBranchSelectorTap`: calls `_showBranchSelector(BuildContext, GlobalProvider)` from dashboard_page.dart:194
- These three methods are ~100 lines of code in total
- Methods use:
  - `GlobalProvider` for state access (already available via Consumer in widget)
  - `BuildContext` for ScaffoldMessenger and showDialog (available in build method)

## Steps

### Step 1: Move methods to SecondaryAppBarWidget
- Open `lib/features/dashboard/secondary_app_bar_widget.dart`
- Add three private methods to the `SecondaryAppBarWidget` class:
  - `void _incrementFinYear(BuildContext context, GlobalProvider globalProvider)`
  - `void _decrementFinYear(BuildContext context, GlobalProvider globalProvider)`
  - `Future<void> _showBranchSelector(BuildContext context, GlobalProvider globalProvider)`
- Copy the method implementations from `dashboard_page.dart`:
  - `_incrementFinYear` (lines 150-170)
  - `_decrementFinYear` (lines 172-192)
  - `_showBranchSelector` (lines 194-250)

### Step 2: Update SecondaryAppBarWidget to use internal methods
- Remove the three callback parameters from the constructor:
  - Remove `onIncrementFinYear`
  - Remove `onDecrementFinYear`
  - Remove `onBranchSelectorTap`
- Update the widget's build method to call internal methods instead of callbacks:
  - Replace `onDecrementFinYear` with `() => _decrementFinYear(context, globalProvider)`
  - Replace `onIncrementFinYear` with `() => _incrementFinYear(context, globalProvider)`
  - Replace `onBranchSelectorTap` with `() => _showBranchSelector(context, globalProvider)`
- Ensure `context` and `globalProvider` from the Consumer are accessible to the button callbacks

### Step 3: Update dashboard_page.dart
- Remove the callback parameters when instantiating `SecondaryAppBarWidget`:
  - Change from:
    ```dart
    SecondaryAppBarWidget(
      onIncrementFinYear: () => _incrementFinYear(...),
      onDecrementFinYear: () => _decrementFinYear(...),
      onBranchSelectorTap: () => _showBranchSelector(...),
    )
    ```
  - To:
    ```dart
    const SecondaryAppBarWidget()
    ```
- Remove the three methods from `dashboard_page.dart`:
  - Remove `_incrementFinYear` (lines 150-170)
  - Remove `_decrementFinYear` (lines 172-192)
  - Remove `_showBranchSelector` (lines 194-250)

### Step 4: Verify the refactoring
- Run `flutter analyze` to check for any errors
- Test the app to ensure:
  - Financial year increment works correctly
  - Financial year decrement works correctly
  - Boundary messages appear at first/last financial year
  - Branch selector dialog opens
  - Branch selection updates correctly
  - All UI behavior remains unchanged

## Files to be Modified
1. **Modified**: `lib/features/dashboard/secondary_app_bar_widget.dart` - Add three methods, remove callback parameters
2. **Modified**: `lib/features/dashboard/dashboard_page.dart` - Remove three methods, simplify widget instantiation

## Benefits
- **Self-contained widget**: SecondaryAppBarWidget is now fully independent
- **Better encapsulation**: Business logic for the app bar is contained within the widget
- **Reduced coupling**: Dashboard page no longer needs to know about app bar implementation details
- **Simplified dashboard**: ~100 lines of code removed from dashboard_page.dart
- **Easier reusability**: Widget can be used in other pages without callback wiring
- **Improved maintainability**: All app bar logic is in one place

## Technical Notes
- The widget will remain a StatelessWidget (no state management needed)
- Methods will have access to BuildContext and GlobalProvider via the Consumer in build()
- ScaffoldMessenger and showDialog will work correctly with the passed context
- No changes to GlobalProvider or other services required
