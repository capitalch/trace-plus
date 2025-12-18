// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserPayload _$UserPayloadFromJson(Map<String, dynamic> json) => UserPayload(
  userDetails: UserDetails.fromJson(
    json['userDetails'] as Map<String, dynamic>,
  ),
  role: json['role'] == null
      ? null
      : Role.fromJson(json['role'] as Map<String, dynamic>),
  allBusinessUnits: (json['allBusinessUnits'] as List<dynamic>)
      .map((e) => BusinessUnit.fromJson(e as Map<String, dynamic>))
      .toList(),
  userBusinessUnits: (json['userBusinessUnits'] as List<dynamic>)
      .map((e) => BusinessUnit.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$UserPayloadToJson(UserPayload instance) =>
    <String, dynamic>{
      'userDetails': instance.userDetails,
      'role': instance.role,
      'allBusinessUnits': instance.allBusinessUnits,
      'userBusinessUnits': instance.userBusinessUnits,
    };
