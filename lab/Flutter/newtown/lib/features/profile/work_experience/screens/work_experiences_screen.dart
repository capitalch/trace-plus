import 'package:flutter/material.dart';
import 'package:jobs_in_education/utils/loading_indicator.dart';
import 'package:jobs_in_education/utils/snack_bar_message.dart';
import 'package:provider/provider.dart';

import '/features/other/widgets/custom_app_bar.dart';
import '/features/other/widgets/custom_future_builder.dart';
import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/colors.dart';
import '/utils/screen_size.dart';
import '../models/work_experience.dart';
import '../services/work_experiences_provider.dart';

class WorkExperiencesScreen extends StatelessWidget {
  WorkExperiencesScreen({Key? key}) : super(key: key);

  final _screenSize = ScreenSize.instance;
  static const _screenHeading =
      'Give some information about your work experience and where you worked and what you have done there.';

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
              SizedBox(height: _screenSize.height(1.5)),
              Expanded(
                child: CustomFutureBuilder(
                  future: context
                      .read<WorkExperiencesProvider>()
                      .getWorkExperiences(),
                  onData: (_, __) {
                    return ListView(
                      padding: EdgeInsets.zero,
                      children: [
                        Consumer<WorkExperiencesProvider>(
                            builder: (_, workExperiencesProvider, __) {
                          return Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ...workExperiencesProvider.workExperiences
                                  .map((e) => WorkExperienceCard(experience: e))
                                  .toList(),
                              SizedBox(height: _screenSize.height(4)),
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
                                    workExperiencesProvider
                                            .workExperiences.isEmpty
                                        ? Navigator.pushNamed(context,
                                            RouteNames.workExperienceTypes)
                                        : Navigator.pushNamed(context,
                                            RouteNames.workExperienceForm);
                                  },
                                  label: Text('Add Work Experiences'),
                                  icon: Icon(Icons.add),
                                ),
                              ),
                            ],
                          );
                        }),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class WorkExperienceCard extends StatelessWidget {
  final WorkExperience experience;
  WorkExperienceCard({Key? key, required this.experience}) : super(key: key);

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
        padding:
            const EdgeInsets.only(top: 14, bottom: 14, left: 14, right: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    experience.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                InkWell(
                  onTap: () => _onPressedEdit(context),
                  child: Image.asset(
                    AssetsPath.editIcon,
                    height: 24,
                    width: 24,
                    alignment: Alignment.centerRight,
                  ),
                ),
                IconButton(
                  padding: EdgeInsets.zero,
                  alignment: Alignment.centerRight,
                  onPressed: () => _deleteExperience(context, experience),
                  icon: Icon(
                    Icons.delete_outline,
                    color: Colors.black.withOpacity(0.6),
                  ),
                ),
              ],
            ),
            SizedBox(height: 2),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  experience.instituteName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                _buildImageIcon(AssetsPath.locationIcon),
                _iconGap,
                Text(experience.city!.name),
              ],
            ),
            SizedBox(height: 4),
            Row(
              children: [
                _buildImageIcon(AssetsPath.calendarIcon),
                _iconGap,
                Text(experience.workDuration),
                SizedBox(width: 14),
                _buildImageIcon(AssetsPath.briefcaseIcon),
                _iconGap,
                Expanded(
                  child: Text(
                    experience.employmentType!.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Text(
                  experience.salaryInLacs,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _onPressedEdit(BuildContext context) {
    Navigator.pushNamed(context, RouteNames.workExperienceForm,
        arguments: experience);
  }

  void _deleteExperience(
      BuildContext context, WorkExperience experience) async {
    bool hasConfirmed = await _showConfirmationDialog(context);

    if (hasConfirmed) {
      LoadingIndicator.show(context);
      bool isDeleted = await context
          .read<WorkExperiencesProvider>()
          .deleteWorkExperience(experience.id);
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
