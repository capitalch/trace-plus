class TransactionModel {
  final int id;
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
    required this.id,
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
      id: json['id'] ?? 0,
      tranDate: json['tranDate'] != null
          ? DateTime.parse(json['tranDate'])
          : DateTime.now(),
      autoRefNo: json['autoRefNo'] ?? '',
      userRefNo: json['userRefNo'],
      remarks: json['remarks'],
      accName: json['accName'] ?? '',
      debit: (json['debit'] ?? 0).toDouble(),
      credit: (json['credit'] ?? 0).toDouble(),
      instrNo: json['instrNo'],
      lineRefNo: json['lineRefNo'],
      lineRemarks: json['lineRemarks'],
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      tranTypeId: json['tranTypeId'] ?? 0,
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
      'id': id,
      'tranDate': tranDate.toIso8601String(),
      'autoRefNo': autoRefNo,
      'userRefNo': userRefNo,
      'remarks': remarks,
      'accName': accName,
      'debit': debit,
      'credit': credit,
      'instrNo': instrNo,
      'lineRefNo': lineRefNo,
      'lineRemarks': lineRemarks,
      'timestamp': timestamp.toIso8601String(),
      'tranTypeId': tranTypeId,
    };
  }
}
