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
