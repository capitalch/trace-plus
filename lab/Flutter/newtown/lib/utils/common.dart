import 'package:flutter/material.dart';
import 'app_settings.dart';

/// Screen design is in Figma. FigmaToLocalConverter class converts the figma dimensions to device dimensions.
/// The output is (available screen dimension / figma screen dimension) * figma units

class FigmaToLocalConverter {
  static double toLocalHeight(BuildContext context, double figmaHeight) {
    double figmaScreenHeight = AppSettings.figmaScreenHeight;
    MediaQueryData data = MediaQuery.of(context);
    double availableScreenHeight = data.size.height - data.viewPadding.vertical;
    double convertedHeight =
        (availableScreenHeight / (figmaScreenHeight ?? 1)) * figmaHeight;
    return (convertedHeight);
  }

  static double toLocalWidth(BuildContext context, double figmaWidth) {
    double figmaScreenWidth = AppSettings.figmaScreenWidth;
    MediaQueryData data = MediaQuery.of(context);
    double availableScreenWidth = data.size.width - data.viewPadding.horizontal;
    double convertedHeight =
        (availableScreenWidth / (figmaScreenWidth ?? 1)) * figmaWidth;
    return (convertedHeight);
  }
}
