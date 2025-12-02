import 'package:flutter/cupertino.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:jobs_in_education/features/dashboard/widgets/job_card.dart';
import 'package:jobs_in_education/features/dashboard/widgets/jobs_header.dart';
import 'package:jobs_in_education/features/dashboard/widgets/select_button.dart';
import 'package:jobs_in_education/utils/ibuki.dart';
import 'package:provider/provider.dart';

class SuggestedJobs extends StatefulWidget {
  const SuggestedJobs({Key? key}) : super(key: key);

  @override
  _SuggestedJobsState createState() => _SuggestedJobsState();
}

class _SuggestedJobsState extends State<SuggestedJobs> {
  dynamic subs;

  @override
  void initState() {
    super.initState();
    subs = Ibuki.filterOn('SUGGESTED-JOBS:INDEX-CHANGED:RELOAD').listen((d) {
      // Just reloads the widget when index changes
      setState(() {
        Provider.of<DashboardProvider>(context, listen: false)
            .suggestedJobsSelectedIndex = d['data'];
      });
    });
  }

  @override
  void dispose() {
    subs.cancel();
    super.dispose();
  }

  @override
  @override
  Widget build(BuildContext context) {
    DashboardHelper helper =
        Provider.of<DashboardProvider>(context, listen: false).helper;
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          JobsHeader(title: 'Suggested Jobs'),
          SelectButtonsView(jobs: helper.suggestedJobs),
          JobCardsView(
            jobs: helper.suggestedJobs,
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
        .suggestedJobsSelectedIndex;
    return Container(
      height: MediaQuery.of(context).size.height * 0.5,
      // height: 170.0,
      child: ListView(
        // scrollDirection: Axis.vertical,
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
        .suggestedJobsSelectedIndex;
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
        keyPrefix: 'SUGGESTED-JOBS:',
      ));
      ind++;
    }
    return (buttonList);
  }
}
