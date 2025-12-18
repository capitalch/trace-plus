import 'package:json_annotation/json_annotation.dart';

part 'business_unit.g.dart';

@JsonSerializable()
class BusinessUnit {
  final int buId;
  final String buCode;
  final String buName;

  BusinessUnit({
    required this.buId,
    required this.buCode,
    required this.buName,
  });

  factory BusinessUnit.fromJson(Map<String, dynamic> json) =>
      _$BusinessUnitFromJson(json);
  Map<String, dynamic> toJson() => _$BusinessUnitToJson(this);
}
