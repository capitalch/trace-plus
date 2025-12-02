import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/widgets/job_chip.dart';

class JobCard extends StatelessWidget {
  JobCard(
      {required this.school,
        this.fullPost = '',
        this.location = '',
        this.minExperience = '',
        this.timing = '',
        this.offer = '',
        Key? key})
      : super(key: key);
  final String school, fullPost, location, minExperience, timing, offer;

  @override
  Widget build(BuildContext context) {
    return Card(
        child: Padding(
          padding: EdgeInsets.all(12.0),
          child: Container(
              width: MediaQuery.of(context).size.width * 0.7,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                          radius: 12.0,
                          backgroundColor: Colors.indigo.shade50,
                          child: Icon(
                            Icons.school,
                            size: 16,
                          )),
                      SizedBox(width: 10.0),
                      Text(
                        school,
                        style: TextStyle(
                          color: Colors.indigo.shade600,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Spacer(),
                      Icon(Icons.save_outlined, color: Colors.black54),
                    ],
                  ),
                  SizedBox(
                    height: 12.0,
                  ),
                  Row(
                    children: [
                      Text(
                        fullPost,
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                      Spacer(),
                      Text(
                        '3d',
                        style: TextStyle(
                          fontWeight: FontWeight.w400,
                          color: Colors.indigo.shade400,
                        ),
                      )
                    ],
                  ),
                  SizedBox(height: 6.0),
                  Row(
                    children: [
                      JobChip(
                        icon: Icons.watch_later,
                        title: minExperience,
                      ),
                      JobChip(icon: Icons.location_on, title: location)
                    ],
                  ),
                  SizedBox(height: 12.0),
                  Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.indigo.shade50,
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: Text(
                          'Full Time',
                          style: TextStyle(color: Colors.indigo),
                        ),
                        padding: const EdgeInsets.all(8.0),
                      ),
                      Spacer(),
                      Text(
                        '3.5 LPA',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  )
                ],
              )),
        ));
  }
}