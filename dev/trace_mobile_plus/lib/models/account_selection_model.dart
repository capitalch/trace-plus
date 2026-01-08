class AccountSelectionModel {
  final int id;
  final String accName;
  final bool isSubledger;
  final String accLeaf;
  final String accParent;
  final bool isDisabled;

  AccountSelectionModel({
    required this.id,
    required this.accName,
    required this.isSubledger,
    required this.accLeaf,
    required this.accParent,
    required this.isDisabled,
  });

  factory AccountSelectionModel.fromJson(Map<String, dynamic> json) {
    return AccountSelectionModel(
      id: json['id'] as int,
      accName: json['accName'] as String,
      isSubledger: json['isSubledger'] as bool,
      accLeaf: json['accLeaf'] as String,
      accParent: json['accParent'] as String,
      isDisabled: json['isDisabled'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'accName': accName,
      'isSubledger': isSubledger,
      'accLeaf': accLeaf,
      'accParent': accParent,
      'isDisabled': isDisabled,
    };
  }
}
