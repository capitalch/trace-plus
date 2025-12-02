import 'package:flutter/material.dart';

import '/utils/layout.dart';

class SocialAuthButton extends StatelessWidget {
  final String iconPath;
  final Color buttonColor;
  final String label;
  final VoidCallback? onTap;
  final double? iconHeight;
  final double? iconWidth;
  final double? buttonHeight;
  final double? buttonWidth;

  SocialAuthButton({
    required this.iconPath,
    required this.buttonColor,
    required this.label,
    this.onTap,
    this.iconHeight,
    this.iconWidth,
    this.buttonHeight,
    this.buttonWidth,
  });

  @override
  Widget build(BuildContext context) {
    // final screenSize = ScreenSize.instance;

    return ElevatedButton.icon(
      onPressed: onTap ?? () {},
      icon: Image.asset(
        iconPath,
        height: iconHeight ?? 16.0.scale,
        width: iconWidth ?? 16.0.scale,
      ),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: buttonColor,
        // fixedSize: Size(
        //   buttonWidth ?? double.maxFinite,
        //   buttonHeight ?? 44.0.scale,
        // ),
        minimumSize: Size(
          (buttonWidth ?? 165.0).scale,
          (buttonHeight ?? 44.0).scale,
        ),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0.scale)),
      ),
    );
  }
}
