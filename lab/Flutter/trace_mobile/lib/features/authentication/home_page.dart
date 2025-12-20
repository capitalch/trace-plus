import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import '../../common/classes/routes.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GlobalSettings>(
      builder: (context, globalSettings, _) {
        // Auto-redirect to dashboard if already logged in with REST API
        if (globalSettings.isLoggedIn) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.pushReplacementNamed(context, Routes.dashBoard);
          });
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return Scaffold(
        backgroundColor: Theme.of(context).colorScheme.surface,
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                const Text(''),
                Text(
                  'Trace',
                  style: Theme.of(context)
                      .textTheme
                      .displayLarge
                      ?.copyWith(color: Colors.indigo),
                ),
                Text(
                  'Accounts on cloud',
                  style: Theme.of(context)
                      .textTheme
                      .displaySmall
                      ?.copyWith(color: Colors.indigo),
                ),
                
                Image.asset(
                  'assets/images/reports1.jpg',
                ),
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Demo
                      ElevatedButton.icon(
                          onPressed: () {
                            globalSettings.setDemoLoginData();
                            Navigator.pushNamed(context, Routes.dashBoard, arguments: Utils.execDataCache(globalSettings));
                          },
                          icon: const Icon(Icons.account_tree),
                          label: const Text('Demo')),
                      // Login
                      ElevatedButton.icon(
                          onPressed: () {
                            // no back
                            Navigator.pushNamed(context, Routes.login);
                          },
                          icon: const Icon(Icons.login),
                          label: const Text('Login')),
                      // Next
                      const NextButton()
                    ])
              ]),
        ),
      );
      },
    );
  }
}

class NextButton extends StatelessWidget {
  const NextButton({super.key});

  @override
  Widget build(BuildContext context) {
    var globalSettings = Provider.of<GlobalSettings>(context, listen: true);
    bool isUserLoggedIn = globalSettings.isUserLoggedIn();
    return ElevatedButton.icon(
        onPressed: isUserLoggedIn
            ? () {                
                // Utils.execDataCache(globalSettings, );
                Navigator.pushNamed(context, Routes.dashBoard,arguments: Utils.execDataCache(globalSettings));
              }
            : null,
        icon: const Icon(Icons.next_plan),
        label: const Text('Next'));
  }
}
