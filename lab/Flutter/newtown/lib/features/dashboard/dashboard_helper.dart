import 'package:flutter/cupertino.dart';
import 'package:dio/dio.dart';
import '../../utils/ibuki.dart';

class DashboardHelper {
  String name = '';
  String notificationCount = '';
  Image? image;
  List<UpcomingEvent> upcomingEvents = [];
  List<JobOffer> jobOffers = [];
  List<String> recentSearches = [];
  List<Job> latestJobs = [];
  List<Job> suggestedJobs = [];
  List<JobPreferenceSelection> jobPreferenceSelections = [];

  dynamic summary;
  double profileCompletionStatus = 0;

  void fetchData(UniqueKey key) async {
    const String url = 'https://chisel.cloudjiffy.net/atpl/dashboard';
    var response = await Dio().get(url);
    var data = response.data;

    name = data['name'];
    notificationCount = data['notificationCount'];
    const imageUrl =
        "https://images.pexels.com/photos/2820884/pexels-photo-2820884.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
    image = Image.network(imageUrl);

    populateUpcomingEvents(data['upcomingEvents']);
    populateJobOffers(data['jobOffers']);

    summary = data['summary'];

    profileCompletionStatus = data['profileCompletionStatus']?.toDouble() ?? 0;

    recentSearches = data['recentSearches'].cast<String>();
    populateLatestJobs(data['latestJobs']);
    populateSuggestedJobs(data['suggestedJobs']);
    populateJobPreferenceSelections(data['jobPreferenceSelections']);
    Ibuki.emit(key, data);
  }

  populateJobPreferenceSelections(List<dynamic> jJobPreferenceSelections) {
    for (dynamic jItem in jJobPreferenceSelections) {
      jobPreferenceSelections.add(JobPreferenceSelection(
          post: jItem['post'],
          locations: jItem['locations'],
          period: jItem['period'],
          timing: jItem['timing'],
          offer: jItem['offer']));
    }
  }

  populateLatestJobs(List<dynamic> jLatestJobs) {
    for (dynamic jItem in jLatestJobs) {
      List<JobDetail> latestJobDetails = [];
      Job latestJob = Job(post: jItem['post'], jobDetails: latestJobDetails);
      for (dynamic jDetail in jItem['details']) {
        JobDetail latestJobDetail = JobDetail(
            fullPost: jDetail['fullPost'],
            school: jDetail['school'],
            location: jDetail['location'],
            minExperience: jDetail['minExperience'],
            offer: jDetail['offer'],
            timing: jDetail['timing']);
        latestJobDetails.add(latestJobDetail);
      }
      latestJobs.add(latestJob);
    }
  }

  populateSuggestedJobs(List<dynamic> jSuggestedJobs) {
    for (dynamic jItem in jSuggestedJobs) {
      List<JobDetail> suggestedJobDetails = [];
      Job suggestedJob =
          Job(post: jItem['post'], jobDetails: suggestedJobDetails);
      for (dynamic jDetail in jItem['details']) {
        JobDetail suggestedJobDetail = JobDetail(
            fullPost: jDetail['fullPost'],
            school: jDetail['school'],
            location: jDetail['location'],
            minExperience: jDetail['minExperience'],
            offer: jDetail['offer'],
            timing: jDetail['timing']);
        suggestedJobDetails.add(suggestedJobDetail);
      }
      suggestedJobs.add(suggestedJob);
    }
  }

  void populateUpcomingEvents(List<dynamic> events) {
    for (dynamic event in events) {
      List<String> rounds = [];
      for (var round in event['rounds']) {
        rounds.add(round);
      }
      UpcomingEvent ev = UpcomingEvent(
          eventType: event['type'],
          eventTime: event['time'],
          roleFor: event['roleFor'],
          school: event['school'],
          address: event['address'],
          eventRounds: rounds);
      upcomingEvents.add(ev);
    }
  }

  void populateJobOffers(List<dynamic> offers) {
    for (dynamic offer in offers) {
      JobOffer off = JobOffer(
          school: offer['school'],
          address: offer['address'],
          roleFor: offer['roleFor'],
          classes: offer['classes'],
          dateOfJoining: offer['dateOfJoining'],
          offer: offer['offer']);
      jobOffers.add(off);
    }
  }
}

class UpcomingEvent {
  String eventType;
  String eventTime;
  String roleFor;
  String school;
  String address;
  List<String> eventRounds;

  UpcomingEvent(
      {this.eventType = '',
      this.eventTime = '',
      this.roleFor = '',
      this.school = '',
      this.address = '',
      this.eventRounds = const []});
}

class JobOffer {
  String school;
  String address;
  String roleFor;
  String classes;
  String dateOfJoining;
  String offer;

  JobOffer(
      {this.school = '',
      this.address = '',
      this.roleFor = '',
      this.classes = '',
      this.dateOfJoining = '',
      this.offer = ''});
}

class Job {
  String post;
  List<JobDetail> jobDetails;

  Job({required this.post, required this.jobDetails});
}

class JobDetail {
  String school;
  String fullPost;
  String location;
  String minExperience;
  String timing;
  String offer;

  JobDetail(
      {required this.school,
      required this.fullPost,
      required this.location,
      required this.minExperience,
      required this.timing,
      required this.offer});
}

class JobPreferenceSelection {
  bool isSelected = true;
  String post, locations, period, timing, offer;

  JobPreferenceSelection(
      {this.post = '',
      this.locations = '',
      this.period = '',
      this.timing = '',
      this.offer = ''});
}
