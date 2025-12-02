import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:jobs_in_education/features/dashboard/widgets/job_offers.dart';
import 'package:jobs_in_education/features/dashboard/widgets/upcoming_events.dart';
import 'package:jobs_in_education/utils/colors.dart';
import 'package:jobs_in_education/utils/ibuki.dart';
import 'package:provider/provider.dart';
import '../dashboard_helper.dart';

import '/utils/ibuki.dart';

class UpcomingEventsJobOffers extends StatefulWidget {
  UpcomingEventsJobOffers({Key? key}) : super(key: key);

  @override
  _UpcomingEventsJobOffersState createState() =>
      _UpcomingEventsJobOffersState();
}

class _UpcomingEventsJobOffersState extends State<UpcomingEventsJobOffers> {
  _UpcomingEventsJobOffersState();

  DashboardHelper _helper = DashboardHelper();
  dynamic _subs;

  void initState() {
    super.initState();
    _subs = Ibuki.filterOn('SET-UPCOMING-EVENTS').listen((dynamic d) {
      setState(() {
        isUpcomingEventsSelected = d['data'];
      });
    });
  }

  @override
  void dispose() {
    _subs.cancel();
    super.dispose();
  }

  _toShowButtonsSelector() {
    bool ret = false;
    // if upcoming events and job offers both have data
    if (((_helper.jobOffers.length > 0)) &&
        (_helper.upcomingEvents.length > 0)) {
      ret = true;
    }
    return (ret);
  }

  bool isUpcomingEventsSelected = true;

  @override
  Widget build(BuildContext context) {
    _helper = Provider.of<DashboardProvider>(context, listen: false).helper;
    return Padding(
        padding: EdgeInsets.only(left: 16, right: 16, bottom: 10),
        child: Column(
          children: [
            _toShowButtonsSelector()
                ? ButtonSelector(
                    isUpcomingEventsSelected: isUpcomingEventsSelected,
                  )
                : SizedBox.shrink(),
            SizedBox(
              height: 8,
            ),
            isUpcomingEventsSelected
                ? UpcomingEvents(helper: _helper)
                : JobOffers(
                    helper: _helper,
                  )
          ],
        ));
  }
}

class ButtonSelector extends StatelessWidget {
  ButtonSelector({required this.isUpcomingEventsSelected, Key? key})
      : super(key: key);

  final bool isUpcomingEventsSelected;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: Opacity(
          opacity: isUpcomingEventsSelected ? 1 : 0.4,
          child: ElevatedButton(
            onPressed: () {
              Ibuki.emit('SET-UPCOMING-EVENTS', true);
            },
            child: Text(
              'Upcoming Events',
              style: TextStyle(overflow: TextOverflow.ellipsis),
            ),
          ),
        )),
        SizedBox(
          width: 8,
        ),
        Expanded(
            child: Opacity(
          opacity: isUpcomingEventsSelected ? 0.4 : 1,
          child: ElevatedButton(
            onPressed: () {
              Ibuki.emit('SET-UPCOMING-EVENTS', false);
            },
            child: Text('Job Offers'),
          ),
        ))
      ],
    );
  }
}

