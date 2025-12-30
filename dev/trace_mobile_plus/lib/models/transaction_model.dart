class TransactionModel {
  final DateTime tranDate;
  final String autoRefNo;
  final String? userRefNo;
  final String? remarks;
  final String accName;
  final double debit;
  final double credit;
  final String? instrNo;
  final String? lineRefNo;
  final String? lineRemarks;
  final DateTime timestamp;
  final int tranTypeId;

  TransactionModel({
    required this.tranDate,
    required this.autoRefNo,
    this.userRefNo,
    this.remarks,
    required this.accName,
    required this.debit,
    required this.credit,
    this.instrNo,
    this.lineRefNo,
    this.lineRemarks,
    required this.timestamp,
    required this.tranTypeId,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      tranDate: json['tran_date'] != null
          ? DateTime.parse(json['tran_date'])
          : DateTime.now(),
      autoRefNo: json['auto_ref_no'] ?? '',
      userRefNo: json['user_ref_no'],
      remarks: json['remarks'],
      accName: json['acc_name'] ?? '',
      debit: (json['debit'] ?? 0).toDouble(),
      credit: (json['credit'] ?? 0).toDouble(),
      instrNo: json['instr_no'],
      lineRefNo: json['line_ref_no'],
      lineRemarks: json['line_remarks'],
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      tranTypeId: json['tran_type_id'] ?? 0,
    );
  }

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

  Map<String, dynamic> toJson() {
    return {
      'tran_date': tranDate.toIso8601String(),
      'auto_ref_no': autoRefNo,
      'user_ref_no': userRefNo,
      'remarks': remarks,
      'acc_name': accName,
      'debit': debit,
      'credit': credit,
      'instr_no': instrNo,
      'line_ref_no': lineRefNo,
      'line_remarks': lineRemarks,
      'timestamp': timestamp.toIso8601String(),
      'tran_type_id': tranTypeId,
    };
  }
}
