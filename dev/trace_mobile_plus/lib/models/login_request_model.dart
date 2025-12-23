class LoginRequestModel {
  final String clientId;
  final String username;
  final String password;

  LoginRequestModel({
    required this.clientId,
    required this.username,
    required this.password,
  });

  /// Convert to form data for application/x-www-form-urlencoded
  Map<String, String> toFormData() {
    return {
      'clientId': clientId,
      'username': username,
      'password': password,
    };
  }

  @override
  String toString() {
    return 'LoginRequestModel(clientId: $clientId, username: $username, password: ***)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoginRequestModel &&
        other.clientId == clientId &&
        other.username == username &&
        other.password == password;
  }

  @override
  int get hashCode => clientId.hashCode ^ username.hashCode ^ password.hashCode;
}
