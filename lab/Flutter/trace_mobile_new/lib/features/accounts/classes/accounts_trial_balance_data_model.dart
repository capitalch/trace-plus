class TrialBalanceNode {
  final TrialBalanceData data;
  List<TrialBalanceNode>? children;

  TrialBalanceNode({required this.data, this.children});
}

class TrialBalanceData {
  final int accId;
  final String accName;
  final String accType;
  final double opening;
  final String openingDC;
  final double debit;
  final double credit;
  final double closing;
  final String closingDC;

  TrialBalanceData(
      {required this.accId,
      required this.accName,
      required this.accType,
      required this.opening,
      required this.openingDC,
      required this.debit,
      required this.credit,
      required this.closing,
      required this.closingDC});

  factory TrialBalanceData.fromJson({j}) {
    return TrialBalanceData(
        accId: j['id'],
        accName: j['accName'],
        accType: j['accType'],
        opening: double.parse(j['opening'].toString()),
        openingDC: j['opening_dc'],
        debit: double.parse(j['debit'].toString()),
        credit: double.parse(j['credit'].toString()),
        closing: double.parse(j['closing'].toString()),
        closingDC: j['closing_dc']);
  }

  Map<String, String> accTypeMap = {
    'A': 'Asset',
    'E': 'Expense',
    'I': 'Income',
    'L': 'Liability'
  };
}
