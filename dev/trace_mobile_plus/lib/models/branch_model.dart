class BranchModel {
  final int branchId;
  final String branchName;
  final String branchCode;
  final dynamic jData;

  BranchModel({
    required this.branchId,
    required this.branchName,
    required this.branchCode,
    this.jData,
  });

  factory BranchModel.fromJson(Map<String, dynamic> json) {
    return BranchModel(
      branchId: json['branchId'] as int,
      branchName: json['branchName'] as String,
      branchCode: json['branchCode'] as String,
      jData: json['jData'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'branchId': branchId,
      'branchName': branchName,
      'branchCode': branchCode,
      'jData': jData,
    };
  }
}
