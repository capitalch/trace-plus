import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_general_ledger_data_model.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_general_ledger_state.dart';

class GeneralLedgerBody extends StatelessWidget {
  const GeneralLedgerBody({Key? key, required this.accId}) : super(key: key);
  final int accId;
  @override
  Widget build(BuildContext context) {
    var globalSettings = context.read<GlobalSettings>();
    var generalLedgerFuture = GraphQLQueries.genericView(
        globalSettings: globalSettings,
        sqlKey: 'get_accountsLedger',
        args: {'id': accId},
        entityName: 'accounts',
        isMultipleRows: false);
    return FutureBuilder(
      future: generalLedgerFuture,
      builder: (context, snapshot) {
        var messageTheme = Theme.of(context).textTheme.headline6;
        dynamic widget = const Text('');
        if (snapshot.connectionState == ConnectionState.waiting) {
          widget = Text('Loading...', style: messageTheme);
        } else if (snapshot.hasData) {
          dynamic jsonResult = snapshot.data?.data?['accounts']?['genericView']
                  ?['jsonResult'] ??
              [];
          if (jsonResult == null) {
            widget = Text('No data', style: messageTheme);
          } else {
            GeneralLedgerModel generalLedger =
                GeneralLedgerModel.fromJson(j: jsonResult);
            widget = GeneralLedgerBodyItems(generalLedger: generalLedger);
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
}

class GeneralLedgerBodyItems extends StatelessWidget {
  const GeneralLedgerBodyItems({Key? key, required this.generalLedger})
      : super(key: key);
  final GeneralLedgerModel generalLedger;
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context).textTheme;
    var generalLedgerState = context.read<AccountsGeneralLedgerState>();
    double opBalance = generalLedger.opBalance;
    String opBalanceDC = generalLedger.opBalanceDC;
    double debits = generalLedger.sum.debits;
    double credits = generalLedger.sum.credits;
    double closBalance = debits - credits;
    generalLedgerState.openingBalance = opBalance;
    generalLedgerState.openingBalanceDC = opBalanceDC;
    generalLedgerState.debits = debits;
    generalLedgerState.credits = credits;
    generalLedgerState.closingBalance = closBalance;
    generalLedgerState.rowCount = generalLedger.transactions.length.toInt();
    int index = 0;
    List<TransactionModel> transactions = generalLedger.transactions;
    Future.delayed(Duration.zero, (() => generalLedgerState.notify()));

    return ListView(
      children: [
        ListTile(
            title: Text(
              'Opening balance',
              style: theme.bodyText1,
            ),
            trailing: (opBalanceDC == 'D')
                ? Text(
                    '${Utils.toFormattedNumber(opBalance)} Dr',
                    style: theme.bodyText1?.copyWith(color: Colors.lightBlue),
                  )
                : Text(
                    '${Utils.toFormattedNumber(opBalance)} Cr',
                    style: theme.bodyText1?.copyWith(color: Colors.red),
                  )),
        ...transactions.map((
          e,
        ) =>
            GeneralLedgerBodyItem(transaction: e, index: ++index)),
        ListTile(
            title: Text(
              'Closing balance',
              style: theme.bodyText1,
            ),
            trailing: (closBalance >= 0)
                ? Text(
                    '${Utils.toFormattedNumber(closBalance)} Dr',
                    style: theme.bodyText1?.copyWith(color: Colors.lightBlue),
                  )
                : Text(
                    '${Utils.toFormattedNumber(closBalance.abs())} Cr',
                    style: theme.bodyText1?.copyWith(color: Colors.red),
                  ))
      ],
    );
  }
}

class GeneralLedgerBodyItem extends StatelessWidget {
  const GeneralLedgerBodyItem(
      {Key? key, required this.transaction, required this.index})
      : super(key: key);
  final TransactionModel transaction;
  final int index;
  @override
  Widget build(BuildContext context) {
    var tranDate =
        Utils.toLocalDateString(DateTime.parse(transaction.tranDate));
    var theme = Theme.of(context).textTheme;
    return Center(
      child: Card(
          color: Colors.grey.shade100,
          elevation: 1,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
            child: Column(children: [
              Row(
                children: [
                  Text(tranDate),
                  const SizedBox(
                    width: 10,
                  ),
                  Text(transaction.autoRefNo),
                  const Spacer(),
                  (transaction.debit == 0)
                      ? Text(
                          '${Utils.toFormattedNumber(transaction.credit)} Cr',
                          style: theme.bodyText1?.copyWith(color: Colors.red))
                      : Text(
                          '${Utils.toFormattedNumber(transaction.debit)} Dr',
                          style: theme.bodyText1
                              ?.copyWith(color: Colors.lightBlue),
                        )
                ],
              ),
              ListTile(
                leading: Text(index.toString()),
                dense: true,
                title: Text(transaction.otherAccounts),
                subtitle: Text(
                    '${transaction.tranType} ${transaction.remarks.trim()} ${transaction.lineRemarks.trim()} ${transaction.userRefNo.trim()} ${transaction.lineRefNo.trim()} ${transaction.instrNo.trim()}'),
              ),
            ]),
          )),
      // ),
    );
  }
}