import 'package:flutter/material.dart';
import 'package:jobs_in_education/utils/ibuki.dart';

class SelectButton extends StatelessWidget {
  const SelectButton(
      {required this.title,
      this.keyPrefix = '',
      this.isSelected = false,
      this.buttonIndex = 0,
      Key? key})
      : super(key: key);
  final String title;
  final bool isSelected;
  final String keyPrefix;
  final int buttonIndex; // Each button has unique buttonIndex

  @override
  Widget build(BuildContext context) {
    return InkWell(
      child: Padding(
          padding: EdgeInsets.only(right: 12.0, top: 8.0),
          child: Column(
            children: [
              Text(
                title,
                style: TextStyle(fontSize: 12.0),
              ),
              SizedBox(
                height: 4.0,
              ),
              Container(
                height: 1.5,
                width: 100.0,
                color: isSelected ? Colors.indigo : Colors.transparent,
              )
            ],
          )),
      onTap: () {
        // Provider.of<DashboardProvider>(context, listen: false).latestJobsSelectedIndex =
        //     buttonIndex;
        Ibuki.emit(keyPrefix + 'INDEX-CHANGED:RELOAD', buttonIndex);
      },
    );
  }
}
