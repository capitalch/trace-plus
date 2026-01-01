class TransactionLineModel {
  final String accName;
  final double amount;
  final String? lineRemarks;

  TransactionLineModel({
    required this.accName,
    required this.amount,
    this.lineRemarks,
  });

  @override
  String toString() {
    return 'TransactionLineModel(accName: $accName, amount: $amount, lineRemarks: $lineRemarks)';
  }
}

class GroupedTransactionModel {
  final int id;
  final String autoRefNo;
  final DateTime tranDate;
  final String? userRefNo;
  final String? remarks;
  final int tranTypeId;
  final DateTime timestamp;
  final List<TransactionLineModel> debitLines;
  final List<TransactionLineModel> creditLines;

  GroupedTransactionModel({
    required this.id,
    required this.autoRefNo,
    required this.tranDate,
    this.userRefNo,
    this.remarks,
    required this.tranTypeId,
    required this.timestamp,
    required this.debitLines,
    required this.creditLines,
  });

  // Computed property: total debit amount
  double get totalDebit {
    return debitLines.fold(0.0, (sum, line) => sum + line.amount);
  }

  // Computed property: total credit amount
  double get totalCredit {
    return creditLines.fold(0.0, (sum, line) => sum + line.amount);
  }

  // Computed property: transaction type name
  String get tranTypeName {
    switch (tranTypeId) {
      case 1:
        return 'Journal';
      case 2:
        return 'Payment';
      case 3:
        return 'Receipt';
      case 4:
        return 'Sales';
      case 5:
        return 'Purchase';
      case 6:
        return 'Contra';
      case 7:
        return 'Debit note';
      case 8:
        return 'Credit note';
      case 9:
        return 'Sales return';
      case 10:
        return 'Purchase return';
      default:
        return 'Unknown';
    }
  }

  // Computed property: check if transaction is balanced
  bool get isBalanced {
    return (totalDebit - totalCredit).abs() < 0.01; // Allow for floating point precision
  }

  // Computed property: get balance difference (should be 0 for balanced transactions)
  double get balanceDifference {
    return totalDebit - totalCredit;
  }

  @override
  String toString() {
    return 'GroupedTransactionModel(id: $id, autoRefNo: $autoRefNo, tranDate: $tranDate, '
        'debitLines: ${debitLines.length}, creditLines: ${creditLines.length}, '
        'totalDebit: $totalDebit, totalCredit: $totalCredit, balanced: $isBalanced)';
  }
}
