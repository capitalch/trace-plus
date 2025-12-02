import 'package:flutter/material.dart';

class SnapshotErrorWidget extends StatelessWidget {
  final String error;
  const SnapshotErrorWidget({
    Key? key,
    required this.error,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    String errorText = error;
    if (error.contains('Exception:')) {
      errorText = error.split('Exception:').last.trim();
    }

    return Center(
      child: Text(
        errorText,
        style: TextStyle(color: Colors.red),
      ),
    );
  }
}
