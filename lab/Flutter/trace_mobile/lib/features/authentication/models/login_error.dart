class LoginError implements Exception {
  final String errorCode;
  final String message;
  final String? detail;

  LoginError({
    required this.errorCode,
    required this.message,
    this.detail,
  });

  factory LoginError.fromJson(Map<String, dynamic> json) {
    return LoginError(
      errorCode: json['error_code'] ?? '',
      message: json['message'] ?? 'Unknown error',
      detail: json['detail'],
    );
  }

  @override
  String toString() => message;
}
