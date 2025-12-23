import 'package:flutter/foundation.dart';
import 'package:trace_mobile_plus/models/business_unit_model.dart';

class AppSettings {
  static const localBaseUrl = 'http://localhost:8000';
  static const productionUrl = 'https://pilot.cloudjiffy.net/graphql';
  static const bool isProduction = kReleaseMode;
  static const String baseUrl = isProduction ? productionUrl : localBaseUrl;
  static String? uid;
  static String? userName;
  static String? userEmail;
  static int? clientId;
  static String? clientName;
  static String? clientCode;

  static String? userType;
  static bool? isUserActive;
  static bool? isClientActive;
  static String? dbName;
  static bool? isExternalDb;
  static String? dbParams;
  static String? branchIds;
  static int? lastUsedBuId;
  static int? lastUsedBranchId;
  static int? lastUsedFinYearId;

  static List<BusinessUnitModel> allBusinessUnits = [];
  static List<BusinessUnitModel> userBusinessUnits = [];
}
