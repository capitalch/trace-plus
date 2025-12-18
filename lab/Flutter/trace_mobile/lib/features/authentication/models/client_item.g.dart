// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'client_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClientItem _$ClientItemFromJson(Map<String, dynamic> json) => ClientItem(
  id: (json['id'] as num).toInt(),
  clientName: json['clientName'] as String,
);

Map<String, dynamic> _$ClientItemToJson(ClientItem instance) =>
    <String, dynamic>{'id': instance.id, 'clientName': instance.clientName};
