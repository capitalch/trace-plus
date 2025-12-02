import 'package:flutter/material.dart';

import '/utils/layout.dart';

class CustomDivider extends StatelessWidget {
  final String label;
  const CustomDivider({Key? key, this.label = 'or'}) : super(key: key);

  Widget get line => Container(
        height: 0.8.scale,
        width: 138.scale,
        color: Colors.black,
      );

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        line,
        Text(label),
        line,
      ],
    );
  }
}
