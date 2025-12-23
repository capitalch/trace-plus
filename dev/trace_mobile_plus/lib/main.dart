import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'config/routes.dart';
import 'theme/app_theme.dart';
import 'services/graphql_service.dart';

void main() async {
  // Initialize GraphQL client storage
  await initHiveForFlutter();

  runApp(const TraceMobilePlusApp());
}

class TraceMobilePlusApp extends StatelessWidget {
  const TraceMobilePlusApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = createRouter();
    final graphQLService = GraphQLService();

    return FutureBuilder<ValueNotifier<GraphQLClient>>(
      future: graphQLService.getClientNotifier(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          // Show loading screen while initializing GraphQL client
          return const MaterialApp(
            debugShowCheckedModeBanner: false,
            home: Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            ),
          );
        }

        if (snapshot.hasError) {
          // Handle error in GraphQL client initialization
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            home: Scaffold(
              body: Center(
                child: Text('Error initializing app: ${snapshot.error}'),
              ),
            ),
          );
        }

        // GraphQL client notifier is ready
        final clientNotifier = snapshot.data!;

        return GraphQLProvider(
          client: clientNotifier,
          child: MaterialApp.router(
            title: 'Trace+ Mobile',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: router,
          ),
        );
      },
    );
  }
}
