import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:jobs_in_education/utils/assets_path.dart';
import 'package:provider/provider.dart';

import 'job_status_card.dart';
import '../dashboard_helper.dart';

class JobsStatus extends StatelessWidget {
  JobsStatus({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    DashboardHelper helper =  Provider.of<DashboardProvider>(context, listen: false).helper;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: JobStatusCard(
                  jobs: helper.summary?['saved'] ?? '0',
                  status: 'Saved Jobs',
                  icon: Icons.save,
                ),
              ),
              Expanded(
                child: JobStatusCard(
                  jobs: helper.summary?['invited'] ?? '0',
                  status: 'Invited Jobs',
                  icon: Icons.insert_invitation,
                ),
              ),
            ],
          ),
          SizedBox(width: 10.0),
          Row(
            children: [
              Expanded(
                child: JobStatusCard(
                  jobs: helper.summary?['applied'] ?? '0',
                  status: 'Applied Jobs',
                  icon:  Icons.check_circle,
                ),
              ),
              Expanded(
                child: JobStatusCard(
                  jobs: helper.summary?['underProcess'] ?? '0',
                  status: 'Under Process',
                  icon: Icons.watch_later,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
