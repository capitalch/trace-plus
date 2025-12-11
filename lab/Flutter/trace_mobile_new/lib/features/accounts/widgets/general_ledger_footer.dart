
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_general_ledger_state.dart';

class GeneralLedgerFooter extends StatelessWidget {
  const GeneralLedgerFooter({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AccountsGeneralLedgerState>(
      builder: (context, value, child) {
        var theme = Theme.of(context).textTheme;
        var closingBalance = '';
        if (value.closingBalance >= 0) {
          closingBalance =
              '${Utils.toFormattedNumber(value.closingBalance)} Dr';
        } else {
          closingBalance =
              '${Utils.toFormattedNumber(value.closingBalance.abs())} Cr';
        }
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Container(
              width: double.maxFinite,
              color: Colors.grey.shade300,
              padding:
                  const EdgeInsets.only(left: 15, right: 15, top: 5, bottom: 5),
              child: Row(children: [
                Text(
                  'Rows: ${value.rowCount}',
                  style: theme.bodyText1,
                ),
                const SizedBox(
                  width: 10,
                ),
                Text(
                  'Op: ${Utils.toFormattedNumber(value.openingBalance)} ${(value.openingBalanceDC == "D") ? "Dr" : "Cr"}',
                  style: theme.bodyText1?.copyWith(
                      color: (value.openingBalanceDC == "D")
                          ? Colors.lightBlue
                          : Colors.red),
                ),
                const SizedBox(
                  width: 10,
                ),
                Text(
                  'Debits: ${Utils.toFormattedNumber(value.debits)}',
                  style: theme.bodyText1,
                ),
                const SizedBox(
                  width: 10,
                ),
                Text(
                  'Credits: ${Utils.toFormattedNumber(value.credits)}',
                  style: theme.bodyText1,
                ),
                const SizedBox(
                  width: 10,
                ),
                Text(
                  'Clos: $closingBalance',
                  style: theme.bodyText1?.copyWith(
                      color: (value.closingBalance >= 0)
                          ? Colors.lightBlue
                          : Colors.red),
                ),
              ])),
        );
      },
    );
  }
}