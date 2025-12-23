import 'package:http/http.dart' as http;
import 'dart:convert';
import 'token_storage_service.dart';
import 'graphql_service.dart';
import '../models/client_model.dart';
import '../models/login_request_model.dart';
import '../models/login_response_model.dart';
import '../core/app_constants.dart'

class AuthService {
  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  static const String baseUrl = 'http://localhost:8000';
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

    // Refresh GraphQL client to remove token from headers
    await _graphqlService.refreshClient();
  }

  /// Clear all auth data
  void clear() {
    _isLoggedIn = false;
    _accessToken = null;
    _userData = null;
  }

  /// Fetch clients based on search criteria
  Future<List<ClientModel>> fetchClients(String searchTerm) async {
    try {
      final url = Uri.parse('$baseUrl/api/login-clients');
      final body = jsonEncode({
        'criteria': searchTerm,
      });

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        return jsonList.map((json) => ClientModel.fromJson(json)).toList();
      } else if (response.statusCode == 404) {
        // No clients found
        return [];
      } else {
        // Handle other error status codes
        throw Exception('Failed to fetch clients: ${response.statusCode}');
      }
    } catch (e) {
      // Handle network errors or parsing errors
      print('Error fetching clients: $e');
      return [];
    }
  }
}
