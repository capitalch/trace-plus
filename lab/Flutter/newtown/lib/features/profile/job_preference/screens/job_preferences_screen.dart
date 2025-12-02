import 'package:flutter/material.dart';
import 'package:jobs_in_education/utils/loading_indicator.dart';
import 'package:jobs_in_education/utils/snack_bar_message.dart';
import 'package:provider/provider.dart';

import '/features/other/widgets/custom_app_bar.dart';
import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/colors.dart';
import '/utils/screen_size.dart';
import '../models/job_preference.dart';
import '../services/job_preferences_provider.dart';

class JobPreferencesScreen extends StatelessWidget {
  JobPreferencesScreen({Key? key}) : super(key: key);

  final _screenSize = ScreenSize.instance;
  static const _bannerText =
      'Adding Job preferences will help you getting invites from employers and automatic job.';

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomAppBar(title: 'Job Preference'),
              Text('What type of job are you looking for ?'),
              SizedBox(height: _screenSize.height(1.5)),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    Container(
                      padding: EdgeInsets.all(_screenSize.width(3)),
                      decoration: BoxDecoration(
                        color: lightBlue,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Text(_bannerText),
                          ),
                          Expanded(
                            child: Image.asset(
                              AssetsPath.jobPreferences,
                              height: _screenSize.width(16),
                              width: _screenSize.width(14),
                              fit: BoxFit.contain,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: _screenSize.height(1.5)),
                    Consumer<JobPreferenceProvider>(
                        builder: (_, jpProvider, __) {
                      return Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ...jpProvider.jobPreferences
                              .map((e) => JobPreferenceCard(preference: e))
                              .toList(),
                          SizedBox(height: _screenSize.height(4)),
                          if (jpProvider.canAddMore)
                            Container(
                              width: double.maxFinite,
                              decoration: BoxDecoration(
                                color: lightBlue,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    color: Theme.of(context).primaryColor),
                              ),
                              child: TextButton.icon(
                                onPressed: () {
                                  Navigator.pushNamed(
                                      context, RouteNames.jobPreferencesForm);
                                },
                                label: Text('Add Preference'),
                                icon: Icon(Icons.add),
                              ),
                            ),
                        ],
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class JobPreferenceCard extends StatelessWidget {
  final JobPreference preference;
  JobPreferenceCard({Key? key, required this.preference}) : super(key: key);

  final _screenSize = ScreenSize.instance;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      margin: const EdgeInsets.only(top: 16.0, left: 3, right: 3),
      child: Padding(
        padding: const EdgeInsets.only(top: 4, bottom: 14, left: 16, right: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    preference.customJobTitle.isNotEmpty
                        ? preference.customJobTitle
                        : preference.jobTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                IconButton(
                  onPressed: () => _onPressedEdit(context),
                  icon: Image.asset(
                    AssetsPath.editIcon,
                    height: 24,
                    width: 24,
                    alignment: Alignment.centerRight,
                  ),
                ),
                IconButton(
                  padding: EdgeInsets.zero,
                  alignment: Alignment.center,
                  onPressed: () => _deletePreference(context, preference),
                  icon: Icon(
                    Icons.delete_outline,
                    color: Colors.black.withOpacity(0.6),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                _buildImageIcon(AssetsPath.locationIcon),
                _iconGap,
                Text(preference.citiesName),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                _buildImageIcon(AssetsPath.clockIcon),
                _iconGap,
                Text(preference.experience!.name),
                SizedBox(width: 14),
                _buildImageIcon(AssetsPath.briefcaseIcon),
                _iconGap,
                Expanded(
                  child: Text(
                    preference.employmentType!.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Text(
                  preference.salaryInLacs,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(width: 4),
                Text('Min'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _onPressedEdit(BuildContext context) {
    Navigator.pushNamed(context, RouteNames.jobPreferencesForm,
        arguments: preference);
  }

  void _deletePreference(BuildContext context, JobPreference preference) async {
    bool hasConfirmed = await _showConfirmationDialog(context);

    if (hasConfirmed) {
      LoadingIndicator.show(context);
      bool isDeleted = await context
          .read<JobPreferenceProvider>()
          .deleteJobPreference(preference.id);
      if (isDeleted) {
        LoadingIndicator.close(context);
        SnackBarMessage.show(context, 'Deleted Successfully',
            color: Colors.green);
      } else {
        LoadingIndicator.close(context);
        SnackBarMessage.show(context, 'Something wrong. Please try again');
      }
    }
  }

  Future<bool> _showConfirmationDialog(BuildContext context) async {
    return await showDialog(
      barrierDismissible: false,
      context: context,
      builder: (_) {
        return AlertDialog(
          title: Text('Are you sure ?'),
          content: Text('Once deleted, can not be recovered.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },
              child: Text('No'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context, true);
              },
              child: Text('Yes'),
            ),
          ],
        );
      },
    );
  }

  SizedBox get _iconGap => SizedBox(width: 6);

  Image _buildImageIcon(String assetPath) {
    return Image.asset(assetPath,
        height: _screenSize.width(6), width: _screenSize.width(5));
  }
}
