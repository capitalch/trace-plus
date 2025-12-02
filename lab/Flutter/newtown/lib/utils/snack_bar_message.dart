import 'package:flutter/material.dart';

class SnackBarMessage {
  static const _displayDuration = const Duration(seconds: 4);

  static void show(
    BuildContext context,
    String content, {
    Color color = Colors.red,
    SnackBarAction? action,
    Duration? duration,
  }) {
    String msg = content.contains('Exception:')
        ? content.split('Exception:').last
        : content;

    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        msg,
        textAlign: TextAlign.center,
        style: TextStyle(color: Colors.white),
      ),
      backgroundColor: color,
      duration: duration ?? _displayDuration,
      action: action,
    ));
  }
}
