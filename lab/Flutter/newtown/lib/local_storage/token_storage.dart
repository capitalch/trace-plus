import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class TokenStorage {
  final _tokenKey = 'token';

  Future<bool> updateToken(String token);

  Future<bool> removeToken();

  /// returns empty string if token not exist
  Future<String> getToken();

  Future<bool> get isTokenExist async {
    final token = await getToken();
    return token.isNotEmpty;
  }

  static TokenStorage get instance => SecureTokenStorage._instance;
}

class SecureTokenStorage extends TokenStorage {
  static SecureTokenStorage? _secureTokenStorage;

  static SecureTokenStorage get _instance {
    if (_secureTokenStorage == null) {
      _secureTokenStorage = SecureTokenStorage._();
    }
    return _secureTokenStorage!;
  }

  SecureTokenStorage._();

  final _secureStorage = FlutterSecureStorage();

  @override
  Future<String> getToken() async {
    final token = await _secureStorage.read(key: _tokenKey);
    if (token != null) {
      return token;
    }
    return '';
  }

  @override
  Future<bool> updateToken(String token) async {
    try {
      await _secureStorage.write(key: _tokenKey, value: token);
      return true;
    } catch (e) {
      print('----Error in updating token in Flutter Secure Storage---');
      print('Error: $e');
      return false;
    }
  }

  @override
  Future<bool> removeToken() async {
    try {
      await _secureStorage.delete(key: _tokenKey);
      return true;
    } catch (e) {
      print('----Error in deleting token in Flutter Secure Storage---');
      print('Error: $e');
      return false;
    }
  }
}
