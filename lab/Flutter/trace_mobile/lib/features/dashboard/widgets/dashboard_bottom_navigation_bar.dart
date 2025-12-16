import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/routes.dart';

class DashboardBottomNavigationBar extends StatelessWidget {
  const DashboardBottomNavigationBar({super.key});

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return BottomNavigationBar(
      elevation: 10,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.point_of_sale_sharp),
          label: 'Sales',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.ac_unit),
          label: 'Transactions',
        ),
        BottomNavigationBarItem(
            icon: Icon(Icons.search_sharp), label: 'Products'),
        BottomNavigationBarItem(
          icon: Icon(Icons.account_tree),
          label: 'Accounts',
        ),
        BottomNavigationBarItem(
            icon: Icon(Icons.balance_sharp), label: 'Health'),
      ],
      onTap: (value) {
        if (value == 0) {
          Navigator.pushNamed(context, Routes.sales);
        } else if (value == 1) {
          Navigator.pushNamed(
            context,
            Routes.transactions,
          );
        } else if (value == 2) {
          GlobalSettings globalSettings =
              Provider.of<GlobalSettings>(context, listen: false);
          var results = GraphQLQueries.genericView(
              sqlKey: 'get_products_info',
              globalSettings: globalSettings,
              entityName: 'accounts',
              isMultipleRows: true,
              args: {'onDate': null, 'isAll': true, 'days': 0});
          Navigator.pushNamed(context, Routes.products, arguments: results);
        } else if (value == 3) {
          Navigator.pushNamed(context, Routes.accounts);
        } else if (value == 4) {
          Navigator.pushNamed(context, Routes.businessHealth);
        }
      },
      selectedItemColor: Colors.indigo.shade700,
      iconSize: 30,
      backgroundColor: theme.colorScheme.surface,
      type: BottomNavigationBarType.fixed,
    );
  }
}
