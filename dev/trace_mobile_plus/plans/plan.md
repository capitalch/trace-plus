# Plan: Implement Secure Token Storage with flutter_secure_storage

## Overview
Implement secure token storage using flutter_secure_storage to persist authentication tokens on successful login, clear them on logout, and automatically include them in protected API calls.

## Step 1: Add flutter_secure_storage dependency
- Add `flutter_secure_storage` package to pubspec.yaml dependencies
- Run `flutter pub get` to install the package
- Configure platform-specific settings if required (Android minSdkVersion, iOS keychain)

## Step 2: Create TokenStorageService
- Create file: `lib/services/token_storage_service.dart`
- Create `TokenStorageService` class
- Add private `FlutterSecureStorage` instance
- Implement methods:
  - `Future<void> saveToken(String token)` - Save access token to secure storage
  - `Future<String?> getToken()` - Retrieve token from secure storage
  - `Future<void> deleteToken()` - Remove token from secure storage on logout
  - `Future<bool> hasToken()` - Check if token exists in storage
- Add constants for storage keys (e.g., 'access_token')

## Step 3: Update AuthService to integrate token storage
- Import `TokenStorageService` in `lib/services/auth_service.dart`
- Add `TokenStorageService` instance to AuthService
- In `login` method:
  - After successful login response, extract accessToken
  - Call `TokenStorageService.saveToken(accessToken)` to persist token
  - Update `_accessToken` variable with the token
- In `logout` method:
  - Call `TokenStorageService.deleteToken()` to clear stored token
  - Clear `_accessToken` variable
  - Clear user data
- Add `Future<void> loadStoredToken()` method:
  - Check if token exists using `TokenStorageService.hasToken()`
  - If exists, load token using `TokenStorageService.getToken()`
  - Set `_accessToken` with loaded token
- Add getter `bool get isAuthenticated` to check if token exists

## Step 4: Update LoginPage to handle token persistence
- Modify `lib/features/authentication/login_page.dart`
- In `_handleLogin` method:
  - After successful login (token is saved in AuthService)
  - Navigate to dashboard
  - Handle any token storage errors with appropriate error messages
- Add error handling for storage failures

## Step 5: Load persisted token on app startup
- Modify main app initialization (likely in `main.dart` or app root)
- Before MaterialApp builds, call `AuthService.loadStoredToken()`
- Determine initial route based on authentication state:
  - If token exists: Navigate to dashboard
  - If no token: Show login page
- Implement splash screen or loading indicator during token check

## Step 6: Test the implementation
- Test login flow:
  - Login with valid credentials
  - Verify token is saved to secure storage
  - Verify navigation to dashboard
- Test token persistence:
  - Close and restart the app
  - Verify user remains logged in
  - Verify dashboard loads automatically
- Test logout flow:
  - Click logout
  - Verify token is deleted from storage
  - Verify navigation to login page
- Verify token is stored securely and can be accessed when needed

## Technical Considerations
- **Security**: flutter_secure_storage uses Keychain on iOS and EncryptedSharedPreferences on Android
- **Error Handling**: Handle storage exceptions (platform-specific issues)
- **Token Format**: Ensure token is stored and retrieved as plain string
- **Async Operations**: All storage operations are async, handle with await/then
- **State Management**: Update app state when token is loaded/cleared
- **Navigation**: Ensure proper navigation flow based on auth state
