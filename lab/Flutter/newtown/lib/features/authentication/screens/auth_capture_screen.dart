import 'package:flutter/material.dart';

import '/utils/layout.dart';
import '/utils/loading_indicator.dart';
import '/utils/snack_bar_message.dart';
import '/utils/validator.dart';
import '../../other/widgets/country_picker_widget.dart';
import '../../other/widgets/custom_text_field.dart';
import '../../other/widgets/jin_logo_with_text.dart';
import '../../other/widgets/primary_button.dart';
import '../services/capture_service.dart';

class AuthCaptureScreen extends StatelessWidget {
  final CaptureService captureService;

  AuthCaptureScreen({
    Key? key,
    required this.captureService,
  }) : super(key: key);

  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      primary: true,
      appBar: AppBar(automaticallyImplyLeading: true),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.0.scale),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              JINLogoWithText(),
              SizedBox(height: 24.0.scale),
              Text(
                'Sign Up',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.0.scale),
              Text(
                '"Recruiters prefer profiles which have verified Email and Mobile Number"',
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 24.0.scale),
              Text('Complete your account details'),
              SizedBox(height: 12.0.scale),
              Row(
                children: [
                  Expanded(
                      child: CustomTextField(
                    initialValue: captureService.data.credential.firstName,
                    labelText: 'First Name',
                    textInputAction: TextInputAction.next,
                    enabled: false,
                  )),
                  SizedBox(width: 13.0.scale),
                  Expanded(
                      child: CustomTextField(
                    initialValue: captureService.data.credential.lastName,
                    labelText: 'Last Name',
                    textInputAction: TextInputAction.next,
                    enabled: false,
                  )),
                ],
              ),
              CustomTextField(
                initialValue: captureService.data.credential.email,
                labelText: 'Email ID',
                textInputAction: TextInputAction.next,
                keyboardType: TextInputType.emailAddress,
                enabled: captureService.data.shouldCaptureEmail,
                onChanged: (val) {
                  captureService.data.credential.email = val;
                },
                validator: EmailValidator(),
                autofillHints: [AutofillHints.email],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IgnorePointer(
                    ignoring: !captureService.data.shouldCaptureMobile,
                    child: Container(
                      height: kToolbarHeight,
                      padding: EdgeInsets.only(left: 8.scale),
                      decoration: BoxDecoration(
                          color: Color(0xFFF0F0F0),
                          borderRadius: BorderRadius.circular(8.0.scale)),
                      child: CountryPickerWidget(
                        onChanged: print,
                      ),
                    ),
                  ),
                  SizedBox(width: 13.0.scale),
                  Expanded(
                    child: CustomTextField(
                      enabled: captureService.data.shouldCaptureMobile,
                      initialValue: captureService.data.credential.mobile,
                      labelText: 'Mobile No',
                      keyboardType: TextInputType.phone,
                      textInputAction: TextInputAction.done,
                      onChanged: (val) {
                        captureService.data.credential.mobile = val;
                      },
                      validator: PhoneValidator(),
                      autofillHints: [AutofillHints.telephoneNumberNational],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 28.0.scale),
              PrimaryButton(
                onPressed: () => _onTapGetVerificationCode(context),
                text: 'Get Verification Code',
              ),
              SizedBox(height: 16.0.scale),
            ],
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
    LoadingIndicator.show(context);

    final response = await captureService.capture();
    if (response.success) {
      LoadingIndicator.close(context);
      Navigator.pushNamed(
        context,
        response.data.nextScreen,
        arguments: response.data.token,
      );
    } else {
      LoadingIndicator.close(context);
      SnackBarMessage.show(context, response.error.msg);
    }
  }
}
