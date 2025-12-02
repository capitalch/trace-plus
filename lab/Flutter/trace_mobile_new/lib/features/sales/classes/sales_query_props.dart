import 'package:trace_mobile/common/classes/utils.dart';

class SalesQueryProps {
  late String _labelName, _salesQueryKey;
  late DateTime _startDate, _endDate;
  // late int _days;

  SalesQueryProps({startDate, endDate, labelName, salesQueryKey}) {
    _startDate = startDate;
    _endDate = endDate;
    _labelName = labelName;
    _salesQueryKey = salesQueryKey;
    // _days = days;
  }

  DateTime get startDate {
    return _startDate;
  }

  DateTime get endDate {
    return _endDate;
  }

  String get labelName {
    return _labelName;
  }

  String get salesQueryKey {
    return _salesQueryKey;
  }

  // int get days {
  //   return _days;
  // }

  factory SalesQueryProps.fromJson(Map<String, dynamic> args) {
    return SalesQueryProps(
        startDate: args['startDate'],
        endDate: args['endDate'],
        labelName: args['labelName'],
        salesQueryKey: args['salesQueryKey'],
        // days: args['days']
        );
  }
}

class QueryProps {
  final List<Map<String, dynamic>> _queryPropsList = [
    {
      'salesQueryKey': 'today',
      'startDate': DateTime.now(),
      'endDate': DateTime.now(),
      'title': "Sale of today",
      'labelName': 'Today',
      // 'days': 0
    },
    {
      'salesQueryKey': 'minusOneDay',
      'startDate': DateTime.now().subtract(const Duration(days: 1)),
      'endDate': DateTime.now().subtract(const Duration(days: 1)),
      'title': "Sale of (-1) day",
      'labelName': '(-1) day',
      // 'days': 0
    },
    {
      'salesQueryKey': 'minusTwoDay',
      'startDate': DateTime.now().subtract(const Duration(days: 2)),
      'endDate': DateTime.now().subtract(const Duration(days: 2)),
      'title': "Sale of (-2) day",
      'labelName': '(-2) day',
      // 'days': 0
    },
    {
      'salesQueryKey': 'minusThreeDay',
      'startDate': DateTime.now().subtract(const Duration(days: 3)),
      'endDate': DateTime.now().subtract(const Duration(days: 3)),
      'title': "Sale of (-2) day",
      'labelName': '(-3) day',
      // 'days': 0
    },
    {
      'salesQueryKey': 'thisMonth',
      'startDate': Utils.getStartDateOfMonth(),
      'endDate': Utils.getEndDateOfMonth(),
      'title': "This month",
      'labelName': 'This month',
      // 'days': 0
    },
    {
      'salesQueryKey': 'minusOneMonth',
      'startDate': Utils.getStartDateOfMonth(diffMonth: -1),
      'endDate': Utils.getEndDateOfMonth(diffMonth: -1),
      'title': "(-1) month",
      'labelName': '(-1) month',
      // 'days': 0
    },
    {
      'salesQueryKey': 'minusTwoMonth',
      'startDate': Utils.getStartDateOfMonth(diffMonth: -2),
      'endDate': Utils.getEndDateOfMonth(diffMonth: -2),
      'title': "(-2) month",
      'labelName': '(-2) month',
      // 'days': 0
    },
    {
      'salesQueryKey': 'minusThreeMonth',
      'startDate': Utils.getStartDateOfMonth(diffMonth: -3),
      'endDate': Utils.getEndDateOfMonth(diffMonth: -3),
      'title': "(-3) month",
      'labelName': '(-3) month',
      // 'days': 0
    },
  ];

  List<SalesQueryProps> getSalesQueryPropsList() {
    List<SalesQueryProps> tempList = _queryPropsList.map((e) {
      return SalesQueryProps.fromJson(e);
    }).toList();
    return tempList;
  }
}
