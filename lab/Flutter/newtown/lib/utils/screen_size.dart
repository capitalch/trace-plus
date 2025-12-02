import 'package:flutter/material.dart';

/// [*** Singleton ***]
///
/// Safe area screen size is divided in 100 part.
/// Both horizontally & vertically.
///
/// Call [init] method to initialize instance
/// on first [BuildContext] of the app.
class ScreenSize {
  static ScreenSize? _instance;

  late double _onePercentHeight;
  late double _onePercentWidth;

  ScreenSize._(BuildContext context) {
    final MediaQueryData data = MediaQuery.of(context);

    _onePercentHeight = _getSafeAreaHeight(data) / 100;
    _onePercentWidth = _getSafeAreaWidth(data) / 100;
  }

  static ScreenSize get instance {
    if (_instance == null) {
      throw Exception(
          'ScreenSize not initialize, Call ScreenSize.init() to initialize');
    }
    return _instance!;
  }

  static void init(BuildContext context) {
    if (_instance == null) {
      _instance = ScreenSize._(context);
    }
  }

  double _getSafeAreaHeight(MediaQueryData data) =>
      data.size.height - data.viewPadding.vertical;

  double _getSafeAreaWidth(MediaQueryData data) =>
      data.size.width - data.viewPadding.horizontal;

  double height(double heightPercent) => _onePercentHeight * heightPercent;
  double width(double widthPercent) => _onePercentWidth * widthPercent;
}
