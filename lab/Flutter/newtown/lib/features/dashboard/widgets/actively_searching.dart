import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:jobs_in_education/features/other/widgets/primary_button.dart';
import 'package:jobs_in_education/utils/assets_path.dart';
import 'package:jobs_in_education/utils/ibuki.dart';
import 'package:jobs_in_education/utils/screen_size.dart';
import 'package:provider/provider.dart';

class ActivelySearching extends StatefulWidget {
  const ActivelySearching({Key? key}) : super(key: key);

  @override
  _ActivelySearchingState createState() => _ActivelySearchingState();
}

class _ActivelySearchingState extends State<ActivelySearching> {
  final ValueNotifier<bool> isActivelySearching = ValueNotifier<bool>(false);
  final ValueNotifier<int> jobPreferenceCount = ValueNotifier<int>(0);
  dynamic subs;

  _textStyle(context) {
    return Theme.of(context).textTheme.bodyLarge!.copyWith(
          fontSize: 12.0,
          color: Colors.indigo,
          fontWeight: FontWeight.w600,
          overflow: TextOverflow.ellipsis,
        );
  }

  _updatePreferenceCount(helper) {
    List<JobPreferenceSelection> jobPreferenceSelections =
        helper.jobPreferenceSelections;
    int cnt = jobPreferenceSelections.where((value) => value.isSelected).length;
    jobPreferenceCount.value = cnt;
  }

  @override
  void initState() {
    super.initState();
    subs = Ibuki.filterOn('ACTIVELY-SEARCHING:UPDATE-PREFERENCE-COUNT')
        .listen((d) {
      var helper = d['data'];
      _updatePreferenceCount(helper);
    });
  }

  @override
  void dispose() {
    subs.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    DashboardHelper helper =
        Provider.of<DashboardProvider>(context, listen: false).helper;
    _updatePreferenceCount(helper);
    return Padding(
      padding: EdgeInsets.only(left: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        mainAxisSize: MainAxisSize.min,
        children: [
          ValueListenableBuilder<int>(
              valueListenable: jobPreferenceCount,
              builder: (context, value, child) {
                return Expanded(
                    child: Text(
                  '${jobPreferenceCount.value} Job Preference Selected',
                  style: _textStyle(context),
                ));
              }),
          Row(
            children: [
              Text('Actively Searching', style: _textStyle(context)),
              ValueListenableBuilder<bool>(
                  valueListenable: isActivelySearching,
                  builder: (context, value, child) {
                    return (Switch(
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        activeThumbColor: Colors.indigo,
                        value: value,
                        onChanged: (val) {
                          isActivelySearching.value =
                              !isActivelySearching.value;
                          showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.only(
                                      topLeft: Radius.circular(16),
                                      topRight: Radius.circular(16))),
                              builder: (context) {
                                return (BottomSheetWidget());
                              });
                        }));
                  })
            ],
          )
        ],
      ),
    );
  }
}

class BottomSheetWidget extends StatefulWidget {
  const BottomSheetWidget({Key? key}) : super(key: key);

  @override
  _BottomSheetWidgetState createState() => _BottomSheetWidgetState();
}

class _BottomSheetWidgetState extends State<BottomSheetWidget> {
  dynamic subs;

  @override
  void initState() {
    super.initState();
    subs = Ibuki.filterOn('BOTTOM-SHEET-WIDGET:CHECK-BOX-CHANGED:REFRESH')
        .listen((_) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    subs?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return (Container(
        height: MediaQuery.of(context).size.height * 0.8,
        child: Padding(
          padding: EdgeInsets.all(12.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SelectJobProfileHeaderWidget(),
              JobPreferenceSelectionsWidget(),
              PrimaryButton(text: 'Apply', onPressed: () {}),
            ],
          ),
        )));
  }
}

class SelectJobProfileHeaderWidget extends StatelessWidget {
  const SelectJobProfileHeaderWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: IconButton(
            padding: EdgeInsets.zero,
            onPressed: () {
              Navigator.pop(context);
            },
            icon: Icon(Icons.close),
          ),
        ),
        Text('Select your job profile',
            style: Theme.of(context)
                .textTheme
                .bodyLarge!
                .copyWith(fontWeight: FontWeight.w600)),
        SizedBox.shrink()
      ],
    );
  }
}

class JobPreferenceSelectionsWidget extends StatelessWidget {
  JobPreferenceSelectionsWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    DashboardHelper helper =
        Provider.of<DashboardProvider>(context, listen: false).helper;
    List<JobPreferenceSelection> jobPreferenceSelections =
        helper.jobPreferenceSelections;
    Widget widget = Expanded(
        child: ListView.builder(
      itemCount: jobPreferenceSelections.length,
      itemBuilder: (context, i) {
        return (JobPreferenceSelectionWidget(
          jobPreferenceSelection: jobPreferenceSelections[i],
        ));
      },
    ));
    return widget;
  }
}

class JobPreferenceSelectionWidget extends StatelessWidget {
  const JobPreferenceSelectionWidget(
      {required this.jobPreferenceSelection, Key? key})
      : super(key: key);
  final JobPreferenceSelection jobPreferenceSelection;

  @override
  Widget build(BuildContext context) {
    DashboardHelper helper =
        Provider.of<DashboardProvider>(context, listen: false).helper;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
            flex: 1,
            child: Checkbox(
              value: jobPreferenceSelection.isSelected,
              shape: CircleBorder(),
              onChanged: (bool? value) {
                jobPreferenceSelection.isSelected = value ?? false;
                Ibuki.emit('BOTTOM-SHEET-WIDGET:CHECK-BOX-CHANGED:REFRESH', '');
                Ibuki.emit(
                    'ACTIVELY-SEARCHING:UPDATE-PREFERENCE-COUNT', helper);
              },
            )
            // Text('${jobPreferenceSelection.isSelected}'),
            ),
        Expanded(
            flex: 8,
            child: JobPreferenceCardWidget(
                jobPreferenceSelection: jobPreferenceSelection)),
      ],
    );
  }
}

class JobPreferenceCardWidget extends StatelessWidget {
  JobPreferenceCardWidget({required this.jobPreferenceSelection, Key? key})
      : super(key: key);

  final JobPreferenceSelection jobPreferenceSelection;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(top: 16.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              jobPreferenceSelection.post,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(
              height: 8,
            ),
            Row(
              children: [
                _buildImageIcon(AssetsPath.locationIcon),
                _iconGap,
                Text(jobPreferenceSelection.locations),
              ],
            ),
            SizedBox(
              height: 8,
            ),
            Row(
              children: [
                _buildImageIcon(AssetsPath.clockIcon),
                _iconGap,
                Text(jobPreferenceSelection.period),
                SizedBox(
                  width: 14,
                ),
                _buildImageIcon(AssetsPath.briefcaseIcon),
                _iconGap,
                Text(
                  jobPreferenceSelection.timing,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                )
              ],
            ),
            SizedBox(
              height: 16,
            ),
            Row(
              children: [
                Text(
                  '₹ ${jobPreferenceSelection.offer}',
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(width: 4),
                Text('Min'),
              ],
            )
          ],
        ),
      ),
    );
  }

  SizedBox get _iconGap => SizedBox(width: 6);
  final _screenSize = ScreenSize.instance;

  Image _buildImageIcon(String assetPath) {
    return Image.asset(assetPath,
        height: _screenSize.width(6), width: _screenSize.width(5));
  }
}
