import 'unit_info_model.dart';

class SettingModel {
  final String key;
  final UnitInfoModel? jData;

  SettingModel({
    required this.key,
    this.jData,
  });

  factory SettingModel.fromJson(Map<String, dynamic> json) {
    return SettingModel(
      key: json['key'] as String,
      jData: json['jData'] != null
          ? UnitInfoModel.fromJson(json['jData'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'jData': jData?.toJson(),
    };
  }
}
