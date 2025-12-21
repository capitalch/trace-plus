import 'package:flutter/material.dart';
import 'config/routes.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const TraceMobilePlusApp());
}

class TraceMobilePlusApp extends StatelessWidget {
  const TraceMobilePlusApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = createRouter();

    return MaterialApp.router(
      title: 'Trace+ Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
