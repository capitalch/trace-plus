class BusinessUnitModel {
  final int buId;
  final String buCode;
  final String buName;

  BusinessUnitModel({
    required this.buId,
    required this.buCode,
    required this.buName,
  });

  /// Create BusinessUnitModel from JSON
  factory BusinessUnitModel.fromJson(Map<String, dynamic> json) {
    return BusinessUnitModel(
      buId: json['buId'] as int,
      buCode: json['buCode'] as String,
      buName: json['buName'] as String,
    );
  }

  /// Convert BusinessUnitModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'buId': buId,
      'buCode': buCode,
      'buName': buName,
    };
  }

  @override
  String toString() => 'BusinessUnitModel(buId: $buId, buCode: $buCode, buName: $buName)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BusinessUnitModel &&
        other.buId == buId &&
        other.buCode == buCode &&
        other.buName == buName;
  }

  @override
  int get hashCode => buId.hashCode ^ buCode.hashCode ^ buName.hashCode;
}
