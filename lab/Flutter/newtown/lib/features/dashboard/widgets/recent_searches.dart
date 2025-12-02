import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:provider/provider.dart';

class RecentSearches extends StatelessWidget {
  RecentSearches({Key? key}) : super(key: key);
  // final DashboardHelper helper;

  @override
  Widget build(BuildContext context) {
    DashboardHelper helper =  Provider.of<DashboardProvider>(context, listen: false).helper;
    return Column(children: [
      Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Searches'),
            Text('See All'),
          ],
        ),
      ),
      SearchesHorizontalListView(helper: helper,)
    ]);
  }
}

class SearchesHorizontalListView extends StatelessWidget {
  SearchesHorizontalListView({required DashboardHelper this.helper, Key? key})
      : super(key: key);
  final DashboardHelper helper;

  @override
  Widget build(BuildContext context) {
    return (Container(
        padding: EdgeInsets.symmetric(horizontal: 16, ),
        height: 35,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: _recentSearches(),
        )));
  }

  List<Widget> _recentSearches() {
    List<String> recentSearches = helper.recentSearches;
    List<Widget> lst = recentSearches.map((e) {
      return (Row(
        children: [
          Chip(
            label: Text(e),
            backgroundColor: Colors.indigo.shade100,
          ),
          SizedBox(
            width: 5,
          )
        ],
      ));
    }).toList();
    return (lst);
  }
}
