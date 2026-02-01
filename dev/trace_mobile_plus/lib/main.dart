import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:provider/provider.dart';
import 'core/routes.dart';
import 'theme/app_theme.dart';
import 'services/graphql_service.dart';
import 'services/navigation_service.dart';
import 'providers/global_provider.dart';
import 'providers/session_provider.dart';
import 'providers/sales_provider.dart';
import 'providers/transactions_provider.dart';
import 'providers/business_health_provider.dart';
import 'providers/products_provider.dart';
import 'providers/trial_balance_provider.dart';
import 'providers/balance_sheet_provider.dart';
import 'providers/profit_loss_provider.dart';
import 'providers/general_ledger_provider.dart';

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

        return MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => GlobalProvider()),
            ChangeNotifierProvider(create: (_) => SessionProvider()),
            ChangeNotifierProvider(create: (_) => SalesProvider()),
            ChangeNotifierProvider(create: (_) => TransactionsProvider()),
            ChangeNotifierProvider(create: (_) => BusinessHealthProvider()),
            ChangeNotifierProvider(create: (_) => ProductsProvider()),
            ChangeNotifierProvider(create: (_) => TrialBalanceProvider()),
            ChangeNotifierProvider(create: (_) => BalanceSheetProvider()),
            ChangeNotifierProvider(create: (_) => ProfitLossProvider()),
            ChangeNotifierProvider(create: (_) => GeneralLedgerProvider()),
          ],
          child: GraphQLProvider(
            client: clientNotifier,
            child: MaterialApp.router(
              title: 'Trace+ Mobile',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              routerConfig: router,
            ),
          ),
        );
      },
    );
  }
}
