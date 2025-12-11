import 'package:flutter/material.dart';
import './ui/doclist.dart';

void main() {
  runApp(const DocExpiryApp());
}

class DocExpiryApp extends StatelessWidget {
  const DocExpiryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Document Expiry Tracker',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: DocList(),
    );
  }
}

