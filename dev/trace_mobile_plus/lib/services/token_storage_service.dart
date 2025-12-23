import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class TokenStorageService {
  static const String _tokenKey = 'access_token';
  static const String _appSettingsKey = 'app_settings';

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

  /// Save AppSettings to secure storage
  Future<void> saveAppSettings(Map<String, dynamic> appSettingsData) async {
    try {
      final jsonString = jsonEncode(appSettingsData);
      await _storage.write(key: _appSettingsKey, value: jsonString);
    } catch (e) {
      throw Exception('Failed to save AppSettings: $e');
    }
  }

  /// Retrieve AppSettings from secure storage
  Future<Map<String, dynamic>?> getAppSettings() async {
    try {
      final jsonString = await _storage.read(key: _appSettingsKey);
      if (jsonString == null || jsonString.isEmpty) {
        return null;
      }
      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to retrieve AppSettings: $e');
    }
  }

  /// Remove AppSettings from secure storage
  Future<void> deleteAppSettings() async {
    try {
      await _storage.delete(key: _appSettingsKey);
    } catch (e) {
      throw Exception('Failed to delete AppSettings: $e');
    }
  }

  /// Check if AppSettings exists in storage
  Future<bool> hasAppSettings() async {
    try {
      final data = await _storage.read(key: _appSettingsKey);
      return data != null && data.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}
