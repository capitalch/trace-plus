class OpBalanceModel {
  final double debit;
  final double credit;

  OpBalanceModel({
    required this.debit,
    required this.credit,
  });

  factory OpBalanceModel.fromJson(Map<String, dynamic> json) {
    return OpBalanceModel(
      debit: (json['debit'] as num?)?.toDouble() ?? 0.0,
      credit: (json['credit'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'debit': debit,
      'credit': credit,
    };
  }
}
