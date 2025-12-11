import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/transactions/classes/transactions_state.dart';

class TransactionsHeader extends StatelessWidget{
  const TransactionsHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<TransactionsState>(
      builder: (context, value, child) {
        return Container(
          color: Colors.grey.shade200,
          width: double.maxFinite,
          alignment: Alignment.center,
          child: Text(
            'Transactions last ${value.queryKey} rows',
            style: Theme.of(context)
                .textTheme
                .subtitle1
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
        );
      },
    );
  }
}