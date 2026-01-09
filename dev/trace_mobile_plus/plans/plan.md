# Plan: Auto-Open Account Selection Modal in General Ledger Page

## Overview
Automatically show the account selection modal when the General Ledger page opens, without requiring the user to click the "Select Account" button.

## Current Implementation Analysis

**File:** `lib/features/accounts/general_ledger_page.dart`

**Current Flow:**
1. User navigates from Accounts Options page to General Ledger page (line 116 in accounts_options_page.dart)
2. GeneralLedgerPage loads and `initState()` runs (lines 21-28)
3. In `initState()`, `provider.clearSelection()` is called to reset state
4. Page shows empty state with "Select Account" button (lines 188-214)
5. User must manually click either:
   - App bar icon button (lines 146-150), OR
   - "Select Account" button in empty state (lines 207-211)
6. Both buttons call `_openAccountSelectionModal()` (lines 30-43)
7. Modal is displayed using `showDialog()` with AccountSelectionModal widget

**Key Components:**
- `_openAccountSelectionModal()`: Shows the account selection dialog
- `AccountSelectionModal`: The modal widget with search and account list
- `GeneralLedgerProvider`: Manages account selection and ledger data
- `GlobalProvider`: Provides global app state (unit, branch, etc.)

## Implementation Plan

### Step 1: Modify initState to Auto-Show Modal
**File:** `lib/features/accounts/general_ledger_page.dart`

**Location:** Lines 20-28 (initState method)

**Changes:**
- Add flag to track if this is first load vs returning to page
- Call `_openAccountSelectionModal()` automatically after clearing selection
- Use `WidgetsBinding.instance.addPostFrameCallback()` to ensure widget tree is built before showing dialog

**Implementation:**
```dart
@override
void initState() {
  super.initState();
  // Clear selection to start fresh every time
  WidgetsBinding.instance.addPostFrameCallback((_) {
    final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
    provider.clearSelection();

    // Auto-open account selection modal
    _openAccountSelectionModal();
  });
}
```

### Step 2: Handle Edge Cases

**Consider the following scenarios:**

**A. User presses back/cancel on modal**
- Modal closes normally
- User sees empty state
- Can click button to reopen modal
- **Action:** No code changes needed - existing behavior is acceptable

**B. User selects an account**
- Modal closes
- Ledger data loads and displays
- **Action:** No code changes needed - existing flow handles this

**C. User navigates away and returns**
- Page reinitializes and clears selection
- Modal shows again automatically
- **Action:** This is desired behavior based on current design

**D. Network error when loading accounts in modal**
- Modal shows error state with retry button
- User can retry or cancel
- **Action:** No code changes needed - AccountSelectionModal handles this

**E. User rapidly navigates to page multiple times**
- Could cause multiple modals to stack
- **Action:** Add check to prevent showing modal if already displayed (Step 3)

### Step 3: Prevent Multiple Modal Instances (Optional Enhancement)

**File:** `lib/features/accounts/general_ledger_page.dart`

**Add State Variable:**
```dart
class _GeneralLedgerPageState extends State<GeneralLedgerPage> {
  bool _isModalShown = false;

  // ... rest of code
}
```

**Update initState:**
```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!_isModalShown) {
      final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
      provider.clearSelection();
      _isModalShown = true;
      _openAccountSelectionModal();
    }
  });
}
```

**Update _openAccountSelectionModal:**
```dart
void _openAccountSelectionModal() {
  final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
  final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

  showDialog(
    context: context,
    builder: (BuildContext dialogContext) {
      return AccountSelectionModal(
        provider: provider,
        globalProvider: globalProvider,
      );
    },
  ).then((_) {
    // Reset flag when modal closes
    setState(() {
      _isModalShown = false;
    });
  });
}
```

### Step 4: Update Empty State UI (Optional)

**File:** `lib/features/accounts/general_ledger_page.dart`

**Location:** Lines 188-214 (_buildEmptyState method)

**Consideration:**
Since modal auto-opens, the empty state might never be visible on first load. However, keep the button for cases where:
- User cancels the modal
- User wants to change account after viewing ledger

**Action:** No changes required - keep existing empty state as fallback

### Step 5: Keep App Bar Icon Button

**File:** `lib/features/accounts/general_ledger_page.dart`

**Location:** Lines 146-150

**Action:** Keep the existing app bar icon button to allow users to:
- Change accounts after initial selection
- Reopen modal if they closed it accidentally

No changes needed.

## Testing Plan

### Test Case 1: Normal Flow - First Load
1. Navigate from Accounts page to General Ledger
2. **Expected:** Account selection modal appears automatically
3. Search and select an account
4. **Expected:** Modal closes, ledger data loads and displays

### Test Case 2: Cancel Modal
1. Navigate to General Ledger page
2. **Expected:** Modal appears automatically
3. Press "Cancel" button
4. **Expected:** Modal closes, empty state shows with "Select Account" button
5. Click "Select Account" button
6. **Expected:** Modal reopens successfully

### Test Case 3: App Bar Button
1. Complete Test Case 1 (have account selected)
2. Click app bar wallet icon
3. **Expected:** Modal reopens, can select different account
4. Select different account
5. **Expected:** Ledger refreshes with new account data

### Test Case 4: Navigation Back and Return
1. Navigate to General Ledger page
2. **Expected:** Modal appears
3. Select an account
4. **Expected:** Ledger displays
5. Press back button to Accounts page
6. Navigate to General Ledger page again
7. **Expected:** Modal appears automatically again

### Test Case 5: Network Error
1. Disconnect internet/network
2. Navigate to General Ledger page
3. **Expected:** Modal appears, shows loading, then error state
4. Press "Retry" button
5. Reconnect internet
6. **Expected:** Accounts list loads successfully

### Test Case 6: Search and Select
1. Navigate to General Ledger page
2. **Expected:** Modal appears
3. Type in search field
4. **Expected:** Accounts list filters
5. Select filtered account
6. **Expected:** Modal closes, ledger for that account displays

### Test Case 7: Empty Accounts List
1. Navigate to General Ledger with no accounts in system
2. **Expected:** Modal appears showing "No accounts available"
3. Press "Cancel"
4. **Expected:** Returns to empty state

## Files to Modify

1. **lib/features/accounts/general_ledger_page.dart**
   - Modify `initState()` method (lines 20-28)
   - Optionally add `_isModalShown` state flag
   - Optionally update `_openAccountSelectionModal()` to handle flag

## Files to Review (No Changes)

1. **lib/features/accounts/widgets/account_selection_modal.dart**
   - Already handles all modal logic correctly
   - No changes needed

2. **lib/providers/general_ledger_provider.dart**
   - Review to ensure clearSelection() works as expected
   - No changes anticipated

## Risks and Considerations

### Low Risk
- **Auto-showing modal might surprise users initially**
  - Mitigation: This matches user request and reduces clicks

- **Modal could show even when user doesn't want it**
  - Mitigation: Easy to cancel, and necessary for the feature

### Medium Risk
- **Multiple modal instances if navigation is rapid**
  - Mitigation: Implement Step 3 (flag to prevent multiple instances)

### No Risk
- **Existing functionality preserved**
  - All existing buttons and flows remain functional
  - Only adding automatic trigger, not removing manual options

## Summary

**Minimal Implementation (Step 1 only):**
- Add 3 lines of code to auto-call `_openAccountSelectionModal()` in `initState()`
- Testing required: Test Cases 1-7

**Enhanced Implementation (Steps 1-3):**
- Add state flag to prevent multiple modal instances
- More robust handling of edge cases
- Testing required: Test Cases 1-7 plus rapid navigation tests

**Recommended Approach:**
Start with Step 1 (minimal implementation) since Flutter's showDialog already has built-in safeguards. Add Step 3 only if testing reveals issues with multiple modals.
