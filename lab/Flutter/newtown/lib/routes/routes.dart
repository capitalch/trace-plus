import 'package:flutter/material.dart';

import '/features/authentication/screens/auth_capture_screen.dart';
import '/features/authentication/screens/email_otp_screen.dart';
import '/features/authentication/screens/login_screen.dart';
import '/features/authentication/screens/mobile_otp_screen.dart';
import '/features/authentication/screens/sign_up_screen.dart';
import '/features/authentication/services/capture_service.dart';
import '/features/authentication/services/verification_service.dart';
import '../features/dashboard/dashboard_screen.dart';
import '/features/other/screens/on_boarding_screen.dart';
import '/features/other/screens/splash_screen.dart';
import '/features/other/screens/undefine_route_screen.dart';
import '/features/profile/job_preference/models/job_preference.dart';
import '/features/profile/job_preference/screens/job_preferences_form_screen.dart';
import '/features/profile/job_preference/screens/job_preferences_screen.dart';
import '/features/profile/personal_info/models/personal_info.dart';
import '/features/profile/personal_info/screens/personal_info_form.dart';
import '/features/profile/profile_screen_on_sign_up.dart';
import '/features/profile/work_experience/models/work_experience.dart';
import '/features/profile/work_experience/screens/work_experience_form_screen.dart';
import '/features/profile/work_experience/screens/work_experience_types_screen.dart';
import '/features/profile/work_experience/screens/work_experiences_screen.dart';
import 'route_names.dart';

class RouteGenerator {
  Route<dynamic> generateRoute(RouteSettings settings) {
    // Getting arguments passed in while calling Navigator.pushNamed
    final Object? args = settings.arguments;

    return MaterialPageRoute(
        settings: settings,
        builder: (_) {
          switch (settings.name) {
            case RouteNames.splashScreen:
              return SplashScreen();

            case RouteNames.onBoarding:
              return OnBoardingScreen();

            case RouteNames.authSignup:
              return SignUpScreen();

            case RouteNames.authLogin:
              return LoginScreen();

            case RouteNames.authCapture:
              final captureService = args! as CaptureService;
              return AuthCaptureScreen(captureService: captureService);

            case RouteNames.verifyEmailOtp:
              final String token = args! as String;
              return EmailVerificationScreen(
                token: token,
                verificationService: EmailVerificationService(),
              );

            case RouteNames.verifyMobileOtp:
              final String token = args! as String;
              return MobileVerificationScreen(
                token: token,
                verificationService: MobileVerificationService(),
              );

            case RouteNames.profileOnSignUp:
              return ProfileScreenOnSignUp();

            case RouteNames.jobPreferences:
              return JobPreferencesScreen();

            case RouteNames.jobPreferencesForm:
              return JobPreferencesFormScreen(
                jobPreference:
                    args == null ? JobPreference() : args as JobPreference,
              );

            case RouteNames.dashboard:
              return DashboardScreen();

            case RouteNames.workExperiences:
              return WorkExperiencesScreen();

            case RouteNames.workExperienceTypes:
              return WorkExperienceTypesScreen();

            case RouteNames.workExperienceForm:
              return WorkExperienceFormScreen(
                experience:
                    args == null ? WorkExperience() : args as WorkExperience,
              );

            case RouteNames.personalInfoForm:
              return PersonalInfoForm(
                info: args == null ? PersonalInfo() : args as PersonalInfo,
              );

            case RouteNames.undefined:
            default:
              return UndefineRouteScreen();
          }
        });
  }
}
