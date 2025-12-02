import 'package:flutter/material.dart';

import '/utils/screen_size.dart';

class LoadingIndicator {
  static final double _indicatorSize = ScreenSize.instance.width(30);
  static final Color _primaryColor = Color(0xFF2A5798);

  static void show(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Center(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(_indicatorSize / 4),
            ),
            height: _indicatorSize,
            width: _indicatorSize,
            child: Center(
              child: CircularProgressIndicator(
                color: _primaryColor,
              ),
            ),
          ),
        );
      },
    );
  }

  static void close(BuildContext context) {
    Navigator.pop(context);
  }
}
