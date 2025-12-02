import 'package:flutter/material.dart';

class JobsHeader extends StatelessWidget {
  JobsHeader({required String this.title, Key? key}) : super(key: key);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
        ),
        Text(
          'See All',
          style: TextStyle(fontSize: 14, color: Colors.indigo.shade600),
        )
      ],
    );
  }
}