class TokenExpiredException implements Exception {
  final String message;

  TokenExpiredException([this.message = 'Your session has expired. Please login again.']);

  @override
  String toString() => message;
}
