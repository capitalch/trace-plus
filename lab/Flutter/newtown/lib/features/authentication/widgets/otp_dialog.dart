import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '/local_storage/token_storage.dart';
import '/routes/route_names.dart';
import '/utils/loading_indicator.dart';
import '/utils/screen_size.dart';
import '/utils/snack_bar_message.dart';
import '../../other/widgets/custom_text_field.dart';
import '../../profile/job_preference/services/job_preferences_provider.dart';
import '../services/auth_service.dart';
import '../services/verification_service.dart';

class OTPDialog extends StatefulWidget {
  final int otpLength;
  final TokenStorage tokenStorage;
  final VerificationService verificationService;
  final String token;

  const OTPDialog({
    Key? key,
    this.otpLength = 5,
    required this.tokenStorage,
    required this.verificationService,
    required this.token,
  }) : super(key: key);

  @override
  _OTPDialogState createState() => _OTPDialogState();
}

class _OTPDialogState extends State<OTPDialog> {
  late final List<TextEditingController> _otpControllers;
  late final List<FocusNode> _otpFocusNodes;

  String get _enteredOtp {
    String otp = '';
    _otpControllers.forEach((c) {
      otp += c.text;
    });
    return otp;
  }

  @override
  void initState() {
    super.initState();
    _otpControllers =
        List.generate(widget.otpLength, (i) => TextEditingController());
    _otpFocusNodes = List.generate(widget.otpLength, (i) => FocusNode());
  }

  @override
  void dispose() {
    _otpControllers.forEach((c) => c.dispose());
    _otpFocusNodes.forEach((n) => n.dispose());
    super.dispose();
  }

  int _currentFieldIndex = 0;

  final _wrongOTPNotifier = ValueNotifier(false);

  @override
  Widget build(BuildContext context) {
    final screenSize = ScreenSize.instance;

    return RawKeyboardListener(
      focusNode: FocusNode(),
      onKey: (event) {
        if (event is RawKeyDownEvent &&
            _isBackPressKey(event) &&
            _isNotFirstField) {
          print('Key Pressed: ${event.logicalKey.keyLabel}');
          print('CurrentIndex: $_currentFieldIndex');
          _currentFieldIndex--;
          _clearField();
          _requestFocus();
        }
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ValueListenableBuilder<bool>(
              valueListenable: _wrongOTPNotifier,
              builder: (context, isWrongOTP, _) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(
                          widget.otpLength,
                          (i) => Container(
                              width: screenSize.width(15),
                              child: CustomTextField(
                                controller: _otpControllers[i],
                                focusNode: _otpFocusNodes[i],
                                autoFocus: true,
                                keyboardType: TextInputType.number,
                                textAlign: TextAlign.center,
                                decoration: isWrongOTP
                                    ? _wrongOTPDecoration
                                    : _decoration,
                                showCursor: false,
                                textInputAction: TextInputAction.none,
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: screenSize.width(4),
                                ),
                                onChanged: (val) {
                                  if (val.isNotEmpty) {
                                    _isLastField
                                        ? _unFocus()
                                        : _handleNextFocus();
                                  }
                                },
                                onTap: () {
                                  _currentFieldIndex = i;
                                  _clearField();
                                  _requestFocus();
                                  if (_wrongOTPNotifier.value) {
                                    _wrongOTPNotifier.value = false;
                                  }
                                },
                              ))),
                    ),
                    SizedBox(height: screenSize.height(1)),
                    if (isWrongOTP)
                      Align(
                        child: Text(
                          'Enter Correct OTP',
                          style: TextStyle(
                            color: Colors.red,
                          ),
                        ),
                        alignment: Alignment.centerLeft,
                      )
                  ],
                );
              }),
          SizedBox(height: screenSize.height(4)),
          ElevatedButton(
            onPressed: _onTapVerify,
            child: Text('Verify'),
            style: ElevatedButton.styleFrom(
              fixedSize: Size(double.maxFinite, screenSize.height(7)),
            ),
          ),
          SizedBox(height: screenSize.height(2)),
          TextButton(
            onPressed: _onTapResendOTP,
            child: Text('Resend OTP'),
          ),
        ],
      ),
    );
  }

  Future<void> _onTapVerify() async {
    LoadingIndicator.show(context);

    final response =
        await widget.verificationService.verify(_enteredOtp, widget.token);
    if (response.success) {
      _handleNavigation(response);
    } else {
      LoadingIndicator.close(context);
      _wrongOTPNotifier.value = true;
      SnackBarMessage.show(context, response.error.msg);
    }
  }

  Future<void> _handleNavigation(AuthResponse response) async {
    final nextScreen = response.data.nextScreen;
    if (_shouldUpdateToken(nextScreen)) {
      await widget.tokenStorage.updateToken(response.data.token);
    }
    if (_shouldFetchJobPreferences(nextScreen)) {
      await context.read<JobPreferenceProvider>().fetchJobPreferences();
    }
    LoadingIndicator.close(context);

    switch (nextScreen) {
      case RouteNames.profileOnSignUp:
        Navigator.pushNamedAndRemoveUntil(
            context, RouteNames.dashboard, (route) => false);
        Navigator.pushNamed(context, nextScreen);
        break;
      case RouteNames.dashboard:
        Navigator.pushNamedAndRemoveUntil(context, nextScreen, (_) => false);
        break;
      case RouteNames.verifyMobileOtp:
        Navigator.popAndPushNamed(context, nextScreen,
            arguments: response.data.token);
        break;
      default:
        Navigator.pushNamed(context, nextScreen);
        break;
    }
  }

  Future<void> _onTapResendOTP() async {
    LoadingIndicator.show(context);

    final response = await widget.verificationService.resendOTP(widget.token);
    if (response.success) {
      LoadingIndicator.close(context);
      setState(() {
        _otpControllers.forEach((c) => c.clear());
        if (_wrongOTPNotifier.value) {
          _wrongOTPNotifier.value = false;
        }
        _currentFieldIndex = 0;
        _requestFocus();
      });
      SnackBarMessage.show(context, response.data.msg, color: Colors.green);
    } else {
      LoadingIndicator.close(context);
      SnackBarMessage.show(context, response.error.msg);
    }
  }

  bool _isBackPressKey(RawKeyDownEvent event) =>
      event.logicalKey.keyLabel == 'Backspace';

  bool get _isNotFirstField => _currentFieldIndex != 0;

  bool get _isLastField => _currentFieldIndex == widget.otpLength - 1;

  void _clearField() {
    _otpControllers[_currentFieldIndex].clear();
  }

  void _unFocus() => FocusScope.of(context).unfocus();

  void _handleNextFocus() {
    _currentFieldIndex++;
    if (isCurrentFieldEmpty()) {
      _requestFocus();
    } else {
      _unFocus();
    }
  }

  bool isCurrentFieldEmpty() =>
      _otpControllers[_currentFieldIndex].text.isEmpty;

  void _requestFocus() =>
      FocusScope.of(context).requestFocus(_otpFocusNodes[_currentFieldIndex]);

  InputDecoration get _decoration => InputDecoration(
        filled: true,
        fillColor: Color(0xFFF0F0F0),
        focusColor: Color(0xFFF0F0F0),
        hoverColor: Color(0xFFF0F0F0),
        border: OutlineInputBorder(
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: Color(0xFF2A5798),
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: Color(0xFFFC4747),
          ),
        ),
      );

  InputDecoration get _wrongOTPDecoration => _decoration.copyWith(
        fillColor: Colors.red.shade50,
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: Color(0xFFFC4747),
          ),
        ),
      );

  bool _shouldUpdateToken(String nextScreen) {
    return nextScreen == RouteNames.profileOnSignUp ||
        nextScreen == RouteNames.dashboard;
  }

  bool _shouldFetchJobPreferences(String nextScreen) {
    return nextScreen == RouteNames.dashboard;
  }
}
