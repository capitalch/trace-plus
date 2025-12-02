import '/api/api.dart';
import '/api/server_response.dart';
import '/routes/route_names.dart';
import '/utils/device.dart';
import '../models/auth_credential.dart';
import 'capture_service.dart';
import 'social_auth_provider.dart';

const String _emptyText = '';

abstract class AuthService {
  final String _signupEndpoint = '/auth/signup';
  final String _loginEndpoint = '/auth/login';
  final String _logoutEndpoint = '/auth/logout';

  final _api = DioApi();

  Future<AuthResponse> signUp();
  Future<AuthResponse> login();

  Future<AuthResponse> logout(String token) async {
    final ServerResponse response =
        await _api.post(_logoutEndpoint, headers: {'token': token});
    return _onResponse(response);
  }

  AuthResponse _onResponse(ServerResponse response) {
    if (response.success) {
      return AuthResponse.success(response.data);
    }
    return AuthResponse.failed(response.error);
  }

  CaptureService get captureService => CaptureService.empty();
}

class MobileOTPAuth extends AuthService {
  static const _authType = 'mobile_otp';
  final AuthCredential authCred;

  MobileOTPAuth() : authCred = AuthCredential();

  @override
  Future<AuthResponse> signUp() async {
    final body = {
      "auth_type": _authType,
      _authType: authCred.toJsonForOTPSignUp(),
      "device_type": Device.type,
    };
    final ServerResponse response =
        await _api.post(_signupEndpoint, body: body);
    return _onResponse(response);
  }

  @override
  Future<AuthResponse> login() async {
    final body = {
      "auth_type": _authType,
      _authType: authCred.toJsonForLogin(),
      "device_type": Device.type,
    };

    final ServerResponse response = await _api.post(_loginEndpoint, body: body);
    return _onResponse(response);
  }
}

abstract class SocialAuthService extends AuthService {
  late CaptureService _captureService;

  @override
  CaptureService get captureService => _captureService;

  String get authType;
  SocialAuthProvider get authProvider;

  @override
  Future<AuthResponse> signUp() async {
    return await _authenticate(_signupEndpoint);
  }

  @override
  Future<AuthResponse> login() async {
    return await _authenticate(_loginEndpoint);
  }

  Future<AuthResponse> _authenticate(String endpoint) async {
    final userCredential = await authProvider.authenticate();
    if (userCredential.isAuthenticated) {
      final body = {
        "auth_type": authType,
        authType: userCredential.toJson(),
        "device_type": Device.type,
      };
      final ServerResponse response = await _api.post(endpoint, body: body);

      if (response.success) {
        final authResponse = AuthResponse.success(response.data);

        _captureService = CaptureService(
            data: CaptureData(
          token: authResponse.data.token,
          valuesToCapture: response.data['data']['data'] ?? [],
          credential: AuthCredential()
            ..firstName = userCredential.firstName
            ..lastName = userCredential.lastName
            ..email = userCredential.email
            ..mobile = userCredential.mobile,
        ));

        // logout after getting user details
        await authProvider.logout();
        return authResponse;
      }
      return AuthResponse.failed(response.error);
    }
    return userCredential.errorResponse!;
  }
}

class FacebookAuthService extends SocialAuthService {
  static const _authType = 'facebook';
  final SocialAuthProvider _authProvider;

  FacebookAuthService() : _authProvider = FacebookAuthProvider();

  @override
  SocialAuthProvider get authProvider => _authProvider;

  @override
  String get authType => _authType;
}

class GoogleAuthService extends SocialAuthService {
  static const _authType = 'google';
  final SocialAuthProvider _authProvider;

  GoogleAuthService() : _authProvider = GoogleAuthProvider();

  @override
  SocialAuthProvider get authProvider => _authProvider;

  @override
  String get authType => _authType;
}

class AuthResponse {
  final bool success;
  final AuthError error;
  final AuthData data;

  AuthResponse.success(Map<String, dynamic> json)
      : success = true,
        data = AuthData.fromJson(json['data'] ?? {}),
        error = const AuthError.empty();

  AuthResponse.failed(Map<String, dynamic> json)
      : success = false,
        error = AuthError.fromJson(json['error'] ?? {}),
        data = const AuthData.empty();

  AuthResponse.error({String? errorCode, String? msg})
      : success = false,
        error = AuthError(
          code: errorCode ?? 'Unknown',
          msg: msg ?? 'OOPS! Something wrong.',
        ),
        data = const AuthData.empty();
}

class AuthError {
  final String code;
  final String msg;

  const AuthError.empty({this.code = '', this.msg = ''});

  const AuthError({required this.code, required this.msg});

  factory AuthError.fromJson(Map<String, dynamic> json) => AuthError(
        code: json['code'] ?? _emptyText,
        msg: json['message'] ?? _emptyText,
      );
}

class AuthData {
  final String token;
  final String msg;
  final String nextScreen;

  const AuthData({
    required this.token,
    required this.msg,
    required this.nextScreen,
  });

  const AuthData.empty()
      : token = _emptyText,
        msg = _emptyText,
        nextScreen = RouteNames.undefined;

  factory AuthData.fromJson(Map<String, dynamic> json) => AuthData(
        token: json['token'] ?? _emptyText,
        msg: json['message'] ?? _emptyText,
        nextScreen: _getScreenRouteName(json['next'] ?? ''),
      );

  // These Keywords are define in server
  // Keywords are mapped to respective routes in app.
  // **** Don't change key words without server permission ****
  static const Map<String, String> _nextScreenMap = {
    "EMAIL_OTP_VERIFICATION": RouteNames.verifyEmailOtp,
    "DASHBOARD": RouteNames.dashboard,
    "MOBILE_OTP_VERIFICATION": RouteNames.verifyMobileOtp,
    "CAPTURE": RouteNames.authCapture,
    //"RESETPASSWORD": RouteNames.dashboard,  // Not for mobile
    "LOGIN": RouteNames.authLogin,
    "JOB_PREFERENCE": RouteNames.profileOnSignUp,
  };

  static String _getScreenRouteName(String routeFromServer) {
    if (routeFromServer.isNotEmpty &&
        _nextScreenMap.containsKey(routeFromServer)) {
      return _nextScreenMap[routeFromServer]!;
    }
    return RouteNames.undefined;
  }
}
