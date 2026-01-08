class AccountModel {
  final int id;
  final String accName;
  final String accCode;
  final String accType;
  final double opening;
  final String openingDc;
  final double debit;
  final double credit;
  final double closing;
  final String closingDc;
  final int? parentId;
  final List<AccountModel> children;
  final int pkey;

  AccountModel({
    required this.id,
    required this.accName,
    required this.accCode,
    required this.accType,
    required this.opening,
    required this.openingDc,
    required this.debit,
    required this.credit,
    required this.closing,
    required this.closingDc,
    this.parentId,
    required this.children,
    required this.pkey,
  });

  factory AccountModel.fromJson(Map<String, dynamic> json) {
    return AccountModel(
      id: json['id'] ?? 0,
      accName: json['accName'] ?? '',
      accCode: json['accCode'] ?? '',
      accType: json['accType'] ?? '',
      opening: (json['opening'] ?? 0).toDouble(),
      openingDc: json['opening_dc'] ?? 'D',
      debit: (json['debit'] ?? 0).toDouble(),
      credit: (json['credit'] ?? 0).toDouble(),
      closing: (json['closing'] ?? 0).toDouble(),
      closingDc: json['closing_dc'] ?? 'D',
      parentId: json['parentId'],
      children: (json['children'] as List<dynamic>?)
              ?.map((child) => AccountModel.fromJson(child as Map<String, dynamic>))
              .toList() ??
          [],
      pkey: json['pkey'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'accName': accName,
      'accCode': accCode,
      'accType': accType,
      'opening': opening,
      'opening_dc': openingDc,
      'debit': debit,
      'credit': credit,
      'closing': closing,
      'closing_dc': closingDc,
      'parentId': parentId,
      'children': children.map((child) => child.toJson()).toList(),
      'pkey': pkey,
    };
  }
}
