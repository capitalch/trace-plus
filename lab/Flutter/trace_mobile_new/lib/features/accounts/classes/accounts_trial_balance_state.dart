import 'package:flutter/cupertino.dart';

class AccountsTrialBalanceState with ChangeNotifier {
  late Summary summary;

  AccountsTrialBalanceState() {
    init();
  }

  init() {
    summary = Summary(
        opening: 0,
        debits: 0,
        credits: 0,
        closing: 0,
        openingDC: 'Dr',
        closingDC: 'Dr');
  }

  notify() {
    notifyListeners();
  }
}

class Summary {
  final double opening, debits, credits, closing;
  final String openingDC, closingDC;
  Summary(
      {required this.opening,
      required this.debits,
      required this.credits,
      required this.closing,
      required this.openingDC,
      required this.closingDC});
}
