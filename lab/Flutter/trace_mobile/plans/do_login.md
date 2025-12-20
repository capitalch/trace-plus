# Flutter Login Implementation Plan

## Overview
This plan details the implementation of login functionality in the Flutter trace_mobile app to match the authentication flow used in the trace-client React application, connecting to the trace-server FastAPI backend at http://localhost:8000.

---

## Current State Analysis

### Existing Implementation
The Flutter app currently has:
- ✅ LoginPage UI with username/password fields
- ✅ GlobalSettings state management (Provider)
- ✅ Secure storage (flutter_secure_storage)
- ✅ Dashboard page
- ⚠️ **Issue:** Uses GraphQL authentication instead of REST API
- ⚠️ **Issue:** Missing client selection feature
- ⚠️ **Issue:** Different authentication flow than React client

### Required Changes
Need to align with React client implementation:
- Switch from GraphQL to REST API for login
- Add client selection (TypeAhead/AutoComplete)
- Use form-encoded POST request
- Match exact request/response structure
- Store comprehensive user payload
- Remove secured controls and forgot password features (as requested)

---

## Step-by-Step Implementation Guide

Follow these steps in order. Each step is self-contained and can be completed independently.

---

#### STEP 1: Project Setup & Dependencies

**Goal:** Set up the project branch and install required packages

**Actions:**
1. Create a new git branch:
   ```bash
   git checkout -b feature/rest-api-login
   ```

2. Open `pubspec.yaml` and add/verify these dependencies:
   ```yaml
   dependencies:
     flutter_typeahead: ^5.0.0
     json_annotation: ^4.8.1

   dev_dependencies:
     build_runner: ^2.4.0
     json_serializable: ^6.7.0
   ```

3. Install packages:
   ```bash
   flutter pub get
   ```

4. Commit changes:
   ```bash
   git add pubspec.yaml pubspec.lock
   git commit -m "Add dependencies for REST API login"
   ```

**Verification:** Run `flutter pub get` successfully without errors

---

#### STEP 2: Create Model Files (Part 1 - Basic Models)

**Goal:** Create the data model files for login request/response

**Actions:**

1. Create directory structure:
   ```bash
   mkdir -p lib/features/authentication/models
   mkdir -p lib/features/authentication/services
   ```

2. Create `lib/features/authentication/models/login_request.dart`:
   ```dart
   class LoginRequest {
     final String clientId;
     final String username;
     final String password;

     LoginRequest({
       required this.clientId,
       required this.username,
       required this.password,
     });

     Map<String, dynamic> toFormData() {
       return {
         'clientId': clientId,
         'username': username,
         'password': password,
       };
     }
   }
   ```

3. Create `lib/features/authentication/models/login_error.dart`:
   ```dart
   class LoginError implements Exception {
     final String errorCode;
     final String message;
     final String? detail;

     LoginError({
       required this.errorCode,
       required this.message,
       this.detail,
     });

     factory LoginError.fromJson(Map<String, dynamic> json) {
       return LoginError(
         errorCode: json['error_code'] ?? '',
         message: json['message'] ?? 'Unknown error',
         detail: json['detail'],
       );
     }

     @override
     String toString() => message;
   }
   ```

**Verification:** No compilation errors, files created successfully

---

#### STEP 3: Create Model Files (Part 2 - JSON Serializable Models)

**Goal:** Create models with JSON serialization for API response

**Actions:**

1. Create `lib/features/authentication/models/user_details.dart`:
   ```dart
   import 'package:json_annotation/json_annotation.dart';

   part 'user_details.g.dart';

   @JsonSerializable()
   class UserDetails {
     final int? id;
     final String? uid;
     final String? userName;
     final String? userEmail;
     final String? mobileNo;
     final int? clientId;
     final String? clientName;
     final String? clientCode;
     final int? roleId;
     final String? userType;
     final bool? isUserActive;
     final bool? isClientActive;
     final String? dbName;
     final bool? isExternalDb;
     final Map<String, dynamic>? dbParams;
     final String? branchIds;
     final int? lastUsedBuId;
     final int? lastUsedBranchId;
     final int? lastUsedFinYearId;

     UserDetails({
       this.id,
       this.uid,
       this.userName,
       this.userEmail,
       this.mobileNo,
       this.clientId,
       this.clientName,
       this.clientCode,
       this.roleId,
       this.userType,
       this.isUserActive,
       this.isClientActive,
       this.dbName,
       this.isExternalDb,
       this.dbParams,
       this.branchIds,
       this.lastUsedBuId,
       this.lastUsedBranchId,
       this.lastUsedFinYearId,
     });

     factory UserDetails.fromJson(Map<String, dynamic> json) =>
         _$UserDetailsFromJson(json);
     Map<String, dynamic> toJson() => _$UserDetailsToJson(this);
   }
   ```

2. Create `lib/features/authentication/models/role.dart`:
   ```dart
   import 'package:json_annotation/json_annotation.dart';

   part 'role.g.dart';

   @JsonSerializable()
   class Role {
     final int roleId;
     final String roleName;
     final int clientId;

     Role({
       required this.roleId,
       required this.roleName,
       required this.clientId,
     });

     factory Role.fromJson(Map<String, dynamic> json) => _$RoleFromJson(json);
     Map<String, dynamic> toJson() => _$RoleToJson(this);
   }
   ```

3. Create `lib/features/authentication/models/business_unit.dart`:
   ```dart
   import 'package:json_annotation/json_annotation.dart';

   part 'business_unit.g.dart';

   @JsonSerializable()
   class BusinessUnit {
     final int buId;
     final String buCode;
     final String buName;

     BusinessUnit({
       required this.buId,
       required this.buCode,
       required this.buName,
     });

     factory BusinessUnit.fromJson(Map<String, dynamic> json) =>
         _$BusinessUnitFromJson(json);
     Map<String, dynamic> toJson() => _$BusinessUnitToJson(this);
   }
   ```

4. Create `lib/features/authentication/models/client_item.dart`:
   ```dart
   import 'package:json_annotation/json_annotation.dart';

   part 'client_item.g.dart';

   @JsonSerializable()
   class ClientItem {
     final int id;
     final String clientName;

     ClientItem({
       required this.id,
       required this.clientName,
     });

     factory ClientItem.fromJson(Map<String, dynamic> json) =>
         _$ClientItemFromJson(json);
     Map<String, dynamic> toJson() => _$ClientItemToJson(this);
   }
   ```

**Verification:** Files created, but will have errors until code generation in next step

---

#### STEP 4: Create Composite Models & Generate Code

**Goal:** Create composite models and generate serialization code

**Actions:**

1. Create `lib/features/authentication/models/user_payload.dart`:
   ```dart
   import 'package:json_annotation/json_annotation.dart';
   import 'user_details.dart';
   import 'role.dart';
   import 'business_unit.dart';

   part 'user_payload.g.dart';

   @JsonSerializable()
   class UserPayload {
     final UserDetails userDetails;
     final Role? role;
     final List<BusinessUnit> allBusinessUnits;
     final List<BusinessUnit> userBusinessUnits;

     UserPayload({
       required this.userDetails,
       this.role,
       required this.allBusinessUnits,
       required this.userBusinessUnits,
     });

     factory UserPayload.fromJson(Map<String, dynamic> json) =>
         _$UserPayloadFromJson(json);
     Map<String, dynamic> toJson() => _$UserPayloadToJson(this);
   }
   ```

2. Create `lib/features/authentication/models/login_response.dart`:
   ```dart
   import 'package:json_annotation/json_annotation.dart';
   import 'user_payload.dart';

   part 'login_response.g.dart';

   @JsonSerializable()
   class LoginResponse {
     final String accessToken;
     final UserPayload payload;

     LoginResponse({
       required this.accessToken,
       required this.payload,
     });

     factory LoginResponse.fromJson(Map<String, dynamic> json) =>
         _$LoginResponseFromJson(json);
     Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
   }
   ```

3. Generate serialization code:
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. Commit changes:
   ```bash
   git add lib/features/authentication/models/
   git commit -m "Add authentication models"
   ```

**Verification:** All `.g.dart` files generated, no compilation errors

---

#### STEP 5: Create Authentication Service

**Goal:** Create the API service for login and client fetching

**Actions:**

1. Create `lib/features/authentication/services/auth_service.dart`:
   ```dart
   import 'dart:convert';
   import 'package:http/http.dart' as http;
   import '../models/login_request.dart';
   import '../models/login_response.dart';
   import '../models/login_error.dart';
   import '../models/client_item.dart';

   class AuthService {
     // For web/desktop use localhost
     // For Android emulator use 10.0.2.2
     static const String baseUrl = 'http://localhost:8000';
     // static const String baseUrl = 'http://10.0.2.2:8000'; // Android emulator

     /// Login with username, password, and clientId
     Future<LoginResponse> login(LoginRequest request) async {
       try {
         final uri = Uri.parse('$baseUrl/api/login');

         // Create form-encoded body
         final formData = request.toFormData();
         final body = formData.entries
             .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value.toString())}')
             .join('&');

         final response = await http.post(
           uri,
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
           },
           body: body,
         ).timeout(
           const Duration(seconds: 10),
           onTimeout: () {
             throw Exception('Connection timeout');
           },
         );

         if (response.statusCode == 200) {
           final jsonData = jsonDecode(response.body);
           return LoginResponse.fromJson(jsonData);
         } else if (response.statusCode == 401 || response.statusCode == 400) {
           final jsonData = jsonDecode(response.body);
           throw LoginError.fromJson(jsonData);
         } else {
           throw LoginError(
             errorCode: 'SERVER_ERROR',
             message: 'Server error: ${response.statusCode}',
           );
         }
       } catch (e) {
         if (e is LoginError) {
           rethrow;
         }
         throw LoginError(
           errorCode: 'NETWORK_ERROR',
           message: e.toString(),
         );
       }
     }

     /// Fetch client list for autocomplete
     Future<List<ClientItem>> fetchClients(String searchTerm) async {
       try {
         final uri = Uri.parse('$baseUrl/api/login-clients');

         // Create form-encoded body
         final body = 'searchTerm=${Uri.encodeComponent(searchTerm)}';

         final response = await http.post(
           uri,
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
           },
           body: body,
         ).timeout(const Duration(seconds: 10));

         if (response.statusCode == 200) {
           final List<dynamic> clientsJson = jsonDecode(response.body);
           return clientsJson
               .map((json) => ClientItem.fromJson(json))
               .toList();
         } else {
           print('Error fetching clients: ${response.statusCode}');
           return [];
         }
       } catch (e) {
         print('Error fetching clients: $e');
         return [];
       }
     }
   }
   ```

2. Commit changes:
   ```bash
   git add lib/features/authentication/services/
   git commit -m "Add authentication service"
   ```

**Verification:** No compilation errors, service class created

**Important Note on URLs:**
- For **web/desktop**: Use `http://localhost:8000`
- For **Android emulator**: Use `http://10.0.2.2:8000` (Android emulator's special alias for host machine's localhost)
- For **iOS simulator**: Use `http://localhost:8000` (works like desktop)
- For **physical device**: Use your computer's actual IP address like `http://192.168.1.x:8000`

---

#### STEP 6: Update GlobalSettings (State Management)

**Goal:** Add new login methods to GlobalSettings

**Actions:**

1. Open `lib/common/classes/global_settings.dart`

2. Update the server URLs for REST API (around lines 8-10):
   ```dart
   static const webUrl = 'https://develop.cloudjiffy.net/graphql';

   // For REST API - remove /graphql
   static const restApiLocalUrl = 'http://localhost:8000';  // For web/desktop
   // static const restApiLocalUrl = 'http://10.0.2.2:8000';  // For Android emulator

   static const localUrl = 'https://develop.cloudjiffy.net/graphql';  // Keep for old GraphQL
   ```

3. Add imports at the top (if not already present):
   ```dart
   import 'dart:convert';
   import 'package:http/http.dart' as http;
   import '../../features/authentication/models/login_response.dart';
   import '../../features/authentication/models/user_payload.dart';
   ```

3. Add new properties to the class:
   ```dart
   // New properties for REST API login
   String? _accessToken;
   UserPayload? _userPayload;
   bool _isLoggedIn = false;

   String? get accessToken => _accessToken;
   UserPayload? get userPayload => _userPayload;
   bool get isLoggedIn => _isLoggedIn;
   ```

4. Add new methods to the class:
   ```dart
   /// Store login response data
   Future<void> setLoginData(LoginResponse response) async {
     _accessToken = response.accessToken;
     _userPayload = response.payload;
     _isLoggedIn = true;

     // Store to secure storage
     await DataStore.saveLoginDataInSecuredStorage(
       jsonEncode({
         'accessToken': _accessToken,
         'payload': _userPayload!.toJson(),
       }),
     );

     notifyListeners();
   }

   /// Load login data from secure storage
   Future<void> loadLoginData() async {
     final loginDataJson = await DataStore.getLoginDataFromSecuredStorage();
     if (loginDataJson != null && loginDataJson.isNotEmpty) {
       final data = jsonDecode(loginDataJson);
       _accessToken = data['accessToken'];
       _userPayload = UserPayload.fromJson(data['payload']);
       _isLoggedIn = true;
       notifyListeners();
     }
   }

   /// Clear login data (logout)
   Future<void> clearLoginData() async {
     _accessToken = null;
     _userPayload = null;
     _isLoggedIn = false;
     await DataStore.saveLoginDataInSecuredStorage('');
     notifyListeners();
   }

   /// Get authorization headers for authenticated requests
   Map<String, String> getAuthHeaders() {
     return {
       'Content-Type': 'application/json',
       if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
     };
   }

   /// Make authenticated HTTP GET request
   Future<http.Response> get(String endpoint) async {
     final uri = Uri.parse('$restApiLocalUrl$endpoint');
     return await http.get(uri, headers: getAuthHeaders())
         .timeout(const Duration(seconds: 10));
   }

   /// Make authenticated HTTP POST request
   Future<http.Response> post(String endpoint, {Object? body}) async {
     final uri = Uri.parse('$restApiLocalUrl$endpoint');
     return await http.post(
       uri,
       headers: getAuthHeaders(),
       body: body != null ? jsonEncode(body) : null,
     ).timeout(const Duration(seconds: 10));
   }
   ```

5. Commit changes:
   ```bash
   git add lib/common/classes/global_settings.dart
   git commit -m "Update GlobalSettings for REST API login"
   ```

**Verification:** No compilation errors, methods added successfully

---

#### STEP 7: Create New Login Page

**Goal:** Create the new login page with client selection

**Actions:**

1. Rename existing login page (backup):
   ```bash
   mv lib/features/authentication/login_page.dart lib/features/authentication/login_page_old.dart
   ```

2. Create new `lib/features/authentication/login_page.dart`:
   ```dart
   import 'package:flutter/material.dart';
   import 'package:flutter_typeahead/flutter_typeahead.dart';
   import 'package:provider/provider.dart';
   import '../../common/classes/global_settings.dart';
   import '../../common/classes/routes.dart';
   import 'models/login_request.dart';
   import 'models/client_item.dart';
   import 'services/auth_service.dart';

   class LoginPage extends StatefulWidget {
     const LoginPage({super.key});

     @override
     State<LoginPage> createState() => _LoginPageState();
   }

   class _LoginPageState extends State<LoginPage> {
     final _formKey = GlobalKey<FormState>();
     final _authService = AuthService();

     // Controllers
     final _usernameController = TextEditingController();
     final _passwordController = TextEditingController();
     final _clientController = TextEditingController();

     // Selected client
     ClientItem? _selectedClient;

     // Loading state
     bool _isLoading = false;

     @override
     void dispose() {
       _usernameController.dispose();
       _passwordController.dispose();
       _clientController.dispose();
       super.dispose();
     }

     Future<void> _handleLogin() async {
       if (!_formKey.currentState!.validate()) {
         return;
       }

       if (_selectedClient == null) {
         ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text('Please select a client')),
         );
         return;
       }

       setState(() {
         _isLoading = true;
       });

       try {
         final request = LoginRequest(
           clientId: _selectedClient!.id.toString(),
           username: _usernameController.text.trim(),
           password: _passwordController.text,
         );

         final response = await _authService.login(request);

         // Store login data
         final globalSettings = Provider.of<GlobalSettings>(
           context,
           listen: false,
         );
         await globalSettings.setLoginData(response);

         // Navigate to dashboard
         if (mounted) {
           Navigator.pushReplacementNamed(context, Routes.dashBoard);
         }
       } catch (e) {
         if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(
               content: Text(e.toString()),
               backgroundColor: Colors.red,
             ),
           );
         }
       } finally {
         if (mounted) {
           setState(() {
             _isLoading = false;
           });
         }
       }
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: const Text('Login'),
         ),
         body: Padding(
           padding: const EdgeInsets.all(24.0),
           child: Form(
             key: _formKey,
             child: Column(
               mainAxisAlignment: MainAxisAlignment.center,
               crossAxisAlignment: CrossAxisAlignment.stretch,
               children: [
                 // Client Selection TypeAhead
                 TypeAheadFormField<ClientItem>(
                   textFieldConfiguration: TextFieldConfiguration(
                     controller: _clientController,
                     decoration: const InputDecoration(
                       labelText: 'Client Name',
                       border: OutlineInputBorder(),
                       prefixIcon: Icon(Icons.business),
                     ),
                   ),
                   debounceDuration: const Duration(milliseconds: 500),
                   minCharsForSuggestions: 2,
                   suggestionsCallback: (pattern) async {
                     if (pattern.isEmpty) {
                       return [];
                     }
                     return await _authService.fetchClients(pattern);
                   },
                   itemBuilder: (context, ClientItem suggestion) {
                     return ListTile(
                       title: Text(suggestion.clientName),
                     );
                   },
                   onSuggestionSelected: (ClientItem suggestion) {
                     _selectedClient = suggestion;
                     _clientController.text = suggestion.clientName;
                   },
                   noItemsFoundBuilder: (context) {
                     return const Padding(
                       padding: EdgeInsets.all(8.0),
                       child: Text('No clients found'),
                     );
                   },
                   loadingBuilder: (context) {
                     return const Padding(
                       padding: EdgeInsets.all(8.0),
                       child: CircularProgressIndicator(),
                     );
                   },
                   validator: (value) {
                     if (_selectedClient == null) {
                       return 'Please select a client';
                     }
                     return null;
                   },
                 ),

                 const SizedBox(height: 16),

                 // Username field
                 TextFormField(
                   controller: _usernameController,
                   decoration: const InputDecoration(
                     labelText: 'UID / Email',
                     border: OutlineInputBorder(),
                     prefixIcon: Icon(Icons.person),
                   ),
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Username is required';
                     }
                     if (value.length < 4) {
                       return 'Username must be at least 4 characters';
                     }
                     return null;
                   },
                 ),

                 const SizedBox(height: 16),

                 // Password field
                 TextFormField(
                   controller: _passwordController,
                   obscureText: true,
                   decoration: const InputDecoration(
                     labelText: 'Password',
                     border: OutlineInputBorder(),
                     prefixIcon: Icon(Icons.lock),
                   ),
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Password is required';
                     }
                     if (value.length < 8) {
                       return 'Password must be at least 8 characters';
                     }
                     return null;
                   },
                 ),

                 const SizedBox(height: 24),

                 // Login button
                 ElevatedButton(
                   onPressed: _isLoading ? null : _handleLogin,
                   style: ElevatedButton.styleFrom(
                     padding: const EdgeInsets.symmetric(vertical: 16),
                   ),
                   child: _isLoading
                       ? const SizedBox(
                           height: 20,
                           width: 20,
                           child: CircularProgressIndicator(strokeWidth: 2),
                         )
                       : const Text(
                           'Login',
                           style: TextStyle(fontSize: 16),
                         ),
                 ),
               ],
             ),
           ),
         ),
       );
     }
   }
   ```

3. Commit changes:
   ```bash
   git add lib/features/authentication/
   git commit -m "Create new REST API login page"
   ```

**Verification:** App compiles, new login page displays correctly

---

#### STEP 8: Test Basic Login Flow

**Goal:** Test the login functionality with the backend

**Actions:**

1. Make sure your backend server is running at `http://localhost:8000`

2. Run the Flutter app:
   ```bash
   flutter run
   ```

3. Test scenarios:
   - Navigate to login page
   - Type in client field (test debounce - wait 500ms after typing)
   - Select a client from dropdown
   - Enter username: `capital` (or `superAdmin`)
   - Enter password: `tr@ce123` (or `superadmin@123`)
   - Click Login button
   - Verify navigation to dashboard

4. Test error cases:
   - Invalid credentials
   - Missing fields
   - No client selected

**Verification:** Login works, token stored, navigates to dashboard

---

#### STEP 9: Create Protected Route Widget

**Goal:** Create a widget to protect routes that require authentication

**Actions:**

1. Create directory:
   ```bash
   mkdir -p lib/common/widgets
   ```

2. Create `lib/common/widgets/protected_route.dart`:
   ```dart
   import 'package:flutter/material.dart';
   import 'package:provider/provider.dart';
   import '../classes/global_settings.dart';
   import '../classes/routes.dart';

   class ProtectedRoute extends StatelessWidget {
     final Widget child;

     const ProtectedRoute({
       super.key,
       required this.child,
     });

     @override
     Widget build(BuildContext context) {
       return Consumer<GlobalSettings>(
         builder: (context, globalSettings, _) {
           if (!globalSettings.isLoggedIn) {
             // Redirect to login if not authenticated
             WidgetsBinding.instance.addPostFrameCallback((_) {
               Navigator.pushReplacementNamed(context, Routes.login);
             });
             return const Scaffold(
               body: Center(child: CircularProgressIndicator()),
             );
           }

           return child;
         },
       );
     }
   }
   ```

3. Commit changes:
   ```bash
   git add lib/common/widgets/
   git commit -m "Add protected route widget"
   ```

**Verification:** No compilation errors

---

#### STEP 10: Update Dashboard to Use New Login Data

**Goal:** Update dashboard to read from new UserPayload structure

**Actions:**

1. Open `lib/features/dashboard/dashboard_page.dart`

2. At the beginning of the `build` method, add authentication check:
   ```dart
   @override
   Widget build(BuildContext context) {
     final globalSettings = Provider.of<GlobalSettings>(context);
     final userPayload = globalSettings.userPayload;

     if (userPayload == null || !globalSettings.isLoggedIn) {
       // Not logged in, redirect to login
       WidgetsBinding.instance.addPostFrameCallback((_) {
         Navigator.pushReplacementNamed(context, Routes.login);
       });
       return const Scaffold(
         body: Center(child: CircularProgressIndicator()),
       );
     }

     // ... rest of existing code
   }
   ```

3. Update any references to old login data to use `userPayload`:
   - Replace old user data access with `userPayload.userDetails.xxx`
   - Replace old BU data with `userPayload.allBusinessUnits`

4. Commit changes:
   ```bash
   git add lib/features/dashboard/
   git commit -m "Update dashboard to use new login data"
   ```

**Verification:** Dashboard displays correctly after login

---

#### STEP 11: Update Dashboard App Bar (User Info & Logout)

**Goal:** Update app bar to show user info and implement logout

**Actions:**

1. Open `lib/features/dashboard/widgets/dashboard_app_bar.dart`

2. Update to use new user payload:
   ```dart
   // Get user data
   final globalSettings = Provider.of<GlobalSettings>(context);
   final userPayload = globalSettings.userPayload;

   // Display user name
   Text(userPayload?.userDetails.userName ?? 'User')

   // Display BU code
   Text(userPayload?.allBusinessUnits.isNotEmpty == true
       ? userPayload!.allBusinessUnits[0].buCode
       : 'N/A')
   ```

3. Update logout button handler:
   ```dart
   // In logout IconButton onPressed
   onPressed: () async {
     final globalSettings = Provider.of<GlobalSettings>(
       context,
       listen: false,
     );

     await globalSettings.clearLoginData();

     if (mounted) {
       Navigator.pushReplacementNamed(context, Routes.login);
     }
   },
   ```

4. Commit changes:
   ```bash
   git add lib/features/dashboard/widgets/
   git commit -m "Update dashboard app bar with new user data and logout"
   ```

**Verification:** User info displays, logout works correctly

---

#### STEP 12: Wrap Protected Routes

**Goal:** Apply ProtectedRoute wrapper to all protected pages

**Actions:**

1. Open `lib/main.dart`

2. Import the protected route widget:
   ```dart
   import 'common/widgets/protected_route.dart';
   ```

3. Wrap protected routes (in the routes map or MaterialApp):
   ```dart
   Routes.dashBoard: (context) => const ProtectedRoute(
     child: DashboardPage(),
   ),
   Routes.accounts: (context) => const ProtectedRoute(
     child: AccountsPage(),
   ),
   Routes.products: (context) => const ProtectedRoute(
     child: ProductsPage(),
   ),
   Routes.sales: (context) => const ProtectedRoute(
     child: SalesPage(),
   ),
   Routes.transactions: (context) => const ProtectedRoute(
     child: TransactionsPage(),
   ),
   // ... other protected routes
   ```

4. Commit changes:
   ```bash
   git add lib/main.dart
   git commit -m "Wrap protected routes with authentication check"
   ```

**Verification:** Cannot access protected routes without login

---

#### STEP 13: Load Persisted Login on App Start

**Goal:** Load saved login data when app starts

**Actions:**

1. Open `lib/common/classes/global_settings.dart`

2. Update or add to the constructor:
   ```dart
   GlobalSettings() {
     // Load persisted login data on initialization
     loadLoginData();
     // ... existing initialization code
   }
   ```

3. Open `lib/main.dart`

4. Update the initial route logic to check login status:
   ```dart
   // In MaterialApp
   home: Consumer<GlobalSettings>(
     builder: (context, globalSettings, _) {
       if (globalSettings.isLoggedIn) {
         return const DashboardPage();
       } else {
         return const HomePage(); // or LoginPage if you want direct login
       }
     },
   ),
   ```

5. Commit changes:
   ```bash
   git add lib/common/classes/global_settings.dart lib/main.dart
   git commit -m "Load persisted login data on app start"
   ```

**Verification:** App remembers login after restart

---

### STEP 14: Comprehensive Testing

**Goal:** Test all login scenarios and edge cases

**Test Cases:**

1. **Login Flow:**
   - [ ] Login with super admin (superAdmin / superadmin@123)
   - [ ] Login with regular user credentials
   - [ ] Invalid username shows error
   - [ ] Invalid password shows error
   - [ ] Empty fields show validation errors
   - [ ] No client selected shows error

2. **Client Selection:**
   - [ ] TypeAhead shows suggestions after 2 characters
   - [ ] Debounce works (no API call on every keystroke)
   - [ ] Can select a client from dropdown
   - [ ] Shows "No clients found" when no results
   - [ ] Shows loading indicator while fetching

3. **Navigation & Auth:**
   - [ ] Redirects to dashboard after successful login
   - [ ] Can access protected routes when logged in
   - [ ] Redirected to login when accessing protected routes without login
   - [ ] Dashboard displays user information correctly

4. **Token & Storage:**
   - [ ] Token stored in secure storage
   - [ ] Login persists after app restart
   - [ ] Token included in authenticated API requests

5. **Logout:**
   - [ ] Logout clears all data
   - [ ] Logout redirects to login page
   - [ ] Cannot access protected routes after logout
   - [ ] Login data cleared from secure storage

**Actions:**
- Test each scenario
- Fix any bugs found
- Document any issues

**Verification:** All test cases pass

---

### STEP 15: Cleanup & Final Commit

**Goal:** Remove old code and finalize implementation

**Actions:**

1. Remove old login page:
   ```bash
   rm lib/features/authentication/login_page_old.dart
   ```

2. Remove or comment out demo login functionality (if exists in `home_page.dart`):
   - Review `lib/features/authentication/home_page.dart`
   - Remove or disable demo login button
   - Update to only show login button

3. Clean up any unused imports

4. Run code formatting:
   ```bash
   flutter format lib/
   ```

5. Final build check:
   ```bash
   flutter build apk --debug
   ```

6. Commit all changes:
   ```bash
   git add -A
   git commit -m "Cleanup: Remove old login code and finalize REST API login"
   ```

7. Merge to main branch (optional):
   ```bash
   git checkout main
   git merge feature/rest-api-login
   git push
   ```

**Verification:** Clean build, no warnings, all tests pass

---

## Quick Reference: Step Checklist

- [ ] STEP 1: Project Setup & Dependencies
- [ ] STEP 2: Create Model Files (Part 1)
- [ ] STEP 3: Create Model Files (Part 2)
- [ ] STEP 4: Create Composite Models & Generate Code
- [ ] STEP 5: Create Authentication Service
- [ ] STEP 6: Update GlobalSettings
- [ ] STEP 7: Create New Login Page
- [ ] STEP 8: Test Basic Login Flow
- [ ] STEP 9: Create Protected Route Widget
- [ ] STEP 10: Update Dashboard to Use New Login Data
- [ ] STEP 11: Update Dashboard App Bar
- [ ] STEP 12: Wrap Protected Routes
- [ ] STEP 13: Load Persisted Login on App Start
- [ ] STEP 14: Comprehensive Testing
- [ ] STEP 15: Cleanup & Final Commit

---

## Implementation Steps

### Phase 1: Dependencies & Models

#### 1.1 Add Required Dependencies
**File:** `pubspec.yaml`

Add/verify packages:
```yaml
dependencies:
  http: ^1.6.0                   # Already in project - For HTTP requests
  flutter_typeahead: ^5.0.0      # For client selection autocomplete
  json_annotation: ^4.8.1        # For JSON serialization

dev_dependencies:
  build_runner: ^2.4.0           # For code generation
  json_serializable: ^6.7.0      # For JSON serialization
```

**Rationale:**
- `http` package (already in project) for REST API calls
- `flutter_typeahead` provides autocomplete UI like React TypeAhead
- JSON serialization for complex response models

---

#### 1.2 Create Data Models
**Location:** `lib/features/authentication/models/`

Create new directory and files:

**File:** `lib/features/authentication/models/login_request.dart`
```dart
class LoginRequest {
  final String clientId;
  final String username;
  final String password;

  LoginRequest({
    required this.clientId,
    required this.username,
    required this.password,
  });

  Map<String, dynamic> toFormData() {
    return {
      'clientId': clientId,
      'username': username,
      'password': password,
    };
  }
}
```

**File:** `lib/features/authentication/models/user_details.dart`
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user_details.g.dart';

@JsonSerializable()
class UserDetails {
  final int? id;
  final String? uid;
  final String? userName;
  final String? userEmail;
  final String? mobileNo;
  final int? clientId;
  final String? clientName;
  final String? clientCode;
  final int? roleId;
  final String? userType; // 'S', 'A', or 'B'
  final bool? isUserActive;
  final bool? isClientActive;
  final String? dbName;
  final bool? isExternalDb;
  final Map<String, dynamic>? dbParams;
  final String? branchIds;
  final int? lastUsedBuId;
  final int? lastUsedBranchId;
  final int? lastUsedFinYearId;

  UserDetails({
    this.id,
    this.uid,
    this.userName,
    this.userEmail,
    this.mobileNo,
    this.clientId,
    this.clientName,
    this.clientCode,
    this.roleId,
    this.userType,
    this.isUserActive,
    this.isClientActive,
    this.dbName,
    this.isExternalDb,
    this.dbParams,
    this.branchIds,
    this.lastUsedBuId,
    this.lastUsedBranchId,
    this.lastUsedFinYearId,
  });

  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);
  Map<String, dynamic> toJson() => _$UserDetailsToJson(this);
}
```

**File:** `lib/features/authentication/models/role.dart`
```dart
import 'package:json_annotation/json_annotation.dart';

part 'role.g.dart';

@JsonSerializable()
class Role {
  final int roleId;
  final String roleName;
  final int clientId;

  Role({
    required this.roleId,
    required this.roleName,
    required this.clientId,
  });

  factory Role.fromJson(Map<String, dynamic> json) => _$RoleFromJson(json);
  Map<String, dynamic> toJson() => _$RoleToJson(this);
}
```

**File:** `lib/features/authentication/models/business_unit.dart`
```dart
import 'package:json_annotation/json_annotation.dart';

part 'business_unit.g.dart';

@JsonSerializable()
class BusinessUnit {
  final int buId;
  final String buCode;
  final String buName;

  BusinessUnit({
    required this.buId,
    required this.buCode,
    required this.buName,
  });

  factory BusinessUnit.fromJson(Map<String, dynamic> json) =>
      _$BusinessUnitFromJson(json);
  Map<String, dynamic> toJson() => _$BusinessUnitToJson(this);
}
```

**File:** `lib/features/authentication/models/user_payload.dart`
```dart
import 'package:json_annotation/json_annotation.dart';
import 'user_details.dart';
import 'role.dart';
import 'business_unit.dart';

part 'user_payload.g.dart';

@JsonSerializable()
class UserPayload {
  final UserDetails userDetails;
  final Role? role;
  final List<BusinessUnit> allBusinessUnits;
  final List<BusinessUnit> userBusinessUnits;
  // Note: Excluding allSecuredControls and userSecuredControls as requested

  UserPayload({
    required this.userDetails,
    this.role,
    required this.allBusinessUnits,
    required this.userBusinessUnits,
  });

  factory UserPayload.fromJson(Map<String, dynamic> json) =>
      _$UserPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$UserPayloadToJson(this);
}
```

**File:** `lib/features/authentication/models/login_response.dart`
```dart
import 'package:json_annotation/json_annotation.dart';
import 'user_payload.dart';

part 'login_response.g.dart';

@JsonSerializable()
class LoginResponse {
  final String accessToken;
  final UserPayload payload;

  LoginResponse({
    required this.accessToken,
    required this.payload,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}
```

**File:** `lib/features/authentication/models/client_item.dart`
```dart
import 'package:json_annotation/json_annotation.dart';

part 'client_item.g.dart';

@JsonSerializable()
class ClientItem {
  final int id;
  final String clientName;

  ClientItem({
    required this.id,
    required this.clientName,
  });

  factory ClientItem.fromJson(Map<String, dynamic> json) =>
      _$ClientItemFromJson(json);
  Map<String, dynamic> toJson() => _$ClientItemToJson(this);
}
```

**File:** `lib/features/authentication/models/login_error.dart`
```dart
class LoginError {
  final String errorCode;
  final String message;
  final String? detail;

  LoginError({
    required this.errorCode,
    required this.message,
    this.detail,
  });

  factory LoginError.fromJson(Map<String, dynamic> json) {
    return LoginError(
      errorCode: json['error_code'] ?? '',
      message: json['message'] ?? 'Unknown error',
      detail: json['detail'],
    );
  }
}
```

**Action:** Run `flutter pub run build_runner build` to generate serialization code

---

### Phase 2: API Service Layer

#### 2.1 Create Authentication Service
**File:** `lib/features/authentication/services/auth_service.dart`

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/login_request.dart';
import '../models/login_response.dart';
import '../models/login_error.dart';
import '../models/client_item.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:8000';

  /// Login with username, password, and clientId
  /// Returns LoginResponse on success
  /// Throws LoginError on failure
  Future<LoginResponse> login(LoginRequest request) async {
    try {
      final uri = Uri.parse('$baseUrl/api/login');

      // Create form-encoded body
      final formData = request.toFormData();
      final body = formData.entries
          .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value.toString())}')
          .join('&');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        return LoginResponse.fromJson(jsonData);
      } else if (response.statusCode == 401 || response.statusCode == 400) {
        final jsonData = jsonDecode(response.body);
        throw LoginError.fromJson(jsonData);
      } else {
        throw LoginError(
          errorCode: 'SERVER_ERROR',
          message: 'Server error: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is LoginError) {
        rethrow;
      }
      throw LoginError(
        errorCode: 'NETWORK_ERROR',
        message: e.toString(),
      );
    }
  }

  /// Fetch client list for autocomplete
  /// POST request to /api/login-clients
  Future<List<ClientItem>> fetchClients(String searchTerm) async {
    try {
      final uri = Uri.parse('$baseUrl/api/login-clients');

      // Create form-encoded body
      final body = 'searchTerm=${Uri.encodeComponent(searchTerm)}';

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> clientsJson = jsonDecode(response.body);
        return clientsJson
            .map((json) => ClientItem.fromJson(json))
            .toList();
      } else {
        print('Error fetching clients: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('Error fetching clients: $e');
      return [];
    }
  }
}
```

---

### Phase 3: State Management Updates

#### 3.1 Update GlobalSettings
**File:** `lib/common/classes/global_settings.dart`

Add new methods and properties:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class GlobalSettings extends ChangeNotifier {
  // ... existing code ...

  // New properties for REST API login
  String? _accessToken;
  UserPayload? _userPayload;
  bool _isLoggedIn = false;

  String? get accessToken => _accessToken;
  UserPayload? get userPayload => _userPayload;
  bool get isLoggedIn => _isLoggedIn;

  /// Store login response data
  Future<void> setLoginData(LoginResponse response) async {
    _accessToken = response.accessToken;
    _userPayload = response.payload;
    _isLoggedIn = true;

    // Store to secure storage
    await DataStore.saveLoginDataInSecuredStorage(
      jsonEncode({
        'accessToken': _accessToken,
        'payload': _userPayload!.toJson(),
      }),
    );

    notifyListeners();
  }

  /// Load login data from secure storage
  Future<void> loadLoginData() async {
    final loginDataJson = await DataStore.getLoginDataFromSecuredStorage();
    if (loginDataJson != null && loginDataJson.isNotEmpty) {
      final data = jsonDecode(loginDataJson);
      _accessToken = data['accessToken'];
      _userPayload = UserPayload.fromJson(data['payload']);
      _isLoggedIn = true;
      notifyListeners();
    }
  }

  /// Clear login data (logout)
  Future<void> clearLoginData() async {
    _accessToken = null;
    _userPayload = null;
    _isLoggedIn = false;
    await DataStore.saveLoginDataInSecuredStorage('');
    notifyListeners();
  }

  /// Get authorization headers for authenticated requests
  Map<String, String> getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
    };
  }

  /// Make authenticated HTTP GET request
  Future<http.Response> get(String endpoint) async {
    final uri = Uri.parse('http://localhost:8000$endpoint');
    return await http.get(uri, headers: getAuthHeaders())
        .timeout(const Duration(seconds: 10));
  }

  /// Make authenticated HTTP POST request
  Future<http.Response> post(String endpoint, {Object? body}) async {
    final uri = Uri.parse('http://localhost:8000$endpoint');
    return await http.post(
      uri,
      headers: getAuthHeaders(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(const Duration(seconds: 10));
  }
}
```

---

### Phase 4: UI Implementation

#### 4.1 Redesign Login Page
**File:** `lib/features/authentication/login_page.dart`

Complete rewrite to match React client:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_typeahead/flutter_typeahead.dart';
import 'package:provider/provider.dart';
import '../../common/classes/global_settings.dart';
import '../../common/classes/routes.dart';
import './models/login_request.dart';
import './models/client_item.dart';
import './services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _authService = AuthService();

  // Controllers
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _clientController = TextEditingController();

  // Selected client
  ClientItem? _selectedClient;

  // Loading state
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _clientController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedClient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a client')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final request = LoginRequest(
        clientId: _selectedClient!.id.toString(),
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      );

      final response = await _authService.login(request);

      // Store login data
      final globalSettings = Provider.of<GlobalSettings>(
        context,
        listen: false,
      );
      await globalSettings.setLoginData(response);

      // Navigate to dashboard
      if (mounted) {
        Navigator.pushReplacementNamed(context, Routes.dashBoard);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Client Selection TypeAhead
              TypeAheadFormField<ClientItem>(
                textFieldConfiguration: TextFieldConfiguration(
                  controller: _clientController,
                  decoration: const InputDecoration(
                    labelText: 'Client Name',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.business),
                  ),
                ),
                debounceDuration: const Duration(milliseconds: 500), // Debounce API calls
                minCharsForSuggestions: 2, // Only search after 2 characters
                suggestionsCallback: (pattern) async {
                  if (pattern.isEmpty) {
                    return [];
                  }
                  return await _authService.fetchClients(pattern);
                },
                itemBuilder: (context, ClientItem suggestion) {
                  return ListTile(
                    title: Text(suggestion.clientName),
                  );
                },
                onSuggestionSelected: (ClientItem suggestion) {
                  _selectedClient = suggestion;
                  _clientController.text = suggestion.clientName;
                },
                noItemsFoundBuilder: (context) {
                  return const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text('No clients found'),
                  );
                },
                loadingBuilder: (context) {
                  return const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: CircularProgressIndicator(),
                  );
                },
                validator: (value) {
                  if (_selectedClient == null) {
                    return 'Please select a client';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Username field
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'UID / Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Username is required';
                  }
                  if (value.length < 4) {
                    return 'Username must be at least 4 characters';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Password field
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Password is required';
                  }
                  if (value.length < 8) {
                    return 'Password must be at least 8 characters';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 24),

              // Login button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Login',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

### Phase 5: Dashboard Integration

#### 5.1 Update Dashboard to Use New Login Data
**File:** `lib/features/dashboard/dashboard_page.dart`

Update to use `UserPayload` from `GlobalSettings`:

```dart
// In DashboardPage
@override
Widget build(BuildContext context) {
  final globalSettings = Provider.of<GlobalSettings>(context);
  final userPayload = globalSettings.userPayload;

  if (userPayload == null) {
    // Not logged in, redirect to login
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Navigator.pushReplacementNamed(context, Routes.login);
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }

  // ... rest of dashboard code using userPayload
}
```

#### 5.2 Update Dashboard App Bar
**File:** `lib/features/dashboard/widgets/dashboard_app_bar.dart`

Update to display user info from new payload:

```dart
// Show current user name
Text(userPayload.userDetails.userName ?? 'User')

// Show current BU code
Text(userPayload.allBusinessUnits.isNotEmpty
    ? userPayload.allBusinessUnits[0].buCode
    : 'N/A')
```

---

### Phase 6: Protected Routes

#### 6.1 Create Route Guard Widget
**File:** `lib/common/widgets/protected_route.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../classes/global_settings.dart';
import '../classes/routes.dart';

class ProtectedRoute extends StatelessWidget {
  final Widget child;

  const ProtectedRoute({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<GlobalSettings>(
      builder: (context, globalSettings, _) {
        if (!globalSettings.isLoggedIn) {
          // Redirect to login if not authenticated
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.pushReplacementNamed(context, Routes.login);
          });
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return child;
      },
    );
  }
}
```

#### 6.2 Wrap Protected Pages
Update all pages that require authentication:

```dart
// In main.dart or route configuration
Routes.dashBoard: (context) => const ProtectedRoute(
  child: DashboardPage(),
),
Routes.accounts: (context) => const ProtectedRoute(
  child: AccountsPage(),
),
// ... etc for other routes
```

---

### Phase 7: Logout Implementation

#### 7.1 Update Logout in Dashboard App Bar
**File:** `lib/features/dashboard/widgets/dashboard_app_bar.dart`

```dart
// In logout button handler
onPressed: () async {
  final globalSettings = Provider.of<GlobalSettings>(
    context,
    listen: false,
  );

  await globalSettings.clearLoginData();

  if (mounted) {
    Navigator.pushReplacementNamed(context, Routes.login);
  }
},
```

---

### Phase 8: Testing & Validation

#### 8.1 Test Cases

1. **Login Flow:**
   - Test with super admin credentials (superAdmin / superadmin@123)
   - Test with regular user credentials
   - Test with invalid credentials
   - Test with missing fields
   - Test with inactive user

2. **Client Selection:**
   - Test autocomplete search
   - Test selecting different clients
   - Test validation when no client selected

3. **Navigation:**
   - Test redirect to dashboard after successful login
   - Test protected route access when logged in
   - Test protected route redirect when not logged in

4. **Token Management:**
   - Test token storage in secure storage
   - Test token retrieval on app restart
   - Test Bearer token in API requests

5. **Logout:**
   - Test logout clears all data
   - Test logout redirects to login
   - Test cannot access protected routes after logout

---

## Migration Strategy

### Step 1: Backup Current Code
- Create a new git branch: `feature/rest-api-login`
- Commit current state

### Step 2: Install Dependencies
- Add packages to `pubspec.yaml`
- Run `flutter pub get`

### Step 3: Create Models
- Create all model files in Phase 1.2
- Run build_runner to generate serialization code
- Verify no compilation errors

### Step 4: Create Service Layer
- Implement `AuthService`
- Test API calls with Postman or curl first

### Step 5: Update State Management
- Update `GlobalSettings` with new methods
- Keep old methods temporarily for fallback

### Step 6: Update UI
- Update `LoginPage` with new design
- Keep old login page as `LoginPageOld` temporarily

### Step 7: Update Dashboard
- Update dashboard to use new data structure
- Test navigation flow

### Step 8: Add Route Protection
- Implement `ProtectedRoute` widget
- Wrap all protected pages

### Step 9: Testing
- Manual testing of all flows
- Fix any bugs
- Remove old/unused code

### Step 10: Cleanup
- Remove old GraphQL login code
- Remove demo login if not needed
- Remove `LoginPageOld`
- Update documentation

---

## Key Differences from Current Implementation

| Aspect | Current (GraphQL) | New (REST API) |
|--------|------------------|----------------|
| **Endpoint** | `/graphql` | `/api/login` |
| **Method** | GraphQL query | POST with form data |
| **Client Selection** | None | TypeAhead autocomplete |
| **Request Format** | Base64 encoded credentials | Form fields: clientId, username, password |
| **Response** | Custom GraphQL response | JWT + comprehensive payload |
| **Token Type** | Custom token | JWT Bearer token |
| **State Management** | GraphQL client | Provider + http |
| **Security** | GraphQL queries | Bearer token in headers |

---

## Error Handling

Implement user-friendly error messages for common error codes:

| Error Code | User Message |
|-----------|-------------|
| e1003 | "Please enter both username and password" |
| e1004 | "Invalid username or password" |
| e1007 | "Username or email not found for this client" |
| e1008 | "Your account has been deactivated. Please contact support." |
| e1009 | "Incorrect password. Please try again." |
| NETWORK_ERROR | "Unable to connect to server. Please check your internet connection." |

---

## Security Considerations

1. **Token Storage:** Use `flutter_secure_storage` for access token
2. **Password Handling:** Never log or store password
3. **HTTPS:** In production, use HTTPS (not HTTP)
4. **Token Expiration:** Handle 24-hour token expiration gracefully
5. **Logout on Token Expiry:** Clear data if API returns 401
6. **Input Validation:** Validate all inputs client-side before sending

---

## Configuration

### Development vs Production

Create environment configuration:

**File:** `lib/config/environment.dart`
```dart
class Environment {
  static const String apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:8000');

  static const bool isProduction =
      bool.fromEnvironment('dart.vm.product');
}
```

Use in `AuthService`:
```dart
static final String baseUrl = Environment.apiBaseUrl;
```

---

## Success Criteria

✅ User can select client from autocomplete dropdown
✅ User can login with valid credentials
✅ Invalid credentials show appropriate error
✅ Access token stored securely
✅ Dashboard appears after successful login
✅ User data available throughout app
✅ Protected routes require authentication
✅ Logout clears all data and redirects to login
✅ App remembers login state on restart
✅ No secured controls or forgot password features (as requested)

---

## Timeline Estimate

- Phase 1 (Dependencies & Models): 2-3 hours
- Phase 2 (API Service): 1-2 hours
- Phase 3 (State Management): 1-2 hours
- Phase 4 (UI Implementation): 2-3 hours
- Phase 5 (Dashboard Integration): 1-2 hours
- Phase 6 (Protected Routes): 1 hour
- Phase 7 (Logout): 0.5 hour
- Phase 8 (Testing): 2-3 hours

**Total:** 10-16 hours

---

## Notes

- The plan excludes secured controls functionality as requested
- The plan excludes forgot password functionality as requested
- Local server URL is `http://localhost:8000`
- JWT tokens expire after 24 hours (configurable on backend)
- User can be super admin (type 'S'), admin (type 'A'), or business user (type 'B')

---

## Next Steps

1. Review this plan with team/stakeholders
2. Set up development branch
3. Begin implementation Phase 1
4. Test each phase before moving to next
5. Document any deviations or issues encountered
