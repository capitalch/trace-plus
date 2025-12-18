class LoginRequest {
  final String clientId;
  final String username;
  final String password;

  LoginRequest({
    required this.clientId,
    required this.username,
    required this.password,
  });

  Map<String, dynamic> toFormData() {
    return {
      'clientId': clientId,
      'username': username,
      'password': password,
    };
  }
}
