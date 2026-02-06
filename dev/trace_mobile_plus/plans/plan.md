# Plan: Fix login redirect when error_code e1011 (Access token signature expired) occurs

## Problem
When the server returns `error_code: e1011` with message "Unauthorized. Access token signature is expired", the app does **not** redirect to the login screen. The user remains stuck on the current screen with an error message instead of being taken back to login.

## Root Cause
The `_checkTokenExpiration()` method in `lib/services/graphql_service.dart` (lines 64-80) uses string pattern matching on the exception's `toString()` output to detect token expiration. It checks for:
- `"401"`, `"unauthorized"`, `"token expired"`, `"jwt expired"`, `"invalid token"`, `"token is invalid"`, `"authentication failed"`

However, the server error message is **"Unauthorized. Access token signature is expired"**. While `"unauthorized"` is present, the GraphQL exception may not always include the HTTP status text verbatim. More importantly, the error code `e1011` is not checked at all. The server also returns structured error data with `error_code` fields that are never inspected.

The safest fix is to add explicit checks for:
1. The error codes (`e1011`, `e1012`, `e1013`) used by the server for all token-related errors
2. The actual error message patterns (`"signature is expired"`, `"signature expired"`)
3. Structured error responses in `result.data` (not just `result.exception`)

---

## Step 1: Update `_checkTokenExpiration` in `graphql_service.dart` to detect e1011 and related errors

**File:** `lib/services/graphql_service.dart` (lines 64-80)

Add the following checks to the existing condition:

**In the exception string matching, add:**
- `'e1011'` — error code for expired token signature
- `'e1012'` — error code for invalid token signature
- `'e1013'` — error code for invalid token
- `'signature is expired'` — matches server message "Access token signature is expired"
- `'signature expired'` — matches customErrorCodes message "Access token signature expired"

**Also add a check on `result.data`** to catch structured error responses where the server returns error info inside the response data rather than as a GraphQL exception:

```dart
void _checkTokenExpiration(QueryResult result) {
  // Check structured error in response data
  if (result.data != null) {
    final dataString = result.data.toString().toLowerCase();
    if (dataString.contains('e1011') ||
        dataString.contains('e1012') ||
        dataString.contains('e1013')) {
      throw TokenExpiredException();
    }
  }

  // Check exception-based errors
  if (result.hasException) {
    final exception = result.exception;
    if (exception != null) {
      final errorString = exception.toString().toLowerCase();
      if (errorString.contains('401') ||
          errorString.contains('unauthorized') ||
          errorString.contains('token expired') ||
          errorString.contains('jwt expired') ||
          errorString.contains('invalid token') ||
          errorString.contains('token is invalid') ||
          errorString.contains('authentication failed') ||
          errorString.contains('e1011') ||
          errorString.contains('e1012') ||
          errorString.contains('e1013') ||
          errorString.contains('signature is expired') ||
          errorString.contains('signature expired')) {
        throw TokenExpiredException();
      }
    }
  }
}
```

---

## Step 2: Verify existing chain works end-to-end (no code changes, just verification)

Confirm these already-implemented components are correctly wired:

1. **`TokenExpiredException`** is thrown → `lib/core/exceptions/token_expired_exception.dart`
2. **All providers** catch `TokenExpiredException` and call `AuthService().handleTokenExpired()`:
   - `SalesProvider`, `TransactionsProvider`, `TrialBalanceProvider`
   - `BalanceSheetProvider`, `ProfitLossProvider`, `GeneralLedgerProvider`
   - `BusinessHealthProvider`, `ProductsProvider`
3. **`AuthService.handleTokenExpired()`** clears auth state → sets session message → navigates to login → `lib/services/auth_service.dart` (lines 150-174)
4. **`NavigationService.navigateToLogin()`** calls `_router?.go('/login')` → `lib/services/navigation_service.dart` (line 18)
5. **Login page** reads and displays session expired message → `lib/features/authentication/login_page.dart` (lines 39-46)

---

## Step 3: Test the fix

1. Login to the app and navigate to any data screen (e.g., Trial Balance, Sales)
2. Wait for the access token to expire on the server side (or manually invalidate it)
3. Trigger any data fetch action
4. **Expected:** App redirects to login screen with message "Your session has expired. Please login again."
5. **Previous behavior:** Error message displayed on-screen, user stuck on current page

---

## Summary of Changes

| File | Change |
|------|--------|
| `lib/services/graphql_service.dart` | Add `e1011`, `e1012`, `e1013`, `signature is expired`, `signature expired` to `_checkTokenExpiration()`. Add structured response data check for error codes. |

**Only one file needs modification.** The rest of the chain (exception → providers → auth service → navigation → login page) is already correctly implemented.
