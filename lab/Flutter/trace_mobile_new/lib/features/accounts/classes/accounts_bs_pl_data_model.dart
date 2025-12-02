class BsplNode {
  final BsplData data;
  List<BsplNode>? children;

  BsplNode({required this.data, this.children});
}

class BsplData {
  final int accId;
  final String accName;
  final String accType;
  final double amount;

  BsplData({
    required this.accId,
    required this.accName,
    required this.accType,
    required this.amount,
  });

  factory BsplData.fromJson({j}) {
    return BsplData(
        accId: j['id'],
        accName: j['accName'],
        accType: j['accType'],
        amount: j['amount']);
  }
}
