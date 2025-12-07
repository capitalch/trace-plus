import 'package:trace_mobile/models/business_unit.dart';
import 'package:trace_mobile/models/role.dart';
import 'package:trace_mobile/models/user_details_extended.dart';

class LoginResponse {
  // Basic fields (existing)
  final int clientId;
  final int id;
  final String uid;
  final String token;
  final String userType;
  final int? lastUsedBranchId;
  final String? lastUsedBuCode;
  final List<String> buCodes;
  final List<BuCodeWithPermission> buCodesWithPermissions;

  // Comprehensive fields (new)
  final List<BusinessUnit> allBusinessUnits;
  // final Role? role;
  final UserDetailsExtended userDetailsExtended;

  LoginResponse({
    // Basic fields
    required this.clientId,
    required this.id,
    required this.uid,
    required this.token,
    required this.userType,
    this.lastUsedBranchId,
    this.lastUsedBuCode,
    required this.buCodes,
    required this.buCodesWithPermissions,

    // Comprehensive fields
    required this.allBusinessUnits,
    // this.role,
    required this.userDetailsExtended,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      clientId: json['clientId'] as int,
      id: json['id'] as int,
      uid: json['uid'] as String,
      token: json['token'] as String,
      userType: json['userType'] as String,
      lastUsedBranchId: json['lastUsedBranchId'] as int?,
      lastUsedBuCode: json['lastUsedBuCode'] as String?,
      buCodes: (json['buCodes'] as List?)?.cast<String>() ?? [],
      buCodesWithPermissions: (json['buCodesWithPermissions'] as List?)
              ?.map((e) => BuCodeWithPermission.fromJson(e))
              .toList() ??
          [],

      // Comprehensive fields
      allBusinessUnits: (json['allBusinessUnits'] as List?)
              ?.map((e) => BusinessUnit.fromJson(e))
              .toList() ??
          [],
      // role: json['role'] != null ? Role.fromJson(json['role']) : null,
      userDetailsExtended: UserDetailsExtended.fromJson(
        json['userDetailsExtended'] ?? {},
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'clientId': clientId,
      'id': id,
      'uid': uid,
      'token': token,
      'userType': userType,
      'lastUsedBranchId': lastUsedBranchId,
      'lastUsedBuCode': lastUsedBuCode,
      'buCodes': buCodes,
      'buCodesWithPermissions':
          buCodesWithPermissions.map((e) => e.toJson()).toList(),
      'allBusinessUnits': allBusinessUnits.map((e) => e.toJson()).toList(),
      // 'role': role?.toJson(),
      'userDetailsExtended': userDetailsExtended.toJson(),
    };
  }
}

class BuCodeWithPermission {
  final String buCode;
  final List<String> permissions;

  BuCodeWithPermission({
    required this.buCode,
    required this.permissions,
  });

  factory BuCodeWithPermission.fromJson(Map<String, dynamic> json) {
    return BuCodeWithPermission(
      buCode: json['buCode'] as String,
      permissions: (json['permissions'] as List?)?.cast<String>() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'buCode': buCode,
      'permissions': permissions,
    };
  }
}
