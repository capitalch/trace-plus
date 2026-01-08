import 'account_ledger_transaction_model.dart';

class LedgerResponseModel {
  final String accName;
  final String accClass;
  final List<AccountLedgerTransactionModel> transactions;

  LedgerResponseModel({
    required this.accName,
    required this.accClass,
    required this.transactions,
  });

  factory LedgerResponseModel.fromJson(Map<String, dynamic> json) {
    return LedgerResponseModel(
      accName: json['accName'] as String,
      accClass: json['accClass'] as String,
      transactions: (json['transactions'] as List<dynamic>)
          .map((e) => AccountLedgerTransactionModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accName': accName,
      'accClass': accClass,
      'transactions': transactions.map((e) => e.toJson()).toList(),
    };
  }

  // Static method to parse the nested API response structure
  // API returns: [{ "jsonResult": { ...actual data... } }]
  static LedgerResponseModel? fromApiResponse(dynamic data) {
    if (data == null || data is! List || data.isEmpty) {
      return null;
    }

    final firstItem = data[0];
    if (firstItem is! Map<String, dynamic>) {
      return null;
    }

    final jsonResult = firstItem['jsonResult'];
    if (jsonResult == null || jsonResult is! Map<String, dynamic>) {
      return null;
    }

    return LedgerResponseModel.fromJson(jsonResult);
  }
}
