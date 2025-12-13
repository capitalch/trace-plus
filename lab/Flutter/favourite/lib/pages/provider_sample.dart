import 'package:flutter/material.dart';

class ProviderSamplePage extends StatelessWidget {
  const ProviderSamplePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Provider Sample')),
      body: Center(child: TopLevelWidget()),
    );
  }
}

class TopLevelWidget extends StatelessWidget {
  const TopLevelWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(child: Middle1LevelWidget(firstName: 'John'));
  }
}

class Middle1LevelWidget extends StatelessWidget {
  final String firstName;
  const Middle1LevelWidget({super.key, required this.firstName});

  @override
  Widget build(BuildContext context) {
    return Center(child: Middle2LevelWidget(firstName: firstName));
  }
}

class Middle2LevelWidget extends StatelessWidget {
  final String firstName;
  const Middle2LevelWidget({super.key, required this.firstName});

  @override
  Widget build(BuildContext context) {
    return BottomLevelWidget(firstName: firstName);
  }
}

class BottomLevelWidget extends StatelessWidget {
  final String firstName;
  const BottomLevelWidget({super.key, required this.firstName});
  @override
  Widget build(BuildContext context) {
    return Text(
      '$firstName from Bottom Level Widget',
      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
    );
  }
}
