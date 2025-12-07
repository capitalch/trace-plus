class BusinessUnit {
  final int? buId;
  final String? buCode;
  final String? buName;

  BusinessUnit({
    this.buId,
    this.buCode,
    this.buName,
  });

  factory BusinessUnit.fromJson(Map<String, dynamic> json) {
    return BusinessUnit(
      buId: json['buId'] as int?,
      buCode: json['buCode'] as String?,
      buName: json['buName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'buId': buId,
      'buCode': buCode,
      'buName': buName,
    };
  }

  @override
  String toString() => buName ?? buCode ?? 'Unknown BU';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BusinessUnit &&
          runtimeType == other.runtimeType &&
          buId == other.buId;

  @override
  int get hashCode => buId.hashCode;
}
