import 'package:flutter/foundation.dart';

class SessionProvider extends ChangeNotifier {
  static final SessionProvider _instance = SessionProvider._internal();
  factory SessionProvider() => _instance;
  SessionProvider._internal();

  String? _sessionExpiredMessage;

  String? get sessionExpiredMessage => _sessionExpiredMessage;

  bool get hasSessionExpiredMessage => _sessionExpiredMessage != null;

  void setSessionExpiredMessage(String message) {
    _sessionExpiredMessage = message;
    notifyListeners();
  }

  void clearSessionExpiredMessage() {
    _sessionExpiredMessage = null;
    notifyListeners();
  }
}
