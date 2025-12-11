# Flutter Login - React Client Feature Parity Plan

**Date**: 2025-12-07
**Purpose**: Implement login functionality in Flutter that matches the React client
**React Client Path**: C:\projects\trace-plus\dev\trace-client\src\features\login

---

## 1. Current State Analysis

### React Client Login Features

#### 1.1 UI Components
- **Client Selection**: AsyncSelect (react-select) with typeahead/autocomplete
  - Minimum 2 characters required to trigger search
  - Debounced search (1200ms delay)
  - Shows `clientName` as label
  - Uses `id` as value
  - Clearable dropdown

- **Username/Email Field**:
  - Accepts both UID or Email
  - Placeholder: "accounts@gmail.com"
  - Minimum 4 characters validation
  - Custom validator: `checkUserNameOrEmail`
  - Pre-filled default: 'capital'

- **Password Field**:
  - Minimum 8 characters validation
  - Custom validator: `checkPassword`
  - Pre-filled default: 'tr@ce123'

- **Additional Features**:
  - "Forgot Password" link
  - Test sign-in buttons for quick testing:
    - Super Admin
    - Admin
    - Business User
  - App version display
  - Loading indicators

#### 1.2 API Integration

**Client Search**:
```typescript
POST /api/login-clients
Body: { criteria: string }
Response: Array<{ id: number, clientName: string }>
```

**Login**:
```typescript
POST /api/login
Headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' }
Body (form data): {
  clientId: number,
  username: string,  // Can be UID or Email
  password: string   // Plain text
}
Response: {
  accessToken: string,
  payload: {
    allBusinessUnits: BusinessUnitType[],
    allSecuredControls: SecuredControlType[],
    role: RoleType,
    userBusinessUnits: BusinessUnitType[],
    userDetails: UserDetailsType,
    userSecuredControls: SecuredControlType[]
  }
}
```

#### 1.3 Data Models (TypeScript)

**UserDetailsType**:
```typescript
{
  branchIds?: String
  clientCode?: string
  clientId?: number
  clientName?: string
  dbName?: string
  dbParams?: string
  decodedDbParamsObject?: { [key: string]: string | undefined }
  hash?: string
  id?: number
  isUserActive?: boolean
  isClientActive?: boolean
  isExternalDb?: boolean
  lastUsedBranchId?: number
  lastUsedBuId?: number
  lastUsedFinYearId?: number
  mobileNo?: string
  uid?: string
  userEmail?: string
  userName?: string
  userType?: 'S' | 'A' | 'B' | undefined
}
```

**BusinessUnitType**:
```typescript
{
  buCode?: string
  buId?: number
  buName?: string
}
```

**SecuredControlType**:
```typescript
{
  controlName?: string
  controlNo?: number
  controlType?: string
  descr?: string
  id?: number
}
```

**RoleType**:
```typescript
{
  clientId?: number
  roleId?: number
  roleName?: string
}
```

#### 1.4 State Management (Redux)

**Login State**:
```typescript
{
  accSettings?: AccSettingType[]
  allBranches?: BranchType[]
  allBusinessUnits?: BusinessUnitType[]
  allFinYears?: FinYearType[]
  allSecuredControls?: SecuredControlType[]
  currentBranch?: BranchType
  currentBusinessUnit?: BusinessUnitType
  currentDateFormat?: string
  currentFinYear?: FinYearType
  isLoggedIn: boolean
  role?: RoleType
  token: string | undefined
  userBusinessUnits?: BusinessUnitType[]
  userDetails?: UserDetailsType
  userSecuredControls?: SecuredControlType[]
}
```

#### 1.5 Post-Login Flow

1. Store accessToken
2. Decode and store external DB params if `isExternalDb === true`
3. Dispatch `doLogin` action with payload
4. Navigate to home screen
5. Fetch additional data (finYears, branches, account settings)

---

## 2. Flutter Current Implementation

### 2.1 Existing Features ✅
- ✅ Client autocomplete dropdown (using built-in Autocomplete widget)
- ✅ Shows all clients initially, filters on typing
- ✅ Username field
- ✅ Password field
- ✅ Loading indicators (during client load and login)
- ✅ Remember last used client
- ✅ Form validation
- ✅ Error handling with user-friendly messages
- ✅ REST API integration with http package

### 2.2 Missing Features ❌
- ❌ Minimum character requirement for client search (currently shows all)
- ❌ Debounced search (currently instant)
- ❌ Accepts Email as alternative to UID
- ❌ Test sign-in shortcuts
- ❌ App version display
- ❌ Comprehensive user data storage:
  - ❌ allBusinessUnits
  - ❌ allSecuredControls
  - ❌ userSecuredControls
  - ❌ role details
  - ❌ External DB params handling
- ❌ Password strength validation (min 8 chars)
- ❌ Username/email format validation (min 4 chars)

### 2.3 Differences in Implementation

| Feature | React Client | Flutter Current | Status |
|---------|-------------|-----------------|--------|
| Client Search | Minimum 2 chars, debounced | Show all, instant filter | ⚠️ Different |
| Username Field | UID or Email | UID only | ⚠️ Limited |
| Client Dropdown | AsyncSelect | Autocomplete | ✅ Equivalent |
| Login Response | Full payload parsing | Partial parsing | ⚠️ Incomplete |
| State Storage | Redux (complex) | GlobalSettings (simple) | ⚠️ Different |
| Test Sign-in | Implemented | Not implemented | ❌ Missing |

---

## 3. Implementation Plan

### Phase 1: Enhance Client Search (Priority: Medium)

#### 1.1 Add Minimum Character Requirement
**File**: `lib/features/authentication/login_page.dart`

```dart
// In Autocomplete optionsBuilder
optionsBuilder: (TextEditingValue textEditingValue) {
  // Only show options if user has typed at least 2 characters
  if (textEditingValue.text.length < 2) {
    return const Iterable<Client>.empty();
  }

  // Trigger API call with criteria
  // ... existing filter logic
}
```

**Changes**:
- Add helper text: "Type 2 characters to search clients"
- Show empty dropdown until minimum chars typed

#### 1.2 Implement Debounced Search (Optional)
**Dependencies**: Add `rxdart` package for debouncing

```dart
// Create a debounced stream for search
final _clientSearchController = StreamController<String>();

@override
void initState() {
  super.initState();

  _clientSearchController.stream
    .debounceTime(Duration(milliseconds: 1200))
    .listen((criteria) async {
      await _searchClients(criteria);
    });
}
```

**Note**: Current implementation (instant filter) works well for small client lists. Debouncing only needed if:
- Client list is very large (>1000)
- API calls are slow
- Server load is a concern

### Phase 2: Enhance Form Validation (Priority: High)

#### 2.1 Update Username Field
**File**: `lib/features/authentication/login_page.dart`

```dart
TextField(
  controller: _usernameController,
  decoration: const InputDecoration(
    border: OutlineInputBorder(),
    labelText: 'UID / Email',
    hintText: 'accounts@gmail.com',
    helperText: 'Enter your UID or Email (min 4 characters)',
    prefixIcon: Icon(Icons.person),
  ),
  onChanged: (value) {
    // Validate on change
    if (value.length > 0 && value.length < 4) {
      // Show error
    }
  },
)
```

#### 2.2 Add Password Validation
```dart
TextField(
  controller: _passwordController,
  decoration: InputDecoration(
    border: OutlineInputBorder(),
    labelText: 'Password',
    helperText: 'Minimum 8 characters required',
    errorText: _passwordError,
    prefixIcon: Icon(Icons.lock),
  ),
  onChanged: (value) {
    setState(() {
      _passwordError = value.length < 8 && value.isNotEmpty
          ? 'Password must be at least 8 characters'
          : null;
    });
  },
)
```

#### 2.3 Create Validators
**New File**: `lib/utils/validators.dart`

```dart
class Validators {
  static String? validateUserNameOrEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Required';
    }
    if (value.length < 4) {
      return 'Minimum 4 characters required';
    }
    // Could add email format validation
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Required';
    }
    if (value.length < 8) {
      return 'Minimum 8 characters required';
    }
    return null;
  }
}
```

### Phase 3: Expand Login Response Parsing (Priority: High)

#### 3.1 Update LoginResponse Model
**File**: `lib/models/login_response.dart`

Add missing fields to match React client:

```dart
class LoginResponse {
  // Existing fields
  final int clientId;
  final int id;
  final String uid;
  final String token;
  final String userType;
  final int? lastUsedBranchId;
  final String? lastUsedBuCode;
  final List<String> buCodes;
  final List<BuCodeWithPermission> buCodesWithPermissions;

  // New fields to add
  final List<BusinessUnit> allBusinessUnits;
  final List<SecuredControl> allSecuredControls;
  final List<SecuredControl> userSecuredControls;
  final Role? role;
  final UserDetailsExtended userDetailsExtended;

  // ... constructors and methods
}
```

#### 3.2 Create New Models
**File**: `lib/models/business_unit.dart`
```dart
class BusinessUnit {
  final int? buId;
  final String? buCode;
  final String? buName;

  BusinessUnit({
    this.buId,
    this.buCode,
    this.buName,
  });

  factory BusinessUnit.fromJson(Map<String, dynamic> json) {
    return BusinessUnit(
      buId: json['buId'] as int?,
      buCode: json['buCode'] as String?,
      buName: json['buName'] as String?,
    );
  }
}
```

**File**: `lib/models/secured_control.dart`
```dart
class SecuredControl {
  final int? id;
  final int? controlNo;
  final String? controlName;
  final String? controlType;
  final String? descr;

  SecuredControl({
    this.id,
    this.controlNo,
    this.controlName,
    this.controlType,
    this.descr,
  });

  factory SecuredControl.fromJson(Map<String, dynamic> json) {
    return SecuredControl(
      id: json['id'] as int?,
      controlNo: json['controlNo'] as int?,
      controlName: json['controlName'] as String?,
      controlType: json['controlType'] as String?,
      descr: json['descr'] as String?,
    );
  }
}
```

**File**: `lib/models/role.dart`
```dart
class Role {
  final int? clientId;
  final int? roleId;
  final String? roleName;

  Role({
    this.clientId,
    this.roleId,
    this.roleName,
  });

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      clientId: json['clientId'] as int?,
      roleId: json['roleId'] as int?,
      roleName: json['roleName'] as String?,
    );
  }
}
```

#### 3.3 Update AuthService
**File**: `lib/services/auth_service.dart`

```dart
Future<LoginResponse> login(LoginRequest request) async {
  // ... existing code ...

  if (response.statusCode == 200) {
    final jsonData = json.decode(response.body);
    final accessToken = jsonData['accessToken'] as String;
    final payload = jsonData['payload'] as Map<String, dynamic>;

    // Parse all data from payload
    final userDetails = payload['userDetails'] as Map<String, dynamic>;
    final userBusinessUnits = payload['userBusinessUnits'] as List<dynamic>?;
    final allBusinessUnits = payload['allBusinessUnits'] as List<dynamic>?;
    final allSecuredControls = payload['allSecuredControls'] as List<dynamic>?;
    final userSecuredControls = payload['userSecuredControls'] as List<dynamic>?;
    final role = payload['role'] as Map<String, dynamic>?;

    return LoginResponse(
      clientId: request.clientId,
      id: userDetails['id'] as int,
      uid: userDetails['userName'] as String,
      token: accessToken,
      userType: userDetails['userType'] as String,
      lastUsedBranchId: userDetails['lastUsedBranchId'] as int?,
      lastUsedBuCode: userDetails['lastUsedBuCode'] as String?,

      // New comprehensive data
      buCodes: userBusinessUnits?.map((e) => e['buCode'] as String).toList() ?? [],
      buCodesWithPermissions: userBusinessUnits?.map((e) =>
        BuCodeWithPermission.fromJson(e)
      ).toList() ?? [],

      allBusinessUnits: allBusinessUnits?.map((e) =>
        BusinessUnit.fromJson(e)
      ).toList() ?? [],

      allSecuredControls: allSecuredControls?.map((e) =>
        SecuredControl.fromJson(e)
      ).toList() ?? [],

      userSecuredControls: userSecuredControls?.map((e) =>
        SecuredControl.fromJson(e)
      ).toList() ?? [],

      role: role != null ? Role.fromJson(role) : null,

      userDetailsExtended: UserDetailsExtended.fromJson(userDetails),
    );
  }
}
```

### Phase 4: Enhanced Global Settings (Priority: High)

#### 4.1 Update GlobalSettings
**File**: `lib/common/classes/global_settings.dart`

Add new properties to store comprehensive login data:

```dart
class GlobalSettings extends ChangeNotifier {
  // Existing properties
  int? clientId, lastUsedBranchId, id, lastUsedClientId;
  String? lastUsedBuCode, token, uid, userType;
  List<dynamic>? buCodes = [];
  List<dynamic>? buCodesWithPermissions;

  // New properties to add
  List<BusinessUnit>? allBusinessUnits;
  List<SecuredControl>? allSecuredControls;
  List<SecuredControl>? userSecuredControls;
  Role? role;
  UserDetailsExtended? userDetailsExtended;

  // External DB support
  Map<String, String>? decodedDbParamsObject;
  bool isExternalDb = false;

  // Methods to add
  Future<void> decodeAndSetExternalDbParams(String? dbParams) async {
    if (dbParams != null && dbParams.isNotEmpty) {
      // Decode base64 and decrypt if needed
      decodedDbParamsObject = await Utils.decodeExtDbParams(dbParams);
      notifyListeners();
    }
  }

  void setComprehensiveLoginData(LoginResponse response) {
    // Set all data from response
    clientId = response.clientId;
    id = response.id;
    uid = response.uid;
    token = response.token;
    userType = response.userType;
    lastUsedBranchId = response.lastUsedBranchId;
    lastUsedBuCode = response.lastUsedBuCode;
    buCodes = response.buCodes;
    buCodesWithPermissions = response.buCodesWithPermissions;

    // New comprehensive data
    allBusinessUnits = response.allBusinessUnits;
    allSecuredControls = response.allSecuredControls;
    userSecuredControls = response.userSecuredControls;
    role = response.role;
    userDetailsExtended = response.userDetailsExtended;

    // Handle external DB
    if (response.userDetailsExtended.isExternalDb ?? false) {
      decodeAndSetExternalDbParams(response.userDetailsExtended.dbParams);
    }

    // Save to secure storage
    await saveLoginDataToSecureStorage();
    notifyListeners();
  }
}
```

### Phase 5: Add Test Sign-In (Priority: Low, Development Only)

#### 5.1 Add Test Buttons to Login Page
**File**: `lib/features/authentication/login_page.dart`

```dart
// Only show in debug mode
if (kDebugMode) ...[
  const SizedBox(height: 20),
  const Text('Quick Test Sign-In:', style: TextStyle(fontSize: 12)),
  const SizedBox(height: 8),
  Row(
    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
    children: [
      TextButton(
        onPressed: () => _fillTestCredentials('superAdmin', 'superadmin@123'),
        child: const Text('Super Admin', style: TextStyle(fontSize: 11)),
      ),
      TextButton(
        onPressed: () => _fillTestCredentials('capital', 'su\$hant123'),
        child: const Text('Admin', style: TextStyle(fontSize: 11)),
      ),
      TextButton(
        onPressed: () => _fillTestCredentials('testuser', 'test@123'),
        child: const Text('Business User', style: TextStyle(fontSize: 11)),
      ),
    ],
  ),
],

// Method to fill credentials
void _fillTestCredentials(String username, String password) {
  setState(() {
    _usernameController.text = username;
    _passwordController.text = password;
  });
}
```

### Phase 6: Add App Version Display (Priority: Low)

#### 6.1 Add package_info_plus
**File**: `pubspec.yaml`

```yaml
dependencies:
  package_info_plus: ^8.0.0
```

#### 6.2 Display Version
**File**: `lib/features/authentication/login_page.dart`

```dart
// At top of build method
FutureBuilder<PackageInfo>(
  future: PackageInfo.fromPlatform(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return const SizedBox.shrink();
    return Align(
      alignment: Alignment.topRight,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Text(
          'Trace v${snapshot.data!.version}',
          style: const TextStyle(
            fontSize: 10,
            color: Colors.grey,
          ),
        ),
      ),
    );
  },
),
```

---

## 4. Priority Matrix

| Feature | Priority | Complexity | Impact | Timeline |
|---------|----------|------------|--------|----------|
| Enhanced Login Response Parsing | HIGH | Medium | High | Phase 3 |
| Enhanced Global Settings | HIGH | Medium | High | Phase 4 |
| Form Validation (min chars) | HIGH | Low | Medium | Phase 2 |
| Minimum Chars for Client Search | MEDIUM | Low | Low | Phase 1 |
| Debounced Search | LOW | Medium | Low | Phase 1 (Optional) |
| Test Sign-In Buttons | LOW | Low | Low | Phase 5 |
| App Version Display | LOW | Low | Low | Phase 6 |

---

## 5. Implementation Checklist

### Phase 1: Enhanced Client Search
- [ ] Add minimum 2 character requirement
- [ ] Update placeholder text
- [ ] Add helper text below dropdown
- [ ] (Optional) Implement debounced search

### Phase 2: Form Validation
- [ ] Create `lib/utils/validators.dart`
- [ ] Add username/email validation (min 4 chars)
- [ ] Add password validation (min 8 chars)
- [ ] Update field labels to show "UID / Email"
- [ ] Add helper texts to fields
- [ ] Add real-time validation feedback

### Phase 3: Login Response Models
- [ ] Create `lib/models/business_unit.dart`
- [ ] Create `lib/models/secured_control.dart`
- [ ] Create `lib/models/role.dart`
- [ ] Create `lib/models/user_details_extended.dart`
- [ ] Update `lib/models/login_response.dart` with new fields
- [ ] Update `lib/services/auth_service.dart` to parse all data

### Phase 4: Global Settings Enhancement
- [ ] Add new properties to `GlobalSettings`
- [ ] Create `setComprehensiveLoginData()` method
- [ ] Add external DB params decoding
- [ ] Update secure storage to save all data
- [ ] Add methods to retrieve user permissions
- [ ] Update login page to use new method

### Phase 5: Test Sign-In (Debug Only)
- [ ] Add test credential buttons
- [ ] Create `_fillTestCredentials()` method
- [ ] Wrap in `if (kDebugMode)` check

### Phase 6: App Version
- [ ] Add `package_info_plus` dependency
- [ ] Display version in login screen
- [ ] Format similar to React client

---

## 6. Testing Plan

### Unit Tests
- [ ] Test `Validators.validateUserNameOrEmail()`
- [ ] Test `Validators.validatePassword()`
- [ ] Test `Client.fromJson()` with server response
- [ ] Test `LoginResponse.fromJson()` with full payload
- [ ] Test external DB params decoding

### Integration Tests
- [ ] Test client search with min characters
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test state persistence across app restarts

### Manual Tests
- [ ] Login as Super Admin
- [ ] Login as Admin
- [ ] Login as Business User
- [ ] Test client search with various inputs
- [ ] Test form validation messages
- [ ] Verify all user data is stored correctly
- [ ] Test external DB client login

---

## 7. Data Flow Comparison

### React Client Flow:
```
User Input → Form Validation → API Call →
Response Parsing → Redux State Update →
External DB Params Decode → Navigate to Home →
Fetch Additional Data (finYears, branches, settings)
```

### Flutter Target Flow:
```
User Input → Form Validation → API Call →
Response Parsing → GlobalSettings Update →
External DB Params Decode → Navigate to Dashboard →
Fetch Additional Data (via Utils.execDataCache)
```

**Note**: Flutter already calls `Utils.execDataCache(globalSettings)` which fetches:
- Unit info
- Branches
- Financial years
- Current financial year

This matches the React client's post-login data fetching.

---

## 8. Breaking Changes & Migration

### 8.1 Breaking Changes
None expected - all changes are additive

### 8.2 Data Migration
Existing saved login data will work with new implementation:
- New fields will be `null` for existing users
- Users will get full data on next login
- No special migration needed

---

## 9. Future Enhancements (Out of Scope)

- Biometric authentication
- Remember username option
- Multi-factor authentication (MFA)
- Social login (Google, Apple, etc.)
- Password strength indicator
- Auto-logout on inactivity
- Session management
- Offline login support

---

## 10. Dependencies

### Existing (No Changes)
- `http: ^1.6.0` - HTTP client
- `flutter_secure_storage: ^9.2.4` - Secure storage
- `provider: ^6.1.2` - State management

### New (Optional)
- `package_info_plus: ^8.0.0` - App version info
- `rxdart: ^0.27.7` - For debouncing (if implementing Phase 1 optional)

---

## 11. Success Criteria

✅ Login functionality matches React client feature-for-feature (excluding forgot password)
✅ All user data is properly stored and accessible
✅ External DB clients can login successfully
✅ Form validation provides clear feedback
✅ No regression in existing functionality
✅ Code is maintainable and well-documented

---

## 12. Notes & Considerations

### Security
- Passwords are sent as plain text over HTTPS (same as React client)
- Consider adding client-side hashing in future
- External DB params are encrypted on server

### Performance
- Client search should be fast (<100ms for <100 clients)
- Debouncing only needed for very large client lists
- Secure storage operations are async - consider loading indicators

### UX Improvements Over React Client
- ✅ Better mobile-optimized autocomplete
- ✅ Native platform look and feel
- ✅ Faster load times (no web overhead)
- ⚠️ Need to ensure error messages are equally clear

---

**End of Plan**
