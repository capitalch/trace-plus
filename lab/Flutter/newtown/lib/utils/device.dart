import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class Device {
  static String get type {
    if (kIsWeb) {
      return "web";
    }
    // Platform checks are only available on non-web platforms
    // Using conditional imports would be needed for Platform.isX on native
    return "unknown";
  }

  static Future<String> get id async {
    var deviceInfo = DeviceInfoPlugin();
    if (kIsWeb) {
      var webInfo = await deviceInfo.webBrowserInfo;
      return webInfo.userAgent ?? 'web-unknown';
    }
    // For native platforms, this would need conditional imports
    // For now, return a default value for web
    return 'unknown-device';
  }
}
