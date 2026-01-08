class AccountLedgerTransactionModel {
  final int? id;
  final String tranDate;
  final String? tranType;
  final String autoRefNo;
  final String? userRefNo;
  final String otherAccounts;
  final double debit;
  final double credit;
  final String? instrNo;
  final String? lineRemarks;
  final String? lineRefNo;
  final String? remarks;
  final String branchName;
  final String? branchCode;
  final int index;
  final int? tranTypeId;

  AccountLedgerTransactionModel({
    this.id,
    required this.tranDate,
    this.tranType,
    required this.autoRefNo,
    this.userRefNo,
    required this.otherAccounts,
    required this.debit,
    required this.credit,
    this.instrNo,
    this.lineRemarks,
    this.lineRefNo,
    this.remarks,
    required this.branchName,
    this.branchCode,
    required this.index,
    this.tranTypeId,
  });

  factory AccountLedgerTransactionModel.fromJson(Map<String, dynamic> json) {
    return AccountLedgerTransactionModel(
      id: json['id'] as int?,
      tranDate: json['tranDate'] as String,
      tranType: json['tranType'] as String?,
      autoRefNo: json['autoRefNo'] as String? ?? '',
      userRefNo: json['userRefNo'] as String?,
      otherAccounts: json['otherAccounts'] as String,
      debit: (json['debit'] as num?)?.toDouble() ?? 0.0,
      credit: (json['credit'] as num?)?.toDouble() ?? 0.0,
      instrNo: json['instrNo'] as String?,
      lineRemarks: json['lineRemarks'] as String?,
      lineRefNo: json['lineRefNo'] as String?,
      remarks: json['remarks'] as String?,
      branchName: json['branchName'] as String,
      branchCode: json['branchCode'] as String?,
      index: json['index'] as int,
      tranTypeId: json['tranTypeId'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tranDate': tranDate,
      'tranType': tranType,
      'autoRefNo': autoRefNo,
      'userRefNo': userRefNo,
      'otherAccounts': otherAccounts,
      'debit': debit,
      'credit': credit,
      'instrNo': instrNo,
      'lineRemarks': lineRemarks,
      'lineRefNo': lineRefNo,
      'remarks': remarks,
      'branchName': branchName,
      'branchCode': branchCode,
      'index': index,
      'tranTypeId': tranTypeId,
    };
  }

  // Helper method for Line 1: date, autoRefNo, userRefNo
  String getLine1Details() {
    final parts = <String>[];

    if (autoRefNo.isNotEmpty) {
      parts.add(autoRefNo);
    }

    if (userRefNo != null && userRefNo!.isNotEmpty) {
      parts.add(userRefNo!);
    }

    return parts.join(' | ');
  }

  // Helper method for Line 2: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks
  String getLine2Details() {
    final parts = <String>[];

    if (otherAccounts.isNotEmpty) {
      parts.add(otherAccounts);
    }

    if (tranType != null && tranType!.isNotEmpty) {
      parts.add(tranType!);
    }

    if (instrNo != null && instrNo!.isNotEmpty) {
      parts.add('Instr: $instrNo');
    }

    if (lineRefNo != null && lineRefNo!.isNotEmpty) {
      parts.add('Ref: $lineRefNo');
    }

    if (lineRemarks != null && lineRemarks!.isNotEmpty) {
      parts.add(lineRemarks!);
    }

    if (remarks != null && remarks!.isNotEmpty) {
      parts.add(remarks!);
    }

    return parts.join(' | ');
  }

  // Helper method to get formatted amount with Dr/Cr
  String getFormattedAmount() {
    if (debit > 0) {
      return '${debit.toStringAsFixed(2)} Dr';
    } else if (credit > 0) {
      return '${credit.toStringAsFixed(2)} Cr';
    }
    return '0.00';
  }

  // Helper method to check if this is an opening balance row
  bool get isOpeningBalance => id == null && otherAccounts == 'Opening balance:';
}
