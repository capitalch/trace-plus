# Persist AppSettings in Secure Storage Plan

## Overview
Persist AppSettings data in secure storage similar to token storage. This ensures that when users have a valid token and bypass login screen to reach dashboard, AppSettings will be properly populated from stored data. This provides a complete authentication state restoration on app restart.

## Step 1: Add AppSettings storage methods to TokenStorageService
- Modify `lib/services/token_storage_service.dart`
- Add storage key constant: `static const String _appSettingsKey = 'app_settings'`
- Add method `Future<void> saveAppSettings(Map<String, dynamic> appSettingsData)`
  - Convert appSettingsData to JSON string
  - Store using `_storage.write(key: _appSettingsKey, value: jsonString)`
  - Handle exceptions with proper error messages
- Add method `Future<Map<String, dynamic>?> getAppSettings()`
  - Read from storage using `_storage.read(key: _appSettingsKey)`
  - Parse JSON string back to Map<String, dynamic>
  - Return null if no data exists or on error
- Add method `Future<void> deleteAppSettings()`
  - Remove AppSettings from storage using `_storage.delete(key: _appSettingsKey)`
  - Handle exceptions with proper error messages
- Add method `Future<bool> hasAppSettings()`
  - Check if AppSettings data exists in storage
  - Return true if exists and not empty, false otherwise

## Step 2: Create helper method to convert AppSettings to Map
- In `lib/services/auth_service.dart`, create private method `Map<String, dynamic> _appSettingsToMap()`
- This method will create a Map containing all AppSettings values:
  - 'uid': AppSettings.uid
  - 'userName': AppSettings.userName
  - 'userEmail': AppSettings.userEmail
  - 'clientId': AppSettings.clientId
  - 'clientName': AppSettings.clientName
  - 'clientCode': AppSettings.clientCode
  - 'userType': AppSettings.userType
  - 'isUserActive': AppSettings.isUserActive
  - 'isClientActive': AppSettings.isClientActive
  - 'dbName': AppSettings.dbName
  - 'isExternalDb': AppSettings.isExternalDb
  - 'dbParams': AppSettings.dbParams
  - 'branchIds': AppSettings.branchIds
  - 'lastUsedBuId': AppSettings.lastUsedBuId
  - 'lastUsedBranchId': AppSettings.lastUsedBranchId
  - 'lastUsedFinYearId': AppSettings.lastUsedFinYearId
  - 'allBusinessUnits': AppSettings.allBusinessUnits.map((bu) => bu.toJson()).toList()
  - 'userBusinessUnits': AppSettings.userBusinessUnits.map((bu) => bu.toJson()).toList()
- Return this Map for storage

## Step 3: Create helper method to load AppSettings from Map
- In `lib/services/auth_service.dart`, create private method `void _loadAppSettingsFromMap(Map<String, dynamic> data)`
- This method will populate AppSettings from the stored Map:
  - AppSettings.uid = data['uid'] as String?
  - AppSettings.userName = data['userName'] as String?
  - AppSettings.userEmail = data['userEmail'] as String?
  - AppSettings.clientId = data['clientId'] as int?
  - AppSettings.clientName = data['clientName'] as String?
  - AppSettings.clientCode = data['clientCode'] as String?
  - AppSettings.userType = data['userType'] as String?
  - AppSettings.isUserActive = data['isUserActive'] as bool?
  - AppSettings.isClientActive = data['isClientActive'] as bool?
  - AppSettings.dbName = data['dbName'] as String?
  - AppSettings.isExternalDb = data['isExternalDb'] as bool?
  - AppSettings.dbParams = data['dbParams'] as String?
  - AppSettings.branchIds = data['branchIds'] as String?
  - AppSettings.lastUsedBuId = data['lastUsedBuId'] as int?
  - AppSettings.lastUsedBranchId = data['lastUsedBranchId'] as int?
  - AppSettings.lastUsedFinYearId = data['lastUsedFinYearId'] as int?
  - Parse and restore allBusinessUnits from JSON
  - Parse and restore userBusinessUnits from JSON

## Step 4: Save AppSettings to secure storage after login
- Modify `_setAppSettingsFromLoginResponse` method in `lib/services/auth_service.dart`
- After setting all AppSettings values (at the end of the method)
- Add code to save AppSettings to secure storage:
  - Create Map using `_appSettingsToMap()`
  - Call `await _tokenStorage.saveAppSettings(appSettingsMap)`
  - Handle any storage exceptions with proper error logging

## Step 5: Load AppSettings from secure storage on token load
- Modify `loadStoredToken` method in `lib/services/auth_service.dart`
- After loading the token successfully (around line 56-57)
- Add code to load AppSettings from storage:
  - Call `final appSettingsData = await _tokenStorage.getAppSettings()`
  - If appSettingsData is not null, call `_loadAppSettingsFromMap(appSettingsData)`
  - Handle any exceptions with proper error logging
  - This ensures AppSettings is populated when app restarts with valid token

## Step 6: Delete AppSettings from secure storage on logout
- Modify `_clearAppSettings` method in `lib/services/auth_service.dart`
- After clearing all AppSettings fields (at the end of the method)
- Add code to delete AppSettings from storage:
  - Call `await _tokenStorage.deleteAppSettings()`
  - Handle any storage exceptions with proper error logging
  - This ensures AppSettings data is removed from storage when user logs out

## Step 7: Update logout method to be async
- The `_clearAppSettings` method needs to be async since it now calls async storage operations
- Change `_clearAppSettings()` to `Future<void> _clearAppSettings() async`
- Update all calls to `_clearAppSettings()` to use `await`
- In `logout` method: `await _clearAppSettings()`
- In `clear` method: Make `clear()` async and use `await _clearAppSettings()`

## Step 8: Test the implementation
- Test login and app restart flow:
  - Login with valid credentials
  - Verify AppSettings are saved to secure storage
  - Close and restart the app
  - Verify user is automatically logged in (token restored)
  - Verify AppSettings fields are populated correctly (userName, clientName, etc.)
  - Verify business units are loaded from storage
  - Verify dashboard displays correct user information
- Test logout and app restart flow:
  - After login, logout
  - Verify AppSettings are deleted from secure storage
  - Close and restart the app
  - Verify user is at login screen (no token)
  - Verify AppSettings are empty/null
- Test error handling:
  - Verify graceful handling of storage exceptions
  - Verify app doesn't crash if AppSettings can't be loaded
