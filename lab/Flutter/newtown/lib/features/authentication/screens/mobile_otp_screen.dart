import 'package:flutter/material.dart';

import '/local_storage/token_storage.dart';
import '/utils/screen_size.dart';
import '../../other/widgets/custom_app_bar.dart';
import '../../other/widgets/jin_logo_with_text.dart';
import '../services/verification_service.dart';
import '../widgets/otp_dialog.dart';

class MobileVerificationScreen extends StatelessWidget {
  final String token;
  final VerificationService verificationService;
  const MobileVerificationScreen({
    required this.token,
    required this.verificationService,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = ScreenSize.instance;

    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.symmetric(horizontal: screenSize.width(4)),
          child: ListView(
            children: [
              CustomAppBar(),
              JINLogoWithText(),
              SizedBox(height: screenSize.height(3)),
              Text('Enter OTP sent to your Mobile'),
              SizedBox(height: screenSize.height(1)),
              OTPDialog(
                tokenStorage: TokenStorage.instance,
                verificationService: verificationService,
                token: token,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
