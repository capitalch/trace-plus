import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '/features/other/widgets/custom_app_bar.dart';
import '/features/other/widgets/primary_button.dart';
import '/routes/route_names.dart';
import '/utils/colors.dart';
import '/utils/loading_indicator.dart';
import '/utils/screen_size.dart';
import '../services/work_experiences_provider.dart';

enum ExperienceType { Fresher, Experienced }

class WorkExperienceTypesScreen extends StatelessWidget {
  WorkExperienceTypesScreen({Key? key}) : super(key: key);

  final _screenSize = ScreenSize.instance;
  static const _screenHeading =
      'Please enlist all your job experiences from the latest / current one to the first one.';

  final _typeListener = ValueNotifier(ExperienceType.Experienced);

  bool get _isExperienced => _typeListener.value == ExperienceType.Experienced;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomAppBar(title: 'Work Experience'),
              Text(_screenHeading),
              SizedBox(height: _screenSize.height(2.5)),
              ValueListenableBuilder<ExperienceType>(
                valueListenable: _typeListener,
                builder: (_, type, __) {
                  return Row(
                    children: [
                      _ExperienceTypeButton(
                        label: 'I am Fresher',
                        isSelected: type == ExperienceType.Fresher,
                        onTap: () {
                          _typeListener.value = ExperienceType.Fresher;
                        },
                      ),
                      const SizedBox(width: 16),
                      _ExperienceTypeButton(
                        label: 'I am Experienced',
                        isSelected: type == ExperienceType.Experienced,
                        onTap: () {
                          _typeListener.value = ExperienceType.Experienced;
                        },
                      ),
                    ],
                  );
                },
              ),
              const Spacer(),
              PrimaryButton(
                text: 'Next',
                onPressed: () {
                  _onTapNext(context);
                },
              )
            ],
          ),
        ),
      ),
    );
  }

  void _onTapNext(BuildContext context) async {
    LoadingIndicator.show(context);
    bool hasUpdatedExperienceType = await context
        .read<WorkExperiencesProvider>()
        .updateWorkExperienceType(_isExperienced);
    LoadingIndicator.close(context);

    if (hasUpdatedExperienceType) {
      _isExperienced
          ? _navigateToExperienceForm(context)
          : _returnToProfileScreen(context);
    } else {}
  }

  void _navigateToExperienceForm(BuildContext context) {
    Navigator.pushNamed(context, RouteNames.workExperienceForm);
  }

  void _returnToProfileScreen(BuildContext context) {
    Navigator.popUntil(
        context, ModalRoute.withName(RouteNames.profileOnSignUp));
  }
}

class _ExperienceTypeButton extends StatelessWidget {
  final bool isSelected;
  final String label;
  final VoidCallback onTap;

  const _ExperienceTypeButton({
    Key? key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).primaryColor;

    return TextButton(
      child: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.white : primaryColor,
        ),
      ),
      onPressed: onTap,
      style: TextButton.styleFrom(
          padding: const EdgeInsets.all(16),
          backgroundColor: isSelected ? primaryColor : extraLightBlue),
    );
  }
}
