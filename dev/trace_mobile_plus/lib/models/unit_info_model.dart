class UnitInfoModel {
  final String? pin;
  final String? email;
  final String? gstin;
  final String? state;
  final String? webSite;
  final String? address1;
  final String? unitName;
  final String? landPhone;
  final String? shortName;
  final String? mobileNumber;

  UnitInfoModel({
    required this.pin,
    required this.email,
    required this.gstin,
    required this.state,
    required this.webSite,
    required this.address1,
    required this.unitName,
    required this.landPhone,
    required this.shortName,
    required this.mobileNumber,
  });

  factory UnitInfoModel.fromJson(Map<String, dynamic> json) {
    return UnitInfoModel(
      pin: json['pin'] as String,
      email: json['email'] as String,
      gstin: json['gstin'] as String,
      state: json['state'] as String,
      webSite: json['webSite'] as String,
      address1: json['address1'] as String,
      unitName: json['unitName'] as String,
      landPhone: json['landPhone'] as String,
      shortName: json['shortName'] as String,
      mobileNumber: json['mobileNumber'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pin': pin,
      'email': email,
      'gstin': gstin,
      'state': state,
      'webSite': webSite,
      'address1': address1,
      'unitName': unitName,
      'landPhone': landPhone,
      'shortName': shortName,
      'mobileNumber': mobileNumber,
    };
  }
}
