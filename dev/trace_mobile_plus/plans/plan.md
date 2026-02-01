# Plan: Handle Expired Token and Redirect to Login

## Objective
When a query fails because of an expired token, redirect the user to the login page with a proper message.

---

## Step 1: Create a Token Expiration Exception Class

**File:** `lib/core/exceptions/token_expired_exception.dart` (new file)

Create a custom exception class to identify token expiration errors:
- Create `TokenExpiredException` class that extends `Exception`
- Include a user-friendly message property

---

## Step 2: Update GraphQL Service to Detect Token Expiration

**File:** `lib/services/graphql_service.dart`

Modify the GraphQL service to detect token expiration:
- Check for 401 status codes or token-related error messages in query results
- When token expiration is detected, throw `TokenExpiredException`
- Common indicators: HTTP 401, "token expired", "unauthorized", "jwt expired" error messages

---

## Step 3: Create a Global Navigation Service

**File:** `lib/services/navigation_service.dart` (new file)

Create a navigation service to handle global navigation:
- Use a GlobalKey<NavigatorState> to enable navigation from anywhere in the app
- Add method `navigateToLoginWithMessage(String message)` for redirecting with a message
- This allows services and providers to trigger navigation without BuildContext

---

## Step 4: Update Routes Configuration

**File:** `lib/core/routes.dart`

Update the router configuration:
- Use the navigation key from NavigationService
- Ensure the router can be accessed globally for token expiration redirects

---

## Step 5: Update Main Entry Point

**File:** `lib/main.dart`

Configure the app to use the navigation service:
- Initialize NavigationService
- Pass the navigator key to GoRouter

---

## Step 6: Create Session Expired Message Provider

**File:** `lib/providers/session_provider.dart` (new file)

Create a provider to manage session expiration state:
- Store session expiration message
- Clear message after it's shown
- Use this to pass the message from GraphQL service to login page

---

## Step 7: Update Auth Service for Token Expiration Handling

**File:** `lib/services/auth_service.dart`

Add method to handle token expiration:
- Add `handleTokenExpired()` method that:
  - Clears stored token
  - Clears auth state
  - Sets session expiration message
  - Triggers navigation to login page

---

## Step 8: Update All Providers to Handle Token Expiration

**Files:**
- `lib/providers/sales_provider.dart`
- `lib/providers/transactions_provider.dart`
- `lib/providers/trial_balance_provider.dart`
- `lib/providers/balance_sheet_provider.dart`
- `lib/providers/profit_loss_provider.dart`
- `lib/providers/general_ledger_provider.dart`
- `lib/providers/products_provider.dart`
- `lib/providers/business_health_provider.dart`
- `lib/providers/global_provider.dart`

For each provider:
- Catch `TokenExpiredException` in data fetching methods
- Call `AuthService.handleTokenExpired()` when caught
- Do not set local error message (navigation will handle it)

---

## Step 9: Update Login Page to Show Session Expired Message

**File:** `lib/features/authentication/login_page.dart`

Update login page to:
- Check for session expiration message on init
- Display the message using SnackBar or banner
- Clear the message after displaying

---

## Step 10: Add Provider to App's Provider Tree

**File:** `lib/main.dart`

Register the SessionProvider in the MultiProvider:
- Add SessionProvider to the provider list
- Ensure it's accessible throughout the app

---

## Summary of Changes

| Step | File | Type | Description |
|------|------|------|-------------|
| 1 | `lib/core/exceptions/token_expired_exception.dart` | New | Custom exception for token expiration |
| 2 | `lib/services/graphql_service.dart` | Modify | Detect and throw token expiration errors |
| 3 | `lib/services/navigation_service.dart` | New | Global navigation service |
| 4 | `lib/core/routes.dart` | Modify | Use navigation service key |
| 5 | `lib/main.dart` | Modify | Initialize navigation service |
| 6 | `lib/providers/session_provider.dart` | New | Session state management |
| 7 | `lib/services/auth_service.dart` | Modify | Add token expiration handler |
| 8 | Multiple providers | Modify | Catch and handle token expiration |
| 9 | `lib/features/authentication/login_page.dart` | Modify | Show expiration message |
| 10 | `lib/main.dart` | Modify | Register SessionProvider |

---

## Expected Behavior After Implementation

1. User is logged in and using the app
2. Token expires on the server side
3. User makes any query (e.g., fetches sales data)
4. GraphQL service detects 401/token expired error
5. AuthService clears all stored credentials
6. SessionProvider stores the expiration message
7. App navigates to login page
8. Login page displays: "Your session has expired. Please login again."
9. User logs in again and continues using the app
