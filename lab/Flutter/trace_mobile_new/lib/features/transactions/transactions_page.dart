import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/transactions/classes/transactions_state.dart';
import 'package:trace_mobile/features/transactions/widgets/transactions_appbar_title.dart';
import 'package:trace_mobile/features/transactions/widgets/transactions_body.dart';
import 'package:trace_mobile/features/transactions/widgets/transactions_header.dart';
import 'package:trace_mobile/features/transactions/widgets/transactions_summary.dart';

class TransactionsPage extends StatelessWidget {
  const TransactionsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    context.read<TransactionsState>().init();
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const TransactionsAppBarTitle(),
      ),
      body: Column(children: const [
        TransactionsHeader(),
        SizedBox(
          height: 5,
        ),
        TransactionsBody(),
        SizedBox(height: 5),
        TransactionsSummary()
      ]),
    );
  }
}
