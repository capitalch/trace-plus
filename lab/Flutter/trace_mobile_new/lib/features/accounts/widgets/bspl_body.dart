import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_bs_pl_data_model.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_bs_pl_state.dart';
import 'package:trace_mobile/features/accounts/widgets/custom_expansion_tile.dart';

class BsplBody extends StatelessWidget {
  const BsplBody({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var globalSettings = context.read<GlobalSettings>();
    var bsplFuture =
        GraphQLQueries.balanceSheetProfitLoss(globalSettings: globalSettings);

    return FutureBuilder(
      future: bsplFuture,
      builder: (context, snapshot) {
        var messageTheme = Theme.of(context).textTheme.headline6;
        dynamic widget = const Text('');
        if (snapshot.connectionState == ConnectionState.waiting) {
          widget = Text('Loading...', style: messageTheme);
        } else if (snapshot.hasData) {
          var bsplAll =
              snapshot.data?.data?['accounts']?['balanceSheetProfitLoss'];
          List<dynamic> dataList = bsplAll?['balanceSheetProfitLoss'] ?? [];
          double profitOrLoss = bsplAll?['profitOrLoss'] ?? 0;
          if (profitOrLoss >= 0) {
            dataList.add({
              'data': {
                'id': 0,
                'accName': 'Profit for the year',
                'accType': 'L',
                'amount': -profitOrLoss
              },
              'children': null
            });
            dataList.add({
              'data': {
                'id': 0,
                'accName': 'Profit for the year',
                'accType': 'E',
                'amount': profitOrLoss
              },
              'children': null
            });
          } else {
            dataList.add({
              'data': {
                'id': 0,
                'accName': 'Loss for the year',
                'accType': 'A',
                'amount': profitOrLoss.abs()
              },
              'children': null
            });
            dataList.add({
              'data': {
                'id': 0,
                'accName': 'Loss for the year',
                'accType': 'I',
                'amount': profitOrLoss
              },
              'children': null
            });
          }
          List<dynamic> aggregates = bsplAll?['aggregates'] ?? [];

          if (dataList.isEmpty) {
            widget = Text('No data', style: messageTheme);
          } else {
            widget = Selector<AccountsBsplState, AccTypes>(
              selector: (p0, p1) => p1.currentAccType,
              builder: (context, value, child) {
                setAggregateStateForProfitLoss(
                    context: context,
                    aggregates: aggregates,
                    profitOrLoss: profitOrLoss);
                var dataListOnAccType = dataList
                    .where((element) =>
                        BsplData.fromJson(j: element['data']).accType ==
                        value.name)
                    .toList();
                return ListView(
                  children: getChildListOfWidgets(context, dataListOnAccType),
                );
              },
            );
          }
        } else {
          widget = Text('No data', style: messageTheme);
        }
        return Center(
          child: widget,
        );
      },
    );
  }

  getChildListOfWidgets(BuildContext context, List<dynamic> childList) {
    List<Widget> childListOfWidgets = [];
    NumberFormat formatter = NumberFormat('###,###.00');
    var theme = Theme.of(context).textTheme;
    for (dynamic child in childList) {
      bool hasChildren = child['children'] != null;
      BsplData data = BsplData.fromJson(j: child['data']);
      Widget childWidget = CustomExpansionTile(
        onTap: () {
          hasChildren
              ? null
              : Navigator.pushNamed(context, Routes.generalLedger,
                  arguments: {'accId': data.accId, 'accName': data.accName});
        },
        maintainState: true,
        collapsedIconColor: Colors.amber.shade700,
        backgroundColor: Colors.amber.shade100,
        childrenPadding: const EdgeInsets.only(left: 15),
        title:
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Expanded(
            child: Text(
              data.accName,
              style: theme.subtitle1?.copyWith(
                  fontWeight: FontWeight.bold,
                  color:
                      child['children'] == null ? Colors.blue : Colors.black),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(formatter
              .format(('LI'.contains(data.accType) && data.amount !=0) ? -data.amount : data.amount))
        ]),
        children: (child['children'] == null)
            ? [const SizedBox.shrink()]
            : getChildListOfWidgets(context, child['children']),
        hasChildren: (child['children'] == null) ? false : true,
      );
      childListOfWidgets.add(childWidget);
    }
    return childListOfWidgets;
  }

  setAggregateStateForProfitLoss(
      {required BuildContext context,
      required List<dynamic> aggregates,
      required double profitOrLoss}) {
    var bsplState = context.read<AccountsBsplState>();
    double aggregate = 0;
    if (bsplState.currentAccType == AccTypes.L) {
      double aggr = -aggregates
          .firstWhere((element) => element['accType'] == 'L')['amount'];
      aggregate = (profitOrLoss >= 0) ? aggr + profitOrLoss : aggr;
    } else if (bsplState.currentAccType == AccTypes.A) {
      double aggr = aggregates
          .firstWhere((element) => element['accType'] == 'A')['amount'];
      aggregate = (profitOrLoss >= 0) ? aggr : aggr - profitOrLoss;
    } else if (bsplState.currentAccType == AccTypes.E) {
      double aggr = aggregates
          .firstWhere((element) => element['accType'] == 'E')['amount'];
      aggregate = (profitOrLoss >= 0) ? aggr + profitOrLoss : aggr;
    } else if (bsplState.currentAccType == AccTypes.I) {
      double aggr = -aggregates
          .firstWhere((element) => element['accType'] == 'I')['amount'];
      aggregate = (profitOrLoss >= 0) ? aggr : aggr - profitOrLoss;
    }
    Future.delayed(Duration.zero, (() {
      bsplState.aggregate = aggregate;
    }));
  }
}
