class TransactionsDataModel {
  final int id, index, tranTypeId;
  final String accName, autoRefNo, timestamp, tranDate, tranType;
  final String? instrNo, lineRefNo, lineRemarks, remarks, tags, userRefNo;
  final double credit, debit;

  TransactionsDataModel({
    required this.accName,
    required this.autoRefNo,
    required this.credit,
    required this.debit,
    required this.id,
    required this.index,
    required this.instrNo,
    required this.lineRefNo,
    required this.lineRemarks,
    required this.remarks,
    required this.tags,
    required this.timestamp,
    required this.tranDate,
    required this.tranType,
    required this.tranTypeId,
    required this.userRefNo,
  });

  factory TransactionsDataModel.fromJson({required Map<String, dynamic> j}) {
    return TransactionsDataModel(
        accName: j['accName'],
        autoRefNo: j['autoRefNo'],
        credit: j['credit'],
        debit: j['debit'],
        id: j['id'],
        index: j['index'],
        instrNo: j['instrNo'],
        lineRefNo: j['lineRefNo'],
        lineRemarks: j['lineRemarks'],
        remarks: j['remarks'],
        tags: j['tags'],
        timestamp: j['timestamp'],
        tranDate: j['tranDate'],
        tranType: j['tranType'],
        tranTypeId: j['tranTypeId'],
        userRefNo: j['userRefNo']);
  }
}
