# Plan: Fix General Ledger Loading Issue in APK

## Problem Summary
- Web application (https://pilot.cloudjiffy.net) displays account ledger correctly
- APK on physical device shows endless busy indicator when account is selected
- No ledger data is displayed in APK version
- **CRITICAL INFO:** All other API calls work fine in mobile - ONLY general ledger display API fails

## Key Insight
Since all other API calls work in the APK, we can rule out:
- ✓ Network/internet permissions (working)
- ✓ SSL certificates (working)
- ✓ Base URL configuration (working)
- ✓ General HTTP client setup (working)
- ✓ AndroidManifest.xml permissions (working)

**Focus Area:** Something specific to the general ledger API call or its response handling is failing

## Investigation and Fix Plan

### Step 1: Find and Review the General Ledger API Call
- Locate GeneralLedgerProvider file
- Find the specific method that fetches ledger data
- Identify the exact API endpoint being called
- Compare this API call with other working API calls to spot differences

### Step 2: Examine Error Handling in Ledger API Call
**This is the most likely culprit** - Check for:
- Missing try-catch block around the API call
- Catch block that doesn't dismiss busy indicator
- Silent error swallowing without logging
- Finally block missing to ensure busy indicator is dismissed
- Async/await issues causing unhandled exceptions

Example of what to look for:
```dart
// BAD - busy indicator never dismissed on error
Future<void> fetchLedger() async {
  setBusy(true);
  final response = await api.getLedger(); // If this throws, busy stays true
  _ledgerData = response;
  setBusy(false);
}

// GOOD - busy indicator always dismissed
Future<void> fetchLedger() async {
  try {
    setBusy(true);
    final response = await api.getLedger();
    _ledgerData = response;
  } catch (e) {
    // Handle error
  } finally {
    setBusy(false); // Always runs
  }
}
```

### Step 3: Check for Data Parsing Issues
Since other APIs work, check if ledger response has unique characteristics:
- Very large response payload (timeout during parsing)
- Nested JSON structure that fails to parse on mobile
- Date/datetime format that works in web but fails on mobile
- Null values not handled properly
- Response encoding issues (UTF-8, special characters)

### Step 4: Look for Platform-Specific Code
Search for any platform checks in the ledger loading code:
- `kIsWeb` conditional logic
- `Platform.isAndroid` or `Platform.isIOS` checks
- Different code paths for web vs mobile
- Commented out code that might affect mobile

### Step 5: Review Timeout Settings for This Specific API
Check if ledger API has:
- Custom timeout that's too short for mobile network
- Different timeout than other working APIs
- Large data response that needs longer timeout

### Step 6: Add Debug Logging to Ledger API Call
Add comprehensive logging around the ledger API call:
```dart
Future<void> fetchLedger(String accountId) async {
  print('DEBUG: Starting ledger fetch for account: $accountId');
  try {
    setBusy(true);
    print('DEBUG: Busy indicator set to true');
    print('DEBUG: Calling API endpoint...');

    final response = await api.getLedger(accountId);

    print('DEBUG: API call successful');
    print('DEBUG: Response received: ${response?.toString()?.substring(0, 100)}');

    _ledgerData = response;
    print('DEBUG: Ledger data set');
  } catch (e, stackTrace) {
    print('ERROR: Ledger fetch failed: $e');
    print('ERROR: Stack trace: $stackTrace');
  } finally {
    setBusy(false);
    print('DEBUG: Busy indicator set to false');
  }
  notifyListeners();
}
```

### Step 7: Compare with Working API Calls
- Find another working API call in the codebase (e.g., account list fetch)
- Compare the code structure with ledger API call
- Identify any differences in:
  - Error handling approach
  - Response parsing
  - State management
  - Async patterns

### Step 8: Check Response Handling and State Updates
- Verify `notifyListeners()` or `setState()` is called after API response
- Check if response data structure matches what the UI expects
- Look for null safety issues when accessing response data
- Ensure state variables are properly updated

### Step 9: Implement Fix Based on Root Cause
Most likely fixes:
1. **Add proper try-catch-finally** - Ensure busy indicator is always dismissed
2. **Fix data parsing** - Handle large or complex response structure
3. **Increase timeout** - If response is slow on mobile network
4. **Add null checks** - Handle missing or null response data
5. **Fix state management** - Ensure UI updates when data arrives

### Step 10: Test Fix
- Build debug APK with added logging
- Deploy to physical device
- Monitor logs using `flutter logs` or `adb logcat -s flutter`
- Select account and observe what happens
- Verify busy indicator dismisses in all scenarios

## Most Likely Root Causes (Priority Order)

### 1. Missing Error Handling (90% likelihood)
The ledger API call throws an exception that isn't caught, leaving busy indicator spinning forever.

**What to look for:**
- No try-catch around API call
- Catch block exists but doesn't dismiss busy indicator
- Exception happens during JSON parsing, not API call itself

### 2. Data Parsing Issue (70% likelihood)
Response structure causes parsing to fail or hang on mobile.

**What to look for:**
- Large JSON response
- Complex nested structure
- DateTime parsing issues
- Null values in response

### 3. State Management Bug (50% likelihood)
Provider/state not updating properly after API response.

**What to look for:**
- Missing `notifyListeners()` or `setState()`
- State updated but UI not rebuilding
- Conditional logic that skips state update on mobile

### 4. Timeout or Performance Issue (30% likelihood)
API call takes too long on mobile network.

**What to look for:**
- Custom short timeout
- Large data payload
- Multiple sequential API calls

## Files to Investigate (Priority Order)

1. **lib/providers/general_ledger_provider.dart** - Most likely location of the bug
2. **lib/features/accounts/general_ledger_page.dart** - UI and busy indicator logic
3. **lib/services/api/** - API call implementation
4. **lib/models/** - Response model classes that might have parsing issues

## Success Criteria

- Ledger displays correctly in APK on physical device
- Busy indicator dismisses in all scenarios (success, error, no network)
- No regression in web application
- Proper error messages shown to user when API fails
