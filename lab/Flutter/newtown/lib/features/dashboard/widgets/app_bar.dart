import 'package:flutter/material.dart';
import 'package:badges/badges.dart' as badges;
import 'package:flutter/cupertino.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:provider/provider.dart';
import '/utils/screen_size.dart';

import '../dashboard_helper.dart';

class DashboardAppBar extends StatelessWidget {
  DashboardAppBar({Key? key}) : super(key: key);

  final screenSize = ScreenSize.instance;

  @override
  Widget build(BuildContext context) {
    DashboardHelper? helper =
        Provider.of<DashboardProvider>(context, listen: false).helper;
    return AppBar(
      automaticallyImplyLeading: false,
      actions: [
        IconButton(
            icon: badges.Badge(
              badgeContent: Text(
                helper.notificationCount,
                style: TextStyle(fontSize: 6, color: Colors.white),
              ),
              position: badges.BadgePosition.topEnd(top: -4, end: -4),
              badgeStyle: badges.BadgeStyle(
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.notifications,
                size: 24,
                color: CupertinoColors.systemOrange,
              ),
            ),
            onPressed: () => {} //helper.fetchData(key),
            )
      ],
      title: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          InkWell(
            child: Icon(
              Icons.menu,
              color: Colors.black87,
              size: screenSize.height(5),
            ),
            onTap: () {},
          ),
          SizedBox(
            width: screenSize.width(3),
          ),
          CircleAvatar(
              backgroundColor: Colors.grey,
              radius: screenSize.height(2.0),
              child: CircleAvatar(
                  child: helper.image, radius: screenSize.height(1.5))),
          SizedBox(
            width: screenSize.width(3),
          ),
          Text(
            'Hello, ${helper.name}',
            style: Theme.of(context)
                .textTheme
                .bodyLarge!
                .copyWith(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16.0),
          )
        ],
      ),
    );
  }
}
