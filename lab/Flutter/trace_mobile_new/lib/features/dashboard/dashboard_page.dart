import 'package:flutter/material.dart';
import 'package:trace_mobile/features/dashboard/widgets/dashboard_app_bar.dart';
import 'package:trace_mobile/features/dashboard/widgets/dashboard_bottom_navigation_bar.dart';
import 'package:trace_mobile/features/dashboard/widgets/dashboard_subheader.dart';

class DashBoardPage extends StatelessWidget {
  const DashBoardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Future<dynamic> dashboardFuture =
        ModalRoute.of(context)!.settings.arguments as Future<dynamic>;

    Widget tempWidget = FutureBuilder(
        future: dashboardFuture,
        builder: ((context, snapshot) {
          Widget widget;
          if (snapshot.connectionState == ConnectionState.waiting) {
            widget = Center(
              child: Text(
                'Loading...',
                style: Theme.of(context).textTheme.headline5,
              ),
            );
          } else {
            if (snapshot.hasError) {
              widget = Center(
                child: Text(
                  'Error: ${snapshot.error}',
                  style: TextStyle(color: Theme.of(context).errorColor),
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
                          style: theme.headline3?.copyWith(color: Colors.brown.shade800, fontWeight: FontWeight.bold),
                        )),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(3),
                        child: ListTile(
                          dense: true,
                          tileColor: Colors.grey.shade300,
                          title: Text(
                            'Bank reconcillation',
                            style: theme.subtitle1,
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
                            style: theme.subtitle1,
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
                            style: theme.subtitle1,
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
                            style: theme.subtitle1,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                          },
                        ),
                      )
                    ],
                  ),
                ),
                body: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: const [DashboardSubheader()],
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
