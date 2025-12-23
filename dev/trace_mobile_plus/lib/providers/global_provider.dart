import 'package:flutter/foundation.dart';

class GlobalProvider extends ChangeNotifier {
  // Global state variables can be added here
  // Example: theme mode, user preferences, app-wide settings, etc.

  // Example: Theme mode
  bool _isDarkMode = false;
  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  // Add more global state and methods as needed
  // Remember to call notifyListeners() after state changes
}
