import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/features/dashboard/widgets/dashboard_app_bar.dart';
import 'package:trace_mobile/features/dashboard/widgets/dashboard_bottom_navigation_bar.dart';
import 'package:trace_mobile/features/dashboard/widgets/dashboard_subheader.dart';

class DashBoardPage extends StatelessWidget {
  const DashBoardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final globalSettings = Provider.of<GlobalSettings>(context);
    final userPayload = globalSettings.userPayload;

    if (userPayload == null || !globalSettings.isLoggedIn) {
      // Not logged in, redirect to login
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, Routes.login);
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // Check if coming from old GraphQL login flow
    Future<dynamic>? dashboardFuture;
    final routeArgs = ModalRoute.of(context)?.settings.arguments;
    if (routeArgs is Future<dynamic>) {
      dashboardFuture = routeArgs;
    }

    // For REST API login, show dashboard directly
    if (dashboardFuture == null) {
      var theme = Theme.of(context).textTheme;
      return Material(
        child: Scaffold(
                appBar: const DashboardAppBar(),
                drawer: Drawer(
                  backgroundColor: Colors.grey,
                  // width: 250,
                  child: ListView(
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    children: [
                      SizedBox(
                        height: 90,
                        child: DrawerHeader(
                            child: Text(
                          'Trace menu',
                          style: theme.displaySmall?.copyWith(color: Colors.brown.shade800, fontWeight: FontWeight.bold),
                        )),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Bank reconcillation',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Stock orders',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Stock tally',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Accounts ledger',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      )
                    ],
                  ),
                ),
          body: const Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [DashboardSubheader()],
          ),
          bottomNavigationBar: const DashboardBottomNavigationBar(),
        ),
      );
    }

    // For old GraphQL login flow (backward compatibility)
    Widget tempWidget = FutureBuilder(
        future: dashboardFuture,
        builder: ((context, snapshot) {
          Widget widget;
          if (snapshot.connectionState == ConnectionState.waiting) {
            widget = Center(
              child: Text(
                'Loading...',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            );
          } else {
            if (snapshot.hasError) {
              widget = Center(
                child: Text(
                  'Error: ${snapshot.error}',
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              );
            } else {
              var theme = Theme.of(context).textTheme;
              widget = Scaffold(
                appBar: const DashboardAppBar(),
                drawer: Drawer(
                  backgroundColor: Colors.grey,
                  // width: 250,
                  child: ListView(
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    children: [
                      SizedBox(
                        height: 90,
                        child: DrawerHeader(
                            child: Text(
                          'Trace menu',
                          style: theme.displaySmall?.copyWith(color: Colors.brown.shade800, fontWeight: FontWeight.bold),
                        )),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Bank reconcillation',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Stock orders',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Stock tally',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Accounts ledger',
                            style: theme.titleMedium,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      )
                    ],
                  ),
                ),
                body: const Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [DashboardSubheader()],
                ),
                bottomNavigationBar: const DashboardBottomNavigationBar(),
              );
            }
          }
          return widget;
        }));
    return Material(
      child: tempWidget,
    );
  }
}
