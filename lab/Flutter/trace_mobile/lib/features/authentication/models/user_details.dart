import 'package:json_annotation/json_annotation.dart';

part 'user_details.g.dart';

@JsonSerializable()
class UserDetails {
  final int? id;
  final String? uid;
  final String? userName;
  final String? userEmail;
  final String? mobileNo;
  final int? clientId;
  final String? clientName;
  final String? clientCode;
  final int? roleId;
  final String? userType;
  final bool? isUserActive;
  final bool? isClientActive;
  final String? dbName;
  final bool? isExternalDb;
  final Map<String, dynamic>? dbParams;
  final String? branchIds;
  final int? lastUsedBuId;
  final int? lastUsedBranchId;
  final int? lastUsedFinYearId;

  UserDetails({
    this.id,
    this.uid,
    this.userName,
    this.userEmail,
    this.mobileNo,
    this.clientId,
    this.clientName,
    this.clientCode,
    this.roleId,
    this.userType,
    this.isUserActive,
    this.isClientActive,
    this.dbName,
    this.isExternalDb,
    this.dbParams,
    this.branchIds,
    this.lastUsedBuId,
    this.lastUsedBranchId,
    this.lastUsedFinYearId,
  });

  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);
  Map<String, dynamic> toJson() => _$UserDetailsToJson(this);
}
