import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:trace_mobile/models/client.dart';
import 'package:trace_mobile/models/login_request.dart';
import 'package:trace_mobile/models/login_response.dart';

class AuthService {
  static const String _baseUrlWeb = 'https://develop.cloudjiffy.net';
  static const String _baseUrlLocal = 'http://127.0.0.1:8000';

  String get baseUrl => kReleaseMode ? _baseUrlWeb : _baseUrlLocal;

  // Fetch list of clients
  Future<List<Client>> getClients({String criteria = ''}) async {
    try {
      final url = Uri.parse('$baseUrl/api/login-clients');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({'criteria': criteria}),
      ).timeout(
        const Duration(seconds: 100),
        onTimeout: () {
          throw Exception('Connection timeout. Please check your internet connection.');
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((json) => Client.fromJson(json)).toList();
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      if (e.toString().contains('timeout') || e.toString().contains('Connection')) {
        rethrow;
      }
      throw Exception('Network error. Please check your internet connection.');
    }
  }

  // Login with REST API using form data (OAuth2PasswordRequestForm)
  Future<LoginResponse> login(LoginRequest request) async {
    try {
      final url = Uri.parse('$baseUrl/api/login');

      // Use form-data format (OAuth2PasswordRequestForm)
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: {
          'username': request.username,
          'password': request.password,
          'clientId': request.clientId.toString(),
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout. Please check your internet connection.');
        },
      );

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);

        // Debug: Print the response structure
        if (kDebugMode) {
          print('Login response body: ${response.body}');
          print('Parsed JSON keys: ${jsonData.keys.toList()}');
        }

        // Parse the response: {"accessToken": "...", "payload": {...}}
        final accessToken = jsonData['accessToken'] as String?;
        final payload = jsonData['payload'] as Map<String, dynamic>?;

        if (accessToken == null || payload == null) {
          throw Exception('Invalid server response format. Expected accessToken and payload, got: ${jsonData.keys.toList()}');
        }

        // Extract all data from payload
        final userDetails = payload['userDetails'] as Map<String, dynamic>?;
        final userBusinessUnits = payload['userBusinessUnits'] as List<dynamic>?;
        final allBusinessUnits = payload['allBusinessUnits'] as List<dynamic>?;
        final role = payload['role'] as Map<String, dynamic>?;

        // Validate required fields
        if (userDetails == null || userDetails['id'] == null || userDetails['userName'] == null || userDetails['userType'] == null) {
          throw Exception('Missing required user details in server response');
        }

        // Build comprehensive LoginResponse from all payload data
        final loginResponseData = {
          'clientId': request.clientId,
          'id': userDetails['id'],
          'uid': userDetails['userName'],
          'token': accessToken,
          'userType': userDetails['userType'],
          'lastUsedBranchId': userDetails['lastUsedBranchId'],
          'lastUsedBuCode': userDetails['lastUsedBuCode'],
          'buCodes': userBusinessUnits?.map((e) => e['buCode'] as String).toList() ?? [],
          'buCodesWithPermissions': userBusinessUnits ?? [],
          'allBusinessUnits': allBusinessUnits ?? [],
          'role': role,
          'userDetailsExtended': userDetails,
        };

        return LoginResponse.fromJson(loginResponseData);
      } else if (response.statusCode == 401) {
        // Try to parse error message from response
        try {
          final jsonData = json.decode(response.body);
          final errorMessage = jsonData['message'] ?? 'Invalid credentials';
          throw Exception(errorMessage);
        } catch (_) {
          throw Exception('Invalid credentials. Please try again.');
        }
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      if (e.toString().contains('Exception:')) {
        rethrow;
      }
      throw Exception('Network error. Please check your internet connection.');
    }
  }
}
