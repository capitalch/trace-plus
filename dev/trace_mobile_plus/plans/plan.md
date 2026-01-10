# Plan: Fix Modal Account Selection Synchronization Issue

## Problem Summary
Based on tran.md analysis:
- In web application: Ledger of selected accounts displays properly when account is selected from modal
- In APK on physical device: When account is selected from modal, screen shows never-ending busy indicator
- **Test Finding**: When modal is bypassed (using direct button to show fixed account), ledger displays correctly
- **Conclusion**: Opening a modal and selecting an account gives a synchronization issue that doesn't happen with direct button click

## Root Cause Analysis
The issue is a race condition/context invalidation in the modal selection flow:
1. In `_onAccountSelected()` (account_selection_modal.dart), the modal is closed BEFORE calling `selectAccount()`
2. After `Navigator.of(context).pop()`, the modal context becomes invalid
3. The `selectAccount()` async operation is then called with potentially invalid context/provider reference
4. On Android devices, this prevents proper state propagation or causes the async operation to hang
5. The busy indicator in `isLoadingTransactions` never gets reset to false

## Implementation Plan

### Step 1: Analyze Current Modal Selection Flow
**Files to review:**
- lib/features/accounts/widgets/account_selection_modal.dart (lines 41-54)
- lib/providers/general_ledger_provider.dart (lines 201-214)

**Actions:**
- Document the exact sequence: clearSearch() → pop() → selectAccount()
- Identify why this order causes issues on mobile but not web
- Confirm the context/provider reference validity issue

### Step 2: Reorder Operations in Modal Selection
**File:** lib/features/accounts/widgets/account_selection_modal.dart

**Current problematic code (lines 41-54):**
```dart
void _onAccountSelected(AccountSelectionModel account) {
  widget.provider.clearSearch();
  Navigator.of(context).pop();
  widget.provider.selectAccount(account.id, account.accName, widget.globalProvider);
}
```

**Fix:** Call `selectAccount()` BEFORE closing modal, not after
- This ensures the operation happens while modal context is still valid
- The async operation will start with proper context
- State changes will propagate correctly

### Step 3: Add Async/Await Handling
**File:** lib/features/accounts/widgets/account_selection_modal.dart

**Changes to make:**
- Make `_onAccountSelected()` an async method
- Add proper await for the selection operation
- Add try-catch-finally error handling
- Ensure modal closes only after operation starts successfully
- Add mounted check before closing modal

**Implementation approach:**
- Change method signature to: `Future<void> _onAccountSelected(AccountSelectionModel account) async`
- Use await to ensure proper execution order
- Add `if (!mounted) return;` before Navigator.pop()

### Step 4: Add Loading State During Selection
**File:** lib/features/accounts/widgets/account_selection_modal.dart

**Actions:**
- Add `bool _isSelecting = false;` state variable in _AccountSelectionModalState
- Set this to true when selection starts
- Show loading indicator overlay in modal during selection
- Disable all account tiles while `_isSelecting` is true
- Prevent multiple simultaneous selections

**Benefits:**
- Visual feedback to user
- Prevents race conditions from multiple taps
- Clear indication that operation is in progress

### Step 5: Improve Error Handling in Provider
**File:** lib/providers/general_ledger_provider.dart

**Review and enhance:**
- Check `selectAccount()` method (lines 201-214)
- Ensure `notifyListeners()` is called at appropriate points
- Verify `_isLoadingTransactions` is always reset in finally block
- Add error state handling if fetchAccountLedger fails
- Consider adding a separate `_isSelecting` flag distinct from `_isLoadingTransactions`

### Step 6: Alternative Approach - Modal Result Pattern
**If Steps 2-5 don't resolve the issue completely:**

**File:** lib/features/accounts/widgets/account_selection_modal.dart
- Change modal to return AccountSelectionModel instead of calling selectAccount directly
- Modify `_onAccountSelected()` to just pop with the account: `Navigator.of(context).pop(account);`

**File:** lib/features/accounts/general_ledger_page.dart
- Modify `_openAccountSelectionModal()` to handle returned value
- Call `provider.selectAccount()` in the page context after modal closes
- This keeps all provider operations in the parent page's stable context

### Step 7: Update Modal Opening Logic
**File:** lib/features/accounts/general_ledger_page.dart

**If using alternative approach from Step 6:**
- Modify `_openAccountSelectionModal()` (lines 38-56)
- Add await to showDialog and capture result
- Call selectAccount with the result if not null
- Ensure proper async handling

**Example structure:**
```dart
Future<void> _openAccountSelectionModal() async {
  final result = await showDialog<AccountSelectionModel>(...);
  if (result != null && mounted) {
    await provider.selectAccount(result.id, result.accName, globalProvider);
  }
}
```

### Step 8: Add Debug Logging
**Files:**
- lib/features/accounts/widgets/account_selection_modal.dart
- lib/providers/general_ledger_provider.dart

**Add logging to track:**
- When account selection starts
- When modal closes
- When selectAccount is called
- When fetchAccountLedger starts/completes
- When isLoadingTransactions changes state

**Purpose:** Help identify exact point of failure during testing

### Step 9: Clean Up Debug Code
**File:** lib/features/accounts/general_ledger_page.dart

**Remove test code:**
- Delete `_openFixedAccount()` method (lines 58-65)
- Remove debug IconButton from appBar actions (lines 174-179)
- Remove any debugging print statements added in Step 8

### Step 10: Testing and Verification
**Test scenarios:**
1. **Web Application Testing:**
   - Select account from modal → verify ledger displays
   - Cancel modal → verify no errors
   - Select multiple different accounts → verify all work

2. **APK on Physical Device Testing:**
   - Build release/debug APK
   - Install on physical Android device
   - Select account from modal → verify no busy indicator hang
   - Verify ledger displays correctly
   - Test with slow network connection
   - Test rapid account switching
   - Test modal cancellation
   - Monitor logs for any errors

3. **Edge Cases:**
   - Network error during selection
   - Very large ledger data
   - Rapid tapping on accounts
   - Back button during loading
   - App background/foreground during operation

## Expected Outcome
- Account selection from modal works correctly on physical devices
- No never-ending busy indicator
- Ledger displays immediately after account selection
- Consistent behavior between web and mobile platforms
- Proper error messages if selection fails
- Clean, maintainable code without race conditions

## Files to Modify (In Order)
1. lib/features/accounts/widgets/account_selection_modal.dart (primary fix location)
2. lib/providers/general_ledger_provider.dart (error handling improvements)
3. lib/features/accounts/general_ledger_page.dart (cleanup and possible alternative approach)

## Priority
**HIGH** - Critical bug blocking core functionality on mobile devices

## Recommended Approach
Start with Steps 2-5 (reorder operations, add async/await, loading state, error handling).
Only move to Step 6 (alternative modal result pattern) if the simpler fix doesn't resolve the issue.
