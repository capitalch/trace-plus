import 'account_ledger_transaction_model.dart';
import 'op_balance_model.dart';

class LedgerResponseModel {
  final String accName;
  final String accClass;
  final List<OpBalanceModel>? opBalance;
  final List<AccountLedgerTransactionModel>? transactions;

  LedgerResponseModel({
    required this.accName,
    required this.accClass,
    this.opBalance,
    this.transactions,
  });

  factory LedgerResponseModel.fromJson(Map<String, dynamic> json) {
    return LedgerResponseModel(
      accName: json['accName'] as String? ?? '',
      accClass: json['accClass'] as String? ?? '',
      opBalance: json['opBalance'] != null
          ? (json['opBalance'] as List<dynamic>)
              .map((e) => OpBalanceModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      transactions: json['transactions'] != null
          ? (json['transactions'] as List<dynamic>)
              .map((e) => AccountLedgerTransactionModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accName': accName,
      'accClass': accClass,
      'opBalance': opBalance?.map((e) => e.toJson()).toList(),
      'transactions': transactions?.map((e) => e.toJson()).toList(),
    };
  }

  // Static method to format opening balance as a transaction
  static AccountLedgerTransactionModel _formatOpBalanceAsTransaction(
    OpBalanceModel opBalance,
    String? finYearStartDate,
  ) {
    return AccountLedgerTransactionModel(
      id: null,
      tranDate: finYearStartDate ?? '',
      tranType: null,
      autoRefNo: '',
      userRefNo: null,
      otherAccounts: 'Opening balance:',
      debit: opBalance.debit,
      credit: opBalance.credit,
      instrNo: null,
      lineRemarks: null,
      lineRefNo: null,
      remarks: null,
      branchName: '',
      branchCode: null,
      tranTypeId: null,
    );
  }

  // Static method to parse the nested API response structure
  // API returns: [{ "jsonResult": { ...actual data... } }]
  static LedgerResponseModel? fromApiResponse(
    dynamic data, [
    String? finYearStartDate,
  ]) {
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

    // Parse the ledger response
    final ledgerResponse = LedgerResponseModel.fromJson(jsonResult);

    // Check if opBalance exists and inject it at the beginning
    if (ledgerResponse.opBalance != null &&
        ledgerResponse.opBalance!.isNotEmpty) {
      final opBalanceTransaction = _formatOpBalanceAsTransaction(
        ledgerResponse.opBalance!.first,
        finYearStartDate,
      );

      // Create a new transactions list with opening balance at the beginning
      final updatedTransactions = <AccountLedgerTransactionModel>[
        opBalanceTransaction,
        ...(ledgerResponse.transactions ?? []),
      ];

      // Return a new instance with updated transactions
      return LedgerResponseModel(
        accName: ledgerResponse.accName,
        accClass: ledgerResponse.accClass,
        opBalance: ledgerResponse.opBalance,
        transactions: updatedTransactions,
      );
    }

    return ledgerResponse;
  }
}
