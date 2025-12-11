class LoginRequest {
  final int clientId;
  final String username;
  final String password;

  LoginRequest({
    required this.clientId,
    required this.username,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'clientId': clientId,
      'username': username,
      'password': password, // Will be base64 encoded before sending
    };
  }
}
