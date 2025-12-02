import '/api/api.dart';
import '/api/server_response.dart';
import '../models/auth_credential.dart';
import 'auth_service.dart';

class CaptureService {
  final _api = DioApi();

  static const _captureEndpoint = '/auth/capture';

  final CaptureData data;

  CaptureService({required this.data});

  CaptureService.empty()
      : data = CaptureData(
          token: '',
          valuesToCapture: [],
          credential: AuthCredential(),
        );

  // Future<AuthResponse> capture() async {
  //   try {
  //     final Options options = Options(headers: {
  //       "token": data.token,
  //       "Content-Type": "application/json",
  //     });
  //     final Response response = await _api.dio
  //         .post('/auth/capture', data: data.toJson(), options: options);
  //
  //     Map<String, dynamic> responseJson = response.data;
  //     if (responseJson['success']) {
  //       return AuthResponse.success(responseJson);
  //     }
  //     return AuthResponse.failed(responseJson);
  //   } on DioError catch (e) {
  //     return _api.onDioError(e);
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return AuthResponse.error();
  //   }
  // }
  Future<AuthResponse> capture() async {
    final ServerResponse response = await _api.post(_captureEndpoint,
        body: data.toJson(), headers: {'token': data.token});

    if (response.success) {
      return AuthResponse.success(response.data);
    }
    return AuthResponse.failed(response.error);
  }
}

class CaptureData {
  final String token;
  final AuthCredential credential;
  final List<String> _valuesToCapture;

  bool get shouldCaptureEmail => _valuesToCapture.contains('email');
  bool get shouldCaptureMobile => _valuesToCapture.contains('mobile');

  CaptureData({
    required this.token,
    required List<dynamic> valuesToCapture,
    required this.credential,
  }) : _valuesToCapture = valuesToCapture.map((e) => e.toString()).toList();

  Map<String, dynamic> toJson() => {
        if (shouldCaptureEmail) 'email': credential.email,
        if (shouldCaptureMobile) 'mobile': credential.mobile,
      };
}
