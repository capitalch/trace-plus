import 'package:flutter/material.dart';

class DropdownErrorWidget extends StatelessWidget {
  final String error;
  const DropdownErrorWidget({Key? key, this.error = 'Something wrong!'})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    String errorText = error;
    if (error.contains('Exception:')) {
      errorText = error.split('Exception:').last.trim();
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Container(
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.symmetric(horizontal: 12.0),
        height: 54,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: Color(0xFFF0F0F0),
        ),
        child: Text(
          errorText,
          style: Theme.of(context)
              .textTheme
              .bodyLarge!
              .copyWith(color: Colors.red),
        ),
      ),
    );
  }
}
