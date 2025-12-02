import 'package:flutter/widgets.dart';

/// [*** Singleton ***]
///
/// The UI screens provided in figma are in width
/// of 375. So we use this class to scale the designs
/// in implementation to most screen sizes to attain
/// responsiveness so that they look the same on each device
///
/// Call [init] method to initialize instance
/// before the MaterialApp widget

class LayoutUtil {
  static LayoutUtil? _instance;

  static LayoutUtil get instance {
    if (_instance == null) {
      throw Exception(
          "You need to call LayoutUtil.init(<BoxConstraints>) before accessing the instance");
    }
    return _instance!;
  }

  late double _screenWidth;

  LayoutUtil._(BoxConstraints constraints)
      : this._screenWidth = constraints.maxWidth {
    print("Initialized Layout with screen width: $_screenWidth");
  }

  static void init(BoxConstraints constraints) {
    if (_instance == null) {
      _instance = LayoutUtil._(constraints);
    }
  }

  static const double maxWidthForLayout = 375.0;

  double scaleTo(num i) {
    return (i * (_screenWidth / maxWidthForLayout));
  }
}

extension LayoutExt on num {
  ///Extension on num to convert the double value.
  ///Whenever you use grid layout then use this method like this => [20.scale]
  double get scale => LayoutUtil.instance.scaleTo(this);
}
