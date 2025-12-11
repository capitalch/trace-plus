/// Form validation utilities
class Validators {
  /// Validates username or email field
  /// - Required field
  /// - Minimum 4 characters
  /// - Can be UID or email format
  static String? validateUserNameOrEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Username or Email is required';
    }

    if (value.trim().length < 4) {
      return 'Minimum 4 characters required';
    }

    return null;
  }

  /// Validates password field
  /// - Required field
  /// - Minimum 8 characters
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }

    if (value.length < 8) {
      return 'Minimum 8 characters required';
    }

    return null;
  }

  /// Validates that a value is not empty
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  /// Validates email format (optional, for future use)
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email);
  }
}
