import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:trace_mobile_plus/models/business_unit_model.dart';

class AppSettings {
  static const productionUrl = 'https://pilot.cloudjiffy.net';

  // Configure these for your development environment
  static const webDevUrl = 'http://localhost:8000';
  static const androidEmulatorUrl = 'http://10.0.2.2:8000'; // Android emulator localhost
  static const iosSimulatorUrl = 'http://localhost:8000'; // iOS simulator
  static const physicalDeviceUrl = 'http://192.168.1.100:8000'; // Replace with your computer's local IP

  static const bool isProduction = kReleaseMode;

  static String baseUrl = productionUrl;
  // static String get baseUrl {
  //   if (isProduction) {
  //     return productionUrl;
  //   }

  //   // Development environment
  //   if (kIsWeb) {
  //     return webDevUrl;
  //   }

  //   // Mobile platforms
  //   if (Platform.isAndroid) {
  //     // Android emulator uses 10.0.2.2 to access host machine's localhost
  //     // For physical devices, you need to use your computer's local network IP
  //     return androidEmulatorUrl; // Change to physicalDeviceUrl for physical device
  //   }

  //   if (Platform.isIOS) {
  //     // iOS simulator can use localhost
  //     // For physical devices, you need to use your computer's local network IP
  //     return iosSimulatorUrl; // Change to physicalDeviceUrl for physical device
  //   }

  //   return webDevUrl; // Fallback
  // }

  static String get graphQlUrl => '$baseUrl/graphql/';
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
  static Map<String, String?>? dbParams;
  static String? branchIds;
  static int? lastUsedBuId;
  static int? lastUsedBranchId;
  static int? lastUsedFinYearId;

  static List<BusinessUnitModel> allBusinessUnits = [];
  static List<BusinessUnitModel> userBusinessUnits = [];
}
