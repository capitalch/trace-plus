import 'package:flutter/material.dart';

class HomeBottomNavBar extends StatelessWidget {
  const HomeBottomNavBar({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      elevation: 10.0,
      items: [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        BottomNavigationBarItem(
            icon: Icon(
              Icons.person,
              color: Colors.transparent,
            ),
            label: 'Find A Job'),
        BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Calendar'),
      ],
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,
    );
  }
}
