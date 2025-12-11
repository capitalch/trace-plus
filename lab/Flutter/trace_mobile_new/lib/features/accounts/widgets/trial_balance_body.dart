import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_trial_balance_data_model.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_trial_balance_state.dart';
import 'package:trace_mobile/features/accounts/widgets/custom_expansion_tile.dart';

class TrialBalanceBody extends StatelessWidget {
  const TrialBalanceBody({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var globalSettings = context.read<GlobalSettings>();
    var trialBalanceFuture =
        GraphQLQueries.trialBalance(globalSettings: globalSettings);
    return FutureBuilder(
      future: trialBalanceFuture,
      builder: (context, snapshot) {
        var messageTheme = Theme.of(context).textTheme.headline6;
        dynamic widget = const Text('');
        if (snapshot.connectionState == ConnectionState.waiting) {
          widget = Text('Loading...', style: messageTheme);
        } else if (snapshot.hasData) {
          List<dynamic> dataList = snapshot.data?.data?['accounts']
                  ?['trialBalance']?['trialBal'] ??
              [];
          if (dataList.isEmpty) {
            widget = Text('No data', style: messageTheme);
          } else {
            widget = ListView(
              children: getChildListOfWidgets(context, dataList),
            );

            double opening = 0, debits = 0, credits = 0, closing = 0;
            for (var item in dataList) {
              var data = item['data'];
              var openingRow = (data['opening_dc'] == 'D')
                  ? data['opening']
                  : -data['opening'];
              var closingRow = (data['closing_dc'] == 'D')
                  ? data['closing']
                  : -data['closing'];
              opening = opening + openingRow;
              closing = closing + closingRow;
              debits = debits + data['debit'];
              credits = credits + data['credit'];
            }
            String openingDC = (opening >= 0) ? 'Dr' : 'Cr';
            String closingDC = (closing >= 0) ? 'Dr' : 'Cr';
            opening = opening.abs();
            closing = closing.abs();
            var trialBalanceState = context.read<AccountsTrialBalanceState>();
            trialBalanceState.summary = Summary(
                opening: opening,
                closing: closing,
                debits: debits,
                credits: credits,
                openingDC: openingDC,
                closingDC: closingDC);

            Future.delayed(Duration.zero, () {
              trialBalanceState.notify();
            });
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
    var theme = Theme.of(context).textTheme;
    for (dynamic child in childList) {
      bool hasChildren = child['children'] != null;
      TrialBalanceData data = TrialBalanceData.fromJson(j: child['data']);
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
        childrenPadding: const EdgeInsets.only(left: 5),
        title: Container(
            alignment: Alignment.centerLeft,
            width: double.maxFinite,
            padding: const EdgeInsets.only(top: 15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                    child: TextOrButtonWidget(
                  hasChildren: hasChildren,
                  accId: data.accId,
                  label: data.accName,
                )),
                Row(
                  children: [
                    Text(
                      data.accType,
                      style: theme.subtitle1
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                      width: 5,
                    ),
                    FormattedNumber(amount: data.closing, drcr: data.closingDC)
                  ],
                )
              ],
            )),
        subtitle: SingleChildScrollView(
            padding: const EdgeInsets.only(top: 10, bottom: 10),
            scrollDirection: Axis.horizontal,
            child: Container(
                padding: const EdgeInsets.symmetric(vertical: 5),
                width: double.maxFinite,
                alignment: Alignment.centerLeft,
                child: Row(
                  children: [
                    FormattedNumber(amount: data.opening, drcr: data.openingDC),
                    const SizedBox(width: 5),
                    FormattedNumber(amount: data.debit, drcr: null),
                    const SizedBox(width: 5),
                    FormattedNumber(amount: data.credit, drcr: null),
                    const SizedBox(width: 5),
                    FormattedNumber(amount: data.closing, drcr: data.closingDC),
                  ],
                ))),
        children: (child['children'] == null)
            ? [const SizedBox.shrink()]
            : getChildListOfWidgets(context, child['children']),
        hasChildren: (child['children'] == null) ? false : true,
      );
      childListOfWidgets.add(childWidget);
    }
    return childListOfWidgets;
  }
}

class FormattedNumber extends StatelessWidget {
  const FormattedNumber({Key? key, required this.amount, required this.drcr})
      : super(key: key);
  final String? drcr;
  final double amount;

  @override
  Widget build(BuildContext context) {
    NumberFormat formatter = NumberFormat('###,###.00');
    var theme = Theme.of(context).textTheme;
    var formattedAmountWidget = Text(formatter.format(amount),
        style: theme.bodyText1); //?.copyWith(fontWeight: FontWeight.bold));
    var drcrWidget = const Text('');
    if (drcr != null) {
      drcrWidget = (drcr == 'D')
          ? Text(
              'Dr',
              style: theme.labelMedium?.copyWith(color: Colors.blue),
            )
          : Text(
              'Cr',
              style: theme.labelMedium?.copyWith(color: Colors.red),
            );
    }
    return SizedBox(
        // padding: const EdgeInsets.only(top: 5),
        width: 120,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            formattedAmountWidget,
            const SizedBox(width: 2),
            drcrWidget
          ],
        ));
  }
}

class TextOrButtonWidget extends StatelessWidget {
  const TextOrButtonWidget(
      {Key? key,
      required this.hasChildren,
      required this.accId,
      required this.label})
      : super(key: key);
  final bool hasChildren;
  final int accId;
  final String label;

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context).textTheme;
    if (hasChildren) {
      return Text(
        label,
        style: theme.subtitle1,
      );
    } else {
      return Text(
        label,
        style: theme.subtitle1?.copyWith(color: Colors.blue),
      );
    }
  }
}