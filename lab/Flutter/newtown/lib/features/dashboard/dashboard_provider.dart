import 'package:flutter/cupertino.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';

class DashboardProvider extends ChangeNotifier {
  DashboardHelper _helper = DashboardHelper();
  int _latestJobsSelectedIndex = 0;
  int _suggestedJobsSelectedIndex = 0;

  set helper(DashboardHelper h) {
    _helper = h;
  }

  DashboardHelper get helper {
    return (_helper);
  }

  set latestJobsSelectedIndex(int val) {
    _latestJobsSelectedIndex = val;
  }

  int get latestJobsSelectedIndex {
    return (_latestJobsSelectedIndex);
  }

  set suggestedJobsSelectedIndex(int val) {
    _suggestedJobsSelectedIndex = val;
  }

  int get suggestedJobsSelectedIndex {
    return (_suggestedJobsSelectedIndex);
  }
}
