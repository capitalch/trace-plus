class FinYearModel {
  final int finYearId;
  final String startDate;
  final String endDate;

  FinYearModel({
    required this.finYearId,
    required this.startDate,
    required this.endDate,
  });

  factory FinYearModel.fromJson(Map<String, dynamic> json) {
    return FinYearModel(
      finYearId: json['finYearId'] as int,
      startDate: json['startDate'] as String,
      endDate: json['endDate'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'finYearId': finYearId,
      'startDate': startDate,
      'endDate': endDate,
    };
  }
}
