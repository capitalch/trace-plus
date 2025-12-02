import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:jobs_in_education/features/dashboard/widgets/job_card.dart';
import 'package:jobs_in_education/features/dashboard/widgets/jobs_header.dart';
import 'package:jobs_in_education/features/dashboard/widgets/select_button.dart';
import 'package:jobs_in_education/utils/ibuki.dart';
import 'package:provider/provider.dart';

class LatestJobs extends StatefulWidget {
  LatestJobs({Key? key}) : super(key: key);

  @override
  _LatestJobsState createState() => _LatestJobsState();
}

class _LatestJobsState extends State<LatestJobs> {
  _LatestJobsState();

  dynamic subs;

  @override
  void initState() {
    super.initState();
    subs = Ibuki.filterOn('LATEST-JOBS:INDEX-CHANGED:RELOAD').listen((d) {
      // Just reloads the widget when index changes
      setState(() {
        Provider.of<DashboardProvider>(context, listen: false)
            .latestJobsSelectedIndex = d['data'];
      });
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
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          JobsHeader(title: 'Latest Jobs For You'),
          SelectButtonsView(jobs: helper.latestJobs),
          JobCardsView(
            jobs: helper.latestJobs,
          )
        ],
      ),
    );
  }
}

class JobCardsView extends StatelessWidget {
  const JobCardsView({Key? key, required this.jobs}) : super(key: key);
  final List<Job> jobs;

  @override
  Widget build(BuildContext context) {
    int selectedIndex = Provider.of<DashboardProvider>(context, listen: false)
        .latestJobsSelectedIndex;
    return Container(
      height: MediaQuery.of(context).size.height * 0.25,
      // height: 170.0,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: (jobs.length > 0) ? _getJobCards(jobs[selectedIndex]) : [],
      ),
    );
  }

  List<JobCard> _getJobCards(Job selectedJob) {
    List<JobCard> jobCards = [];
    List<JobDetail> jobDetails = selectedJob.jobDetails;
    for (JobDetail detail in jobDetails) {
      jobCards.add(JobCard(
        school: detail.school,
        timing: detail.timing,
        minExperience: detail.minExperience,
        location: detail.location,
        fullPost: detail.fullPost,
        offer: detail.offer,
      ));
    }
    return (jobCards);
  }
}

class SelectButtonsView extends StatelessWidget {
  const SelectButtonsView({
    required this.jobs,
    Key? key,
  }) : super(key: key);
  final List<dynamic> jobs;

  @override
  Widget build(BuildContext context) {
    int selectedIndex = Provider.of<DashboardProvider>(context, listen: false)
        .latestJobsSelectedIndex;
    return Container(
      height: 30.0,
      child: ListView(
          scrollDirection: Axis.horizontal,
          children: _getSelectButtons(jobs, selectedIndex)),
    );
  }

  List<SelectButton> _getSelectButtons(jobs, selectedIndex) {
    List<SelectButton> buttonList = [];
    int ind = 0;
    for (dynamic job in (jobs)) {
      buttonList.add(SelectButton(
        title: job.post,
        buttonIndex: ind,
        isSelected: (ind == selectedIndex),
        keyPrefix: 'LATEST-JOBS:',
      ));
      ind++;
    }
    return (buttonList);
  }
}
