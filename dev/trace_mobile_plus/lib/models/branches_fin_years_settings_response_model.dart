import 'branch_model.dart';
import 'fin_year_model.dart';
import 'setting_model.dart';

class BranchesFinYearsSettingsResponseModel {
  final List<BranchModel> allBranches;
  final List<FinYearModel> allFinYears;
  final List<SettingModel> allSettings;

  BranchesFinYearsSettingsResponseModel({
    required this.allBranches,
    required this.allFinYears,
    required this.allSettings,
  });

  factory BranchesFinYearsSettingsResponseModel.fromJson(Map<String, dynamic> json) {
    return BranchesFinYearsSettingsResponseModel(
      allBranches: (json['allBranches'] as List<dynamic>)
          .map((e) => BranchModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      allFinYears: (json['allFinYears'] as List<dynamic>)
          .map((e) => FinYearModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      allSettings: (json['allSettings'] as List<dynamic>)
          .map((e) => SettingModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'allBranches': allBranches.map((e) => e.toJson()).toList(),
      'allFinYears': allFinYears.map((e) => e.toJson()).toList(),
      'allSettings': allSettings.map((e) => e.toJson()).toList(),
    };
  }
}
