class AuthCredential {
  String firstName = '';
  String lastName = '';
  String mobile = '';
  String email = '';

  Map<String, dynamic> toJsonForOTPSignUp() => {
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        ...toJsonForLogin(),
      };

  Map<String, dynamic> toJsonForLogin() => {
        'mobile': mobile,
      };
}

