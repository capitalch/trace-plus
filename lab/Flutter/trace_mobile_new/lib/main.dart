import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/features/accounts/accounts_page.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_bs_pl_state.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_general_ledger_state.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_trial_balance_state.dart';
import 'package:trace_mobile/features/accounts/widgets/accounts_general_ledger.dart';
import 'package:trace_mobile/features/accounts/widgets/accounts_bspl.dart';
import 'package:trace_mobile/features/accounts/widgets/accounts_trial_balance.dart';
import 'package:trace_mobile/features/authentication/home_page.dart';
import 'package:trace_mobile/features/dashboard/dashboard_page.dart';
import 'package:trace_mobile/features/health/business_health.dart';
import 'package:trace_mobile/features/products/classes/products_tags_state.dart';
import 'package:trace_mobile/features/products/products_page.dart';
import 'package:trace_mobile/features/products/classes/products_search_state.dart';
import 'package:trace_mobile/features/products/classes/products_summary_state.dart';
import 'package:trace_mobile/features/sales/classes/sales_state.dart';
import 'package:trace_mobile/features/sales/sales_page.dart';
import 'package:trace_mobile/features/transactions/classes/transactions_state.dart';
import 'package:trace_mobile/features/transactions/transactions_page.dart';
import 'features/authentication/login_page.dart';

void main() {
  FlutterError.onError = ((FlutterErrorDetails details) {
    FlutterError.presentError(details);
    if (kReleaseMode) {
      exit(1);
    }
  });
  runApp(const TraceApp());
}

class TraceApp extends StatelessWidget {
  const TraceApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return (
        // GraphQLProvider(
        // client: GraphQLService.client,
        // child:
        MultiProvider(
      providers: [
        // ChangeNotifierProvider(create: (context) {
        //   return GraphQLService();
        // }),
        ChangeNotifierProvider(create: (context) => GlobalSettings()),
        ChangeNotifierProvider(
          create: (context) => ProductsSearchState(),
        ),
        ChangeNotifierProvider(
          create: (context) => ProductsSummaryState(),
        ),
        ChangeNotifierProvider(
          create: (context) => ProductsTagsState(),
        ),
        ChangeNotifierProvider(
          create: (context) => SalesState(),
        ),
        ChangeNotifierProvider(
          create: (context) => TransactionsState(),
        ),
        ChangeNotifierProvider(
          create: (context) => AccountsTrialBalanceState(),
        ),
        ChangeNotifierProvider(
          create: (context) => AccountsBsplState(),
        ),
        ChangeNotifierProvider(
          create: (context) => AccountsGeneralLedgerState(),
        ),
      ],
      child: MaterialApp(
        title: 'Trace',
        theme: getThemeData(),
        home: const HomePage(),
        routes: {
          'accounts': (BuildContext context) => const AccountsPage(),
          'bspl': (BuildContext context) => const AccountsBsPl(),
          'businessHealth': (BuildContext context) => const BusinessHealth(),
          'dashboard': (BuildContext context) => const DashBoardPage(),
          'generalLedger': (BuildContext context) =>
              const AccountsGeneralLedger(),
          'login': (BuildContext context) {
            return const LoginPage();
          },
          'products': (BuildContext context) => const ProductsPage(),
          'sales': (BuildContext context) => const SalesPage(),
          'transactions': (BuildContext context) => const TransactionsPage(),
          'trialBalance': (BuildContext context) =>
              const AccountsTrialBalance(),
        },
      ),
    ));
  }

  ThemeData getThemeData() {
    const textStyle =
        TextStyle(color: Colors.indigo, fontWeight: FontWeight.w600);
    return ThemeData(
        backgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0.0,
          titleTextStyle: TextStyle(color: Colors.black),
          iconTheme: IconThemeData(color: Colors.black, size: 24.0),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
            style: ButtonStyle(
          textStyle: const MaterialStatePropertyAll(TextStyle(
            fontSize: 18,
          )),
          shape: MaterialStateProperty.all<RoundedRectangleBorder>(
              RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4.0),
          )),
        )),
        primarySwatch: Colors.indigo,
        scaffoldBackgroundColor: Colors.white,
        textTheme: const TextTheme(
            headline1: TextStyle(
                fontSize: 28, fontWeight: FontWeight.w600, color: Colors.black),
            headline2: TextStyle(
                fontSize: 26, fontWeight: FontWeight.w600, color: Colors.black),
            headline3: TextStyle(
                fontSize: 24, fontWeight: FontWeight.w600, color: Colors.black),
            headline4: TextStyle(
                fontSize: 22, fontWeight: FontWeight.w600, color: Colors.black),
            headline5: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w600, color: Colors.black),
            headline6: TextStyle(
                fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black),
            subtitle1: TextStyle(fontWeight: FontWeight.bold),
            subtitle2: TextStyle(fontWeight: FontWeight.bold),
            bodyText1: TextStyle(fontWeight: FontWeight.bold),
            bodyText2: TextStyle(fontWeight: FontWeight.bold)));
  }
}
