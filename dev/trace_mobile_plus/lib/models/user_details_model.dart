class UserDetailsModel {
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
  final String? dbParams;
  final String? branchIds;
  final int? lastUsedBuId;
  final int? lastUsedBranchId;
  final int? lastUsedFinYearId;

  UserDetailsModel({
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

  /// Create UserDetailsModel from JSON
  factory UserDetailsModel.fromJson(Map<String, dynamic> json) {
    return UserDetailsModel(
      id: json['id'] as int?,
      uid: json['uid'] as String?,
      userName: json['userName'] as String?,
      userEmail: json['userEmail'] as String?,
      mobileNo: json['mobileNo'] as String?,
      clientId: json['clientId'] as int?,
      clientName: json['clientName'] as String?,
      clientCode: json['clientCode'] as String?,
      roleId: json['roleId'] as int?,
      userType: json['userType'] as String?,
      isUserActive: json['isUserActive'] as bool?,
      isClientActive: json['isClientActive'] as bool?,
      dbName: json['dbName'] as String?,
      isExternalDb: json['isExternalDb'] as bool?,
      dbParams: json['dbParams'] as String?,
      branchIds: json['branchIds'] as String?,
      lastUsedBuId: json['lastUsedBuId'] as int?,
      lastUsedBranchId: json['lastUsedBranchId'] as int?,
      lastUsedFinYearId: json['lastUsedFinYearId'] as int?,
    );
  }

  /// Convert UserDetailsModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'uid': uid,
      'userName': userName,
      'userEmail': userEmail,
      'mobileNo': mobileNo,
      'clientId': clientId,
      'clientName': clientName,
      'clientCode': clientCode,
      'roleId': roleId,
      'userType': userType,
      'isUserActive': isUserActive,
      'isClientActive': isClientActive,
      'dbName': dbName,
      'isExternalDb': isExternalDb,
      'dbParams': dbParams,
      'branchIds': branchIds,
      'lastUsedBuId': lastUsedBuId,
      'lastUsedBranchId': lastUsedBranchId,
      'lastUsedFinYearId': lastUsedFinYearId,
    };
  }

  @override
  String toString() {
    return 'UserDetailsModel(id: $id, uid: $uid, userName: $userName, userEmail: $userEmail, '
        'clientId: $clientId, clientName: $clientName, roleId: $roleId, userType: $userType)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserDetailsModel &&
        other.id == id &&
        other.uid == uid &&
        other.userName == userName &&
        other.userEmail == userEmail &&
        other.clientId == clientId &&
        other.roleId == roleId;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        uid.hashCode ^
        userName.hashCode ^
        userEmail.hashCode ^
        clientId.hashCode ^
        roleId.hashCode;
  }
}
