import 'package:json_annotation/json_annotation.dart';

part 'role.g.dart';

@JsonSerializable()
class Role {
  final int roleId;
  final String roleName;
  final int clientId;

  Role({
    required this.roleId,
    required this.roleName,
    required this.clientId,
  });

  factory Role.fromJson(Map<String, dynamic> json) => _$RoleFromJson(json);
  Map<String, dynamic> toJson() => _$RoleToJson(this);
}
