import 'package:flutter/material.dart';

class JobStatusCard extends StatelessWidget {
  final String jobs;
  final String status;
  final IconData icon;

  const JobStatusCard({
    Key? key,
    required this.jobs,
    required this.status,
    required this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(8.0),
              ),
              padding: const EdgeInsets.all(8.0),
              child: Icon(icon, color: Colors.orange),
            ),
            SizedBox(width: 8.0),
            Expanded(
              flex: 10,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    jobs,
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  SizedBox(height: 6.0),
                  Text(
                    status,
                    style: TextStyle(color: Colors.indigo.shade400, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
