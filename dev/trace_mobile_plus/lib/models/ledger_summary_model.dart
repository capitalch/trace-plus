import 'account_ledger_transaction_model.dart';

class LedgerSummaryModel {
  final double debit;
  final double credit;
  final double closing;

  LedgerSummaryModel({
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
        debit: 0.0,
        credit: 0.0,
        closing: 0.0,
      );
    }

    // Sum ALL transaction debits and credits (including opening balance)
    double totalDebit = 0.0;
    double totalCredit = 0.0;

    for (final transaction in transactions) {
      totalDebit += transaction.debit;
      totalCredit += transaction.credit;
    }

    // Calculate closing balance: total credits - total debits
    final closing = totalCredit - totalDebit;

    return LedgerSummaryModel(
      debit: totalDebit,
      credit: totalCredit,
      closing: closing,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'debit': debit,
      'credit': credit,
      'closing': closing,
    };
  }

  // Helper method to get closing balance with Dr/Cr sign
  String getClosingBalanceWithSign() {
    if (closing > 0) {
      return '${closing.toStringAsFixed(2)} Cr';
    } else if (closing < 0) {
      return '${closing.abs().toStringAsFixed(2)} Dr';
    }
    return '0.00';
  }
}
