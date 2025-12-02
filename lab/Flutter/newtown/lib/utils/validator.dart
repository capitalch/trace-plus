abstract class Validator {
  String? validate(String? val);
}

class EmptyValidator extends Validator {
  final String errorMsg;

  EmptyValidator({this.errorMsg = "Can't be empty"});
  @override
  String? validate(String? val) {
    if (val != null && val.isNotEmpty) {
      return null;
    }
    return errorMsg;
  }
}

class AlphabetsSpaceValidator extends Validator {
  final String emptyMsg;

  static const String _pattern = r'^[a-zA-z]+([\s][a-zA-Z]+)*$';
  final RegExp _regExp = RegExp(_pattern);

  AlphabetsSpaceValidator({this.emptyMsg = "Can't be empty"});
  @override
  String? validate(String? val) {
    if (val == null || val.isEmpty) {
      return emptyMsg;
    }
    if (!_regExp.hasMatch(val.trim())) {
      return 'Only alphabets and space allowed';
    }
    return null;
  }
}

class EmailValidator extends Validator {
  static const String _pattern =
      r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
  final RegExp _regExp = RegExp(_pattern);

  @override
  String? validate(String? val) {
    final isValidEmail = _regExp.hasMatch(val ?? '');
    return isValidEmail ? null : 'Enter a valid email ID';
  }
}

class PhoneValidator extends Validator {
  static const String _pattern = r'(^[0-9]{10}$)';
  final RegExp _regExp = RegExp(_pattern);

  @override
  String? validate(String? val) {
    final isValidEmail = _regExp.hasMatch(val ?? '');
    return isValidEmail ? null : 'Enter 10 digit mobile number';
  }
}

class MinimumSalaryValidator extends Validator {
  @override
  String? validate(String? val) {
    if (val != null && val.isNotEmpty && val.length <= 8) {
      return null;
    }
    return 'Please enter salary amount in max 8 digits';
  }
}

class PinCodeValidator extends Validator {
  @override
  String? validate(String? val) {
    if (val != null && val.isNotEmpty && val.length == 6) {
      return null;
    }
    return 'PIN Code should be of 6 digits';
  }
}

class UrlValidator extends Validator {
  static const String _pattern =
      r"(https?|http)://([-A-Z0-9.]+)(/[-A-Z0-9+&@#/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#/%=~_|!:‌​,.;]*)?";
  final RegExp _regExp = RegExp(_pattern, caseSensitive: false);

  @override
  String? validate(String? val) {
    final isValidEmail = _regExp.hasMatch(val ?? '');
    return isValidEmail ? null : 'Enter valid link';
  }
}

class SocialLinkValidator extends UrlValidator {
  @override
  String? validate(String? val) {
    if (val != null && val.isNotEmpty) {
      return super.validate(val);
    }
    return null;
  }
}
