import 'package:json_annotation/json_annotation.dart';
import 'user_payload.dart';

part 'login_response.g.dart';

@JsonSerializable()
class LoginResponse {
  final String accessToken;
  final UserPayload payload;

  LoginResponse({
    required this.accessToken,
    required this.payload,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}
