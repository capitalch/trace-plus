import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:jobs_in_education/features/dashboard/widgets/actively_searching.dart';
import 'package:jobs_in_education/features/dashboard/widgets/suggested_jobs.dart';
import 'package:jobs_in_education/features/profile/job_preference/services/job_preferences_provider.dart';
import 'package:jobs_in_education/utils/ibuki.dart';
import 'package:provider/provider.dart';

import '/local_storage/token_storage.dart';
import '/routes/route_names.dart';
import '/utils/loading_indicator.dart';
import '/utils/snack_bar_message.dart';
import '../authentication/services/auth_service.dart';
import '../other/widgets/primary_button.dart';
import '/utils/screen_size.dart';

import 'dashboard_helper.dart';
import 'widgets/app_bar.dart';
import 'widgets/bottom_nav_bar.dart';
import 'widgets/search_floating_button.dart';
import 'widgets/jobs_status.dart';
import '../profile/profile_screen_on_sign_up.dart';
import 'widgets/upcoming_events_job_offers.dart';
import 'widgets/recent_searches.dart';
import 'widgets/latest_jobs.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

var subs;

class _DashboardScreenState extends State<DashboardScreen> {
  DashboardHelper helper = DashboardHelper();
  final screenSize = ScreenSize.instance;
  late UniqueKey key;

  @override
  void initState() {
    super.initState();
    key = UniqueKey();
    subs = Ibuki.filterOn(key).listen((d) {
      setState(() {});
      Provider.of<DashboardProvider>(context, listen: false).helper = helper; // providing helper data to provider
    });
    helper.fetchData(key);
  }

  @override
  void dispose() {
    subs.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white.withOpacity(0.95),
      body: SafeArea(
          child: SingleChildScrollView(
              controller: ScrollController(),
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  DashboardAppBar(),
                  ActivelySearching(),
                  UpcomingEventsJobOffers(),
                  Padding(
                    padding: EdgeInsets.fromLTRB(16, 0, 16, 0),
                    child: ProfileCompletionCard(
                        completionStatus: helper.profileCompletionStatus),
                  ),
                  JobsStatus(),
                  RecentSearches(),
                  LatestJobs(),
                  SizedBox(height: 8,),
                  SuggestedJobs(),
                ],
              ))),
      bottomNavigationBar: HomeBottomNavBar(),
      floatingActionButton: SearchFloatingButton(),
      floatingActionButtonLocation:
          FloatingActionButtonLocation.miniCenterDocked,
    );
  }
}

class DashboardScreen1 extends StatelessWidget {
  DashboardScreen1({
    Key? key,
  }) : super(key: key);

  final TokenStorage tokenStorage = TokenStorage.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text('Dashboard'),
              SizedBox(height: 28),
              PrimaryButton(
                onPressed: () => _onTapLogout(context),
                text: 'Log Out',
              ),
              SizedBox(height: 16),
              PrimaryButton(
                onPressed: () {
                  Navigator.pushNamed(context, RouteNames.profileOnSignUp);
                },
                text: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _onTapLogout(BuildContext context) async {
    LoadingIndicator.show(context);

    final token = await tokenStorage.getToken();
    final response = await MobileOTPAuth().logout(token);

    if (response.success) {
      await tokenStorage.removeToken();
      context.read<JobPreferenceProvider>().clearPreferences();

      LoadingIndicator.close(context);
      SnackBarMessage.show(context, 'Logged out successfully!',
          color: Colors.green);
      Navigator.pushNamedAndRemoveUntil(
          context, RouteNames.onBoarding, (_) => false);
    } else {
      LoadingIndicator.close(context);
      SnackBarMessage.show(context, response.error.msg);
    }
  }
}
