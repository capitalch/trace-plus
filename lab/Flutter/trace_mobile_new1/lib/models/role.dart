class Role {
  final int? clientId;
  final int? roleId;
  final String? roleName;

  Role({
    this.clientId,
    this.roleId,
    this.roleName,
  });

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      clientId: json['clientId'] as int?,
      roleId: json['roleId'] as int?,
      roleName: json['roleName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'clientId': clientId,
      'roleId': roleId,
      'roleName': roleName,
    };
  }

  @override
  String toString() => roleName ?? 'No Role';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Role &&
          runtimeType == other.runtimeType &&
          roleId == other.roleId;

  @override
  int get hashCode => roleId.hashCode;
}
