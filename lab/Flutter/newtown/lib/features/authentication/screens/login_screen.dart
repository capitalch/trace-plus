import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '/local_storage/token_storage.dart';
import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/colors.dart';
import '/utils/loading_indicator.dart';
import '/utils/screen_size.dart';
import '/utils/snack_bar_message.dart';
import '/utils/validator.dart';
import '../../other/widgets/custom_app_bar.dart';
import '../../other/widgets/custom_divider.dart';
import '../../other/widgets/custom_text_field.dart';
import '../../other/widgets/jin_logo_with_text.dart';
import '../../other/widgets/primary_button.dart';
import '../../profile/job_preference/services/job_preferences_provider.dart';
import '../services/auth_service.dart';
import '../widgets/social_auth_button.dart';

class LoginScreen extends StatelessWidget {
  LoginScreen({
    Key? key,
  }) : super(key: key);

  final _mobileOtpAuth = MobileOTPAuth();
  final _googleAuthService = GoogleAuthService();
  final _fbAuthService = FacebookAuthService();

  final screenSize = ScreenSize.instance;
  final tokenStorage = TokenStorage.instance;
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.symmetric(horizontal: screenSize.width(4)),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                CustomAppBar(),
                JINLogoWithText(),
                SizedBox(height: screenSize.height(3)),
                Text(
                  'Login',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: screenSize.height(1.5)),
                Text(
                  'Login to get notification about your job',
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: screenSize.height(1)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SocialAuthButton(
                      iconPath: AssetsPath.facebookIcon,
                      buttonColor: facebookButtonColor,
                      label: 'Facebook',
                      onTap: () => _onTapFacebookButton(context),
                    ),
                    SocialAuthButton(
                      iconPath: AssetsPath.googleIcon,
                      buttonColor: googleButtonColor,
                      label: 'Google',
                      onTap: () => _onTapGoogleButton(context),
                    ),
                  ],
                ),
                SizedBox(height: screenSize.height(4)),
                CustomDivider(),
                SizedBox(height: screenSize.height(4)),
                Text('Enter your Mobile Number to get verified'),
                SizedBox(height: screenSize.height(1)),
                CustomTextField(
                  labelText: 'Mobile Number',
                  keyboardType: TextInputType.phone,
                  onChanged: (val) {
                    _mobileOtpAuth.authCred.mobile = val;
                  },
                  validator: PhoneValidator(),
                  autofillHints: [AutofillHints.telephoneNumberNational],
                ),
                SizedBox(height: screenSize.height(3)),
                PrimaryButton(
                  onPressed: () => _onTapGetVerificationCode(context),
                  text: 'Get Verification Code',
                ),
                SizedBox(height: screenSize.height(2)),
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(
                        context, RouteNames.authSignup);
                  },
                  child: Text('Register'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _onTapGetVerificationCode(BuildContext context) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    FocusScope.of(context).unfocus();
    await _performLogin(context, _mobileOtpAuth);
  }

  void _onTapGoogleButton(BuildContext context) async {
    await _performLogin(context, _googleAuthService);
  }

  void _onTapFacebookButton(BuildContext context) async {
    await _performLogin(context, _fbAuthService);
  }

  Future<void> _performLogin(
      BuildContext context, AuthService authService) async {
    LoadingIndicator.show(context);
    final response = await authService.login();
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
        // navigation after otp login
        case RouteNames.verifyMobileOtp:
          Navigator.pushNamed(context, response.data.nextScreen,
              arguments: response.data.token);
          break;

        // navigation after social login
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
