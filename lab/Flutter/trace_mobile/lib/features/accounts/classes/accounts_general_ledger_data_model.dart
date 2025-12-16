class GeneralLedgerModel {
  final double opBalance;
  final String opBalanceDC;
  final SumModel sum;
  final List<TransactionModel> transactions;
  GeneralLedgerModel(
      {required this.opBalance,
      required this.opBalanceDC,
      required this.sum,
      required this.transactions});

  factory GeneralLedgerModel.fromJson({j}) {
    var opBal = 0.0;
    String opBalDC = 'D';
    if (j['opBalance'] != null) {
      if (j['opBalance']['dc'] == 'D') {
        opBal = j['opBalance']['debit'];
        opBalDC = 'D';
      } else {
        opBal = j['opBalance']['credit'];
        opBalDC = 'C';
      }
    }
    return GeneralLedgerModel(
        opBalance: opBal,
        opBalanceDC: opBalDC,
        sum: SumModel(
          debits: j['sum'][0]['debit'],
          credits: j['sum'][0]['credit'],
        ),
        transactions: List<TransactionModel>.from(
            j['transactions'].map((x) => TransactionModel.fromJson(j: x))));
  }
}

class SumModel {
  SumModel({required this.debits, required this.credits});
  final double debits;
  final double credits;
  factory SumModel.fromJson({j}) {
    return SumModel(debits: j['debit'], credits: j['credit']);
  }
}

class TransactionModel {
  final double debit, credit;
  final int id;
  final String accName,
      autoRefNo,
      dc,
      instrNo,
      lineRefNo,
      lineRemarks,
      otherAccounts,
      remarks,
      tranType,
      userRefNo;
  final String tranDate;

  TransactionModel({
    this.accName = '',
    required this.autoRefNo,
    required this.credit,
    required this.dc,
    required this.debit,
    required this.id,
    this.instrNo = '',
    this.lineRefNo = '',
    this.lineRemarks = '',
    required this.otherAccounts,
    this.remarks = '',
    required this.tranDate,
    required this.tranType,
    this.userRefNo = '',
  });

  factory TransactionModel.fromJson({required j}) {
    return TransactionModel(
        accName: j['accName'],
        autoRefNo: j['autoRefNo'],
        credit: j['credit'] ?? 0,
        dc: j['dc'],
        debit: j['debit'] ?? 0,
        id: j['id'],
        instrNo: j['instrNo'] ?? '',
        lineRefNo: j['lineRefNo'] ?? '',
        lineRemarks: j['lineRemarks'] ?? '',
        otherAccounts: j['otherAccounts'],
        remarks: j['remarks'] ?? '',
        tranDate: j['tranDate'],
        tranType: j['tranType'],
        userRefNo: j['userRefNo'] ?? '');
  }
}
