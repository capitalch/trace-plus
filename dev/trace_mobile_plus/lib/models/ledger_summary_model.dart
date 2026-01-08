import 'account_ledger_transaction_model.dart';

class LedgerSummaryModel {
  final double opening;
  final double debit;
  final double credit;
  final double closing;

  LedgerSummaryModel({
    required this.opening,
    required this.debit,
    required this.credit,
    required this.closing,
  });

  // Factory constructor to calculate summary from transactions
  factory LedgerSummaryModel.fromTransactions(
    List<AccountLedgerTransactionModel> transactions,
  ) {
    if (transactions.isEmpty) {
      return LedgerSummaryModel(
        opening: 0.0,
        debit: 0.0,
        credit: 0.0,
        closing: 0.0,
      );
    }

    // First transaction is the opening balance (id is null, otherAccounts = "Opening balance:")
    final firstTransaction = transactions.first;
    final opening = firstTransaction.credit - firstTransaction.debit;

    // Sum debits and credits from remaining transactions (skip first row)
    double totalDebit = 0.0;
    double totalCredit = 0.0;

    for (int i = 1; i < transactions.length; i++) {
      totalDebit += transactions[i].debit;
      totalCredit += transactions[i].credit;
    }

    // Calculate closing balance: opening + credits - debits
    final closing = opening + totalCredit - totalDebit;

    return LedgerSummaryModel(
      opening: opening,
      debit: totalDebit,
      credit: totalCredit,
      closing: closing,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'opening': opening,
      'debit': debit,
      'credit': credit,
      'closing': closing,
    };
  }
}
