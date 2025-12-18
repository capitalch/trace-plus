// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_details.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserDetails _$UserDetailsFromJson(Map<String, dynamic> json) => UserDetails(
  id: (json['id'] as num?)?.toInt(),
  uid: json['uid'] as String?,
  userName: json['userName'] as String?,
  userEmail: json['userEmail'] as String?,
  mobileNo: json['mobileNo'] as String?,
  clientId: (json['clientId'] as num?)?.toInt(),
  clientName: json['clientName'] as String?,
  clientCode: json['clientCode'] as String?,
  roleId: (json['roleId'] as num?)?.toInt(),
  userType: json['userType'] as String?,
  isUserActive: json['isUserActive'] as bool?,
  isClientActive: json['isClientActive'] as bool?,
  dbName: json['dbName'] as String?,
  isExternalDb: json['isExternalDb'] as bool?,
  dbParams: json['dbParams'] as Map<String, dynamic>?,
  branchIds: json['branchIds'] as String?,
  lastUsedBuId: (json['lastUsedBuId'] as num?)?.toInt(),
  lastUsedBranchId: (json['lastUsedBranchId'] as num?)?.toInt(),
  lastUsedFinYearId: (json['lastUsedFinYearId'] as num?)?.toInt(),
);

Map<String, dynamic> _$UserDetailsToJson(UserDetails instance) =>
    <String, dynamic>{
      'id': instance.id,
      'uid': instance.uid,
      'userName': instance.userName,
      'userEmail': instance.userEmail,
      'mobileNo': instance.mobileNo,
      'clientId': instance.clientId,
      'clientName': instance.clientName,
      'clientCode': instance.clientCode,
      'roleId': instance.roleId,
      'userType': instance.userType,
      'isUserActive': instance.isUserActive,
      'isClientActive': instance.isClientActive,
      'dbName': instance.dbName,
      'isExternalDb': instance.isExternalDb,
      'dbParams': instance.dbParams,
      'branchIds': instance.branchIds,
      'lastUsedBuId': instance.lastUsedBuId,
      'lastUsedBranchId': instance.lastUsedBranchId,
      'lastUsedFinYearId': instance.lastUsedFinYearId,
    };
