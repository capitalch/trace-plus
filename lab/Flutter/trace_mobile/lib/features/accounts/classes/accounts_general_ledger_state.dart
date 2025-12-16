import 'package:flutter/cupertino.dart';

class AccountsGeneralLedgerState with ChangeNotifier {
  double openingBalance = 0;
  String openingBalanceDC = 'D';
  double debits = 0;
  double credits = 0;
  double closingBalance = 0;
  int rowCount = 0;

  // init() {
  //   openingBalance = 0;
  //   openingBalanceDC = 'D';
  //   debits = 0;
  //   credits = 0;
  //   notify();
  // }

  notify() {
    notifyListeners();
  }
}
