import '/api/api.dart';
import '/api/server_response.dart';
import '/utils/device.dart';
import 'auth_service.dart';

abstract class VerificationService {
  final _api = DioApi();

  Future<AuthResponse> verify(String otp, String token) async {
    final Map<String, dynamic> body = {
      "otp": otp,
      "device_type": Device.type,
    };
    final ServerResponse response =
        await _api.post(endpoint, body: body, headers: {'token': token});
    return _onResponse(response);
  }

  AuthResponse _onResponse(ServerResponse response) {
    if (response.success) {
      return AuthResponse.success(response.data);
    }
    return AuthResponse.failed(response.error);
  }

  Future<AuthResponse> resendOTP(String token) async {
    final ServerResponse response =
        await _api.post('/auth/resend_otp', headers: {'token': token});
    return _onResponse(response);
  }

  String get endpoint;
}

class EmailVerificationService extends VerificationService {
  final String _endpoint = '/auth/email_otp_verify';

  @override
  String get endpoint => _endpoint;
}

class MobileVerificationService extends VerificationService {
  final String _endpoint = '/auth/mobile_otp_verify';

  @override
  String get endpoint => _endpoint;
}
