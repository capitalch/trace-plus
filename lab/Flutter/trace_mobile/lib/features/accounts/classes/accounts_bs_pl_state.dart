import 'package:flutter/cupertino.dart';

class AccountsBsplState with ChangeNotifier {
  double _aggregate = 0;
  String _bsplType = '';
  String leftLabel = '';
  String rightLabel = '';
  bool _isSelectedLeftLabel = true;
  AccTypes _currentAccType = AccTypes.none;

  double get aggregate {
    return _aggregate;
  }

  set aggregate(double aggr) {
    _aggregate = aggr;
    notifyListeners();
  }

  String get bsplType {
    return _bsplType;
  }

  set bsplType(String val) {
    _bsplType = val;
    if (val == 'bs') {
      leftLabel = 'Liabilities';
      rightLabel = 'Assets';
      _currentAccType = AccTypes.L;
    } else {
      leftLabel = 'Expenses';
      rightLabel = 'Income';
      _currentAccType = AccTypes.E;
    }
  }

  AccTypes get currentAccType {
    return _currentAccType;
  }

  set currentAccType(AccTypes val) {
    _currentAccType = val;
    notifyListeners();
  }

  init() {
    _isSelectedLeftLabel = true;
  }

  bool get isSelectedLeftLabel {
    return _isSelectedLeftLabel;
  }

  set isSelectedLeftLabel(bool val) {
    _isSelectedLeftLabel = val;
    notifyListeners();
  }
}

enum AccTypes { none, L, A, E, I }
