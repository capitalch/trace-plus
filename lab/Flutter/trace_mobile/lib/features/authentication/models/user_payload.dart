import 'package:json_annotation/json_annotation.dart';
import 'user_details.dart';
import 'role.dart';
import 'business_unit.dart';

part 'user_payload.g.dart';

@JsonSerializable(explicitToJson: true)
class UserPayload {
  final UserDetails userDetails;
  final Role? role;
  final List<BusinessUnit> allBusinessUnits;
  final List<BusinessUnit>? userBusinessUnits;

  UserPayload({
    required this.userDetails,
    this.role,
    required this.allBusinessUnits,
    this.userBusinessUnits,
  });

  factory UserPayload.fromJson(Map<String, dynamic> json) =>
      _$UserPayloadFromJson(json);
  Map<String, dynamic> toJson() => _$UserPayloadToJson(this);
}
