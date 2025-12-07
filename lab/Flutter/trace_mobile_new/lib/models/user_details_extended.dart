class UserDetailsExtended {
  final String? branchIds;
  final String? clientCode;
  final int? clientId;
  final String? clientName;
  final String? dbName;
  final String? dbParams;
  final Map<String, String>? decodedDbParamsObject;
  final String? hash;
  final int? id;
  final bool? isUserActive;
  final bool? isClientActive;
  final bool? isExternalDb;
  final int? lastUsedBranchId;
  final int? lastUsedBuId;
  final int? lastUsedFinYearId;
  final String? mobileNo;
  final String? uid;
  final String? userEmail;
  final String? userName;
  final String? userType; // 'S' | 'A' | 'B'

  UserDetailsExtended({
    this.branchIds,
    this.clientCode,
    this.clientId,
    this.clientName,
    this.dbName,
    this.dbParams,
    this.decodedDbParamsObject,
    this.hash,
    this.id,
    this.isUserActive,
    this.isClientActive,
    this.isExternalDb,
    this.lastUsedBranchId,
    this.lastUsedBuId,
    this.lastUsedFinYearId,
    this.mobileNo,
    this.uid,
    this.userEmail,
    this.userName,
    this.userType,
  });

  factory UserDetailsExtended.fromJson(Map<String, dynamic> json) {
    return UserDetailsExtended(
      branchIds: json['branchIds'] as String?,
      clientCode: json['clientCode'] as String?,
      clientId: json['clientId'] as int?,
      clientName: json['clientName'] as String?,
      dbName: json['dbName'] as String?,
      dbParams: json['dbParams'] as String?,
      decodedDbParamsObject: json['decodedDbParamsObject'] != null
          ? Map<String, String>.from(json['decodedDbParamsObject'])
          : null,
      hash: json['hash'] as String?,
      id: json['id'] as int?,
      isUserActive: json['isUserActive'] as bool?,
      isClientActive: json['isClientActive'] as bool?,
      isExternalDb: json['isExternalDb'] as bool?,
      lastUsedBranchId: json['lastUsedBranchId'] as int?,
      lastUsedBuId: json['lastUsedBuId'] as int?,
      lastUsedFinYearId: json['lastUsedFinYearId'] as int?,
      mobileNo: json['mobileNo'] as String?,
      uid: json['uid'] as String?,
      userEmail: json['userEmail'] as String?,
      userName: json['userName'] as String?,
      userType: json['userType'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'branchIds': branchIds,
      'clientCode': clientCode,
      'clientId': clientId,
      'clientName': clientName,
      'dbName': dbName,
      'dbParams': dbParams,
      'decodedDbParamsObject': decodedDbParamsObject,
      'hash': hash,
      'id': id,
      'isUserActive': isUserActive,
      'isClientActive': isClientActive,
      'isExternalDb': isExternalDb,
      'lastUsedBranchId': lastUsedBranchId,
      'lastUsedBuId': lastUsedBuId,
      'lastUsedFinYearId': lastUsedFinYearId,
      'mobileNo': mobileNo,
      'uid': uid,
      'userEmail': userEmail,
      'userName': userName,
      'userType': userType,
    };
  }

  @override
  String toString() => userName ?? uid ?? 'Unknown User';
}
