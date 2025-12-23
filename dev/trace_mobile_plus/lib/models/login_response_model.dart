import 'user_payload_model.dart';

class LoginResponseModel {
  final String accessToken;
  final UserPayloadModel payload;

  LoginResponseModel({
    required this.accessToken,
    required this.payload,
  });

  /// Create LoginResponseModel from JSON
  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      accessToken: json['accessToken'] as String,
      payload: UserPayloadModel.fromJson(json['payload'] as Map<String, dynamic>),
    );
  }

  /// Convert LoginResponseModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'payload': payload.toJson(),
    };
  }

  @override
  String toString() {
    return 'LoginResponseModel(accessToken: ${accessToken.substring(0, 20)}..., payload: $payload)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoginResponseModel &&
        other.accessToken == accessToken &&
        other.payload == payload;
  }

  @override
  int get hashCode => accessToken.hashCode ^ payload.hashCode;
}
