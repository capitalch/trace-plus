import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '/local_storage/token_storage.dart';
import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/colors.dart';
import '/utils/layout.dart';
import '/utils/loading_indicator.dart';
import '/utils/screen_size.dart';
import '/utils/snack_bar_message.dart';
import '/utils/validator.dart';
import '../../other/widgets/country_picker_widget.dart';
import '../../other/widgets/custom_app_bar.dart';
import '../../other/widgets/custom_divider.dart';
import '../../other/widgets/custom_text_field.dart';
import '../../other/widgets/jin_logo_with_text.dart';
import '../../profile/job_preference/services/job_preferences_provider.dart';
import '../services/auth_service.dart';
import '../widgets/social_auth_button.dart';

class SignUpScreen extends StatelessWidget {
  SignUpScreen({
    Key? key,
  }) : super(key: key);

  final _fbAuthService = FacebookAuthService();
  final _googleAuthService = GoogleAuthService();
  final _mobileOtpAuth = MobileOTPAuth();

  final _formKey = GlobalKey<FormState>();
  final _screenSize = ScreenSize.instance;
  final tokenStorage = TokenStorage.instance;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0.scale),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                CustomAppBar(),
                JINLogoWithText(),
                SizedBox(height: _screenSize.height(3)),
                Text(
                  'Sign Up',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: _screenSize.height(1.5)),
                Text(
                  '"Recruiters prefer profiles which have verified Email and Mobile Number"',
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: _screenSize.height(1)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: SocialAuthButton(
                        iconPath: AssetsPath.facebookIcon,
                        buttonColor: facebookButtonColor,
                        label: 'Facebook',
                        onTap: () => _onTapFacebookAuthButton(context),
                      ),
                    ),
                    Flexible(
                      child: SocialAuthButton(
                        iconPath: AssetsPath.googleIcon,
                        buttonColor: googleButtonColor,
                        label: 'Google',
                        onTap: () => _onTapGoogleAuthButton(context),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 24.0.scale),
                CustomDivider(),
                SizedBox(height: 24.0.scale),
                Text('Complete your account details'),
                SizedBox(height: 12.0.scale),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                        child: CustomTextField(
                      labelText: 'First Name',
                      textInputAction: TextInputAction.next,
                      onChanged: (val) {
                        _mobileOtpAuth.authCred.firstName = val;
                      },
                      validator: EmptyValidator(
                        errorMsg: 'Enter your first name',
                      ),
                    )),
                    SizedBox(width: 13.0.scale),
                    Expanded(
                        child: CustomTextField(
                      labelText: 'Last Name',
                      textInputAction: TextInputAction.next,
                      onChanged: (val) {
                        _mobileOtpAuth.authCred.lastName = val;
                      },
                      validator: EmptyValidator(
                        errorMsg: 'Enter your last name',
                      ),
                    )),
                  ],
                ),
                CustomTextField(
                  labelText: 'Email ID',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  onChanged: (val) {
                    _mobileOtpAuth.authCred.email = val;
                  },
                  validator: EmailValidator(),
                  autofillHints: [AutofillHints.email],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: kToolbarHeight,
                      padding: EdgeInsets.only(left: 8.scale),
                      decoration: BoxDecoration(
                          color: Color(0xFFF0F0F0),
                          borderRadius: BorderRadius.circular(8.0.scale)),
                      child: CountryPickerWidget(
                        onChanged: print,
                      ),
                    ),
                    SizedBox(width: 13.0.scale),
                    Expanded(
                      child: CustomTextField(
                        labelText: 'Mobile No',
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.done,
                        onChanged: (val) {
                          _mobileOtpAuth.authCred.mobile = val;
                        },
                        validator: PhoneValidator(),
                        autofillHints: [AutofillHints.telephoneNumberNational],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 28.0.scale),
                ElevatedButton(
                  onPressed: () => _onTapGetVerificationCode(context),
                  child: Text('Get Verification Code'),
                  style: ElevatedButton.styleFrom(
                    fixedSize: Size(double.maxFinite, _screenSize.height(7)),
                  ),
                ),
                SizedBox(height: 16.0.scale),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Already have an account ?'),
                    TextButton(
                      onPressed: () {
                        Navigator.pushReplacementNamed(
                            context, RouteNames.authLogin);
                      },
                      child: Text('Login'),
                      style: TextButton.styleFrom(
                        alignment: Alignment.centerLeft,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _onTapGoogleAuthButton(BuildContext context) async {
    await _performSignUp(context, _googleAuthService);
  }

  void _onTapFacebookAuthButton(BuildContext context) async {
    await _performSignUp(context, _fbAuthService);
  }

  Future<void> _onTapGetVerificationCode(BuildContext context) async {
    // if (!_formKey.currentState!.validate()) {
    //   return;
    // }
    FocusScope.of(context).unfocus();
    await _performSignUp(context, _mobileOtpAuth);
  }

  Future<void> _performSignUp(
      BuildContext context, AuthService authService) async {
    LoadingIndicator.show(context);
    final response = await authService.signUp();
    if (response.success) {
      final nextScreen = response.data.nextScreen;
      if (_shouldUpdateToken(nextScreen)) {
        await tokenStorage.updateToken(response.data.token);
      }

      if (_shouldFetchJobPreferences(nextScreen)) {
        await context.read<JobPreferenceProvider>().fetchJobPreferences();
      }

      LoadingIndicator.close(context);

      switch (nextScreen) {
        // mobile OTP sign up navigation
        case RouteNames.verifyEmailOtp:
          Navigator.pushNamed(context, nextScreen,
              arguments: response.data.token);
          break;
        case RouteNames.authLogin:
          SnackBarMessage.show(context, response.data.msg);
          Navigator.pushReplacementNamed(context, nextScreen);
          break;

        // social sign up navigation
        case RouteNames.authCapture:
          Navigator.pushNamed(context, nextScreen,
              arguments: authService.captureService);
          break;
        case RouteNames.profileOnSignUp:
          Navigator.pushNamedAndRemoveUntil(
              context, RouteNames.dashboard, (route) => false);
          Navigator.pushNamed(context, nextScreen);
          break;
        case RouteNames.dashboard:
          Navigator.pushNamedAndRemoveUntil(
              context, nextScreen, (route) => false);
          break;

        default:
          Navigator.pushNamed(context, RouteNames.undefined);
      }
    } else {
      LoadingIndicator.close(context);
      SnackBarMessage.show(context, response.error.msg);
    }
  }

  bool _shouldUpdateToken(String nextScreen) {
    return nextScreen == RouteNames.profileOnSignUp ||
        nextScreen == RouteNames.dashboard;
  }

  bool _shouldFetchJobPreferences(String nextScreen) {
    return nextScreen == RouteNames.dashboard;
  }
}
