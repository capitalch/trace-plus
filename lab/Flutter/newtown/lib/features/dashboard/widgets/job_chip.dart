import 'package:flutter/material.dart';

class JobChip extends StatelessWidget {
  final IconData icon;
  final String title;
  const JobChip({
    Key? key,
    required this.icon,
    required this.title,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 10.0),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.orange),
          SizedBox(width: 4.0),
          Text(title),
        ],
      ),
    );
  }
}
