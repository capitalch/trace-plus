class AuthService {
  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  // Simple in-memory auth state
  bool _isLoggedIn = false;
  String? _accessToken;
  Map<String, dynamic>? _userData;

  // Getters
  bool get isLoggedIn => _isLoggedIn;
  String? get accessToken => _accessToken;
  Map<String, dynamic>? get userData => _userData;

  /// Check if user is authenticated
  Future<bool> checkAuthStatus() async {
    // TODO: In future steps, check secure storage for saved token
    // For now, return the in-memory state
    await Future.delayed(const Duration(milliseconds: 500)); // Simulate storage check
    return _isLoggedIn;
  }

  /// Login user
  Future<void> login({
    required String token,
    Map<String, dynamic>? userData,
  }) async {
    _isLoggedIn = true;
    _accessToken = token;
    _userData = userData;

    // TODO: Save to secure storage in future steps
  }

  /// Logout user
  Future<void> logout() async {
    _isLoggedIn = false;
    _accessToken = null;
    _userData = null;

    // TODO: Clear secure storage in future steps
  }

  /// Clear all auth data
  void clear() {
    _isLoggedIn = false;
    _accessToken = null;
    _userData = null;
  }
}
