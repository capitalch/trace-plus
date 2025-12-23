import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorageService {
  static const String _tokenKey = 'access_token';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  /// Save access token to secure storage
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
    } catch (e) {
      throw Exception('Failed to save token: $e');
    }
  }

  /// Retrieve token from secure storage
  Future<String?> getToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (e) {
      throw Exception('Failed to retrieve token: $e');
    }
  }

  /// Remove token from secure storage (used on logout)
  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _tokenKey);
    } catch (e) {
      throw Exception('Failed to delete token: $e');
    }
  }

  /// Check if token exists in storage
  Future<bool> hasToken() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      return token != null && token.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}
