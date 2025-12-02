import 'package:flutter/material.dart';

class UndefineRouteScreen extends StatelessWidget {
  final String routeName;
  const UndefineRouteScreen({Key? key, this.routeName = 'Unknown'})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Center(
        child: Text('$routeName route not found!'),
      ),
    );
  }
}
