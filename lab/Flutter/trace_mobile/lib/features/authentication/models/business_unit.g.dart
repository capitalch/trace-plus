// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'business_unit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BusinessUnit _$BusinessUnitFromJson(Map<String, dynamic> json) => BusinessUnit(
  buId: (json['buId'] as num).toInt(),
  buCode: json['buCode'] as String,
  buName: json['buName'] as String,
);

Map<String, dynamic> _$BusinessUnitToJson(BusinessUnit instance) =>
    <String, dynamic>{
      'buId': instance.buId,
      'buCode': instance.buCode,
      'buName': instance.buName,
    };
