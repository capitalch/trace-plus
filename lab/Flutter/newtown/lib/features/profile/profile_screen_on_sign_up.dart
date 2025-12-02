import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

import '/features/other/widgets/primary_button.dart';
import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/colors.dart';
import '/utils/screen_size.dart';

class ProfileScreenOnSignUp extends StatelessWidget {
  ProfileScreenOnSignUp({Key? key}) : super(key: key);

  final _screenSize = ScreenSize.instance;
  static const _message =
      'You will have a much higher chance of getting a suitable job if fill out all the below sections. ';

  final _items = <_ProfileItem>[
    _ProfileItem(
      index: 0,
      title: 'Job Preference',
      assetPath: AssetsPath.jobPreferenceIcon,
      routeName: RouteNames.jobPreferences,
    ),
    _ProfileItem(
      index: 1,
      title: 'Personal Details',
      assetPath: AssetsPath.personalDetailsIcon,
      routeName: RouteNames.personalInfoForm,
    ),
    _ProfileItem(
      index: 2,
      title: 'Education Details',
      assetPath: AssetsPath.educationDetailsIcon,
      routeName: RouteNames.undefined,
    ),
    _ProfileItem(
      index: 3,
      title: 'Professional Qualifications',
      assetPath: AssetsPath.professionalQualificationIcon,
      routeName: RouteNames.undefined,
    ),
    _ProfileItem(
      index: 4,
      title: 'Work Experience',
      assetPath: AssetsPath.workExperienceIcon,
      routeName: RouteNames.workExperiences,
    ),
    _ProfileItem(
      index: 5,
      title: 'Skills',
      assetPath: AssetsPath.skillsIcon,
      routeName: RouteNames.undefined,
    ),
    _ProfileItem(
      index: 6,
      title: 'Certifications',
      assetPath: AssetsPath.certificationsIcon,
      routeName: RouteNames.undefined,
    ),
    _ProfileItem(
      index: 7,
      title: 'Personal Achievements',
      assetPath: AssetsPath.personalAchievementsIcon,
      routeName: RouteNames.undefined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.symmetric(
            vertical: _screenSize.height(2),
            horizontal: _screenSize.width(4),
          ),
          child: Column(
            children: [
              ProfileCompletionCard(completionStatus: 10),
              SizedBox(height: _screenSize.height(3)),
              Text(
                _message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              SizedBox(height: _screenSize.height(3)),
              Expanded(
                  child: ListView(
                children:
                    _items.map((e) => ProfileItemWidget(item: e)).toList(),
              )),
              SizedBox(height: _screenSize.height(3)),
              PrimaryButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                text: 'Skip and Continue',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileItemWidget extends StatelessWidget {
  final _ProfileItem item;

  static const _circleColor = Color(0xFFE7F1FD);
  final screenSize = ScreenSize.instance;

  bool get _hasAboveLine => item.index != 0;
  bool get _hasBelowLine => item.index != 7;

  ProfileItemWidget({
    Key? key,
    required this.item,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildLine(_hasAboveLine),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: _circleColor, width: 1.5),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check_circle_rounded,
                  color: item.isFilled ? Colors.green : Colors.green.shade100,
                  size: 18,
                ),
              ),
              _buildLine(_hasBelowLine),
            ],
          ),
        ),
        Expanded(
          flex: 2,
          child: CircleAvatar(
            backgroundColor: Colors.transparent,
            child: Image.asset(
              item.assetPath,
            ),
          ),
        ),
        Expanded(
            flex: 6,
            child: Text(
              item.title,
              style: Theme.of(context).textTheme.titleMedium,
            )),
        Expanded(
          flex: 1,
          child: IconButton(
            padding: EdgeInsets.zero,
            icon: item.isFilled
                ? Image.asset(
                    AssetsPath.editIcon,
                    height: 24,
                    width: 24,
                  )
                : Image.asset(
                    AssetsPath.addCircularIcon,
                    height: 24,
                    width: 24,
                  ),
            onPressed: () {
              Navigator.pushNamed(context, item.routeName);
            },
          ),
        ),
      ],
    );
  }

  Container _buildLine(bool hasLine) {
    return Container(
      height: screenSize.height(2.5),
      width: 1.5,
      color: hasLine ? _circleColor : Colors.transparent,
    );
  }
}

class ProfileCompletionCard extends StatelessWidget {
  final ScreenSize _screenSize;
  final double completionStatus;

  ProfileCompletionCard({Key? key, required this.completionStatus})
      : _screenSize = ScreenSize.instance,
        super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      //height: _screenSize.height(13.5),
      padding: EdgeInsets.all(_screenSize.width(3)),
      decoration: BoxDecoration(
        color: lightBlue,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Theme.of(context).primaryColor),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: _buildProgressIndicator(context),
          ),
          SizedBox(
            width: _screenSize.width(3),
          ),
          Expanded(
            flex: 9,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Profile Completed ${completionStatus.toInt()}%',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Row(
                  children: [
                    Expanded(
                        flex: 7,
                        child: Text(
                          'Please complete your profile to get the best job for yourself!',
                          style: Theme.of(context).textTheme.titleMedium,
                        )),
                    Expanded(
                      flex: 3,
                      child: Align(
                          alignment: Alignment.bottomCenter,
                          child: Image.asset(
                              AssetsPath.profileCompletionCheckList)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator(BuildContext context) {
    final primaryColor = Theme.of(context).primaryColor;

    return CircularPercentIndicator(
      radius: _screenSize.width(17),
      percent: completionStatus / 100,
      progressColor: Theme.of(context).primaryColor,
      backgroundColor: Color(0xFFE7F1FD),
      //lineWidth: 12,
      center: CircleAvatar(
        radius: _screenSize.width(6.75),
        backgroundColor: Colors.white,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: lightBlue, width: 1.5),
            shape: BoxShape.circle,
          ),
          child: CircleAvatar(
            radius: _screenSize.width(5.5),
            backgroundColor: Color(0xFFE7F1FD),
            child: Text(
              '${completionStatus.toInt()}%',
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge!
                  .copyWith(color: primaryColor, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileItem {
  bool isFilled = false;
  final String title;
  final String assetPath;
  final int index;
  final String routeName;

  _ProfileItem({
    required this.index,
    required this.title,
    required this.assetPath,
    required this.routeName,
  });
}
