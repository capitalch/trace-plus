import 'package:flutter/material.dart';

import '/utils/assets_path.dart';
import '/utils/layout.dart';

class JINLogoWithText extends StatelessWidget {
  final double height;
  final double width;

  const JINLogoWithText({
    Key? key,
    this.height = 36,
    this.width = 123,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FadeInImage(
      image: AssetImage(AssetsPath.jinLogoWithText),
      placeholder: AssetImage(AssetsPath.placeholderWhite),
      width: width.scale,
      height: height.scale,
      fit: BoxFit.contain,
    );
  }
}
