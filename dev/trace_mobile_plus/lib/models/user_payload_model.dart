import 'user_details_model.dart';
import 'business_unit_model.dart';

class UserPayloadModel {
  final UserDetailsModel userDetails;
  final List<BusinessUnitModel> allBusinessUnits;
  final List<BusinessUnitModel>? userBusinessUnits;

  UserPayloadModel({
    required this.userDetails,
    required this.allBusinessUnits,
    this.userBusinessUnits,
  });

  /// Create UserPayloadModel from JSON
  factory UserPayloadModel.fromJson(Map<String, dynamic> json) {
    return UserPayloadModel(
      userDetails: UserDetailsModel.fromJson(json['userDetails'] as Map<String, dynamic>),
      allBusinessUnits: (json['allBusinessUnits'] as List<dynamic>)
          .map((e) => BusinessUnitModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      userBusinessUnits: json['userBusinessUnits'] != null
          ? (json['userBusinessUnits'] as List<dynamic>)
              .map((e) => BusinessUnitModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  /// Convert UserPayloadModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'userDetails': userDetails.toJson(),
      'allBusinessUnits': allBusinessUnits.map((e) => e.toJson()).toList(),
      'userBusinessUnits': userBusinessUnits?.map((e) => e.toJson()).toList(),
    };
  }

  @override
  String toString() {
    return 'UserPayloadModel(userDetails: $userDetails, '
        'allBusinessUnits: ${allBusinessUnits.length} units, '
        'userBusinessUnits: ${userBusinessUnits?.length ?? 0} units)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserPayloadModel &&
        other.userDetails == userDetails &&
        other.allBusinessUnits.length == allBusinessUnits.length &&
        other.userBusinessUnits?.length == userBusinessUnits?.length;
  }

  @override
  int get hashCode {
    return userDetails.hashCode ^
        allBusinessUnits.length.hashCode ^
        (userBusinessUnits?.length ?? 0).hashCode;
  }
}
