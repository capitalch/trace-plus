import 'package:flutter/material.dart';
import 'package:jobs_in_education/utils/screen_size.dart';

class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const PrimaryButton({
    Key? key,
    required this.text,
    required this.onPressed,
  }) : super(key: key);

  static final ScreenSize _screenSize = ScreenSize.instance;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(text),
      style: ElevatedButton.styleFrom(
        fixedSize: Size(double.maxFinite, _screenSize.height(7)),
      ),
    );
  }
}
