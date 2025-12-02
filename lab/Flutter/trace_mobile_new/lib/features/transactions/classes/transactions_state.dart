import 'package:flutter/cupertino.dart';

class TransactionsState with ChangeNotifier {
  String queryKey = '100';
  int rowCount = 0, debits = 0, credits = 0;

  init() {
    queryKey = '100';
    rowCount = 0;
    debits = 0;
    credits = 0;
  }

  initSummary() {
    rowCount = 0;
    debits = 0;
    credits = 0;
  }

  Map<String, TransactionsStateModel> transactionsStateMap = {
    '100': TransactionsStateModel(
        label: 'Last 100', title: 'Last 100 rows', queryCount: 100),
    '1000': TransactionsStateModel(
        label: 'Last 1000', title: 'Last 1000 rows', queryCount: 1000),
    '5000': TransactionsStateModel(
        label: 'Last 5000', title: 'Last 1000 rows', queryCount: 5000),
    '10000': TransactionsStateModel(
        label: 'Last 10000', title: 'Last 10000 rows', queryCount: 10000),
    'all':
        TransactionsStateModel(label: 'All', title: 'All rows', queryCount: null),
  };

  TransactionsStateModel? getTransactionsState(String transactionStateKey) {
    return transactionsStateMap[transactionStateKey];
  }

  // List<String> getAllTransactionLabels() {
  //   return transactionsStateMap.keys.map((var key) {
  //     return transactionsStateMap[key]!.label;
  //   }).toList();
  // }

  setQueryKey(String val) {
    queryKey = val;
    notifyListeners();
  }

  setRowCount(int count) {
    rowCount = count;
    notifyListeners();
  }
}

class TransactionsStateModel {
  final String title;
  final String label;
  final int? queryCount;

  TransactionsStateModel(
      {required this.label, required this.title, required this.queryCount});
}
