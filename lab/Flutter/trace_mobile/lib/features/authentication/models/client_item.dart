import 'package:json_annotation/json_annotation.dart';

part 'client_item.g.dart';

@JsonSerializable()
class ClientItem {
  final int id;
  final String clientName;

  ClientItem({
    required this.id,
    required this.clientName,
  });

  factory ClientItem.fromJson(Map<String, dynamic> json) =>
      _$ClientItemFromJson(json);
  Map<String, dynamic> toJson() => _$ClientItemToJson(this);
}
