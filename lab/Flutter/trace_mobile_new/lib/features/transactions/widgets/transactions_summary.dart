import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/transactions/classes/transactions_state.dart';

class TransactionsSummary extends StatelessWidget {
  const TransactionsSummary({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var formatter = NumberFormat('#,##,000');
    var theme = Theme.of(context)
        .textTheme
        .subtitle2
        ?.copyWith(fontWeight: FontWeight.bold);
    TransactionsState transactionsState = context.read<TransactionsState>();
    return Selector<TransactionsState, int>(
      selector: (p0, p1) => p1.rowCount,
      builder: (context, value, child) {
        return Container(
            width: double.maxFinite,
            color: Colors.grey.shade300,
            padding: const EdgeInsets.only(left: 15, top: 2, bottom: 2),
            child: Row(
              children: [
                Text(
                  'Rows: ${formatter.format(value)}',
                  style: theme,
                ),
                const SizedBox(
                  width: 5,
                ),
                Text('Debits: ${formatter.format(transactionsState.debits)}', style: theme,),
                const SizedBox(
                  width: 5,
                ),
                Text('Debits: ${formatter.format(transactionsState.credits)}', style: theme,),
              ],
            ));
      },
    );
  }
}