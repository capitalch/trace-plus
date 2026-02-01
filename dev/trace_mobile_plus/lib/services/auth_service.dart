import 'package:http/http.dart' as http;
import 'dart:convert';
import 'token_storage_service.dart';
import 'graphql_service.dart';
import 'navigation_service.dart';
import '../models/client_model.dart';
import '../models/login_request_model.dart';
import '../models/login_response_model.dart';
import '../models/business_unit_model.dart';
import '../core/app_settings.dart';
import '../providers/session_provider.dart';

class AuthService {
  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  // Make baseUrl dynamic so it always reads from AppSettings
  static String get baseUrl => AppSettings.baseUrl;
  factory AuthService() => _instance;
  AuthService._internal();

  // Token storage service
  final TokenStorageService _tokenStorage = TokenStorageService();

  // GraphQL service
  final GraphQLService _graphqlService = GraphQLService();

  // Simple in-memory auth state
  bool _isLoggedIn = false;
  String? _accessToken;
  Map<String, dynamic>? _userData;

  // Getters
  bool get isLoggedIn => _isLoggedIn;
  String? get accessToken => _accessToken;
  Map<String, dynamic>? get userData => _userData;
  bool get isAuthenticated => _accessToken != null && _accessToken!.isNotEmpty;

  /// Check if user is authenticated
  Future<bool> checkAuthStatus() async {
    // Check if token exists in secure storage
    try {
      final hasToken = await _tokenStorage.hasToken();
      if (hasToken) {
        await loadStoredToken();
        return true;
      }
      return false;
    } catch (e) {
      print('Error checking auth status: $e');
      return false;
    }
  }

  /// Load stored token from secure storage
  Future<void> loadStoredToken() async {
    try {
      final token = await _tokenStorage.getToken();
      if (token != null && token.isNotEmpty) {
        _accessToken = token;
        _isLoggedIn = true;

        // Load AppSettings from secure storage
        try {
          final appSettingsData = await _tokenStorage.getAppSettings();
          if (appSettingsData != null) {
            _loadAppSettingsFromMap(appSettingsData);
          }
        } catch (e) {
          print('Error loading AppSettings from storage: $e');
        }
      }
    } catch (e) {
      print('Error loading stored token: $e');
      _accessToken = null;
      _isLoggedIn = false;
    }
  }

  /// Login user
  Future<void> login({
    required String clientId,
    required String username,
    required String password,
  }) async {
    try {
      // Create login request model
      final loginRequest = LoginRequestModel(
        clientId: clientId,
        username: username,
        password: password,
      );

      final url = Uri.parse('$baseUrl/api/login');

      // Send form-encoded request
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: loginRequest.toFormData(),
      );

      if (response.statusCode == 200) {
        // Parse response using LoginResponseModel
        final responseData = jsonDecode(response.body);
        final loginResponse = LoginResponseModel.fromJson(responseData);

        // Extract and store access token and payload
        _accessToken = loginResponse.accessToken;
        _userData = loginResponse.payload.toJson();
        _isLoggedIn = true;

        // Save token to secure storage
        await _tokenStorage.saveToken(loginResponse.accessToken);

        // Set AppSettings from login response
        await _setAppSettingsFromLoginResponse(loginResponse);

        // Refresh GraphQL client to include new token in headers
        await _graphqlService.refreshClient();
      } else if (response.statusCode == 401) {
        throw Exception('Invalid credentials');
      } else {
        throw Exception('Login failed: ${response.statusCode}');
      }
    } catch (e) {
      _isLoggedIn = false;
      _accessToken = null;
      _userData = null;
      rethrow;
    }
  }

  /// Logout user
  Future<void> logout() async {
    _isLoggedIn = false;
    _accessToken = null;
    _userData = null;

    // Clear token from secure storage
    await _tokenStorage.deleteToken();

    // Clear AppSettings
    await _clearAppSettings();

    // Refresh GraphQL client to remove token from headers
    await _graphqlService.refreshClient();
  }

  /// Handle token expiration - clears auth and redirects to login
  Future<void> handleTokenExpired([String? message]) async {
    // Clear auth state
    _isLoggedIn = false;
    _accessToken = null;
    _userData = null;

    // Clear token from secure storage
    await _tokenStorage.deleteToken();

    // Clear AppSettings
    await _clearAppSettings();

    // Refresh GraphQL client to remove token from headers
    await _graphqlService.refreshClient();

    // Set session expired message
    final sessionProvider = SessionProvider();
    sessionProvider.setSessionExpiredMessage(
      message ?? 'Your session has expired. Please login again.',
    );

    // Navigate to login page
    final navigationService = NavigationService();
    navigationService.navigateToLogin();
  }

  /// Clear all auth data
  Future<void> clear() async {
    _isLoggedIn = false;
    _accessToken = null;
    _userData = null;

    // Clear AppSettings
    await _clearAppSettings();
  }

  /// Set AppSettings from login response
  Future<void> _setAppSettingsFromLoginResponse(
    LoginResponseModel loginResponse,
  ) async {
    final userDetails = loginResponse.payload.userDetails;

    // Set user details
    AppSettings.uid = userDetails.uid;
    AppSettings.userName = userDetails.userName;
    AppSettings.userEmail = userDetails.userEmail;

    // Set client information
    AppSettings.clientId = userDetails.clientId;
    AppSettings.clientName = userDetails.clientName;
    AppSettings.clientCode = userDetails.clientCode;

    // Set user and client status
    AppSettings.userType = userDetails.userType;
    AppSettings.isUserActive = userDetails.isUserActive;
    AppSettings.isClientActive = userDetails.isClientActive;

    // Set database settings
    AppSettings.dbName = userDetails.dbName;
    AppSettings.isExternalDb = userDetails.isExternalDb;
    AppSettings.dbParams = {'conn': userDetails.dbParams};

    // Set branch and business unit IDs
    AppSettings.branchIds = userDetails.branchIds;
    AppSettings.lastUsedBuId = userDetails.lastUsedBuId;
    AppSettings.lastUsedBranchId = userDetails.lastUsedBranchId;
    AppSettings.lastUsedFinYearId = userDetails.lastUsedFinYearId;

    // Set business units
    AppSettings.allBusinessUnits = loginResponse.payload.allBusinessUnits;
    AppSettings.userBusinessUnits =
        loginResponse.payload.userBusinessUnits ?? [];

    // Save AppSettings to secure storage
    try {
      final appSettingsMap = _appSettingsToMap();
      await _tokenStorage.saveAppSettings(appSettingsMap);
    } catch (e) {
      print('Error saving AppSettings to storage: $e');
    }
  }

  /// Clear all AppSettings
  Future<void> _clearAppSettings() async {
    // Clear user details
    AppSettings.uid = null;
    AppSettings.userName = null;
    AppSettings.userEmail = null;

    // Clear client information
    AppSettings.clientId = null;
    AppSettings.clientName = null;
    AppSettings.clientCode = null;

    // Clear user and client status
    AppSettings.userType = null;
    AppSettings.isUserActive = null;
    AppSettings.isClientActive = null;

    // Clear database settings
    AppSettings.dbName = null;
    AppSettings.isExternalDb = null;
    AppSettings.dbParams = null;

    // Clear branch and business unit IDs
    AppSettings.branchIds = null;
    AppSettings.lastUsedBuId = null;
    AppSettings.lastUsedBranchId = null;
    AppSettings.lastUsedFinYearId = null;

    // Clear business units
    AppSettings.allBusinessUnits = [];
    AppSettings.userBusinessUnits = [];

    // Delete AppSettings from secure storage
    try {
      await _tokenStorage.deleteAppSettings();
    } catch (e) {
      print('Error deleting AppSettings from storage: $e');
    }
  }

  /// Convert AppSettings to Map for storage
  Map<String, dynamic> _appSettingsToMap() {
    return {
      'uid': AppSettings.uid,
      'userName': AppSettings.userName,
      'userEmail': AppSettings.userEmail,
      'clientId': AppSettings.clientId,
      'clientName': AppSettings.clientName,
      'clientCode': AppSettings.clientCode,
      'userType': AppSettings.userType,
      'isUserActive': AppSettings.isUserActive,
      'isClientActive': AppSettings.isClientActive,
      'dbName': AppSettings.dbName,
      'isExternalDb': AppSettings.isExternalDb,
      'dbParams': AppSettings.dbParams,
      'branchIds': AppSettings.branchIds,
      'lastUsedBuId': AppSettings.lastUsedBuId,
      'lastUsedBranchId': AppSettings.lastUsedBranchId,
      'lastUsedFinYearId': AppSettings.lastUsedFinYearId,
      'allBusinessUnits': AppSettings.allBusinessUnits
          .map((bu) => bu.toJson())
          .toList(),
      'userBusinessUnits': AppSettings.userBusinessUnits
          .map((bu) => bu.toJson())
          .toList(),
    };
  }

  /// Load AppSettings from Map (retrieved from storage)
  void _loadAppSettingsFromMap(Map<String, dynamic> data) {
    // Load user details
    AppSettings.uid = data['uid'] as String?;
    AppSettings.userName = data['userName'] as String?;
    AppSettings.userEmail = data['userEmail'] as String?;

    // Load client information
    AppSettings.clientId = data['clientId'] as int?;
    AppSettings.clientName = data['clientName'] as String?;
    AppSettings.clientCode = data['clientCode'] as String?;

    // Load user and client status
    AppSettings.userType = data['userType'] as String?;
    AppSettings.isUserActive = data['isUserActive'] as bool?;
    AppSettings.isClientActive = data['isClientActive'] as bool?;

    // Load database settings
    AppSettings.dbName = data['dbName'] as String?;
    AppSettings.isExternalDb = data['isExternalDb'] as bool?;
    AppSettings.dbParams = (data['dbParams'] as Map?)?.cast<String, String?>();

    // Load branch and business unit IDs
    AppSettings.branchIds = data['branchIds'] as String?;
    AppSettings.lastUsedBuId = data['lastUsedBuId'] as int?;
    AppSettings.lastUsedBranchId = data['lastUsedBranchId'] as int?;
    AppSettings.lastUsedFinYearId = data['lastUsedFinYearId'] as int?;

    // Load business units from JSON
    if (data['allBusinessUnits'] != null) {
      AppSettings.allBusinessUnits = (data['allBusinessUnits'] as List<dynamic>)
          .map((e) => BusinessUnitModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } else {
      AppSettings.allBusinessUnits = [];
    }

    if (data['userBusinessUnits'] != null) {
      AppSettings.userBusinessUnits =
          (data['userBusinessUnits'] as List<dynamic>)
              .map((e) => BusinessUnitModel.fromJson(e as Map<String, dynamic>))
              .toList();
    } else {
      AppSettings.userBusinessUnits = [];
    }
  }

  /// Fetch clients based on search criteria
  Future<List<ClientModel>> fetchClients(String searchTerm) async {
    try {
      final url = Uri.parse('$baseUrl/api/login-clients');
      final body = jsonEncode({'criteria': searchTerm});

      print('Fetching clients from: $url'); // Debug log

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout. Please check your network connection.');
        },
      );

      print('Response status: ${response.statusCode}'); // Debug log

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        final clients = jsonList.map((json) => ClientModel.fromJson(json)).toList();
        print('Found ${clients.length} clients'); // Debug log
        return clients;
      } else if (response.statusCode == 404) {
        // No clients found
        return [];
      } else {
        // Handle other error status codes
        throw Exception('Server returned error ${response.statusCode}');
      }
    } catch (e) {
      // Handle network errors or parsing errors
      print('Error fetching clients: $e');
      // Re-throw the error so it can be shown to the user
      rethrow;
    }
  }
}
