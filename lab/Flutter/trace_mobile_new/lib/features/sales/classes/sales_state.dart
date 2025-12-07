import 'package:flutter/cupertino.dart';

class SalesState with ChangeNotifier {
  String _salesQueryKey = '';
  Map<String, double> _summaryMap = {};
  bool notifyToggle = false;

  String get salesQueryKey => _salesQueryKey;

  void init() {
    _salesQueryKey = 'today';
  }

  set salesQueryKey(String val) {
    _salesQueryKey = val;
    notifyListeners();
  }

  void notify() {
    notifyToggle = !notifyToggle;
    notifyListeners();
  }

  Map<String, double> get summaryMap => _summaryMap;

  set summaryMap(Map<String, double> val) {
    _summaryMap = val;
    notifyListeners();
  }
}
