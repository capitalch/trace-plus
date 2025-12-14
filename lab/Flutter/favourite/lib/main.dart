import 'package:favourite/providers/http_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';
import 'providers/counter_provider.dart';
// import 'providers/http_provider.dart';

void main() {
  runApp(
    // Implementation of both Provider and Riverpod
    ProviderScope(// Riverpod scope
      child: MultiProvider( // Provider from Flutter
        providers: [
          // Add other providers here if needed
          ChangeNotifierProvider(create: (context) => CounterProvider()),
          ChangeNotifierProvider(create: (context) => HttpProvider1()),
        ],
        // create: (context) => CounterProvider(),
        child: const MyApp(),
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      title: 'Startup Project',
      theme: ThemeData(
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.yellow,
          foregroundColor: Colors.redAccent,
        ),
        scaffoldBackgroundColor: Colors.lightBlue[50],
      ),
    );
  }
}
